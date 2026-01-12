/**
 * User API Client
 * Handles all user-related API calls to admin-service
 * 
 * Note: The User entity structure is compatible with organization-service entities.
 * Organization-service includes User, Role, Permission, and UserRole entities for RBAC.
 * Currently using admin-service endpoints, but types match organization-service entity structure.
 * 
 * Service URL: http://localhost:3002 (admin-service)
 * Compatible with: organization-service User entity structure
 */

const ADMIN_API_URL = process.env.NEXT_AGENCY_ORGANIZATION_API_URL || 'http://localhost:3002';

export interface ApiError {
  message: string;
  statusCode?: number;
  error?: string;
}

class UserApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public error?: string,
  ) {
    super(message);
    this.name = 'UserApiError';
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

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const error = await parseErrorResponse(response);
    throw new UserApiError(error.statusCode || response.status, error.message, error.error);
  }

  // Handle empty responses (204 No Content)
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

/**
 * Build query string from filters
 * Only includes parameters that are supported by the backend UserFiltersDto
 */
function buildQueryString(filters: Record<string, any>): string {
  const params = new URLSearchParams();
  // Backend UserFiltersDto only accepts: organizationId, role, isActive, search
  const allowedParams = ['organizationId', 'role', 'isActive', 'search'];
  
  Object.entries(filters).forEach(([key, value]) => {
    // Only include allowed parameters
    if (allowedParams.includes(key) && value !== undefined && value !== null && value !== '') {
      if (Array.isArray(value)) {
        value.forEach((item) => params.append(key, String(item)));
      } else {
        params.append(key, String(value));
      }
    }
  });
  return params.toString();
}

/**
 * User API Types
 * These types match the User entity structure in both admin-service and organization-service
 * Note: Currently using admin-service endpoints, but types are compatible with organization-service entities
 */

// Types based on admin-service and organization-service DTOs
export interface CreateUserDto {
  email: string;
  password: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  preferredLanguage?: string; // e.g., 'en', 'fr', 'es', 'de'
  role: string; // Legacy role field (for backward compatibility)
  organizationId: string;
}

export interface UpdateUserDto {
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  preferredLanguage?: string; // e.g., 'en', 'fr', 'es', 'de'
  role?: string; // Legacy role field (for backward compatibility)
  organizationId?: string | null;
  isActive?: boolean;
}

export interface UserFiltersDto {
  organizationId?: string;
  role?: string;
  isActive?: boolean;
  search?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

/**
 * User interface matching organization-service entity structure
 * Compatible with both admin-service and organization-service User entities
 */
export interface User {
  id: string;
  internalCode?: string;
  externalCode?: string | null;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  role: string; // Legacy role field (for backward compatibility with RBAC via UserRole)
  organizationId: string | null;
  isActive: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
  organization?: {
    id: string;
    name: string;
    slug: string;
  };
  // RBAC relationships (optional, populated when needed)
  userRoles?: Array<{
    userId: string;
    roleId: string;
    assignedAt: string;
    role?: {
      id: string;
      name: string;
      description?: string;
      organizationId: string | null;
      isActive: boolean;
      permissions?: Array<{
        id: string;
        resource: string;
        action: string;
        description?: string;
      }>;
    };
  }>;
}

export interface ResetPasswordDto {
  newPassword: string;
}

export const userApi = {
  /**
   * Get all users with filters, sorting, and pagination
   */
  async findAll(filters?: UserFiltersDto): Promise<{
    data: User[];
    meta: {
      page: number;
      limit: number;
      total: number;
      totalPages: number;
    };
  }> {
    const query = filters ? buildQueryString(filters) : '';
    const response = await apiRequest<User[] | {
      data: User[];
      meta: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
      };
    }>(`/api/organizations/users${query ? `?${query}` : ''}`, {
      method: 'GET',
    });
    
    // Backend returns User[] directly, but frontend expects { data: User[], meta: {...} }
    // Handle both formats for compatibility
    if (Array.isArray(response)) {
      return {
        data: response,
        meta: {
          page: 1,
          limit: response.length,
          total: response.length,
          totalPages: 1,
        },
      };
    }
    
    return response;
  },

  /**
   * Get user by ID
   */
  async getById(id: string): Promise<User> {
    return apiRequest<User>(`/api/organizations/users/${id}`, {
      method: 'GET',
    });
  },

  /**
   * Create a new user
   */
  async create(data: CreateUserDto): Promise<User> {
    return apiRequest<User>('/api/organizations/users', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Update a user
   */
  async update(id: string, data: UpdateUserDto): Promise<User> {
    return apiRequest<User>(`/api/organizations/users/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  /**
   * Delete a user
   */
  async delete(id: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/api/organizations/users/${id}`, {
      method: 'DELETE',
    });
  },

  /**
   * Reset user password
   */
  async resetPassword(id: string, data: ResetPasswordDto): Promise<{ message: string }> {
    return apiRequest<{ message: string }>(`/api/organizations/users/${id}/reset-password`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Assign roles to a user
   */
  async assignRoles(id: string, roleIds: string[]): Promise<User> {
    return apiRequest<User>(`/api/organizations/users/${id}/roles`, {
      method: 'POST',
      body: JSON.stringify({ roleIds }),
    });
  },

  /**
   * Remove roles from a user
   */
  async removeRoles(id: string, roleIds: string[]): Promise<User> {
    const queryParams = roleIds.map(id => `roleIds=${id}`).join('&');
    return apiRequest<User>(`/api/organizations/users/${id}/roles?${queryParams}`, {
      method: 'DELETE',
    });
  },
};

export { UserApiError };

