import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CustomFieldValue } from './custom-field-value.entity';

/**
 * Custom Field Definition - Définition d'un champ personnalisé réutilisable
 * Permet aux agents/admins de créer des champs personnalisés pour les entités
 */
export enum CustomFieldType {
  TEXT = 'text',
  TEXTAREA = 'textarea',
  NUMBER = 'number',
  DATE = 'date',
  DATETIME = 'datetime',
  BOOLEAN = 'boolean',
  SELECT = 'select',
  MULTISELECT = 'multiselect',
  URL = 'url',
  EMAIL = 'email',
}

@Entity({ name: 'custom_field_definitions' })
@Index(['organizationId', 'entityType', 'fieldKey'], { unique: true })
export class CustomFieldDefinition {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Multi-tenant isolation
  @Column({ name: 'organization_id', type: 'uuid', nullable: true })
  @Index()
  organizationId!: string | null; // null = global (admin système)

  // Entity type this field applies to
  @Column({ name: 'entity_type', type: 'varchar', length: 50 })
  @Index()
  entityType!: string; // 'property', 'lead', 'agency', etc.

  // Unique field key (slug) per organization and entity type
  @Column({ name: 'field_key', type: 'varchar', length: 100 })
  fieldKey!: string; // e.g., 'swimming_pool_size', 'year_built'

  // Multilingual label (JSON: { "en": "Swimming Pool Size", "fr": "Taille de la piscine" })
  @Column({ type: 'jsonb' })
  label!: Record<string, string>;

  // Field type
  @Column({
    name: 'field_type',
    type: 'enum',
    enum: CustomFieldType,
  })
  fieldType!: CustomFieldType;

  // Validation rules
  @Column({ name: 'required', type: 'boolean', default: false })
  required!: boolean;

  @Column({ name: 'default_value', type: 'jsonb', nullable: true })
  defaultValue!: any | null;

  @Column({ name: 'validation_rules', type: 'jsonb', nullable: true })
  validationRules!: Record<string, any> | null; // { min, max, pattern, etc. }

  // Options for select/multiselect (JSON array)
  @Column({ type: 'jsonb', nullable: true })
  options!: string[] | null;

  // Reusability
  @Column({ type: 'boolean', default: false })
  reusable!: boolean;

  @Column({ name: 'reusable_entity_types', type: 'jsonb', nullable: true })
  reusableEntityTypes!: string[] | null; // ['lead', 'agency']

  // Soft delete
  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  @Index()
  deletedAt!: Date | null;

  // Metadata
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relations
  @OneToMany(() => CustomFieldValue, (value) => value.fieldDefinition, {
    cascade: false,
  })
  values!: CustomFieldValue[];
}

