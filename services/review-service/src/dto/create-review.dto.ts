import {
  IsEnum,
  IsInt,
  IsOptional,
  IsString,
  IsUUID,
  IsBoolean,
  IsArray,
  IsDateString,
  Max,
  Min,
  MaxLength,
  IsUrl,
  ArrayMaxSize,
} from 'class-validator';
import { ReviewEntityType, ReviewTag } from '../entities/review.entity';

export class CreateReviewDto {
  @IsEnum(ReviewEntityType)
  entityType!: ReviewEntityType;

  @IsUUID()
  entityId!: string;

  @IsInt()
  @Min(1)
  @Max(5)
  rating!: number;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  title?: string;

  @IsOptional()
  @IsString()
  comment?: string;

  @IsOptional()
  @IsArray()
  @IsUrl({}, { each: true })
  @ArrayMaxSize(10) // Max 10 photos per review
  photos?: string[];

  @IsOptional()
  @IsArray()
  @IsEnum(ReviewTag, { each: true })
  tags?: ReviewTag[];

  @IsOptional()
  @IsBoolean()
  recommended?: boolean;

  @IsOptional()
  @IsDateString()
  visitDate?: string; // ISO date string
}

