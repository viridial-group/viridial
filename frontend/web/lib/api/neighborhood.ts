/**
 * API Client pour Neighborhood Service
 */

const PROPERTY_API_URL = process.env.NEXT_PUBLIC_PROPERTY_API_URL || 'http://localhost:3001';

export interface NeighborhoodFeatures {
  publicTransport?: {
    metro?: boolean;
    tram?: boolean;
    bus?: boolean;
    train?: boolean;
    funicular?: boolean; // Added for Montmartre
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
  type?: 'residential' | 'commercial' | 'mixed' | 'tourist' | 'industrial' | 'historic';
  safetyScore?: number;
  qualityOfLife?: number;
  demographics?: {
    averageAge?: number;
    population?: number;
    familyFriendly?: boolean;
    studentArea?: boolean;
    seniorFriendly?: boolean;
  };
}

export interface NeighborhoodStats {
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
  lastUpdated?: string;
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
  stats?: NeighborhoodStats | null;
  features?: NeighborhoodFeatures | null;
  mediaUrls?: string[] | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface NeighborhoodListResponse {
  data: Neighborhood[];
  total: number;
}

export interface NeighborhoodFilters {
  city?: string;
  region?: string;
  country?: string;
  limit?: number;
  offset?: number;
}

class NeighborhoodService {
  private baseUrl: string;

  constructor(baseUrl: string = PROPERTY_API_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Récupère tous les quartiers avec filtres optionnels
   */
  async findAll(filters?: NeighborhoodFilters): Promise<NeighborhoodListResponse> {

    const params = new URLSearchParams();
    if (filters?.city) params.append('city', filters.city);
    if (filters?.region) params.append('region', filters.region);
    if (filters?.country) params.append('country', filters.country);
    if (filters?.limit) params.append('limit', filters.limit.toString());
    if (filters?.offset) params.append('offset', filters.offset.toString());

    const url = `${this.baseUrl}/neighborhoods${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch neighborhoods: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Récupère un quartier par ID
   */
  async findOne(id: string): Promise<Neighborhood> {

    const response = await fetch(`${this.baseUrl}/neighborhoods/${id}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch neighborhood: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Récupère un quartier par slug
   */
  async findBySlug(slug: string): Promise<Neighborhood> {

    const response = await fetch(`${this.baseUrl}/neighborhoods/slug/${slug}`);

    if (!response.ok) {
      throw new Error(`Failed to fetch neighborhood: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Recherche de quartiers par nom
   */
  async search(query: string, limit = 10): Promise<Neighborhood[]> {

    const params = new URLSearchParams();
    params.append('q', query);
    if (limit) params.append('limit', limit.toString());

    const response = await fetch(`${this.baseUrl}/neighborhoods/search?${params.toString()}`);

    if (!response.ok) {
      throw new Error(`Failed to search neighborhoods: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Trouve le quartier le plus proche d'une position
   */
  async findNearest(latitude: number, longitude: number, radiusKm = 5): Promise<Neighborhood | null> {
    const params = new URLSearchParams();
    params.append('lat', latitude.toString());
    params.append('lng', longitude.toString());
    if (radiusKm) params.append('radius', radiusKm.toString());

    const response = await fetch(`${this.baseUrl}/neighborhoods/nearest?${params.toString()}`);

    if (!response.ok) {
      if (response.status === 404) {
        return null;
      }
      throw new Error(`Failed to find nearest neighborhood: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Met à jour les statistiques d'un quartier
   */
  async updateStats(id: string): Promise<Neighborhood> {
    const response = await fetch(`${this.baseUrl}/neighborhoods/stats/${id}`, {
      method: 'GET',
    });

    if (!response.ok) {
      throw new Error(`Failed to update neighborhood stats: ${response.statusText}`);
    }

    return response.json();
  }
}

// Export singleton instance
let neighborhoodServiceInstance: NeighborhoodService | null = null;

/**
 * Get or create NeighborhoodService instance
 */
export function getNeighborhoodService(): NeighborhoodService {
  if (!neighborhoodServiceInstance) {
    neighborhoodServiceInstance = new NeighborhoodService(PROPERTY_API_URL);
  }
  return neighborhoodServiceInstance;
}

// Export default instance
export const neighborhoodService = getNeighborhoodService();

