/**
 * Feature API Client
 * Handles all feature-related API calls to organization-service
 * 
 * Service URL: http://localhost:3001 (organization-service)
 * Base endpoint: /api/organizations/permissions/features
 */

import {
  Feature,
  CreateFeatureDto,
  UpdateFeatureDto,
  FeatureFilters,
} from '@/types/admin';

const ORGANIZATION_API_URL = process.env.NEXT_PUBLIC_ORGANIZATION_API_URL || 'http://localhost:3001';

export interface ApiError {
  message: string;
  statusCode?: number;
  error?: string;
}

class FeatureApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public error?: string,
  ) {
    super(message);
    this.name = 'FeatureApiError';
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
  const url = `${ORGANIZATION_API_URL}${endpoint}`;
  
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
      throw new FeatureApiError(error.statusCode || response.status, error.message, error.error);
    }

    // Handle 204 No Content (for DELETE requests)
    if (response.status === 204) {
      return undefined as T;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof FeatureApiError) {
      throw error;
    }
    throw new FeatureApiError(0, error instanceof Error ? error.message : 'Network error');
  }
}

/**
 * Build query string from filters
 */
function buildQueryString(filters: FeatureFilters): string {
  const params = new URLSearchParams();
  if (filters.category) params.append('category', filters.category);
  if (filters.isActive !== undefined) params.append('isActive', String(filters.isActive));
  if (filters.search) params.append('search', filters.search);
  return params.toString();
}

/**
 * Feature API methods
 */
export const featureApi = {
  /**
   * Get all features
   */
  async getAll(filters?: FeatureFilters): Promise<Feature[]> {
    const query = filters ? buildQueryString(filters) : '';
    return apiRequest<Feature[]>(`/api/organizations/permissions/features${query ? `?${query}` : ''}`);
  },

  /**
   * Get a feature by ID
   */
  async getById(id: string): Promise<Feature> {
    return apiRequest<Feature>(`/api/organizations/permissions/features/${id}`);
  },

  /**
   * Create a new feature
   */
  async create(data: CreateFeatureDto): Promise<Feature> {
    return apiRequest<Feature>('/api/organizations/permissions/features', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update a feature
   */
  async update(id: string, data: UpdateFeatureDto): Promise<Feature> {
    return apiRequest<Feature>(`/api/organizations/permissions/features/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a feature
   */
  async delete(id: string): Promise<void> {
    return apiRequest<void>(`/api/organizations/permissions/features/${id}`, {
      method: 'DELETE',
    });
  },
};

export { FeatureApiError };

