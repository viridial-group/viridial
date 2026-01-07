import {
  Column,
  Entity,
  Index,
  ManyToOne,
  PrimaryGeneratedColumn,
  JoinColumn,
  Unique,
} from 'typeorm';
import { Property } from './property.entity';

@Entity({ name: 'property_translations' })
@Unique(['propertyId', 'language'])
export class PropertyTranslation {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'property_id' })
  @Index()
  propertyId!: string;

  @ManyToOne(() => Property, (property) => property.translations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'property_id' })
  property!: Property;

  // ISO 639-1 language code (fr, en, es, etc.)
  @Column({ type: 'varchar', length: 5 })
  @Index()
  language!: string;

  // Translatable fields
  @Column({ type: 'varchar', length: 255 })
  title!: string;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @Column({ type: 'text', nullable: true })
  notes!: string | null;

  // SEO fields
  @Column({ name: 'meta_title', type: 'varchar', length: 255, nullable: true })
  metaTitle!: string | null;

  @Column({ name: 'meta_description', type: 'text', nullable: true })
  metaDescription!: string | null;
}

