import { Injectable, NotFoundException, BadRequestException, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { LessThan, In } from 'typeorm';
import { Subscription } from '../entities/subscription.entity';
import { Plan } from '../entities/plan.entity';
import { Organization } from '../entities/organization.entity';
import { CreateSubscriptionDto } from '../dto/create-subscription.dto';
import { UpdateSubscriptionDto } from '../dto/update-subscription.dto';

@Injectable()
export class SubscriptionService {
  private readonly logger = new Logger(SubscriptionService.name);

  constructor(
    @InjectRepository(Subscription)
    // NOTE: typage assoupli ici car les types TypeORM ne sont pas résolus correctement
    private subscriptionRepo: any,
    @InjectRepository(Plan)
    private planRepo: any,
    @InjectRepository(Organization)
    private organizationRepo: any,
  ) {}

  /**
   * Create a new subscription
   */
  async create(createDto: CreateSubscriptionDto): Promise<Subscription> {
    // Verify organization exists
    const organization = await this.organizationRepo.findOne({
      where: { id: createDto.organizationId },
    });

    if (!organization) {
      throw new NotFoundException(`Organization with ID "${createDto.organizationId}" not found`);
    }

    // Verify plan exists
    const plan = await this.planRepo.findOne({
      where: { id: createDto.planId },
    });

    if (!plan) {
      throw new NotFoundException(`Plan with ID "${createDto.planId}" not found`);
    }

    // Check if organization already has an active subscription
    const existingSubscription = await this.subscriptionRepo.findOne({
      where: {
        organizationId: createDto.organizationId,
        status: In(['trial', 'active']),
      },
    });

    if (existingSubscription) {
      throw new BadRequestException(
        `Organization already has an active subscription. Please update or cancel the existing subscription first.`,
      );
    }

    // Calculate monthly amount
    const standardUsersCount = createDto.standardUsersCount ?? 0;
    const singleAppUsersCount = createDto.singleAppUsersCount ?? 0;
    const monthlyAmount =
      standardUsersCount * plan.standardPrice +
      (singleAppUsersCount * (plan.singleAppPrice ?? plan.standardPrice));

    // Set trial dates if trial days provided
    let trialStartDate: Date | null = null;
    let trialEndDate: Date | null = null;
    if (createDto.trialDays && createDto.trialDays > 0) {
      trialStartDate = new Date();
      trialEndDate = new Date();
      trialEndDate.setDate(trialEndDate.getDate() + createDto.trialDays);
    }

    // Set current period dates
    const currentPeriodStart = createDto.currentPeriodStart
      ? new Date(createDto.currentPeriodStart)
      : new Date();
    const currentPeriodEnd = createDto.currentPeriodEnd
      ? new Date(createDto.currentPeriodEnd)
      : this.calculatePeriodEnd(currentPeriodStart, createDto.billingPeriod ?? 'monthly');

    const subscription = this.subscriptionRepo.create({
      organizationId: createDto.organizationId,
      planId: createDto.planId,
      status: createDto.status ?? 'trial',
      standardUsersCount,
      singleAppUsersCount,
      billingPeriod: createDto.billingPeriod ?? 'monthly',
      monthlyAmount,
      currency: createDto.currency ?? 'USD',
      trialDays: createDto.trialDays ?? null,
      trialStartDate,
      trialEndDate,
      currentPeriodStart,
      currentPeriodEnd,
    });

    const savedSubscription = await this.subscriptionRepo.save(subscription);

    // Update organization plan
    organization.plan = plan.planType;
    organization.subscriptionStatus = savedSubscription.status;
    await this.organizationRepo.save(organization);

    return this.findOne(savedSubscription.id);
  }

  /**
   * Find all subscriptions (with optional filters)
   */
  async findAll(filters?: {
    organizationId?: string;
    planId?: string;
    status?: string;
  }): Promise<Subscription[]> {
    const queryBuilder = this.subscriptionRepo
      .createQueryBuilder('subscription')
      .leftJoinAndSelect('subscription.plan', 'plan')
      .leftJoinAndSelect('subscription.organization', 'organization')
      .leftJoinAndSelect('subscription.userPlans', 'userPlans')
      .leftJoinAndSelect('subscription.boosterPacks', 'boosterPacks')
      .orderBy('subscription.createdAt', 'DESC');

    if (filters?.organizationId) {
      queryBuilder.where('subscription.organizationId = :organizationId', {
        organizationId: filters.organizationId,
      });
    }

    if (filters?.planId) {
      queryBuilder.andWhere('subscription.planId = :planId', { planId: filters.planId });
    }

    if (filters?.status) {
      queryBuilder.andWhere('subscription.status = :status', { status: filters.status });
    }

    return queryBuilder.getMany();
  }

  /**
   * Find a subscription by ID
   */
  async findOne(id: string): Promise<Subscription> {
    const subscription = await this.subscriptionRepo.findOne({
      where: { id },
      relations: ['plan', 'organization', 'userPlans', 'boosterPacks'],
    });

    if (!subscription) {
      throw new NotFoundException(`Subscription with ID "${id}" not found`);
    }

    return subscription;
  }

  /**
   * Find active subscription for an organization
   */
  async findActiveByOrganization(organizationId: string): Promise<Subscription | null> {
    return this.subscriptionRepo.findOne({
      where: {
        organizationId,
        status: In(['trial', 'active']),
      },
      relations: ['plan', 'boosterPacks'],
      order: { createdAt: 'DESC' },
    });
  }

  /**
   * Update a subscription
   */
  async update(id: string, updateDto: UpdateSubscriptionDto): Promise<Subscription> {
    const subscription = await this.findOne(id);

    // If plan changes, verify new plan exists
    if (updateDto.planId && updateDto.planId !== subscription.planId) {
      const plan = await this.planRepo.findOne({
        where: { id: updateDto.planId },
      });

      if (!plan) {
        throw new NotFoundException(`Plan with ID "${updateDto.planId}" not found`);
      }

      subscription.planId = updateDto.planId;
      subscription.plan = plan;

      // Recalculate monthly amount
      const monthlyAmount =
        (updateDto.standardUsersCount ?? subscription.standardUsersCount) * plan.standardPrice +
        ((updateDto.singleAppUsersCount ?? subscription.singleAppUsersCount) *
          (plan.singleAppPrice ?? plan.standardPrice));
      subscription.monthlyAmount = monthlyAmount;
    }

    // Update fields
    if (updateDto.status !== undefined) subscription.status = updateDto.status;
    if (updateDto.standardUsersCount !== undefined)
      subscription.standardUsersCount = updateDto.standardUsersCount;
    if (updateDto.singleAppUsersCount !== undefined)
      subscription.singleAppUsersCount = updateDto.singleAppUsersCount;
    if (updateDto.billingPeriod !== undefined) subscription.billingPeriod = updateDto.billingPeriod;
    if (updateDto.monthlyAmount !== undefined) subscription.monthlyAmount = updateDto.monthlyAmount;
    if (updateDto.currency !== undefined) subscription.currency = updateDto.currency;
    if (updateDto.cancelAtPeriodEnd !== undefined)
      subscription.cancelAtPeriodEnd = updateDto.cancelAtPeriodEnd;
    if (updateDto.currentPeriodStart !== undefined)
      subscription.currentPeriodStart = updateDto.currentPeriodStart
        ? new Date(updateDto.currentPeriodStart)
        : null;
    if (updateDto.currentPeriodEnd !== undefined)
      subscription.currentPeriodEnd = updateDto.currentPeriodEnd
        ? new Date(updateDto.currentPeriodEnd)
        : null;

    // Handle cancellation
    if (updateDto.cancelAtPeriodEnd && !subscription.cancelledAt) {
      subscription.cancelledAt = new Date();
    } else if (!updateDto.cancelAtPeriodEnd && subscription.cancelledAt) {
      subscription.cancelledAt = null;
    }

    await this.subscriptionRepo.save(subscription);

    // Update organization status if subscription status changes
    if (updateDto.status !== undefined) {
      const organization = await this.organizationRepo.findOne({
        where: { id: subscription.organizationId },
      });
      if (organization) {
        organization.subscriptionStatus = updateDto.status;
        await this.organizationRepo.save(organization);
      }
    }

    return this.findOne(id);
  }

  /**
   * Cancel a subscription
   */
  async cancel(id: string, cancelAtPeriodEnd: boolean = true): Promise<Subscription> {
    const subscription = await this.findOne(id);

    if (subscription.status === 'cancelled' || subscription.status === 'expired') {
      throw new BadRequestException('Subscription is already cancelled or expired');
    }

    subscription.cancelAtPeriodEnd = cancelAtPeriodEnd;
    subscription.cancelledAt = cancelAtPeriodEnd ? new Date() : null;
    subscription.status = cancelAtPeriodEnd ? subscription.status : 'cancelled';

    await this.subscriptionRepo.save(subscription);

    return this.findOne(id);
  }

  /**
   * Renew a subscription
   */
  async renew(id: string): Promise<Subscription> {
    const subscription = await this.findOne(id);

    if (subscription.status !== 'active' && subscription.status !== 'trial') {
      throw new BadRequestException('Only active or trial subscriptions can be renewed');
    }

    const now = new Date();
    subscription.currentPeriodStart = now;
    subscription.currentPeriodEnd = this.calculatePeriodEnd(now, subscription.billingPeriod);
    subscription.cancelAtPeriodEnd = false;
    subscription.cancelledAt = null;
    subscription.status = 'active';
    subscription.lastPaymentDate = now;
    subscription.nextPaymentDate = subscription.currentPeriodEnd;

    await this.subscriptionRepo.save(subscription);

    return this.findOne(id);
  }

  /**
   * Calculate period end date
   */
  private calculatePeriodEnd(startDate: Date, billingPeriod: 'monthly' | 'annual'): Date {
    const endDate = new Date(startDate);
    if (billingPeriod === 'annual') {
      endDate.setFullYear(endDate.getFullYear() + 1);
    } else {
      endDate.setMonth(endDate.getMonth() + 1);
    }
    return endDate;
  }

  /**
   * Check and update expired subscriptions
   */
  async checkExpiredSubscriptions(): Promise<Subscription[]> {
    const now = new Date();
    const expiredSubscriptions = await this.subscriptionRepo.find({
      where: {
        status: In(['trial', 'active']),
        currentPeriodEnd: LessThan(now),
      },
    });

    for (const subscription of expiredSubscriptions) {
      subscription.status = 'expired';
      await this.subscriptionRepo.save(subscription);

      // Update organization
      const organization = await this.organizationRepo.findOne({
        where: { id: subscription.organizationId },
      });
      if (organization) {
        organization.subscriptionStatus = 'expired';
        await this.organizationRepo.save(organization);
      }
    }

    return expiredSubscriptions;
  }
}

