import { PartialType } from '@nestjs/mapped-types';
import { CreatePropertyDto } from './create-property.dto';
import { IsEnum, IsOptional, ValidateNested } from 'class-validator';
import { Type } from 'class-transformer';
import { PropertyStatus } from '../entities/property.entity';
import { PropertyDetailsDto } from './property-details.dto';
import { CustomFieldValueDto } from './custom-field-value.dto';

export class UpdatePropertyDto extends PartialType(CreatePropertyDto) {
  @IsEnum(PropertyStatus)
  @IsOptional()
  status?: PropertyStatus;

  // Property details can be updated
  @IsOptional()
  @ValidateNested()
  @Type(() => PropertyDetailsDto)
  details?: PropertyDetailsDto;

  // Custom fields can be updated
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CustomFieldValueDto)
  customFields?: CustomFieldValueDto[];
}

