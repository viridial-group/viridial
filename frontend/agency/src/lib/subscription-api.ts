/**
 * Subscription API Client
 * Handles all subscription-related API calls to organization-service
 *
 * Service URL: http://localhost:3001 (organization-service)
 * Base endpoint: /api/organizations/subscriptions
 */

import {
  Subscription,
  CreateSubscriptionDto,
  UpdateSubscriptionDto,
  SubscriptionFilters,
} from '@/types/plans';

const ORGANIZATION_API_URL = process.env.NEXT_PUBLIC_ORGANIZATION_API_URL || 'http://localhost:3001';

export interface ApiError {
  message: string;
  statusCode?: number;
  error?: string;
}

class SubscriptionApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public error?: string,
  ) {
    super(message);
    this.name = 'SubscriptionApiError';
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
      throw new SubscriptionApiError(error.statusCode || response.status, error.message, error.error);
    }

    // Handle 204 No Content (for DELETE requests)
    if (response.status === 204) {
      return undefined as T;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof SubscriptionApiError) {
      throw error;
    }
    throw new SubscriptionApiError(0, error instanceof Error ? error.message : 'Network error');
  }
}

/**
 * Build query string from filters
 */
function buildQueryString(filters: SubscriptionFilters): string {
  const params = new URLSearchParams();
  if (filters.organizationId) params.append('organizationId', filters.organizationId);
  if (filters.planId) params.append('planId', filters.planId);
  if (filters.status) params.append('status', filters.status);
  return params.toString();
}

/**
 * Subscription API methods
 */
export const subscriptionApi = {
  /**
   * Get all subscriptions
   */
  async getAll(filters?: SubscriptionFilters): Promise<Subscription[]> {
    const query = filters ? buildQueryString(filters) : '';
    return apiRequest<Subscription[]>(`/api/organizations/subscriptions${query ? `?${query}` : ''}`);
  },

  /**
   * Get active subscription for an organization
   */
  async getActiveByOrganization(organizationId: string): Promise<Subscription | null> {
    return apiRequest<Subscription | null>(`/api/organizations/subscriptions/organization/${organizationId}/active`);
  },

  /**
   * Get a subscription by ID
   */
  async getById(id: string): Promise<Subscription> {
    return apiRequest<Subscription>(`/api/organizations/subscriptions/${id}`);
  },

  /**
   * Create a new subscription
   */
  async create(data: CreateSubscriptionDto): Promise<Subscription> {
    return apiRequest<Subscription>('/api/organizations/subscriptions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update a subscription
   */
  async update(id: string, data: UpdateSubscriptionDto): Promise<Subscription> {
    return apiRequest<Subscription>(`/api/organizations/subscriptions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Cancel a subscription
   */
  async cancel(id: string, cancelAtPeriodEnd: boolean = true): Promise<Subscription> {
    return apiRequest<Subscription>(`/api/organizations/subscriptions/${id}/cancel`, {
      method: 'POST',
      body: JSON.stringify({ cancelAtPeriodEnd }),
    });
  },

  /**
   * Renew a subscription
   */
  async renew(id: string): Promise<Subscription> {
    return apiRequest<Subscription>(`/api/organizations/subscriptions/${id}/renew`, {
      method: 'POST',
    });
  },

  /**
   * Delete a subscription
   */
  async delete(id: string): Promise<void> {
    return apiRequest<void>(`/api/organizations/subscriptions/${id}`, {
      method: 'DELETE',
    });
  },
};

export { SubscriptionApiError };

