import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Permission } from '../entities/permission.entity';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UpdatePermissionDto } from '../dto/update-permission.dto';

@Injectable()
export class PermissionService {
  private readonly logger = new Logger(PermissionService.name);

  constructor(
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  /**
   * Créer une nouvelle permission
   */
  async create(createDto: CreatePermissionDto): Promise<Permission> {
    // Vérifier l'unicité de la combinaison resource:action
    const existingPermission = await this.permissionRepository.findOne({
      where: {
        resource: createDto.resource,
        action: createDto.action,
      },
    });

    if (existingPermission) {
      throw new BadRequestException(
        `A permission with resource "${createDto.resource}" and action "${createDto.action}" already exists`,
      );
    }

    const permission = this.permissionRepository.create({
      resource: createDto.resource,
      action: createDto.action,
      description: createDto.description,
    });

    return this.permissionRepository.save(permission);
  }

  /**
   * Récupérer toutes les permissions (avec filtres optionnels)
   */
  async findAll(filters?: {
    resource?: string;
    action?: string;
    search?: string;
  }): Promise<Permission[]> {
    const queryBuilder = this.permissionRepository.createQueryBuilder('permission');

    if (filters?.resource) {
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
   * Récupérer une permission par ID
   */
  async findOne(id: string): Promise<Permission> {
    const permission = await this.permissionRepository.findOne({
      where: { id },
    });

    if (!permission) {
      throw new NotFoundException(`Permission with ID "${id}" not found`);
    }

    return permission;
  }

  /**
   * Récupérer une permission par resource et action
   */
  async findByResourceAndAction(
    resource: string,
    action: string,
  ): Promise<Permission | null> {
    return this.permissionRepository.findOne({
      where: { resource, action },
    });
  }

  /**
   * Mettre à jour une permission
   */
  async update(id: string, updateDto: UpdatePermissionDto): Promise<Permission> {
    const permission = await this.findOne(id);

    // Vérifier l'unicité si resource ou action change
    if (updateDto.resource || updateDto.action) {
      const resource = updateDto.resource ?? permission.resource;
      const action = updateDto.action ?? permission.action;

      if (resource !== permission.resource || action !== permission.action) {
        const existingPermission = await this.permissionRepository.findOne({
          where: { resource, action },
        });

        if (existingPermission && existingPermission.id !== id) {
          throw new BadRequestException(
            `A permission with resource "${resource}" and action "${action}" already exists`,
          );
        }
      }
    }

    // Mettre à jour les champs
    if (updateDto.resource !== undefined) permission.resource = updateDto.resource;
    if (updateDto.action !== undefined) permission.action = updateDto.action;
    if (updateDto.description !== undefined) permission.description = updateDto.description;

    return this.permissionRepository.save(permission);
  }

  /**
   * Supprimer une permission
   */
  async remove(id: string): Promise<void> {
    const permission = await this.findOne(id);

    // Vérifier si la permission est utilisée par des rôles
    // Note: On pourrait ajouter une vérification ici
    // Pour l'instant, on supprime directement (la contrainte de clé étrangère gérera les relations)

    await this.permissionRepository.remove(permission);
  }

  /**
   * Récupérer toutes les permissions groupées par ressource
   */
  async findAllGroupedByResource(): Promise<Record<string, Permission[]>> {
    const permissions = await this.findAll();
    const grouped: Record<string, Permission[]> = {};

    permissions.forEach(permission => {
      if (!grouped[permission.resource]) {
        grouped[permission.resource] = [];
      }
      grouped[permission.resource].push(permission);
    });

    return grouped;
  }

  /**
   * Créer plusieurs permissions en une fois (utile pour l'initialisation)
   */
  async createBulk(permissions: CreatePermissionDto[]): Promise<Permission[]> {
    const created: Permission[] = [];

    for (const dto of permissions) {
      try {
        const permission = await this.create(dto);
        created.push(permission);
      } catch (error) {
        // Si la permission existe déjà, on la récupère
        if (error instanceof BadRequestException) {
          const existing = await this.findByResourceAndAction(
            dto.resource,
            dto.action,
          );
          if (existing) {
            created.push(existing);
            continue;
          }
        }
        throw error;
      }
    }

    return created;
  }
}

