/**
 * Property API Client
 * Handles all property-related API calls to property-service
 * 
 * Service URL: http://localhost:3003 (property-service)
 * Base endpoint: /properties
 */

import {
  Property,
  CreatePropertyDto,
  UpdatePropertyDto,
  PropertyFilters,
  PropertySearchResponse,
  PropertyStatistics,
  BulkUpdatePropertyDto,
  BulkDeletePropertyDto,
  BulkStatusUpdateDto,
  BulkImportDto,
  ImportJob,
  PropertyStatus,
} from '@/types/property';

const PROPERTY_API_URL = process.env.NEXT_PUBLIC_PROPERTY_API_URL || 'http://localhost:3003';

export interface ApiError {
  message: string;
  statusCode?: number;
  error?: string;
}

class PropertyApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public error?: string,
  ) {
    super(message);
    this.name = 'PropertyApiError';
  }
}

/**
 * Parse error response from API
 */
async function parseErrorResponse(response: Response): Promise<ApiError> {
  try {
    const data = await response.json();
    return {
      message: Array.isArray(data.message) ? data.message.join(', ') : data.message || data.error || 'An error occurred',
      statusCode: response.status,
      error: data.error,
    };
  } catch {
    return {
      message: `HTTP ${response.status}: ${response.statusText}`,
      statusCode: response.status,
    };
  }
}

/**
 * Make authenticated API request
 */
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<T> {
  const url = `${PROPERTY_API_URL}${endpoint}`;
  
  const headersInit: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  // Merge existing headers if they exist
  if (options.headers) {
    if (options.headers instanceof Headers) {
      options.headers.forEach((value, key) => {
        headersInit[key] = value;
      });
    } else if (Array.isArray(options.headers)) {
      options.headers.forEach(([key, value]) => {
        headersInit[key] = value;
      });
    } else {
      Object.assign(headersInit, options.headers);
    }
  }

  // Add Authorization header if access token exists
  if (typeof window !== 'undefined') {
    const accessToken = localStorage.getItem('accessToken');
    if (accessToken && !headersInit['Authorization']) {
      headersInit['Authorization'] = `Bearer ${accessToken}`;
    }
  }

  const headers: HeadersInit = headersInit;

  try {
    const response = await fetch(url, {
      ...options,
      headers,
      credentials: 'include',
    });

    if (!response.ok) {
      const error = await parseErrorResponse(response);
      throw new PropertyApiError(error.statusCode || response.status, error.message, error.error);
    }

    // Handle 204 No Content (for DELETE requests)
    if (response.status === 204) {
      return undefined as T;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof PropertyApiError) {
      throw error;
    }
    throw new PropertyApiError(0, error instanceof Error ? error.message : 'Network error');
  }
}

/**
 * Build query string from filters
 */
function buildQueryString(filters: PropertyFilters): string {
  const params = new URLSearchParams();
  
  if (filters.userId) params.append('userId', filters.userId);
  if (filters.status) params.append('status', filters.status);
  if (filters.type) params.append('type', filters.type);
  if (filters.types) filters.types.forEach(t => params.append('types', t));
  if (filters.minPrice !== undefined) params.append('minPrice', String(filters.minPrice));
  if (filters.maxPrice !== undefined) params.append('maxPrice', String(filters.maxPrice));
  if (filters.currency) params.append('currency', filters.currency);
  if (filters.city) params.append('city', filters.city);
  if (filters.cities) filters.cities.forEach(c => params.append('cities', c));
  if (filters.region) params.append('region', filters.region);
  if (filters.country) params.append('country', filters.country);
  if (filters.postalCode) params.append('postalCode', filters.postalCode);
  if (filters.neighborhoodId) params.append('neighborhoodId', filters.neighborhoodId);
  if (filters.latitude !== undefined) params.append('latitude', String(filters.latitude));
  if (filters.longitude !== undefined) params.append('longitude', String(filters.longitude));
  if (filters.radiusKm !== undefined) params.append('radiusKm', String(filters.radiusKm));
  if (filters.search) params.append('search', filters.search);
  if (filters.createdAfter) params.append('createdAfter', filters.createdAfter);
  if (filters.createdBefore) params.append('createdBefore', filters.createdBefore);
  if (filters.publishedAfter) params.append('publishedAfter', filters.publishedAfter);
  if (filters.publishedBefore) params.append('publishedBefore', filters.publishedBefore);
  if (filters.hasImages !== undefined) params.append('hasImages', String(filters.hasImages));
  if (filters.minImages !== undefined) params.append('minImages', String(filters.minImages));
  if (filters.sortBy) params.append('sortBy', filters.sortBy);
  if (filters.sortOrder) params.append('sortOrder', filters.sortOrder);
  if (filters.limit !== undefined) params.append('limit', String(filters.limit));
  if (filters.offset !== undefined) params.append('offset', String(filters.offset));
  if (filters.hasCoordinates !== undefined) params.append('hasCoordinates', String(filters.hasCoordinates));
  if (filters.propertyIds) filters.propertyIds.forEach(id => params.append('propertyIds', id));
  
  return params.toString();
}

/**
 * Property API methods
 */
export const propertyApi = {
  /**
   * Health check
   */
  async health(): Promise<{ status: string; service: string }> {
    return apiRequest<{ status: string; service: string }>('/properties/health');
  },

  /**
   * Get all properties with optional filters
   */
  async getAll(filters?: PropertyFilters): Promise<PropertySearchResponse> {
    const query = filters ? buildQueryString(filters) : '';
    const response = await apiRequest<PropertySearchResponse | Property[]>(`/properties${query ? `?${query}` : ''}`);
    
    // Handle both response formats (array or paginated)
    if (Array.isArray(response)) {
      return {
        properties: response,
        total: response.length,
        limit: filters?.limit || response.length,
        offset: filters?.offset || 0,
      };
    }
    
    return response;
  },

  /**
   * Get a property by ID
   */
  async getById(id: string): Promise<Property> {
    return apiRequest<Property>(`/properties/${id}`);
  },

  /**
   * Create a new property
   */
  async create(data: CreatePropertyDto): Promise<Property> {
    return apiRequest<Property>('/properties', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update a property
   */
  async update(id: string, data: UpdatePropertyDto): Promise<Property> {
    return apiRequest<Property>(`/properties/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a property (soft delete)
   */
  async delete(id: string): Promise<void> {
    return apiRequest<void>(`/properties/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Restore a soft-deleted property
   */
  async restore(id: string): Promise<Property> {
    return apiRequest<Property>(`/properties/${id}/restore`, {
      method: 'POST',
    });
  },

  /**
   * Hard delete a property (admin only)
   */
  async hardDelete(id: string): Promise<void> {
    return apiRequest<void>(`/properties/${id}/hard`, {
      method: 'DELETE',
    });
  },

  /**
   * Publish a property
   */
  async publish(id: string): Promise<Property> {
    return apiRequest<Property>(`/properties/${id}/publish`, {
      method: 'POST',
    });
  },

  /**
   * Advanced search
   */
  async search(filters: PropertyFilters): Promise<PropertySearchResponse> {
    const query = buildQueryString(filters);
    const response = await apiRequest<PropertySearchResponse | Property[]>(`/properties/search${query ? `?${query}` : ''}`);
    
    // Handle both response formats
    if (Array.isArray(response)) {
      return {
        properties: response,
        total: response.length,
        limit: filters.limit || response.length,
        offset: filters.offset || 0,
      };
    }
    
    return response;
  },

  /**
   * Search nearby properties
   */
  async searchNearby(
    latitude: number,
    longitude: number,
    radiusKm: number,
    limit?: number,
    offset?: number,
    status?: PropertyStatus,
  ): Promise<PropertySearchResponse> {
    const params = new URLSearchParams();
    params.append('latitude', String(latitude));
    params.append('longitude', String(longitude));
    params.append('radiusKm', String(radiusKm));
    if (limit) params.append('limit', String(limit));
    if (offset) params.append('offset', String(offset));
    if (status) params.append('status', status);
    
    const response = await apiRequest<PropertySearchResponse | Property[]>(`/properties/search/nearby?${params.toString()}`);
    
    if (Array.isArray(response)) {
      return {
        properties: response,
        total: response.length,
        limit: limit || response.length,
        offset: offset || 0,
      };
    }
    
    return response;
  },

  /**
   * Get property statistics
   */
  async getStatistics(): Promise<PropertyStatistics> {
    return apiRequest<PropertyStatistics>('/properties/statistics');
  },

  /**
   * Get property statistics by date range
   */
  async getStatisticsByDateRange(startDate: Date, endDate: Date): Promise<PropertyStatistics> {
    const params = new URLSearchParams();
    params.append('startDate', startDate.toISOString().split('T')[0]);
    params.append('endDate', endDate.toISOString().split('T')[0]);
    return apiRequest<PropertyStatistics>(`/properties/statistics/range?${params.toString()}`);
  },

  /**
   * Bulk update properties
   */
  async bulkUpdate(data: BulkUpdatePropertyDto): Promise<{ updated: number; failed: number; errors?: any[] }> {
    return apiRequest<{ updated: number; failed: number; errors?: any[] }>('/properties/bulk/update', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Bulk delete properties
   */
  async bulkDelete(data: BulkDeletePropertyDto): Promise<{ deleted: number; failed: number; errors?: any[] }> {
    return apiRequest<{ deleted: number; failed: number; errors?: any[] }>('/properties/bulk/delete', {
      method: 'DELETE',
      body: JSON.stringify(data),
    });
  },

  /**
   * Bulk status update
   */
  async bulkStatusUpdate(data: BulkStatusUpdateDto): Promise<{ updated: number; failed: number; errors?: any[] }> {
    return apiRequest<{ updated: number; failed: number; errors?: any[] }>('/properties/bulk/status', {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Bulk import properties
   */
  async bulkImport(data: BulkImportDto): Promise<{ jobId: string; status: string; message: string }> {
    return apiRequest<{ jobId: string; status: string; message: string }>('/properties/import', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Get import job status
   */
  async getImportStatus(jobId: string): Promise<ImportJob> {
    return apiRequest<ImportJob>(`/properties/import/${jobId}`);
  },

  /**
   * List import jobs
   */
  async listImports(limit?: number, offset?: number): Promise<ImportJob[]> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', String(limit));
    if (offset) params.append('offset', String(offset));
    return apiRequest<ImportJob[]>(`/properties/import${params.toString() ? `?${params.toString()}` : ''}`);
  },

  /**
   * Flag a property for moderation
   */
  async flagProperty(id: string, reason: string): Promise<{ id: string; propertyId: string; reason: string; status: string }> {
    return apiRequest<{ id: string; propertyId: string; reason: string; status: string }>(`/properties/${id}/flag`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  /**
   * Get moderation queue (admin only)
   */
  async getModerationQueue(status?: string, limit?: number, offset?: number): Promise<any[]> {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (limit) params.append('limit', String(limit));
    if (offset) params.append('offset', String(offset));
    return apiRequest<any[]>(`/properties/moderation/queue${params.toString() ? `?${params.toString()}` : ''}`);
  },

  /**
   * Moderate a flagged property (admin only)
   */
  async moderateProperty(id: string, action: string, reason: string): Promise<Property> {
    return apiRequest<Property>(`/properties/${id}/moderate`, {
      method: 'POST',
      body: JSON.stringify({ action, reason }),
    });
  },

  /**
   * Get Schema.org JSON-LD for SEO
   */
  async getSchemaOrg(id: string): Promise<any> {
    return apiRequest<any>(`/properties/${id}/schema`);
  },

  // Favorites API
  /**
   * Add property to favorites
   */
  async addFavorite(id: string): Promise<{ id: string; propertyId: string; userId: string; createdAt: Date }> {
    return apiRequest<{ id: string; propertyId: string; userId: string; createdAt: Date }>(`/properties/${id}/favorite`, {
      method: 'POST',
    });
  },

  /**
   * Remove property from favorites
   */
  async removeFavorite(id: string): Promise<void> {
    return apiRequest<void>(`/properties/${id}/favorite`, {
      method: 'DELETE',
    });
  },

  /**
   * Check if property is favorited
   */
  async isFavorited(id: string): Promise<{ isFavorited: boolean }> {
    return apiRequest<{ isFavorited: boolean }>(`/properties/${id}/favorite`);
  },

  /**
   * Get user's favorite properties
   */
  async getFavorites(limit?: number, offset?: number): Promise<PropertySearchResponse> {
    const params = new URLSearchParams();
    if (limit) params.append('limit', String(limit));
    if (offset) params.append('offset', String(offset));
    const response = await apiRequest<PropertySearchResponse | Property[]>(`/properties/favorites${params.toString() ? `?${params.toString()}` : ''}`);
    
    if (Array.isArray(response)) {
      return {
        properties: response,
        total: response.length,
        limit: limit || response.length,
        offset: offset || 0,
      };
    }
    
    return response;
  },

  /**
   * Get favorite count for a property
   */
  async getFavoriteCount(id: string): Promise<{ count: number }> {
    return apiRequest<{ count: number }>(`/properties/${id}/favorites/count`);
  },
};

export { PropertyApiError };
export type { Property, CreatePropertyDto, UpdatePropertyDto, PropertyFilters, PropertySearchResponse, PropertyStatistics };

