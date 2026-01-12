import { IsString, IsEnum, IsNumber, IsOptional, IsUUID, Min, IsBoolean, IsDateString } from 'class-validator';

export class CreateSubscriptionDto {
  @IsUUID()
  organizationId!: string;

  @IsUUID()
  planId!: string;

  @IsOptional()
  @IsEnum(['trial', 'active', 'suspended', 'cancelled', 'expired'])
  status?: 'trial' | 'active' | 'suspended' | 'cancelled' | 'expired';

  @IsOptional()
  @IsNumber()
  @Min(0)
  standardUsersCount?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  singleAppUsersCount?: number;

  @IsOptional()
  @IsEnum(['monthly', 'annual'])
  billingPeriod?: 'monthly' | 'annual';

  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyAmount?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  trialDays?: number | null;

  @IsOptional()
  @IsDateString()
  currentPeriodStart?: string | null;

  @IsOptional()
  @IsDateString()
  currentPeriodEnd?: string | null;
}

