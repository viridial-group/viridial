-- Organization Service Seed Data
-- SQL INSERT statements for default resources, features, permissions, and roles
-- 
-- IMPORTANT NOTES:
-- 1. Internal codes are generated automatically in the application (BeforeInsert hook)
--    These seed scripts use a simple hash approach for SQL compatibility
-- 2. UUIDs are generated dynamically using uuid_generate_v4()
-- 3. This script deletes existing seed data, then inserts in order: Resources -> Features -> Permissions -> Roles -> Assignments
-- 4. Use INSERT ... ON CONFLICT DO NOTHING to avoid duplicates
--
-- Usage: Run this after schema.sql to populate initial data

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
DELETE FROM roles;

-- Note: Users and organizations are not deleted here as they may contain production data
-- If you need to reset users/organizations, use organizations-seed.sql separately

-- ============================================================================
-- RESOURCES
-- ============================================================================
-- Note: Internal codes use format RES-XXXXXXXX (8 uppercase hex characters)

-- Core Resources
INSERT INTO resources (id, internal_code, name, description, category, is_active, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'RES-' || upper(substring(md5('organization' || random()::text) from 1 for 8)),
    'organization', 'Organization management resource', 'core', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM resources WHERE name = 'organization');

INSERT INTO resources (id, internal_code, name, description, category, is_active, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'RES-' || upper(substring(md5('user' || random()::text) from 1 for 8)),
    'user', 'User management resource', 'core', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM resources WHERE name = 'user');

INSERT INTO resources (id, internal_code, name, description, category, is_active, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'RES-' || upper(substring(md5('role' || random()::text) from 1 for 8)),
    'role', 'Role management resource', 'admin', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM resources WHERE name = 'role');

INSERT INTO resources (id, internal_code, name, description, category, is_active, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'RES-' || upper(substring(md5('permission' || random()::text) from 1 for 8)),
    'permission', 'Permission management resource', 'admin', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM resources WHERE name = 'permission');

INSERT INTO resources (id, internal_code, name, description, category, is_active, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'RES-' || upper(substring(md5('resource' || random()::text) from 1 for 8)),
    'resource', 'Resource management resource', 'admin', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM resources WHERE name = 'resource');

INSERT INTO resources (id, internal_code, name, description, category, is_active, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'RES-' || upper(substring(md5('feature' || random()::text) from 1 for 8)),
    'feature', 'Feature management resource', 'admin', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM resources WHERE name = 'feature');

-- Business Resources
INSERT INTO resources (id, internal_code, name, description, category, is_active, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'RES-' || upper(substring(md5('property' || random()::text) from 1 for 8)),
    'property', 'Property management resource', 'business', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM resources WHERE name = 'property');

INSERT INTO resources (id, internal_code, name, description, category, is_active, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'RES-' || upper(substring(md5('client' || random()::text) from 1 for 8)),
    'client', 'Client management resource', 'business', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM resources WHERE name = 'client');

-- System Resources
INSERT INTO resources (id, internal_code, name, description, category, is_active, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'RES-' || upper(substring(md5('analytics' || random()::text) from 1 for 8)),
    'analytics', 'Analytics and reporting resource', 'system', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM resources WHERE name = 'analytics');

INSERT INTO resources (id, internal_code, name, description, category, is_active, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'RES-' || upper(substring(md5('settings' || random()::text) from 1 for 8)),
    'settings', 'System settings resource', 'system', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM resources WHERE name = 'settings');

-- ============================================================================
-- FEATURES
-- ============================================================================
-- Note: Internal codes use format FEA-XXXXXXXX (8 uppercase hex characters)

-- Core Features
INSERT INTO features (id, internal_code, name, description, category, is_active, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'FEA-' || upper(substring(md5('organization-management' || random()::text) from 1 for 8)),
    'organization-management', 'Organization management feature', 'core', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM features WHERE name = 'organization-management');

INSERT INTO features (id, internal_code, name, description, category, is_active, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'FEA-' || upper(substring(md5('user-management' || random()::text) from 1 for 8)),
    'user-management', 'User management feature', 'core', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM features WHERE name = 'user-management');

INSERT INTO features (id, internal_code, name, description, category, is_active, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'FEA-' || upper(substring(md5('role-management' || random()::text) from 1 for 8)),
    'role-management', 'Role management feature', 'admin', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM features WHERE name = 'role-management');

INSERT INTO features (id, internal_code, name, description, category, is_active, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'FEA-' || upper(substring(md5('permission-management' || random()::text) from 1 for 8)),
    'permission-management', 'Permission management feature', 'admin', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM features WHERE name = 'permission-management');

INSERT INTO features (id, internal_code, name, description, category, is_active, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'FEA-' || upper(substring(md5('resource-management' || random()::text) from 1 for 8)),
    'resource-management', 'Resource management feature', 'admin', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM features WHERE name = 'resource-management');

INSERT INTO features (id, internal_code, name, description, category, is_active, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'FEA-' || upper(substring(md5('feature-management' || random()::text) from 1 for 8)),
    'feature-management', 'Feature management feature', 'admin', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM features WHERE name = 'feature-management');

-- Business Features
INSERT INTO features (id, internal_code, name, description, category, is_active, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'FEA-' || upper(substring(md5('property-management' || random()::text) from 1 for 8)),
    'property-management', 'Property management feature', 'business', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM features WHERE name = 'property-management');

INSERT INTO features (id, internal_code, name, description, category, is_active, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'FEA-' || upper(substring(md5('client-management' || random()::text) from 1 for 8)),
    'client-management', 'Client management feature', 'business', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM features WHERE name = 'client-management');

-- System Features
INSERT INTO features (id, internal_code, name, description, category, is_active, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'FEA-' || upper(substring(md5('analytics' || random()::text) from 1 for 8)),
    'analytics', 'Analytics and reporting feature', 'system', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM features WHERE name = 'analytics');

INSERT INTO features (id, internal_code, name, description, category, is_active, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'FEA-' || upper(substring(md5('settings' || random()::text) from 1 for 8)),
    'settings', 'System settings feature', 'system', true, NOW(), NOW()
WHERE NOT EXISTS (SELECT 1 FROM features WHERE name = 'settings');

-- ============================================================================
-- PERMISSIONS
-- ============================================================================
-- Note: Internal codes use format PER-XXXXXXXX (8 uppercase hex characters)
-- Permissions now reference resources via resource_id

-- Organization permissions
INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('org-read' || random()::text) from 1 for 8)),
    r.id, 'organization', 'read', 'View organization details', NOW(), NOW()
FROM resources r
WHERE r.name = 'organization'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'organization' AND action = 'read');

INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('org-write' || random()::text) from 1 for 8)),
    r.id, 'organization', 'write', 'Create and update organizations', NOW(), NOW()
FROM resources r
WHERE r.name = 'organization'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'organization' AND action = 'write');

INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('org-delete' || random()::text) from 1 for 8)),
    r.id, 'organization', 'delete', 'Delete organizations', NOW(), NOW()
FROM resources r
WHERE r.name = 'organization'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'organization' AND action = 'delete');

INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('org-admin' || random()::text) from 1 for 8)),
    r.id, 'organization', 'admin', 'Full organization administration', NOW(), NOW()
FROM resources r
WHERE r.name = 'organization'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'organization' AND action = 'admin');

-- User permissions
INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('user-read' || random()::text) from 1 for 8)),
    r.id, 'user', 'read', 'View user details', NOW(), NOW()
FROM resources r
WHERE r.name = 'user'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'user' AND action = 'read');

INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('user-write' || random()::text) from 1 for 8)),
    r.id, 'user', 'write', 'Create and update users', NOW(), NOW()
FROM resources r
WHERE r.name = 'user'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'user' AND action = 'write');

INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('user-delete' || random()::text) from 1 for 8)),
    r.id, 'user', 'delete', 'Delete users', NOW(), NOW()
FROM resources r
WHERE r.name = 'user'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'user' AND action = 'delete');

INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('user-admin' || random()::text) from 1 for 8)),
    r.id, 'user', 'admin', 'Full user administration', NOW(), NOW()
FROM resources r
WHERE r.name = 'user'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'user' AND action = 'admin');

-- Role permissions
INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('role-read' || random()::text) from 1 for 8)),
    r.id, 'role', 'read', 'View roles', NOW(), NOW()
FROM resources r
WHERE r.name = 'role'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'role' AND action = 'read');

INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('role-write' || random()::text) from 1 for 8)),
    r.id, 'role', 'write', 'Create and update roles', NOW(), NOW()
FROM resources r
WHERE r.name = 'role'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'role' AND action = 'write');

INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('role-delete' || random()::text) from 1 for 8)),
    r.id, 'role', 'delete', 'Delete roles', NOW(), NOW()
FROM resources r
WHERE r.name = 'role'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'role' AND action = 'delete');

INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('role-admin' || random()::text) from 1 for 8)),
    r.id, 'role', 'admin', 'Full role administration', NOW(), NOW()
FROM resources r
WHERE r.name = 'role'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'role' AND action = 'admin');

-- Permission permissions
INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('perm-read' || random()::text) from 1 for 8)),
    r.id, 'permission', 'read', 'View permissions', NOW(), NOW()
FROM resources r
WHERE r.name = 'permission'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'permission' AND action = 'read');

INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('perm-write' || random()::text) from 1 for 8)),
    r.id, 'permission', 'write', 'Create and update permissions', NOW(), NOW()
FROM resources r
WHERE r.name = 'permission'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'permission' AND action = 'write');

INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('perm-delete' || random()::text) from 1 for 8)),
    r.id, 'permission', 'delete', 'Delete permissions', NOW(), NOW()
FROM resources r
WHERE r.name = 'permission'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'permission' AND action = 'delete');

INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('perm-admin' || random()::text) from 1 for 8)),
    r.id, 'permission', 'admin', 'Full permission administration', NOW(), NOW()
FROM resources r
WHERE r.name = 'permission'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'permission' AND action = 'admin');

-- Property permissions
INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('prop-read' || random()::text) from 1 for 8)),
    r.id, 'property', 'read', 'View properties', NOW(), NOW()
FROM resources r
WHERE r.name = 'property'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'property' AND action = 'read');

INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('prop-write' || random()::text) from 1 for 8)),
    r.id, 'property', 'write', 'Create and update properties', NOW(), NOW()
FROM resources r
WHERE r.name = 'property'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'property' AND action = 'write');

INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('prop-delete' || random()::text) from 1 for 8)),
    r.id, 'property', 'delete', 'Delete properties', NOW(), NOW()
FROM resources r
WHERE r.name = 'property'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'property' AND action = 'delete');

INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('prop-admin' || random()::text) from 1 for 8)),
    r.id, 'property', 'admin', 'Full property administration', NOW(), NOW()
FROM resources r
WHERE r.name = 'property'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'property' AND action = 'admin');

-- Client permissions
INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('client-read' || random()::text) from 1 for 8)),
    r.id, 'client', 'read', 'View clients', NOW(), NOW()
FROM resources r
WHERE r.name = 'client'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'client' AND action = 'read');

INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('client-write' || random()::text) from 1 for 8)),
    r.id, 'client', 'write', 'Create and update clients', NOW(), NOW()
FROM resources r
WHERE r.name = 'client'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'client' AND action = 'write');

INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('client-delete' || random()::text) from 1 for 8)),
    r.id, 'client', 'delete', 'Delete clients', NOW(), NOW()
FROM resources r
WHERE r.name = 'client'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'client' AND action = 'delete');

INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('client-admin' || random()::text) from 1 for 8)),
    r.id, 'client', 'admin', 'Full client administration', NOW(), NOW()
FROM resources r
WHERE r.name = 'client'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'client' AND action = 'admin');

-- Analytics permissions
INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('analytics-read' || random()::text) from 1 for 8)),
    r.id, 'analytics', 'read', 'View analytics and reports', NOW(), NOW()
FROM resources r
WHERE r.name = 'analytics'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'analytics' AND action = 'read');

INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('analytics-admin' || random()::text) from 1 for 8)),
    r.id, 'analytics', 'admin', 'Full analytics access', NOW(), NOW()
FROM resources r
WHERE r.name = 'analytics'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'analytics' AND action = 'admin');

-- Settings permissions
INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('settings-read' || random()::text) from 1 for 8)),
    r.id, 'settings', 'read', 'View settings', NOW(), NOW()
FROM resources r
WHERE r.name = 'settings'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'settings' AND action = 'read');

INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('settings-write' || random()::text) from 1 for 8)),
    r.id, 'settings', 'write', 'Update settings', NOW(), NOW()
FROM resources r
WHERE r.name = 'settings'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'settings' AND action = 'write');

INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('settings-admin' || random()::text) from 1 for 8)),
    r.id, 'settings', 'admin', 'Full settings administration', NOW(), NOW()
FROM resources r
WHERE r.name = 'settings'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'settings' AND action = 'admin');

-- Resource management permissions
INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('resource-read' || random()::text) from 1 for 8)),
    r.id, 'resource', 'read', 'View resources', NOW(), NOW()
FROM resources r
WHERE r.name = 'resource'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'resource' AND action = 'read');

INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('resource-write' || random()::text) from 1 for 8)),
    r.id, 'resource', 'write', 'Create and update resources', NOW(), NOW()
FROM resources r
WHERE r.name = 'resource'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'resource' AND action = 'write');

INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('resource-delete' || random()::text) from 1 for 8)),
    r.id, 'resource', 'delete', 'Delete resources', NOW(), NOW()
FROM resources r
WHERE r.name = 'resource'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'resource' AND action = 'delete');

INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('resource-admin' || random()::text) from 1 for 8)),
    r.id, 'resource', 'admin', 'Full resource administration', NOW(), NOW()
FROM resources r
WHERE r.name = 'resource'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'resource' AND action = 'admin');

-- Feature management permissions
INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('feature-read' || random()::text) from 1 for 8)),
    r.id, 'feature', 'read', 'View features', NOW(), NOW()
FROM resources r
WHERE r.name = 'feature'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'feature' AND action = 'read');

INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('feature-write' || random()::text) from 1 for 8)),
    r.id, 'feature', 'write', 'Create and update features', NOW(), NOW()
FROM resources r
WHERE r.name = 'feature'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'feature' AND action = 'write');

INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('feature-delete' || random()::text) from 1 for 8)),
    r.id, 'feature', 'delete', 'Delete features', NOW(), NOW()
FROM resources r
WHERE r.name = 'feature'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'feature' AND action = 'delete');

INSERT INTO permissions (id, internal_code, resource_id, resource, action, description, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'PER-' || upper(substring(md5('feature-admin' || random()::text) from 1 for 8)),
    r.id, 'feature', 'admin', 'Full feature administration', NOW(), NOW()
FROM resources r
WHERE r.name = 'feature'
  AND NOT EXISTS (SELECT 1 FROM permissions WHERE resource = 'feature' AND action = 'admin');

-- ============================================================================
-- FEATURE PERMISSIONS ASSIGNMENTS
-- ============================================================================
-- Link permissions to features

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
-- ROLES
-- ============================================================================
-- Note: Internal codes use format ROL-XXXXXXXX (8 uppercase hex characters)

-- Super Admin Role
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
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'Super Admin' AND organization_id IS NULL);

-- Organization Admin Role
INSERT INTO roles (id, internal_code, name, description, organization_id, is_active, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'ROL-' || upper(substring(md5('Organization Admin' || random()::text) from 1 for 8)),
    'Organization Admin',
    'Administrator for an organization with full management rights',
    NULL,
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'Organization Admin' AND organization_id IS NULL);

-- Manager Role
INSERT INTO roles (id, internal_code, name, description, organization_id, is_active, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'ROL-' || upper(substring(md5('Manager' || random()::text) from 1 for 8)),
    'Manager',
    'Manager with read/write access to properties and clients',
    NULL,
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'Manager' AND organization_id IS NULL);

-- Agent Role
INSERT INTO roles (id, internal_code, name, description, organization_id, is_active, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'ROL-' || upper(substring(md5('Agent' || random()::text) from 1 for 8)),
    'Agent',
    'Real estate agent with property and client access',
    NULL,
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'Agent' AND organization_id IS NULL);

-- Viewer Role
INSERT INTO roles (id, internal_code, name, description, organization_id, is_active, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    'ROL-' || upper(substring(md5('Viewer' || random()::text) from 1 for 8)),
    'Viewer',
    'Read-only access to properties and clients',
    NULL,
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM roles WHERE name = 'Viewer' AND organization_id IS NULL);

-- ============================================================================
-- ROLE PERMISSIONS ASSIGNMENTS
-- ============================================================================
-- Note: These INSERT statements use subqueries to find permission and role IDs

-- Super Admin gets all permissions
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'Super Admin' AND r.organization_id IS NULL
ON CONFLICT DO NOTHING;

-- Organization Admin permissions (organization:*, user:*, role:*, property:*, client:*, analytics:read, settings:read)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'Organization Admin' AND r.organization_id IS NULL
  AND (
    (p.resource = 'organization' AND p.action IN ('read', 'write', 'delete', 'admin'))
    OR (p.resource = 'user' AND p.action IN ('read', 'write', 'delete', 'admin'))
    OR (p.resource = 'role' AND p.action IN ('read', 'write', 'delete', 'admin'))
    OR (p.resource = 'property' AND p.action IN ('read', 'write', 'delete', 'admin'))
    OR (p.resource = 'client' AND p.action IN ('read', 'write', 'delete', 'admin'))
    OR (p.resource = 'analytics' AND p.action = 'read')
    OR (p.resource = 'settings' AND p.action = 'read')
  )
ON CONFLICT DO NOTHING;

-- Manager permissions (property:read, property:write, client:read, client:write, analytics:read)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'Manager' AND r.organization_id IS NULL
  AND (
    (p.resource = 'property' AND p.action IN ('read', 'write'))
    OR (p.resource = 'client' AND p.action IN ('read', 'write'))
    OR (p.resource = 'analytics' AND p.action = 'read')
  )
ON CONFLICT DO NOTHING;

-- Agent permissions (property:read, property:write, client:read, client:write)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'Agent' AND r.organization_id IS NULL
  AND (
    (p.resource = 'property' AND p.action IN ('read', 'write'))
    OR (p.resource = 'client' AND p.action IN ('read', 'write'))
  )
ON CONFLICT DO NOTHING;

-- Viewer permissions (property:read, client:read, analytics:read)
INSERT INTO role_permissions (role_id, permission_id)
SELECT r.id, p.id
FROM roles r
CROSS JOIN permissions p
WHERE r.name = 'Viewer' AND r.organization_id IS NULL
  AND (
    (p.resource = 'property' AND p.action = 'read')
    OR (p.resource = 'client' AND p.action = 'read')
    OR (p.resource = 'analytics' AND p.action = 'read')
  )
ON CONFLICT DO NOTHING;
