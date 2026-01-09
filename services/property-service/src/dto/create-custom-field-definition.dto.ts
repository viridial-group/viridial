import {
  IsString,
  IsEnum,
  IsBoolean,
  IsOptional,
  IsObject,
  IsArray,
  ValidateNested,
  MinLength,
  MaxLength,
  Matches,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CustomFieldType } from '../entities/custom-field-definition.entity';

/**
 * DTO for creating a custom field definition
 */
export class CreateCustomFieldDefinitionDto {
  @IsString()
  @IsOptional()
  organizationId?: string | null; // null = global (admin système)

  @IsString()
  @MinLength(1)
  @MaxLength(50)
  entityType!: string; // 'property', 'lead', 'agency', etc.

  @IsString()
  @MinLength(1)
  @MaxLength(100)
  @Matches(/^[a-z0-9_]+$/, {
    message: 'fieldKey must be lowercase alphanumeric with underscores only',
  })
  fieldKey!: string; // e.g., 'swimming_pool_size'

  @IsObject()
  label!: Record<string, string>; // { "en": "Label", "fr": "Libellé" }

  @IsEnum(CustomFieldType)
  fieldType!: CustomFieldType;

  @IsBoolean()
  @IsOptional()
  required?: boolean;

  @IsOptional()
  defaultValue?: any;

  @IsObject()
  @IsOptional()
  validationRules?: Record<string, any>; // { min, max, pattern, etc. }

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  options?: string[]; // For select/multiselect

  @IsBoolean()
  @IsOptional()
  reusable?: boolean;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  reusableEntityTypes?: string[];
}

