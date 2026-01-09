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
import { Campaign } from './campaign.entity';
import { MarketingLead } from './marketing-lead.entity';
import { EmailTemplate } from './email-template.entity';

export enum EmailQueueStatus {
  PENDING = 'pending',
  SENDING = 'sending',
  SENT = 'sent',
  FAILED = 'failed',
  BOUNCED = 'bounced',
}

@Entity('marketing_email_queue')
export class EmailQueue {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid', nullable: true })
  campaignId: string;

  @ManyToOne(() => Campaign, { nullable: true })
  @JoinColumn({ name: 'campaignId' })
  campaign: Campaign;

  @Column({ type: 'uuid' })
  leadId: string;

  @ManyToOne(() => MarketingLead)
  @JoinColumn({ name: 'leadId' })
  lead: MarketingLead;

  @Column({ type: 'uuid', nullable: true })
  emailTemplateId: string;

  @ManyToOne(() => EmailTemplate, { nullable: true })
  @JoinColumn({ name: 'emailTemplateId' })
  emailTemplate: EmailTemplate;

  @Column({ type: 'varchar', length: 255 })
  to: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  subject: string;

  @Column({ type: 'text' })
  htmlContent: string;

  @Column({ type: 'text', nullable: true })
  textContent: string;

  @Column({
    type: 'enum',
    enum: EmailQueueStatus,
    default: EmailQueueStatus.PENDING,
  })
  status: EmailQueueStatus;

  @Column({ type: 'timestamp', nullable: true })
  scheduledAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  sentAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  openedAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  clickedAt: Date;

  @Column({ type: 'int', default: 0 })
  openCount: number;

  @Column({ type: 'int', default: 0 })
  clickCount: number;

  @Column({ type: 'text', nullable: true })
  errorMessage: string;

  @Column({ type: 'int', default: 0 })
  retryCount: number;

  @Column({ type: 'uuid', nullable: true })
  trackingId: string; // Pour le pixel de tracking

  @Index()
  @Column({ type: 'uuid' })
  organizationId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

