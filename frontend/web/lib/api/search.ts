/**
 * API Client pour search-service
 */

const SEARCH_API_URL = process.env.NEXT_PUBLIC_SEARCH_API_URL || 'http://localhost:3003';

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

export interface SearchFilters {
  status?: PropertyStatus;
  type?: PropertyType;
  country?: string;
  city?: string;
  region?: string;
  minPrice?: number;
  maxPrice?: number;
  currency?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
}

export interface SearchOptions {
  limit?: number;
  offset?: number;
  sort?: string[];
  language?: string;
}

export interface SearchResult {
  hits: PropertySearchHit[];
  total: number;
  limit: number;
  offset: number;
  processingTimeMs?: number;
  query?: string;
  facets?: {
    type?: Record<string, number>;
    country?: Record<string, number>;
    city?: Record<string, number>;
    region?: Record<string, number>;
    currency?: Record<string, number>;
  };
}

export interface PropertySearchHit {
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
  mediaUrls: string[] | null;
  translations: {
    language: string;
    title: string;
    description?: string;
    metaTitle?: string;
    metaDescription?: string;
  }[];
  createdAt: string;
  updatedAt: string;
  // Meilisearch specific fields
  _formatted?: {
    'translations.title'?: string;
    'translations.description'?: string;
  };
  _matchesPosition?: {
    'translations.title'?: Array<{ start: number; length: number }>;
    'translations.description'?: Array<{ start: number; length: number }>;
  };
}

export interface SearchSuggestion {
  id: string;
  title: string;
  city: string | null;
}

export interface SearchFacets {
  type: Record<string, number>;
  country: Record<string, number>;
  city: Record<string, number>;
  region: Record<string, number>;
  currency: Record<string, number>;
}

export class SearchService {
  private baseUrl: string;

  constructor(baseUrl: string = SEARCH_API_URL) {
    this.baseUrl = baseUrl;
  }

  /**
   * Simple search (GET)
   * GET /search?q=appartement&country=France&type=apartment&limit=20
   */
  async search(
    query: string = '',
    filters: SearchFilters = {},
    options: SearchOptions = {},
  ): Promise<SearchResult> {
    const params = new URLSearchParams();
    
    if (query) params.append('q', query);
    if (filters.status) params.append('status', filters.status);
    if (filters.type) params.append('type', filters.type);
    if (filters.country) params.append('country', filters.country);
    if (filters.city) params.append('city', filters.city);
    if (filters.region) params.append('region', filters.region);
    if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());
    if (filters.currency) params.append('currency', filters.currency);
    if (filters.latitude !== undefined) params.append('latitude', filters.latitude.toString());
    if (filters.longitude !== undefined) params.append('longitude', filters.longitude.toString());
    if (filters.radiusKm !== undefined) params.append('radiusKm', filters.radiusKm.toString());
    
    if (options.limit) params.append('limit', options.limit.toString());
    if (options.offset) params.append('offset', options.offset.toString());
    if (options.sort) params.append('sort', options.sort.join(','));
    if (options.language) params.append('language', options.language);

    const response = await fetch(`${this.baseUrl}/search?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': options.language || 'fr',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Search failed' }));
      throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Advanced search (POST)
   * POST /search
   */
  async advancedSearch(
    query: string = '',
    filters: SearchFilters = {},
    options: SearchOptions = {},
  ): Promise<SearchResult> {
    const response = await fetch(`${this.baseUrl}/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Accept-Language': options.language || 'fr',
      },
      body: JSON.stringify({
        q: query,
        filters,
        options,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Advanced search failed' }));
      throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Get search suggestions (autocomplete)
   * GET /search/suggestions?q=appart&limit=5
   */
  async getSuggestions(
    query: string,
    limit: number = 5,
    language: string = 'fr',
  ): Promise<SearchSuggestion[]> {
    if (!query || query.trim().length === 0) {
      return [];
    }

    const params = new URLSearchParams();
    params.append('q', query);
    params.append('limit', limit.toString());
    params.append('language', language);

    const response = await fetch(`${this.baseUrl}/search/suggestions?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Accept-Language': language,
      },
    });

    if (!response.ok) {
      // Silently fail for suggestions
      return [];
    }

    return response.json();
  }

  /**
   * Get facets for filter UI
   * GET /search/facets?q=appartement&country=France
   */
  async getFacets(
    query: string = '',
    filters: Partial<SearchFilters> = {},
  ): Promise<SearchFacets> {
    const params = new URLSearchParams();
    
    if (query) params.append('q', query);
    if (filters.country) params.append('country', filters.country);
    if (filters.city) params.append('city', filters.city);
    if (filters.minPrice !== undefined) params.append('minPrice', filters.minPrice.toString());
    if (filters.maxPrice !== undefined) params.append('maxPrice', filters.maxPrice.toString());

    const response = await fetch(`${this.baseUrl}/search/facets?${params.toString()}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ message: 'Failed to fetch facets' }));
      throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<{ status: string; service: string }> {
    const response = await fetch(`${this.baseUrl}/search/health`);
    if (!response.ok) {
      throw new Error('Search service is not available');
    }
    return response.json();
  }
}

export const searchService = new SearchService();

