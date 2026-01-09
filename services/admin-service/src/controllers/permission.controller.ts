import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
} from '@nestjs/common';
import { PermissionService } from '../services/permission.service';
import { CreatePermissionDto } from '../dto/create-permission.dto';
import { UpdatePermissionDto } from '../dto/update-permission.dto';
import { Permission } from '../entities/permission.entity';
// TODO: Implémenter JwtAuthGuard et RolesGuard
// import { JwtAuthGuard } from '../guards/jwt-auth.guard';
// import { RolesGuard } from '../guards/roles.guard';

@Controller('api/admin/permissions')
// @UseGuards(JwtAuthGuard, RolesGuard)
export class PermissionController {
  constructor(private readonly permissionService: PermissionService) {}

  @Post()
  async create(@Body() createDto: CreatePermissionDto): Promise<Permission> {
    return this.permissionService.create(createDto);
  }

  @Get()
  async findAll(
    @Query('resource') resource?: string,
    @Query('action') action?: string,
    @Query('search') search?: string,
  ): Promise<Permission[]> {
    const filters: any = {};

    if (resource) filters.resource = resource;
    if (action) filters.action = action;
    if (search) filters.search = search;

    return this.permissionService.findAll(filters);
  }

  @Get('grouped')
  async findAllGrouped(): Promise<Record<string, Permission[]>> {
    return this.permissionService.findAllGroupedByResource();
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Permission> {
    return this.permissionService.findOne(id);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdatePermissionDto,
  ): Promise<Permission> {
    return this.permissionService.update(id, updateDto);
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.permissionService.remove(id);
    return { message: 'Permission deleted successfully' };
  }
}

