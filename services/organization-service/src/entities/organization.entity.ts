import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
  OneToMany,
  ManyToOne,
  JoinColumn,
  BeforeInsert,
} from 'typeorm';
import { OrganizationAddress } from './organization-address.entity';
import { OrganizationPhone } from './organization-phone.entity';
import { OrganizationEmail } from './organization-email.entity';
import { User } from './user.entity';
import { Role } from './role.entity';
import { Subscription } from './subscription.entity';
import { generateInternalCode, ENTITY_PREFIXES } from '../utils/code-generator';

export type Plan = 'free' | 'basic' | 'professional' | 'enterprise';
export type LegalForm = 'SARL' | 'SA' | 'SAS' | 'SNC' | 'EURL' | 'SELARL' | 'SCI' | 'Other';
export type SubscriptionStatus = 'active' | 'trial' | 'suspended' | 'cancelled' | 'expired';
export type ComplianceStatus = 'compliant' | 'pending' | 'non_compliant' | 'under_review';

@Entity({ name: 'organizations' })
@Index(['country', 'city']) // Composite index for location filtering
@Index(['isActive', 'plan']) // Composite index for stats and filtering
@Index(['parentId', 'isActive']) // Composite index for hierarchical queries with status
@Index(['subscriptionStatus', 'complianceStatus']) // Composite index for compliance queries
@Index(['createdAt']) // Index for date sorting
@Index(['updatedAt']) // Index for date sorting
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index()
  @Column({ type: 'varchar', length: 400 })
  name!: string;

  @Index({ unique: true })
  @Column({ type: 'varchar', length: 255, unique: true })
  slug!: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'varchar', length: 500, nullable: true })
  logo?: string;

  @Index()
  @Column({ type: 'enum', enum: ['free', 'basic', 'professional', 'enterprise'], default: 'free' })
  plan!: Plan;

  @Column({ name: 'max_users', type: 'integer', default: 10 })
  maxUsers!: number;

  @Index()
  @Column({ name: 'is_active', type: 'boolean', default: true })
  isActive!: boolean;

  @Index()
  @Column({ type: 'varchar', length: 100, nullable: true })
  country?: string;

  @Index()
  @Column({ type: 'varchar', length: 100, nullable: true })
  city?: string;

  // Parent-child relationship for hierarchical organizations
  @Index('idx_organization_parent_id')
  @Column({ name: 'parent_id', type: 'uuid', nullable: true })
  parentId?: string | null;

  @ManyToOne(() => Organization, (org: Organization) => org.children, { nullable: true, onDelete: 'SET NULL' })
  @JoinColumn({ name: 'parent_id' })
  parent?: Organization | null;

  @OneToMany(() => Organization, (org: Organization) => org.parent, { cascade: false, eager: false })
  children?: Organization[];

  // Legal and administrative information
  @Column({ name: 'legal_name', type: 'varchar', length: 400, nullable: true })
  legalName?: string;

  @Index()
  @Column({ name: 'registration_number', type: 'varchar', length: 100, nullable: true })
  registrationNumber?: string;

  @Index()
  @Column({ name: 'vat_number', type: 'varchar', length: 100, nullable: true })
  vatNumber?: string;

  @Column({ name: 'legal_form', type: 'enum', enum: ['SARL', 'SA', 'SAS', 'SNC', 'EURL', 'SELARL', 'SCI', 'Other'], nullable: true })
  legalForm?: LegalForm;

  @Index()
  @Column({ name: 'rcs_number', type: 'varchar', length: 100, nullable: true })
  rcsNumber?: string;

  @Index()
  @Column({ type: 'varchar', length: 20, nullable: true })
  siren?: string;

  @Index()
  @Column({ type: 'varchar', length: 20, nullable: true })
  siret?: string;

  @Column({ name: 'founding_date', type: 'date', nullable: true })
  foundingDate?: Date;

  // Financial and commercial information
  @Column({ type: 'varchar', length: 10, nullable: true, default: 'EUR' })
  currency?: string;

  @Column({ name: 'commission_rate', type: 'decimal', precision: 5, scale: 2, nullable: true })
  commissionRate?: number;

  @Column({ name: 'payment_terms', type: 'varchar', length: 200, nullable: true })
  paymentTerms?: string;

  @Column({ name: 'billing_email', type: 'varchar', length: 255, nullable: true })
  billingEmail?: string;

  // Business information
  @Column({ type: 'varchar', length: 500, nullable: true })
  website?: string;

  @Index()
  @Column({ type: 'varchar', length: 200, nullable: true })
  industry?: string;

  @Column({ type: 'text', array: true, nullable: true })
  specialties?: string[];

  @Column({ name: 'year_established', type: 'integer', nullable: true })
  yearEstablished?: number;

  @Column({ type: 'varchar', array: true, nullable: true })
  languages?: string[];

  // Social networks (stored as JSONB for flexibility)
  @Column({ name: 'social_networks', type: 'jsonb', nullable: true })
  socialNetworks?: {
    facebook?: string;
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
  };

  // Management information
  @Column({ name: 'manager_name', type: 'varchar', length: 200, nullable: true })
  managerName?: string;

  @Column({ name: 'manager_email', type: 'varchar', length: 255, nullable: true })
  managerEmail?: string;

  @Column({ name: 'manager_phone', type: 'varchar', length: 50, nullable: true })
  managerPhone?: string;

  @Column({ type: 'text', nullable: true })
  notes?: string;

  @Column({ type: 'varchar', array: true, nullable: true })
  tags?: string[];

  @Index({ unique: true })
  @Column({ name: 'internal_code', type: 'varchar', length: 50, unique: true })
  internalCode!: string;

  @Index()
  @Column({ name: 'external_code', type: 'varchar', length: 255, nullable: true })
  externalCode?: string | null;

  // Contractual information
  @Column({ name: 'contract_start_date', type: 'date', nullable: true })
  contractStartDate?: Date;

  @Column({ name: 'contract_end_date', type: 'date', nullable: true })
  contractEndDate?: Date;

  @Column({ name: 'contract_renewal_date', type: 'date', nullable: true })
  contractRenewalDate?: Date;

  @Column({ name: 'subscription_status', type: 'enum', enum: ['active', 'trial', 'suspended', 'cancelled', 'expired'], nullable: true })
  subscriptionStatus?: SubscriptionStatus;

  // Compliance information
  @Column({ name: 'compliance_status', type: 'enum', enum: ['compliant', 'pending', 'non_compliant', 'under_review'], nullable: true })
  complianceStatus?: ComplianceStatus;

  @Column({ name: 'last_compliance_check', type: 'timestamptz', nullable: true })
  lastComplianceCheck?: Date;

  @Column({ name: 'license_number', type: 'varchar', length: 100, nullable: true })
  licenseNumber?: string;

  @Column({ name: 'license_authority', type: 'varchar', length: 200, nullable: true })
  licenseAuthority?: string;

  @Column({ name: 'license_expiry_date', type: 'date', nullable: true })
  licenseExpiryDate?: Date;

  // Relations - Multiple addresses, phones, emails
  @OneToMany(() => OrganizationAddress, (address: OrganizationAddress) => address.organization, { cascade: true, eager: false })
  addresses?: OrganizationAddress[];

  @OneToMany(() => OrganizationPhone, (phone: OrganizationPhone) => phone.organization, { cascade: true, eager: false })
  phones?: OrganizationPhone[];

  @OneToMany(() => OrganizationEmail, (email: OrganizationEmail) => email.organization, { cascade: true, eager: false })
  emails?: OrganizationEmail[];

  // Relations - Users and Roles
  @OneToMany(() => User, (user: User) => user.organization, { cascade: false, eager: false })
  users?: User[];

  @OneToMany(() => Role, (role: Role) => role.organization, { cascade: false, eager: false })
  roles?: Role[];

  // Relations - Subscription
  @OneToMany(() => Subscription, (subscription) => subscription.organization, { cascade: false, eager: false })
  subscriptions?: Subscription[];

  // Metadata
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @Column({ name: 'created_by', type: 'uuid', nullable: true })
  createdBy?: string;

  @Column({ name: 'updated_by', type: 'uuid', nullable: true })
  updatedBy?: string;

  @BeforeInsert()
  generateInternalCode() {
    if (!this.internalCode) {
      this.internalCode = generateInternalCode(ENTITY_PREFIXES.ORGANIZATION);
    }
  }
}
