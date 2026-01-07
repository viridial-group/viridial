import { IsEnum, IsOptional } from 'class-validator';
import { PropertyStatus } from '../entities/property.entity';

export class PublishPropertyDto {
  @IsEnum(PropertyStatus)
  @IsOptional()
  status?: PropertyStatus; // Default: LISTED
}

