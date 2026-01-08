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
} from '@nestjs/common';
import { PropertyService } from '../services/property.service';
import { CreatePropertyDto } from '../dto/create-property.dto';
import { UpdatePropertyDto } from '../dto/update-property.dto';
import { PropertyStatus } from '../entities/property.entity';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { User } from '../decorators/user.decorator';

interface AuthenticatedUser {
  id: string;
  email: string;
}

@Controller('properties')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

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
    return this.propertyService.findOne(id, userId);
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

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string, @User() user: AuthenticatedUser) {
    // Extract userId from authenticated JWT token
    const userId = user.id;
    await this.propertyService.delete(id, userId);
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
}

