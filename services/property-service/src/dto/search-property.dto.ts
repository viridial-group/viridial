import {
  IsOptional,
  IsEnum,
  IsNumber,
  IsString,
  IsArray,
  Min,
  Max,
  ValidateNested,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PropertyType, PropertyStatus } from '../entities/property.entity';

/**
 * DTO for advanced property search with multiple filters
 */
export class SearchPropertyDto {
  // Basic filters
  @IsOptional()
  @IsEnum(PropertyType)
  type?: PropertyType;

  @IsOptional()
  @IsArray()
  @IsEnum(PropertyType, { each: true })
  types?: PropertyType[];

  @IsOptional()
  @IsEnum(PropertyStatus)
  status?: PropertyStatus;

  // Price range
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  maxPrice?: number;

  @IsOptional()
  @IsString()
  currency?: string;

  // Location filters
  @IsOptional()
  @IsString()
  city?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  cities?: string[];

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  country?: string;

  @IsOptional()
  @IsString()
  postalCode?: string;

  @IsOptional()
  @IsString()
  neighborhoodId?: string;

  // Geolocation search
  @IsOptional()
  @IsNumber()
  @Min(-90)
  @Max(90)
  @Type(() => Number)
  latitude?: number;

  @IsOptional()
  @IsNumber()
  @Min(-180)
  @Max(180)
  @Type(() => Number)
  longitude?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(1000)
  @Type(() => Number)
  radiusKm?: number; // Radius in kilometers for nearby search

  // Text search (title, description)
  @IsOptional()
  @IsString()
  search?: string;

  // Date filters
  @IsOptional()
  @IsDateString()
  createdAfter?: string;

  @IsOptional()
  @IsDateString()
  createdBefore?: string;

  @IsOptional()
  @IsDateString()
  publishedAfter?: string;

  @IsOptional()
  @IsDateString()
  publishedBefore?: string;

  // Media filters
  @IsOptional()
  @Type(() => Boolean)
  hasImages?: boolean;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  minImages?: number;

  // Sorting
  @IsOptional()
  @IsEnum(['createdAt', 'updatedAt', 'publishedAt', 'price', 'title'])
  sortBy?: 'createdAt' | 'updatedAt' | 'publishedAt' | 'price' | 'title';

  @IsOptional()
  @IsEnum(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC';

  // Pagination
  @IsOptional()
  @IsNumber()
  @Min(1)
  @Max(100)
  @Type(() => Number)
  limit?: number;

  @IsOptional()
  @IsNumber()
  @Min(0)
  @Type(() => Number)
  offset?: number;

  // User filter
  @IsOptional()
  @IsString()
  userId?: string;

  // Advanced filters
  @IsOptional()
  @Type(() => Boolean)
  hasCoordinates?: boolean; // Only properties with lat/lon

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  propertyIds?: string[]; // Search specific property IDs
}

