/**
 * Organization API Client
 * Handles all organization-related API calls to organization-service
 * 
 * Note: The organization-service includes User, Role, Permission, and UserRole entities
 * for RBAC support. Currently, user/role/permission endpoints are handled by admin-service,
 * but the entity structure is compatible with organization-service.
 * 
 * Service URL: http://localhost:3001 (organization-service)
 * Entity structure includes: Organization, User, Role, Permission, UserRole
 */

const ORGANIZATION_API_URL = process.env.NEXT_AGENCY_ORGANIZATION_API_URL || 'http://localhost:3001';

export interface ApiError {
  message: string;
  statusCode?: number;
  error?: string;
}

class OrganizationApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public error?: string,
  ) {
    super(message);
    this.name = 'OrganizationApiError';
  }
}

/**
 * Parse error response from API
 */
async function parseErrorResponse(response: Response): Promise<ApiError> {
  try {
    const data = await response.json();
    return {
      message: data.message || data.error || 'An error occurred',
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

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await parseErrorResponse(response);
    throw new OrganizationApiError(error.statusCode || response.status, error.message, error.error);
  }

  // Handle empty responses (204 No Content)
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

/**
 * Build query string from filters
 */
function buildQueryString(filters: Record<string, any>): string {
  const params = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      params.append(key, String(value));
    }
  });
  const query = params.toString();
  return query ? `?${query}` : '';
}

/**
 * Organization API Client
 */
export const organizationApi = {
  /**
   * Health check
   */
  async health(): Promise<{ status: string; service: string; timestamp: string }> {
    return apiRequest<{ status: string; service: string; timestamp: string }>('/organizations/health', {
      method: 'GET',
    });
  },

  /**
   * Get all organizations with filters, sorting, and pagination
   */
  async findAll(filters?: {
    search?: string;
    plan?: 'free' | 'basic' | 'professional' | 'enterprise';
    isActive?: boolean;
    country?: string;
    city?: string;
    parentId?: string | null;
    minUsers?: number;
    maxUsers?: number;
    page?: number;
    limit?: number;
    sortBy?: 'name' | 'createdAt' | 'updatedAt' | 'plan' | 'isActive' | 'country' | 'city' | 'userCount';
    sortOrder?: 'ASC' | 'DESC';
  }): Promise<{
    data: any[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const query = filters ? buildQueryString(filters) : '';
    const response = await apiRequest<{
      data: any[];
      meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(`/organizations${query}`, {
      method: 'GET',
    });
    return response;
  },

  /**
   * Get statistics for organizations
   */
  async getStatistics(): Promise<any> {
    return apiRequest('/organizations/statistics', {
      method: 'GET',
    });
  },

  /**
   * Get organization by ID
   */
  async findById(id: string): Promise<any> {
    return apiRequest(`/organizations/${id}`, {
      method: 'GET',
    });
  },

  /**
   * Get all sub-organizations (descendants) of an organization
   */
  async getSubOrganizations(id: string): Promise<any[]> {
    return apiRequest(`/organizations/${id}/sub-organizations`, {
      method: 'GET',
    });
  },

  /**
   * Create a new organization
   */
  async create(data: any): Promise<any> {
    return apiRequest('/organizations', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update an organization
   */
  async update(id: string, data: any): Promise<any> {
    return apiRequest(`/organizations/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Partial update an organization (PATCH)
   */
  async partialUpdate(id: string, data: any): Promise<any> {
    return apiRequest(`/organizations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete an organization
   */
  async delete(id: string): Promise<{ message: string }> {
    return apiRequest(`/organizations/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Bulk delete organizations
   */
  async bulkDelete(organizationIds: string[]): Promise<any> {
    return apiRequest('/organizations/bulk/delete', {
      method: 'POST',
      body: JSON.stringify({ organizationIds }),
    });
  },

  /**
   * Bulk update organizations
   */
  async bulkUpdate(data: {
    organizationIds: string[];
    plan?: 'free' | 'basic' | 'professional' | 'enterprise';
    isActive?: boolean;
    parentId?: string | null;
  }): Promise<any> {
    return apiRequest('/organizations/bulk/update', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Change parent for multiple organizations
   */
  async changeParent(data: {
    organizationIds: string[];
    newParentId?: string | null;
  }): Promise<any> {
    return apiRequest('/organizations/bulk/change-parent', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};

export { OrganizationApiError };

