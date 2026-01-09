import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Form } from './form.entity';

export enum LandingPageStatus {
  DRAFT = 'draft',
  PUBLISHED = 'published',
  ARCHIVED = 'archived',
}

@Entity('marketing_landing_pages')
export class LandingPage {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, unique: true })
  slug: string; // URL friendly

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'text' })
  htmlContent: string; // Contenu HTML de la landing page

  @Column({ type: 'jsonb', nullable: true })
  metadata: Record<string, any>; // SEO, meta tags, etc.

  @Column({
    type: 'enum',
    enum: LandingPageStatus,
    default: LandingPageStatus.DRAFT,
  })
  status: LandingPageStatus;

  @Column({ type: 'uuid', nullable: true })
  formId: string; // Formulaire associé à la landing page

  @Column({ type: 'int', default: 0 })
  viewCount: number;

  @Column({ type: 'int', default: 0 })
  conversionCount: number;

  @Column({ type: 'decimal', precision: 5, scale: 2, default: 0 })
  conversionRate: number;

  @Column({ type: 'uuid' })
  organizationId: string;

  @Column({ type: 'uuid', nullable: true })
  createdById: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Form, (form) => form.landingPage)
  forms: Form[];
}

