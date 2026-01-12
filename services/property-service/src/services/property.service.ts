import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, DataSource } from 'typeorm';
import { Property, PropertyStatus, PropertyType } from '../entities/property.entity';
import { PropertyTranslation } from '../entities/property-translation.entity';
import { PropertyFlag, FlagStatus } from '../entities/property-flag.entity';
import { PropertyDetails } from '../entities/property-details.entity';
import { CreatePropertyDto } from '../dto/create-property.dto';
import { UpdatePropertyDto } from '../dto/update-property.dto';
import { GeolocationClientService } from './geolocation-client.service';
import { SearchIndexService } from './search-index.service';
import { PropertyValidationService } from './property-validation.service';
import { CustomFieldService } from './custom-field.service';
import { SearchPropertyDto } from '../dto/search-property.dto';
import { In, Or } from 'typeorm';

@Injectable()
export class PropertyService {
  private readonly logger = new Logger(PropertyService.name);

  constructor(
    @InjectRepository(Property)
    private propertyRepo: Repository<Property>,
    @InjectRepository(PropertyTranslation)
    private translationRepo: Repository<PropertyTranslation>,
    @InjectRepository(PropertyFlag)
    private flagRepo: Repository<PropertyFlag>,
    @InjectRepository(PropertyDetails)
    private detailsRepo: Repository<PropertyDetails>,
    private readonly geolocationClient: GeolocationClientService,
    private readonly searchIndexService: SearchIndexService,
    private readonly validationService: PropertyValidationService,
    private readonly customFieldService: CustomFieldService,
    private readonly dataSource: DataSource,
  ) {}

  /**
   * Generate internal code for a property (format: PROP-YYYY-NNNNNN)
   * This method finds the highest sequence number for the current year and increments it
   */
  private async generateInternalCode(): Promise<string> {
    const currentYear = new Date().getFullYear();
    const prefix = `PROP-${currentYear}-`;

    // Find the highest internal code for the current year
    const lastProperty = await this.propertyRepo
      .createQueryBuilder('property')
      .where('property.internalCode LIKE :prefix', { prefix: `${prefix}%` })
      .orderBy('property.internalCode', 'DESC')
      .getOne();

    let sequenceNumber = 1;

    if (lastProperty && lastProperty.internalCode) {
      // Extract sequence number from last code (e.g., "PROP-2024-000001" -> 1)
      const lastSequence = parseInt(
        lastProperty.internalCode.replace(prefix, ''),
        10,
      );
      if (!isNaN(lastSequence)) {
        sequenceNumber = lastSequence + 1;
      }
    }

    // Format sequence number with leading zeros (6 digits)
    const formattedSequence = sequenceNumber.toString().padStart(6, '0');
    return `${prefix}${formattedSequence}`;
  }

  async create(createDto: CreatePropertyDto, userId: string): Promise<Property> {
    // userId is now guaranteed to come from authenticated JWT token
    // Ensure DTO uses the authenticated userId
    if (createDto.userId && createDto.userId !== userId) {
      throw new ForbiddenException('Cannot create property for another user');
    }

    // Validate price and currency
    this.validationService.validatePrice(
      createDto.price,
      createDto.currency || 'EUR',
    );

    // Validate coordinates if provided
    if (createDto.latitude !== undefined || createDto.longitude !== undefined) {
      this.validationService.validateCoordinates(
        createDto.latitude,
        createDto.longitude,
      );
    }

    // Validate media URLs
    if (createDto.mediaUrls) {
      this.validationService.validateMediaUrls(createDto.mediaUrls);
    }

    // Auto-geocode if lat/lon missing but address provided
    let latitude = createDto.latitude;
    let longitude = createDto.longitude;

    if (
      (!latitude || !longitude) &&
      (createDto.street || createDto.city || createDto.postalCode || createDto.country)
    ) {
      try {
        this.logger.log(`Auto-geocoding address for property creation`);
        const geocodeResult = await this.geolocationClient.geocode(
          {
            street: createDto.street,
            postalCode: createDto.postalCode,
            city: createDto.city,
            region: createDto.region,
            country: createDto.country,
          },
          createDto.country,
        );

        if (geocodeResult) {
          latitude = geocodeResult.latitude;
          longitude = geocodeResult.longitude;
          this.logger.log(
            `Geocoded address: lat=${latitude}, lon=${longitude}`,
          );

          // Optionally update address fields with normalized values from geocoding
          // if they're more complete than what was provided
          if (geocodeResult.street && !createDto.street) {
            createDto.street = geocodeResult.street;
          }
          if (geocodeResult.postalCode && !createDto.postalCode) {
            createDto.postalCode = geocodeResult.postalCode;
          }
          if (geocodeResult.city && !createDto.city) {
            createDto.city = geocodeResult.city;
          }
          if (geocodeResult.country && !createDto.country) {
            createDto.country = geocodeResult.country;
          }
        } else {
          this.logger.warn('Geocoding failed, property will be created without coordinates');
        }
      } catch (error: any) {
        this.logger.error(`Geocoding error during property creation: ${error.message}`);
        // Continue without geocoding - don't block property creation
      }
    }

    // Use transaction to ensure atomicity
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Generate internal code automatically
      const internalCode = await this.generateInternalCode();

      // Create property
      const property = this.propertyRepo.create({
        userId: userId, // Use authenticated userId
        internalCode: internalCode, // Generated automatically by service
        externalCode: createDto.externalCode || null, // Optional external code
        typeCode: createDto.type, // Map enum to code string
        price: createDto.price,
        currency: createDto.currency || 'EUR',
        street: createDto.street,
        postalCode: createDto.postalCode,
        city: createDto.city,
        region: createDto.region,
        country: createDto.country,
        latitude: latitude || null,
        longitude: longitude || null,
        mediaUrls: createDto.mediaUrls || [],
        statusCode: createDto.status || PropertyStatus.DRAFT, // Map enum to code string
      });

      const savedProperty = await queryRunner.manager.save(Property, property);

      // Create translations
      const translations = createDto.translations.map((transDto) =>
        this.translationRepo.create({
          propertyId: savedProperty.id,
          language: transDto.language,
          title: transDto.title,
          description: transDto.description || null,
          notes: transDto.notes || null,
          metaTitle: transDto.metaTitle || null,
          metaDescription: transDto.metaDescription || null,
        }),
      );

      await queryRunner.manager.save(PropertyTranslation, translations);

      // Create property details if provided
      if (createDto.details) {
        const details = this.detailsRepo.create({
          propertyId: savedProperty.id,
          ...this.mapDetailsDtoToEntity(createDto.details, createDto.type as PropertyType),
        });
        await queryRunner.manager.save(PropertyDetails, details);
      }

      // Commit transaction
      await queryRunner.commitTransaction();

      // Save custom fields (outside transaction, async)
      if (createDto.customFields && createDto.customFields.length > 0) {
        await Promise.all(
          createDto.customFields.map((cfDto) =>
            this.customFieldService
              .setValue('property', savedProperty.id, cfDto, userId)
              .catch((error) => {
                this.logger.warn(
                  `Failed to save custom field ${cfDto.fieldDefinitionId}: ${error.message}`,
                );
              }),
          ),
        );
      }

      // Reload with relations
      return this.findOne(savedProperty.id, userId);
    } catch (error) {
      // Rollback on error
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to create property: ${error.message}`, error.stack);
      throw error;
    } finally {
      // Release query runner
      await queryRunner.release();
    }
  }

  async findAll(
    userId?: string,
    status?: PropertyStatus,
    limit = 20,
    offset = 0,
    includeDeleted = false,
  ): Promise<{ properties: Property[]; total: number }> {
    // Validate pagination parameters
    if (limit < 1 || limit > 100) {
      throw new BadRequestException('Limit must be between 1 and 100');
    }
    if (offset < 0) {
      throw new BadRequestException('Offset must be non-negative');
    }

    const queryBuilder = this.propertyRepo
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.translations', 'translation')
      .leftJoinAndSelect('property.neighborhood', 'neighborhood')
      .leftJoinAndSelect('property.details', 'details');

    // Exclude soft-deleted properties by default
    if (!includeDeleted) {
      queryBuilder.andWhere('property.deletedAt IS NULL');
    }

    if (userId) {
      queryBuilder.andWhere('property.userId = :userId', { userId });
    }

    if (status) {
      queryBuilder.andWhere('property.statusCode = :status', { status });
    }

    const [properties, total] = await queryBuilder
      .orderBy('property.createdAt', 'DESC')
      .take(limit)
      .skip(offset)
      .getManyAndCount();

    return { properties, total };
  }

  /**
   * Find a property by internal code or external code
   * @param code - Internal code (PROP-YYYY-NNNNNN) or external code
   * @param userId - Optional user ID for access control
   * @param includeTranslations - Whether to load translations (default: true)
   */
  async findByCode(
    code: string,
    userId?: string,
    includeTranslations: boolean = true,
    includeDeleted = false,
  ): Promise<Property> {
    const relations = includeTranslations
      ? ['translations', 'neighborhood', 'details']
      : ['neighborhood', 'details'];

    // Build query with OR condition for internalCode or externalCode
    const queryBuilder = this.propertyRepo
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.translations', 'translation')
      .leftJoinAndSelect('property.neighborhood', 'neighborhood')
      .leftJoinAndSelect('property.details', 'details')
      .where('(property.internalCode = :code OR property.externalCode = :code)', { code });

    if (!includeDeleted) {
      queryBuilder.andWhere('property.deletedAt IS NULL');
    }

    const property = await queryBuilder.getOne();

    if (!property) {
      throw new NotFoundException(`Property with code ${code} not found`);
    }

    // Apply same access control as findOne
    if (userId) {
      if (property.userId === userId) {
        return property;
      }
      if (property.status !== PropertyStatus.LISTED) {
        throw new ForbiddenException('You do not have access to this property');
      }
      return property;
    }

    if (property.status !== PropertyStatus.LISTED) {
      throw new ForbiddenException('This property is not publicly available');
    }

    return property;
  }

  /**
   * Find a property by ID with optimized query
   * @param id - Property ID
   * @param userId - Optional user ID for access control
   * @param includeTranslations - Whether to load translations (default: true)
   */
  async findOne(
    id: string,
    userId?: string,
    includeTranslations: boolean = true,
    includeDeleted = false,
  ): Promise<Property> {
    const relations = includeTranslations
      ? ['translations', 'neighborhood', 'details']
      : ['neighborhood', 'details'];

    const where: any = { id };
    if (!includeDeleted) {
      where.deletedAt = null;
    }

    const property = await this.propertyRepo.findOne({
      where,
      relations,
    });

    if (!property) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }

    // If userId provided, verify ownership OR allow access if property is LISTED (public)
    if (userId) {
      // Owner can always access their property
      if (property.userId === userId) {
        return property;
      }
      // If not owner and property is not listed, deny access
      if (property.statusCode !== PropertyStatus.LISTED) {
        throw new ForbiddenException('You do not have access to this property');
      }
      // If property is listed, allow public access even if not owner
      return property;
    }

    // No userId provided (public access) - only allow if property is LISTED
    if (property.statusCode !== PropertyStatus.LISTED) {
      throw new ForbiddenException('This property is not publicly available');
    }

    return property;
  }

  async update(
    id: string,
    updateDto: UpdatePropertyDto,
    userId: string,
  ): Promise<Property> {
    const property = await this.findOne(id, userId);

    // Validate updates
    if (updateDto.price !== undefined) {
      this.validationService.validatePrice(
        updateDto.price,
        updateDto.currency || property.currency,
      );
    }

    if (updateDto.latitude !== undefined || updateDto.longitude !== undefined) {
      this.validationService.validateCoordinates(
        updateDto.latitude,
        updateDto.longitude,
      );
    }

    if (updateDto.mediaUrls !== undefined) {
      this.validationService.validateMediaUrls(updateDto.mediaUrls);
    }

    // Track if address changed
    const addressChanged =
      updateDto.street !== undefined ||
      updateDto.postalCode !== undefined ||
      updateDto.city !== undefined ||
      updateDto.region !== undefined ||
      updateDto.country !== undefined;

    // Update property fields
    // Note: internalCode cannot be updated - it's generated automatically by the service
    if (updateDto.externalCode !== undefined) property.externalCode = updateDto.externalCode || null;
    if (updateDto.type) property.typeCode = updateDto.type; // Map enum to code string
    if (updateDto.price !== undefined) property.price = updateDto.price;
    if (updateDto.currency) property.currency = updateDto.currency;
    if (updateDto.street !== undefined) property.street = updateDto.street;
    if (updateDto.postalCode !== undefined) property.postalCode = updateDto.postalCode;
    if (updateDto.city !== undefined) property.city = updateDto.city;
    if (updateDto.region !== undefined) property.region = updateDto.region;
    if (updateDto.country !== undefined) property.country = updateDto.country;
    if (updateDto.mediaUrls !== undefined) property.mediaUrls = updateDto.mediaUrls;
    if (updateDto.status) property.statusCode = updateDto.status; // Map enum to code string

    // Auto-geocode if address changed and lat/lon not explicitly provided
    if (
      addressChanged &&
      updateDto.latitude === undefined &&
      updateDto.longitude === undefined &&
      (property.street || property.city || property.postalCode || property.country)
    ) {
      try {
        this.logger.log(`Auto-geocoding address for property update (ID: ${id})`);
        const geocodeResult = await this.geolocationClient.geocode(
          {
            street: property.street || undefined,
            postalCode: property.postalCode || undefined,
            city: property.city || undefined,
            region: property.region || undefined,
            country: property.country || undefined,
          },
          property.country || undefined,
        );

        if (geocodeResult) {
          property.latitude = geocodeResult.latitude;
          property.longitude = geocodeResult.longitude;
          this.logger.log(
            `Geocoded address: lat=${property.latitude}, lon=${property.longitude}`,
          );

          // Update address fields with normalized values if more complete
          if (geocodeResult.street && !property.street) {
            property.street = geocodeResult.street;
          }
          if (geocodeResult.postalCode && !property.postalCode) {
            property.postalCode = geocodeResult.postalCode;
          }
          if (geocodeResult.city && !property.city) {
            property.city = geocodeResult.city;
          }
          if (geocodeResult.country && !property.country) {
            property.country = geocodeResult.country;
          }
        } else {
          this.logger.warn('Geocoding failed during property update');
        }
      } catch (error: any) {
        this.logger.error(`Geocoding error during property update: ${error.message}`);
        // Continue without geocoding
      }
    } else {
      // Explicit lat/lon provided, use them
      if (updateDto.latitude !== undefined) property.latitude = updateDto.latitude;
      if (updateDto.longitude !== undefined) property.longitude = updateDto.longitude;
    }

    // Use transaction for atomicity
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.save(Property, property);

      // Update translations if provided
      if (updateDto.translations) {
        // Delete existing translations and create new ones
        await queryRunner.manager.delete(PropertyTranslation, { propertyId: id });

        const translations = updateDto.translations.map((transDto) =>
          this.translationRepo.create({
            propertyId: id,
            language: transDto.language,
            title: transDto.title,
            description: transDto.description || null,
            notes: transDto.notes || null,
            metaTitle: transDto.metaTitle || null,
            metaDescription: transDto.metaDescription || null,
          }),
        );

        await queryRunner.manager.save(PropertyTranslation, translations);
      }

      // Update property details if provided
      if (updateDto.details) {
        const existingDetails = await queryRunner.manager.findOne(PropertyDetails, {
          where: { propertyId: id },
        });

        if (existingDetails) {
          // Update existing details
          Object.assign(existingDetails, this.mapDetailsDtoToEntity(updateDto.details, property.typeCode as PropertyType));
          await queryRunner.manager.save(PropertyDetails, existingDetails);
        } else {
          // Create new details
          const details = this.detailsRepo.create({
            propertyId: id,
            ...this.mapDetailsDtoToEntity(updateDto.details, property.typeCode as PropertyType),
          });
          await queryRunner.manager.save(PropertyDetails, details);
        }
      }

      await queryRunner.commitTransaction();
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to update property ${id}: ${error.message}`, error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }

    // Update custom fields if provided (outside transaction, async)
    if (updateDto.customFields && updateDto.customFields.length > 0) {
      await Promise.all(
        updateDto.customFields.map((cfDto) =>
          this.customFieldService
            .setValue('property', id, cfDto, userId)
            .catch((error) => {
              this.logger.warn(
                `Failed to update custom field ${cfDto.fieldDefinitionId}: ${error.message}`,
              );
            }),
        ),
      );
    }

    // Reload property with translations for indexing
    const updatedProperty = await this.findOne(id, userId, true);

    // Re-index if property is LISTED (searchable)
    if (updatedProperty.statusCode === PropertyStatus.LISTED) {
      await this.searchIndexService.indexProperty(
        updatedProperty,
        updatedProperty.translations,
      ).catch((error) => {
        this.logger.warn(`Failed to re-index property ${id} after update: ${error.message}`);
      });
    }

    return updatedProperty;
  }

  /**
   * Soft delete a property (mark as deleted instead of removing)
   */
  async delete(id: string, userId: string): Promise<void> {
    const property = await this.findOne(id, userId);

    // Use transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Soft delete: set deletedAt timestamp
      property.deletedAt = new Date();
      await queryRunner.manager.save(Property, property);

      // Remove from search index
      await this.searchIndexService.deleteProperty(id).catch((error) => {
        this.logger.warn(
          `Failed to delete property ${id} from search index: ${error.message}`,
        );
      });

      await queryRunner.commitTransaction();
      this.logger.log(`Property ${id} soft deleted by user ${userId}`);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to delete property ${id}: ${error.message}`, error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Hard delete a property (permanent removal - admin only)
   */
  async hardDelete(id: string): Promise<void> {
    // Use query builder to include soft-deleted
    const property = await this.propertyRepo
      .createQueryBuilder('property')
      .where('property.id = :id', { id })
      .getOne();

    if (!property) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }

    // Use transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Delete from search index
      await this.searchIndexService.deleteProperty(id).catch((error) => {
        this.logger.warn(
          `Failed to delete property ${id} from search index: ${error.message}`,
        );
      });

      // Delete translations first (foreign key constraint)
      await queryRunner.manager.delete(PropertyTranslation, { propertyId: id });

      // Delete flags
      await queryRunner.manager.delete(PropertyFlag, { propertyId: id });

      // Finally delete property
      await queryRunner.manager.remove(Property, property);

      await queryRunner.commitTransaction();
      this.logger.log(`Property ${id} permanently deleted`);
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to hard delete property ${id}: ${error.message}`, error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Restore a soft-deleted property
   */
  async restore(id: string, userId: string): Promise<Property> {
    const property = await this.propertyRepo.findOne({
      where: { id },
      withDeleted: true,
    });

    if (!property) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }

    if (!property.deletedAt) {
      throw new BadRequestException('Property is not deleted');
    }

    // Verify ownership
    if (property.userId !== userId) {
      throw new ForbiddenException('You can only restore your own properties');
    }

    property.deletedAt = null;
    const restored = await this.propertyRepo.save(property);

    // Re-index if property was listed
    if (restored.status === PropertyStatus.LISTED) {
      const propertyWithTranslations = await this.findOne(id, userId, true, true);
      await this.searchIndexService
        .indexProperty(restored, propertyWithTranslations.translations)
        .catch((error) => {
          this.logger.warn(
            `Failed to re-index restored property ${id}: ${error.message}`,
          );
        });
    }

    this.logger.log(`Property ${id} restored by user ${userId}`);
    return restored;
  }

  async publish(id: string, userId: string): Promise<Property> {
    const property = await this.findOne(id, userId);

    // Comprehensive validation for publication
    const validation = this.validationService.validateForPublication(
      property,
      property.translations || [],
    );

    if (!validation.valid) {
      throw new BadRequestException(
        `Property cannot be published: ${validation.errors.join(', ')}`,
      );
    }

    // Ensure property has coordinates before publishing
    // If missing, try to geocode from address
    if ((!property.latitude || !property.longitude) && (property.street || property.city || property.postalCode || property.country)) {
      try {
        this.logger.log(`Auto-geocoding address before publishing property (ID: ${id})`);
        const geocodeResult = await this.geolocationClient.geocode(
          {
            street: property.street || undefined,
            postalCode: property.postalCode || undefined,
            city: property.city || undefined,
            region: property.region || undefined,
            country: property.country || undefined,
          },
          property.country || undefined,
        );

        if (geocodeResult) {
          property.latitude = geocodeResult.latitude;
          property.longitude = geocodeResult.longitude;
          this.logger.log(`Geocoded address for publication: lat=${property.latitude}, lon=${property.longitude}`);
        } else {
          this.logger.warn('Geocoding failed before publishing - property may lack coordinates');
        }
      } catch (error: any) {
        this.logger.error(`Geocoding error before publishing: ${error.message}`);
        // Continue with publication even if geocoding fails
      }
    }

    // Update status to LISTED and set publishedAt
    property.status = PropertyStatus.LISTED;
    property.publishedAt = new Date();

    await this.propertyRepo.save(property);

    // Index in Meilisearch via Search Service
    const propertyWithTranslations = await this.findOne(id, userId);
    await this.searchIndexService.indexProperty(
      propertyWithTranslations,
      propertyWithTranslations.translations,
    ).catch((error) => {
      // Log error but don't fail publication if indexing fails
      this.logger.warn(`Failed to index property ${id} after publication: ${error.message}`);
    });

    return propertyWithTranslations;
  }

  /**
   * Find properties within a radius (for geolocation nearby search)
   * Used by Geolocation Service for /search/nearby endpoint
   */
  async findNearby(
    latitude: number,
    longitude: number,
    radiusKm: number,
    limit = 20,
    offset = 0,
    status?: PropertyStatus,
  ): Promise<{ properties: Property[]; total: number }> {
    // Use PostGIS if available, otherwise use Haversine formula in SQL
    // For now, use a simple bounding box approximation + filter in memory
    // TODO: Optimize with PostGIS extension for better performance

    const queryBuilder = this.propertyRepo
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.translations', 'translation')
      .where('property.latitude IS NOT NULL')
      .andWhere('property.longitude IS NOT NULL')
      .andWhere('property.deletedAt IS NULL'); // Exclude soft-deleted

    if (status) {
      queryBuilder.andWhere('property.status = :status', { status });
    } else {
      // Default to listed properties
      queryBuilder.andWhere('property.status = :status', { status: PropertyStatus.LISTED });
    }

    // Rough bounding box filter (before applying exact distance)
    // Approximate: 1 degree latitude ≈ 111 km
    const latDelta = radiusKm / 111;
    const lonDelta = radiusKm / (111 * Math.cos((latitude * Math.PI) / 180));

    queryBuilder
      .andWhere('property.latitude BETWEEN :minLat AND :maxLat', {
        minLat: latitude - latDelta,
        maxLat: latitude + latDelta,
      })
      .andWhere('property.longitude BETWEEN :minLon AND :maxLon', {
        minLon: longitude - lonDelta,
        maxLon: longitude + lonDelta,
      });

    const [properties, total] = await queryBuilder
      .take(limit * 2) // Get more to filter by exact distance
      .skip(0)
      .getManyAndCount();

    // Filter by exact distance using Haversine formula
    // Optimize: Calculate distance only for properties in bounding box
    const filteredProperties = properties
      .map((prop) => {
        if (!prop.latitude || !prop.longitude) return null;
        const distance = this.calculateDistance(
          latitude,
          longitude,
          Number(prop.latitude),
          Number(prop.longitude),
        );
        return { property: prop, distance };
      })
      .filter((item): item is { property: Property; distance: number } => 
        item !== null && item.distance <= radiusKm
      )
      .sort((a, b) => a.distance - b.distance); // Sort by distance

    // Apply pagination after filtering
    const paginatedProperties = filteredProperties
      .slice(offset, offset + limit)
      .map((item) => item.property);

    return {
      properties: paginatedProperties,
      total: filteredProperties.length,
    };
  }

  /**
   * Calculate distance between two points using Haversine formula
   * Returns distance in kilometers
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth radius in kilometers
    const dLat = this.toRadians(lat2 - lat1);
    const dLon = this.toRadians(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(this.toRadians(lat1)) *
        Math.cos(this.toRadians(lat2)) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Convert degrees to radians
   */
  private toRadians(degrees: number): number {
    return degrees * (Math.PI / 180);
  }

  /**
   * Bulk update properties
   */
  async bulkUpdate(
    propertyIds: string[],
    updateData: any,
    userId: string,
  ): Promise<{ updated: number; failed: string[] }> {
    const failed: string[] = [];
    let updated = 0;

    // Verify all properties belong to the user
    const properties = await this.propertyRepo.find({
      where: { id: In(propertyIds) },
    });

    const validProperties = properties.filter((p) => p.userId === userId);

    if (validProperties.length === 0) {
      throw new BadRequestException('No valid properties found for bulk update');
    }

    // Use transaction for atomicity
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const property of validProperties) {
        try {
          // Apply updates
          if (updateData.price !== undefined) {
            this.validationService.validatePrice(
              updateData.price,
              updateData.currency || property.currency,
            );
            property.price = updateData.price;
          }
          if (updateData.currency) property.currency = updateData.currency;
          if (updateData.status) property.status = updateData.status;
          if (updateData.city) property.city = updateData.city;
          if (updateData.region) property.region = updateData.region;
          if (updateData.country) property.country = updateData.country;
          if (updateData.postalCode) property.postalCode = updateData.postalCode;
          if (updateData.mediaUrls) {
            this.validationService.validateMediaUrls(updateData.mediaUrls);
            property.mediaUrls = updateData.mediaUrls;
          }

          await queryRunner.manager.save(Property, property);
          updated++;

          // Re-index if listed
          if (property.statusCode === PropertyStatus.LISTED) {
            const propertyWithTranslations = await this.findOne(property.id, userId, true);
            await this.searchIndexService
              .indexProperty(propertyWithTranslations, propertyWithTranslations.translations)
              .catch((error) => {
                this.logger.warn(
                  `Failed to re-index property ${property.id}: ${error.message}`,
                );
              });
          }
        } catch (error: any) {
          failed.push(property.id);
          this.logger.warn(`Failed to update property ${property.id}: ${error.message}`);
        }
      }

      await queryRunner.commitTransaction();
      this.logger.log(`Bulk update: ${updated} updated, ${failed.length} failed`);

      return { updated, failed };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Bulk update transaction failed: ${error.message}`, error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Bulk delete properties (soft delete)
   */
  async bulkDelete(
    propertyIds: string[],
    userId: string,
    hardDelete = false,
  ): Promise<{ deleted: number; failed: string[] }> {
    const failed: string[] = [];
    let deleted = 0;

    // Verify all properties belong to the user (unless hard delete which is admin-only)
    const properties = await this.propertyRepo.find({
      where: propertyIds.map((id) => ({ id })),
    });

    const validProperties = properties.filter((p) => p.userId === userId);

    if (validProperties.length === 0) {
      throw new BadRequestException('No valid properties found for bulk delete');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const property of validProperties) {
        try {
          if (hardDelete) {
            // Hard delete: remove from search index and delete completely
            await this.searchIndexService.deleteProperty(property.id).catch(() => {});
            await queryRunner.manager.delete(PropertyTranslation, { propertyId: property.id });
            await queryRunner.manager.delete(PropertyFlag, { propertyId: property.id });
            await queryRunner.manager.remove(Property, property);
          } else {
            // Soft delete
            property.deletedAt = new Date();
            await queryRunner.manager.save(Property, property);

            // Remove from search index
            await this.searchIndexService.deleteProperty(property.id).catch(() => {});
          }

          deleted++;
        } catch (error: any) {
          failed.push(property.id);
          this.logger.warn(`Failed to delete property ${property.id}: ${error.message}`);
        }
      }

      await queryRunner.commitTransaction();
      this.logger.log(`Bulk delete: ${deleted} deleted, ${failed.length} failed`);

      return { deleted, failed };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Bulk delete transaction failed: ${error.message}`, error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Bulk status update
   */
  async bulkStatusUpdate(
    propertyIds: string[],
    status: PropertyStatus,
    userId: string,
  ): Promise<{ updated: number; failed: string[] }> {
    const failed: string[] = [];
    let updated = 0;

    const properties = await this.propertyRepo.find({
      where: propertyIds.map((id) => ({ id })),
    });

    const validProperties = properties.filter((p) => p.userId === userId);

    if (validProperties.length === 0) {
      throw new BadRequestException('No valid properties found for bulk status update');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      for (const property of validProperties) {
        try {
          property.status = status;

          if (status === PropertyStatus.LISTED && !property.publishedAt) {
            property.publishedAt = new Date();
          }

          await queryRunner.manager.save(Property, property);

          // Index or remove from index based on status
          if (status === PropertyStatus.LISTED) {
            const propertyWithTranslations = await this.findOne(property.id, userId, true);
            await this.searchIndexService
              .indexProperty(propertyWithTranslations, propertyWithTranslations.translations)
              .catch(() => {});
          } else {
            await this.searchIndexService.deleteProperty(property.id).catch(() => {});
          }

          updated++;
        } catch (error: any) {
          failed.push(property.id);
          this.logger.warn(`Failed to update status for property ${property.id}: ${error.message}`);
        }
      }

      await queryRunner.commitTransaction();
      this.logger.log(`Bulk status update: ${updated} updated, ${failed.length} failed`);

      return { updated, failed };
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Bulk status update transaction failed: ${error.message}`, error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Flag a property for moderation
   */
  async flagProperty(
    propertyId: string,
    reason: string,
    flaggedBy: string,
  ): Promise<PropertyFlag> {
    const property = await this.propertyRepo.findOne({
      where: { id: propertyId },
    });

    if (!property) {
      throw new NotFoundException(`Property with ID ${propertyId} not found`);
    }

    // Check if property is already flagged and pending
    const existingFlag = await this.flagRepo.findOne({
      where: {
        propertyId,
        status: FlagStatus.PENDING,
      },
    });

    if (existingFlag) {
      throw new BadRequestException('Property is already flagged and pending review');
    }

    // Check if property was listed (to remove from search index)
    const wasListed = property.status === PropertyStatus.LISTED || property.status === PropertyStatus.FLAGGED;

    // Start transaction
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create flag
      const flag = this.flagRepo.create({
        propertyId,
        flaggedBy,
        reason,
        status: FlagStatus.PENDING,
      });

      const savedFlag = await queryRunner.manager.save(PropertyFlag, flag);

      // Update property status to FLAGGED
      property.statusCode = PropertyStatus.FLAGGED;
      await queryRunner.manager.save(Property, property);

      await queryRunner.commitTransaction();

      // Remove from search index if property was listed (async, don't block)
      if (wasListed) {
        await this.searchIndexService.deleteProperty(propertyId).catch((error) => {
          this.logger.warn(
            `Failed to remove flagged property from search index: ${error.message}`,
          );
        });
      }

      this.logger.log(`Property ${propertyId} flagged by user ${flaggedBy}`);

      return savedFlag;
    } catch (error) {
      await queryRunner.rollbackTransaction();
      this.logger.error(`Failed to flag property ${propertyId}: ${error.message}`, error.stack);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  /**
   * Get moderation queue (properties with pending flags)
   */
  async getModerationQueue(
    status?: FlagStatus,
    limit = 20,
    offset = 0,
  ): Promise<{ flags: PropertyFlag[]; total: number }> {
    const queryBuilder = this.flagRepo
      .createQueryBuilder('flag')
      .leftJoinAndSelect('flag.property', 'property')
      .leftJoinAndSelect('property.translations', 'translations');

    if (status) {
      queryBuilder.where('flag.status = :status', { status });
    } else {
      // Default to pending flags
      queryBuilder.where('flag.status = :status', { status: FlagStatus.PENDING });
    }

    const [flags, total] = await queryBuilder
      .orderBy('flag.createdAt', 'DESC')
      .take(limit)
      .skip(offset)
      .getManyAndCount();

    return { flags, total };
  }

  /**
   * Moderate a flagged property (approve, reject, or takedown)
   */
  async moderateProperty(
    propertyId: string,
    action: 'approve' | 'reject' | 'takedown',
    reason: string | undefined,
    adminId: string,
  ): Promise<{ property: Property; flag: PropertyFlag }> {
    const property = await this.propertyRepo.findOne({
      where: { id: propertyId },
      relations: ['translations'],
    });

    if (!property) {
      throw new NotFoundException(`Property with ID ${propertyId} not found`);
    }

    // Find the most recent pending flag
    const flag = await this.flagRepo.findOne({
      where: {
        propertyId,
        status: FlagStatus.PENDING,
      },
      order: { createdAt: 'DESC' },
    });

    if (!flag) {
      throw new BadRequestException('No pending flag found for this property');
    }

    // Update flag
    flag.status = FlagStatus.REVIEWED;
    flag.reviewedBy = adminId;
    flag.reviewedAt = new Date();
    flag.moderationAction = action;
    flag.moderationNotes = reason || null;

    await this.flagRepo.save(flag);

    // Apply moderation action
    switch (action) {
      case 'approve':
        // Restore property to LISTED if it was flagged
        if (property.status === PropertyStatus.FLAGGED) {
          property.status = PropertyStatus.LISTED;
          await this.propertyRepo.save(property);
          // Re-index in search
          await this.searchIndexService.indexProperty(property, property.translations).catch((error) => {
            this.logger.warn(`Failed to re-index approved property: ${error.message}`);
          });
        }
        this.logger.log(`Property ${propertyId} approved by admin ${adminId}`);
        break;

      case 'reject':
        // Keep property as FLAGGED but mark flag as reviewed
        // Property owner can appeal or fix issues
        this.logger.log(`Property ${propertyId} flag rejected by admin ${adminId}`);
        break;

      case 'takedown':
        // Remove property from public view
        property.statusCode = PropertyStatus.ARCHIVED;
        await this.propertyRepo.save(property);
        // Remove from search index
        await this.searchIndexService.deleteProperty(propertyId).catch((error) => {
          this.logger.warn(`Failed to remove takedown property from search index: ${error.message}`);
        });
        this.logger.log(`Property ${propertyId} taken down by admin ${adminId}`);
        break;
    }

    return { property, flag };
  }

  /**
   * Advanced search with multiple filters
   */
  async search(searchDto: SearchPropertyDto, userId?: string): Promise<{ properties: Property[]; total: number }> {
    const queryBuilder = this.propertyRepo
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.translations', 'translation')
      .leftJoinAndSelect('property.neighborhood', 'neighborhood')
      .leftJoinAndSelect('property.details', 'details')
      .where('property.deletedAt IS NULL');

    // User filter
    if (searchDto.userId || userId) {
      queryBuilder.andWhere('property.userId = :userId', { userId: searchDto.userId || userId });
    }

    // Status filter
    if (searchDto.status) {
      queryBuilder.andWhere('property.status = :status', { status: searchDto.status });
    } else if (!userId && !searchDto.userId) {
      // Public users only see listed properties
      queryBuilder.andWhere('property.status = :status', { status: PropertyStatus.LISTED });
    }

    // Type filters
    if (searchDto.type) {
      queryBuilder.andWhere('property.type = :type', { type: searchDto.type });
    } else if (searchDto.types && searchDto.types.length > 0) {
      queryBuilder.andWhere('property.type IN (:...types)', { types: searchDto.types });
    }

    // Price filters
    if (searchDto.minPrice !== undefined) {
      queryBuilder.andWhere('property.price >= :minPrice', { minPrice: searchDto.minPrice });
    }
    if (searchDto.maxPrice !== undefined) {
      queryBuilder.andWhere('property.price <= :maxPrice', { maxPrice: searchDto.maxPrice });
    }
    if (searchDto.currency) {
      queryBuilder.andWhere('property.currency = :currency', { currency: searchDto.currency });
    }

    // Location filters
    if (searchDto.city) {
      queryBuilder.andWhere('LOWER(property.city) = LOWER(:city)', { city: searchDto.city });
    } else if (searchDto.cities && searchDto.cities.length > 0) {
      queryBuilder.andWhere('LOWER(property.city) IN (:...cities)', {
        cities: searchDto.cities.map((c) => c.toLowerCase()),
      });
    }
    if (searchDto.region) {
      queryBuilder.andWhere('LOWER(property.region) = LOWER(:region)', { region: searchDto.region });
    }
    if (searchDto.country) {
      queryBuilder.andWhere('property.country = :country', { country: searchDto.country.toUpperCase() });
    }
    if (searchDto.postalCode) {
      queryBuilder.andWhere('property.postalCode = :postalCode', { postalCode: searchDto.postalCode });
    }
    if (searchDto.neighborhoodId) {
      queryBuilder.andWhere('property.neighborhoodId = :neighborhoodId', {
        neighborhoodId: searchDto.neighborhoodId,
      });
    }

    // Geolocation nearby search
    if (searchDto.latitude !== undefined && searchDto.longitude !== undefined && searchDto.radiusKm) {
      const latDelta = searchDto.radiusKm / 111;
      const lonDelta = searchDto.radiusKm / (111 * Math.cos((searchDto.latitude * Math.PI) / 180));

      queryBuilder
        .andWhere('property.latitude IS NOT NULL')
        .andWhere('property.longitude IS NOT NULL')
        .andWhere('property.latitude BETWEEN :minLat AND :maxLat', {
          minLat: searchDto.latitude - latDelta,
          maxLat: searchDto.latitude + latDelta,
        })
        .andWhere('property.longitude BETWEEN :minLon AND :maxLon', {
          minLon: searchDto.longitude - lonDelta,
          maxLon: searchDto.longitude + lonDelta,
        });
    } else if (searchDto.hasCoordinates !== undefined) {
      if (searchDto.hasCoordinates) {
        queryBuilder
          .andWhere('property.latitude IS NOT NULL')
          .andWhere('property.longitude IS NOT NULL');
      } else {
        queryBuilder.andWhere(
          '(property.latitude IS NULL OR property.longitude IS NULL)',
        );
      }
    }

    // Text search (title, description)
    if (searchDto.search) {
      queryBuilder.andWhere(
        '(translation.title ILIKE :search OR translation.description ILIKE :search)',
        { search: `%${searchDto.search}%` },
      );
    }

    // Date filters
    if (searchDto.createdAfter) {
      queryBuilder.andWhere('property.createdAt >= :createdAfter', {
        createdAfter: new Date(searchDto.createdAfter),
      });
    }
    if (searchDto.createdBefore) {
      queryBuilder.andWhere('property.createdAt <= :createdBefore', {
        createdBefore: new Date(searchDto.createdBefore),
      });
    }
    if (searchDto.publishedAfter) {
      queryBuilder.andWhere('property.publishedAt >= :publishedAfter', {
        publishedAfter: new Date(searchDto.publishedAfter),
      });
    }
    if (searchDto.publishedBefore) {
      queryBuilder.andWhere('property.publishedAt <= :publishedBefore', {
        publishedBefore: new Date(searchDto.publishedBefore),
      });
    }

    // Media filters
    if (searchDto.hasImages !== undefined) {
      if (searchDto.hasImages) {
        queryBuilder.andWhere("property.mediaUrls IS NOT NULL AND property.mediaUrls != '[]'::jsonb");
      } else {
        queryBuilder.andWhere(
          "(property.mediaUrls IS NULL OR property.mediaUrls = '[]'::jsonb)",
        );
      }
    }
    if (searchDto.minImages !== undefined) {
      // For PostgreSQL JSONB, check array length
      queryBuilder.andWhere(
        "jsonb_array_length(COALESCE(property.mediaUrls, '[]'::jsonb)) >= :minImages",
        { minImages: searchDto.minImages },
      );
    }

    // Property IDs filter
    if (searchDto.propertyIds && searchDto.propertyIds.length > 0) {
      queryBuilder.andWhere('property.id IN (:...ids)', { ids: searchDto.propertyIds });
    }

    // Sorting
    const sortBy = searchDto.sortBy || 'createdAt';
    const sortOrder = searchDto.sortOrder || 'DESC';

    if (sortBy === 'title') {
      queryBuilder.orderBy('translation.title', sortOrder);
    } else {
      queryBuilder.orderBy(`property.${sortBy}`, sortOrder);
    }

    // Get total count before pagination
    const total = await queryBuilder.getCount();

    // Pagination
    const limit = searchDto.limit || 20;
    const offset = searchDto.offset || 0;

    if (limit < 1 || limit > 100) {
      throw new BadRequestException('Limit must be between 1 and 100');
    }
    if (offset < 0) {
      throw new BadRequestException('Offset must be non-negative');
    }

    queryBuilder.take(limit).skip(offset);

    const properties = await queryBuilder.getMany();

    // If geolocation search with radius, filter by exact distance
    if (
      searchDto.latitude !== undefined &&
      searchDto.longitude !== undefined &&
      searchDto.radiusKm
    ) {
      const filteredProperties = properties
        .map((prop) => {
          if (!prop.latitude || !prop.longitude) return null;
          const distance = this.calculateDistance(
            searchDto.latitude!,
            searchDto.longitude!,
            Number(prop.latitude),
            Number(prop.longitude),
          );
          return distance <= searchDto.radiusKm! ? { property: prop, distance } : null;
        })
        .filter((item): item is { property: Property; distance: number } => item !== null)
        .sort((a, b) => a.distance - b.distance)
        .map((item) => item.property);

      return {
        properties: filteredProperties.slice(0, limit),
        total: filteredProperties.length,
      };
    }

    return { properties, total };
  }

  /**
   * Map PropertyDetailsDto to PropertyDetails entity
   * Filters fields based on property type
   */
  private mapDetailsDtoToEntity(
    dto: any,
    propertyType: PropertyType,
  ): Partial<PropertyDetails> {
    const details: Partial<PropertyDetails> = {};

    // Common fields (all types)
    if (dto.surfaceArea !== undefined) details.surfaceArea = dto.surfaceArea;
    if (dto.landArea !== undefined) details.landArea = dto.landArea;
    if (dto.hasGarage !== undefined) details.hasGarage = dto.hasGarage;
    if (dto.garageSpaces !== undefined) details.garageSpaces = dto.garageSpaces;
    if (dto.hasParking !== undefined) details.hasParking = dto.hasParking;
    if (dto.parkingSpaces !== undefined) details.parkingSpaces = dto.parkingSpaces;
    if (dto.hasElevator !== undefined) details.hasElevator = dto.hasElevator;
    if (dto.hasBalcony !== undefined) details.hasBalcony = dto.hasBalcony;
    if (dto.hasTerrace !== undefined) details.hasTerrace = dto.hasTerrace;
    if (dto.hasGarden !== undefined) details.hasGarden = dto.hasGarden;
    if (dto.hasPool !== undefined) details.hasPool = dto.hasPool;
    if (dto.hasFireplace !== undefined) details.hasFireplace = dto.hasFireplace;
    if (dto.hasAirConditioning !== undefined) details.hasAirConditioning = dto.hasAirConditioning;
    if (dto.hasHeating !== undefined) details.hasHeating = dto.hasHeating;
    if (dto.amenities !== undefined) details.amenities = dto.amenities;
    if (dto.features !== undefined) details.features = dto.features;

    // House, Apartment, Villa specific
    if (['house', 'apartment', 'villa'].includes(propertyType)) {
      if (dto.bedrooms !== undefined) details.bedrooms = dto.bedrooms;
      if (dto.bathrooms !== undefined) details.bathrooms = dto.bathrooms;
      if (dto.totalRooms !== undefined) details.totalRooms = dto.totalRooms;
    }

    // Apartment specific
    if (propertyType === PropertyType.APARTMENT) {
      if (dto.floorNumber !== undefined) details.floorNumber = dto.floorNumber;
      if (dto.totalFloors !== undefined) details.totalFloors = dto.totalFloors;
      if (dto.hasStorage !== undefined) details.hasStorage = dto.hasStorage;
    }

    // House, Villa specific
    if (['house', 'villa'].includes(propertyType)) {
      if (dto.constructionYear !== undefined) details.constructionYear = dto.constructionYear;
      if (dto.renovationYear !== undefined) details.renovationYear = dto.renovationYear;
      if (dto.energyClass !== undefined) details.energyClass = dto.energyClass;
      if (dto.energyConsumption !== undefined) details.energyConsumption = dto.energyConsumption;
      if (dto.greenhouseGasEmissions !== undefined) details.greenhouseGasEmissions = dto.greenhouseGasEmissions;
    }

    // Land specific
    if (propertyType === PropertyType.LAND) {
      if (dto.zoning !== undefined) details.zoning = dto.zoning;
      if (dto.buildable !== undefined) details.buildable = dto.buildable;
      if (dto.buildingRights !== undefined) details.buildingRights = dto.buildingRights;
    }

    // Commercial specific
    if (propertyType === PropertyType.COMMERCIAL) {
      if (dto.commercialType !== undefined) details.commercialType = dto.commercialType;
      if (dto.businessLicense !== undefined) details.businessLicense = dto.businessLicense;
      if (dto.maxCapacity !== undefined) details.maxCapacity = dto.maxCapacity;
    }

    return details;
  }
}

