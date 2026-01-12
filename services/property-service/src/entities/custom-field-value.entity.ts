import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { CustomFieldDefinition } from './custom-field-definition.entity';

/**
 * Custom Field Value - Valeur d'un champ personnalisé pour une entité
 * Utilise le modèle EAV (Entity-Attribute-Value) pour stocker les valeurs typées
 */
@Entity({ name: 'pr_custom_field_values' })
@Index(['entityType', 'entityId', 'fieldDefinitionId'], { unique: true })
@Index(['organizationId', 'entityType', 'entityId'])
export class CustomFieldValue {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Multi-tenant isolation
  @Column({ name: 'organization_id', type: 'uuid', nullable: true })
  @Index()
  organizationId!: string | null;

  // Entity reference (polymorphic)
  @Column({ name: 'entity_type', type: 'varchar', length: 50 })
  @Index()
  entityType!: string; // 'property', 'lead', 'agency', etc.

  @Column({ name: 'entity_id', type: 'uuid' })
  @Index()
  entityId!: string; // FK vers l'entité (property.id, lead.id, etc.)

  // Field definition reference
  @Column({ name: 'field_definition_id', type: 'uuid' })
  @Index()
  fieldDefinitionId!: string;

  // Typed value columns (only one will be used based on field type)
  @Column({ name: 'value_text', type: 'text', nullable: true })
  valueText!: string | null; // For text, textarea, url, email

  @Column({ name: 'value_number', type: 'decimal', precision: 15, scale: 4, nullable: true })
  valueNumber!: number | null; // For number

  @Column({ name: 'value_date', type: 'timestamp', nullable: true })
  valueDate!: Date | null; // For date, datetime

  @Column({ name: 'value_boolean', type: 'boolean', nullable: true })
  valueBoolean!: boolean | null; // For boolean

  @Column({ name: 'value_json', type: 'jsonb', nullable: true })
  valueJson!: any | null; // For select (single value), multiselect (array), complex data

  // Metadata
  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @CreateDateColumn()
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @UpdateDateColumn()
  updatedAt!: Date;

  // Relations
  @ManyToOne(() => CustomFieldDefinition, (definition) => definition.values, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'field_definition_id' })
  fieldDefinition!: CustomFieldDefinition;
}

