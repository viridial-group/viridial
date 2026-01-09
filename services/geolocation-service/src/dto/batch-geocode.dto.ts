import { IsArray, ValidateNested, IsString, IsNotEmpty, MinLength, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class BatchGeocodeItemDto {
  @IsString()
  @IsNotEmpty()
  id!: string; // Unique identifier for this address

  @IsString()
  @IsNotEmpty()
  @MinLength(3)
  address!: string;

  @IsString()
  @IsOptional()
  country?: string;
}

export class BatchGeocodeDto {
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => BatchGeocodeItemDto)
  addresses!: BatchGeocodeItemDto[];
}

