import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { EmailQueue } from './email-queue.entity';
import { Workflow } from './workflow.entity';
import { Segment } from './segment.entity';

export enum CampaignStatus {
  DRAFT = 'draft',
  SCHEDULED = 'scheduled',
  SENDING = 'sending',
  SENT = 'sent',
  PAUSED = 'paused',
  CANCELLED = 'cancelled',
}

export enum CampaignType {
  EMAIL = 'email',
  SMS = 'sms',
  PUSH = 'push',
  MULTI_CHANNEL = 'multi_channel',
}

@Entity('marketing_campaigns')
export class Campaign {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: CampaignType,
    default: CampaignType.EMAIL,
  })
  type: CampaignType;

  @Column({
    type: 'enum',
    enum: CampaignStatus,
    default: CampaignStatus.DRAFT,
  })
  status: CampaignStatus;

  @Column({ type: 'uuid', nullable: true })
  emailTemplateId: string;

  @Column({ type: 'uuid', nullable: true })
  segmentId: string;

  @ManyToOne(() => Segment, { nullable: true })
  @JoinColumn({ name: 'segmentId' })
  segment: Segment;

  @Column({ type: 'varchar', length: 255, nullable: true })
  subject: string;

  @Column({ type: 'text', nullable: true })
  fromName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  fromEmail: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  replyTo: string;

  @Column({ type: 'timestamp', nullable: true })
  scheduledAt: Date;

  @Column({ type: 'timestamp', nullable: true })
  sentAt: Date;

  @Column({ type: 'int', default: 0 })
  totalRecipients: number;

  @Column({ type: 'int', default: 0 })
  sentCount: number;

  @Column({ type: 'int', default: 0 })
  deliveredCount: number;

  @Column({ type: 'int', default: 0 })
  openedCount: number;

  @Column({ type: 'int', default: 0 })
  clickedCount: number;

  @Column({ type: 'int', default: 0 })
  bouncedCount: number;

  @Column({ type: 'int', default: 0 })
  unsubscribedCount: number;

  @Column({ type: 'uuid' })
  organizationId: string;

  @Column({ type: 'uuid', nullable: true })
  createdById: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => EmailQueue, (emailQueue) => emailQueue.campaign)
  emailQueues: EmailQueue[];

  @OneToMany(() => Workflow, (workflow) => workflow.campaign)
  workflows: Workflow[];
}

