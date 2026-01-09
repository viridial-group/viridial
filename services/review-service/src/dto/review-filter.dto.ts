import { IsEnum, IsOptional, IsBoolean, IsInt, IsUUID, Min, Max } from 'class-validator';
import { Type } from 'class-transformer';
import { ReviewEntityType } from '../entities/review.entity';

export enum ReviewSortBy {
  RECENT = 'recent',
  HELPFUL = 'helpful',
  RATING_HIGH = 'rating_high',
  RATING_LOW = 'rating_low',
}

export class ReviewFilterDto {
  @IsOptional()
  @IsEnum(ReviewEntityType)
  entityType?: ReviewEntityType;

  @IsOptional()
  @IsUUID()
  entityId?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  minRating?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(5)
  maxRating?: number;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  hasPhotos?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  verifiedOnly?: boolean;

  @IsOptional()
  @IsBoolean()
  @Type(() => Boolean)
  recommendedOnly?: boolean;

  @IsOptional()
  @IsEnum(ReviewSortBy)
  sortBy?: ReviewSortBy = ReviewSortBy.RECENT;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number = 1;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit?: number = 20;
}

