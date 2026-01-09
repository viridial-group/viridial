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
import { LandingPage } from './landing-page.entity';
import { FormSubmission } from './form-submission.entity';
import { FormField } from './form-field.entity';

export enum FormType {
  LEAD_CAPTURE = 'lead_capture',
  CONTACT = 'contact',
  NEWSLETTER = 'newsletter',
  SURVEY = 'survey',
  CUSTOM = 'custom',
}

export enum FormStatus {
  DRAFT = 'draft',
  ACTIVE = 'active',
  INACTIVE = 'inactive',
}

@Entity('marketing_forms')
export class Form {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: FormType,
    default: FormType.LEAD_CAPTURE,
  })
  type: FormType;

  @Column({
    type: 'enum',
    enum: FormStatus,
    default: FormStatus.DRAFT,
  })
  status: FormStatus;

  @Column({ type: 'uuid', nullable: true })
  landingPageId: string;

  @ManyToOne(() => LandingPage, (landingPage) => landingPage.forms, { nullable: true })
  @JoinColumn({ name: 'landingPageId' })
  landingPage: LandingPage;

  @Column({ type: 'jsonb', nullable: true })
  settings: Record<string, any>; // Paramètres du formulaire (redirect URL, thank you message, etc.)

  @Column({ type: 'uuid', nullable: true })
  segmentId: string; // Segment auquel ajouter automatiquement les leads

  @Column({ type: 'uuid', nullable: true })
  workflowId: string; // Workflow à déclencher après soumission

  @Column({ type: 'int', default: 0 })
  submissionCount: number;

  @Column({ type: 'uuid' })
  organizationId: string;

  @Column({ type: 'uuid', nullable: true })
  createdById: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => FormField, (field) => field.form, { cascade: true })
  fields: FormField[];

  @OneToMany(() => FormSubmission, (submission) => submission.form)
  submissions: FormSubmission[];
}

