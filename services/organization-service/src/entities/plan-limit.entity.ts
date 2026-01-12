import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
  BeforeInsert,
} from 'typeorm';
import { Plan } from './plan.entity';
import { generateInternalCode, ENTITY_PREFIXES } from '../utils/code-generator';

export type LimitType = 'users' | 'records' | 'storage' | 'emails' | 'api_calls' | 'integrations' | 'custom';

@Entity({ name: 'plan_limits' })
@Index(['planId', 'limitType'])
export class PlanLimit {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ name: 'internal_code', type: 'varchar', length: 50, unique: true })
  internalCode!: string;

  @Index()
  @Column({ name: 'plan_id', type: 'uuid' })
  planId!: string;

  @ManyToOne(() => Plan, (plan) => plan.limits, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'plan_id' })
  plan!: Plan;

  @Index()
  @Column({ name: 'limit_type', type: 'enum', enum: ['users', 'records', 'storage', 'emails', 'api_calls', 'integrations', 'custom'] })
  limitType!: LimitType;

  @Column({ name: 'limit_name', type: 'varchar', length: 100 })
  limitName!: string; // e.g., "Max Users", "Max Records", "Storage (GB)"

  @Column({ name: 'limit_value', type: 'integer', nullable: true })
  limitValue?: number | null; // Numeric limit (null = unlimited)

  @Column({ name: 'limit_unit', type: 'varchar', length: 50, nullable: true })
  limitUnit?: string | null; // e.g., "users", "GB", "emails/month", "records"

  @Column({ name: 'is_unlimited', type: 'boolean', default: false })
  isUnlimited!: boolean; // Whether this limit is unlimited

  @Column({ type: 'text', nullable: true })
  description?: string;

  // Metadata
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @BeforeInsert()
  generateInternalCode() {
    if (!this.internalCode) {
      this.internalCode = generateInternalCode(ENTITY_PREFIXES.PLAN_LIMIT);
    }
  }
}

