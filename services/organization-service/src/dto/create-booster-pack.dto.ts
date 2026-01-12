import { IsString, IsEnum, IsNumber, IsBoolean, IsOptional, Min } from 'class-validator';

export class CreateBoosterPackDto {
  @IsString()
  name!: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(['users', 'storage', 'emails', 'api_calls', 'records', 'custom'])
  boosterPackType!: 'users' | 'storage' | 'emails' | 'api_calls' | 'records' | 'custom';

  @IsString()
  limitType!: string; // e.g., "users", "storage_gb"

  @IsNumber()
  @Min(0)
  limitIncrease!: number;

  @IsOptional()
  @IsString()
  limitUnit?: string | null;

  @IsNumber()
  @Min(0)
  monthlyPrice!: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  annualPrice?: number | null;

  @IsOptional()
  @IsBoolean()
  isActive?: boolean;

  @IsOptional()
  @IsNumber()
  displayOrder?: number;

  @IsOptional()
  @IsString()
  externalCode?: string | null;
}

