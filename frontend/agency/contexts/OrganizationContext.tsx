'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { organizationService, type Organization } from '@/lib/api/organization';
import { useAuth } from './AuthContext';

interface OrganizationContextType {
  currentOrganization: Organization | null;
  organizations: Organization[];
  isLoading: boolean;
  setCurrentOrganization: (org: Organization | null) => void;
  refreshOrganizations: () => Promise<void>;
  refreshCurrentOrganization: () => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

export function OrganizationProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null);
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadOrganizations = useCallback(async () => {
    try {
      setIsLoading(true);
      const orgs = await organizationService.getAll();
      setOrganizations(orgs);
      
      // Si l'utilisateur a une organizationId, la définir comme courante
      if (user?.organizationId) {
        const org = orgs.find(o => o.id === user.organizationId);
        if (org) {
          setCurrentOrganization(org);
        }
      } else if (orgs.length > 0) {
        // Sinon, prendre la première
        setCurrentOrganization(orgs[0]);
      }
    } catch (error) {
      console.error('Failed to load organizations:', error);
      setOrganizations([]);
      setCurrentOrganization(null);
    } finally {
      setIsLoading(false);
    }
  }, [user?.organizationId]);

  // Charger les organisations au montage et quand l'utilisateur change
  useEffect(() => {
    if (isAuthenticated && user) {
      loadOrganizations();
    } else {
      setOrganizations([]);
      setCurrentOrganization(null);
      setIsLoading(false);
    }
  }, [isAuthenticated, user, loadOrganizations]);

  // Charger l'organisation courante si user.organizationId existe
  useEffect(() => {
    if (user?.organizationId && organizations.length > 0) {
      const org = organizations.find(o => o.id === user.organizationId);
      if (org) {
        setCurrentOrganization(org);
      }
    }
  }, [user?.organizationId, organizations]);

  const refreshOrganizations = useCallback(async () => {
    await loadOrganizations();
  }, [loadOrganizations]);

  const refreshCurrentOrganization = useCallback(async () => {
    if (currentOrganization?.id) {
      try {
        const org = await organizationService.getById(currentOrganization.id);
        setCurrentOrganization(org);
        setOrganizations(prev => prev.map(o => o.id === org.id ? org : o));
      } catch (error) {
        console.error('Failed to refresh current organization:', error);
      }
    }
  }, [currentOrganization?.id]);

  return (
    <OrganizationContext.Provider
      value={{
        currentOrganization,
        organizations,
        isLoading,
        setCurrentOrganization,
        refreshOrganizations,
        refreshCurrentOrganization,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}

