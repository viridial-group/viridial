/**
 * Hook pour utiliser PropertyService avec authentification automatique
 */

import { useMemo } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { PropertyService } from '@/lib/api/property';

const PROPERTY_API_URL = process.env.NEXT_PUBLIC_PROPERTY_API_URL || 'http://localhost:3001';

/**
 * Hook qui retourne une instance de PropertyService avec le token d'authentification
 */
export function usePropertyService(): PropertyService {
  const { accessToken } = useAuth();

  return useMemo(() => {
    return new PropertyService(PROPERTY_API_URL, () => accessToken);
  }, [accessToken]);
}

