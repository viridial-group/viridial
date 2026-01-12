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

export type FeatureCategory = 'ai' | 'sales' | 'marketing' | 'support' | 'inventory' | 'project' | 'analytics' | 'collaboration' | 'productivity' | 'integration' | 'administration' | 'other';

@Entity({ name: 'plan_features' })
@Index(['planId', 'category'])
@Index(['planId', 'isIncluded'])
export class PlanFeature {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ name: 'internal_code', type: 'varchar', length: 50, unique: true })
  internalCode!: string;

  @Index()
  @Column({ name: 'plan_id', type: 'uuid' })
  planId!: string;

  @ManyToOne(() => Plan, (plan) => plan.features, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'plan_id' })
  plan!: Plan;

  @Column({ type: 'varchar', length: 200 })
  name!: string; // e.g., "Predictive AI", "Lead Auto-assignment"

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Index()
  @Column({ type: 'enum', enum: ['ai', 'sales', 'marketing', 'support', 'inventory', 'project', 'analytics', 'collaboration', 'productivity', 'integration', 'administration', 'other'], nullable: true })
  category?: FeatureCategory;

  @Column({ name: 'is_included', type: 'boolean', default: true })
  isIncluded!: boolean; // Whether this feature is included in the plan

  @Column({ name: 'display_order', type: 'integer', default: 0 })
  displayOrder!: number; // Order for UI display

  // Metadata
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @BeforeInsert()
  generateInternalCode() {
    if (!this.internalCode) {
      this.internalCode = generateInternalCode(ENTITY_PREFIXES.PLAN_FEATURE);
    }
  }
}

