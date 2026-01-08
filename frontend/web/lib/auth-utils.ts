/**
 * Utilitaires pour l'authentification et l'extraction de données utilisateur
 */

import { decodeJWT } from './auth';
import { tokenStorage } from './auth';

/**
 * Obtenir l'ID utilisateur depuis le token JWT
 */
export function getUserId(): string | null {
  const token = tokenStorage.getAccessToken();
  if (!token) return null;

  const decoded = decodeJWT(token);
  if (!decoded || !decoded.sub) return null;

  return decoded.sub;
}

/**
 * Obtenir l'email utilisateur depuis le token JWT
 */
export function getUserEmail(): string | null {
  const token = tokenStorage.getAccessToken();
  if (!token) return null;

  const decoded = decodeJWT(token);
  if (!decoded || !decoded.email) return null;

  return decoded.email;
}

