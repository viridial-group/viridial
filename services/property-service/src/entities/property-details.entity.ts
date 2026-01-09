import {
  Column,
  Entity,
  Index,
  JoinColumn,
  OneToOne,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Property } from './property.entity';

/**
 * Property Details - Champs enrichis selon le type de bien
 * Stocke les détails spécifiques à chaque type de propriété
 */
@Entity({ name: 'property_details' })
export class PropertyDetails {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column({ name: 'property_id', unique: true })
  @Index()
  propertyId!: string;

  // Surface et dimensions (tous types)
  @Column({ type: 'decimal', precision: 10, scale: 2, nullable: true })
  surfaceArea!: number | null; // m²

  @Column({ name: 'land_area', type: 'decimal', precision: 10, scale: 2, nullable: true })
  landArea!: number | null; // m² (pour maisons/villas avec terrain)

  // Chambres et pièces (house, apartment, villa)
  @Column({ type: 'int', nullable: true })
  bedrooms!: number | null;

  @Column({ type: 'int', nullable: true })
  bathrooms!: number | null;

  @Column({ name: 'total_rooms', type: 'int', nullable: true })
  totalRooms!: number | null;

  // Caractéristiques (house, apartment, villa)
  @Column({ name: 'has_garage', type: 'boolean', default: false })
  hasGarage!: boolean;

  @Column({ name: 'garage_spaces', type: 'int', nullable: true })
  garageSpaces!: number | null;

  @Column({ name: 'has_parking', type: 'boolean', default: false })
  hasParking!: boolean;

  @Column({ name: 'parking_spaces', type: 'int', nullable: true })
  parkingSpaces!: number | null;

  @Column({ name: 'has_elevator', type: 'boolean', default: false })
  hasElevator!: boolean;

  @Column({ name: 'has_balcony', type: 'boolean', default: false })
  hasBalcony!: boolean;

  @Column({ name: 'has_terrace', type: 'boolean', default: false })
  hasTerrace!: boolean;

  @Column({ name: 'has_garden', type: 'boolean', default: false })
  hasGarden!: boolean;

  @Column({ name: 'has_pool', type: 'boolean', default: false })
  hasPool!: boolean;

  @Column({ name: 'has_fireplace', type: 'boolean', default: false })
  hasFireplace!: boolean;

  @Column({ name: 'has_air_conditioning', type: 'boolean', default: false })
  hasAirConditioning!: boolean;

  @Column({ name: 'has_heating', type: 'boolean', default: false })
  hasHeating!: boolean;

  // Appartement spécifique
  @Column({ name: 'floor_number', type: 'int', nullable: true })
  floorNumber!: number | null;

  @Column({ name: 'total_floors', type: 'int', nullable: true })
  totalFloors!: number | null;

  @Column({ name: 'has_storage', type: 'boolean', default: false })
  hasStorage!: boolean;

  // Maison/Villa spécifique
  @Column({ name: 'construction_year', type: 'int', nullable: true })
  constructionYear!: number | null;

  @Column({ name: 'renovation_year', type: 'int', nullable: true })
  renovationYear!: number | null;

  @Column({ name: 'energy_class', type: 'varchar', length: 10, nullable: true })
  energyClass!: string | null; // A, B, C, D, E, F, G

  @Column({ name: 'energy_consumption', type: 'decimal', precision: 10, scale: 2, nullable: true })
  energyConsumption!: number | null; // kWh/m²/year

  @Column({ name: 'greenhouse_gas_emissions', type: 'decimal', precision: 10, scale: 2, nullable: true })
  greenhouseGasEmissions!: number | null; // kg CO2/m²/year

  // Terrain spécifique
  @Column({ name: 'zoning', type: 'varchar', length: 50, nullable: true })
  zoning!: string | null; // Residential, Commercial, Mixed, etc.

  @Column({ name: 'buildable', type: 'boolean', nullable: true })
  buildable!: boolean | null;

  @Column({ name: 'building_rights', type: 'decimal', precision: 10, scale: 2, nullable: true })
  buildingRights!: number | null; // m² constructibles

  // Commercial spécifique
  @Column({ name: 'commercial_type', type: 'varchar', length: 50, nullable: true })
  commercialType!: string | null; // Office, Retail, Warehouse, Restaurant, etc.

  @Column({ name: 'business_license', type: 'boolean', default: false })
  businessLicense!: boolean;

  @Column({ name: 'max_capacity', type: 'int', nullable: true })
  maxCapacity!: number | null; // Personnes

  // Autres caractéristiques (JSON pour flexibilité)
  @Column({ type: 'jsonb', nullable: true })
  amenities!: string[] | null; // ["wifi", "security", "concierge", etc.]

  @Column({ type: 'jsonb', nullable: true })
  features!: Record<string, any> | null; // Autres caractéristiques spécifiques

  // Relations
  @OneToOne(() => Property, (property) => property.details, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'property_id' })
  property!: Property;
}

