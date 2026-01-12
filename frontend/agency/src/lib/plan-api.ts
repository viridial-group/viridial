/**
 * Plan API Client
 * Handles all plan-related API calls to organization-service
 *
 * Service URL: http://localhost:3001 (organization-service)
 * Base endpoint: /api/organizations/plans
 */

import {
  Plan,
  CreatePlanDto,
  UpdatePlanDto,
  PlanFilters,
} from '@/types/plans';

const ORGANIZATION_API_URL = process.env.NEXT_PUBLIC_ORGANIZATION_API_URL || 'http://localhost:3001';

export interface ApiError {
  message: string;
  statusCode?: number;
  error?: string;
}

class PlanApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public error?: string,
  ) {
    super(message);
    this.name = 'PlanApiError';
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
      throw new PlanApiError(error.statusCode || response.status, error.message, error.error);
    }

    // Handle 204 No Content (for DELETE requests)
    if (response.status === 204) {
      return undefined as T;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof PlanApiError) {
      throw error;
    }
    throw new PlanApiError(0, error instanceof Error ? error.message : 'Network error');
  }
}

/**
 * Build query string from filters
 */
function buildQueryString(filters: PlanFilters): string {
  const params = new URLSearchParams();
  if (filters.planType) params.append('planType', filters.planType);
  if (filters.billingPeriod) params.append('billingPeriod', filters.billingPeriod);
  if (filters.isActive !== undefined) params.append('isActive', String(filters.isActive));
  if (filters.isFeatured !== undefined) params.append('isFeatured', String(filters.isFeatured));
  return params.toString();
}

/**
 * Plan API methods
 */
export const planApi = {
  /**
   * Get all plans
   */
  async getAll(filters?: PlanFilters): Promise<Plan[]> {
    const query = filters ? buildQueryString(filters) : '';
    return apiRequest<Plan[]>(`/api/organizations/plans${query ? `?${query}` : ''}`);
  },

  /**
   * Get pricing comparison
   */
  async getPricingComparison(billingPeriod: 'monthly' | 'annual' = 'monthly'): Promise<Plan[]> {
    // For now, get all plans and filter by billing period
    const allPlans = await this.getAll({ billingPeriod });
    return allPlans;
  },

  /**
   * Get plans by type
   */
  async getByType(planType: string): Promise<Plan[]> {
    return apiRequest<Plan[]>(`/api/organizations/plans/type/${planType}`);
  },

  /**
   * Get a plan by ID
   */
  async getById(id: string): Promise<Plan> {
    return apiRequest<Plan>(`/api/organizations/plans/${id}`);
  },

  /**
   * Create a new plan
   */
  async create(data: CreatePlanDto): Promise<Plan> {
    return apiRequest<Plan>('/api/organizations/plans', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update a plan
   */
  async update(id: string, data: UpdatePlanDto): Promise<Plan> {
    return apiRequest<Plan>(`/api/organizations/plans/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a plan
   */
  async delete(id: string): Promise<void> {
    return apiRequest<void>(`/api/organizations/plans/${id}`, {
      method: 'DELETE',
    });
  },
};

export { PlanApiError };

