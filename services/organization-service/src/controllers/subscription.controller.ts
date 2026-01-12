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
import { SubscriptionService } from '../services/subscription.service';
import { CreateSubscriptionDto } from '../dto/create-subscription.dto';
import { UpdateSubscriptionDto } from '../dto/update-subscription.dto';
import { Subscription } from '../entities/subscription.entity';

@Controller('api/organizations/subscriptions')
export class SubscriptionController {
  constructor(private readonly subscriptionService: SubscriptionService) {}

  /**
   * Create a new subscription
   * POST /subscriptions
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreateSubscriptionDto): Promise<Subscription> {
    return this.subscriptionService.create(createDto);
  }

  /**
   * Get all subscriptions
   * GET /subscriptions
   */
  @Get()
  async findAll(
    @Query('organizationId') organizationId?: string,
    @Query('planId') planId?: string,
    @Query('status') status?: string,
  ): Promise<Subscription[]> {
    const filters: any = {};
    if (organizationId) filters.organizationId = organizationId;
    if (planId) filters.planId = planId;
    if (status) filters.status = status;
    return this.subscriptionService.findAll(filters);
  }

  /**
   * Get active subscription for an organization
   * GET /subscriptions/organization/:organizationId/active
   */
  @Get('organization/:organizationId/active')
  async findActiveByOrganization(
    @Param('organizationId') organizationId: string,
  ): Promise<Subscription | null> {
    return this.subscriptionService.findActiveByOrganization(organizationId);
  }

  /**
   * Get a subscription by ID
   * GET /subscriptions/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Subscription> {
    return this.subscriptionService.findOne(id);
  }

  /**
   * Update a subscription
   * PUT /subscriptions/:id
   */
  @Put(':id')
  async update(
    @Param('id') id: string,
    @Body() updateDto: UpdateSubscriptionDto,
  ): Promise<Subscription> {
    return this.subscriptionService.update(id, updateDto);
  }

  /**
   * Cancel a subscription
   * POST /subscriptions/:id/cancel
   */
  @Post(':id/cancel')
  async cancel(
    @Param('id') id: string,
    @Body('cancelAtPeriodEnd') cancelAtPeriodEnd: boolean = true,
  ): Promise<Subscription> {
    return this.subscriptionService.cancel(id, cancelAtPeriodEnd);
  }

  /**
   * Renew a subscription
   * POST /subscriptions/:id/renew
   */
  @Post(':id/renew')
  async renew(@Param('id') id: string): Promise<Subscription> {
    return this.subscriptionService.renew(id);
  }

  /**
   * Delete a subscription
   * DELETE /subscriptions/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    // Note: Usually subscriptions are cancelled, not deleted
    // This endpoint is for administrative purposes
    await this.subscriptionService.update(id, { status: 'cancelled' });
  }
}

