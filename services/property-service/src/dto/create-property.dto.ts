import {
  IsNotEmpty,
  IsString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsArray,
  ValidateNested,
  Min,
  Max,
  IsUUID,
  IsUrl,
  Matches,
  ArrayMinSize,
  ValidateIf,
  IsIn,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PropertyType, PropertyStatus } from '../entities/property.entity';
import { PropertyDetailsDto } from './property-details.dto';
import { CustomFieldValueDto } from './custom-field-value.dto';

export class PropertyTranslationDto {
  @IsString()
  @IsNotEmpty()
  @Matches(/^[a-z]{2}(-[A-Z]{2})?$/, {
    message: 'Language must be a valid ISO 639-1 code (e.g., "fr", "en", "fr-FR")',
  })
  language!: string;

  @IsString()
  @IsNotEmpty()
  @Min(3, { message: 'Title must be at least 3 characters' })
  @Max(200, { message: 'Title must not exceed 200 characters' })
  title!: string;

  @IsString()
  @IsOptional()
  @Max(5000, { message: 'Description must not exceed 5000 characters' })
  description?: string;

  @IsString()
  @IsOptional()
  @Max(1000, { message: 'Notes must not exceed 1000 characters' })
  notes?: string;

  @IsString()
  @IsOptional()
  @Max(60, { message: 'Meta title must not exceed 60 characters for SEO' })
  metaTitle?: string;

  @IsString()
  @IsOptional()
  @Max(160, { message: 'Meta description must not exceed 160 characters for SEO' })
  metaDescription?: string;
}

export class CreatePropertyDto {
  @IsUUID()
  @IsOptional() // userId is optional in DTO - will be set from JWT token
  userId?: string;

  // External code for external system reference (optional)
  // Note: internalCode is generated automatically by the service and should not be provided
  @IsString()
  @IsOptional()
  @Max(100, { message: 'External code must not exceed 100 characters' })
  externalCode?: string;

  @IsEnum(PropertyType)
  @IsNotEmpty()
  type!: PropertyType;

  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0, { message: 'Price must be positive' })
  @Max(999999999999, { message: 'Price exceeds maximum allowed value' })
  @IsNotEmpty()
  price!: number;

  @IsString()
  @IsOptional()
  @IsIn(['EUR', 'USD', 'GBP', 'CHF', 'CAD', 'AUD', 'JPY', 'CNY'], {
    message: 'Currency must be a valid ISO 4217 code',
  })
  currency?: string;

  // Address
  @IsString()
  @IsOptional()
  @Max(255, { message: 'Street address must not exceed 255 characters' })
  street?: string;

  @IsString()
  @IsOptional()
  @Matches(/^[A-Z0-9\s-]{1,20}$/i, {
    message: 'Postal code format is invalid',
  })
  postalCode?: string;

  @IsString()
  @IsOptional()
  @Max(100, { message: 'City name must not exceed 100 characters' })
  city?: string;

  @IsString()
  @IsOptional()
  @Max(100, { message: 'Region name must not exceed 100 characters' })
  region?: string;

  @IsString()
  @IsOptional()
  @Matches(/^[A-Z]{2}$/, {
    message: 'Country must be a valid ISO 3166-1 alpha-2 code (e.g., "FR", "US")',
  })
  country?: string;

  // Geolocation (optional, will be geocoded if address provided)
  @IsNumber({ maxDecimalPlaces: 8 })
  @IsOptional()
  @Min(-90, { message: 'Latitude must be between -90 and 90' })
  @Max(90, { message: 'Latitude must be between -90 and 90' })
  @ValidateIf((o) => o.longitude !== undefined)
  latitude?: number;

  @IsNumber({ maxDecimalPlaces: 8 })
  @IsOptional()
  @Min(-180, { message: 'Longitude must be between -180 and 180' })
  @Max(180, { message: 'Longitude must be between -180 and 180' })
  @ValidateIf((o) => o.latitude !== undefined)
  longitude?: number;

  // Media URLs
  @IsArray()
  @IsOptional()
  @ArrayMinSize(0)
  @IsUrl({}, { each: true, message: 'Each media URL must be a valid URL' })
  @IsString({ each: true })
  mediaUrls?: string[];

  // Translations (at least one required)
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => PropertyTranslationDto)
  @IsNotEmpty()
  @ArrayMinSize(1, { message: 'At least one translation is required' })
  translations!: PropertyTranslationDto[];

  @IsEnum(PropertyStatus)
  @IsOptional()
  status?: PropertyStatus;

  // Property details (enriched fields)
  @IsOptional()
  @ValidateNested()
  @Type(() => PropertyDetailsDto)
  details?: PropertyDetailsDto;

  // Custom fields (US-026)
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CustomFieldValueDto)
  customFields?: CustomFieldValueDto[];
}
