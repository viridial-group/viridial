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
@Entity({ name: 'neighborhoods' })
export class Neighborhood {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  // Identifiant unique du quartier (slug pour URL)
  @Column({ type: 'varchar', length: 100, unique: true })
  @Index()
  slug!: string;

  // Nom du quartier
  @Column({ type: 'varchar', length: 200 })
  @Index()
  name!: string;

  // Description multilingue (JSON)
  @Column({ type: 'jsonb' })
  description!: {
    fr?: string;
    en?: string;
    [key: string]: string | undefined;
  };

  // Localisation géographique
  @Column({ type: 'varchar', length: 100 })
  @Index()
  city!: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Index()
  region!: string | null;

  @Column({ type: 'varchar', length: 100, nullable: true })
  @Index()
  country!: string | null;

  @Column({ type: 'varchar', length: 20, nullable: true })
  postalCode!: string | null;

  // Centre géographique du quartier
  @Column({ type: 'decimal', precision: 10, scale: 8, nullable: true })
  centerLatitude!: number | null;

  @Column({ type: 'decimal', precision: 11, scale: 8, nullable: true })
  centerLongitude!: number | null;

  // Statistiques du quartier
  @Column({ type: 'jsonb', nullable: true })
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
  @Column({ type: 'jsonb', nullable: true })
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
  @Column({ type: 'jsonb', nullable: true })
  mediaUrls!: string[] | null;

  // Métadonnées
  @Column({ name: 'created_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @CreateDateColumn()
  createdAt!: Date;

  @Column({ name: 'updated_at', type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  @UpdateDateColumn()
  updatedAt!: Date;

  // Relations
  @OneToMany(() => Property, (property) => property.neighborhood)
  properties!: Property[];
}

