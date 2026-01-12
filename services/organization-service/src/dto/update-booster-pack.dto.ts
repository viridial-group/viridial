import { IsString, IsEnum, IsNumber, IsBoolean, IsOptional, Min } from 'class-validator';

export class UpdateBoosterPackDto {
  @IsOptional()
  @IsString()
  name?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(['users', 'storage', 'emails', 'api_calls', 'records', 'custom'])
  boosterPackType?: 'users' | 'storage' | 'emails' | 'api_calls' | 'records' | 'custom';

  @IsOptional()
  @IsString()
  limitType?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  limitIncrease?: number;

  @IsOptional()
  @IsString()
  limitUnit?: string | null;

  @IsOptional()
  @IsNumber()
  @Min(0)
  monthlyPrice?: number;

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

