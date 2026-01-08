import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property, PropertyStatus } from '../entities/property.entity';
import { PropertyTranslation } from '../entities/property-translation.entity';
import { CreatePropertyDto } from '../dto/create-property.dto';
import { UpdatePropertyDto } from '../dto/update-property.dto';
import { GeolocationClientService } from './geolocation-client.service';
import { SearchIndexService } from './search-index.service';

@Injectable()
export class PropertyService {
  private readonly logger = new Logger(PropertyService.name);

  constructor(
    @InjectRepository(Property)
    private propertyRepo: Repository<Property>,
    @InjectRepository(PropertyTranslation)
    private translationRepo: Repository<PropertyTranslation>,
    private readonly geolocationClient: GeolocationClientService,
    private readonly searchIndexService: SearchIndexService,
  ) {}

      async create(createDto: CreatePropertyDto, userId: string): Promise<Property> {
        // userId is now guaranteed to come from authenticated JWT token
        // Ensure DTO uses the authenticated userId
        if (createDto.userId && createDto.userId !== userId) {
          throw new ForbiddenException('Cannot create property for another user');
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

    // Create property
    const property = this.propertyRepo.create({
      userId: createDto.userId,
      type: createDto.type,
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
      status: createDto.status || PropertyStatus.DRAFT,
    });

    const savedProperty = await this.propertyRepo.save(property);

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

    await this.translationRepo.save(translations);

    // Reload with relations
    return this.findOne(savedProperty.id, userId);
  }

  async findAll(
    userId?: string,
    status?: PropertyStatus,
    limit = 20,
    offset = 0,
  ): Promise<{ properties: Property[]; total: number }> {
    const queryBuilder = this.propertyRepo
      .createQueryBuilder('property')
      .leftJoinAndSelect('property.translations', 'translation');

    if (userId) {
      queryBuilder.where('property.userId = :userId', { userId });
    }

    if (status) {
      queryBuilder.andWhere('property.status = :status', { status });
    }

    const [properties, total] = await queryBuilder
      .orderBy('property.createdAt', 'DESC')
      .take(limit)
      .skip(offset)
      .getManyAndCount();

    return { properties, total };
  }

  async findOne(id: string, userId?: string): Promise<Property> {
    const property = await this.propertyRepo.findOne({
      where: { id },
      relations: ['translations'],
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
      if (property.status !== PropertyStatus.LISTED) {
        throw new ForbiddenException('You do not have access to this property');
      }
      // If property is listed, allow public access even if not owner
      return property;
    }

    // No userId provided (public access) - only allow if property is LISTED
    if (property.status !== PropertyStatus.LISTED) {
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

    // Track if address changed
    const addressChanged =
      updateDto.street !== undefined ||
      updateDto.postalCode !== undefined ||
      updateDto.city !== undefined ||
      updateDto.region !== undefined ||
      updateDto.country !== undefined;

    // Update property fields
    if (updateDto.type) property.type = updateDto.type;
    if (updateDto.price !== undefined) property.price = updateDto.price;
    if (updateDto.currency) property.currency = updateDto.currency;
    if (updateDto.street !== undefined) property.street = updateDto.street;
    if (updateDto.postalCode !== undefined) property.postalCode = updateDto.postalCode;
    if (updateDto.city !== undefined) property.city = updateDto.city;
    if (updateDto.region !== undefined) property.region = updateDto.region;
    if (updateDto.country !== undefined) property.country = updateDto.country;
    if (updateDto.mediaUrls !== undefined) property.mediaUrls = updateDto.mediaUrls;
    if (updateDto.status) property.status = updateDto.status;

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

    await this.propertyRepo.save(property);

    // Update translations if provided
    if (updateDto.translations) {
      // Delete existing translations and create new ones
      await this.translationRepo.delete({ propertyId: id });

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

      await this.translationRepo.save(translations);
    }

    const updatedProperty = await this.findOne(id, userId);

    // Re-index if property is LISTED (searchable)
    if (updatedProperty.status === PropertyStatus.LISTED) {
      await this.searchIndexService.indexProperty(
        updatedProperty,
        updatedProperty.translations,
      ).catch((error) => {
        this.logger.warn(`Failed to re-index property ${id} after update: ${error.message}`);
      });
    }

    return updatedProperty;
  }

  async delete(id: string, userId: string): Promise<void> {
    const property = await this.findOne(id, userId);
    
    // Delete from search index
    await this.searchIndexService.deleteProperty(id).catch((error) => {
      this.logger.warn(`Failed to delete property ${id} from search index: ${error.message}`);
    });
    
    await this.propertyRepo.remove(property);
  }

  async publish(id: string, userId: string): Promise<Property> {
    const property = await this.findOne(id, userId);

    // Validate that property has required fields
    if (!property.translations || property.translations.length === 0) {
      throw new BadRequestException('Property must have at least one translation to be published');
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
      .andWhere('property.longitude IS NOT NULL');

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
    const filteredProperties = properties.filter((prop) => {
      if (!prop.latitude || !prop.longitude) return false;
      const distance = this.calculateDistance(
        latitude,
        longitude,
        Number(prop.latitude),
        Number(prop.longitude),
      );
      return distance <= radiusKm;
    });

    // Apply pagination after filtering
    const paginatedProperties = filteredProperties.slice(offset, offset + limit);

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
}

