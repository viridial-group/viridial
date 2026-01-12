export type Permission = 
  | 'organizations:read'
  | 'organizations:write'
  | 'organizations:delete'
  | 'users:read'
  | 'users:write'
  | 'users:delete'
  | 'roles:read'
  | 'roles:write'
  | 'roles:delete'
  | 'properties:read'
  | 'properties:write'
  | 'properties:delete'
  | 'settings:read'
  | 'settings:write';

/**
 * Role interface matching organization-service entity structure
 * Compatible with Role entity from organization-service
 */
export interface Role {
  id: string;
  name: string;
  description?: string;
  organizationId: string | null; // null = global role (system admin)
  isActive: boolean;
  permissions: Permission[];
  createdAt: string;
  updatedAt: string;
}

/**
 * User interface matching organization-service entity structure
 * Compatible with User entity from organization-service
 * 
 * Note: The entity uses 'role' (string) for legacy compatibility.
 * For frontend compatibility with mock data and components, 'roleId' is also supported.
 */
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  preferredLanguage?: string; // e.g., 'en', 'fr', 'es', 'de'
  avatar?: string;
  role: string; // Legacy role field (role name from entity) - matches organization-service entity
  roleId?: string; // Optional: for frontend compatibility (maps to role via userRoles or role lookup)
  organizationId: string | null;
  isActive: boolean;
  emailVerified?: boolean;
  lastLoginAt?: string;
  createdAt: string;
  updatedAt: string;
  // RBAC relationships (optional, populated when needed)
  userRoles?: Array<{
    userId: string;
    roleId: string;
    assignedAt: string;
    role?: Role;
  }>;
}

export interface Address {
  id: string;
  type: 'headquarters' | 'branch' | 'warehouse' | 'other';
  street: string;
  city: string;
  postalCode: string;
  country: string;
  isPrimary: boolean;
}

export interface Phone {
  id: string;
  type: 'main' | 'sales' | 'support' | 'billing' | 'other';
  number: string;
  isPrimary: boolean;
}

export interface Email {
  id: string;
  type: 'main' | 'sales' | 'support' | 'billing' | 'other';
  address: string;
  isPrimary: boolean;
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  description?: string;
  logo?: string;
  plan: 'free' | 'basic' | 'professional' | 'enterprise';
  maxUsers: number;
  isActive: boolean;
  country?: string;
  city?: string;
  parentId?: string; // ID de l'organisation parente
  
  // Informations légales et administratives
  legalName?: string; // Dénomination sociale complète
  registrationNumber?: string; // SIRET / Numéro d'identification
  vatNumber?: string; // Numéro de TVA intracommunautaire
  legalForm?: 'SARL' | 'SA' | 'SAS' | 'SNC' | 'EURL' | 'SELARL' | 'SCI' | 'Other'; // Forme juridique
  rcsNumber?: string; // Numéro RCS (Registre du Commerce et des Sociétés)
  siren?: string; // Numéro SIREN (pour France)
  siret?: string; // Numéro SIRET (pour France)
  legalAddress?: Address; // Siège social (si différent de l'adresse principale)
  foundingDate?: string; // Date de création juridique
  
  // Informations financières et commerciales
  currency?: string; // Devise principale (EUR, USD, etc.)
  commissionRate?: number; // Taux de commission standard (%)
  paymentTerms?: string; // Conditions de paiement (ex: "Net 30 jours")
  billingEmail?: string; // Email pour facturation
  
  // Informations métier
  website?: string; // Site web
  industry?: string; // Secteur d'activité
  specialties?: string[]; // Spécialités (ex: ["luxe", "commercial", "location"])
  yearEstablished?: number; // Année de création
  languages?: string[]; // Langues parlées (ex: ["fr", "en", "es"])
  
  // Réseaux sociaux et communication
  socialNetworks?: {
    facebook?: string;
    linkedin?: string;
    twitter?: string;
    instagram?: string;
    youtube?: string;
  };
  
  // Informations de gestion
  managerName?: string; // Nom du directeur/manager principal
  managerEmail?: string; // Email du manager
  managerPhone?: string; // Téléphone du manager
  notes?: string; // Notes internes
  tags?: string[]; // Tags/Labels pour catégorisation
  internalCode?: string; // Code interne (référence interne)
  externalCode?: string; // Code externe (référence client)
  
  // Informations contractuelles
  contractStartDate?: string; // Date de début du contrat
  contractEndDate?: string; // Date de fin du contrat
  contractRenewalDate?: string; // Date de renouvellement prévu
  subscriptionStatus?: 'active' | 'trial' | 'suspended' | 'cancelled' | 'expired'; // Statut d'abonnement
  
  // Informations de conformité
  complianceStatus?: 'compliant' | 'pending' | 'non_compliant' | 'under_review'; // Statut de conformité
  lastComplianceCheck?: string; // Date du dernier contrôle de conformité
  licenseNumber?: string; // Numéro de licence professionnelle (obligatoire pour agences immobilières en France)
  licenseAuthority?: string; // Autorité émettrice de la licence
  licenseExpiryDate?: string; // Date d'expiration de la licence
  
  // Statistiques et métriques (calculées, non stockées directement)
  totalProperties?: number; // Nombre total de biens gérés
  activeProperties?: number; // Nombre de biens actifs
  totalLeads?: number; // Nombre total de leads
  monthlyRevenue?: number; // Chiffre d'affaires mensuel
  
  // Relations
  addresses?: Address[];
  phones?: Phone[];
  emails?: Email[];
  subscriptions?: import('./plans').Subscription[]; // Subscriptions with plans (from new plan management API)
  
  // Métadonnées
  createdAt: string;
  updatedAt: string;
  createdBy?: string; // ID de l'utilisateur créateur
  updatedBy?: string; // ID du dernier utilisateur modificateur
}

/**
 * UserWithRole interface - User with populated Role object
 * Uses Omit to exclude the string 'role' field and add Role object
 */
export interface UserWithRole extends Omit<User, 'role'> {
  role: Role; // Override: Role object instead of string
}

export interface OrganizationWithStats extends Organization {
  userCount: number;
  activeUserCount: number;
}

