import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Patch,
  Body,
  Param,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
} from '@nestjs/common';
import { OrganizationService } from '../services/organization.service';
import { CreateOrganizationDto } from '../dto/create-organization.dto';
import { UpdateOrganizationDto } from '../dto/update-organization.dto';
import { FilterOrganizationDto } from '../dto/filter-organization.dto';
import {
  BulkDeleteOrganizationsDto,
  BulkUpdateOrganizationsDto,
  ChangeParentDto,
} from '../dto/bulk-organization.dto';
// import { JwtAuthGuard } from '../guards/jwt-auth.guard'; // TODO: Add authentication
// import { User } from '../decorators/user.decorator'; // TODO: Add user decorator

// interface AuthenticatedUser {
//   id: string;
//   email: string;
//   organizationId?: string;
// }

@Controller('organizations')
// @UseGuards(JwtAuthGuard) // TODO: Enable authentication
export class OrganizationController {
  constructor(private readonly organizationService: OrganizationService) {}

  /**
   * Health check endpoint
   */
  @Get('health')
  @HttpCode(HttpStatus.OK)
  health() {
    return { status: 'ok', service: 'organization-service', timestamp: new Date().toISOString() };
  }

  /**
   * Get all organizations with filters, sorting, and pagination
   * GET /organizations?page=1&limit=20&search=...&plan=...&isActive=true&sortBy=name&sortOrder=ASC
   */
  @Get()
  async findAll(@Query() filterDto: FilterOrganizationDto) {
    const result = await this.organizationService.findAll(filterDto);
    // Transform to standardized API response format
    return {
      data: result.organizations,
      meta: {
        page: result.page,
        limit: result.limit,
        total: result.total,
        totalPages: Math.ceil(result.total / result.limit),
      },
    };
  }

  /**
   * Get statistics for organizations
   * GET /organizations/statistics
   */
  @Get('statistics')
  async getStatistics() {
    return this.organizationService.getStatistics();
  }

  /**
   * Get organization by ID with all relations
   * GET /organizations/:id
   */
  @Get(':id')
  async findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.organizationService.findById(id);
  }

  /**
   * Get all sub-organizations (descendants) of an organization
   * GET /organizations/:id/sub-organizations
   */
  @Get(':id/sub-organizations')
  async getSubOrganizations(@Param('id', ParseUUIDPipe) id: string) {
    return this.organizationService.getSubOrganizations(id);
  }

  /**
   * Create a new organization
   * POST /organizations
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Body() createDto: CreateOrganizationDto,
    // @User() user: AuthenticatedUser, // TODO: Add user authentication
  ) {
    // const userId = user?.id;
    return this.organizationService.create(createDto);
  }

  /**
   * Update an organization
   * PUT /organizations/:id
   */
  @Put(':id')
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateOrganizationDto,
    // @User() user: AuthenticatedUser, // TODO: Add user authentication
  ) {
    // const userId = user?.id;
    return this.organizationService.update(id, updateDto);
  }

  /**
   * Partial update an organization (PATCH)
   * PATCH /organizations/:id
   */
  @Patch(':id')
  async partialUpdate(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateOrganizationDto,
    // @User() user: AuthenticatedUser, // TODO: Add user authentication
  ) {
    // const userId = user?.id;
    return this.organizationService.update(id, updateDto);
  }

  /**
   * Delete an organization
   * DELETE /organizations/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id', ParseUUIDPipe) id: string) {
    await this.organizationService.delete(id);
    return { message: 'Organization deleted successfully' };
  }

  /**
   * Bulk delete organizations
   * POST /organizations/bulk/delete
   */
  @Post('bulk/delete')
  @HttpCode(HttpStatus.OK)
  async bulkDelete(@Body() dto: BulkDeleteOrganizationsDto) {
    return this.organizationService.bulkDelete(dto);
  }

  /**
   * Bulk update organizations
   * POST /organizations/bulk/update
   */
  @Post('bulk/update')
  @HttpCode(HttpStatus.OK)
  async bulkUpdate(@Body() dto: BulkUpdateOrganizationsDto) {
    return this.organizationService.bulkUpdate(dto);
  }

  /**
   * Change parent for multiple organizations
   * POST /organizations/bulk/change-parent
   */
  @Post('bulk/change-parent')
  @HttpCode(HttpStatus.OK)
  async changeParent(@Body() dto: ChangeParentDto) {
    return this.organizationService.changeParent(dto);
  }
}
