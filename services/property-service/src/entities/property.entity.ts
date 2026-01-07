import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PropertyTranslation } from './property-translation.entity';

export enum PropertyStatus {
  DRAFT = 'draft',
  REVIEW = 'review',
  LISTED = 'listed',
  FLAGGED = 'flagged',
  ARCHIVED = 'archived',
}

export enum PropertyType {
  HOUSE = 'house',
  APARTMENT = 'apartment',
  VILLA = 'villa',
  LAND = 'land',
  COMMERCIAL = 'commercial',
  OTHER = 'other',
}

@Entity({ name: 'properties' })
export class Property {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Owner/Agent reference (from auth-service)
  @Column({ name: 'user_id' })
  @Index()
  userId!: string;

  // Status workflow: draft → review → listed
  @Column({
    type: 'enum',
    enum: PropertyStatus,
    default: PropertyStatus.DRAFT,
  })
  status!: PropertyStatus;

  // Property type
  @Column({
    type: 'enum',
    enum: PropertyType,
  })
  type!: PropertyType;

  // Pricing
  @Column({ type: 'decimal', precision: 12, scale: 2 })
  price!: number;

  @Column({ type: 'varchar', length: 3, default: 'EUR' })
  currency!: string;

  // Geolocation (canonical)
  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  latitude!: number | null;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  longitude!: number | null;

  // Structured address components
  @Column({ type: 'varchar', length: 255, nullable: true })
  street!: string | null;

  @Column({ name: 'postal_code', type: 'varchar', length: 20, nullable: true })
  @Index()
  postalCode!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Index()
  city!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  region!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Index()
  country!: string | null;

  // Media URLs (JSON array of URLs - will be stored in separate table later)
  @Column({ type: 'jsonb', nullable: true })
  mediaUrls!: string[] | null;

  // Metadata
  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @CreateDateColumn()
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @UpdateDateColumn()
  updatedAt!: Date;

  @Column({ name: 'published_at', type: 'timestamp', nullable: true })
  publishedAt!: Date | null;

  // Relations
  @OneToMany(() => PropertyTranslation, (translation) => translation.property, {
    cascade: true,
    eager: false,
  })
  translations!: PropertyTranslation[];
}

