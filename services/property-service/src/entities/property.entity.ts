import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { PropertyTranslation } from './property-translation.entity';
import { Neighborhood } from './neighborhood.entity';
import { PropertyDetails } from './property-details.entity';

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

  // Internal code generated automatically by service (format: PROP-YYYY-NNNNNN)
  @Column({ name: 'internal_code', type: 'varchar', length: 50, unique: true })
  @Index()
  internalCode!: string;

  // External code for external system reference (optional)
  @Column({ name: 'external_code', type: 'varchar', length: 100, nullable: true })
  @Index()
  externalCode!: string | null;

  // Owner/Agent reference (from auth-service)
  @Column({ name: 'user_id' })
  @Index()
  userId!: string;

  // Status workflow: draft → review → listed (references property_statuses table)
  @Column({ name: 'status_code', type: 'varchar', length: 50, default: 'draft' })
  @Index()
  statusCode!: string;

  // Property type (references property_types table)
  @Column({ name: 'type_code', type: 'varchar', length: 50 })
  @Index()
  typeCode!: string;

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

  // Neighborhood reference
  @Column({ name: 'neighborhood_id', type: 'uuid', nullable: true })
  @Index()
  neighborhoodId!: string | null;

  // Media URLs (JSON array of URLs - will be stored in separate table later)
  @Column({ name: 'media_urls', type: 'jsonb', nullable: true })
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

  // Soft delete
  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  @Index()
  deletedAt!: Date | null;

  // Relations
  @OneToMany(() => PropertyTranslation, (translation) => translation.property, {
    cascade: true,
    eager: false,
  })
  translations!: PropertyTranslation[];

  @ManyToOne(() => Neighborhood, (neighborhood) => neighborhood.properties, {
    nullable: true,
    eager: false,
  })
  @JoinColumn({ name: 'neighborhood_id' })
  neighborhood!: Neighborhood | null;

  // Property details (enriched fields by type)
  @OneToOne(() => PropertyDetails, (details) => details.property, {
    nullable: true,
    eager: false,
  })
  details!: PropertyDetails | null;

  // Getters for backward compatibility with enum-based code
  get status(): PropertyStatus {
    return this.statusCode as PropertyStatus;
  }

  set status(value: PropertyStatus) {
    this.statusCode = value;
  }

  get type(): PropertyType {
    return this.typeCode as PropertyType;
  }

  set type(value: PropertyType) {
    this.typeCode = value;
  }
}

