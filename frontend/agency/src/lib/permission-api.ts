/**
 * Permission API Client
 * Handles all permission-related API calls to organization-service
 * 
 * Note: The Permission entity structure is compatible with organization-service entities.
 * Organization-service includes User, Role, Permission, and UserRole entities for RBAC.
 * 
 * Service URL: http://localhost:3001 (organization-service)
 * Compatible with: organization-service Permission entity structure
 */

import {
  Permission,
  CreatePermissionDto,
  UpdatePermissionDto,
  PermissionFilters,
  GroupedPermissions,
} from '@/types/admin';

const ORGANIZATION_API_URL = process.env.NEXT_PUBLIC_ORGANIZATION_API_URL || 'http://localhost:3001';

export interface ApiError {
  message: string;
  statusCode?: number;
  error?: string;
}

class PermissionApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public error?: string,
  ) {
    super(message);
    this.name = 'PermissionApiError';
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
      throw new PermissionApiError(error.statusCode || response.status, error.message, error.error);
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return {} as T;
    }

    return await response.json();
  } catch (error) {
    if (error instanceof PermissionApiError) {
      throw error;
    }
    throw new PermissionApiError(0, error instanceof Error ? error.message : 'Network error');
  }
}

/**
 * Build query string from filters
 */
function buildQueryString(filters: PermissionFilters): string {
  const params = new URLSearchParams();
  
  if (filters.resourceId) params.append('resourceId', filters.resourceId);
  if (filters.resource) params.append('resource', filters.resource);
  if (filters.action) params.append('action', filters.action);
  if (filters.search) params.append('search', filters.search);

  return params.toString();
}

/**
 * Permission API methods
 */
export const permissionApi = {
  /**
   * Get all permissions with optional filters
   */
  async getAll(filters?: PermissionFilters): Promise<Permission[]> {
    const query = filters ? buildQueryString(filters) : '';
    return apiRequest<Permission[]>(`/api/organizations/permissions${query ? `?${query}` : ''}`);
  },

  /**
   * Get permissions grouped by resource
   */
  async getAllGrouped(): Promise<GroupedPermissions> {
    return apiRequest<GroupedPermissions>('/api/organizations/permissions/grouped');
  },

  /**
   * Get a single permission by ID
   */
  async getById(id: string): Promise<Permission> {
    return apiRequest<Permission>(`/api/organizations/permissions/${id}`);
  },

  /**
   * Create a new permission (admin only)
   */
  async create(data: CreatePermissionDto): Promise<Permission> {
    return apiRequest<Permission>('/api/organizations/permissions', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update a permission (admin only)
   */
  async update(id: string, data: UpdatePermissionDto): Promise<Permission> {
    return apiRequest<Permission>(`/api/organizations/permissions/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a permission
   */
  async delete(id: string): Promise<void> {
    return apiRequest<void>(`/api/organizations/permissions/${id}`, {
      method: 'DELETE',
    });
  },
};

export { PermissionApiError };
export type { Permission, CreatePermissionDto, UpdatePermissionDto };

