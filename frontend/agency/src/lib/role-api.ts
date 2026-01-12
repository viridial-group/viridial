/**
 * Role API Client
 * Handles all role-related API calls to admin-service
 * 
 * Note: The Role entity structure is compatible with organization-service entities.
 * Organization-service includes User, Role, Permission, and UserRole entities for RBAC.
 * Currently using admin-service endpoints, but types match organization-service entity structure.
 * 
 * Service URL: http://localhost:3002 (admin-service)
 * Compatible with: organization-service Role entity structure
 */

import {
  Role,
  CreateRoleDto,
  UpdateRoleDto,
  RoleFilters,
} from '@/types/admin';

const ADMIN_API_URL = process.env.NEXT_AGENCY_ORGANIZATION_API_URL || 'http://localhost:3002';

export interface ApiError {
  message: string;
  statusCode?: number;
  error?: string;
}

class RoleApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public error?: string,
  ) {
    super(message);
    this.name = 'RoleApiError';
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
  const url = `${ADMIN_API_URL}${endpoint}`;
  
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
      throw new RoleApiError(error.statusCode || response.status, error.message, error.error);
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return {} as T;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof RoleApiError) {
      throw error;
    }
    throw new RoleApiError(0, error instanceof Error ? error.message : 'Network error');
  }
}

/**
 * Build query string from filters
 */
function buildQueryString(filters: RoleFilters): string {
  const params = new URLSearchParams();
  
  if (filters.organizationId) params.append('organizationId', filters.organizationId);
  if (filters.isActive !== undefined) params.append('isActive', filters.isActive.toString());
  if (filters.search) params.append('search', filters.search);

  return params.toString();
}

/**
 * Role API methods
 */
export const roleApi = {
  /**
   * Get all roles with optional filters
   */
  async getAll(filters?: RoleFilters): Promise<Role[]> {
    const query = filters ? buildQueryString(filters) : '';
    return apiRequest<Role[]>(`/api/organizations/roles${query ? `?${query}` : ''}`);
  },

  /**
   * Get a single role by ID
   */
  async getById(id: string): Promise<Role> {
    return apiRequest<Role>(`/api/organizations/roles/${id}`);
  },

  /**
   * Create a new role
   */
  async create(data: CreateRoleDto): Promise<Role> {
    return apiRequest<Role>('/api/organizations/roles', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update a role
   */
  async update(id: string, data: UpdateRoleDto): Promise<Role> {
    return apiRequest<Role>(`/api/organizations/roles/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a role
   */
  async delete(id: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/api/organizations/roles/${id}`, {
      method: 'DELETE',
    });
  },
};

export { RoleApiError };
export type { Role, CreateRoleDto, UpdateRoleDto };

