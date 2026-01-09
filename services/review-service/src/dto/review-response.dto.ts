import { ReviewEntityType, ReviewTag } from '../entities/review.entity';

export class ReviewResponseDto {
  id!: string;
  userId!: string;
  entityType!: ReviewEntityType;
  entityId!: string;
  rating!: number;
  title!: string | null;
  comment!: string | null;
  status!: string;
  photos!: string[] | null;
  tags!: ReviewTag[] | null;
  recommended!: boolean | null;
  verified!: boolean;
  visitDate!: Date | null;
  helpfulCount!: number;
  notHelpfulCount!: number;
  userVote?: 'helpful' | 'not_helpful' | null; // Current user's vote (if authenticated)
  responses?: ReviewResponseItemDto[]; // Responses from owners/managers
  createdAt!: Date;
  updatedAt!: Date;
}

export class ReviewResponseItemDto {
  id!: string;
  userId!: string;
  content!: string;
  createdAt!: Date;
  updatedAt!: Date;
}

export class ReviewStatsDto {
  entityType!: ReviewEntityType;
  entityId!: string;
  totalReviews!: number;
  averageRating!: number;
  ratingDistribution!: {
    '1': number;
    '2': number;
    '3': number;
    '4': number;
    '5': number;
  };
  recommendationRate?: number; // Percentage who recommend (if recommended field is used)
  verifiedReviewsCount?: number; // Count of verified reviews
}

