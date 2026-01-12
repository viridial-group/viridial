import {
  IsString,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsNumber,
  Min,
  Max,
  IsUUID,
  IsIn,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { Plan } from '../entities/organization.entity';

export type SortField = 'name' | 'createdAt' | 'updatedAt' | 'plan' | 'isActive' | 'country' | 'city' | 'userCount';
export type SortOrder = 'ASC' | 'DESC';

export class FilterOrganizationDto {
  @IsString()
  @IsOptional()
  search?: string; // Search in name, description, internalCode, externalCode

  @IsEnum(['free', 'basic', 'professional', 'enterprise'])
  @IsOptional()
  plan?: Plan;

  @IsBoolean()
  @Type(() => Boolean)
  @IsOptional()
  isActive?: boolean;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsUUID()
  @IsOptional()
  parentId?: string | null; // null = root organizations only, undefined = all

  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @IsOptional()
  minUsers?: number;

  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @IsOptional()
  maxUsers?: number;

  // Pagination
  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @IsOptional()
  page?: number;

  @IsNumber()
  @Type(() => Number)
  @Min(1)
  @Max(1000)
  @IsOptional()
  limit?: number;

  // Sorting
  @IsIn(['name', 'createdAt', 'updatedAt', 'plan', 'isActive', 'country', 'city', 'userCount'])
  @IsOptional()
  sortBy?: SortField;

  @IsIn(['ASC', 'DESC'])
  @IsOptional()
  sortOrder?: SortOrder;
}


