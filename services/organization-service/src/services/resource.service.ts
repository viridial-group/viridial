import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Resource } from '../entities/resource.entity';
import { CreateResourceDto } from '../dto/create-resource.dto';
import { UpdateResourceDto } from '../dto/update-resource.dto';

@Injectable()
export class ResourceService {
  private readonly logger = new Logger(ResourceService.name);

  constructor(
    @InjectRepository(Resource)
    // NOTE: typage assoupli ici car les types TypeORM ne sont pas résolus correctement
    private resourceRepo: any,
  ) {}

  /**
   * Create a new resource
   */
  async create(createDto: CreateResourceDto): Promise<Resource> {
    // Check uniqueness of name
    const existingResource = await this.resourceRepo.findOne({
      where: { name: createDto.name },
    });

    if (existingResource) {
      throw new BadRequestException(
        `A resource with the name "${createDto.name}" already exists`,
      );
    }

    const resource = this.resourceRepo.create({
      name: createDto.name,
      description: createDto.description,
      category: createDto.category,
      externalCode: createDto.externalCode,
      isActive: createDto.isActive ?? true,
    });

    return this.resourceRepo.save(resource);
  }

  /**
   * Find all resources (with optional filters)
   */
  async findAll(filters?: {
    category?: string;
    isActive?: boolean;
    search?: string;
  }): Promise<Resource[]> {
    const queryBuilder = this.resourceRepo.createQueryBuilder('resource');

    if (filters?.category) {
      queryBuilder.where('resource.category = :category', {
        category: filters.category,
      });
    }

    if (filters?.isActive !== undefined) {
      queryBuilder.andWhere('resource.isActive = :isActive', {
        isActive: filters.isActive,
      });
    }

    if (filters?.search) {
      queryBuilder.andWhere(
        '(resource.name ILIKE :search OR resource.description ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    // Log the SQL query
    const [sql, parameters] = queryBuilder.getQueryAndParameters();
    this.logger.debug(`Executing SQL query: ${sql}`);
    this.logger.debug(`Query parameters: ${JSON.stringify(parameters)}`);

    const results = await queryBuilder.getMany();
    
    this.logger.debug(`Query returned ${results.length} resources`);
    
    return results;
  }

  /**
   * Find a resource by ID
   */
  async findOne(id: string): Promise<Resource> {
    const resource = await this.resourceRepo.findOne({
      where: { id },
      relations: ['permissions'],
    });

    if (!resource) {
      throw new NotFoundException(`Resource with ID "${id}" not found`);
    }

    return resource;
  }

  /**
   * Find a resource by name
   */
  async findByName(name: string): Promise<Resource | null> {
    return this.resourceRepo.findOne({
      where: { name },
      relations: ['permissions'],
    });
  }

  /**
   * Update a resource
   */
  async update(id: string, updateDto: UpdateResourceDto): Promise<Resource> {
    const resource = await this.findOne(id);

    // Check uniqueness if name changes
    if (updateDto.name && updateDto.name !== resource.name) {
      const existingResource = await this.resourceRepo.findOne({
        where: { name: updateDto.name },
      });

      if (existingResource && existingResource.id !== id) {
        throw new BadRequestException(
          `A resource with the name "${updateDto.name}" already exists`,
        );
      }
    }

    // Update fields
    if (updateDto.name !== undefined) resource.name = updateDto.name;
    if (updateDto.description !== undefined) resource.description = updateDto.description;
    if (updateDto.category !== undefined) resource.category = updateDto.category;
    if (updateDto.externalCode !== undefined) resource.externalCode = updateDto.externalCode;
    if (updateDto.isActive !== undefined) resource.isActive = updateDto.isActive;

    await this.resourceRepo.save(resource);

    // Reload with relations
    return this.resourceRepo.findOne({
      where: { id },
      relations: ['permissions'],
    }) as Promise<Resource>;
  }

  /**
   * Delete a resource
   */
  async remove(id: string): Promise<void> {
    const resource = await this.findOne(id);

    // Check if resource is used by permissions
    // Note: Could add validation here to prevent deletion of resources in use
    // For now, delete directly (CASCADE will handle relation cleanup)

    await this.resourceRepo.remove(resource);
  }
}

