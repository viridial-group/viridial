import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  OneToMany,
  ManyToMany,
  BeforeInsert,
} from 'typeorm';
import { Plan } from './plan.entity';
import { Organization } from './organization.entity';
import { UserPlan } from './user-plan.entity';
import { BoosterPack } from './booster-pack.entity';
import { generateInternalCode, ENTITY_PREFIXES } from '../utils/code-generator';

export type SubscriptionStatus = 'trial' | 'active' | 'suspended' | 'cancelled' | 'expired';
export type UserType = 'standard' | 'single_app';

@Entity({ name: 'subscriptions' })
@Index(['organizationId', 'status'])
@Index(['planId', 'status'])
@Index(['status', 'currentPeriodEnd'])
export class Subscription {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ name: 'internal_code', type: 'varchar', length: 50, unique: true })
  internalCode!: string;

  @Index()
  @Column({ name: 'organization_id', type: 'uuid' })
  organizationId!: string;

  @ManyToOne(() => Organization, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organization_id' })
  organization!: Organization;

  @Index()
  @Column({ name: 'plan_id', type: 'uuid' })
  planId!: string;

  @ManyToOne(() => Plan, (plan) => plan.subscriptions, { onDelete: 'RESTRICT' })
  @JoinColumn({ name: 'plan_id' })
  plan!: Plan;

  @Index()
  @Column({ name: 'status', type: 'enum', enum: ['trial', 'active', 'suspended', 'cancelled', 'expired'], default: 'trial' })
  status!: SubscriptionStatus;

  // User counts
  @Column({ name: 'standard_users_count', type: 'integer', default: 0 })
  standardUsersCount!: number; // Number of standard users

  @Column({ name: 'single_app_users_count', type: 'integer', default: 0 })
  singleAppUsersCount!: number; // Number of single app users

  // Billing information
  @Column({ name: 'billing_period', type: 'enum', enum: ['monthly', 'annual'], default: 'monthly' })
  billingPeriod!: 'monthly' | 'annual';

  @Column({ name: 'monthly_amount', type: 'decimal', precision: 10, scale: 2 })
  monthlyAmount!: number; // Total monthly amount

  @Column({ name: 'currency', type: 'varchar', length: 10, default: 'USD' })
  currency!: string;

  // Trial information
  @Column({ name: 'trial_start_date', type: 'timestamptz', nullable: true })
  trialStartDate?: Date | null;

  @Column({ name: 'trial_end_date', type: 'timestamptz', nullable: true })
  trialEndDate?: Date | null;

  @Column({ name: 'trial_days', type: 'integer', nullable: true })
  trialDays?: number | null; // Number of trial days (e.g., 15)

  // Subscription periods
  @Column({ name: 'current_period_start', type: 'timestamptz', nullable: true })
  currentPeriodStart?: Date | null;

  @Column({ name: 'current_period_end', type: 'timestamptz', nullable: true })
  currentPeriodEnd?: Date | null;

  @Column({ name: 'cancel_at_period_end', type: 'boolean', default: false })
  cancelAtPeriodEnd!: boolean; // Cancel at end of current period

  @Column({ name: 'cancelled_at', type: 'timestamptz', nullable: true })
  cancelledAt?: Date | null;

  // Payment information
  @Column({ name: 'last_payment_date', type: 'timestamptz', nullable: true })
  lastPaymentDate?: Date | null;

  @Column({ name: 'next_payment_date', type: 'timestamptz', nullable: true })
  nextPaymentDate?: Date | null;

  @Column({ name: 'payment_method', type: 'varchar', length: 100, nullable: true })
  paymentMethod?: string | null; // e.g., "credit_card", "bank_transfer"

  // Relations
  @OneToMany(() => UserPlan, (userPlan) => userPlan.subscription, { cascade: true, eager: false })
  userPlans?: UserPlan[];

  @ManyToMany(() => BoosterPack, (boosterPack) => boosterPack.subscriptions)
  boosterPacks?: BoosterPack[];

  // Metadata
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @BeforeInsert()
  generateInternalCode() {
    if (!this.internalCode) {
      this.internalCode = generateInternalCode(ENTITY_PREFIXES.SUBSCRIPTION);
    }
  }
}

