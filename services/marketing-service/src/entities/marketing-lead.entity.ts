import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToMany,
  JoinTable,
  OneToMany,
} from 'typeorm';
import { Segment } from './segment.entity';
import { EmailQueue } from './email-queue.entity';
import { FormSubmission } from './form-submission.entity';

export enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  QUALIFIED = 'qualified',
  CONVERTED = 'converted',
  UNSUBSCRIBED = 'unsubscribed',
  BOUNCED = 'bounced',
}

export enum LeadSource {
  WEBSITE = 'website',
  LANDING_PAGE = 'landing_page',
  FORM = 'form',
  IMPORT = 'import',
  API = 'api',
  REFERRAL = 'referral',
  SOCIAL = 'social',
  OTHER = 'other',
}

@Entity('marketing_leads')
export class MarketingLead {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  firstName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  lastName: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  email: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  phone: string;

  @Column({
    type: 'enum',
    enum: LeadStatus,
    default: LeadStatus.NEW,
  })
  status: LeadStatus;

  @Column({
    type: 'enum',
    enum: LeadSource,
    default: LeadSource.WEBSITE,
  })
  source: LeadSource;

  @Column({ type: 'jsonb', nullable: true })
  customFields: Record<string, any>;

  @Column({ type: 'int', default: 0 })
  score: number; // Lead scoring

  @Column({ type: 'int', default: 0 })
  emailOpenedCount: number;

  @Column({ type: 'int', default: 0 })
  emailClickedCount: number;

  @Column({ type: 'boolean', default: false })
  isUnsubscribed: boolean;

  @Column({ type: 'timestamp', nullable: true })
  unsubscribedAt: Date;

  @Column({ type: 'boolean', default: false })
  isBounced: boolean;

  @Column({ type: 'timestamp', nullable: true })
  lastContactedAt: Date;

  @Column({ type: 'uuid' })
  organizationId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @ManyToMany(() => Segment, (segment) => segment.leads)
  @JoinTable({
    name: 'marketing_lead_segments',
    joinColumn: { name: 'leadId', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'segmentId', referencedColumnName: 'id' },
  })
  segments: Segment[];

  @OneToMany(() => EmailQueue, (emailQueue) => emailQueue.lead)
  emailQueues: EmailQueue[];

  @OneToMany(() => FormSubmission, (submission) => submission.lead)
  formSubmissions: FormSubmission[];
}

