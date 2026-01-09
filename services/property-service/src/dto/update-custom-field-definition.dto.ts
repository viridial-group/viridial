import { PartialType } from '@nestjs/mapped-types';
import { CreateCustomFieldDefinitionDto } from './create-custom-field-definition.dto';
import { IsOptional, IsString } from 'class-validator';

/**
 * DTO for updating a custom field definition
 * Note: fieldKey and entityType cannot be changed if values exist
 */
export class UpdateCustomFieldDefinitionDto extends PartialType(CreateCustomFieldDefinitionDto) {
  @IsString()
  @IsOptional()
  label?: Record<string, string>;

  @IsOptional()
  validationRules?: Record<string, any>;

  @IsOptional()
  options?: string[];
}

