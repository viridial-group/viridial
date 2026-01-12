import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository, InjectDataSource } from '@nestjs/typeorm';
import { In } from 'typeorm';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';

@Injectable()
export class RoleService {
  private readonly logger = new Logger(RoleService.name);

  constructor(
    @InjectRepository(Role)
    // NOTE: typage assoupli ici car les types TypeORM ne sont pas résolus correctement
    private roleRepo: any,
    @InjectRepository(Permission)
    private permissionRepo: any,
    @InjectDataSource()
    // NOTE: typage assoupli ici car les types TypeORM ne sont pas résolus correctement
    private readonly dataSource: any,
  ) {}

  /**
   * Create a new role
   */
  async create(createDto: CreateRoleDto, organizationId?: string): Promise<Role> {
    // Check uniqueness of name within organization
    const existingRole = await this.roleRepo.findOne({
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

    // Validate parent role if provided
    if (createDto.parentId) {
      const parentRole = await this.roleRepo.findOne({
        where: { id: createDto.parentId },
        select: ['id', 'organizationId'],
      });

      if (!parentRole) {
        throw new NotFoundException(`Parent role with ID "${createDto.parentId}" not found`);
      }

      // Parent must be in the same organization (or both global)
      const targetOrgId = createDto.organizationId ?? organizationId ?? null;
      if (parentRole.organizationId !== targetOrgId) {
        throw new BadRequestException('Parent role must belong to the same organization');
      }
    }

    // Create the role
    const role = this.roleRepo.create({
      name: createDto.name,
      description: createDto.description,
      organizationId: createDto.organizationId ?? organizationId ?? null,
      parentId: createDto.parentId ?? null,
      isActive: true,
    });

    // Associate permissions if provided
    if (createDto.permissionIds && createDto.permissionIds.length > 0) {
      const permissions = await this.permissionRepo.find({
        where: { id: In(createDto.permissionIds) },
      });

      if (permissions.length !== createDto.permissionIds.length) {
        throw new BadRequestException('One or more permission IDs are invalid');
      }

      role.permissions = permissions;
    }

    const savedRole = await this.roleRepo.save(role);
    
    // Reload with relations
    return this.roleRepo.findOne({
      where: { id: savedRole.id },
      relations: ['permissions', 'parent'],
    }) as Promise<Role>;
  }

  /**
   * Find all roles (with optional filters)
   */
  async findAll(filters?: {
    organizationId?: string;
    isActive?: boolean;
    search?: string;
  }): Promise<Role[]> {
    const queryBuilder = this.roleRepo.createQueryBuilder('role')
      .leftJoinAndSelect('role.permissions', 'permissions')
      .leftJoinAndSelect('role.parent', 'parent');

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
   * Find a role by ID
   */
  async findOne(id: string, organizationId?: string): Promise<Role> {
    const where: any = { id };
    if (organizationId) {
      where.organizationId = organizationId;
    }

    const role = await this.roleRepo.findOne({
      where,
      relations: ['permissions', 'parent'],
    });

    if (!role) {
      throw new NotFoundException(`Role with ID "${id}" not found`);
    }

    return role;
  }

  /**
   * Update a role
   */
  async update(
    id: string,
    updateDto: UpdateRoleDto,
    organizationId?: string,
  ): Promise<Role> {
    const role = await this.findOne(id, organizationId);

    // Check uniqueness if name changes
    if (updateDto.name && updateDto.name !== role.name) {
      const existingRole = await this.roleRepo.findOne({
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

    // Validate and update parent role if provided
    if (updateDto.parentId !== undefined) {
      if (updateDto.parentId === id) {
        throw new BadRequestException('Role cannot be its own parent');
      }

      if (updateDto.parentId !== null) {
        // Check for circular reference
        const isDescendant = await this.isDescendant(updateDto.parentId, id);
        if (isDescendant) {
          throw new BadRequestException('Cannot set parent: would create circular reference');
        }

        const parentRole = await this.roleRepo.findOne({
          where: { id: updateDto.parentId },
          select: ['id', 'organizationId'],
        });

        if (!parentRole) {
          throw new NotFoundException(`Parent role with ID "${updateDto.parentId}" not found`);
        }

        // Parent must be in the same organization
        if (parentRole.organizationId !== role.organizationId) {
          throw new BadRequestException('Parent role must belong to the same organization');
        }
      }

      role.parentId = updateDto.parentId;
    }

    // Update fields
    if (updateDto.name !== undefined) role.name = updateDto.name;
    if (updateDto.description !== undefined) role.description = updateDto.description;
    if (updateDto.isActive !== undefined) role.isActive = updateDto.isActive;

    // Update permissions if provided
    if (updateDto.permissionIds !== undefined) {
      if (updateDto.permissionIds.length === 0) {
        role.permissions = [];
      } else {
        const permissions = await this.permissionRepo.find({
          where: { id: In(updateDto.permissionIds) },
        });

        if (permissions.length !== updateDto.permissionIds.length) {
          throw new BadRequestException('One or more permission IDs are invalid');
        }

        role.permissions = permissions;
      }
    }

    await this.roleRepo.save(role);

    // Reload with relations
    return this.roleRepo.findOne({
      where: { id },
      relations: ['permissions', 'parent'],
    }) as Promise<Role>;
  }

  /**
   * Delete a role
   */
  async remove(id: string, organizationId?: string): Promise<void> {
    const role = await this.findOne(id, organizationId);

    // Check if role is used (via user_roles)
    // Note: Could add validation here to prevent deletion of roles in use
    // For now, delete directly (CASCADE will handle relation cleanup)

    await this.roleRepo.remove(role);
  }

  /**
   * Check if a user has a specific role
   */
  async userHasRole(userId: string, roleName: string, organizationId?: string): Promise<boolean> {
    const where: any = { name: roleName };
    if (organizationId) {
      where.organizationId = organizationId;
    }

    const role = await this.roleRepo.findOne({
      where,
      relations: ['userRoles'],
    });

    if (!role) {
      return false;
    }

    // Check if user has this role
    return role.userRoles?.some((userRole: any) => userRole.userId === userId) ?? false;
  }

  /**
   * Get direct children of a role
   */
  async getChildren(parentId: string, organizationId?: string): Promise<Role[]> {
    const parent = await this.findOne(parentId, organizationId);

    return this.roleRepo.find({
      where: {
        parentId: parent.id,
        organizationId: parent.organizationId,
      },
      relations: ['permissions', 'parent'],
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Get all descendant roles (children, grandchildren, etc.) of a role
   * Uses recursive query for efficient tree traversal
   */
  async getDescendants(parentId: string, organizationId?: string): Promise<Role[]> {
    const parent = await this.findOne(parentId, organizationId);

    // Use recursive CTE for efficient tree traversal (PostgreSQL)
    const result = await this.dataSource.query(
      `
      WITH RECURSIVE descendants AS (
        SELECT id, name, parent_id, organization_id
        FROM roles
        WHERE parent_id = $1
        UNION ALL
        SELECT r.id, r.name, r.parent_id, r.organization_id
        FROM roles r
        INNER JOIN descendants d ON r.parent_id = d.id
      )
      SELECT id FROM descendants
      ORDER BY id
    `,
      [parent.id],
    );

    if (result.length === 0) {
      return [];
    }

    const ids = result.map((r: any) => r.id);
    return this.roleRepo.find({
      where: { id: In(ids) },
      relations: ['permissions', 'parent'],
      order: { createdAt: 'ASC' },
    });
  }

  /**
   * Get effective permissions for a role (including inherited from parent roles)
   */
  async getEffectivePermissions(roleId: string, organizationId?: string): Promise<Permission[]> {
    const role = await this.findOne(roleId, organizationId);

    // Collect all permission IDs from role and its ancestors
    const permissionIds = new Set<string>();

    // Add permissions from the role itself
    if (role.permissions) {
      role.permissions.forEach((perm: Permission) => permissionIds.add(perm.id));
    }

    // Traverse up the hierarchy and collect permissions from parent roles
    let currentRole: Role | null = role;
    const visitedRoleIds = new Set<string>();

    while (currentRole?.parentId && !visitedRoleIds.has(currentRole.id)) {
      visitedRoleIds.add(currentRole.id);

      const parentRole = await this.roleRepo.findOne({
        where: { id: currentRole.parentId },
        relations: ['permissions'],
      });

      if (parentRole && parentRole.permissions) {
        parentRole.permissions.forEach((perm: Permission) => permissionIds.add(perm.id));
      }

      currentRole = parentRole;
    }

    // Fetch all permissions
    if (permissionIds.size === 0) {
      return [];
    }

    return this.permissionRepo.find({
      where: { id: In(Array.from(permissionIds)) },
    });
  }

  /**
   * Check if a role is a descendant of another role (for circular reference prevention)
   */
  private async isDescendant(ancestorId: string, descendantId: string): Promise<boolean> {
    if (ancestorId === descendantId) {
      return false; // Same role
    }

    // Use recursive query to check if descendantId is in the tree under ancestorId
    const result = await this.dataSource.query(
      `
      WITH RECURSIVE descendants AS (
        SELECT id, parent_id
        FROM roles
        WHERE id = $1
        UNION ALL
        SELECT r.id, r.parent_id
        FROM roles r
        INNER JOIN descendants d ON r.parent_id = d.id
      )
      SELECT COUNT(*) as count
      FROM descendants
      WHERE id = $2
    `,
      [ancestorId, descendantId],
    );

    return parseInt(result[0]?.count || '0', 10) > 0;
  }
}

