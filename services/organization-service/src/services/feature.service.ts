import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In } from 'typeorm';
import { Feature } from '../entities/feature.entity';
import { Permission } from '../entities/permission.entity';
import { CreateFeatureDto } from '../dto/create-feature.dto';
import { UpdateFeatureDto } from '../dto/update-feature.dto';

@Injectable()
export class FeatureService {
  private readonly logger = new Logger(FeatureService.name);

  constructor(
    @InjectRepository(Feature)
    // NOTE: typage assoupli ici car les types TypeORM ne sont pas résolus correctement
    private featureRepo: any,
    @InjectRepository(Permission)
    private permissionRepo: any,
  ) {}

  /**
   * Create a new feature
   */
  async create(createDto: CreateFeatureDto): Promise<Feature> {
    // Check uniqueness of name
    const existingFeature = await this.featureRepo.findOne({
      where: { name: createDto.name },
    });

    if (existingFeature) {
      throw new BadRequestException(
        `A feature with the name "${createDto.name}" already exists`,
      );
    }

    const feature = this.featureRepo.create({
      name: createDto.name,
      description: createDto.description,
      category: createDto.category,
      externalCode: createDto.externalCode,
      isActive: createDto.isActive ?? true,
    });

    // Associate permissions if provided
    if (createDto.permissionIds && createDto.permissionIds.length > 0) {
      const permissions = await this.permissionRepo.find({
        where: { id: In(createDto.permissionIds) },
      });

      if (permissions.length !== createDto.permissionIds.length) {
        throw new BadRequestException('One or more permission IDs are invalid');
      }

      feature.permissions = permissions;
    }

    const savedFeature = await this.featureRepo.save(feature);

    // Reload with relations
    return this.featureRepo.findOne({
      where: { id: savedFeature.id },
      relations: ['permissions'],
    }) as Promise<Feature>;
  }

  /**
   * Find all features (with optional filters)
   */
  async findAll(filters?: {
    category?: string;
    isActive?: boolean;
    search?: string;
  }): Promise<Feature[]> {
    const queryBuilder = this.featureRepo.createQueryBuilder('feature')
      .leftJoinAndSelect('feature.permissions', 'permissions');

    if (filters?.category) {
      queryBuilder.where('feature.category = :category', {
        category: filters.category,
      });
    }

    if (filters?.isActive !== undefined) {
      queryBuilder.andWhere('feature.isActive = :isActive', {
        isActive: filters.isActive,
      });
    }

    if (filters?.search) {
      queryBuilder.andWhere(
        '(feature.name ILIKE :search OR feature.description ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    return queryBuilder.getMany();
  }

  /**
   * Find a feature by ID
   */
  async findOne(id: string): Promise<Feature> {
    const feature = await this.featureRepo.findOne({
      where: { id },
      relations: ['permissions'],
    });

    if (!feature) {
      throw new NotFoundException(`Feature with ID "${id}" not found`);
    }

    return feature;
  }

  /**
   * Update a feature
   */
  async update(id: string, updateDto: UpdateFeatureDto): Promise<Feature> {
    const feature = await this.findOne(id);

    // Check uniqueness if name changes
    if (updateDto.name && updateDto.name !== feature.name) {
      const existingFeature = await this.featureRepo.findOne({
        where: { name: updateDto.name },
      });

      if (existingFeature && existingFeature.id !== id) {
        throw new BadRequestException(
          `A feature with the name "${updateDto.name}" already exists`,
        );
      }
    }

    // Update fields
    if (updateDto.name !== undefined) feature.name = updateDto.name;
    if (updateDto.description !== undefined) feature.description = updateDto.description;
    if (updateDto.category !== undefined) feature.category = updateDto.category;
    if (updateDto.externalCode !== undefined) feature.externalCode = updateDto.externalCode;
    if (updateDto.isActive !== undefined) feature.isActive = updateDto.isActive;

    // Update permissions if provided
    if (updateDto.permissionIds !== undefined) {
      if (updateDto.permissionIds.length === 0) {
        feature.permissions = [];
      } else {
        const permissions = await this.permissionRepo.find({
          where: { id: In(updateDto.permissionIds) },
        });

        if (permissions.length !== updateDto.permissionIds.length) {
          throw new BadRequestException('One or more permission IDs are invalid');
        }

        feature.permissions = permissions;
      }
    }

    await this.featureRepo.save(feature);

    // Reload with relations
    return this.featureRepo.findOne({
      where: { id },
      relations: ['permissions'],
    }) as Promise<Feature>;
  }

  /**
   * Delete a feature
   */
  async remove(id: string): Promise<void> {
    const feature = await this.findOne(id);

    // Note: Deleting a feature doesn't delete its permissions
    // The many-to-many relationship will be cleaned up automatically

    await this.featureRepo.remove(feature);
  }
}

