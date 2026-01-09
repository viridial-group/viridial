import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Workflow } from './workflow.entity';
import { EmailTemplate } from './email-template.entity';

export enum WorkflowStepType {
  SEND_EMAIL = 'send_email',
  WAIT = 'wait',
  UPDATE_LEAD = 'update_lead',
  ADD_TO_SEGMENT = 'add_to_segment',
  REMOVE_FROM_SEGMENT = 'remove_from_segment',
  CONDITION = 'condition',
}

export enum WaitDurationType {
  MINUTES = 'minutes',
  HOURS = 'hours',
  DAYS = 'days',
  WEEKS = 'weeks',
}

@Entity('marketing_workflow_steps')
export class WorkflowStep {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  workflowId: string;

  @ManyToOne(() => Workflow, (workflow) => workflow.steps, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'workflowId' })
  workflow: Workflow;

  @Column({
    type: 'enum',
    enum: WorkflowStepType,
  })
  type: WorkflowStepType;

  @Column({ type: 'int' })
  order: number; // Ordre d'exécution

  @Column({ type: 'uuid', nullable: true })
  emailTemplateId: string;

  @ManyToOne(() => EmailTemplate, { nullable: true })
  @JoinColumn({ name: 'emailTemplateId' })
  emailTemplate: EmailTemplate;

  @Column({ type: 'jsonb', nullable: true })
  config: Record<string, any>; // Configuration spécifique au type d'étape

  // Pour les étapes WAIT
  @Column({ type: 'int', nullable: true })
  waitDuration: number;

  @Column({
    type: 'enum',
    enum: WaitDurationType,
    nullable: true,
  })
  waitDurationType: WaitDurationType;

  // Pour les étapes CONDITION
  @Column({ type: 'jsonb', nullable: true })
  conditions: Record<string, any>;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

