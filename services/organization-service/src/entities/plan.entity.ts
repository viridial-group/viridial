import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
  BeforeInsert,
} from 'typeorm';
import { PlanFeature } from './plan-feature.entity';
import { PlanLimit } from './plan-limit.entity';
import { Subscription } from './subscription.entity';
import { generateInternalCode, ENTITY_PREFIXES } from '../utils/code-generator';

export type PlanType = 'pilot' | 'growth' | 'professional' | 'enterprise' | 'ai';
export type BillingPeriod = 'monthly' | 'annual';

@Entity({ name: 'plans' })
@Index(['isActive', 'planType'])
@Index(['planType', 'billingPeriod'])
export class Plan {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ name: 'internal_code', type: 'varchar', length: 50, unique: true })
  internalCode!: string;

  @Index()
  @Column({ name: 'external_code', type: 'varchar', length: 255, nullable: true })
  externalCode?: string | null;

  @Index()
  @Column({ name: 'plan_type', type: 'enum', enum: ['pilot', 'growth', 'professional', 'enterprise', 'ai'] })
  planType!: PlanType;

  @Column({ name: 'name', type: 'varchar', length: 100 })
  name!: string; // e.g., "ONE GROWTH", "ONE PROFESSIONAL"

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ name: 'billing_period', type: 'enum', enum: ['monthly', 'annual'], default: 'monthly' })
  billingPeriod!: BillingPeriod;

  // Pricing for Standard Users (full access)
  @Column({ name: 'standard_price', type: 'decimal', precision: 10, scale: 2 })
  standardPrice!: number; // Price per standard user per month

  // Pricing for Single App Users (limited access)
  @Column({ name: 'single_app_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  singleAppPrice?: number | null; // Price per single app user per month

  // Display order for UI
  @Column({ name: 'display_order', type: 'integer', default: 0 })
  displayOrder!: number;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'is_popular', type: 'boolean', default: false })
  isPopular!: boolean; // Mark popular plans (e.g., "POPULAR" badge)

  @Column({ name: 'is_featured', type: 'boolean', default: false })
  isFeatured!: boolean; // Featured plans shown prominently

  // Metadata
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relations
  @OneToMany(() => PlanFeature, (feature) => feature.plan, { cascade: true, eager: false })
  features?: PlanFeature[];

  @OneToMany(() => PlanLimit, (limit) => limit.plan, { cascade: true, eager: false })
  limits?: PlanLimit[];

  @OneToMany(() => Subscription, (subscription) => subscription.plan, { cascade: false, eager: false })
  subscriptions?: Subscription[];

  @BeforeInsert()
  generateInternalCode() {
    if (!this.internalCode) {
      this.internalCode = generateInternalCode(ENTITY_PREFIXES.PLAN);
    }
  }
}

