import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';

@Injectable()
export class RoleService {
  private readonly logger = new Logger(RoleService.name);

  constructor(
    @InjectRepository(Role)
    private roleRepository: Repository<Role>,
    @InjectRepository(Permission)
    private permissionRepository: Repository<Permission>,
  ) {}

  /**
   * Créer un nouveau rôle
   */
  async create(createDto: CreateRoleDto, organizationId?: string): Promise<Role> {
    // Vérifier l'unicité du nom dans l'organisation
    const existingRole = await this.roleRepository.findOne({
      where: {
        name: createDto.name,
        organizationId: createDto.organizationId ?? organizationId ?? null,
      },
    });

    if (existingRole) {
      throw new BadRequestException(
        `A role with the name "${createDto.name}" already exists in this organization`,
      );
    }

    // Créer le rôle
    const role = this.roleRepository.create({
      name: createDto.name,
      description: createDto.description,
      organizationId: createDto.organizationId ?? organizationId ?? null,
      isActive: true,
    });

    // Associer les permissions si fournies
    if (createDto.permissionIds && createDto.permissionIds.length > 0) {
      const permissions = await this.permissionRepository.find({
        where: { id: In(createDto.permissionIds) },
      });

      if (permissions.length !== createDto.permissionIds.length) {
        throw new BadRequestException('One or more permission IDs are invalid');
      }

      role.permissions = permissions;
    }

    const savedRole = await this.roleRepository.save(role);
    
    // Recharger avec les relations
    return this.roleRepository.findOne({
      where: { id: savedRole.id },
      relations: ['permissions'],
    }) as Promise<Role>;
  }

  /**
   * Récupérer tous les rôles (avec filtres optionnels)
   */
  async findAll(filters?: {
    organizationId?: string;
    isActive?: boolean;
    search?: string;
  }): Promise<Role[]> {
    const queryBuilder = this.roleRepository.createQueryBuilder('role')
      .leftJoinAndSelect('role.permissions', 'permissions');

    if (filters?.organizationId) {
      queryBuilder.where('role.organizationId = :organizationId', {
        organizationId: filters.organizationId,
      });
    }

    if (filters?.isActive !== undefined) {
      queryBuilder.andWhere('role.isActive = :isActive', {
        isActive: filters.isActive,
      });
    }

    if (filters?.search) {
      queryBuilder.andWhere(
        '(role.name ILIKE :search OR role.description ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    return queryBuilder.getMany();
  }

  /**
   * Récupérer un rôle par ID
   */
  async findOne(id: string, organizationId?: string): Promise<Role> {
    const where: any = { id };
    if (organizationId) {
      where.organizationId = organizationId;
    }

    const role = await this.roleRepository.findOne({
      where,
      relations: ['permissions'],
    });

    if (!role) {
      throw new NotFoundException(`Role with ID "${id}" not found`);
    }

    return role;
  }

  /**
   * Mettre à jour un rôle
   */
  async update(
    id: string,
    updateDto: UpdateRoleDto,
    organizationId?: string,
  ): Promise<Role> {
    const role = await this.findOne(id, organizationId);

    // Vérifier l'unicité du nom si le nom change
    if (updateDto.name && updateDto.name !== role.name) {
      const existingRole = await this.roleRepository.findOne({
        where: {
          name: updateDto.name,
          organizationId: role.organizationId,
        },
      });

      if (existingRole && existingRole.id !== id) {
        throw new BadRequestException(
          `A role with the name "${updateDto.name}" already exists in this organization`,
        );
      }
    }

    // Mettre à jour les champs
    if (updateDto.name !== undefined) role.name = updateDto.name;
    if (updateDto.description !== undefined) role.description = updateDto.description;
    if (updateDto.isActive !== undefined) role.isActive = updateDto.isActive;

    // Mettre à jour les permissions si fournies
    if (updateDto.permissionIds !== undefined) {
      if (updateDto.permissionIds.length === 0) {
        role.permissions = [];
      } else {
        const permissions = await this.permissionRepository.find({
          where: { id: In(updateDto.permissionIds) },
        });

        if (permissions.length !== updateDto.permissionIds.length) {
          throw new BadRequestException('One or more permission IDs are invalid');
        }

        role.permissions = permissions;
      }
    }

    await this.roleRepository.save(role);

    // Recharger avec les relations
    return this.roleRepository.findOne({
      where: { id },
      relations: ['permissions'],
    }) as Promise<Role>;
  }

  /**
   * Supprimer un rôle
   */
  async remove(id: string, organizationId?: string): Promise<void> {
    const role = await this.findOne(id, organizationId);

    // Vérifier si le rôle est utilisé (via user_roles)
    // Note: On pourrait ajouter une vérification ici pour éviter la suppression de rôles en cours d'utilisation
    // Pour l'instant, on supprime directement (la contrainte de clé étrangère avec CASCADE gérera la suppression des relations)

    await this.roleRepository.remove(role);
  }

  /**
   * Vérifier si un utilisateur a un rôle spécifique
   */
  async userHasRole(userId: string, roleName: string, organizationId?: string): Promise<boolean> {
    const where: any = { name: roleName };
    if (organizationId) {
      where.organizationId = organizationId;
    }

    const role = await this.roleRepository.findOne({
      where,
      relations: ['userRoles'],
    });

    if (!role) {
      return false;
    }

    // Vérifier si l'utilisateur a ce rôle
    return role.userRoles?.some(userRole => userRole.userId === userId) ?? false;
  }
}

