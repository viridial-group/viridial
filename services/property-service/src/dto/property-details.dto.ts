import {
  IsOptional,
  IsNumber,
  IsBoolean,
  IsString,
  IsArray,
  Min,
  Max,
  IsIn,
  ValidateIf,
} from 'class-validator';
import { Type } from 'class-transformer';
import { PropertyType } from '../entities/property.entity';

/**
 * DTO pour les détails enrichis d'une propriété
 * Champs conditionnels selon le type de bien
 */
export class PropertyDetailsDto {
  // Surface et dimensions (tous types)
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(999999)
  surfaceArea?: number; // m²

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(999999)
  landArea?: number; // m²

  // Chambres et pièces (house, apartment, villa)
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(50)
  bedrooms?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(50)
  bathrooms?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(100)
  totalRooms?: number;

  // Caractéristiques générales
  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  hasGarage?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(20)
  garageSpaces?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  hasParking?: boolean;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(50)
  parkingSpaces?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  hasElevator?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  hasBalcony?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  hasTerrace?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  hasGarden?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  hasPool?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  hasFireplace?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  hasAirConditioning?: boolean;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  hasHeating?: boolean;

  // Appartement spécifique
  @IsOptional()
  @ValidateIf((o, value) => o.propertyType === 'apartment')
  @Type(() => Number)
  @IsNumber()
  @Min(-5) // Sous-sol possible
  @Max(200)
  floorNumber?: number;

  @IsOptional()
  @ValidateIf((o, value) => o.propertyType === 'apartment')
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(200)
  totalFloors?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  hasStorage?: boolean;

  // Maison/Villa spécifique
  @IsOptional()
  @ValidateIf((o, value) => ['house', 'villa'].includes(o.propertyType))
  @Type(() => Number)
  @IsNumber()
  @Min(1000)
  @Max(new Date().getFullYear())
  constructionYear?: number;

  @IsOptional()
  @ValidateIf((o, value) => ['house', 'villa'].includes(o.propertyType))
  @Type(() => Number)
  @IsNumber()
  @Min(1000)
  @Max(new Date().getFullYear())
  renovationYear?: number;

  @IsOptional()
  @IsString()
  @IsIn(['A', 'B', 'C', 'D', 'E', 'F', 'G'], {
    message: 'Energy class must be A, B, C, D, E, F, or G',
  })
  energyClass?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  energyConsumption?: number; // kWh/m²/year

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  greenhouseGasEmissions?: number; // kg CO2/m²/year

  // Terrain spécifique
  @IsOptional()
  @ValidateIf((o, value) => o.propertyType === 'land')
  @IsString()
  @IsIn(['Residential', 'Commercial', 'Mixed', 'Agricultural', 'Industrial'], {
    message: 'Zoning must be a valid type',
  })
  zoning?: string;

  @IsOptional()
  @ValidateIf((o, value) => o.propertyType === 'land')
  @Type(() => Boolean)
  @IsBoolean()
  buildable?: boolean;

  @IsOptional()
  @ValidateIf((o, value) => o.propertyType === 'land')
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  buildingRights?: number; // m² constructibles

  // Commercial spécifique
  @IsOptional()
  @ValidateIf((o, value) => o.propertyType === 'commercial')
  @IsString()
  @IsIn(['Office', 'Retail', 'Warehouse', 'Restaurant', 'Hotel', 'Other'], {
    message: 'Commercial type must be a valid type',
  })
  commercialType?: string;

  @IsOptional()
  @ValidateIf((o, value) => o.propertyType === 'commercial')
  @Type(() => Boolean)
  @IsBoolean()
  businessLicense?: boolean;

  @IsOptional()
  @ValidateIf((o, value) => o.propertyType === 'commercial')
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(10000)
  maxCapacity?: number;

  // Autres caractéristiques
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  amenities?: string[];

  @IsOptional()
  features?: Record<string, any>; // JSON flexible

  // Helper property pour validation conditionnelle (non persisté)
  propertyType?: PropertyType;
}

