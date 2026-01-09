import { Injectable, NotFoundException, ForbiddenException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../entities/review.entity';
import { ReviewResponseEntity } from '../entities/review-response.entity';
import { CreateResponseDto } from '../dto/create-response.dto';
import { UpdateResponseDto } from '../dto/update-response.dto';

@Injectable()
export class ReviewResponseService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(ReviewResponseEntity)
    private responseRepository: Repository<ReviewResponseEntity>,
  ) {}

  /**
   * Create a response to a review (usually by owner/manager)
   */
  async createResponse(reviewId: string, userId: string, createDto: CreateResponseDto): Promise<ReviewResponseEntity> {
    // Check if review exists
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId, deletedAt: null },
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${reviewId} not found`);
    }

    // Check if user already responded (only one response per user per review)
    const existingResponse = await this.responseRepository.findOne({
      where: { reviewId, userId, deletedAt: null },
    });

    if (existingResponse) {
      throw new BadRequestException('You have already responded to this review. Use update instead.');
    }

    const response = this.responseRepository.create({
      reviewId,
      userId,
      content: createDto.content,
    });

    return await this.responseRepository.save(response);
  }

  /**
   * Update a response (only by owner)
   */
  async updateResponse(responseId: string, userId: string, updateDto: UpdateResponseDto): Promise<ReviewResponseEntity> {
    const response = await this.responseRepository.findOne({
      where: { id: responseId, deletedAt: null },
    });

    if (!response) {
      throw new NotFoundException(`Response with ID ${responseId} not found`);
    }

    // Only owner can update their response
    if (response.userId !== userId) {
      throw new ForbiddenException('You can only update your own responses');
    }

    Object.assign(response, updateDto);
    return await this.responseRepository.save(response);
  }

  /**
   * Delete a response (soft delete, only by owner)
   */
  async deleteResponse(responseId: string, userId: string): Promise<void> {
    const response = await this.responseRepository.findOne({
      where: { id: responseId, deletedAt: null },
    });

    if (!response) {
      throw new NotFoundException(`Response with ID ${responseId} not found`);
    }

    // Only owner can delete their response
    if (response.userId !== userId) {
      throw new ForbiddenException('You can only delete your own responses');
    }

    response.deletedAt = new Date();
    await this.responseRepository.save(response);
  }

  /**
   * Get all responses for a review
   */
  async getReviewResponses(reviewId: string): Promise<ReviewResponseEntity[]> {
    return await this.responseRepository.find({
      where: { reviewId, deletedAt: null },
      order: { createdAt: 'ASC' },
    });
  }
}

