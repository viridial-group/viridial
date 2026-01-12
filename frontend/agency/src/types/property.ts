/**
 * Property Types
 * Based on property-service entities and DTOs
 */

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

export interface PropertyTranslation {
  language: string;
  title: string;
  description?: string;
  notes?: string;
  metaTitle?: string;
  metaDescription?: string;
}

export interface PropertyDetails {
  id?: string;
  propertyId?: string;
  surfaceArea?: number;
  landArea?: number;
  bedrooms?: number;
  bathrooms?: number;
  totalRooms?: number;
  hasGarage?: boolean;
  garageSpaces?: number;
  hasParking?: boolean;
  parkingSpaces?: number;
  hasElevator?: boolean;
  hasBalcony?: boolean;
  hasTerrace?: boolean;
  hasGarden?: boolean;
  hasPool?: boolean;
  hasFireplace?: boolean;
  hasAirConditioning?: boolean;
  hasHeating?: boolean;
  floorNumber?: number;
  totalFloors?: number;
  hasStorage?: boolean;
  constructionYear?: number;
  renovationYear?: number;
  energyClass?: string;
  energyConsumption?: number;
  greenhouseGasEmissions?: number;
  zoning?: string;
  buildable?: boolean;
  buildingRights?: number;
  commercialType?: string;
  businessLicense?: boolean;
  maxCapacity?: number;
  amenities?: string[];
  features?: Record<string, any>;
}

export interface Property {
  id: string;
  userId: string;
  status: PropertyStatus;
  type: PropertyType;
  price: number;
  currency: string;
  latitude: number | null;
  longitude: number | null;
  street: string | null;
  postalCode: string | null;
  city: string | null;
  region: string | null;
  country: string | null;
  neighborhoodId: string | null;
  mediaUrls: string[] | null;
  createdAt: Date;
  updatedAt: Date;
  publishedAt: Date | null;
  deletedAt: Date | null;
  translations?: PropertyTranslation[];
  neighborhood?: {
    id: string;
    name: string;
    city: string;
    region: string;
    country: string;
  } | null;
  details?: PropertyDetails | null;
}

export interface CreatePropertyDto {
  userId?: string;
  type: PropertyType;
  price: number;
  currency?: string;
  street?: string;
  postalCode?: string;
  city?: string;
  region?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  mediaUrls?: string[];
  translations: PropertyTranslation[];
  status?: PropertyStatus;
  details?: PropertyDetails;
  customFields?: Array<{
    definitionId: string;
    value: any;
  }>;
}

export interface UpdatePropertyDto {
  type?: PropertyType;
  price?: number;
  currency?: string;
  street?: string;
  postalCode?: string;
  city?: string;
  region?: string;
  country?: string;
  latitude?: number;
  longitude?: number;
  mediaUrls?: string[];
  translations?: PropertyTranslation[];
  status?: PropertyStatus;
  details?: PropertyDetails;
  customFields?: Array<{
    definitionId: string;
    value: any;
  }>;
}

export interface PropertyFilters {
  userId?: string;
  status?: PropertyStatus;
  type?: PropertyType;
  types?: PropertyType[];
  minPrice?: number;
  maxPrice?: number;
  currency?: string;
  city?: string;
  cities?: string[];
  region?: string;
  country?: string;
  postalCode?: string;
  neighborhoodId?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  search?: string;
  createdAfter?: string;
  createdBefore?: string;
  publishedAfter?: string;
  publishedBefore?: string;
  hasImages?: boolean;
  minImages?: number;
  sortBy?: 'createdAt' | 'updatedAt' | 'publishedAt' | 'price' | 'title';
  sortOrder?: 'ASC' | 'DESC';
  limit?: number;
  offset?: number;
  hasCoordinates?: boolean;
  propertyIds?: string[];
}

export interface PropertySearchResponse {
  properties: Property[];
  total: number;
  limit: number;
  offset: number;
}

export interface PropertyStatistics {
  total: number;
  byStatus: Record<PropertyStatus, number>;
  byType: Record<PropertyType, number>;
  byCountry: Record<string, number>;
  byCity: Record<string, number>;
  priceStats: {
    min: number;
    max: number;
    average: number;
    median: number;
  };
  currencyDistribution: Record<string, number>;
  recentActivity: {
    published: number;
    created: number;
  };
  withImages: number;
  withCoordinates: number;
}

export interface BulkUpdatePropertyDto {
  propertyIds: string[];
  updateData: Partial<UpdatePropertyDto>;
}

export interface BulkDeletePropertyDto {
  propertyIds: string[];
  hardDelete?: boolean;
}

export interface BulkStatusUpdateDto {
  propertyIds: string[];
  status: PropertyStatus;
}

export interface BulkImportDto {
  properties: CreatePropertyDto[];
  fileName?: string;
}

export interface ImportJob {
  id: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  totalProperties: number;
  processedProperties: number;
  successfulProperties: number;
  failedProperties: number;
  errors?: Array<{
    index: number;
    error: string;
  }>;
  createdAt: Date;
  updatedAt: Date;
}

