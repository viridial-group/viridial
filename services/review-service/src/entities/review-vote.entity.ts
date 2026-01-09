import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
} from 'typeorm';
import { Review } from './review.entity';

export enum VoteType {
  HELPFUL = 'helpful',
  NOT_HELPFUL = 'not_helpful',
}

@Entity({ name: 'review_votes' })
@Unique(['userId', 'reviewId'])
export class ReviewVote {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'review_id', type: 'uuid' })
  @Index()
  reviewId!: string;

  @Column({ name: 'user_id', type: 'uuid' })
  @Index()
  userId!: string;

  @Column({
    type: 'enum',
    enum: VoteType,
  })
  voteType!: VoteType;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @CreateDateColumn()
  createdAt!: Date;

  // Relations
  @ManyToOne(() => Review, (review) => review.votes, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'review_id' })
  review!: Review;
}

