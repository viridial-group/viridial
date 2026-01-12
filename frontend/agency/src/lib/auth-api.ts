/**
 * Auth API Client
 * Handles all authentication-related API calls to organization-service
 */

const AUTH_API_URL = process.env.NEXT_PUBLIC_ORGANIZATION_API_URL || process.env.NEXT_PUBLIC_AUTH_API_URL || 'http://localhost:3002';

export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  accessToken: string;
  refreshToken: string;
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface RefreshTokenResponse {
  accessToken: string;
  refreshToken: string;
}

export interface SignupRequest {
  email: string;
  password: string;
  confirmPassword: string;
}

export interface SignupResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: string;
    emailVerified: boolean;
  };
}

export interface SignupWithOrganizationRequest {
  email: string;
  password: string;
  confirmPassword: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  preferredLanguage?: string;
  organization: {
    name: string;
    slug: string;
    description?: string;
    plan?: 'free' | 'basic' | 'professional' | 'enterprise';
    country?: string;
    city?: string;
    website?: string;
    industry?: string;
  };
}

export interface SignupWithOrganizationResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    role: string;
    organizationId: string;
    emailVerified: boolean;
  };
  organization: {
    id: string;
    name: string;
    slug: string;
  };
  message: string;
}

export interface ApiError {
  message: string;
  statusCode?: number;
  error?: string;
}

class AuthApiError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public error?: string,
  ) {
    super(message);
    this.name = 'AuthApiError';
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
  const url = `${AUTH_API_URL}${endpoint}`;
  
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
    throw new AuthApiError(error.statusCode || response.status, error.message, error.error);
  }

  // Handle empty responses (204 No Content)
  if (response.status === 204) {
    return {} as T;
  }

  return response.json();
}

/**
 * Auth API Client
 */
export const authApi = {
  /**
   * Login with email and password
   */
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    return apiRequest<LoginResponse>('/auth/login', {
      method: 'POST',
      body: JSON.stringify(credentials),
    });
  },

  /**
   * Signup new user
   */
  async signup(data: SignupRequest): Promise<SignupResponse> {
    return apiRequest<SignupResponse>('/auth/signup', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Signup new user with organization (for super admin organization setup)
   */
  async signupWithOrganization(data: SignupWithOrganizationRequest): Promise<SignupWithOrganizationResponse> {
    return apiRequest<SignupWithOrganizationResponse>('/auth/signup-with-organization', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  /**
   * Refresh access token using refresh token
   */
  async refreshToken(refreshToken: string): Promise<RefreshTokenResponse> {
    return apiRequest<RefreshTokenResponse>('/auth/refresh', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  },

  /**
   * Request password reset
   */
  async forgotPassword(email: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>('/auth/forgot-password', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  /**
   * Reset password with token
   */
  async resetPassword(
    token: string,
    newPassword: string,
    confirmPassword: string,
  ): Promise<{ message: string }> {
    return apiRequest<{ message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword, confirmPassword }),
    });
  },

  /**
   * Verify email with token
   */
  async verifyEmail(token: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>('/auth/verify-email', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  },

  /**
   * Resend verification email
   */
  async resendVerification(email: string): Promise<{ message: string }> {
    return apiRequest<{ message: string }>('/auth/resend-verification', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  /**
   * Health check
   */
  async health(): Promise<{ status: string; service: string }> {
    return apiRequest<{ status: string; service: string }>('/auth/health', {
      method: 'GET',
    });
  },
};

export { AuthApiError };

