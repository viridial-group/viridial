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
import { Organization } from './organization.entity';
import { generateInternalCode, ENTITY_PREFIXES } from '../utils/code-generator';

export type EmailType = 'main' | 'sales' | 'support' | 'billing' | 'other';

@Entity({ name: 'organization_emails' })
export class OrganizationEmail {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Index({ unique: true })
  @Column({ name: 'internal_code', type: 'varchar', length: 50, unique: true })
  internalCode!: string;

  @Index()
  @Column({ name: 'external_code', type: 'varchar', length: 255, nullable: true })
  externalCode?: string | null;

  @Index()
  @Column({ name: 'organization_id', type: 'uuid' })
  organizationId!: string;

  @ManyToOne(() => Organization, (org: Organization) => org.emails, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'organization_id' })
  organization!: Organization;

  @Index()
  @Column({ type: 'enum', enum: ['main', 'sales', 'support', 'billing', 'other'], default: 'main' })
  type!: EmailType;

  @Index()
  @Column({ type: 'varchar', length: 255 })
  address!: string;

  @Column({ name: 'is_primary', type: 'boolean', default: false })
  isPrimary!: boolean;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  @BeforeInsert()
  generateInternalCode() {
    if (!this.internalCode) {
      this.internalCode = generateInternalCode(ENTITY_PREFIXES.ORGANIZATION_EMAIL);
    }
  }
}

