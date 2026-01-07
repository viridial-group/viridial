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
  Request,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { PropertyService } from '../services/property.service';
import { CreatePropertyDto } from '../dto/create-property.dto';
import { UpdatePropertyDto } from '../dto/update-property.dto';
import { PropertyStatus } from '../entities/property.entity';
// TODO: Implement JWT guard
// import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('properties')
// @UseGuards(JwtAuthGuard) // TODO: Add auth guard
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreatePropertyDto, @Request() req: any) {
    // TODO: Extract userId from JWT token in req.user
    const userId = req.user?.id || createDto.userId; // Temporary fallback
    return this.propertyService.create(createDto, userId);
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
  ) {
    return this.propertyService.findAll(userId, status, limit, offset);
  }

  @Get(':id')
  async findOne(@Param('id') id: string, @Request() req: any) {
    // TODO: Extract userId from JWT token
    const userId = req.user?.id;
    return this.propertyService.findOne(id, userId);
  }

  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdatePropertyDto,
    @Request() req: any,
  ) {
    // TODO: Extract userId from JWT token
    const userId = req.user?.id || updateDto.userId; // Temporary fallback
    if (!userId) {
      throw new Error('User ID required');
    }
    return this.propertyService.update(id, updateDto, userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async delete(@Param('id') id: string, @Request() req: any) {
    // TODO: Extract userId from JWT token
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User ID required');
    }
    await this.propertyService.delete(id, userId);
  }

  @Post(':id/publish')
  async publish(@Param('id') id: string, @Request() req: any) {
    // TODO: Extract userId from JWT token
    const userId = req.user?.id;
    if (!userId) {
      throw new Error('User ID required');
    }
    return this.propertyService.publish(id, userId);
  }
}

