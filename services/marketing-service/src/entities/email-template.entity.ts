import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Campaign } from './campaign.entity';
import { WorkflowStep } from './workflow-step.entity';

export enum EmailTemplateCategory {
  WELCOME = 'welcome',
  NURTURING = 'nurturing',
  PROMOTIONAL = 'promotional',
  TRANSACTIONAL = 'transactional',
  ABANDONED_CART = 'abandoned_cart',
  RE_ENGAGEMENT = 're_engagement',
  CUSTOM = 'custom',
}

@Entity('marketing_email_templates')
export class EmailTemplate {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: EmailTemplateCategory,
    default: EmailTemplateCategory.CUSTOM,
  })
  category: EmailTemplateCategory;

  @Column({ type: 'varchar', length: 255 })
  subject: string;

  @Column({ type: 'text' })
  htmlContent: string;

  @Column({ type: 'text', nullable: true })
  textContent: string;

  @Column({ type: 'jsonb', nullable: true })
  variables: Record<string, any>; // Variables disponibles dans le template

  @Column({ type: 'varchar', length: 255, nullable: true })
  previewImage: string;

  @Column({ type: 'boolean', default: false })
  isDefault: boolean;

  @Column({ type: 'uuid' })
  organizationId: string;

  @Column({ type: 'uuid', nullable: true })
  createdById: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Campaign, (campaign) => campaign.emailTemplateId)
  campaigns: Campaign[];

  @OneToMany(() => WorkflowStep, (step) => step.emailTemplate)
  workflowSteps: WorkflowStep[];
}

