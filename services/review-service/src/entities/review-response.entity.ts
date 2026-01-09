import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Review } from './review.entity';

// Note: Named as ReviewResponseEntity to avoid conflict with ReviewResponseDto

@Entity({ name: 'review_responses' })
export class ReviewResponseEntity {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'review_id', type: 'uuid' })
  @Index()
  reviewId!: string;

  // User who responded (usually the owner/manager of the entity)
  @Column({ name: 'user_id', type: 'uuid' })
  @Index()
  userId!: string;

  @Column({ type: 'text' })
  content!: string;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @CreateDateColumn()
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @UpdateDateColumn()
  updatedAt!: Date;

  // Soft delete
  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  @Index()
  deletedAt!: Date | null;

  // Relations
  @ManyToOne(() => Review, (review) => review.responses, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'review_id' })
  review!: Review;
}

