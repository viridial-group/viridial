import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  Min,
  IsUUID,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PropertyType, PropertyStatus } from '../entities/property.entity';

export class PropertyTranslationDto {
  @IsString()
  @IsNotEmpty()
  language!: string;

  @IsString()
  @IsNotEmpty()
  title!: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  notes?: string;

  @IsString()
  @IsOptional()
  metaTitle?: string;

  @IsString()
  @IsOptional()
  metaDescription?: string;
}

export class CreatePropertyDto {
  @IsUUID()
  @IsOptional() // userId is optional in DTO - will be set from JWT token
  userId?: string;

  @IsEnum(PropertyType)
  @IsNotEmpty()
  type!: PropertyType;

  @IsNumber()
  @Min(0)
  @IsNotEmpty()
  price!: number;

  @IsString()
  @IsOptional()
  currency?: string;

  // Address
  @IsString()
  @IsOptional()
  street?: string;

  @IsString()
  @IsOptional()
  postalCode?: string;

  @IsString()
  @IsOptional()
  city?: string;

  @IsString()
  @IsOptional()
  region?: string;

  @IsString()
  @IsOptional()
  country?: string;

  // Geolocation (optional, will be geocoded if address provided)
  @IsNumber()
  @IsOptional()
  latitude?: number;

  @IsNumber()
  @IsOptional()
  longitude?: number;

  // Media URLs
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  mediaUrls?: string[];

  // Translations (at least one required)
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PropertyTranslationDto)
  @IsNotEmpty()
  translations!: PropertyTranslationDto[];

  @IsEnum(PropertyStatus)
  @IsOptional()
  status?: PropertyStatus;
}

