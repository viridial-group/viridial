import {
  IsArray,
  IsString,
  IsEnum,
  IsOptional,
  ValidateNested,
  ArrayMinSize,
} from 'class-validator';
import { Type } from 'class-transformer';
import { UpdatePropertyDto } from './update-property.dto';
import { PropertyStatus } from '../entities/property.entity';

/**
 * DTO for bulk property updates
 */
export class BulkUpdatePropertyDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  propertyIds!: string[];

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdatePropertyDto)
  updateData?: UpdatePropertyDto;

  @IsOptional()
  @IsEnum(PropertyStatus)
  status?: PropertyStatus;
}

/**
 * DTO for bulk property deletion
 */
export class BulkDeletePropertyDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  propertyIds!: string[];

  @IsOptional()
  hardDelete?: boolean; // If true, permanent deletion (admin only)
}

/**
 * DTO for bulk property status update
 */
export class BulkStatusUpdateDto {
  @IsArray()
  @ArrayMinSize(1)
  @IsString({ each: true })
  propertyIds!: string[];

  @IsEnum(PropertyStatus)
  status!: PropertyStatus;
}

