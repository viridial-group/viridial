import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  UseGuards,
  ParseUUIDPipe,
} from '@nestjs/common';
import { NeighborhoodService } from '../services/neighborhood.service';
import { CreateNeighborhoodDto } from '../dto/create-neighborhood.dto';
import { UpdateNeighborhoodDto } from '../dto/update-neighborhood.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';

@Controller('neighborhoods')
export class NeighborhoodController {
  constructor(private readonly neighborhoodService: NeighborhoodService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  create(@Body() createDto: CreateNeighborhoodDto) {
    return this.neighborhoodService.create(createDto);
  }

  @Get()
  findAll(
    @Query('city') city?: string,
    @Query('region') region?: string,
    @Query('country') country?: string,
    @Query('limit') limit?: number,
    @Query('offset') offset?: number,
  ) {
    return this.neighborhoodService.findAll({
      city,
      region,
      country,
      limit: limit ? parseInt(limit.toString(), 10) : undefined,
      offset: offset ? parseInt(offset.toString(), 10) : undefined,
    });
  }

  @Get('search')
  search(@Query('q') query: string, @Query('limit') limit?: number) {
    return this.neighborhoodService.search(
      query || '',
      limit ? parseInt(limit.toString(), 10) : 10,
    );
  }

  @Get('nearest')
  findNearest(
    @Query('lat') latitude: number,
    @Query('lng') longitude: number,
    @Query('radius') radiusKm?: number,
  ) {
    return this.neighborhoodService.findNearest(
      parseFloat(latitude.toString()),
      parseFloat(longitude.toString()),
      radiusKm ? parseFloat(radiusKm.toString()) : 5,
    );
  }

  @Get('stats/:id')
  async updateStats(@Param('id', ParseUUIDPipe) id: string) {
    return this.neighborhoodService.updateStats(id);
  }

  @Get(':id')
  findOne(@Param('id', ParseUUIDPipe) id: string) {
    return this.neighborhoodService.findOne(id);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.neighborhoodService.findBySlug(slug);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard)
  update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateDto: UpdateNeighborhoodDto,
  ) {
    return this.neighborhoodService.update(id, updateDto);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard)
  remove(@Param('id', ParseUUIDPipe) id: string) {
    return this.neighborhoodService.remove(id);
  }
}

