import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review, ReviewEntityType } from '../entities/review.entity';
import { CreateReviewDto } from '../dto/create-review.dto';
import { UpdateReviewDto } from '../dto/update-review.dto';
import { ReviewQueryDto } from '../dto/review-query.dto';
import { ReviewFilterDto, ReviewSortBy } from '../dto/review-filter.dto';
import { ReviewResponseDto, ReviewStatsDto, ReviewResponseItemDto } from '../dto/review-response.dto';
import { ReviewVoteService } from './review-vote.service';
import { ReviewResponseService } from './review-response.service';
import { VoteType } from '../entities/review-vote.entity';
import { ReviewResponseEntity } from '../entities/review-response.entity';

@Injectable()
export class ReviewService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    private voteService: ReviewVoteService,
    private responseService: ReviewResponseService,
  ) {}

  /**
   * Create a new review
   */
  async create(createDto: CreateReviewDto, userId: string): Promise<ReviewResponseDto> {
    // Check if user already has an active (non-deleted) review for this entity
    const existingReview = await this.reviewRepository.findOne({
      where: {
        userId,
        entityType: createDto.entityType,
        entityId: createDto.entityId,
        deletedAt: null, // Only check non-deleted reviews
      },
    });

    if (existingReview) {
      throw new BadRequestException('You have already reviewed this entity. Use update instead.');
    }

    const review = this.reviewRepository.create({
      ...createDto,
      userId,
      status: 'pending', // Reviews are pending moderation by default
      visitDate: createDto.visitDate ? new Date(createDto.visitDate) : null,
      helpfulCount: 0,
      notHelpfulCount: 0,
    });

    const savedReview = await this.reviewRepository.save(review);
    // No user vote or responses for newly created review
    return this.toResponseDto(savedReview, null, []);
  }

  /**
   * Find all reviews with filters and pagination (legacy method)
   */
  async findAll(query: ReviewQueryDto): Promise<{ reviews: ReviewResponseDto[]; total: number; page: number; limit: number }> {
    const filterDto: ReviewFilterDto = {
      entityType: query.entityType,
      page: query.page,
      limit: query.limit,
    };
    
    if (query.entityId) {
      // For simple entityId filter, use the advanced method
      return this.findAllAdvanced({ ...filterDto, entityId: query.entityId }, query.userId);
    }

    return this.findAllAdvanced(filterDto, query.userId);
  }

  /**
   * Find all reviews with advanced filters and pagination
   */
  async findAllAdvanced(
    filter: ReviewFilterDto,
    currentUserId?: string,
  ): Promise<{ reviews: ReviewResponseDto[]; total: number; page: number; limit: number }> {
    const {
      entityType,
      entityId,
      minRating,
      maxRating,
      hasPhotos,
      verifiedOnly,
      recommendedOnly,
      sortBy = ReviewSortBy.RECENT,
      page = 1,
      limit = 20,
    } = filter;

    const queryBuilder = this.reviewRepository.createQueryBuilder('review');

    // Apply filters
    if (entityType) {
      queryBuilder.andWhere('review.entityType = :entityType', { entityType });
    }

    if (entityId) {
      queryBuilder.andWhere('review.entityId = :entityId', { entityId });
    }

    if (minRating) {
      queryBuilder.andWhere('review.rating >= :minRating', { minRating });
    }

    if (maxRating) {
      queryBuilder.andWhere('review.rating <= :maxRating', { maxRating });
    }

    if (hasPhotos) {
      queryBuilder.andWhere('review.photos IS NOT NULL');
      queryBuilder.andWhere("jsonb_array_length(COALESCE(review.photos, '[]'::jsonb)) > 0");
    }

    if (verifiedOnly) {
      queryBuilder.andWhere('review.verified = :verified', { verified: true });
    }

    if (recommendedOnly) {
      queryBuilder.andWhere('review.recommended = :recommended', { recommended: true });
    }

    // Only show approved reviews to non-authenticated users
    // Authenticated users can see their own reviews even if pending
    if (!currentUserId) {
      queryBuilder.andWhere('review.status = :status', { status: 'approved' });
    } else {
      // Show approved reviews OR own pending reviews
      queryBuilder.andWhere(
        '(review.status = :status OR (review.status = :pendingStatus AND review.userId = :currentUserId))',
        { status: 'approved', pendingStatus: 'pending', currentUserId },
      );
    }

    // Exclude soft-deleted reviews
    queryBuilder.andWhere('review.deletedAt IS NULL');

    // Apply sorting
    switch (sortBy) {
      case ReviewSortBy.HELPFUL:
        queryBuilder.orderBy('review.helpfulCount', 'DESC');
        queryBuilder.addOrderBy('review.createdAt', 'DESC');
        break;
      case ReviewSortBy.RATING_HIGH:
        queryBuilder.orderBy('review.rating', 'DESC');
        queryBuilder.addOrderBy('review.createdAt', 'DESC');
        break;
      case ReviewSortBy.RATING_LOW:
        queryBuilder.orderBy('review.rating', 'ASC');
        queryBuilder.addOrderBy('review.createdAt', 'DESC');
        break;
      case ReviewSortBy.RECENT:
      default:
        queryBuilder.orderBy('review.createdAt', 'DESC');
        break;
    }

    // Pagination
    const skip = (page - 1) * limit;
    queryBuilder.skip(skip).take(limit);

    const [reviews, total] = await queryBuilder.getManyAndCount();

    // Load user votes and responses for each review
    const reviewsWithDetails = await Promise.all(
      reviews.map(async (review) => {
        const userVote = currentUserId ? await this.voteService.getUserVote(review.id, currentUserId) : null;
        const responses = await this.responseService.getReviewResponses(review.id);
        return this.toResponseDto(review, userVote, responses);
      }),
    );

    return {
      reviews: reviewsWithDetails,
      total,
      page,
      limit,
    };
  }

  /**
   * Find a single review by ID
   */
  async findOne(id: string, userId?: string): Promise<ReviewResponseDto> {
    const review = await this.reviewRepository.findOne({
      where: { id, deletedAt: null },
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    // Only show approved reviews to non-owners
    if (review.status !== 'approved' && review.userId !== userId) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    // Load user vote and responses
    const userVote = userId ? await this.voteService.getUserVote(id, userId) : null;
    const responses = await this.responseService.getReviewResponses(id);

    return this.toResponseDto(review, userVote, responses);
  }

  /**
   * Update a review (only by owner)
   */
  async update(id: string, updateDto: UpdateReviewDto, userId: string): Promise<ReviewResponseDto> {
    const review = await this.reviewRepository.findOne({
      where: { id, deletedAt: null },
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    // Only owner can update their review
    if (review.userId !== userId) {
      throw new ForbiddenException('You can only update your own reviews');
    }

    // Update review fields
    if (updateDto.visitDate) {
      updateDto.visitDate = new Date(updateDto.visitDate as any) as any;
    }
    Object.assign(review, updateDto);
    
    // Reset status to pending if content changed (requires re-moderation)
    if (updateDto.rating || updateDto.comment || updateDto.title || updateDto.photos) {
      review.status = 'pending';
    }

    const updatedReview = await this.reviewRepository.save(review);
    
    // Load user vote and responses
    const userVote = await this.voteService.getUserVote(updatedReview.id, userId);
    const responses = await this.responseService.getReviewResponses(updatedReview.id);
    
    return this.toResponseDto(updatedReview, userVote, responses);
  }

  /**
   * Delete a review (soft delete, only by owner)
   */
  async remove(id: string, userId: string): Promise<void> {
    const review = await this.reviewRepository.findOne({
      where: { id, deletedAt: null },
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${id} not found`);
    }

    // Only owner can delete their review
    if (review.userId !== userId) {
      throw new ForbiddenException('You can only delete your own reviews');
    }

    // Soft delete
    review.deletedAt = new Date();
    await this.reviewRepository.save(review);
  }

  /**
   * Get review statistics for an entity
   */
  async getStats(entityType: ReviewEntityType, entityId: string): Promise<ReviewStatsDto> {
    const reviews = await this.reviewRepository.find({
      where: {
        entityType,
        entityId,
        status: 'approved',
        deletedAt: null,
      },
    });

    const totalReviews = reviews.length;

    if (totalReviews === 0) {
      return {
        entityType,
        entityId,
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: {
          '1': 0,
          '2': 0,
          '3': 0,
          '4': 0,
          '5': 0,
        },
      };
    }

    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / totalReviews;

    const ratingDistribution = reviews.reduce(
      (dist, review) => {
        dist[review.rating.toString() as '1' | '2' | '3' | '4' | '5']++;
        return dist;
      },
      { '1': 0, '2': 0, '3': 0, '4': 0, '5': 0 },
    );

    // Calculate recommendation rate
    const recommendedReviews = reviews.filter((r) => r.recommended === true).length;
    const recommendationRate = totalReviews > 0 ? Math.round((recommendedReviews / totalReviews) * 100) : 0;

    // Count verified reviews
    const verifiedReviewsCount = reviews.filter((r) => r.verified === true).length;

    return {
      entityType,
      entityId,
      totalReviews,
      averageRating: Math.round(averageRating * 100) / 100, // Round to 2 decimals
      ratingDistribution,
      recommendationRate,
      verifiedReviewsCount,
    };
  }

  /**
   * Convert Review entity to Response DTO
   */
  private toResponseDto(
    review: Review,
    userVote?: VoteType | null,
    responses?: ReviewResponseEntity[],
  ): ReviewResponseDto {
    return {
      id: review.id,
      userId: review.userId,
      entityType: review.entityType,
      entityId: review.entityId,
      rating: review.rating,
      title: review.title,
      comment: review.comment,
      status: review.status,
      photos: review.photos || null,
      tags: review.tags || null,
      recommended: review.recommended ?? null,
      verified: review.verified || false,
      visitDate: review.visitDate || null,
      helpfulCount: review.helpfulCount || 0,
      notHelpfulCount: review.notHelpfulCount || 0,
      userVote: userVote || null,
      responses:
        responses && responses.length > 0
          ? responses.map((r) => ({
              id: r.id,
              userId: r.userId,
              content: r.content,
              createdAt: r.createdAt,
              updatedAt: r.updatedAt,
            }))
          : undefined,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
    };
  }
}

