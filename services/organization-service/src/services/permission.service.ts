import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In } from 'typeorm';
import { Permission } from '../entities/permission.entity';
import { Resource } from '../entities/resource.entity';
import { Feature } from '../entities/feature.entity';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UpdatePermissionDto } from '../dto/update-permission.dto';

@Injectable()
export class PermissionService {
  private readonly logger = new Logger(PermissionService.name);

  constructor(
    @InjectRepository(Permission)
    // NOTE: typage assoupli ici car les types TypeORM ne sont pas résolus correctement
    private permissionRepo: any,
    @InjectRepository(Resource)
    private resourceRepo: any,
    @InjectRepository(Feature)
    private featureRepo: any,
  ) {}

  /**
   * Create a new permission
   */
  async create(createDto: CreatePermissionDto): Promise<Permission> {
    // Resolve resource (either from resourceId or resource name)
    let resource: Resource | null = null;
    let resourceName: string;

    if (createDto.resourceId) {
      resource = await this.resourceRepo.findOne({
        where: { id: createDto.resourceId },
      });
      if (!resource) {
        throw new NotFoundException(`Resource with ID "${createDto.resourceId}" not found`);
      }
      resourceName = resource.name;
    } else if (createDto.resource) {
      resourceName = createDto.resource;
      // Try to find existing resource by name
      resource = await this.resourceRepo.findOne({
        where: { name: createDto.resource },
      });
    } else {
      throw new BadRequestException('Either resourceId or resource must be provided');
    }

    // Check uniqueness of resource:action combination
    const where: any = { action: createDto.action };
    if (resource) {
      where.resourceId = resource.id;
    } else {
      where.resource = resourceName;
    }

    const existingPermission = await this.permissionRepo.findOne({ where });

    if (existingPermission) {
      throw new BadRequestException(
        `A permission with resource "${resourceName}" and action "${createDto.action}" already exists`,
      );
    }

    const permission = this.permissionRepo.create({
      resourceId: resource?.id || null,
      resource: resourceName, // Denormalized for backward compatibility
      action: createDto.action,
      description: createDto.description,
      externalCode: createDto.externalCode,
    });

    const savedPermission = await this.permissionRepo.save(permission);

    // Associate features if provided
    if (createDto.featureIds && createDto.featureIds.length > 0) {
      const features = await this.featureRepo.find({
        where: { id: In(createDto.featureIds) },
      });

      if (features.length !== createDto.featureIds.length) {
        throw new BadRequestException('One or more feature IDs are invalid');
      }

      savedPermission.features = features;
      await this.permissionRepo.save(savedPermission);
    }

    // Reload with relations
    return this.permissionRepo.findOne({
      where: { id: savedPermission.id },
      relations: ['resourceEntity', 'features'],
    }) as Promise<Permission>;
  }

  /**
   * Find all permissions (with optional filters)
   */
  async findAll(filters?: {
    resourceId?: string;
    resource?: string;
    action?: string;
    search?: string;
  }): Promise<Permission[]> {
    const queryBuilder = this.permissionRepo.createQueryBuilder('permission')
      .leftJoinAndSelect('permission.resourceEntity', 'resource')
      .leftJoinAndSelect('permission.features', 'features');

    if (filters?.resourceId) {
      queryBuilder.where('permission.resourceId = :resourceId', {
        resourceId: filters.resourceId,
      });
    } else if (filters?.resource) {
      queryBuilder.where('permission.resource = :resource', {
        resource: filters.resource,
      });
    }

    if (filters?.action) {
      queryBuilder.andWhere('permission.action = :action', {
        action: filters.action,
      });
    }

    if (filters?.search) {
      queryBuilder.andWhere(
        '(permission.resource ILIKE :search OR permission.action ILIKE :search OR permission.description ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    return queryBuilder.getMany();
  }

  /**
   * Find a permission by ID
   */
  async findOne(id: string): Promise<Permission> {
    const permission = await this.permissionRepo.findOne({
      where: { id },
      relations: ['resourceEntity', 'features'],
    });

    if (!permission) {
      throw new NotFoundException(`Permission with ID "${id}" not found`);
    }

    return permission;
  }

  /**
   * Find a permission by resource and action
   */
  async findByResourceAndAction(
    resource: string,
    action: string,
  ): Promise<Permission | null> {
    return this.permissionRepo.findOne({
      where: { resource, action },
      relations: ['resourceEntity', 'features'],
    });
  }

  /**
   * Update a permission
   */
  async update(id: string, updateDto: UpdatePermissionDto): Promise<Permission> {
    const permission = await this.findOne(id);

    // Resolve resource if provided
    let resource: Resource | null = null;
    let resourceName: string | undefined;

    if (updateDto.resourceId !== undefined) {
      if (updateDto.resourceId) {
        resource = await this.resourceRepo.findOne({
          where: { id: updateDto.resourceId },
        });
        if (!resource) {
          throw new NotFoundException(`Resource with ID "${updateDto.resourceId}" not found`);
        }
        resourceName = resource.name;
      } else {
        resource = null;
        resourceName = updateDto.resource || permission.resource;
      }
    } else if (updateDto.resource !== undefined) {
      resourceName = updateDto.resource;
      resource = await this.resourceRepo.findOne({
        where: { name: updateDto.resource },
      });
    }

    // Check uniqueness if resource or action changes
    if (resourceName || updateDto.action) {
      const finalResource = resourceName ?? permission.resource;
      const finalAction = updateDto.action ?? permission.action;

      if (finalResource !== permission.resource || finalAction !== permission.action) {
        const where: any = { action: finalAction };
        if (resource) {
          where.resourceId = resource.id;
        } else {
          where.resource = finalResource;
        }

        const existingPermission = await this.permissionRepo.findOne({ where });

        if (existingPermission && existingPermission.id !== id) {
          throw new BadRequestException(
            `A permission with resource "${finalResource}" and action "${finalAction}" already exists`,
          );
        }
      }
    }

    // Update fields
    if (updateDto.resourceId !== undefined) permission.resourceId = updateDto.resourceId || null;
    if (resourceName !== undefined) permission.resource = resourceName;
    if (updateDto.action !== undefined) permission.action = updateDto.action;
    if (updateDto.description !== undefined) permission.description = updateDto.description;
    if (updateDto.externalCode !== undefined) permission.externalCode = updateDto.externalCode;

    // Update features if provided
    if (updateDto.featureIds !== undefined) {
      if (updateDto.featureIds.length === 0) {
        permission.features = [];
      } else {
        const features = await this.featureRepo.find({
          where: { id: In(updateDto.featureIds) },
        });

        if (features.length !== updateDto.featureIds.length) {
          throw new BadRequestException('One or more feature IDs are invalid');
        }

        permission.features = features;
      }
    }

    await this.permissionRepo.save(permission);

    // Reload with relations
    return this.permissionRepo.findOne({
      where: { id },
      relations: ['resourceEntity', 'features'],
    }) as Promise<Permission>;
  }

  /**
   * Delete a permission
   */
  async remove(id: string): Promise<void> {
    const permission = await this.findOne(id);

    // Check if permission is used by roles
    // Note: Could add validation here
    // For now, delete directly (foreign key constraints will handle relations)

    await this.permissionRepo.remove(permission);
  }

  /**
   * Find all permissions grouped by resource
   */
  async findAllGroupedByResource(): Promise<Record<string, Permission[]>> {
    const permissions = await this.findAll();
    const grouped: Record<string, Permission[]> = {};

    permissions.forEach((permission) => {
      const resourceKey = permission.resourceEntity?.name || permission.resource;
      if (!grouped[resourceKey]) {
        grouped[resourceKey] = [];
      }
      grouped[resourceKey].push(permission);
    });

    return grouped;
  }

  /**
   * Create multiple permissions at once (useful for initialization)
   */
  async createBulk(permissions: CreatePermissionDto[]): Promise<Permission[]> {
    const created: Permission[] = [];

    for (const dto of permissions) {
      try {
        const permission = await this.create(dto);
        created.push(permission);
      } catch (error) {
        // If permission already exists, fetch it
        if (error instanceof BadRequestException) {
          const resourceName = dto.resource || (dto.resourceId ? (await this.resourceRepo.findOne({ where: { id: dto.resourceId } }))?.name : undefined);
          if (resourceName && dto.action) {
            const existing = await this.findByResourceAndAction(
              resourceName,
              dto.action,
            );
            if (existing) {
              created.push(existing);
              continue;
            }
          }
        }
        throw error;
      }
    }

    return created;
  }
}

