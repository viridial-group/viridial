import { IsEnum } from 'class-validator';
import { VoteType } from '../entities/review-vote.entity';

export class VoteReviewDto {
  @IsEnum(VoteType)
  voteType!: VoteType; // 'helpful' or 'not_helpful'
}

