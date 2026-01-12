import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Plan } from '../entities/plan.entity';
import { PlanFeature } from '../entities/plan-feature.entity';
import { PlanLimit } from '../entities/plan-limit.entity';
import { CreatePlanDto, CreatePlanFeatureDto, CreatePlanLimitDto } from '../dto/create-plan.dto';
import { UpdatePlanDto } from '../dto/update-plan.dto';

@Injectable()
export class PlanService {
  private readonly logger = new Logger(PlanService.name);

  constructor(
    @InjectRepository(Plan)
    // NOTE: typage assoupli ici car les types TypeORM ne sont pas résolus correctement
    private planRepo: any,
    @InjectRepository(PlanFeature)
    private planFeatureRepo: any,
    @InjectRepository(PlanLimit)
    private planLimitRepo: any,
  ) {}

  /**
   * Create a new plan with features and limits
   */
  async create(createDto: CreatePlanDto): Promise<Plan> {
    // Check if plan with same type and billing period already exists
    const existingPlan = await this.planRepo.findOne({
      where: {
        planType: createDto.planType,
        billingPeriod: createDto.billingPeriod,
      },
    });

    if (existingPlan) {
      throw new BadRequestException(
        `A plan of type "${createDto.planType}" with billing period "${createDto.billingPeriod}" already exists`,
      );
    }

    // Create plan
    const plan = this.planRepo.create({
      planType: createDto.planType,
      name: createDto.name,
      description: createDto.description,
      billingPeriod: createDto.billingPeriod,
      standardPrice: createDto.standardPrice,
      singleAppPrice: createDto.singleAppPrice ?? null,
      displayOrder: createDto.displayOrder ?? 0,
      isActive: createDto.isActive ?? true,
      isPopular: createDto.isPopular ?? false,
      isFeatured: createDto.isFeatured ?? false,
      externalCode: createDto.externalCode ?? null,
    });

    const savedPlan = await this.planRepo.save(plan);

    // Create features if provided
    if (createDto.features && createDto.features.length > 0) {
      const features = createDto.features.map((featureDto) =>
        this.planFeatureRepo.create({
          planId: savedPlan.id,
          name: featureDto.name,
          description: featureDto.description,
          category: featureDto.category as any,
          isIncluded: featureDto.isIncluded ?? true,
          displayOrder: featureDto.displayOrder ?? 0,
        }),
      );
      await this.planFeatureRepo.save(features);
    }

    // Create limits if provided
    if (createDto.limits && createDto.limits.length > 0) {
      const limits = createDto.limits.map((limitDto) =>
        this.planLimitRepo.create({
          planId: savedPlan.id,
          limitType: limitDto.limitType as any,
          limitName: limitDto.limitName,
          limitValue: limitDto.limitValue ?? null,
          limitUnit: limitDto.limitUnit ?? null,
          isUnlimited: limitDto.isUnlimited ?? false,
          description: limitDto.description,
        }),
      );
      await this.planLimitRepo.save(limits);
    }

    // Reload with relations
    return this.findOne(savedPlan.id);
  }

  /**
   * Find all plans (with optional filters)
   */
  async findAll(filters?: {
    planType?: string;
    billingPeriod?: 'monthly' | 'annual';
    isActive?: boolean;
    isFeatured?: boolean;
  }): Promise<Plan[]> {
    const queryBuilder = this.planRepo
      .createQueryBuilder('plan')
      .leftJoinAndSelect('plan.features', 'features')
      .leftJoinAndSelect('plan.limits', 'limits')
      .orderBy('plan.displayOrder', 'ASC')
      .addOrderBy('plan.planType', 'ASC');

    if (filters?.planType) {
      queryBuilder.where('plan.planType = :planType', { planType: filters.planType });
    }

    if (filters?.billingPeriod) {
      queryBuilder.andWhere('plan.billingPeriod = :billingPeriod', {
        billingPeriod: filters.billingPeriod,
      });
    }

    if (filters?.isActive !== undefined) {
      queryBuilder.andWhere('plan.isActive = :isActive', { isActive: filters.isActive });
    }

    if (filters?.isFeatured !== undefined) {
      queryBuilder.andWhere('plan.isFeatured = :isFeatured', { isFeatured: filters.isFeatured });
    }

    return queryBuilder.getMany();
  }

  /**
   * Find a plan by ID
   */
  async findOne(id: string): Promise<Plan> {
    const plan = await this.planRepo.findOne({
      where: { id },
      relations: ['features', 'limits'],
      order: {
        features: { displayOrder: 'ASC' },
        limits: { limitType: 'ASC' },
      },
    });

    if (!plan) {
      throw new NotFoundException(`Plan with ID "${id}" not found`);
    }

    return plan;
  }

  /**
   * Find plans by type
   */
  async findByType(planType: string): Promise<Plan[]> {
    return this.planRepo.find({
      where: { planType: planType as any, isActive: true },
      relations: ['features', 'limits'],
      order: {
        billingPeriod: 'ASC',
        displayOrder: 'ASC',
      },
    });
  }

  /**
   * Update a plan
   */
  async update(id: string, updateDto: UpdatePlanDto): Promise<Plan> {
    const plan = await this.findOne(id);

    // Check uniqueness if planType or billingPeriod changes
    if (updateDto.planType || updateDto.billingPeriod) {
      const checkType = updateDto.planType ?? plan.planType;
      const checkPeriod = updateDto.billingPeriod ?? plan.billingPeriod;

      const existingPlan = await this.planRepo.findOne({
        where: {
          planType: checkType,
          billingPeriod: checkPeriod,
        },
      });

      if (existingPlan && existingPlan.id !== id) {
        throw new BadRequestException(
          `A plan of type "${checkType}" with billing period "${checkPeriod}" already exists`,
        );
      }
    }

    // Update plan fields
    if (updateDto.planType !== undefined) plan.planType = updateDto.planType;
    if (updateDto.name !== undefined) plan.name = updateDto.name;
    if (updateDto.description !== undefined) plan.description = updateDto.description;
    if (updateDto.billingPeriod !== undefined) plan.billingPeriod = updateDto.billingPeriod;
    if (updateDto.standardPrice !== undefined) plan.standardPrice = updateDto.standardPrice;
    if (updateDto.singleAppPrice !== undefined) plan.singleAppPrice = updateDto.singleAppPrice;
    if (updateDto.displayOrder !== undefined) plan.displayOrder = updateDto.displayOrder;
    if (updateDto.isActive !== undefined) plan.isActive = updateDto.isActive;
    if (updateDto.isPopular !== undefined) plan.isPopular = updateDto.isPopular;
    if (updateDto.isFeatured !== undefined) plan.isFeatured = updateDto.isFeatured;
    if (updateDto.externalCode !== undefined) plan.externalCode = updateDto.externalCode;

    await this.planRepo.save(plan);

    // Update features if provided
    if (updateDto.features !== undefined) {
      // Delete existing features
      await this.planFeatureRepo.delete({ planId: id });

      // Create new features
      if (updateDto.features.length > 0) {
        const features = updateDto.features.map((featureDto) =>
          this.planFeatureRepo.create({
            planId: id,
            name: featureDto.name,
            description: featureDto.description,
            category: featureDto.category as any,
            isIncluded: featureDto.isIncluded ?? true,
            displayOrder: featureDto.displayOrder ?? 0,
          }),
        );
        await this.planFeatureRepo.save(features);
      }
    }

    // Update limits if provided
    if (updateDto.limits !== undefined) {
      // Delete existing limits
      await this.planLimitRepo.delete({ planId: id });

      // Create new limits
      if (updateDto.limits.length > 0) {
        const limits = updateDto.limits.map((limitDto) =>
          this.planLimitRepo.create({
            planId: id,
            limitType: limitDto.limitType as any,
            limitName: limitDto.limitName,
            limitValue: limitDto.limitValue ?? null,
            limitUnit: limitDto.limitUnit ?? null,
            isUnlimited: limitDto.isUnlimited ?? false,
            description: limitDto.description,
          }),
        );
        await this.planLimitRepo.save(limits);
      }
    }

    // Reload with relations
    return this.findOne(id);
  }

  /**
   * Delete a plan
   */
  async remove(id: string): Promise<void> {
    const plan = await this.findOne(id);

    // Check if plan has active subscriptions
    // Note: This would require checking Subscription entity
    // For now, we'll just delete the plan and let database constraints handle it

    await this.planRepo.remove(plan);
  }

  /**
   * Get pricing comparison for all plans
   */
  async getPricingComparison(billingPeriod: 'monthly' | 'annual' = 'monthly'): Promise<Plan[]> {
    return this.findAll({
      billingPeriod,
      isActive: true,
    });
  }
}

