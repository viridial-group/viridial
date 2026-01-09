import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { Campaign } from './campaign.entity';
import { EmailTemplate } from './email-template.entity';
import { Segment } from './segment.entity';
import { WorkflowStep } from './workflow-step.entity';

export enum WorkflowStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  PAUSED = 'paused',
  ARCHIVED = 'archived',
}

export enum WorkflowTrigger {
  LEAD_CREATED = 'lead_created',
  LEAD_UPDATED = 'lead_updated',
  FORM_SUBMITTED = 'form_submitted',
  EMAIL_OPENED = 'email_opened',
  EMAIL_CLICKED = 'email_clicked',
  DATE_REACHED = 'date_reached',
  MANUAL = 'manual',
}

@Entity('marketing_workflows')
export class Workflow {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: WorkflowStatus,
    default: WorkflowStatus.DRAFT,
  })
  status: WorkflowStatus;

  @Column({
    type: 'enum',
    enum: WorkflowTrigger,
    default: WorkflowTrigger.LEAD_CREATED,
  })
  trigger: WorkflowTrigger;

  @Column({ type: 'jsonb', nullable: true })
  triggerConditions: Record<string, any>; // Conditions pour déclencher le workflow

  @Column({ type: 'uuid', nullable: true })
  segmentId: string;

  @ManyToOne(() => Segment, { nullable: true })
  @JoinColumn({ name: 'segmentId' })
  segment: Segment;

  @Column({ type: 'uuid', nullable: true })
  campaignId: string;

  @ManyToOne(() => Campaign, { nullable: true })
  @JoinColumn({ name: 'campaignId' })
  campaign: Campaign;

  @Column({ type: 'uuid' })
  organizationId: string;

  @Column({ type: 'uuid', nullable: true })
  createdById: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => WorkflowStep, (step) => step.workflow, { cascade: true })
  steps: WorkflowStep[];
}

