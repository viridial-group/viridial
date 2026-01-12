import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Subscription } from './subscription.entity';

export type UserType = 'standard' | 'single_app';
export type SingleAppType = 'sales' | 'marketing' | 'support' | 'projects' | 'inventory';

/**
 * Junction table linking users to their subscription and user type
 * Tracks which users are standard vs single app users
 */
@Entity({ name: 'user_plans' })
@Index(['userId', 'subscriptionId'], { unique: true })
@Index(['subscriptionId', 'userType'])
export class UserPlan {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ name: 'user_id', type: 'uuid' })
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'user_id' })
  user!: User;

  @Index()
  @Column({ name: 'subscription_id', type: 'uuid' })
  subscriptionId!: string;

  @ManyToOne(() => Subscription, (subscription) => subscription.userPlans, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'subscription_id' })
  subscription!: Subscription;

  @Index()
  @Column({ name: 'user_type', type: 'enum', enum: ['standard', 'single_app'], default: 'standard' })
  userType!: UserType;

  // For single app users, specify which app they have access to
  @Column({ name: 'single_app_type', type: 'enum', enum: ['sales', 'marketing', 'support', 'projects', 'inventory'], nullable: true })
  singleAppType?: SingleAppType | null;

  // Metadata
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;
}

