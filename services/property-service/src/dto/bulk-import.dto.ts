import { IsArray, ValidateNested, IsOptional, IsString } from 'class-validator';
import { Type } from 'class-transformer';
import { CreatePropertyDto } from './create-property.dto';

export class BulkImportDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreatePropertyDto)
  properties!: CreatePropertyDto[];

  @IsString()
  @IsOptional()
  fileName?: string;
}

