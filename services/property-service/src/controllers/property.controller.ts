import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  UseGuards,
  HttpCode,
  HttpStatus,
  ForbiddenException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { PropertyService } from '../services/property.service';
import { CreatePropertyDto } from '../dto/create-property.dto';
import { UpdatePropertyDto } from '../dto/update-property.dto';
import { PropertyStatus } from '../entities/property.entity';
import { FlagPropertyDto } from '../dto/flag-property.dto';
import { ModeratePropertyDto } from '../dto/moderate-property.dto';
import { BulkImportDto } from '../dto/bulk-import.dto';
import { BulkUpdatePropertyDto } from '../dto/bulk-update.dto';
import { BulkDeletePropertyDto } from '../dto/bulk-update.dto';
import { BulkStatusUpdateDto } from '../dto/bulk-update.dto';
import { FlagStatus } from '../entities/property-flag.entity';
import { ImportService } from '../services/import.service';
import { SchemaOrgService } from '../services/schema-org.service';
import { PropertyStatisticsService } from '../services/property-statistics.service';
import { SearchPropertyDto } from '../dto/search-property.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { AdminGuard } from '../guards/admin.guard';
import { User } from '../decorators/user.decorator';

interface AuthenticatedUser {
  id: string;
  email: string;
}

@Controller('properties')
export class PropertyController {
  constructor(
    private readonly propertyService: PropertyService,
    private readonly importService: ImportService,
    private readonly schemaOrgService: SchemaOrgService,
    private readonly statisticsService: PropertyStatisticsService,
  ) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreatePropertyDto, @User() user: AuthenticatedUser) {
    // Extract userId from authenticated JWT token
    // User ID from DTO must match authenticated user ID
    if (createDto.userId && createDto.userId !== user.id) {
      throw new ForbiddenException('Cannot create property for another user');
    }
    // Use authenticated user ID (override DTO userId for security)
    const userId = user.id;
    return this.propertyService.create({ ...createDto, userId }, userId);
  }

  @Get('health')
  @HttpCode(HttpStatus.OK)
  health() {
    return { status: 'ok', service: 'property-service' };
  }

  @Get()
  async findAll(
    @Query('userId') userId?: string,
    @Query('status') status?: PropertyStatus,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('offset', new ParseIntPipe({ optional: true })) offset?: number,
    @User() user?: AuthenticatedUser,
  ) {
    // If user is authenticated, filter by their userId if no userId query param
    // If not authenticated, allow public listing search (for listed properties only)
    const filterUserId = userId || (user ? user.id : undefined);
    const filterStatus = status || (user ? undefined : PropertyStatus.LISTED); // Public users only see listed properties
    
    return this.propertyService.findAll(filterUserId, filterStatus, limit, offset);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @User() user?: AuthenticatedUser) {
    // Allow public access to listed properties, require auth for draft/review
    const userId = user?.id;
    // Always load translations for public display
    return this.propertyService.findOne(id, userId, true);
  }

  @Put(':id')
  @UseGuards(JwtAuthGuard)
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdatePropertyDto,
    @User() user: AuthenticatedUser,
  ) {
    // Extract userId from authenticated JWT token
    const userId = user.id;
    return this.propertyService.update(id, updateDto, userId);
  }

  /**
   * Soft delete a property (mark as deleted)
   * DELETE /properties/:id
   */
  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string, @User() user: AuthenticatedUser) {
    await this.propertyService.delete(id, user.id);
  }

  /**
   * Restore a soft-deleted property
   * POST /properties/:id/restore
   */
  @Post(':id/restore')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async restore(@Param('id') id: string, @User() user: AuthenticatedUser) {
    return this.propertyService.restore(id, user.id);
  }

  /**
   * Hard delete a property (permanent removal - admin only)
   * DELETE /properties/:id/hard
   */
  @Delete(':id/hard')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async hardDelete(@Param('id') id: string) {
    await this.propertyService.hardDelete(id);
  }

  @Post(':id/publish')
  @UseGuards(JwtAuthGuard)
  async publish(@Param('id') id: string, @User() user: AuthenticatedUser) {
    // Extract userId from authenticated JWT token
    const userId = user.id;
    return this.propertyService.publish(id, userId);
  }

  /**
   * Nearby search endpoint - called by Geolocation Service
   * GET /properties/search/nearby?latitude=X&longitude=Y&radiusKm=Z&limit=20&offset=0&status=listed
   */
  @Get('search/nearby')
  async searchNearby(
    @Query('latitude') latitude: string,
    @Query('longitude') longitude: string,
    @Query('radiusKm') radiusKm: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('status') status?: string,
  ) {
    if (!latitude || !longitude || !radiusKm) {
      throw new BadRequestException('latitude, longitude, and radiusKm are required');
    }

    const propertyStatus = status ? (status as PropertyStatus) : undefined;
    return this.propertyService.findNearby(
      Number(latitude),
      Number(longitude),
      Number(radiusKm),
      limit ? Number(limit) : 20,
      offset ? Number(offset) : 0,
      propertyStatus,
    );
  }

  /**
   * Flag a property for moderation
   * POST /properties/:id/flag
   */
  @Post(':id/flag')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async flagProperty(
    @Param('id') id: string,
    @Body() flagDto: FlagPropertyDto,
    @User() user: AuthenticatedUser,
  ) {
    return this.propertyService.flagProperty(id, flagDto.reason, user.id);
  }

  /**
   * Get moderation queue (admin only)
   * GET /properties/moderation/queue?status=pending&limit=20&offset=0
   */
  @Get('moderation/queue')
  @UseGuards(JwtAuthGuard, AdminGuard)
  async getModerationQueue(
    @Query('status') status?: FlagStatus,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('offset', new ParseIntPipe({ optional: true })) offset?: number,
  ) {
    return this.propertyService.getModerationQueue(status, limit, offset);
  }

  /**
   * Moderate a flagged property (admin only)
   * POST /properties/:id/moderate
   */
  @Post(':id/moderate')
  @UseGuards(JwtAuthGuard, AdminGuard)
  @HttpCode(HttpStatus.OK)
  async moderateProperty(
    @Param('id') id: string,
    @Body() moderationDto: ModeratePropertyDto,
    @User() admin: AuthenticatedUser,
  ) {
    return this.propertyService.moderateProperty(
      id,
      moderationDto.action,
      moderationDto.reason,
      admin.id,
    );
  }

  /**
   * Bulk import properties from JSON array
   * POST /properties/import
   */
  @Post('import')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.ACCEPTED)
  async bulkImport(
    @Body() importDto: BulkImportDto,
    @User() user: AuthenticatedUser,
  ) {
    const job = await this.importService.createImportJob(
      importDto.properties,
      user.id,
      importDto.fileName,
    );
    return {
      jobId: job.id,
      status: job.status,
      message: 'Import job created and processing',
    };
  }

  /**
   * Get import job status
   * GET /properties/import/:jobId
   */
  @Get('import/:jobId')
  @UseGuards(JwtAuthGuard)
  async getImportStatus(
    @Param('jobId') jobId: string,
    @User() user: AuthenticatedUser,
  ) {
    return this.importService.getImportJobStatus(jobId, user.id);
  }

  /**
   * List import jobs for user
   * GET /properties/import
   */
  @Get('import')
  @UseGuards(JwtAuthGuard)
  async listImports(
    @User() user: AuthenticatedUser,
    @Query('limit', new ParseIntPipe({ optional: true })) limit?: number,
    @Query('offset', new ParseIntPipe({ optional: true })) offset?: number,
  ) {
    return this.importService.listImportJobs(user.id, limit, offset);
  }

  /**
   * Advanced search with multiple filters
   * GET /properties/search?minPrice=100000&maxPrice=500000&city=Paris&type=apartment
   */
  @Get('search')
  async search(
    @Query() searchDto: SearchPropertyDto,
    @User() user?: AuthenticatedUser,
  ) {
    return this.propertyService.search(searchDto, user?.id);
  }

  /**
   * Get property statistics
   * GET /properties/statistics
   */
  @Get('statistics')
  @UseGuards(JwtAuthGuard)
  async getStatistics(@User() user: AuthenticatedUser) {
    return this.statisticsService.getStatistics(user.id);
  }

  /**
   * Get property statistics for date range
   * GET /properties/statistics/range?startDate=2024-01-01&endDate=2024-12-31
   */
  @Get('statistics/range')
  @UseGuards(JwtAuthGuard)
  async getStatisticsByDateRange(
    @Query('startDate') startDate: string,
    @Query('endDate') endDate: string,
    @User() user: AuthenticatedUser,
  ) {
    if (!startDate || !endDate) {
      throw new BadRequestException('startDate and endDate are required');
    }
    return this.statisticsService.getStatisticsByDateRange(
      new Date(startDate),
      new Date(endDate),
      user.id,
    );
  }

  /**
   * Bulk update properties
   * PUT /properties/bulk/update
   */
  @Put('bulk/update')
  @UseGuards(JwtAuthGuard)
  async bulkUpdate(
    @Body() bulkUpdateDto: BulkUpdatePropertyDto,
    @User() user: AuthenticatedUser,
  ) {
    return this.propertyService.bulkUpdate(
      bulkUpdateDto.propertyIds,
      bulkUpdateDto.updateData || {},
      user.id,
    );
  }

  /**
   * Bulk delete properties
   * DELETE /properties/bulk/delete
   */
  @Delete('bulk/delete')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  async bulkDelete(
    @Body() bulkDeleteDto: BulkDeletePropertyDto,
    @User() user: AuthenticatedUser,
  ) {
    return this.propertyService.bulkDelete(
      bulkDeleteDto.propertyIds,
      user.id,
      bulkDeleteDto.hardDelete || false,
    );
  }

  /**
   * Bulk status update
   * PUT /properties/bulk/status
   */
  @Put('bulk/status')
  @UseGuards(JwtAuthGuard)
  async bulkStatusUpdate(
    @Body() bulkStatusDto: BulkStatusUpdateDto,
    @User() user: AuthenticatedUser,
  ) {
    return this.propertyService.bulkStatusUpdate(
      bulkStatusDto.propertyIds,
      bulkStatusDto.status,
      user.id,
    );
  }

  /**
   * Get Schema.org JSON-LD for SEO
   * GET /properties/:id/schema
   */
  @Get(':id/schema')
  async getSchemaOrg(@Param('id') id: string) {
    const property = await this.propertyService.findOne(id);
    if (!property) {
      throw new NotFoundException(`Property with ID ${id} not found`);
    }

    // Load translations if not already loaded
    if (!property.translations || property.translations.length === 0) {
      // Reload with translations
      const propertyWithTranslations = await this.propertyService.findOne(id);
      if (!propertyWithTranslations) {
        throw new NotFoundException(`Property with ID ${id} not found`);
      }
      return this.schemaOrgService.generateSchemaOrg(
        propertyWithTranslations,
        propertyWithTranslations.translations || [],
      );
    }

    return this.schemaOrgService.generateSchemaOrg(
      property,
      property.translations,
    );
  }
}

