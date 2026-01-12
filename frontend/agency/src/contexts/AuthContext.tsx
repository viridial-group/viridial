'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useRouter } from '@/i18n/routing';
import { authApi, LoginRequest, AuthApiError } from '@/lib/auth-api';

interface User {
  id: string;
  email: string;
  role?: string;
  organizationId?: string | null;
}

interface AuthContextType {
  user: User | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (credentials: LoginRequest) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const TOKEN_STORAGE_KEYS = {
  ACCESS_TOKEN: 'accessToken',
  REFRESH_TOKEN: 'refreshToken',
  USER: 'user',
} as const;

export function AuthProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize auth state from localStorage
  useEffect(() => {
    const initializeAuth = () => {
      try {
        const storedUser = localStorage.getItem(TOKEN_STORAGE_KEYS.USER);
        const accessToken = localStorage.getItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN);
        const refreshToken = localStorage.getItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN);

        if (storedUser && accessToken) {
          setUser(JSON.parse(storedUser));
        } else if (refreshToken) {
          // Try to refresh token if refresh token exists but no access token
          refreshAccessToken().catch(() => {
            // If refresh fails, clear everything
            logout();
          });
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
        logout();
      } finally {
        setIsLoading(false);
      }
    };

    initializeAuth();
  }, []);

  // Auto-refresh token before expiration (check every 5 minutes)
  useEffect(() => {
    if (!user) return;

    const interval = setInterval(() => {
      refreshAccessToken().catch((error) => {
        console.error('Auto-refresh token failed:', error);
        // If refresh fails, logout user
        logout();
      });
    }, 5 * 60 * 1000); // 5 minutes

    return () => clearInterval(interval);
  }, [user]);

  /**
   * Refresh access token using refresh token
   */
  const refreshAccessToken = useCallback(async (): Promise<boolean> => {
    try {
      const refreshToken = localStorage.getItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN);
      if (!refreshToken) {
        return false;
      }

      const response = await authApi.refreshToken(refreshToken);
      
      localStorage.setItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN, response.accessToken);
      localStorage.setItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);

      return true;
    } catch (error) {
      console.error('Refresh token failed:', error);
      // Clear tokens on refresh failure
      logout();
      return false;
    }
  }, []);

  /**
   * Login with email and password
   */
  const login = useCallback(async (credentials: LoginRequest): Promise<void> => {
    try {
      const response = await authApi.login(credentials);

      // Store tokens
      localStorage.setItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN, response.accessToken);
      localStorage.setItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN, response.refreshToken);

      // Decode JWT to get user info (basic decoding, in production use a JWT library)
      try {
        const payload = JSON.parse(atob(response.accessToken.split('.')[1]));
        const userData: User = {
          id: payload.sub,
          email: payload.email,
          role: payload.role,
          organizationId: payload.organizationId || null,
        };
        localStorage.setItem(TOKEN_STORAGE_KEYS.USER, JSON.stringify(userData));
        setUser(userData);
      } catch (decodeError) {
        console.error('Error decoding JWT:', decodeError);
        // Fallback: try to get user info from API (if /auth/me endpoint exists)
        // For now, we'll use the payload from JWT
        throw new Error('Failed to decode user information');
      }
    } catch (error) {
      if (error instanceof AuthApiError) {
        throw error;
      }
      throw new Error('Login failed. Please try again.');
    }
  }, []);

  /**
   * Logout and clear all auth data
   */
  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(TOKEN_STORAGE_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(TOKEN_STORAGE_KEYS.USER);
    setUser(null);
    router.push('/login');
  }, [router]);

  const value: AuthContextType = {
    user,
    isLoading,
    isAuthenticated: !!user,
    login,
    logout,
    refreshAccessToken,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/**
 * Hook to use auth context
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}


