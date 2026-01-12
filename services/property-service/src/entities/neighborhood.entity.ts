import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Property } from './property.entity';

/**
 * Neighborhood (Quartier) Entity
 * Représente un quartier avec ses caractéristiques et statistiques
 */
@Entity({ name: 'pr_neighborhoods' })
export class Neighborhood {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Identifiant unique du quartier (slug pour URL)
  @Column({ name: 'slug', type: 'varchar', length: 100, unique: true })
  @Index()
  slug!: string;

  // Nom du quartier
  @Column({ name: 'name', type: 'varchar', length: 200 })
  @Index()
  name!: string;

  // Description multilingue (JSON)
  @Column({ name: 'description', type: 'jsonb' })
  description!: {
    fr?: string;
    en?: string;
    [key: string]: string | undefined;
  };

  // Localisation géographique
  @Column({ name: 'city', type: 'varchar', length: 100 })
  @Index()
  city!: string;

  @Column({ name: 'region', type: 'varchar', length: 100, nullable: true })
  @Index()
  region!: string | null;

  @Column({ name: 'country', type: 'varchar', length: 100, nullable: true })
  @Index()
  country!: string | null;

  @Column({ name: 'postal_code', type: 'varchar', length: 20, nullable: true })
  @Index()
  postalCode!: string | null;

  // Centre géographique du quartier
  @Column({ name: 'center_latitude', type: 'decimal', precision: 10, scale: 8, nullable: true })
  centerLatitude!: number | null;

  @Column({ name: 'center_longitude', type: 'decimal', precision: 11, scale: 8, nullable: true })
  centerLongitude!: number | null;

  // Statistiques du quartier
  @Column({ name: 'stats', type: 'jsonb', nullable: true })
  stats!: {
    // Prix moyen par type de propriété (EUR)
    averagePrice?: {
      apartment?: number;
      house?: number;
      villa?: number;
      commercial?: number;
      land?: number;
    };
    // Nombre de propriétés
    propertyCount?: number;
    // Prix moyen global
    averagePriceOverall?: number;
    // Prix médian
    medianPrice?: number;
    // Prix min/max
    minPrice?: number;
    maxPrice?: number;
    // Dernière mise à jour des stats
    lastUpdated?: string;
  } | null;

  // Caractéristiques du quartier (JSON)
  @Column({ name: 'features', type: 'jsonb', nullable: true })
  features!: {
    // Transport
    publicTransport?: {
      metro?: boolean;
      tram?: boolean;
      bus?: boolean;
      train?: boolean;
      stations?: string[];
    };
    // Équipements
    amenities?: {
      schools?: number;
      hospitals?: number;
      parks?: number;
      shopping?: boolean;
      restaurants?: boolean;
      nightlife?: boolean;
      beaches?: boolean;
      sports?: boolean;
    };
    // Type de quartier
    type?: 'residential' | 'commercial' | 'mixed' | 'tourist' | 'industrial';
    // Sécurité (note 1-10)
    safetyScore?: number;
    // Qualité de vie (note 1-10)
    qualityOfLife?: number;
    // Démographie
    demographics?: {
      averageAge?: number;
      population?: number;
      familyFriendly?: boolean;
      studentArea?: boolean;
      seniorFriendly?: boolean;
    };
  } | null;

  // Images du quartier
  @Column({ name: 'media_urls',   type: 'jsonb', nullable: true })
  mediaUrls!: string[] | null;

  // Métadonnées
  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt!: Date;

  // Relations
  @OneToMany(() => Property, (property) => property.neighborhood)
  properties!: Property[];
}

