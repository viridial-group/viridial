/**
 * Types partagés entre services et frontend
 * 
 * Ce fichier exporte tous les types TypeScript partagés
 * pour assurer la cohérence entre backend et frontend.
 */

// User & Organization
export interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  organizationId: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  SUPER_ADMIN = 'super_admin',
  ORG_ADMIN = 'org_admin',
  AGENT = 'agent',
  USER = 'user',
}

export interface Organization {
  id: string;
  name: string;
  slug: string;
  contactEmail: string;
  createdAt: Date;
  updatedAt: Date;
}

// Property
export interface Property {
  id: string;
  organizationId: string;
  agencyId: string;
  title: Record<string, string>; // Multilingue: { fr: "...", en: "..." }
  description: Record<string, string>;
  propertyType: PropertyType;
  status: PropertyStatus;
  price: number;
  currency: string;
  address: Address;
  latitude?: number;
  longitude?: number;
  createdAt: Date;
  updatedAt: Date;
}

export enum PropertyType {
  SALE = 'sale',
  RENT = 'rent',
}

export enum PropertyStatus {
  DRAFT = 'draft',
  REVIEW = 'review',
  LISTED = 'listed',
  FLAGGED = 'flagged',
}

export interface Address {
  street?: string;
  postalCode?: string;
  city: string;
  region?: string;
  country: string;
}

// Lead
export interface Lead {
  id: string;
  organizationId: string;
  propertyId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  message?: string;
  score?: number;
  status: LeadStatus;
  createdAt: Date;
  updatedAt: Date;
}

export enum LeadStatus {
  NEW = 'new',
  CONTACTED = 'contacted',
  QUALIFIED = 'qualified',
  CONVERTED = 'converted',
  LOST = 'lost',
}

// Subscription
export interface Subscription {
  id: string;
  organizationId: string;
  planId: string;
  status: SubscriptionStatus;
  currentPeriodStart: Date;
  currentPeriodEnd: Date;
  cancelAtPeriodEnd: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export enum SubscriptionStatus {
  ACTIVE = 'active',
  CANCELED = 'canceled',
  PAST_DUE = 'past_due',
  TRIALING = 'trialing',
}

// Custom Fields (US-026)
export interface CustomFieldDefinition {
  id: string;
  organizationId: string;
  entityType: string; // 'property', 'lead', 'agency', etc.
  fieldKey: string;
  label: Record<string, string>; // Multilingue
  fieldType: CustomFieldType;
  required: boolean;
  defaultValue?: any;
  validationRules?: Record<string, any>;
  options?: string[]; // Pour select/multiselect
  reusable: boolean;
  reusableEntityTypes?: string[];
  createdAt: Date;
  updatedAt: Date;
}

export enum CustomFieldType {
  TEXT = 'text',
  TEXTAREA = 'textarea',
  NUMBER = 'number',
  DATE = 'date',
  DATETIME = 'datetime',
  BOOLEAN = 'boolean',
  SELECT = 'select',
  MULTISELECT = 'multiselect',
  URL = 'url',
  EMAIL = 'email',
}

export interface CustomFieldValue {
  id: string;
  organizationId: string;
  entityType: string;
  entityId: string;
  fieldDefinitionId: string;
  valueText?: string;
  valueNumber?: number;
  valueDate?: Date;
  valueBoolean?: boolean;
  valueJson?: any;
  createdAt: Date;
  updatedAt: Date;
}

