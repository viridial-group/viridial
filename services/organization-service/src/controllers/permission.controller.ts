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
import { PermissionService } from '../services/permission.service';
import { ResourceService } from '../services/resource.service';
import { FeatureService } from '../services/feature.service';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UpdatePermissionDto } from '../dto/update-permission.dto';
import { CreateResourceDto } from '../dto/create-resource.dto';
import { UpdateResourceDto } from '../dto/update-resource.dto';
import { CreateFeatureDto } from '../dto/create-feature.dto';
import { UpdateFeatureDto } from '../dto/update-feature.dto';
import { Permission } from '../entities/permission.entity';
import { Resource } from '../entities/resource.entity';
import { Feature } from '../entities/feature.entity';

@Controller('api/organizations/permissions')
export class PermissionController {
  constructor(
    private readonly permissionService: PermissionService,
    private readonly resourceService: ResourceService,
    private readonly featureService: FeatureService,
  ) {}

  // ============ Permission Endpoints ============

  /**
   * Create a new permission
   * POST /permissions
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreatePermissionDto): Promise<Permission> {
    return this.permissionService.create(createDto);
  }

  /**
   * Get all permissions
   * GET /permissions
   */
  @Get()
  async findAll(
    @Query('resourceId') resourceId?: string,
    @Query('resource') resource?: string,
    @Query('action') action?: string,
    @Query('search') search?: string,
  ): Promise<Permission[]> {
    const filters: any = {};

    if (resourceId) filters.resourceId = resourceId;
    if (resource) filters.resource = resource;
    if (action) filters.action = action;
    if (search) filters.search = search;

    return this.permissionService.findAll(filters);
  }

  /**
   * Get all permissions grouped by resource
   * GET /permissions/grouped
   */
  @Get('grouped')
  async findAllGrouped(): Promise<Record<string, Permission[]>> {
    return this.permissionService.findAllGroupedByResource();
  }

  // ============ Resource Endpoints ============

  /**
   * Create a new resource
   * POST /permissions/resources
   */
  @Post('resources')
  @HttpCode(HttpStatus.CREATED)
  async createResource(@Body() createDto: CreateResourceDto): Promise<Resource> {
    return this.resourceService.create(createDto);
  }

  /**
   * Get all resources
   * GET /permissions/resources
   */
  @Get('resources')
  async findAllResources(
    @Query('category') category?: string,
    @Query('isActive') isActive?: string,
    @Query('search') search?: string,
  ): Promise<Resource[]> {
    const filters: any = {};

    if (category) filters.category = category;
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    if (search) filters.search = search;

    return this.resourceService.findAll(filters);
  }

  /**
   * Get a resource by ID
   * GET /permissions/resources/:id
   */
  @Get('resources/:id')
  async findOneResource(@Param('id') id: string): Promise<Resource> {
    return this.resourceService.findOne(id);
  }

  /**
   * Update a resource
   * PUT /permissions/resources/:id
   */
  @Put('resources/:id')
  async updateResource(
    @Param('id') id: string,
    @Body() updateDto: UpdateResourceDto,
  ): Promise<Resource> {
    return this.resourceService.update(id, updateDto);
  }

  /**
   * Delete a resource
   * DELETE /permissions/resources/:id
   */
  @Delete('resources/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeResource(@Param('id') id: string): Promise<void> {
    await this.resourceService.remove(id);
  }

  // ============ Feature Endpoints ============

  /**
   * Create a new feature
   * POST /permissions/features
   */
  @Post('features')
  @HttpCode(HttpStatus.CREATED)
  async createFeature(@Body() createDto: CreateFeatureDto): Promise<Feature> {
    return this.featureService.create(createDto);
  }

  /**
   * Get all features
   * GET /permissions/features
   */
  @Get('features')
  async findAllFeatures(
    @Query('category') category?: string,
    @Query('isActive') isActive?: string,
    @Query('search') search?: string,
  ): Promise<Feature[]> {
    const filters: any = {};

    if (category) filters.category = category;
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    if (search) filters.search = search;

    return this.featureService.findAll(filters);
  }

  /**
   * Get a feature by ID
   * GET /permissions/features/:id
   */
  @Get('features/:id')
  async findOneFeature(@Param('id') id: string): Promise<Feature> {
    return this.featureService.findOne(id);
  }

  /**
   * Update a feature
   * PUT /permissions/features/:id
   */
  @Put('features/:id')
  async updateFeature(
    @Param('id') id: string,
    @Body() updateDto: UpdateFeatureDto,
  ): Promise<Feature> {
    return this.featureService.update(id, updateDto);
  }

  /**
   * Delete a feature
   * DELETE /permissions/features/:id
   */
  @Delete('features/:id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async removeFeature(@Param('id') id: string): Promise<void> {
    await this.featureService.remove(id);
  }

  // ============ Permission Endpoints (must come after specific routes) ============

  /**
   * Get a permission by ID
   * GET /permissions/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Permission> {
    return this.permissionService.findOne(id);
  }

  /**
   * Update a permission
   * PUT /permissions/:id
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdatePermissionDto,
  ): Promise<Permission> {
    return this.permissionService.update(id, updateDto);
  }

  /**
   * Delete a permission
   * DELETE /permissions/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.permissionService.remove(id);
  }
}

