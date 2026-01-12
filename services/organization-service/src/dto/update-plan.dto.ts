import { IsString, IsEnum, IsNumber, IsBoolean, IsOptional, IsArray, ValidateNested, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePlanFeatureDto, CreatePlanLimitDto } from './create-plan.dto';

export class UpdatePlanDto {
  @IsOptional()
  @IsEnum(['pilot', 'growth', 'professional', 'enterprise', 'ai'])
  planType?: 'pilot' | 'growth' | 'professional' | 'enterprise' | 'ai';

  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(['monthly', 'annual'])
  billingPeriod?: 'monthly' | 'annual';

  @IsOptional()
  @IsNumber()
  @Min(0)
  standardPrice?: number;

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

