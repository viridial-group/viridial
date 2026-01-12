import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { RoleService } from '../services/role.service';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { Role } from '../entities/role.entity';
import { Permission } from '../entities/permission.entity';

@Controller('api/organizations/roles')
export class RoleController {
  constructor(
    private readonly roleService: RoleService,
  ) {}

  // ============ Role Endpoints ============

  /**
   * Create a new role
   * POST /roles
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateRoleDto): Promise<Role> {
    return this.roleService.create(createDto);
  }

  /**
   * Get all roles
   * GET /roles
   */
  @Get()
  async findAll(
    @Query('organizationId') organizationId?: string,
    @Query('isActive') isActive?: string,
    @Query('search') search?: string,
  ): Promise<Role[]> {
    const filters: any = {};

    if (organizationId) {
      filters.organizationId = organizationId;
    }

    if (isActive !== undefined) {
      filters.isActive = isActive === 'true';
    }

    if (search) {
      filters.search = search;
    }

    return this.roleService.findAll(filters);
  }

  /**
   * Get a role by ID
   * GET /roles/:id
   */
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Query('organizationId') organizationId?: string,
  ): Promise<Role> {
    return this.roleService.findOne(id, organizationId);
  }

  /**
   * Update a role
   * PUT /roles/:id
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateRoleDto,
    @Query('organizationId') organizationId?: string,
  ): Promise<Role> {
    return this.roleService.update(id, updateDto, organizationId);
  }

  /**
   * Delete a role
   * DELETE /roles/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(
    @Param('id') id: string,
    @Query('organizationId') organizationId?: string,
  ): Promise<void> {
    await this.roleService.remove(id, organizationId);
  }

  /**
   * Get direct children of a role
   * GET /roles/:id/children
   */
  @Get(':id/children')
  async getChildren(
    @Param('id') id: string,
    @Query('organizationId') organizationId?: string,
  ): Promise<Role[]> {
    return this.roleService.getChildren(id, organizationId);
  }

  /**
   * Get all descendant roles (children, grandchildren, etc.) of a role
   * GET /roles/:id/descendants
   */
  @Get(':id/descendants')
  async getDescendants(
    @Param('id') id: string,
    @Query('organizationId') organizationId?: string,
  ): Promise<Role[]> {
    return this.roleService.getDescendants(id, organizationId);
  }

  /**
   * Get effective permissions for a role (including inherited from parent roles)
   * GET /roles/:id/effective-permissions
   */
  @Get(':id/effective-permissions')
  async getEffectivePermissions(
    @Param('id') id: string,
    @Query('organizationId') organizationId?: string,
  ): Promise<Permission[]> {
    return this.roleService.getEffectivePermissions(id, organizationId);
  }

}

