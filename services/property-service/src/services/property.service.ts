import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Property, PropertyStatus } from '../entities/property.entity';
import { PropertyTranslation } from '../entities/property-translation.entity';
import { CreatePropertyDto } from '../dto/create-property.dto';
import { UpdatePropertyDto } from '../dto/update-property.dto';

@Injectable()
export class PropertyService {
  constructor(
    @InjectRepository(Property)
    private propertyRepo: Repository<Property>,
    @InjectRepository(PropertyTranslation)
    private translationRepo: Repository<PropertyTranslation>,
  ) {}

  async create(createDto: CreatePropertyDto, userId: string): Promise<Property> {
    // Verify user owns the userId (in real app, verify JWT token)
    if (createDto.userId !== userId) {
      throw new ForbiddenException('Cannot create property for another user');
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
      latitude: createDto.latitude || null,
      longitude: createDto.longitude || null,
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

    // If userId provided, verify ownership
    if (userId && property.userId !== userId) {
      throw new ForbiddenException('You do not have access to this property');
    }

    return property;
  }

  async update(
    id: string,
    updateDto: UpdatePropertyDto,
    userId: string,
  ): Promise<Property> {
    const property = await this.findOne(id, userId);

    // Update property fields
    if (updateDto.type) property.type = updateDto.type;
    if (updateDto.price !== undefined) property.price = updateDto.price;
    if (updateDto.currency) property.currency = updateDto.currency;
    if (updateDto.street !== undefined) property.street = updateDto.street;
    if (updateDto.postalCode !== undefined) property.postalCode = updateDto.postalCode;
    if (updateDto.city !== undefined) property.city = updateDto.city;
    if (updateDto.region !== undefined) property.region = updateDto.region;
    if (updateDto.country !== undefined) property.country = updateDto.country;
    if (updateDto.latitude !== undefined) property.latitude = updateDto.latitude;
    if (updateDto.longitude !== undefined) property.longitude = updateDto.longitude;
    if (updateDto.mediaUrls !== undefined) property.mediaUrls = updateDto.mediaUrls;
    if (updateDto.status) property.status = updateDto.status;

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

    return this.findOne(id, userId);
  }

  async delete(id: string, userId: string): Promise<void> {
    const property = await this.findOne(id, userId);
    await this.propertyRepo.remove(property);
  }

  async publish(id: string, userId: string): Promise<Property> {
    const property = await this.findOne(id, userId);

    // Validate that property has required fields
    if (!property.translations || property.translations.length === 0) {
      throw new BadRequestException('Property must have at least one translation to be published');
    }

    // Update status to LISTED and set publishedAt
    property.status = PropertyStatus.LISTED;
    property.publishedAt = new Date();

    await this.propertyRepo.save(property);

    // TODO: Trigger Meilisearch indexing event
    // await this.eventEmitter.emit('property.published', { propertyId: id });

    return this.findOne(id, userId);
  }
}

