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
import { Property } from './property.entity';

export enum FlagStatus {
  PENDING = 'pending',
  REVIEWED = 'reviewed',
  RESOLVED = 'resolved',
}

@Entity({ name: 'pr_property_flags' })
export class PropertyFlag {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'property_id' })
  @Index()
  propertyId!: string;

  @Column({ name: 'flagged_by' })
  @Index()
  flaggedBy!: string; // userId

  @Column({ type: 'text' })
  reason!: string;

  @Column({
    type: 'enum',
    enum: FlagStatus,
    default: FlagStatus.PENDING,
  })
  status!: FlagStatus; // pending, reviewed, resolved

  @Column({ name: 'reviewed_by', nullable: true })
  reviewedBy!: string | null; // admin userId

  @Column({ name: 'reviewed_at', type: 'timestamp', nullable: true })
  reviewedAt!: Date | null;

  @Column({ name: 'moderation_action', type: 'varchar', length: 50, nullable: true })
  moderationAction!: string | null; // approve, reject, takedown

  @Column({ type: 'text', nullable: true })
  moderationNotes!: string | null;

  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relations
  @ManyToOne(() => Property, { nullable: false })
  @JoinColumn({ name: 'property_id' })
  property!: Property;
}

