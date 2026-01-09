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

export enum FormFieldType {
  TEXT = 'text',
  EMAIL = 'email',
  PHONE = 'phone',
  TEXTAREA = 'textarea',
  SELECT = 'select',
  CHECKBOX = 'checkbox',
  RADIO = 'radio',
  NUMBER = 'number',
  DATE = 'date',
  URL = 'url',
}

@Entity('marketing_form_fields')
export class FormField {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'uuid' })
  formId: string;

  @ManyToOne(() => Form, (form) => form.fields, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'formId' })
  form: Form;

  @Column({ type: 'varchar', length: 255 })
  label: string;

  @Column({ type: 'varchar', length: 255 })
  name: string; // Nom du champ (pour le mapping)

  @Column({
    type: 'enum',
    enum: FormFieldType,
    default: FormFieldType.TEXT,
  })
  type: FormFieldType;

  @Column({ type: 'boolean', default: false })
  required: boolean;

  @Column({ type: 'text', nullable: true })
  placeholder: string;

  @Column({ type: 'text', nullable: true })
  helpText: string;

  @Column({ type: 'jsonb', nullable: true })
  options: string[]; // Pour les champs SELECT, RADIO, CHECKBOX

  @Column({ type: 'int' })
  order: number; // Ordre d'affichage

  @Column({ type: 'jsonb', nullable: true })
  validation: Record<string, any>; // Règles de validation

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}

