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
import { PlanService } from '../services/plan.service';
import { CreatePlanDto } from '../dto/create-plan.dto';
import { UpdatePlanDto } from '../dto/update-plan.dto';
import { Plan } from '../entities/plan.entity';

@Controller('api/organizations/plans')
export class PlanController {
  constructor(private readonly planService: PlanService) {}

  /**
   * Create a new plan
   * POST /plans
   */
  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() createDto: CreatePlanDto): Promise<Plan> {
    return this.planService.create(createDto);
  }

  /**
   * Get all plans
   * GET /plans
   */
  @Get()
  async findAll(
    @Query('planType') planType?: string,
    @Query('billingPeriod') billingPeriod?: 'monthly' | 'annual',
    @Query('isActive') isActive?: string,
    @Query('isFeatured') isFeatured?: string,
  ): Promise<Plan[]> {
    const filters: any = {};
    if (planType) filters.planType = planType;
    if (billingPeriod) filters.billingPeriod = billingPeriod;
    if (isActive !== undefined) filters.isActive = isActive === 'true';
    if (isFeatured !== undefined) filters.isFeatured = isFeatured === 'true';
    return this.planService.findAll(filters);
  }

  /**
   * Get pricing comparison
   * GET /plans/pricing
   */
  @Get('pricing')
  async getPricingComparison(
    @Query('billingPeriod') billingPeriod: 'monthly' | 'annual' = 'monthly',
  ): Promise<Plan[]> {
    return this.planService.getPricingComparison(billingPeriod);
  }

  /**
   * Get plans by type
   * GET /plans/type/:planType
   */
  @Get('type/:planType')
  async findByType(@Param('planType') planType: string): Promise<Plan[]> {
    return this.planService.findByType(planType);
  }

  /**
   * Get a plan by ID
   * GET /plans/:id
   */
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Plan> {
    return this.planService.findOne(id);
  }

  /**
   * Update a plan
   * PUT /plans/:id
   */
  @Put(':id')
  async update(@Param('id') id: string, @Body() updateDto: UpdatePlanDto): Promise<Plan> {
    return this.planService.update(id, updateDto);
  }

  /**
   * Delete a plan
   * DELETE /plans/:id
   */
  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  async remove(@Param('id') id: string): Promise<void> {
    await this.planService.remove(id);
  }
}

