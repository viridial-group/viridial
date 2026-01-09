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
  Request,
} from '@nestjs/common';
import { RoleService } from '../services/role.service';
import { CreateRoleDto } from '../dto/create-role.dto';
import { UpdateRoleDto } from '../dto/update-role.dto';
import { Role } from '../entities/role.entity';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { RolesGuard, Roles } from '../guards/roles.guard';
import { MultiTenantGuard } from '../guards/multi-tenant.guard';

@Controller('api/admin/roles')
@UseGuards(JwtAuthGuard, MultiTenantGuard)
export class RoleController {
  constructor(private readonly roleService: RoleService) {}

  @Post()
  @Roles('admin', 'owner')
  @UseGuards(RolesGuard)
  async create(
    @Body() createDto: CreateRoleDto,
    @Request() req: Express.Request,
  ): Promise<Role> {
    // Récupérer organizationId depuis le token JWT ou le body
    const organizationId = createDto.organizationId ?? req.user?.organizationId;
    return this.roleService.create(createDto, organizationId);
  }

  @Get()
  async findAll(
    @Query('organizationId') organizationId?: string,
    @Query('isActive') isActive?: string,
    @Query('search') search?: string,
    @Request() req: any,
  ): Promise<Role[]> {
    const filters: any = {};

    if (organizationId) {
      filters.organizationId = organizationId;
    } else if (req.user?.organizationId) {
      // Si pas de filtre spécifique, utiliser l'org de l'utilisateur
      filters.organizationId = req.user.organizationId;
    }

    if (isActive !== undefined) {
      filters.isActive = isActive === 'true';
    }

    if (search) {
      filters.search = search;
    }

    return this.roleService.findAll(filters);
  }

  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<Role> {
    const organizationId = req.user?.organizationId;
    return this.roleService.findOne(id, organizationId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateRoleDto,
    @Request() req: any,
  ): Promise<Role> {
    const organizationId = req.user?.organizationId;
    return this.roleService.update(id, updateDto, organizationId);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: string,
    @Request() req: any,
  ): Promise<{ message: string }> {
    const organizationId = req.user?.organizationId;
    await this.roleService.remove(id, organizationId);
    return { message: 'Role deleted successfully' };
  }
}

