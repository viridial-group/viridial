/**
 * Booster Pack API Client
 * Handles all booster pack-related API calls to organization-service
 *
 * Service URL: http://localhost:3001 (organization-service)
 * Base endpoint: /api/organizations/booster-packs
 */

import {
  BoosterPack,
  CreateBoosterPackDto,
  UpdateBoosterPackDto,
  BoosterPackFilters,
} from '@/types/plans';

const ORGANIZATION_API_URL = process.env.NEXT_PUBLIC_ORGANIZATION_API_URL || 'http://localhost:3001';

export interface ApiError {
  message: string;
  statusCode?: number;
  error?: string;
}

class BoosterPackApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public error?: string,
  ) {
    super(message);
    this.name = 'BoosterPackApiError';
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
      throw new BoosterPackApiError(error.statusCode || response.status, error.message, error.error);
    }

    // Handle 204 No Content (for DELETE requests)
    if (response.status === 204) {
      return undefined as T;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof BoosterPackApiError) {
      throw error;
    }
    throw new BoosterPackApiError(0, error instanceof Error ? error.message : 'Network error');
  }
}

/**
 * Build query string from filters
 */
function buildQueryString(filters: BoosterPackFilters): string {
  const params = new URLSearchParams();
  if (filters.boosterPackType) params.append('boosterPackType', filters.boosterPackType);
  if (filters.isActive !== undefined) params.append('isActive', String(filters.isActive));
  if (filters.limitType) params.append('limitType', filters.limitType);
  return params.toString();
}

/**
 * Booster Pack API methods
 */
export const boosterPackApi = {
  /**
   * Get all booster packs
   */
  async getAll(filters?: BoosterPackFilters): Promise<BoosterPack[]> {
    const query = filters ? buildQueryString(filters) : '';
    return apiRequest<BoosterPack[]>(`/api/organizations/booster-packs${query ? `?${query}` : ''}`);
  },

  /**
   * Get a booster pack by ID
   */
  async getById(id: string): Promise<BoosterPack> {
    return apiRequest<BoosterPack>(`/api/organizations/booster-packs/${id}`);
  },

  /**
   * Create a new booster pack
   */
  async create(data: CreateBoosterPackDto): Promise<BoosterPack> {
    return apiRequest<BoosterPack>('/api/organizations/booster-packs', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update a booster pack
   */
  async update(id: string, data: UpdateBoosterPackDto): Promise<BoosterPack> {
    return apiRequest<BoosterPack>(`/api/organizations/booster-packs/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a booster pack
   */
  async delete(id: string): Promise<void> {
    return apiRequest<void>(`/api/organizations/booster-packs/${id}`, {
      method: 'DELETE',
    });
  },
};

export { BoosterPackApiError };

