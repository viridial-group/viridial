import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { ReviewPhoto } from './review-photo.entity';
import { ReviewVote } from './review-vote.entity';
import { ReviewResponseEntity } from './review-response.entity';

export enum ReviewEntityType {
  PROPERTY = 'property',
  CITY = 'city',
  NEIGHBORHOOD = 'neighborhood',
  COUNTRY = 'country',
}

export enum ReviewTag {
  SECURITY = 'security',
  LOCATION = 'location',
  PRICE = 'price',
  QUALITY = 'quality',
  NEIGHBORHOOD = 'neighborhood',
  TRANSPORT = 'transport',
  CLEANLINESS = 'cleanliness',
  COMMUNICATION = 'communication',
  VALUE = 'value',
  AMENITIES = 'amenities',
}

@Entity({ name: 'reviews' })
@Index(['entityType', 'entityId'])
export class Review {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // User who wrote the review (from auth-service)
  @Column({ name: 'user_id', type: 'uuid' })
  @Index()
  userId!: string;

  // Type of entity being reviewed (polymorphic relation)
  @Column({
    name: 'entity_type',
    type: 'enum',
    enum: ReviewEntityType,
  })
  @Index()
  entityType!: ReviewEntityType;

  // ID of the entity being reviewed (polymorphic relation)
  @Column({ name: 'entity_id', type: 'uuid' })
  @Index()
  entityId!: string;

  // Rating (1-5 stars)
  @Column({ type: 'integer' })
  rating!: number;

  // Review title
  @Column({ type: 'varchar', length: 200, nullable: true })
  title!: string | null;

  // Review content/comment
  @Column({ type: 'text', nullable: true })
  comment!: string | null;

  // Review status (pending moderation, approved, rejected)
  @Column({
    type: 'varchar',
    length: 20,
    default: 'pending',
  })
  @Index()
  status!: string;

  // Photos attached to review (stored as JSON array of URLs)
  @Column({ type: 'jsonb', nullable: true })
  photos!: string[] | null;

  // Tags/categories for the review (stored as JSON array)
  @Column({ type: 'jsonb', nullable: true })
  tags!: ReviewTag[] | null;

  // Recommendation: would recommend this entity? (yes/no)
  @Column({ type: 'boolean', nullable: true })
  recommended!: boolean | null;

  // Verified purchase/stay (for properties, means user actually stayed/lived there)
  @Column({ name: 'verified', type: 'boolean', default: false })
  verified!: boolean;

  // Visit/stay date (when did the user visit/stay?)
  @Column({ name: 'visit_date', type: 'date', nullable: true })
  visitDate!: Date | null;

  // Helpful votes count (computed from ReviewVote table)
  @Column({ name: 'helpful_count', type: 'integer', default: 0 })
  @Index()
  helpfulCount!: number;

  // Not helpful votes count
  @Column({ name: 'not_helpful_count', type: 'integer', default: 0 })
  notHelpfulCount!: number;

  // Metadata
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
  @OneToMany(() => ReviewPhoto, (photo) => photo.review, {
    cascade: true,
    eager: false,
  })
  reviewPhotos!: ReviewPhoto[];

  @OneToMany(() => ReviewVote, (vote) => vote.review, {
    cascade: false,
    eager: false,
  })
  votes!: ReviewVote[];

  @OneToMany(() => ReviewResponseEntity, (response) => response.review, {
    cascade: true,
    eager: false,
  })
  responses!: ReviewResponseEntity[];
}

