import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  Index,
} from 'typeorm';

export enum AnalyticsEventType {
  PAGE_VIEW = 'page_view',
  EMAIL_SENT = 'email_sent',
  EMAIL_OPENED = 'email_opened',
  EMAIL_CLICKED = 'email_clicked',
  EMAIL_BOUNCED = 'email_bounced',
  EMAIL_UNSUBSCRIBED = 'email_unsubscribed',
  FORM_SUBMITTED = 'form_submitted',
  LEAD_CREATED = 'lead_created',
  LEAD_UPDATED = 'lead_updated',
  CONVERSION = 'conversion',
}

@Entity('marketing_analytics')
export class Analytics {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({
    type: 'enum',
    enum: AnalyticsEventType,
  })
  eventType: AnalyticsEventType;

  @Column({ type: 'uuid', nullable: true })
  campaignId: string;

  @Column({ type: 'uuid', nullable: true })
  leadId: string;

  @Column({ type: 'uuid', nullable: true })
  workflowId: string;

  @Column({ type: 'uuid', nullable: true })
  formId: string;

  @Column({ type: 'uuid', nullable: true })
  landingPageId: string;

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>; // Données supplémentaires de l'événement

  @Column({ type: 'varchar', length: 255, nullable: true })
  ipAddress: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  userAgent: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  referrer: string;

  @Index()
  @Column({ type: 'uuid' })
  organizationId: string;

  @Index()
  @CreateDateColumn()
  createdAt: Date;
}

