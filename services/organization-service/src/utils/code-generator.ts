/**
 * Utility functions for generating internal codes
 */

import { randomBytes } from 'crypto';

/**
 * Generate a short unique code
 * Format: {prefix}-{8 char hex string}
 */
export function generateInternalCode(prefix: string): string {
  const shortId = randomBytes(4).toString('hex').toUpperCase();
  return `${prefix.toUpperCase()}-${shortId}`;
}

/**
 * Entity type prefixes for internal codes
 */
export const ENTITY_PREFIXES = {
  USER: 'USR',
  ROLE: 'ROL',
  PERMISSION: 'PER',
  ORGANIZATION: 'ORG',
  ORGANIZATION_ADDRESS: 'ADR',
  ORGANIZATION_PHONE: 'PHN',
  ORGANIZATION_EMAIL: 'EML',
  USER_ROLE: 'URR',
  RESOURCE: 'RSC',
  FEATURE: 'FTR',
  PLAN: 'PLN',
  PLAN_FEATURE: 'PLF',
  PLAN_LIMIT: 'PLL',
  SUBSCRIPTION: 'SUB',
  BOOSTER_PACK: 'BSP',
} as const;

