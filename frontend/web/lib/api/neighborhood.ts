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
  private useMock: boolean;

  constructor(baseUrl: string = PROPERTY_API_URL, useMock?: boolean) {
    this.baseUrl = baseUrl;
    // Check localStorage if useMock not explicitly provided
    if (useMock === undefined && typeof window !== 'undefined') {
      useMock = localStorage.getItem('useMockNeighborhood') === 'true';
    }
    // Check env variable if still undefined
    if (useMock === undefined) {
      useMock = process.env.NEXT_PUBLIC_USE_MOCK_NEIGHBORHOOD === 'true';
    }
    // In development, default to mock mode if not explicitly disabled
    if (useMock === undefined && process.env.NODE_ENV === 'development') {
      useMock = true; // Default to mock in local dev
    }
    this.useMock = useMock || false;
  }

  /**
   * Récupère tous les quartiers avec filtres optionnels
   */
  async findAll(filters?: NeighborhoodFilters): Promise<NeighborhoodListResponse> {
    if (this.useMock) {
      const { mockGetAllNeighborhoods } = await import('@/lib/mocks/neighborhood-mock-data');
      return mockGetAllNeighborhoods(filters);
    }

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
    if (this.useMock) {
      // Mock mode: search in mock data by ID
      const { mockNeighborhoods } = await import('@/lib/mocks/neighborhood-mock-data');
      const found = mockNeighborhoods.find(n => n.id === id);
      if (!found) {
        throw new Error(`Neighborhood with ID ${id} not found`);
      }
      return found;
    }

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
    if (this.useMock) {
      const { mockGetNeighborhoodBySlug } = await import('@/lib/mocks/neighborhood-mock-data');
      const neighborhood = mockGetNeighborhoodBySlug(slug);
      if (!neighborhood) {
        throw new Error(`Neighborhood with slug ${slug} not found`);
      }
      return neighborhood;
    }

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
    if (this.useMock) {
      const { mockSearchNeighborhoods } = await import('@/lib/mocks/neighborhood-mock-data');
      return mockSearchNeighborhoods(query, limit);
    }

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

// Export singleton instance - will be recreated based on mock mode
let neighborhoodServiceInstance: NeighborhoodService | null = null;

/**
 * Get or create NeighborhoodService instance with current mock mode
 */
export function getNeighborhoodService(useMock?: boolean): NeighborhoodService {
  // Check localStorage if useMock not explicitly provided
  if (useMock === undefined && typeof window !== 'undefined') {
    useMock = localStorage.getItem('useMockNeighborhood') === 'true';
  }
  
  // Check env variable if still undefined
  if (useMock === undefined) {
    useMock = process.env.NEXT_PUBLIC_USE_MOCK_NEIGHBORHOOD === 'true';
  }

  // In development, default to mock mode if not explicitly disabled
  if (useMock === undefined && process.env.NODE_ENV === 'development') {
    useMock = true; // Default to mock in local dev
  }

  // Recreate instance if mock mode changed
  if (!neighborhoodServiceInstance || neighborhoodServiceInstance['useMock'] !== useMock) {
    neighborhoodServiceInstance = new NeighborhoodService(PROPERTY_API_URL, useMock || false);
  }

  return neighborhoodServiceInstance;
}

// Export default instance (legacy support, will use mock mode from env/localStorage)
export const neighborhoodService = getNeighborhoodService();

