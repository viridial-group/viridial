/**
 * Resource API Client
 * Handles all resource-related API calls to organization-service
 * 
 * Service URL: http://localhost:3001 (organization-service)
 * Base endpoint: /api/organizations/permissions/resources
 */

import {
  Resource,
  CreateResourceDto,
  UpdateResourceDto,
  ResourceFilters,
} from '@/types/admin';

const ORGANIZATION_API_URL = process.env.NEXT_PUBLIC_ORGANIZATION_API_URL || 'http://localhost:3001';

export interface ApiError {
  message: string;
  statusCode?: number;
  error?: string;
}

class ResourceApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public error?: string,
  ) {
    super(message);
    this.name = 'ResourceApiError';
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
      throw new ResourceApiError(error.statusCode || response.status, error.message, error.error);
    }

    // Handle 204 No Content (for DELETE requests)
    if (response.status === 204) {
      return undefined as T;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof ResourceApiError) {
      throw error;
    }
    throw new ResourceApiError(0, error instanceof Error ? error.message : 'Network error');
  }
}

/**
 * Build query string from filters
 */
function buildQueryString(filters: ResourceFilters): string {
  const params = new URLSearchParams();
  if (filters.category) params.append('category', filters.category);
  if (filters.isActive !== undefined) params.append('isActive', String(filters.isActive));
  if (filters.search) params.append('search', filters.search);
  return params.toString();
}

/**
 * Resource API methods
 */
export const resourceApi = {
  /**
   * Get all resources
   */
  async getAll(filters?: ResourceFilters): Promise<Resource[]> {
    const query = filters ? buildQueryString(filters) : '';
    return apiRequest<Resource[]>(`/api/organizations/permissions/resources${query ? `?${query}` : ''}`);
  },

  /**
   * Get a resource by ID
   */
  async getById(id: string): Promise<Resource> {
    return apiRequest<Resource>(`/api/organizations/permissions/resources/${id}`);
  },

  /**
   * Create a new resource
   */
  async create(data: CreateResourceDto): Promise<Resource> {
    return apiRequest<Resource>('/api/organizations/permissions/resources', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update a resource
   */
  async update(id: string, data: UpdateResourceDto): Promise<Resource> {
    return apiRequest<Resource>(`/api/organizations/permissions/resources/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a resource
   */
  async delete(id: string): Promise<void> {
    return apiRequest<void>(`/api/organizations/permissions/resources/${id}`, {
      method: 'DELETE',
    });
  },
};

export { ResourceApiError };

