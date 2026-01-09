import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Form } from './form.entity';
import { MarketingLead } from './marketing-lead.entity';

@Entity('marketing_form_submissions')
export class FormSubmission {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  formId: string;

  @ManyToOne(() => Form, (form) => form.submissions)
  @JoinColumn({ name: 'formId' })
  form: Form;

  @Column({ type: 'uuid', nullable: true })
  leadId: string;

  @ManyToOne(() => MarketingLead, (lead) => lead.formSubmissions, { nullable: true })
  @JoinColumn({ name: 'leadId' })
  lead: MarketingLead;

  @Column({ type: 'jsonb' })
  data: Record<string, any>; // Données soumises

  @Column({ type: 'varchar', length: 255, nullable: true })
  ipAddress: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  userAgent: string;

  @Column({ type: 'varchar', length: 50, nullable: true })
  referrer: string;

  @Column({ type: 'uuid' })
  organizationId: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

