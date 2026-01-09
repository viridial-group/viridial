import {
  IsString,
  IsUUID,
  IsOptional,
  IsNumber,
  IsBoolean,
  IsDateString,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { CustomFieldType } from '../entities/custom-field-definition.entity';

/**
 * DTO for setting a custom field value
 * The value type depends on the field definition's fieldType
 */
export class CustomFieldValueDto {
  @IsUUID()
  fieldDefinitionId!: string;

  // Value based on field type
  @IsOptional()
  @ValidateIf((o) => o.fieldType === CustomFieldType.TEXT || o.fieldType === CustomFieldType.TEXTAREA || o.fieldType === CustomFieldType.URL || o.fieldType === CustomFieldType.EMAIL)
  @IsString()
  valueText?: string;

  @IsOptional()
  @ValidateIf((o) => o.fieldType === CustomFieldType.NUMBER)
  @Type(() => Number)
  @IsNumber()
  valueNumber?: number;

  @IsOptional()
  @ValidateIf((o) => o.fieldType === CustomFieldType.DATE || o.fieldType === CustomFieldType.DATETIME)
  @IsDateString()
  valueDate?: string;

  @IsOptional()
  @ValidateIf((o) => o.fieldType === CustomFieldType.BOOLEAN)
  @Type(() => Boolean)
  @IsBoolean()
  valueBoolean?: boolean;

  @IsOptional()
  @ValidateIf((o) => o.fieldType === CustomFieldType.SELECT || o.fieldType === CustomFieldType.MULTISELECT)
  valueJson?: string | string[]; // Single value for select, array for multiselect

  // Helper property for validation (not persisted)
  fieldType?: CustomFieldType;
}

/**
 * DTO for bulk setting custom field values for an entity
 */
export class BulkCustomFieldValuesDto {
  @IsString()
  entityType!: string; // 'property', 'lead', etc.

  @IsUUID()
  entityId!: string;

  @IsOptional()
  values?: CustomFieldValueDto[]; // Array of field values
}

