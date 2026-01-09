/**
 * API Client pour property-service
 */

const PROPERTY_API_URL = process.env.NEXT_PUBLIC_PROPERTY_API_URL || 'http://localhost:3001';

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
  id?: string;
  language: string;
  title: string;
  description?: string;
  notes?: string;
  metaTitle?: string;
  metaDescription?: string;
}

export interface Neighborhood {
  id: string;
  slug: string;
  name: string;
  description: {
    fr?: string;
    en?: string;
    [key: string]: string | undefined;
  };
  city: string;
  region?: string | null;
  country?: string | null;
  postalCode?: string | null;
  centerLatitude?: number | null;
  centerLongitude?: number | null;
  stats?: {
    propertyCount?: number;
    averagePriceOverall?: number;
    medianPrice?: number;
    minPrice?: number;
    maxPrice?: number;
    averagePrice?: {
      apartment?: number;
      house?: number;
      villa?: number;
      commercial?: number;
      land?: number;
    };
  } | null;
  features?: {
    publicTransport?: {
      metro?: boolean;
      tram?: boolean;
      bus?: boolean;
      train?: boolean;
      stations?: string[];
    };
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
    type?: 'residential' | 'commercial' | 'mixed' | 'tourist' | 'industrial';
    safetyScore?: number;
    qualityOfLife?: number;
    demographics?: {
      averageAge?: number;
      population?: number;
      familyFriendly?: boolean;
      studentArea?: boolean;
      seniorFriendly?: boolean;
    };
  } | null;
  mediaUrls?: string[] | null;
  createdAt?: string;
  updatedAt?: string;
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
  neighborhood?: Neighborhood | null;
  neighborhoodId?: string | null;
  mediaUrls: string[] | null;
  createdAt: string;
  updatedAt: string;
  publishedAt: string | null;
  translations: PropertyTranslation[];
}

export interface CreatePropertyDto {
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
}

export interface UpdatePropertyDto extends Partial<CreatePropertyDto> {
  status?: PropertyStatus;
}

export interface PropertyListResponse {
  properties: Property[];
  total: number;
}

export interface NearbySearchParams {
  latitude: number;
  longitude: number;
  radiusKm: number;
  limit?: number;
  offset?: number;
}

/**
 * Service de gestion des propriétés
 */
export class PropertyService {
  private baseUrl: string;
  private getAuthToken: () => string | null;

  constructor(
    baseUrl: string = PROPERTY_API_URL,
    getAuthToken: () => string | null = () => null,
  ) {
    this.baseUrl = baseUrl;
    this.getAuthToken = getAuthToken;
  }

  /**
   * Obtenir les headers avec authentification
   */
  private getHeaders(): HeadersInit {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };

    const token = this.getAuthToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    return headers;
  }

  /**
   * Créer une nouvelle propriété
   */
  async create(property: CreatePropertyDto): Promise<Property> {
    const response = await fetch(`${this.baseUrl}/properties`, {
      method: 'POST',
      headers: this.getHeaders(),
      body: JSON.stringify(property),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to create property' }));
      throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Lister les propriétés
   */
  async findAll(params?: {
    userId?: string;
    status?: PropertyStatus;
    limit?: number;
    offset?: number;
  }): Promise<PropertyListResponse> {
    const queryParams = new URLSearchParams();
    if (params?.userId) queryParams.append('userId', params.userId);
    if (params?.status) queryParams.append('status', params.status);
    if (params?.limit) queryParams.append('limit', params.limit.toString());
    if (params?.offset) queryParams.append('offset', params.offset.toString());

    const url = `${this.baseUrl}/properties${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch properties' }));
      throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Obtenir une propriété par ID
   */
  async findOne(id: string): Promise<Property> {
    const response = await fetch(`${this.baseUrl}/properties/${id}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Property not found' }));
      throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Mettre à jour une propriété
   */
  async update(id: string, updates: UpdatePropertyDto): Promise<Property> {
    const response = await fetch(`${this.baseUrl}/properties/${id}`, {
      method: 'PUT',
      headers: this.getHeaders(),
      body: JSON.stringify(updates),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to update property' }));
      throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Supprimer une propriété
   */
  async delete(id: string): Promise<void> {
    const response = await fetch(`${this.baseUrl}/properties/${id}`, {
      method: 'DELETE',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to delete property' }));
      throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
    }
  }

  /**
   * Publier une propriété
   */
  async publish(id: string): Promise<Property> {
    const response = await fetch(`${this.baseUrl}/properties/${id}/publish`, {
      method: 'POST',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to publish property' }));
      throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Recherche de proximité
   */
  async searchNearby(params: NearbySearchParams): Promise<PropertyListResponse> {
    const queryParams = new URLSearchParams({
      latitude: params.latitude.toString(),
      longitude: params.longitude.toString(),
      radiusKm: params.radiusKm.toString(),
    });
    if (params.limit) queryParams.append('limit', params.limit.toString());
    if (params.offset) queryParams.append('offset', params.offset.toString());

    const response = await fetch(`${this.baseUrl}/properties/search/nearby?${queryParams.toString()}`, {
      method: 'GET',
      headers: this.getHeaders(),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Nearby search failed' }));
      throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Vérifier la santé du service
   */
  async healthCheck(): Promise<{ status: string; service: string }> {
    const response = await fetch(`${this.baseUrl}/properties/health`);
    if (!response.ok) {
      throw new Error('Property service is not available');
    }
    return response.json();
  }
}

/**
 * Instance du service (utiliser usePropertyService hook dans les composants pour l'authentification)
 */
export const propertyService = new PropertyService();

