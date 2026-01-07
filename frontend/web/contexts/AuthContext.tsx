'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService, type LoginCredentials, type AuthResponse } from '@/lib/api/auth';
import { tokenStorage, isTokenExpired } from '@/lib/auth';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (credentials: LoginCredentials) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<void>;
  accessToken: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [accessToken, setAccessToken] = useState<string | null>(null);

  // Vérifier l'état d'authentification au chargement
  useEffect(() => {
    const checkAuth = async () => {
      const token = tokenStorage.getAccessToken();
      if (token && !isTokenExpired(token)) {
        setAccessToken(token);
        setIsAuthenticated(true);
      } else if (token && isTokenExpired(token)) {
        // Token expiré, essayer de le rafraîchir
        try {
          await refreshAccessToken();
        } catch {
          // Échec du refresh, déconnexion
          tokenStorage.clearTokens();
          setIsAuthenticated(false);
          setAccessToken(null);
        }
      } else {
        setIsAuthenticated(false);
        setAccessToken(null);
      }
      setIsLoading(false);
    };

    checkAuth();
  }, []);

  // Fonction pour rafraîchir le token d'accès
  const refreshAccessToken = useCallback(async () => {
    const refreshToken = tokenStorage.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    try {
      const response = await authService.refresh(refreshToken);
      tokenStorage.setTokens(response.accessToken, response.refreshToken);
      setAccessToken(response.accessToken);
      setIsAuthenticated(true);
    } catch (error) {
      tokenStorage.clearTokens();
      setIsAuthenticated(false);
      setAccessToken(null);
      throw error;
    }
  }, []);

  // Fonction de connexion
  const login = useCallback(async (credentials: LoginCredentials) => {
    try {
      const response: AuthResponse = await authService.login(credentials);
      tokenStorage.setTokens(response.accessToken, response.refreshToken);
      setAccessToken(response.accessToken);
      setIsAuthenticated(true);
    } catch (error) {
      setIsAuthenticated(false);
      setAccessToken(null);
      throw error;
    }
  }, []);

  // Fonction de déconnexion
  const logout = useCallback(() => {
    tokenStorage.clearTokens();
    setIsAuthenticated(false);
    setAccessToken(null);
  }, []);

  return (
    <AuthContext.Provider
      value={{
        isAuthenticated,
        isLoading,
        login,
        logout,
        refreshAccessToken,
        accessToken,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

