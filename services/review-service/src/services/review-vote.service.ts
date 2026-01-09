import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Review } from '../entities/review.entity';
import { ReviewVote, VoteType } from '../entities/review-vote.entity';
import { VoteReviewDto } from '../dto/vote-review.dto';

@Injectable()
export class ReviewVoteService {
  constructor(
    @InjectRepository(Review)
    private reviewRepository: Repository<Review>,
    @InjectRepository(ReviewVote)
    private voteRepository: Repository<ReviewVote>,
  ) {}

  /**
   * Vote on a review (helpful or not helpful)
   */
  async vote(reviewId: string, userId: string, voteDto: VoteReviewDto): Promise<void> {
    // Check if review exists
    const review = await this.reviewRepository.findOne({
      where: { id: reviewId, deletedAt: null },
    });

    if (!review) {
      throw new NotFoundException(`Review with ID ${reviewId} not found`);
    }

    // Can't vote on your own review
    if (review.userId === userId) {
      throw new BadRequestException('You cannot vote on your own review');
    }

    // Check if user already voted
    const existingVote = await this.voteRepository.findOne({
      where: { userId, reviewId },
    });

    if (existingVote) {
      // If same vote type, remove the vote
      if (existingVote.voteType === voteDto.voteType) {
        await this.removeVote(reviewId, userId, existingVote.voteType);
        return;
      }

      // If different vote type, update the vote
      existingVote.voteType = voteDto.voteType;
      await this.voteRepository.save(existingVote);
      
      // Update review counts
      await this.updateReviewVoteCounts(reviewId);
      return;
    }

    // Create new vote
    const vote = this.voteRepository.create({
      reviewId,
      userId,
      voteType: voteDto.voteType,
    });

    await this.voteRepository.save(vote);
    await this.updateReviewVoteCounts(reviewId);
  }

  /**
   * Remove a vote
   */
  async removeVote(reviewId: string, userId: string, voteType: VoteType): Promise<void> {
    const vote = await this.voteRepository.findOne({
      where: { userId, reviewId, voteType },
    });

    if (vote) {
      await this.voteRepository.remove(vote);
      await this.updateReviewVoteCounts(reviewId);
    }
  }

  /**
   * Get user's vote on a review
   */
  async getUserVote(reviewId: string, userId: string): Promise<VoteType | null> {
    const vote = await this.voteRepository.findOne({
      where: { userId, reviewId },
    });

    return vote ? vote.voteType : null;
  }

  /**
   * Update review vote counts
   */
  private async updateReviewVoteCounts(reviewId: string): Promise<void> {
    const helpfulCount = await this.voteRepository.count({
      where: { reviewId, voteType: VoteType.HELPFUL },
    });

    const notHelpfulCount = await this.voteRepository.count({
      where: { reviewId, voteType: VoteType.NOT_HELPFUL },
    });

    await this.reviewRepository.update(reviewId, {
      helpfulCount,
      notHelpfulCount,
    });
  }
}

