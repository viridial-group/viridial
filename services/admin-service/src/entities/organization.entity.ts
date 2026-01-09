import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
} from 'typeorm';
import { Role } from './role.entity';
import { User } from './user.entity';

@Entity({ name: 'organizations' })
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ type: 'varchar', length: 200 })
  name!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 100, unique: true })
  slug!: string;

  @Column({ name: 'contact_email', type: 'varchar', length: 255 })
  contactEmail!: string;

  @Column({ name: 'contact_phone', type: 'varchar', length: 20, nullable: true })
  contactPhone?: string;

  @Column({ name: 'address_street', type: 'varchar', length: 255, nullable: true })
  addressStreet?: string;

  @Column({ name: 'address_city', type: 'varchar', length: 100, nullable: true })
  addressCity?: string;

  @Column({ name: 'address_postal_code', type: 'varchar', length: 20, nullable: true })
  addressPostalCode?: string;

  @Column({ name: 'address_country', type: 'varchar', length: 100, nullable: true, default: 'France' })
  addressCountry?: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata?: Record<string, any>;

  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Column({ name: 'subscription_plan', type: 'varchar', length: 50, nullable: true })
  subscriptionPlan?: string;

  @Column({ name: 'subscription_status', type: 'varchar', length: 50, default: 'trial' })
  subscriptionStatus!: string;

  @Column({ name: 'trial_ends_at', type: 'timestamptz', nullable: true })
  trialEndsAt?: Date;

  @Column({ name: 'max_users', type: 'integer', default: 10 })
  maxUsers!: number;

  @Column({ name: 'max_properties', type: 'integer', default: 100 })
  maxProperties!: number;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relations
  @OneToMany(() => Role, (role) => role.organization)
  roles!: Role[];

  @OneToMany(() => User, (user) => user.organization)
  users!: User[];
}

