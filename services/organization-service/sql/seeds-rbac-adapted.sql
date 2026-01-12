-- ============================================================================
-- RBAC Seed Data: Resources, Features, Permissions, and Roles
-- Adapted for Resource and Feature Management
-- ============================================================================
-- This seed file populates the RBAC system with:
-- 1. Resources (system entities)
-- 2. Features (business capabilities)
-- 3. Permissions (actions on resources, linked to features)
-- 4. Roles (collections of permissions)
-- 5. Role-Permission assignments
-- 6. Feature-Permission assignments
-- ============================================================================
-- IMPORTANT NOTES:
-- 1. Internal codes are generated automatically in the application (BeforeInsert hook)
--    These seed scripts use a simple hash approach for SQL compatibility
-- 2. UUIDs are generated dynamically using uuid_generate_v4()
-- 3. This script uses INSERT ... ON CONFLICT DO NOTHING to avoid duplicates
-- 4. resource_id in permissions is NOT NULL - all permissions must be linked to a resource
-- ============================================================================

-- ============================================================================
-- DELETE EXISTING SEED DATA (in reverse dependency order)
-- ============================================================================
-- Delete junction tables first (they reference other tables)
DELETE FROM feature_permissions;
DELETE FROM role_permissions;
DELETE FROM user_roles;

-- Delete main entities (in reverse dependency order)
DELETE FROM permissions;
DELETE FROM features;
DELETE FROM resources;
DELETE FROM roles WHERE organization_id IS NULL; -- Only delete global roles, keep org-specific ones

-- Note: Users and organizations are not deleted here as they may contain production data

-- ============================================================================
-- RESOURCES: System Entities
-- ============================================================================
-- Resources represent system entities that can be acted upon
-- Examples: 'user', 'organization', 'role', 'permission', 'resource', 'feature'

-- Core Resources
INSERT INTO resources (id, internal_code, name, description, category, is_active, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'RES-' || upper(substring(md5('organization' || random()::text) from 1 for 8)),
    'organization', 'Organization management resource', 'core', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM resources WHERE name = 'organization')
ON CONFLICT (name) DO NOTHING;

INSERT INTO resources (id, internal_code, name, description, category, is_active, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'RES-' || upper(substring(md5('user' || random()::text) from 1 for 8)),
    'user', 'User management resource', 'core', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM resources WHERE name = 'user')
ON CONFLICT (name) DO NOTHING;

INSERT INTO resources (id, internal_code, name, description, category, is_active, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'RES-' || upper(substring(md5('role' || random()::text) from 1 for 8)),
    'role', 'Role management resource', 'admin', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM resources WHERE name = 'role')
ON CONFLICT (name) DO NOTHING;

INSERT INTO resources (id, internal_code, name, description, category, is_active, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'RES-' || upper(substring(md5('permission' || random()::text) from 1 for 8)),
    'permission', 'Permission management resource', 'admin', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM resources WHERE name = 'permission')
ON CONFLICT (name) DO NOTHING;

INSERT INTO resources (id, internal_code, name, description, category, is_active, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'RES-' || upper(substring(md5('resource' || random()::text) from 1 for 8)),
    'resource', 'Resource management resource', 'admin', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM resources WHERE name = 'resource')
ON CONFLICT (name) DO NOTHING;

INSERT INTO resources (id, internal_code, name, description, category, is_active, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'RES-' || upper(substring(md5('feature' || random()::text) from 1 for 8)),
    'feature', 'Feature management resource', 'admin', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM resources WHERE name = 'feature')
ON CONFLICT (name) DO NOTHING;

-- Business Resources
INSERT INTO resources (id, internal_code, name, description, category, is_active, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'RES-' || upper(substring(md5('plan' || random()::text) from 1 for 8)),
    'plan', 'Plan management resource', 'billing', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM resources WHERE name = 'plan')
ON CONFLICT (name) DO NOTHING;

INSERT INTO resources (id, internal_code, name, description, category, is_active, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'RES-' || upper(substring(md5('subscription' || random()::text) from 1 for 8)),
    'subscription', 'Subscription management resource', 'billing', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM resources WHERE name = 'subscription')
ON CONFLICT (name) DO NOTHING;

INSERT INTO resources (id, internal_code, name, description, category, is_active, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'RES-' || upper(substring(md5('property' || random()::text) from 1 for 8)),
    'property', 'Property management resource', 'other', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM resources WHERE name = 'property')
ON CONFLICT (name) DO NOTHING;

INSERT INTO resources (id, internal_code, name, description, category, is_active, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'RES-' || upper(substring(md5('client' || random()::text) from 1 for 8)),
    'client', 'Client management resource', 'other', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM resources WHERE name = 'client')
ON CONFLICT (name) DO NOTHING;

-- System Resources
INSERT INTO resources (id, internal_code, name, description, category, is_active, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'RES-' || upper(substring(md5('analytics' || random()::text) from 1 for 8)),
    'analytics', 'Analytics and reporting resource', 'other', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM resources WHERE name = 'analytics')
ON CONFLICT (name) DO NOTHING;

INSERT INTO resources (id, internal_code, name, description, category, is_active, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'RES-' || upper(substring(md5('settings' || random()::text) from 1 for 8)),
    'settings', 'System settings resource', 'other', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM resources WHERE name = 'settings')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- FEATURES: Business Capabilities
-- ============================================================================
-- Features group related permissions together
-- Examples: 'user-management', 'organization-management', 'role-management'

-- Core Features
INSERT INTO features (id, internal_code, name, description, category, is_active, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'FEA-' || upper(substring(md5('organization-management' || random()::text) from 1 for 8)),
    'organization-management', 'Organization management feature', 'core', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM features WHERE name = 'organization-management')
ON CONFLICT (name) DO NOTHING;

INSERT INTO features (id, internal_code, name, description, category, is_active, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'FEA-' || upper(substring(md5('user-management' || random()::text) from 1 for 8)),
    'user-management', 'User management feature', 'core', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM features WHERE name = 'user-management')
ON CONFLICT (name) DO NOTHING;

INSERT INTO features (id, internal_code, name, description, category, is_active, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'FEA-' || upper(substring(md5('role-management' || random()::text) from 1 for 8)),
    'role-management', 'Role management feature', 'administration', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM features WHERE name = 'role-management')
ON CONFLICT (name) DO NOTHING;

INSERT INTO features (id, internal_code, name, description, category, is_active, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'FEA-' || upper(substring(md5('permission-management' || random()::text) from 1 for 8)),
    'permission-management', 'Permission management feature', 'administration', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM features WHERE name = 'permission-management')
ON CONFLICT (name) DO NOTHING;

INSERT INTO features (id, internal_code, name, description, category, is_active, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'FEA-' || upper(substring(md5('resource-management' || random()::text) from 1 for 8)),
    'resource-management', 'Resource management feature', 'administration', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM features WHERE name = 'resource-management')
ON CONFLICT (name) DO NOTHING;

INSERT INTO features (id, internal_code, name, description, category, is_active, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'FEA-' || upper(substring(md5('feature-management' || random()::text) from 1 for 8)),
    'feature-management', 'Feature management feature', 'administration', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM features WHERE name = 'feature-management')
ON CONFLICT (name) DO NOTHING;

-- Business Features
INSERT INTO features (id, internal_code, name, description, category, is_active, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'FEA-' || upper(substring(md5('plan-management' || random()::text) from 1 for 8)),
    'plan-management', 'Plan management feature', 'premium', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM features WHERE name = 'plan-management')
ON CONFLICT (name) DO NOTHING;

INSERT INTO features (id, internal_code, name, description, category, is_active, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'FEA-' || upper(substring(md5('subscription-management' || random()::text) from 1 for 8)),
    'subscription-management', 'Subscription management feature', 'premium', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM features WHERE name = 'subscription-management')
ON CONFLICT (name) DO NOTHING;

INSERT INTO features (id, internal_code, name, description, category, is_active, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'FEA-' || upper(substring(md5('property-management' || random()::text) from 1 for 8)),
    'property-management', 'Property management feature', 'premium', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM features WHERE name = 'property-management')
ON CONFLICT (name) DO NOTHING;

INSERT INTO features (id, internal_code, name, description, category, is_active, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'FEA-' || upper(substring(md5('client-management' || random()::text) from 1 for 8)),
    'client-management', 'Client management feature', 'premium', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM features WHERE name = 'client-management')
ON CONFLICT (name) DO NOTHING;

-- System Features
INSERT INTO features (id, internal_code, name, description, category, is_active, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'FEA-' || upper(substring(md5('analytics' || random()::text) from 1 for 8)),
    'analytics', 'Analytics and reporting feature', 'premium', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM features WHERE name = 'analytics')
ON CONFLICT (name) DO NOTHING;

INSERT INTO features (id, internal_code, name, description, category, is_active, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'FEA-' || upper(substring(md5('settings' || random()::text) from 1 for 8)),
    'settings', 'System settings feature', 'core', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM features WHERE name = 'settings')
ON CONFLICT (name) DO NOTHING;

-- ============================================================================
-- PERMISSIONS: Actions on Resources
-- ============================================================================
-- Permissions link Resources with Actions
-- Format: {resource}:{action} (e.g., 'user:read', 'organization:write')
-- Note: resource_id is NOT NULL - all permissions must be linked to a resource

-- Organization permissions
INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('organization-read' || random()::text) from 1 for 8)),
    r.id, 'organization', 'read', 'View organizations', NOW(), NOW()
FROM resources r
WHERE r.name = 'organization'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'organization' AND action = 'read')
ON CONFLICT (resource_id, action) DO NOTHING;

INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('organization-create' || random()::text) from 1 for 8)),
    r.id, 'organization', 'create', 'Create organizations', NOW(), NOW()
FROM resources r
WHERE r.name = 'organization'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'organization' AND action = 'create')
ON CONFLICT (resource_id, action) DO NOTHING;

INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('organization-update' || random()::text) from 1 for 8)),
    r.id, 'organization', 'update', 'Update organizations', NOW(), NOW()
FROM resources r
WHERE r.name = 'organization'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'organization' AND action = 'update')
ON CONFLICT (resource_id, action) DO NOTHING;

INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('organization-delete' || random()::text) from 1 for 8)),
    r.id, 'organization', 'delete', 'Delete organizations', NOW(), NOW()
FROM resources r
WHERE r.name = 'organization'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'organization' AND action = 'delete')
ON CONFLICT (resource_id, action) DO NOTHING;

INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('organization-admin' || random()::text) from 1 for 8)),
    r.id, 'organization', 'admin', 'Full organization administration', NOW(), NOW()
FROM resources r
WHERE r.name = 'organization'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'organization' AND action = 'admin')
ON CONFLICT (resource_id, action) DO NOTHING;

-- User permissions
INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('user-read' || random()::text) from 1 for 8)),
    r.id, 'user', 'read', 'View users', NOW(), NOW()
FROM resources r
WHERE r.name = 'user'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'user' AND action = 'read')
ON CONFLICT (resource_id, action) DO NOTHING;

INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('user-create' || random()::text) from 1 for 8)),
    r.id, 'user', 'create', 'Create users', NOW(), NOW()
FROM resources r
WHERE r.name = 'user'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'user' AND action = 'create')
ON CONFLICT (resource_id, action) DO NOTHING;

INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('user-update' || random()::text) from 1 for 8)),
    r.id, 'user', 'update', 'Update users', NOW(), NOW()
FROM resources r
WHERE r.name = 'user'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'user' AND action = 'update')
ON CONFLICT (resource_id, action) DO NOTHING;

INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('user-delete' || random()::text) from 1 for 8)),
    r.id, 'user', 'delete', 'Delete users', NOW(), NOW()
FROM resources r
WHERE r.name = 'user'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'user' AND action = 'delete')
ON CONFLICT (resource_id, action) DO NOTHING;

INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('user-admin' || random()::text) from 1 for 8)),
    r.id, 'user', 'admin', 'Full user administration', NOW(), NOW()
FROM resources r
WHERE r.name = 'user'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'user' AND action = 'admin')
ON CONFLICT (resource_id, action) DO NOTHING;

-- Role permissions
INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('role-read' || random()::text) from 1 for 8)),
    r.id, 'role', 'read', 'View roles', NOW(), NOW()
FROM resources r
WHERE r.name = 'role'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'role' AND action = 'read')
ON CONFLICT (resource_id, action) DO NOTHING;

INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('role-create' || random()::text) from 1 for 8)),
    r.id, 'role', 'create', 'Create roles', NOW(), NOW()
FROM resources r
WHERE r.name = 'role'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'role' AND action = 'create')
ON CONFLICT (resource_id, action) DO NOTHING;

INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('role-update' || random()::text) from 1 for 8)),
    r.id, 'role', 'update', 'Update roles', NOW(), NOW()
FROM resources r
WHERE r.name = 'role'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'role' AND action = 'update')
ON CONFLICT (resource_id, action) DO NOTHING;

INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('role-delete' || random()::text) from 1 for 8)),
    r.id, 'role', 'delete', 'Delete roles', NOW(), NOW()
FROM resources r
WHERE r.name = 'role'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'role' AND action = 'delete')
ON CONFLICT (resource_id, action) DO NOTHING;

INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('role-admin' || random()::text) from 1 for 8)),
    r.id, 'role', 'admin', 'Full role administration', NOW(), NOW()
FROM resources r
WHERE r.name = 'role'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'role' AND action = 'admin')
ON CONFLICT (resource_id, action) DO NOTHING;

-- Permission permissions
INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('permission-read' || random()::text) from 1 for 8)),
    r.id, 'permission', 'read', 'View permissions', NOW(), NOW()
FROM resources r
WHERE r.name = 'permission'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'permission' AND action = 'read')
ON CONFLICT (resource_id, action) DO NOTHING;

INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('permission-create' || random()::text) from 1 for 8)),
    r.id, 'permission', 'create', 'Create permissions', NOW(), NOW()
FROM resources r
WHERE r.name = 'permission'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'permission' AND action = 'create')
ON CONFLICT (resource_id, action) DO NOTHING;

INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('permission-update' || random()::text) from 1 for 8)),
    r.id, 'permission', 'update', 'Update permissions', NOW(), NOW()
FROM resources r
WHERE r.name = 'permission'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'permission' AND action = 'update')
ON CONFLICT (resource_id, action) DO NOTHING;

INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('permission-delete' || random()::text) from 1 for 8)),
    r.id, 'permission', 'delete', 'Delete permissions', NOW(), NOW()
FROM resources r
WHERE r.name = 'permission'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'permission' AND action = 'delete')
ON CONFLICT (resource_id, action) DO NOTHING;

INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('permission-admin' || random()::text) from 1 for 8)),
    r.id, 'permission', 'admin', 'Full permission administration', NOW(), NOW()
FROM resources r
WHERE r.name = 'permission'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'permission' AND action = 'admin')
ON CONFLICT (resource_id, action) DO NOTHING;

-- Resource permissions
INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('resource-read' || random()::text) from 1 for 8)),
    r.id, 'resource', 'read', 'View resources', NOW(), NOW()
FROM resources r
WHERE r.name = 'resource'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'resource' AND action = 'read')
ON CONFLICT (resource_id, action) DO NOTHING;

INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('resource-create' || random()::text) from 1 for 8)),
    r.id, 'resource', 'create', 'Create resources', NOW(), NOW()
FROM resources r
WHERE r.name = 'resource'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'resource' AND action = 'create')
ON CONFLICT (resource_id, action) DO NOTHING;

INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('resource-update' || random()::text) from 1 for 8)),
    r.id, 'resource', 'update', 'Update resources', NOW(), NOW()
FROM resources r
WHERE r.name = 'resource'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'resource' AND action = 'update')
ON CONFLICT (resource_id, action) DO NOTHING;

INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('resource-delete' || random()::text) from 1 for 8)),
    r.id, 'resource', 'delete', 'Delete resources', NOW(), NOW()
FROM resources r
WHERE r.name = 'resource'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'resource' AND action = 'delete')
ON CONFLICT (resource_id, action) DO NOTHING;

INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('resource-admin' || random()::text) from 1 for 8)),
    r.id, 'resource', 'admin', 'Full resource administration', NOW(), NOW()
FROM resources r
WHERE r.name = 'resource'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'resource' AND action = 'admin')
ON CONFLICT (resource_id, action) DO NOTHING;

-- Feature permissions
INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('feature-read' || random()::text) from 1 for 8)),
    r.id, 'feature', 'read', 'View features', NOW(), NOW()
FROM resources r
WHERE r.name = 'feature'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'feature' AND action = 'read')
ON CONFLICT (resource_id, action) DO NOTHING;

INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('feature-create' || random()::text) from 1 for 8)),
    r.id, 'feature', 'create', 'Create features', NOW(), NOW()
FROM resources r
WHERE r.name = 'feature'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'feature' AND action = 'create')
ON CONFLICT (resource_id, action) DO NOTHING;

INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('feature-update' || random()::text) from 1 for 8)),
    r.id, 'feature', 'update', 'Update features', NOW(), NOW()
FROM resources r
WHERE r.name = 'feature'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'feature' AND action = 'update')
ON CONFLICT (resource_id, action) DO NOTHING;

INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('feature-delete' || random()::text) from 1 for 8)),
    r.id, 'feature', 'delete', 'Delete features', NOW(), NOW()
FROM resources r
WHERE r.name = 'feature'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'feature' AND action = 'delete')
ON CONFLICT (resource_id, action) DO NOTHING;

INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('feature-admin' || random()::text) from 1 for 8)),
    r.id, 'feature', 'admin', 'Full feature administration', NOW(), NOW()
FROM resources r
WHERE r.name = 'feature'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'feature' AND action = 'admin')
ON CONFLICT (resource_id, action) DO NOTHING;

-- Plan permissions
INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('plan-read' || random()::text) from 1 for 8)),
    r.id, 'plan', 'read', 'View plans', NOW(), NOW()
FROM resources r
WHERE r.name = 'plan'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'plan' AND action = 'read')
ON CONFLICT (resource_id, action) DO NOTHING;

INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('plan-create' || random()::text) from 1 for 8)),
    r.id, 'plan', 'create', 'Create plans', NOW(), NOW()
FROM resources r
WHERE r.name = 'plan'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'plan' AND action = 'create')
ON CONFLICT (resource_id, action) DO NOTHING;

INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('plan-update' || random()::text) from 1 for 8)),
    r.id, 'plan', 'update', 'Update plans', NOW(), NOW()
FROM resources r
WHERE r.name = 'plan'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'plan' AND action = 'update')
ON CONFLICT (resource_id, action) DO NOTHING;

INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('plan-delete' || random()::text) from 1 for 8)),
    r.id, 'plan', 'delete', 'Delete plans', NOW(), NOW()
FROM resources r
WHERE r.name = 'plan'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'plan' AND action = 'delete')
ON CONFLICT (resource_id, action) DO NOTHING;

INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('plan-admin' || random()::text) from 1 for 8)),
    r.id, 'plan', 'admin', 'Full plan administration', NOW(), NOW()
FROM resources r
WHERE r.name = 'plan'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'plan' AND action = 'admin')
ON CONFLICT (resource_id, action) DO NOTHING;

-- Subscription permissions
INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('subscription-read' || random()::text) from 1 for 8)),
    r.id, 'subscription', 'read', 'View subscriptions', NOW(), NOW()
FROM resources r
WHERE r.name = 'subscription'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'subscription' AND action = 'read')
ON CONFLICT (resource_id, action) DO NOTHING;

INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('subscription-create' || random()::text) from 1 for 8)),
    r.id, 'subscription', 'create', 'Create subscriptions', NOW(), NOW()
FROM resources r
WHERE r.name = 'subscription'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'subscription' AND action = 'create')
ON CONFLICT (resource_id, action) DO NOTHING;

INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('subscription-update' || random()::text) from 1 for 8)),
    r.id, 'subscription', 'update', 'Update subscriptions', NOW(), NOW()
FROM resources r
WHERE r.name = 'subscription'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'subscription' AND action = 'update')
ON CONFLICT (resource_id, action) DO NOTHING;

INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('subscription-delete' || random()::text) from 1 for 8)),
    r.id, 'subscription', 'delete', 'Delete subscriptions', NOW(), NOW()
FROM resources r
WHERE r.name = 'subscription'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'subscription' AND action = 'delete')
ON CONFLICT (resource_id, action) DO NOTHING;

INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('subscription-admin' || random()::text) from 1 for 8)),
    r.id, 'subscription', 'admin', 'Full subscription administration', NOW(), NOW()
FROM resources r
WHERE r.name = 'subscription'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'subscription' AND action = 'admin')
ON CONFLICT (resource_id, action) DO NOTHING;

-- ============================================================================
-- FEATURE-PERMISSION ASSIGNMENTS
-- ============================================================================
-- Link permissions to features (grouping permissions under features)

-- Organization Management Feature
INSERT INTO feature_permissions (feature_id, permission_id)
SELECT f.id, p.id
FROM features f
CROSS JOIN permissions p
WHERE f.name = 'organization-management'
  AND p.resource = 'organization'
ON CONFLICT DO NOTHING;

-- User Management Feature
INSERT INTO feature_permissions (feature_id, permission_id)
SELECT f.id, p.id
FROM features f
CROSS JOIN permissions p
WHERE f.name = 'user-management'
  AND p.resource = 'user'
ON CONFLICT DO NOTHING;

-- Role Management Feature
INSERT INTO feature_permissions (feature_id, permission_id)
SELECT f.id, p.id
FROM features f
CROSS JOIN permissions p
WHERE f.name = 'role-management'
  AND p.resource = 'role'
ON CONFLICT DO NOTHING;

-- Permission Management Feature
INSERT INTO feature_permissions (feature_id, permission_id)
SELECT f.id, p.id
FROM features f
CROSS JOIN permissions p
WHERE f.name = 'permission-management'
  AND p.resource = 'permission'
ON CONFLICT DO NOTHING;

-- Resource Management Feature
INSERT INTO feature_permissions (feature_id, permission_id)
SELECT f.id, p.id
FROM features f
CROSS JOIN permissions p
WHERE f.name = 'resource-management'
  AND p.resource = 'resource'
ON CONFLICT DO NOTHING;

-- Feature Management Feature
INSERT INTO feature_permissions (feature_id, permission_id)
SELECT f.id, p.id
FROM features f
CROSS JOIN permissions p
WHERE f.name = 'feature-management'
  AND p.resource = 'feature'
ON CONFLICT DO NOTHING;

-- Plan Management Feature
INSERT INTO feature_permissions (feature_id, permission_id)
SELECT f.id, p.id
FROM features f
CROSS JOIN permissions p
WHERE f.name = 'plan-management'
  AND p.resource = 'plan'
ON CONFLICT DO NOTHING;

-- Subscription Management Feature
INSERT INTO feature_permissions (feature_id, permission_id)
SELECT f.id, p.id
FROM features f
CROSS JOIN permissions p
WHERE f.name = 'subscription-management'
  AND p.resource = 'subscription'
ON CONFLICT DO NOTHING;

-- Property Management Feature
INSERT INTO feature_permissions (feature_id, permission_id)
SELECT f.id, p.id
FROM features f
CROSS JOIN permissions p
WHERE f.name = 'property-management'
  AND p.resource = 'property'
ON CONFLICT DO NOTHING;

-- Client Management Feature
INSERT INTO feature_permissions (feature_id, permission_id)
SELECT f.id, p.id
FROM features f
CROSS JOIN permissions p
WHERE f.name = 'client-management'
  AND p.resource = 'client'
ON CONFLICT DO NOTHING;

-- Analytics Feature
INSERT INTO feature_permissions (feature_id, permission_id)
SELECT f.id, p.id
FROM features f
CROSS JOIN permissions p
WHERE f.name = 'analytics'
  AND p.resource = 'analytics'
ON CONFLICT DO NOTHING;

-- Settings Feature
INSERT INTO feature_permissions (feature_id, permission_id)
SELECT f.id, p.id
FROM features f
CROSS JOIN permissions p
WHERE f.name = 'settings'
  AND p.resource = 'settings'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- ROLES: Collections of Permissions
-- ============================================================================
-- Roles can be global (organization_id = NULL) or organization-specific

-- Super Admin Role (Global - has all permissions)
INSERT INTO roles (id, internal_code, name, description, organization_id, is_active, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'ROL-' || upper(substring(md5('Super Admin' || random()::text) from 1 for 8)),
    'Super Admin',
    'System-wide administrator with all permissions',
    NULL,
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'Super Admin' AND organization_id IS NULL)
ON CONFLICT (organization_id, name) DO NOTHING;

-- Admin Role (Global - has admin permissions for core resources)
INSERT INTO roles (id, internal_code, name, description, organization_id, is_active, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'ROL-' || upper(substring(md5('Admin' || random()::text) from 1 for 8)),
    'Admin',
    'Administrator with management permissions',
    NULL,
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'Admin' AND organization_id IS NULL)
ON CONFLICT (organization_id, name) DO NOTHING;

-- Manager Role (Global - has read/write permissions for core resources)
INSERT INTO roles (id, internal_code, name, description, organization_id, is_active, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'ROL-' || upper(substring(md5('Manager' || random()::text) from 1 for 8)),
    'Manager',
    'Manager with read and write permissions',
    NULL,
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'Manager' AND organization_id IS NULL)
ON CONFLICT (organization_id, name) DO NOTHING;

-- User Role (Global - has read permissions only)
INSERT INTO roles (id, internal_code, name, description, organization_id, is_active, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'ROL-' || upper(substring(md5('User' || random()::text) from 1 for 8)),
    'User',
    'Standard user with read-only permissions',
    NULL,
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'User' AND organization_id IS NULL)
ON CONFLICT (organization_id, name) DO NOTHING;

-- ============================================================================
-- ROLE-PERMISSION ASSIGNMENTS
-- ============================================================================
-- Assign permissions to roles

-- Super Admin: All permissions
INSERT INTO role_permissions (role_id, permission_id, granted_at)
SELECT r.id, p.id, NOW()
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'Super Admin' AND r.organization_id IS NULL
ON CONFLICT DO NOTHING;

-- Admin: Admin permissions for core resources (organization, user, role, permission, resource, feature)
INSERT INTO role_permissions (role_id, permission_id, granted_at)
SELECT r.id, p.id, NOW()
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'Admin' AND r.organization_id IS NULL
  AND p.resource IN ('organization', 'user', 'role', 'permission', 'resource', 'feature')
  AND p.action = 'admin'
ON CONFLICT DO NOTHING;

-- Manager: Read, create, update permissions for core resources
INSERT INTO role_permissions (role_id, permission_id, granted_at)
SELECT r.id, p.id, NOW()
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'Manager' AND r.organization_id IS NULL
  AND p.resource IN ('organization', 'user', 'role', 'permission', 'resource', 'feature')
  AND p.action IN ('read', 'create', 'update')
ON CONFLICT DO NOTHING;

-- User: Read permissions for core resources
INSERT INTO role_permissions (role_id, permission_id, granted_at)
SELECT r.id, p.id, NOW()
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'User' AND r.organization_id IS NULL
  AND p.resource IN ('organization', 'user', 'role', 'permission', 'resource', 'feature')
  AND p.action = 'read'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- END OF SEED DATA
-- ============================================================================

