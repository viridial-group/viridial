import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { BoosterPack } from '../entities/booster-pack.entity';
import { CreateBoosterPackDto } from '../dto/create-booster-pack.dto';
import { UpdateBoosterPackDto } from '../dto/update-booster-pack.dto';

@Injectable()
export class BoosterPackService {
  private readonly logger = new Logger(BoosterPackService.name);

  constructor(
    @InjectRepository(BoosterPack)
    // NOTE: typage assoupli ici car les types TypeORM ne sont pas résolus correctement
    private boosterPackRepo: any,
  ) {}

  /**
   * Create a new booster pack
   */
  async create(createDto: CreateBoosterPackDto): Promise<BoosterPack> {
    // Check uniqueness of name
    const existingBoosterPack = await this.boosterPackRepo.findOne({
      where: { name: createDto.name },
    });

    if (existingBoosterPack) {
      throw new BadRequestException(
        `A booster pack with the name "${createDto.name}" already exists`,
      );
    }

    const boosterPack = this.boosterPackRepo.create({
      name: createDto.name,
      description: createDto.description,
      boosterPackType: createDto.boosterPackType,
      limitType: createDto.limitType,
      limitIncrease: createDto.limitIncrease,
      limitUnit: createDto.limitUnit ?? null,
      monthlyPrice: createDto.monthlyPrice,
      annualPrice: createDto.annualPrice ?? null,
      isActive: createDto.isActive ?? true,
      displayOrder: createDto.displayOrder ?? 0,
      externalCode: createDto.externalCode ?? null,
    });

    return this.boosterPackRepo.save(boosterPack);
  }

  /**
   * Find all booster packs (with optional filters)
   */
  async findAll(filters?: {
    boosterPackType?: string;
    isActive?: boolean;
    limitType?: string;
  }): Promise<BoosterPack[]> {
    const queryBuilder = this.boosterPackRepo
      .createQueryBuilder('boosterPack')
      .orderBy('boosterPack.displayOrder', 'ASC')
      .addOrderBy('boosterPack.name', 'ASC');

    if (filters?.boosterPackType) {
      queryBuilder.where('boosterPack.boosterPackType = :boosterPackType', {
        boosterPackType: filters.boosterPackType,
      });
    }

    if (filters?.isActive !== undefined) {
      queryBuilder.andWhere('boosterPack.isActive = :isActive', {
        isActive: filters.isActive,
      });
    }

    if (filters?.limitType) {
      queryBuilder.andWhere('boosterPack.limitType = :limitType', {
        limitType: filters.limitType,
      });
    }

    return queryBuilder.getMany();
  }

  /**
   * Find a booster pack by ID
   */
  async findOne(id: string): Promise<BoosterPack> {
    const boosterPack = await this.boosterPackRepo.findOne({
      where: { id },
      relations: ['subscriptions'],
    });

    if (!boosterPack) {
      throw new NotFoundException(`Booster pack with ID "${id}" not found`);
    }

    return boosterPack;
  }

  /**
   * Update a booster pack
   */
  async update(id: string, updateDto: UpdateBoosterPackDto): Promise<BoosterPack> {
    const boosterPack = await this.findOne(id);

    // Check uniqueness if name changes
    if (updateDto.name && updateDto.name !== boosterPack.name) {
      const existingBoosterPack = await this.boosterPackRepo.findOne({
        where: { name: updateDto.name },
      });

      if (existingBoosterPack && existingBoosterPack.id !== id) {
        throw new BadRequestException(
          `A booster pack with the name "${updateDto.name}" already exists`,
        );
      }
    }

    // Update fields
    if (updateDto.name !== undefined) boosterPack.name = updateDto.name;
    if (updateDto.description !== undefined) boosterPack.description = updateDto.description;
    if (updateDto.boosterPackType !== undefined)
      boosterPack.boosterPackType = updateDto.boosterPackType;
    if (updateDto.limitType !== undefined) boosterPack.limitType = updateDto.limitType;
    if (updateDto.limitIncrease !== undefined)
      boosterPack.limitIncrease = updateDto.limitIncrease;
    if (updateDto.limitUnit !== undefined) boosterPack.limitUnit = updateDto.limitUnit;
    if (updateDto.monthlyPrice !== undefined) boosterPack.monthlyPrice = updateDto.monthlyPrice;
    if (updateDto.annualPrice !== undefined) boosterPack.annualPrice = updateDto.annualPrice;
    if (updateDto.isActive !== undefined) boosterPack.isActive = updateDto.isActive;
    if (updateDto.displayOrder !== undefined) boosterPack.displayOrder = updateDto.displayOrder;
    if (updateDto.externalCode !== undefined) boosterPack.externalCode = updateDto.externalCode;

    return this.boosterPackRepo.save(boosterPack);
  }

  /**
   * Delete a booster pack
   */
  async remove(id: string): Promise<void> {
    const boosterPack = await this.findOne(id);

    // Note: Deleting a booster pack doesn't delete subscriptions
    // The many-to-many relationship will be cleaned up automatically

    await this.boosterPackRepo.remove(boosterPack);
  }
}

