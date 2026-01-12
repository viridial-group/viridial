/**
 * Admin Types - Super Admin SaaS Management
 * Types for managing resources, features, and permissions in organization-service
 */

/**
 * Resource entity matching organization-service Resource entity
 */
export interface Resource {
  id: string;
  internalCode: string;
  externalCode?: string | null;
  name: string; // e.g., 'property', 'user', 'organization'
  description?: string;
  category?: string; // e.g., 'core', 'admin', 'billing'
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  permissions?: Permission[]; // Optional: populated when needed
}

/**
 * Feature entity matching organization-service Feature entity
 */
export interface Feature {
  id: string;
  internalCode: string;
  externalCode?: string | null;
  name: string; // e.g., 'property-management', 'user-management', 'billing'
  description?: string;
  category?: string; // e.g., 'core', 'premium', 'addon'
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  permissions?: Permission[]; // Optional: populated when needed
}

/**
 * Permission entity matching organization-service Permission entity
 */
export interface Permission {
  id: string;
  internalCode: string;
  externalCode?: string | null;
  resourceId?: string | null;
  resource: string; // e.g., 'property', 'user', 'organization'
  action: string; // e.g., 'read', 'write', 'delete', 'admin'
  description?: string;
  createdAt: string;
  updatedAt: string;
  roles?: Array<{
    id: string;
    name: string;
  }>; // Optional: populated when needed
  features?: Array<{
    id: string;
    name: string;
  }>; // Optional: populated when needed
}

/**
 * DTOs for creating resources
 */
export interface CreateResourceDto {
  name: string;
  description?: string;
  category?: string;
  externalCode?: string;
  isActive?: boolean;
}

/**
 * DTOs for updating resources
 */
export interface UpdateResourceDto {
  name?: string;
  description?: string;
  category?: string;
  externalCode?: string;
  isActive?: boolean;
}

/**
 * DTOs for creating features
 */
export interface CreateFeatureDto {
  name: string;
  description?: string;
  category?: string;
  externalCode?: string;
  isActive?: boolean;
  permissionIds?: string[]; // Permissions to include in this feature
}

/**
 * DTOs for updating features
 */
export interface UpdateFeatureDto {
  name?: string;
  description?: string;
  category?: string;
  externalCode?: string;
  isActive?: boolean;
  permissionIds?: string[]; // Permissions to include in this feature
}

/**
 * DTOs for creating permissions
 */
export interface CreatePermissionDto {
  resourceId?: string;
  resourceName?: string;
  resource: string; // Required: resource name (for backward compatibility)
  action: string;
  description?: string;
  externalCode?: string;
  featureIds?: string[];
}

/**
 * DTOs for updating permissions
 */
export interface UpdatePermissionDto {
  resourceId?: string;
  resourceName?: string;
  resource?: string;
  action?: string;
  description?: string;
  externalCode?: string;
  featureIds?: string[];
}

/**
 * Filters for resources
 */
export interface ResourceFilters {
  category?: string;
  isActive?: boolean;
  search?: string;
}

/**
 * Filters for features
 */
export interface FeatureFilters {
  category?: string;
  isActive?: boolean;
  search?: string;
}

/**
 * Filters for permissions
 */
export interface PermissionFilters {
  resourceId?: string;
  resource?: string;
  action?: string;
  search?: string;
}

/**
 * Grouped permissions by resource
 */
export type GroupedPermissions = Record<string, Permission[]>;
