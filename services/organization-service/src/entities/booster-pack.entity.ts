import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  Index,
  BeforeInsert,
} from 'typeorm';
import { Subscription } from './subscription.entity';
import { generateInternalCode, ENTITY_PREFIXES } from '../utils/code-generator';

export type BoosterPackType = 'users' | 'storage' | 'emails' | 'api_calls' | 'records' | 'custom';

/**
 * Booster Packs are add-ons that increase specific feature limits
 * without requiring a full plan upgrade
 */
@Entity({ name: 'booster_packs' })
@Index(['isActive', 'boosterPackType'])
export class BoosterPack {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ name: 'internal_code', type: 'varchar', length: 50, unique: true })
  internalCode!: string;

  @Index()
  @Column({ name: 'external_code', type: 'varchar', length: 255, nullable: true })
  externalCode?: string | null;

  @Column({ type: 'varchar', length: 200 })
  name!: string; // e.g., "Extra Users Pack", "Storage Boost"

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Index()
  @Column({ name: 'booster_pack_type', type: 'enum', enum: ['users', 'storage', 'emails', 'api_calls', 'records', 'custom'] })
  boosterPackType!: BoosterPackType;

  // What this booster pack increases
  @Column({ name: 'limit_type', type: 'varchar', length: 100 })
  limitType!: string; // e.g., "users", "storage_gb", "emails_per_month"

  @Column({ name: 'limit_increase', type: 'integer' })
  limitIncrease!: number; // How much to increase (e.g., +10 users, +50 GB)

  @Column({ name: 'limit_unit', type: 'varchar', length: 50, nullable: true })
  limitUnit?: string | null; // e.g., "users", "GB", "emails/month"

  // Pricing
  @Column({ name: 'monthly_price', type: 'decimal', precision: 10, scale: 2 })
  monthlyPrice!: number; // Price per month

  @Column({ name: 'annual_price', type: 'decimal', precision: 10, scale: 2, nullable: true })
  annualPrice?: number | null; // Price per year (if different from monthly * 12)

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'display_order', type: 'integer', default: 0 })
  displayOrder!: number;

  // Metadata
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relations - Many-to-many with Subscriptions
  @ManyToMany(() => Subscription, (subscription) => subscription.boosterPacks)
  @JoinTable({
    name: 'subscription_booster_packs',
    joinColumn: { name: 'booster_pack_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'subscription_id', referencedColumnName: 'id' },
  })
  subscriptions?: Subscription[];

  @BeforeInsert()
  generateInternalCode() {
    if (!this.internalCode) {
      this.internalCode = generateInternalCode(ENTITY_PREFIXES.BOOSTER_PACK);
    }
  }
}

