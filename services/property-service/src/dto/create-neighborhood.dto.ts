import { IsString, IsNotEmpty, IsOptional, IsObject, IsArray, IsNumber, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';

export class NeighborhoodStatsDto {
  @IsOptional()
  @IsObject()
  averagePrice?: {
    apartment?: number;
    house?: number;
    villa?: number;
    commercial?: number;
    land?: number;
  };

  @IsOptional()
  @IsNumber()
  propertyCount?: number;

  @IsOptional()
  @IsNumber()
  averagePriceOverall?: number;

  @IsOptional()
  @IsNumber()
  medianPrice?: number;

  @IsOptional()
  @IsNumber()
  minPrice?: number;

  @IsOptional()
  @IsNumber()
  maxPrice?: number;
}

export class NeighborhoodFeaturesDto {
  @IsOptional()
  @IsObject()
  publicTransport?: {
    metro?: boolean;
    tram?: boolean;
    bus?: boolean;
    train?: boolean;
    stations?: string[];
  };

  @IsOptional()
  @IsObject()
  amenities?: {
    schools?: number;
    hospitals?: number;
    parks?: number;
    shopping?: boolean;
    restaurants?: boolean;
    nightlife?: boolean;
    beaches?: boolean;
    sports?: boolean;
  };

  @IsOptional()
  @IsString()
  type?: 'residential' | 'commercial' | 'mixed' | 'tourist' | 'industrial';

  @IsOptional()
  @IsNumber()
  safetyScore?: number;

  @IsOptional()
  @IsNumber()
  qualityOfLife?: number;

  @IsOptional()
  @IsObject()
  demographics?: {
    averageAge?: number;
    population?: number;
    familyFriendly?: boolean;
    studentArea?: boolean;
    seniorFriendly?: boolean;
  };
}

export class CreateNeighborhoodDto {
  @IsString()
  @IsNotEmpty()
  slug!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsObject()
  @IsNotEmpty()
  description!: {
    fr?: string;
    en?: string;
    [key: string]: string | undefined;
  };

  @IsString()
  @IsNotEmpty()
  city!: string;

  @IsString()
  @IsOptional()
  region?: string;

  @IsString()
  @IsOptional()
  country?: string;

  @IsString()
  @IsOptional()
  postalCode?: string;

  @IsNumber()
  @IsOptional()
  centerLatitude?: number;

  @IsNumber()
  @IsOptional()
  centerLongitude?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => NeighborhoodStatsDto)
  stats?: NeighborhoodStatsDto;

  @IsOptional()
  @ValidateNested()
  @Type(() => NeighborhoodFeaturesDto)
  features?: NeighborhoodFeaturesDto;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  mediaUrls?: string[];
}

