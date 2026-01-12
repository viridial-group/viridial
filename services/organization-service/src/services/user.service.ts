import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ConflictException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { In, Like } from 'typeorm';
import { User } from '../entities/user.entity';
import { Role } from '../entities/role.entity';
import { UserRole } from '../entities/user-role.entity';
import { CreateUserDto } from '../dto/create-user.dto';
import { UpdateUserDto } from '../dto/update-user.dto';
import { UserFiltersDto } from '../dto/user-filters.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class UserService {
  private readonly logger = new Logger(UserService.name);

  constructor(
    @InjectRepository(User)
    // NOTE: typage assoupli ici car les types TypeORM ne sont pas résolus correctement
    private userRepo: any,
    @InjectRepository(Role)
    private roleRepo: any,
    @InjectRepository(UserRole)
    private userRoleRepo: any,
  ) {}

  /**
   * Create a new user
   */
  async create(createDto: CreateUserDto, organizationId?: string): Promise<User> {
    // Check if email already exists
    const existingUser = await this.userRepo.findOne({
      where: { email: createDto.email },
    });

    if (existingUser) {
      throw new ConflictException(`User with email "${createDto.email}" already exists`);
    }

    // Hash password
    const passwordHash = await bcrypt.hash(createDto.password, 10);

    // Create user entity
    const user = this.userRepo.create({
      email: createDto.email,
      passwordHash,
      firstName: createDto.firstName,
      lastName: createDto.lastName,
      phone: createDto.phone,
      role: createDto.role || 'user', // Legacy role field
      organizationId: createDto.organizationId ?? organizationId ?? null,
      externalCode: createDto.externalCode,
      isActive: true,
      emailVerified: false,
    });

    // Save user first
    const savedUser = await this.userRepo.save(user);

    // Assign roles if provided
    if (createDto.roleIds && createDto.roleIds.length > 0) {
      const roles = await this.roleRepo.find({
        where: { id: In(createDto.roleIds) },
      });

      if (roles.length !== createDto.roleIds.length) {
        throw new BadRequestException('One or more role IDs are invalid');
      }

      // Create UserRole entries
      const userRoles = roles.map((role: Role) =>
        this.userRoleRepo.create({
          userId: savedUser.id,
          roleId: role.id,
        }),
      );

      await this.userRoleRepo.save(userRoles);
    }

    // Reload with relations
    return this.findOne(savedUser.id, organizationId);
  }

  /**
   * Find all users (with optional filters)
   */
  async findAll(filters?: UserFiltersDto, organizationId?: string): Promise<User[]> {
    const where: any = {};

    if (filters?.organizationId || organizationId) {
      where.organizationId = filters?.organizationId || organizationId || null;
    }

    if (filters?.role) {
      where.role = filters.role;
    }

    if (filters?.isActive !== undefined) {
      where.isActive = filters.isActive;
    }

    const queryBuilder = this.userRepo
      .createQueryBuilder('user')
      .leftJoinAndSelect('user.userRoles', 'userRole')
      .leftJoinAndSelect('userRole.role', 'role')
      .leftJoinAndSelect('role.permissions', 'permission')
      .leftJoinAndSelect('user.organization', 'organization');

    if (where.organizationId !== undefined) {
      queryBuilder.where('user.organizationId = :organizationId', { organizationId: where.organizationId });
    }

    if (where.role) {
      queryBuilder.andWhere('user.role = :role', { role: where.role });
    }

    if (where.isActive !== undefined) {
      queryBuilder.andWhere('user.isActive = :isActive', { isActive: where.isActive });
    }

    if (filters?.search) {
      queryBuilder.andWhere(
        '(user.email ILIKE :search OR user.firstName ILIKE :search OR user.lastName ILIKE :search)',
        { search: `%${filters.search}%` },
      );
    }

    queryBuilder.orderBy('user.createdAt', 'DESC');

    return queryBuilder.getMany();
  }

  /**
   * Find a user by ID
   */
  async findOne(id: string, organizationId?: string): Promise<User> {
    const where: any = { id };
    if (organizationId !== undefined) {
      where.organizationId = organizationId || null;
    }

    const user = await this.userRepo.findOne({
      where,
      relations: ['userRoles', 'userRoles.role', 'userRoles.role.permissions', 'organization'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID "${id}" not found`);
    }

    return user;
  }

  /**
   * Find a user by email
   */
  async findByEmail(email: string): Promise<User | null> {
    return this.userRepo.findOne({
      where: { email },
      relations: ['userRoles', 'userRoles.role', 'userRoles.role.permissions', 'organization'],
    });
  }

  /**
   * Update a user
   */
  async update(id: string, updateDto: UpdateUserDto, organizationId?: string): Promise<User> {
    const user = await this.findOne(id, organizationId);

    // Check if email is being changed and if it already exists
    if (updateDto.email && updateDto.email !== user.email) {
      const existingUser = await this.userRepo.findOne({
        where: { email: updateDto.email },
      });

      if (existingUser && existingUser.id !== id) {
        throw new ConflictException(`User with email "${updateDto.email}" already exists`);
      }
    }

    // Update user fields
    Object.assign(user, {
      email: updateDto.email,
      firstName: updateDto.firstName,
      lastName: updateDto.lastName,
      phone: updateDto.phone,
      role: updateDto.role,
      organizationId: updateDto.organizationId !== undefined ? updateDto.organizationId : user.organizationId,
      externalCode: updateDto.externalCode,
      isActive: updateDto.isActive !== undefined ? updateDto.isActive : user.isActive,
      emailVerified: updateDto.emailVerified !== undefined ? updateDto.emailVerified : user.emailVerified,
    });

    await this.userRepo.save(user);

    // Update roles if provided
    if (updateDto.roleIds !== undefined) {
      // Remove existing user roles
      await this.userRoleRepo.delete({ userId: id });

      // Add new user roles
      if (updateDto.roleIds.length > 0) {
        const roles = await this.roleRepo.find({
          where: { id: In(updateDto.roleIds) },
        });

        if (roles.length !== updateDto.roleIds.length) {
          throw new BadRequestException('One or more role IDs are invalid');
        }

        const userRoles = roles.map((role: Role) =>
          this.userRoleRepo.create({
            userId: id,
            roleId: role.id,
          }),
        );

        await this.userRoleRepo.save(userRoles);
      }
    }

    // Reload with relations
    return this.findOne(id, organizationId);
  }

  /**
   * Delete a user
   */
  async remove(id: string, organizationId?: string): Promise<void> {
    const user = await this.findOne(id, organizationId);

    // Delete user roles first (cascade should handle this, but being explicit)
    await this.userRoleRepo.delete({ userId: id });

    // Delete user
    await this.userRepo.remove(user);
  }

  /**
   * Assign roles to a user
   */
  async assignRoles(userId: string, roleIds: string[]): Promise<User> {
    const user = await this.findOne(userId);

    if (roleIds.length === 0) {
      // Remove all roles
      await this.userRoleRepo.delete({ userId });
      return this.findOne(userId);
    }

    // Validate roles exist
    const roles = await this.roleRepo.find({
      where: { id: In(roleIds) },
    });

    if (roles.length !== roleIds.length) {
      throw new BadRequestException('One or more role IDs are invalid');
    }

    // Remove existing roles
    await this.userRoleRepo.delete({ userId });

    // Create new user roles
    const userRoles = roles.map((role: Role) =>
      this.userRoleRepo.create({
        userId,
        roleId: role.id,
      }),
    );

    await this.userRoleRepo.save(userRoles);

    return this.findOne(userId);
  }

  /**
   * Remove roles from a user
   */
  async removeRoles(userId: string, roleIds: string[]): Promise<User> {
    await this.findOne(userId); // Verify user exists

    await this.userRoleRepo.delete({
      userId,
      roleId: In(roleIds),
    });

    return this.findOne(userId);
  }

  /**
   * Update user password
   */
  async updatePassword(userId: string, newPassword: string): Promise<void> {
    const user = await this.findOne(userId);

    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.passwordHash = passwordHash;

    await this.userRepo.save(user);
  }

  /**
   * Verify user password
   */
  async verifyPassword(userId: string, password: string): Promise<boolean> {
    const user = await this.findOne(userId);

    return bcrypt.compare(password, user.passwordHash);
  }
}

