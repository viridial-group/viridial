import { IsString, IsEnum, IsNumber, IsBoolean, IsOptional, IsArray, ValidateNested, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';

export type PlanType = 'pilot' | 'growth' | 'professional' | 'enterprise' | 'ai';
export type BillingPeriod = 'monthly' | 'annual';

export class CreatePlanFeatureDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(['ai', 'sales', 'marketing', 'support', 'inventory', 'project', 'analytics', 'collaboration', 'productivity', 'integration', 'administration', 'other'])
  category?: string;

  @IsOptional()
  @IsBoolean()
  isIncluded?: boolean;

  @IsOptional()
  @IsNumber()
  displayOrder?: number;
}

export class CreatePlanLimitDto {
  @IsEnum(['users', 'records', 'storage', 'emails', 'api_calls', 'integrations', 'custom'])
  limitType!: string;

  @IsString()
  limitName!: string;

  @IsOptional()
  @IsNumber()
  limitValue?: number | null;

  @IsOptional()
  @IsString()
  limitUnit?: string | null;

  @IsOptional()
  @IsBoolean()
  isUnlimited?: boolean;

  @IsOptional()
  @IsString()
  description?: string;
}

export class CreatePlanDto {
  @IsEnum(['pilot', 'growth', 'professional', 'enterprise', 'ai'])
  planType!: PlanType;

  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(['monthly', 'annual'])
  billingPeriod!: BillingPeriod;

  @IsNumber()
  @Min(0)
  standardPrice!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  singleAppPrice?: number | null;

  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsBoolean()
  isPopular?: boolean;

  @IsOptional()
  @IsBoolean()
  isFeatured?: boolean;

  @IsOptional()
  @IsString()
  externalCode?: string | null;

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePlanFeatureDto)
  features?: CreatePlanFeatureDto[];

  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePlanLimitDto)
  limits?: CreatePlanLimitDto[];
}

