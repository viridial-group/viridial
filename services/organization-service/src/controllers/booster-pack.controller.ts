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
import { BoosterPackService } from '../services/booster-pack.service';
import { CreateBoosterPackDto } from '../dto/create-booster-pack.dto';
import { UpdateBoosterPackDto } from '../dto/update-booster-pack.dto';
import { BoosterPack } from '../entities/booster-pack.entity';

@Controller('api/organizations/booster-packs')
export class BoosterPackController {
  constructor(private readonly boosterPackService: BoosterPackService) {}

  /**
   * Create a new booster pack
   * POST /booster-packs
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateBoosterPackDto): Promise<BoosterPack> {
    return this.boosterPackService.create(createDto);
  }

  /**
   * Get all booster packs
   * GET /booster-packs
   */
  @Get()
  async findAll(
    @Query('boosterPackType') boosterPackType?: string,
    @Query('isActive') isActive?: string,
    @Query('limitType') limitType?: string,
  ): Promise<BoosterPack[]> {
    const filters: any = {};
    if (boosterPackType) filters.boosterPackType = boosterPackType;
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    if (limitType) filters.limitType = limitType;
    return this.boosterPackService.findAll(filters);
  }

  /**
   * Get a booster pack by ID
   * GET /booster-packs/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<BoosterPack> {
    return this.boosterPackService.findOne(id);
  }

  /**
   * Update a booster pack
   * PUT /booster-packs/:id
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateBoosterPackDto,
  ): Promise<BoosterPack> {
    return this.boosterPackService.update(id, updateDto);
  }

  /**
   * Delete a booster pack
   * DELETE /booster-packs/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.boosterPackService.remove(id);
  }
}

