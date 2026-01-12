-- ============================================================================
-- RBAC Schema: Roles, Permissions, Resources, and Features
-- Adapted for Resource and Feature Management
-- ============================================================================
-- This schema implements a comprehensive RBAC system where:
-- - Resources represent system entities (user, organization, role, etc.)
-- - Features represent business capabilities (user-management, organization-management, etc.)
-- - Permissions link Resources with Actions (read, write, delete, admin)
-- - Roles are assigned to Users and have Permissions
-- - Features group related Permissions together
-- ============================================================================

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- DROP EXISTING TABLES (for re-initialization)
-- ============================================================================
DROP TABLE IF EXISTS subscription_booster_packs CASCADE;
DROP TABLE IF EXISTS user_plans CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;
DROP TABLE IF EXISTS booster_packs CASCADE;
DROP TABLE IF EXISTS plan_limits CASCADE;
DROP TABLE IF EXISTS plan_features CASCADE;
DROP TABLE IF EXISTS plans CASCADE;
DROP TABLE IF EXISTS email_verification_tokens CASCADE;
DROP TABLE IF EXISTS password_reset_tokens CASCADE;
DROP TABLE IF EXISTS feature_permissions CASCADE;
DROP TABLE IF EXISTS role_permissions CASCADE;
DROP TABLE IF EXISTS user_roles CASCADE;
DROP TABLE IF EXISTS organization_emails CASCADE;
DROP TABLE IF EXISTS organization_phones CASCADE;
DROP TABLE IF EXISTS organization_addresses CASCADE;
DROP TABLE IF EXISTS users CASCADE;
DROP TABLE IF EXISTS roles CASCADE;
DROP TABLE IF EXISTS permissions CASCADE;
DROP TABLE IF EXISTS features CASCADE;
DROP TABLE IF EXISTS resources CASCADE;
DROP TABLE IF EXISTS organizations CASCADE;

-- ============================================================================
-- CORE ENTITIES
-- ============================================================================

-- Organizations
CREATE TABLE organizations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    internal_code VARCHAR(50) NOT NULL UNIQUE,
    external_code VARCHAR(255) NULL,
    name VARCHAR(400) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    description TEXT NULL,
    logo VARCHAR(500) NULL,
    plan VARCHAR(20) NOT NULL DEFAULT 'free' CHECK (plan IN ('free', 'basic', 'professional', 'enterprise')),
    max_users INTEGER NOT NULL DEFAULT 10,
    is_active BOOLEAN NOT NULL DEFAULT true,
    country VARCHAR(100) NULL,
    city VARCHAR(100) NULL,
    parent_id UUID NULL,
    legal_name VARCHAR(400) NULL,
    registration_number VARCHAR(100) NULL,
    vat_number VARCHAR(100) NULL,
    legal_form VARCHAR(20) NULL CHECK (legal_form IN ('SARL', 'SA', 'SAS', 'SNC', 'EURL', 'SELARL', 'SCI', 'Other')),
    rcs_number VARCHAR(100) NULL,
    siren VARCHAR(20) NULL,
    siret VARCHAR(20) NULL,
    founding_date DATE NULL,
    currency VARCHAR(10) NULL DEFAULT 'EUR',
    commission_rate DECIMAL(5,2) NULL,
    payment_terms VARCHAR(200) NULL,
    billing_email VARCHAR(255) NULL,
    website VARCHAR(500) NULL,
    industry VARCHAR(200) NULL,
    specialties TEXT[] NULL,
    year_established INTEGER NULL,
    languages VARCHAR[] NULL,
    social_networks JSONB NULL,
    manager_name VARCHAR(200) NULL,
    manager_email VARCHAR(255) NULL,
    manager_phone VARCHAR(50) NULL,
    notes TEXT NULL,
    tags VARCHAR[] NULL,
    contract_start_date DATE NULL,
    contract_end_date DATE NULL,
    contract_renewal_date DATE NULL,
    subscription_status VARCHAR(20) NULL CHECK (subscription_status IN ('active', 'trial', 'suspended', 'cancelled', 'expired')),
    compliance_status VARCHAR(20) NULL CHECK (compliance_status IN ('compliant', 'pending', 'non_compliant', 'under_review')),
    last_compliance_check TIMESTAMPTZ NULL,
    license_number VARCHAR(100) NULL,
    license_authority VARCHAR(200) NULL,
    license_expiry_date DATE NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by UUID NULL,
    updated_by UUID NULL,
    CONSTRAINT fk_organization_parent FOREIGN KEY (parent_id) REFERENCES organizations(id) ON DELETE SET NULL
);

-- ============================================================================
-- RBAC CORE TABLES: Resources, Features, Permissions, Roles
-- ============================================================================

-- Resources: System entities that can be acted upon
-- Examples: 'user', 'organization', 'role', 'permission', 'resource', 'feature', 'plan', 'subscription'
CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    internal_code VARCHAR(50) NOT NULL UNIQUE,
    external_code VARCHAR(255) NULL,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255) NULL,
    category VARCHAR(100) NULL CHECK (category IN ('core', 'admin', 'billing', 'content', 'system', 'other')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_resource_name UNIQUE (name)
);

-- Features: Business capabilities that group related permissions
-- Examples: 'user-management', 'organization-management', 'role-management', 'billing-management'
CREATE TABLE features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    internal_code VARCHAR(50) NOT NULL UNIQUE,
    external_code VARCHAR(255) NULL,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255) NULL,
    category VARCHAR(100) NULL CHECK (category IN ('core', 'premium', 'addon', 'administration', 'other')),
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_feature_name UNIQUE (name)
);

-- Permissions: Actions on Resources
-- Links a Resource with an Action (e.g., 'user:read', 'organization:write', 'role:admin')
-- Also linked to Features for grouping
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    internal_code VARCHAR(50) NOT NULL UNIQUE,
    external_code VARCHAR(255) NULL,
    resource_id UUID NOT NULL,
    resource VARCHAR(100) NOT NULL, -- Denormalized for backward compatibility and performance
    action VARCHAR(50) NOT NULL CHECK (action IN ('read', 'write', 'delete', 'admin', 'create', 'update', 'view', 'manage')),
    description VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_permission_resource FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE RESTRICT,
    CONSTRAINT uk_permission_resource_action UNIQUE (resource_id, action)
);

-- Roles: Collections of Permissions assigned to Users
-- Can be global (organization_id = NULL) or organization-specific
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    internal_code VARCHAR(50) NOT NULL UNIQUE,
    external_code VARCHAR(255) NULL,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255) NULL,
    organization_id UUID NULL, -- NULL = global/system role
    is_active BOOLEAN NOT NULL DEFAULT true,
    parent_id UUID NULL, -- Hierarchical roles support
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_role_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT fk_role_parent FOREIGN KEY (parent_id) REFERENCES roles(id) ON DELETE SET NULL,
    CONSTRAINT uk_role_organization_name UNIQUE (organization_id, name)
);

-- Users
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    internal_code VARCHAR(50) NOT NULL UNIQUE,
    external_code VARCHAR(255) NULL,
    email VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(100) NULL,
    last_name VARCHAR(100) NULL,
    phone VARCHAR(20) NULL,
    preferred_language VARCHAR(10) NULL DEFAULT 'en',
    role VARCHAR(50) NOT NULL DEFAULT 'user', -- Legacy field, kept for backward compatibility
    organization_id UUID NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    email_verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL
);

-- ============================================================================
-- JUNCTION TABLES: Many-to-Many Relationships
-- ============================================================================

-- User Roles: Assigns Roles to Users
CREATE TABLE user_roles (
    user_id UUID NOT NULL,
    role_id UUID NOT NULL,
    assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    assigned_by UUID NULL, -- User who assigned this role
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_role_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_role_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_role_assigned_by FOREIGN KEY (assigned_by) REFERENCES users(id) ON DELETE SET NULL,
    CONSTRAINT uk_user_role UNIQUE (user_id, role_id)
);

-- Role Permissions: Assigns Permissions to Roles
CREATE TABLE role_permissions (
    role_id UUID NOT NULL,
    permission_id UUID NOT NULL,
    granted_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    granted_by UUID NULL, -- User who granted this permission
    PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_role_permission_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT fk_role_permission_permission FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE,
    CONSTRAINT fk_role_permission_granted_by FOREIGN KEY (granted_by) REFERENCES users(id) ON DELETE SET NULL
);

-- Feature Permissions: Groups Permissions under Features
-- This allows features to be enabled/disabled as a unit
CREATE TABLE feature_permissions (
    feature_id UUID NOT NULL,
    permission_id UUID NOT NULL,
    PRIMARY KEY (feature_id, permission_id),
    CONSTRAINT fk_feature_permission_feature FOREIGN KEY (feature_id) REFERENCES features(id) ON DELETE CASCADE,
    CONSTRAINT fk_feature_permission_permission FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- ============================================================================
-- ORGANIZATION DETAILS
-- ============================================================================

-- Organization Addresses
CREATE TABLE organization_addresses (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    internal_code VARCHAR(50) NOT NULL UNIQUE,
    external_code VARCHAR(255) NULL,
    organization_id UUID NOT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'headquarters' CHECK (type IN ('headquarters', 'branch', 'warehouse', 'other')),
    street VARCHAR(500) NOT NULL,
    city VARCHAR(100) NOT NULL,
    postal_code VARCHAR(20) NOT NULL,
    country VARCHAR(100) NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_organization_address_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Organization Phones
CREATE TABLE organization_phones (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    internal_code VARCHAR(50) NOT NULL UNIQUE,
    external_code VARCHAR(255) NULL,
    organization_id UUID NOT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'main' CHECK (type IN ('main', 'sales', 'support', 'billing', 'other')),
    number VARCHAR(50) NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_organization_phone_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- Organization Emails
CREATE TABLE organization_emails (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    internal_code VARCHAR(50) NOT NULL UNIQUE,
    external_code VARCHAR(255) NULL,
    organization_id UUID NOT NULL,
    type VARCHAR(20) NOT NULL DEFAULT 'main' CHECK (type IN ('main', 'sales', 'support', 'billing', 'other')),
    address VARCHAR(255) NOT NULL,
    is_primary BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_organization_email_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE
);

-- ============================================================================
-- AUTHENTICATION & VERIFICATION
-- ============================================================================

-- Password Reset Tokens
CREATE TABLE password_reset_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_password_reset_token_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Email Verification Tokens
CREATE TABLE email_verification_tokens (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    token VARCHAR(255) NOT NULL UNIQUE,
    expires_at TIMESTAMP NOT NULL,
    used BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_email_verification_token_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- ============================================================================
-- PLANS AND SUBSCRIPTIONS
-- ============================================================================

-- Plans
CREATE TABLE plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    internal_code VARCHAR(50) NOT NULL UNIQUE,
    external_code VARCHAR(255) NULL,
    plan_type VARCHAR(20) NOT NULL CHECK (plan_type IN ('pilot', 'growth', 'professional', 'enterprise', 'ai')),
    name VARCHAR(100) NOT NULL,
    description TEXT NULL,
    billing_period VARCHAR(20) NOT NULL DEFAULT 'monthly' CHECK (billing_period IN ('monthly', 'annual')),
    standard_price DECIMAL(10,2) NOT NULL,
    single_app_price DECIMAL(10,2) NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT true,
    is_popular BOOLEAN NOT NULL DEFAULT false,
    is_featured BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Plan Features (Features included in a Plan)
CREATE TABLE plan_features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    internal_code VARCHAR(50) NOT NULL UNIQUE,
    plan_id UUID NOT NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT NULL,
    category VARCHAR(50) NULL CHECK (category IN ('ai', 'sales', 'marketing', 'support', 'inventory', 'project', 'analytics', 'collaboration', 'productivity', 'integration', 'administration', 'other')),
    is_included BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_plan_feature_plan FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE
);

-- Plan Limits
CREATE TABLE plan_limits (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    internal_code VARCHAR(50) NOT NULL UNIQUE,
    plan_id UUID NOT NULL,
    limit_type VARCHAR(50) NOT NULL CHECK (limit_type IN ('users', 'records', 'storage', 'emails', 'api_calls', 'integrations', 'custom')),
    limit_name VARCHAR(100) NOT NULL,
    limit_value INTEGER NULL,
    limit_unit VARCHAR(50) NULL,
    is_unlimited BOOLEAN NOT NULL DEFAULT false,
    description TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_plan_limit_plan FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE CASCADE
);

-- Subscriptions
CREATE TABLE subscriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    internal_code VARCHAR(50) NOT NULL UNIQUE,
    organization_id UUID NOT NULL,
    plan_id UUID NOT NULL,
    status VARCHAR(20) NOT NULL DEFAULT 'trial' CHECK (status IN ('trial', 'active', 'suspended', 'cancelled', 'expired')),
    standard_users_count INTEGER NOT NULL DEFAULT 0,
    single_app_users_count INTEGER NOT NULL DEFAULT 0,
    billing_period VARCHAR(20) NOT NULL DEFAULT 'monthly' CHECK (billing_period IN ('monthly', 'annual')),
    monthly_amount DECIMAL(10,2) NOT NULL,
    currency VARCHAR(10) NOT NULL DEFAULT 'USD',
    trial_start_date TIMESTAMPTZ NULL,
    trial_end_date TIMESTAMPTZ NULL,
    trial_days INTEGER NULL,
    current_period_start TIMESTAMPTZ NULL,
    current_period_end TIMESTAMPTZ NULL,
    cancel_at_period_end BOOLEAN NOT NULL DEFAULT false,
    cancelled_at TIMESTAMPTZ NULL,
    last_payment_date TIMESTAMPTZ NULL,
    next_payment_date TIMESTAMPTZ NULL,
    payment_method VARCHAR(100) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_subscription_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE CASCADE,
    CONSTRAINT fk_subscription_plan FOREIGN KEY (plan_id) REFERENCES plans(id) ON DELETE RESTRICT
);

-- User Plans (junction table for user subscription assignments)
CREATE TABLE user_plans (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL,
    subscription_id UUID NOT NULL,
    user_type VARCHAR(20) NOT NULL DEFAULT 'standard' CHECK (user_type IN ('standard', 'single_app')),
    single_app_type VARCHAR(20) NULL CHECK (single_app_type IN ('sales', 'marketing', 'support', 'projects', 'inventory')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_plan_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_plan_subscription FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE,
    CONSTRAINT uq_user_plan_user_subscription UNIQUE (user_id, subscription_id)
);

-- Booster Packs
CREATE TABLE booster_packs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    internal_code VARCHAR(50) NOT NULL UNIQUE,
    external_code VARCHAR(255) NULL,
    name VARCHAR(200) NOT NULL,
    description TEXT NULL,
    booster_pack_type VARCHAR(50) NOT NULL CHECK (booster_pack_type IN ('users', 'storage', 'emails', 'api_calls', 'records', 'custom')),
    limit_type VARCHAR(100) NOT NULL,
    limit_increase INTEGER NOT NULL,
    limit_unit VARCHAR(50) NULL,
    monthly_price DECIMAL(10,2) NOT NULL,
    annual_price DECIMAL(10,2) NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    display_order INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Subscription Booster Packs (many-to-many junction table)
CREATE TABLE subscription_booster_packs (
    booster_pack_id UUID NOT NULL,
    subscription_id UUID NOT NULL,
    PRIMARY KEY (booster_pack_id, subscription_id),
    CONSTRAINT fk_subscription_booster_pack_booster_pack FOREIGN KEY (booster_pack_id) REFERENCES booster_packs(id) ON DELETE CASCADE,
    CONSTRAINT fk_subscription_booster_pack_subscription FOREIGN KEY (subscription_id) REFERENCES subscriptions(id) ON DELETE CASCADE
);

-- ============================================================================
-- INDEXES FOR PERFORMANCE
-- ============================================================================

-- Organizations indexes
CREATE INDEX idx_organizations_name ON organizations(name);
CREATE INDEX idx_organizations_slug ON organizations(slug);
CREATE INDEX idx_organizations_country_city ON organizations(country, city);
CREATE INDEX idx_organizations_plan ON organizations(plan);
CREATE INDEX idx_organizations_is_active ON organizations(is_active);
CREATE INDEX idx_organizations_parent_id ON organizations(parent_id);
CREATE INDEX idx_organizations_subscription_status ON organizations(subscription_status);

-- Resources indexes
CREATE INDEX idx_resources_name ON resources(name);
CREATE INDEX idx_resources_category ON resources(category);
CREATE INDEX idx_resources_is_active ON resources(is_active);
CREATE INDEX idx_resources_external_code ON resources(external_code) WHERE external_code IS NOT NULL;

-- Features indexes
CREATE INDEX idx_features_name ON features(name);
CREATE INDEX idx_features_category ON features(category);
CREATE INDEX idx_features_is_active ON features(is_active);
CREATE INDEX idx_features_external_code ON features(external_code) WHERE external_code IS NOT NULL;

-- Permissions indexes
CREATE INDEX idx_permissions_resource_id ON permissions(resource_id);
CREATE INDEX idx_permissions_resource ON permissions(resource);
CREATE INDEX idx_permissions_action ON permissions(action);
CREATE INDEX idx_permissions_resource_action ON permissions(resource, action);
CREATE INDEX idx_permissions_external_code ON permissions(external_code) WHERE external_code IS NOT NULL;

-- Roles indexes
CREATE INDEX idx_roles_organization_id ON roles(organization_id);
CREATE INDEX idx_roles_parent_id ON roles(parent_id);
CREATE INDEX idx_roles_is_active ON roles(is_active);
CREATE INDEX idx_roles_name ON roles(name);
CREATE INDEX idx_roles_external_code ON roles(external_code) WHERE external_code IS NOT NULL;

-- Users indexes
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_organization_id ON users(organization_id);
CREATE INDEX idx_users_is_active ON users(is_active);
CREATE INDEX idx_users_external_code ON users(external_code) WHERE external_code IS NOT NULL;

-- User Roles indexes
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);
CREATE INDEX idx_user_roles_assigned_at ON user_roles(assigned_at);

-- Role Permissions indexes
CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission_id ON role_permissions(permission_id);
CREATE INDEX idx_role_permissions_granted_at ON role_permissions(granted_at);

-- Feature Permissions indexes
CREATE INDEX idx_feature_permissions_feature_id ON feature_permissions(feature_id);
CREATE INDEX idx_feature_permissions_permission_id ON feature_permissions(permission_id);

-- Plans indexes
CREATE INDEX idx_plans_plan_type ON plans(plan_type);
CREATE INDEX idx_plans_is_active ON plans(is_active);
CREATE INDEX idx_plans_is_featured ON plans(is_featured);

-- Subscriptions indexes
CREATE INDEX idx_subscriptions_organization_id ON subscriptions(organization_id);
CREATE INDEX idx_subscriptions_plan_id ON subscriptions(plan_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_current_period_end ON subscriptions(current_period_end);

-- ============================================================================
-- COMMENTS FOR DOCUMENTATION
-- ============================================================================

COMMENT ON TABLE resources IS 'System entities that can be acted upon (user, organization, role, etc.)';
COMMENT ON TABLE features IS 'Business capabilities that group related permissions (user-management, organization-management, etc.)';
COMMENT ON TABLE permissions IS 'Actions on Resources (read, write, delete, admin). Links Resources with Actions and can be grouped under Features';
COMMENT ON TABLE roles IS 'Collections of Permissions assigned to Users. Can be global (organization_id=NULL) or organization-specific';
COMMENT ON TABLE user_roles IS 'Assigns Roles to Users. A user can have multiple roles';
COMMENT ON TABLE role_permissions IS 'Assigns Permissions to Roles. A role can have multiple permissions';
COMMENT ON TABLE feature_permissions IS 'Groups Permissions under Features. Allows features to be enabled/disabled as a unit';

COMMENT ON COLUMN permissions.resource_id IS 'Foreign key to resources table. NOT NULL to ensure all permissions are linked to a resource';
COMMENT ON COLUMN permissions.resource IS 'Denormalized resource name for backward compatibility and query performance';
COMMENT ON COLUMN roles.organization_id IS 'NULL for global/system roles, UUID for organization-specific roles';
COMMENT ON COLUMN roles.parent_id IS 'Supports hierarchical roles where child roles inherit permissions from parent';

-- ============================================================================
-- END OF SCHEMA
-- ============================================================================

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

-- Organization Service Seed Data
-- SQL INSERT statements for sample organizations with addresses, phones, and emails
-- 
-- IMPORTANT NOTES:
-- 1. Internal codes are generated automatically in the application (BeforeInsert hook)
--    These seed scripts use a simple hash approach for SQL compatibility
-- 2. UUIDs for organizations and related entities are generated dynamically
-- 3. This script inserts organizations first, then their addresses, phones, and emails
-- 4. Use INSERT ... ON CONFLICT DO NOTHING to avoid duplicates
-- 5. Organizations can have hierarchical relationships (parent_id)
--
-- Usage: Run this after schema.sql and seeds.sql (for roles/permissions) to populate sample organizations

-- ============================================================================
-- ORGANIZATIONS
-- ============================================================================
-- Note: Internal codes use format ORG-XXXXXXXX (8 uppercase hex characters)
-- In production, use the application's code generator for consistency

-- Sample Organization 1: Real Estate Agency (Main Organization)
INSERT INTO organizations (
    id,
    internal_code,
    external_code,
    name,
    slug,
    description,
    logo,
    plan,
    max_users,
    is_active,
    country,
    city,
    parent_id,
    legal_name,
    registration_number,
    vat_number,
    legal_form,
    rcs_number,
    siren,
    siret,
    founding_date,
    currency,
    commission_rate,
    payment_terms,
    billing_email,
    website,
    industry,
    specialties,
    year_established,
    languages,
    social_networks,
    manager_name,
    manager_email,
    manager_phone,
    notes,
    tags,
    contract_start_date,
    contract_end_date,
    contract_renewal_date,
    subscription_status,
    compliance_status,
    last_compliance_check,
    license_number,
    license_authority,
    license_expiry_date,
    created_at,
    updated_at
)
SELECT 
    uuid_generate_v4(),
    'ORG-' || upper(substring(md5('Viridial Real Estate' || random()::text) from 1 for 8)),
    NULL,
    'Viridial Real Estate',
    'viridial-real-estate',
    'Premier real estate agency specializing in luxury properties and commercial real estate',
    NULL,
    'professional',
    50,
    true,
    'France',
    'Paris',
    NULL, -- No parent (top-level organization)
    'Viridial Real Estate SARL',
    'RCS-PARIS-123456789',
    'FR12345678901',
    'SARL',
    'RCS PARIS B 123 456 789',
    '123456789',
    '12345678901234',
    '2015-03-15',
    'EUR',
    3.50,
    'Net 30',
    'billing@viridial-real-estate.fr',
    'https://www.viridial-real-estate.fr',
    'Real Estate',
    ARRAY['Luxury Properties', 'Commercial Real Estate', 'Property Management'],
    2015,
    ARRAY['fr', 'en'],
    '{"facebook": "https://facebook.com/viridial", "linkedin": "https://linkedin.com/company/viridial", "instagram": "https://instagram.com/viridial"}'::jsonb,
    'Jean Dupont',
    'jean.dupont@viridial-real-estate.fr',
    '+33 1 23 45 67 89',
    'Primary real estate agency with excellent reputation',
    ARRAY['premium', 'luxury', 'commercial'],
    '2020-01-01',
    '2025-12-31',
    '2025-11-01',
    'active',
    'compliant',
    NOW(),
    'LIC-RE-2024-001',
    'Conseil Régional de l''Ordre des Experts Immobiliers',
    '2025-12-31',
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE slug = 'viridial-real-estate');

-- Sample Organization 2: Property Management Company (Sub-organization)
INSERT INTO organizations (
    id,
    internal_code,
    external_code,
    name,
    slug,
    description,
    plan,
    max_users,
    is_active,
    country,
    city,
    parent_id,
    legal_name,
    website,
    industry,
    specialties,
    year_established,
    subscription_status,
    compliance_status,
    created_at,
    updated_at
)
SELECT 
    uuid_generate_v4(),
    'ORG-' || upper(substring(md5('Property Management Pro' || random()::text) from 1 for 8)),
    'EXT-PM-001',
    'Property Management Pro',
    'property-management-pro',
    'Full-service property management company',
    'basic',
    20,
    true,
    'France',
    'Lyon',
    (SELECT id FROM organizations WHERE slug = 'viridial-real-estate' LIMIT 1), -- Parent organization
    'Property Management Pro SAS',
    'https://www.property-management-pro.fr',
    'Property Management',
    ARRAY['Residential Management', 'Maintenance', 'Tenant Relations'],
    2018,
    'active',
    'compliant',
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE slug = 'property-management-pro')
  AND EXISTS (SELECT 1 FROM organizations WHERE slug = 'viridial-real-estate');

-- Sample Organization 3: Real Estate Development
INSERT INTO organizations (
    id,
    internal_code,
    external_code,
    name,
    slug,
    description,
    plan,
    max_users,
    is_active,
    country,
    city,
    website,
    industry,
    specialties,
    year_established,
    subscription_status,
    compliance_status,
    created_at,
    updated_at
)
SELECT 
    uuid_generate_v4(),
    'ORG-' || upper(substring(md5('Luxury Developments' || random()::text) from 1 for 8)),
    NULL,
    'Luxury Developments',
    'luxury-developments',
    'High-end real estate development and construction',
    'enterprise',
    100,
    true,
    'France',
    'Cannes',
    'https://www.luxury-developments.fr',
    'Real Estate Development',
    ARRAY['Luxury Construction', 'Property Development', 'Architecture'],
    2010,
    'active',
    'compliant',
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM organizations WHERE slug = 'luxury-developments');

-- ============================================================================
-- ORGANIZATION ADDRESSES
-- ============================================================================
-- Note: Internal codes use format ADR-XXXXXXXX (8 uppercase hex characters)

-- Addresses for Viridial Real Estate
INSERT INTO organization_addresses (
    id,
    internal_code,
    external_code,
    organization_id,
    type,
    street,
    city,
    postal_code,
    country,
    is_primary,
    created_at,
    updated_at
)
SELECT 
    uuid_generate_v4(),
    'ADR-' || upper(substring(md5('viridial-headquarters' || random()::text) from 1 for 8)),
    NULL,
    (SELECT id FROM organizations WHERE slug = 'viridial-real-estate' LIMIT 1),
    'headquarters',
    '123 Avenue des Champs-Élysées',
    'Paris',
    '75008',
    'France',
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM organization_addresses 
    WHERE organization_id = (SELECT id FROM organizations WHERE slug = 'viridial-real-estate' LIMIT 1)
    AND type = 'headquarters'
    AND is_primary = true
)
AND EXISTS (SELECT 1 FROM organizations WHERE slug = 'viridial-real-estate');

-- Branch address for Viridial Real Estate
INSERT INTO organization_addresses (
    id,
    internal_code,
    external_code,
    organization_id,
    type,
    street,
    city,
    postal_code,
    country,
    is_primary,
    created_at,
    updated_at
)
SELECT 
    uuid_generate_v4(),
    'ADR-' || upper(substring(md5('viridial-branch' || random()::text) from 1 for 8)),
    NULL,
    (SELECT id FROM organizations WHERE slug = 'viridial-real-estate' LIMIT 1),
    'branch',
    '45 Rue de la République',
    'Lyon',
    '69002',
    'France',
    false,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM organization_addresses 
    WHERE organization_id = (SELECT id FROM organizations WHERE slug = 'viridial-real-estate' LIMIT 1)
    AND type = 'branch'
    AND street = '45 Rue de la République'
)
AND EXISTS (SELECT 1 FROM organizations WHERE slug = 'viridial-real-estate');

-- Address for Property Management Pro
INSERT INTO organization_addresses (
    id,
    internal_code,
    external_code,
    organization_id,
    type,
    street,
    city,
    postal_code,
    country,
    is_primary,
    created_at,
    updated_at
)
SELECT 
    uuid_generate_v4(),
    'ADR-' || upper(substring(md5('pmp-headquarters' || random()::text) from 1 for 8)),
    NULL,
    (SELECT id FROM organizations WHERE slug = 'property-management-pro' LIMIT 1),
    'headquarters',
    '78 Boulevard de la Croix-Rousse',
    'Lyon',
    '69004',
    'France',
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM organization_addresses 
    WHERE organization_id = (SELECT id FROM organizations WHERE slug = 'property-management-pro' LIMIT 1)
    AND type = 'headquarters'
)
AND EXISTS (SELECT 1 FROM organizations WHERE slug = 'property-management-pro');

-- Address for Luxury Developments
INSERT INTO organization_addresses (
    id,
    internal_code,
    external_code,
    organization_id,
    type,
    street,
    city,
    postal_code,
    country,
    is_primary,
    created_at,
    updated_at
)
SELECT 
    uuid_generate_v4(),
    'ADR-' || upper(substring(md5('ld-headquarters' || random()::text) from 1 for 8)),
    NULL,
    (SELECT id FROM organizations WHERE slug = 'luxury-developments' LIMIT 1),
    'headquarters',
    '12 Boulevard de la Croisette',
    'Cannes',
    '06400',
    'France',
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM organization_addresses 
    WHERE organization_id = (SELECT id FROM organizations WHERE slug = 'luxury-developments' LIMIT 1)
    AND type = 'headquarters'
)
AND EXISTS (SELECT 1 FROM organizations WHERE slug = 'luxury-developments');

-- ============================================================================
-- ORGANIZATION PHONES
-- ============================================================================
-- Note: Internal codes use format PHN-XXXXXXXX (8 uppercase hex characters)

-- Phones for Viridial Real Estate
INSERT INTO organization_phones (
    id,
    internal_code,
    external_code,
    organization_id,
    type,
    number,
    is_primary,
    created_at,
    updated_at
)
SELECT 
    uuid_generate_v4(),
    'PHN-' || upper(substring(md5('viridial-main-phone' || random()::text) from 1 for 8)),
    NULL,
    (SELECT id FROM organizations WHERE slug = 'viridial-real-estate' LIMIT 1),
    'main',
    '+33 1 23 45 67 89',
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM organization_phones 
    WHERE organization_id = (SELECT id FROM organizations WHERE slug = 'viridial-real-estate' LIMIT 1)
    AND type = 'main'
    AND is_primary = true
)
AND EXISTS (SELECT 1 FROM organizations WHERE slug = 'viridial-real-estate');

-- Sales phone for Viridial Real Estate
INSERT INTO organization_phones (
    id,
    internal_code,
    external_code,
    organization_id,
    type,
    number,
    is_primary,
    created_at,
    updated_at
)
SELECT 
    uuid_generate_v4(),
    'PHN-' || upper(substring(md5('viridial-sales-phone' || random()::text) from 1 for 8)),
    NULL,
    (SELECT id FROM organizations WHERE slug = 'viridial-real-estate' LIMIT 1),
    'sales',
    '+33 1 23 45 67 90',
    false,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM organization_phones 
    WHERE organization_id = (SELECT id FROM organizations WHERE slug = 'viridial-real-estate' LIMIT 1)
    AND type = 'sales'
    AND number = '+33 1 23 45 67 90'
)
AND EXISTS (SELECT 1 FROM organizations WHERE slug = 'viridial-real-estate');

-- Support phone for Viridial Real Estate
INSERT INTO organization_phones (
    id,
    internal_code,
    external_code,
    organization_id,
    type,
    number,
    is_primary,
    created_at,
    updated_at
)
SELECT 
    uuid_generate_v4(),
    'PHN-' || upper(substring(md5('viridial-support-phone' || random()::text) from 1 for 8)),
    NULL,
    (SELECT id FROM organizations WHERE slug = 'viridial-real-estate' LIMIT 1),
    'support',
    '+33 1 23 45 67 91',
    false,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM organization_phones 
    WHERE organization_id = (SELECT id FROM organizations WHERE slug = 'viridial-real-estate' LIMIT 1)
    AND type = 'support'
    AND number = '+33 1 23 45 67 91'
)
AND EXISTS (SELECT 1 FROM organizations WHERE slug = 'viridial-real-estate');

-- Phone for Property Management Pro
INSERT INTO organization_phones (
    id,
    internal_code,
    external_code,
    organization_id,
    type,
    number,
    is_primary,
    created_at,
    updated_at
)
SELECT 
    uuid_generate_v4(),
    'PHN-' || upper(substring(md5('pmp-main-phone' || random()::text) from 1 for 8)),
    NULL,
    (SELECT id FROM organizations WHERE slug = 'property-management-pro' LIMIT 1),
    'main',
    '+33 4 78 12 34 56',
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM organization_phones 
    WHERE organization_id = (SELECT id FROM organizations WHERE slug = 'property-management-pro' LIMIT 1)
    AND type = 'main'
    AND is_primary = true
)
AND EXISTS (SELECT 1 FROM organizations WHERE slug = 'property-management-pro');

-- Phone for Luxury Developments
INSERT INTO organization_phones (
    id,
    internal_code,
    external_code,
    organization_id,
    type,
    number,
    is_primary,
    created_at,
    updated_at
)
SELECT 
    uuid_generate_v4(),
    'PHN-' || upper(substring(md5('ld-main-phone' || random()::text) from 1 for 8)),
    NULL,
    (SELECT id FROM organizations WHERE slug = 'luxury-developments' LIMIT 1),
    'main',
    '+33 4 93 45 67 89',
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM organization_phones 
    WHERE organization_id = (SELECT id FROM organizations WHERE slug = 'luxury-developments' LIMIT 1)
    AND type = 'main'
    AND is_primary = true
)
AND EXISTS (SELECT 1 FROM organizations WHERE slug = 'luxury-developments');

-- ============================================================================
-- ORGANIZATION EMAILS
-- ============================================================================
-- Note: Internal codes use format EML-XXXXXXXX (8 uppercase hex characters)

-- Emails for Viridial Real Estate
INSERT INTO organization_emails (
    id,
    internal_code,
    external_code,
    organization_id,
    type,
    address,
    is_primary,
    created_at,
    updated_at
)
SELECT 
    uuid_generate_v4(),
    'EML-' || upper(substring(md5('viridial-main-email' || random()::text) from 1 for 8)),
    NULL,
    (SELECT id FROM organizations WHERE slug = 'viridial-real-estate' LIMIT 1),
    'main',
    'contact@viridial-real-estate.fr',
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM organization_emails 
    WHERE organization_id = (SELECT id FROM organizations WHERE slug = 'viridial-real-estate' LIMIT 1)
    AND type = 'main'
    AND is_primary = true
)
AND EXISTS (SELECT 1 FROM organizations WHERE slug = 'viridial-real-estate');

-- Sales email for Viridial Real Estate
INSERT INTO organization_emails (
    id,
    internal_code,
    external_code,
    organization_id,
    type,
    address,
    is_primary,
    created_at,
    updated_at
)
SELECT 
    uuid_generate_v4(),
    'EML-' || upper(substring(md5('viridial-sales-email' || random()::text) from 1 for 8)),
    NULL,
    (SELECT id FROM organizations WHERE slug = 'viridial-real-estate' LIMIT 1),
    'sales',
    'sales@viridial-real-estate.fr',
    false,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM organization_emails 
    WHERE organization_id = (SELECT id FROM organizations WHERE slug = 'viridial-real-estate' LIMIT 1)
    AND type = 'sales'
    AND address = 'sales@viridial-real-estate.fr'
)
AND EXISTS (SELECT 1 FROM organizations WHERE slug = 'viridial-real-estate');

-- Support email for Viridial Real Estate
INSERT INTO organization_emails (
    id,
    internal_code,
    external_code,
    organization_id,
    type,
    address,
    is_primary,
    created_at,
    updated_at
)
SELECT 
    uuid_generate_v4(),
    'EML-' || upper(substring(md5('viridial-support-email' || random()::text) from 1 for 8)),
    NULL,
    (SELECT id FROM organizations WHERE slug = 'viridial-real-estate' LIMIT 1),
    'support',
    'support@viridial-real-estate.fr',
    false,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM organization_emails 
    WHERE organization_id = (SELECT id FROM organizations WHERE slug = 'viridial-real-estate' LIMIT 1)
    AND type = 'support'
    AND address = 'support@viridial-real-estate.fr'
)
AND EXISTS (SELECT 1 FROM organizations WHERE slug = 'viridial-real-estate');

-- Billing email for Viridial Real Estate
INSERT INTO organization_emails (
    id,
    internal_code,
    external_code,
    organization_id,
    type,
    address,
    is_primary,
    created_at,
    updated_at
)
SELECT 
    uuid_generate_v4(),
    'EML-' || upper(substring(md5('viridial-billing-email' || random()::text) from 1 for 8)),
    NULL,
    (SELECT id FROM organizations WHERE slug = 'viridial-real-estate' LIMIT 1),
    'billing',
    'billing@viridial-real-estate.fr',
    false,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM organization_emails 
    WHERE organization_id = (SELECT id FROM organizations WHERE slug = 'viridial-real-estate' LIMIT 1)
    AND type = 'billing'
    AND address = 'billing@viridial-real-estate.fr'
)
AND EXISTS (SELECT 1 FROM organizations WHERE slug = 'viridial-real-estate');

-- Email for Property Management Pro
INSERT INTO organization_emails (
    id,
    internal_code,
    external_code,
    organization_id,
    type,
    address,
    is_primary,
    created_at,
    updated_at
)
SELECT 
    uuid_generate_v4(),
    'EML-' || upper(substring(md5('pmp-main-email' || random()::text) from 1 for 8)),
    NULL,
    (SELECT id FROM organizations WHERE slug = 'property-management-pro' LIMIT 1),
    'main',
    'contact@property-management-pro.fr',
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM organization_emails 
    WHERE organization_id = (SELECT id FROM organizations WHERE slug = 'property-management-pro' LIMIT 1)
    AND type = 'main'
    AND is_primary = true
)
AND EXISTS (SELECT 1 FROM organizations WHERE slug = 'property-management-pro');

-- Email for Luxury Developments
INSERT INTO organization_emails (
    id,
    internal_code,
    external_code,
    organization_id,
    type,
    address,
    is_primary,
    created_at,
    updated_at
)
SELECT 
    uuid_generate_v4(),
    'EML-' || upper(substring(md5('ld-main-email' || random()::text) from 1 for 8)),
    NULL,
    (SELECT id FROM organizations WHERE slug = 'luxury-developments' LIMIT 1),
    'main',
    'contact@luxury-developments.fr',
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (
    SELECT 1 FROM organization_emails 
    WHERE organization_id = (SELECT id FROM organizations WHERE slug = 'luxury-developments' LIMIT 1)
    AND type = 'main'
    AND is_primary = true
)
AND EXISTS (SELECT 1 FROM organizations WHERE slug = 'luxury-developments');

-- ============================================================================
-- ORGANIZATION USERS
-- ============================================================================
-- Note: Internal codes use format USR-XXXXXXXX (8 uppercase hex characters)
-- Password for all users: Password123!
-- Bcrypt hash (10 rounds): $2b$10$VnvROO833uTJloL0jeoJTu9DarJAO2gknFZr2ivEgsgUeTcLLmimC

-- Users for Viridial Real Estate
-- Admin user
INSERT INTO users (
    id,
    internal_code,
    external_code,
    email,
    password_hash,
    first_name,
    last_name,
    phone,
    preferred_language,
    role,
    organization_id,
    is_active,
    email_verified,
    created_at,
    updated_at
)
SELECT 
    uuid_generate_v4(),
    'USR-' || upper(substring(md5('admin@viridial-real-estate.fr' || random()::text) from 1 for 8)),
    NULL,
    'admin@viridial-real-estate.fr',
    '$2b$10$VnvROO833uTJloL0jeoJTu9DarJAO2gknFZr2ivEgsgUeTcLLmimC',
    'Jean',
    'Dupont',
    '+33 1 23 45 67 89',
    'fr',
    'org_admin',
    (SELECT id FROM organizations WHERE slug = 'viridial-real-estate' LIMIT 1),
    true,
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@viridial-real-estate.fr')
AND EXISTS (SELECT 1 FROM organizations WHERE slug = 'viridial-real-estate');

-- Agent user for Viridial Real Estate
INSERT INTO users (
    id,
    internal_code,
    external_code,
    email,
    password_hash,
    first_name,
    last_name,
    phone,
    preferred_language,
    role,
    organization_id,
    is_active,
    email_verified,
    created_at,
    updated_at
)
SELECT 
    uuid_generate_v4(),
    'USR-' || upper(substring(md5('marie.martin@viridial-real-estate.fr' || random()::text) from 1 for 8)),
    NULL,
    'marie.martin@viridial-real-estate.fr',
    '$2b$10$VnvROO833uTJloL0jeoJTu9DarJAO2gknFZr2ivEgsgUeTcLLmimC',
    'Marie',
    'Martin',
    '+33 1 23 45 67 90',
    'fr',
    'agent',
    (SELECT id FROM organizations WHERE slug = 'viridial-real-estate' LIMIT 1),
    true,
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'marie.martin@viridial-real-estate.fr')
AND EXISTS (SELECT 1 FROM organizations WHERE slug = 'viridial-real-estate');

-- User for Property Management Pro
INSERT INTO users (
    id,
    internal_code,
    external_code,
    email,
    password_hash,
    first_name,
    last_name,
    phone,
    preferred_language,
    role,
    organization_id,
    is_active,
    email_verified,
    created_at,
    updated_at
)
SELECT 
    uuid_generate_v4(),
    'USR-' || upper(substring(md5('admin@property-management-pro.fr' || random()::text) from 1 for 8)),
    NULL,
    'admin@property-management-pro.fr',
    '$2b$10$VnvROO833uTJloL0jeoJTu9DarJAO2gknFZr2ivEgsgUeTcLLmimC',
    'Sophie',
    'Bernard',
    '+33 4 12 34 56 78',
    'fr',
    'org_admin',
    (SELECT id FROM organizations WHERE slug = 'property-management-pro' LIMIT 1),
    true,
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@property-management-pro.fr')
AND EXISTS (SELECT 1 FROM organizations WHERE slug = 'property-management-pro');

-- User for Luxury Developments
INSERT INTO users (
    id,
    internal_code,
    external_code,
    email,
    password_hash,
    first_name,
    last_name,
    phone,
    preferred_language,
    role,
    organization_id,
    is_active,
    email_verified,
    created_at,
    updated_at
)
SELECT 
    uuid_generate_v4(),
    'USR-' || upper(substring(md5('admin@luxury-developments.fr' || random()::text) from 1 for 8)),
    NULL,
    'admin@luxury-developments.fr',
    '$2b$10$VnvROO833uTJloL0jeoJTu9DarJAO2gknFZr2ivEgsgUeTcLLmimC',
    'Pierre',
    'Dubois',
    '+33 4 93 12 34 56',
    'en',
    'org_admin',
    (SELECT id FROM organizations WHERE slug = 'luxury-developments' LIMIT 1),
    true,
    true,
    NOW(),
    NOW()
WHERE NOT EXISTS (SELECT 1 FROM users WHERE email = 'admin@luxury-developments.fr')
AND EXISTS (SELECT 1 FROM organizations WHERE slug = 'luxury-developments');

-- ============================================================================
-- SUMMARY
-- ============================================================================
-- This seed file creates:
-- - 3 sample organizations (1 with parent relationship)
-- - 4 organization addresses (headquarters and branches)
-- - 7 organization phones (main, sales, support)
-- - 7 organization emails (main, sales, support, billing)
-- - 4 organization users (1-2 per organization)
--
-- Organizations created:
-- 1. Viridial Real Estate (parent, professional plan)
--    - 2 addresses (headquarters + branch)
--    - 3 phones (main, sales, support)
--    - 4 emails (main, sales, support, billing)
--    - 2 users (admin: admin@viridial-real-estate.fr, agent: marie.martin@viridial-real-estate.fr)
-- 2. Property Management Pro (child of Viridial Real Estate, basic plan)
--    - 1 address (headquarters)
--    - 1 phone (main)
--    - 1 email (main)
--    - 1 user (admin: admin@property-management-pro.fr)
-- 3. Luxury Developments (standalone, enterprise plan)
--    - 1 address (headquarters)
--    - 1 phone (main)
--    - 1 email (main)
--    - 1 user (admin: admin@luxury-developments.fr)
--
-- Default credentials for all users:
--   Password: Password123!
--   (Change passwords after first login!)

-- ============================================================================
-- PLANS SEED DATA
-- Based on Vtiger CRM pricing model
-- ============================================================================
-- This script seeds the plans, plan_features, plan_limits, and booster_packs tables
-- Run this after schema.sql

-- ============================================================================
-- DELETE EXISTING SEED DATA (to allow re-running the script)
-- ============================================================================
DELETE FROM subscription_booster_packs;
DELETE FROM user_plans;
DELETE FROM subscriptions;
DELETE FROM plan_limits;
DELETE FROM plan_features;
DELETE FROM plans;
DELETE FROM booster_packs;

-- ============================================================================
-- PLANS
-- ============================================================================

-- ONE PILOT (Free plan)
INSERT INTO plans (id, internal_code, plan_type, name, description, billing_period, standard_price, single_app_price, display_order, is_active, is_popular, is_featured)
SELECT 
    uuid_generate_v4(),
    'PLN-' || upper(substring(md5('pilot-monthly' || random()::text) from 1 for 8)),
    'pilot',
    'ONE PILOT',
    'Free plan - ideal for companies getting started on their CRM journey',
    'monthly',
    0.00,
    NULL,
    1,
    true,
    false,
    false
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE plan_type = 'pilot' AND billing_period = 'monthly');

-- ONE GROWTH (Monthly)
INSERT INTO plans (id, internal_code, plan_type, name, description, billing_period, standard_price, single_app_price, display_order, is_active, is_popular, is_featured)
SELECT 
    uuid_generate_v4(),
    'PLN-' || upper(substring(md5('growth-monthly' || random()::text) from 1 for 8)),
    'growth',
    'ONE GROWTH',
    'Powered by AI - A CRM for small and medium-sized businesses',
    'monthly',
    12.00,
    NULL,
    2,
    true,
    false,
    false
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE plan_type = 'growth' AND billing_period = 'monthly');

-- ONE GROWTH (Annual)
INSERT INTO plans (id, internal_code, plan_type, name, description, billing_period, standard_price, single_app_price, display_order, is_active, is_popular, is_featured)
SELECT 
    uuid_generate_v4(),
    'PLN-' || upper(substring(md5('growth-annual' || random()::text) from 1 for 8)),
    'growth',
    'ONE GROWTH',
    'Powered by AI - A CRM for small and medium-sized businesses',
    'annual',
    10.00,
    NULL,
    2,
    true,
    false,
    false
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE plan_type = 'growth' AND billing_period = 'annual');

-- ONE PROFESSIONAL (Monthly - Standard)
INSERT INTO plans (id, internal_code, plan_type, name, description, billing_period, standard_price, single_app_price, display_order, is_active, is_popular, is_featured)
SELECT 
    uuid_generate_v4(),
    'PLN-' || upper(substring(md5('professional-monthly-standard' || random()::text) from 1 for 8)),
    'professional',
    'ONE PROFESSIONAL',
    'Powered by AI - A complete CRM that gets all your teams on the same page with Customer One View',
    'monthly',
    30.00,
    20.00,
    3,
    true,
    true,
    true
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE plan_type = 'professional' AND billing_period = 'monthly');

-- ONE PROFESSIONAL (Annual - Standard)
INSERT INTO plans (id, internal_code, plan_type, name, description, billing_period, standard_price, single_app_price, display_order, is_active, is_popular, is_featured)
SELECT 
    uuid_generate_v4(),
    'PLN-' || upper(substring(md5('professional-annual-standard' || random()::text) from 1 for 8)),
    'professional',
    'ONE PROFESSIONAL',
    'Powered by AI - A complete CRM that gets all your teams on the same page with Customer One View',
    'annual',
    25.00,
    17.00,
    3,
    true,
    true,
    true
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE plan_type = 'professional' AND billing_period = 'annual');

-- ONE ENTERPRISE (Monthly - Standard)
INSERT INTO plans (id, internal_code, plan_type, name, description, billing_period, standard_price, single_app_price, display_order, is_active, is_popular, is_featured)
SELECT 
    uuid_generate_v4(),
    'PLN-' || upper(substring(md5('enterprise-monthly-standard' || random()::text) from 1 for 8)),
    'enterprise',
    'ONE ENTERPRISE',
    'Powered by AI - Fully loaded enterprise grade CRM that gives you best-in-class features for a fraction of the cost',
    'monthly',
    42.00,
    30.00,
    4,
    true,
    false,
    false
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE plan_type = 'enterprise' AND billing_period = 'monthly');

-- ONE ENTERPRISE (Annual - Standard)
INSERT INTO plans (id, internal_code, plan_type, name, description, billing_period, standard_price, single_app_price, display_order, is_active, is_popular, is_featured)
SELECT 
    uuid_generate_v4(),
    'PLN-' || upper(substring(md5('enterprise-annual-standard' || random()::text) from 1 for 8)),
    'enterprise',
    'ONE ENTERPRISE',
    'Powered by AI - Fully loaded enterprise grade CRM that gives you best-in-class features for a fraction of the cost',
    'annual',
    35.00,
    25.00,
    4,
    true,
    false,
    false
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE plan_type = 'enterprise' AND billing_period = 'annual');

-- ONE AI (Monthly - Standard)
INSERT INTO plans (id, internal_code, plan_type, name, description, billing_period, standard_price, single_app_price, display_order, is_active, is_popular, is_featured)
SELECT 
    uuid_generate_v4(),
    'PLN-' || upper(substring(md5('ai-monthly-standard' || random()::text) from 1 for 8)),
    'ai',
    'ONE AI',
    'Powered by AI - Enterprise-grade CRM with predictive and generative AI features for maximizing AI potential',
    'monthly',
    50.00,
    38.00,
    5,
    true,
    false,
    false
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE plan_type = 'ai' AND billing_period = 'monthly');

-- ONE AI (Annual - Standard)
INSERT INTO plans (id, internal_code, plan_type, name, description, billing_period, standard_price, single_app_price, display_order, is_active, is_popular, is_featured)
SELECT 
    uuid_generate_v4(),
    'PLN-' || upper(substring(md5('ai-annual-standard' || random()::text) from 1 for 8)),
    'ai',
    'ONE AI',
    'Powered by AI - Enterprise-grade CRM with predictive and generative AI features for maximizing AI potential',
    'annual',
    42.00,
    32.00,
    5,
    true,
    false,
    false
WHERE NOT EXISTS (SELECT 1 FROM plans WHERE plan_type = 'ai' AND billing_period = 'annual');

-- ============================================================================
-- PLAN LIMITS
-- ============================================================================

-- ONE PILOT Limits
INSERT INTO plan_limits (id, internal_code, plan_id, limit_type, limit_name, limit_value, limit_unit, is_unlimited, description)
SELECT 
    uuid_generate_v4(),
    'PLL-' || upper(substring(md5('pilot-users' || random()::text) from 1 for 8)),
    p.id,
    'users',
    'Max Users',
    10,
    'users',
    false,
    'Maximum number of users allowed'
FROM plans p
WHERE p.plan_type = 'pilot' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_limits WHERE plan_id = p.id AND limit_type = 'users');

INSERT INTO plan_limits (id, internal_code, plan_id, limit_type, limit_name, limit_value, limit_unit, is_unlimited, description)
SELECT 
    uuid_generate_v4(),
    'PLL-' || upper(substring(md5('pilot-records' || random()::text) from 1 for 8)),
    p.id,
    'records',
    'Max Records',
    3000,
    'records',
    false,
    'Maximum number of records allowed'
FROM plans p
WHERE p.plan_type = 'pilot' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_limits WHERE plan_id = p.id AND limit_type = 'records');

INSERT INTO plan_limits (id, internal_code, plan_id, limit_type, limit_name, limit_value, limit_unit, is_unlimited, description)
SELECT 
    uuid_generate_v4(),
    'PLL-' || upper(substring(md5('pilot-storage' || random()::text) from 1 for 8)),
    p.id,
    'storage',
    'Storage',
    3,
    'GB',
    false,
    'Storage space included'
FROM plans p
WHERE p.plan_type = 'pilot' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_limits WHERE plan_id = p.id AND limit_type = 'storage');

-- ONE GROWTH Limits
INSERT INTO plan_limits (id, internal_code, plan_id, limit_type, limit_name, limit_value, limit_unit, is_unlimited, description)
SELECT 
    uuid_generate_v4(),
    'PLL-' || upper(substring(md5('growth-users' || random()::text) from 1 for 8)),
    p.id,
    'users',
    'Max Users',
    15,
    'users',
    false,
    'Maximum number of users allowed'
FROM plans p
WHERE p.plan_type = 'growth' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_limits WHERE plan_id = p.id AND limit_type = 'users');

INSERT INTO plan_limits (id, internal_code, plan_id, limit_type, limit_name, limit_value, limit_unit, is_unlimited, description)
SELECT 
    uuid_generate_v4(),
    'PLL-' || upper(substring(md5('growth-records' || random()::text) from 1 for 8)),
    p.id,
    'records',
    'Max Records',
    100000,
    'records',
    false,
    'Maximum number of records allowed'
FROM plans p
WHERE p.plan_type = 'growth' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_limits WHERE plan_id = p.id AND limit_type = 'records');

INSERT INTO plan_limits (id, internal_code, plan_id, limit_type, limit_name, limit_value, limit_unit, is_unlimited, description)
SELECT 
    uuid_generate_v4(),
    'PLL-' || upper(substring(md5('growth-emails' || random()::text) from 1 for 8)),
    p.id,
    'emails',
    'Emails per Month',
    5000,
    'emails/month',
    false,
    'Email sending limit per month (or 500 per user)'
FROM plans p
WHERE p.plan_type = 'growth' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_limits WHERE plan_id = p.id AND limit_type = 'emails');

-- ONE PROFESSIONAL Limits
INSERT INTO plan_limits (id, internal_code, plan_id, limit_type, limit_name, limit_value, limit_unit, is_unlimited, description)
SELECT 
    uuid_generate_v4(),
    'PLL-' || upper(substring(md5('professional-users' || random()::text) from 1 for 8)),
    p.id,
    'users',
    'Max Users',
    NULL,
    'users',
    true,
    'Unlimited users'
FROM plans p
WHERE p.plan_type = 'professional' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_limits WHERE plan_id = p.id AND limit_type = 'users');

INSERT INTO plan_limits (id, internal_code, plan_id, limit_type, limit_name, limit_value, limit_unit, is_unlimited, description)
SELECT 
    uuid_generate_v4(),
    'PLL-' || upper(substring(md5('professional-records' || random()::text) from 1 for 8)),
    p.id,
    'records',
    'Max Records',
    NULL,
    'records',
    true,
    'Unlimited records'
FROM plans p
WHERE p.plan_type = 'professional' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_limits WHERE plan_id = p.id AND limit_type = 'records');

INSERT INTO plan_limits (id, internal_code, plan_id, limit_type, limit_name, limit_value, limit_unit, is_unlimited, description)
SELECT 
    uuid_generate_v4(),
    'PLL-' || upper(substring(md5('professional-emails' || random()::text) from 1 for 8)),
    p.id,
    'emails',
    'Emails per Month',
    20000,
    'emails/month',
    false,
    'Email sending limit per month (or 2000 per user)'
FROM plans p
WHERE p.plan_type = 'professional' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_limits WHERE plan_id = p.id AND limit_type = 'emails');

-- ONE ENTERPRISE Limits (same as Professional but with additional features)
INSERT INTO plan_limits (id, internal_code, plan_id, limit_type, limit_name, limit_value, limit_unit, is_unlimited, description)
SELECT 
    uuid_generate_v4(),
    'PLL-' || upper(substring(md5('enterprise-users' || random()::text) from 1 for 8)),
    p.id,
    'users',
    'Max Users',
    NULL,
    'users',
    true,
    'Unlimited users'
FROM plans p
WHERE p.plan_type = 'enterprise' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_limits WHERE plan_id = p.id AND limit_type = 'users');

INSERT INTO plan_limits (id, internal_code, plan_id, limit_type, limit_name, limit_value, limit_unit, is_unlimited, description)
SELECT 
    uuid_generate_v4(),
    'PLL-' || upper(substring(md5('enterprise-records' || random()::text) from 1 for 8)),
    p.id,
    'records',
    'Max Records',
    NULL,
    'records',
    true,
    'Unlimited records'
FROM plans p
WHERE p.plan_type = 'enterprise' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_limits WHERE plan_id = p.id AND limit_type = 'records');

-- ONE AI Limits (same as Enterprise)
INSERT INTO plan_limits (id, internal_code, plan_id, limit_type, limit_name, limit_value, limit_unit, is_unlimited, description)
SELECT 
    uuid_generate_v4(),
    'PLL-' || upper(substring(md5('ai-users' || random()::text) from 1 for 8)),
    p.id,
    'users',
    'Max Users',
    NULL,
    'users',
    true,
    'Unlimited users'
FROM plans p
WHERE p.plan_type = 'ai' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_limits WHERE plan_id = p.id AND limit_type = 'users');

INSERT INTO plan_limits (id, internal_code, plan_id, limit_type, limit_name, limit_value, limit_unit, is_unlimited, description)
SELECT 
    uuid_generate_v4(),
    'PLL-' || upper(substring(md5('ai-records' || random()::text) from 1 for 8)),
    p.id,
    'records',
    'Max Records',
    NULL,
    'records',
    true,
    'Unlimited records'
FROM plans p
WHERE p.plan_type = 'ai' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_limits WHERE plan_id = p.id AND limit_type = 'records');

-- ============================================================================
-- PLAN FEATURES
-- ============================================================================

-- ONE PILOT Features
INSERT INTO plan_features (id, internal_code, plan_id, name, description, category, is_included, display_order)
SELECT 
    uuid_generate_v4(),
    'PLF-' || upper(substring(md5('pilot-lead-contact' || random()::text) from 1 for 8)),
    p.id,
    'Lead & Contact Management',
    'Leads, Contacts and Organizations, One View, Idle Alerts, Duplicate Prevention, Profile Scoring',
    'sales',
    true,
    1
FROM plans p
WHERE p.plan_type = 'pilot' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_features WHERE plan_id = p.id AND name = 'Lead & Contact Management');

INSERT INTO plan_features (id, internal_code, plan_id, name, description, category, is_included, display_order)
SELECT 
    uuid_generate_v4(),
    'PLF-' || upper(substring(md5('pilot-contact-engagement' || random()::text) from 1 for 8)),
    p.id,
    'Contact Engagement',
    'Emails & Phone Integration, Document Engagement, Zoom & Google Meet',
    'collaboration',
    true,
    2
FROM plans p
WHERE p.plan_type = 'pilot' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_features WHERE plan_id = p.id AND name = 'Contact Engagement');

INSERT INTO plan_features (id, internal_code, plan_id, name, description, category, is_included, display_order)
SELECT 
    uuid_generate_v4(),
    'PLF-' || upper(substring(md5('pilot-marketing' || random()::text) from 1 for 8)),
    p.id,
    'Marketing Automation',
    'Lists and Segments, Email Campaigns (1000 Emails/month), Email Campaign Reports, Autoresponders, Web to Lead Forms, Email Template Builder, Landing Pages, Short URLs',
    'marketing',
    true,
    3
FROM plans p
WHERE p.plan_type = 'pilot' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_features WHERE plan_id = p.id AND name = 'Marketing Automation');

INSERT INTO plan_features (id, internal_code, plan_id, name, description, category, is_included, display_order)
SELECT 
    uuid_generate_v4(),
    'PLF-' || upper(substring(md5('pilot-sales-pipeline' || random()::text) from 1 for 8)),
    p.id,
    'Sales Pipeline',
    'Deals and Contact Roles, Customize Sales Stages, Deal Kanban View, Idle Deal Alerts, Time Spent in every Stage',
    'sales',
    true,
    4
FROM plans p
WHERE p.plan_type = 'pilot' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_features WHERE plan_id = p.id AND name = 'Sales Pipeline');

INSERT INTO plan_features (id, internal_code, plan_id, name, description, category, is_included, display_order)
SELECT 
    uuid_generate_v4(),
    'PLF-' || upper(substring(md5('pilot-help-desk' || random()::text) from 1 for 8)),
    p.id,
    'Help Desk',
    'Email to Case, First Response SLA, Resolution SLA, Business Hours',
    'support',
    true,
    5
FROM plans p
WHERE p.plan_type = 'pilot' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_features WHERE plan_id = p.id AND name = 'Help Desk');

INSERT INTO plan_features (id, internal_code, plan_id, name, description, category, is_included, display_order)
SELECT 
    uuid_generate_v4(),
    'PLF-' || upper(substring(md5('pilot-mobile-app' || random()::text) from 1 for 8)),
    p.id,
    'Mobile App',
    'Real-time Notifications, Actions Page, Business Card Scanner, Leads/Contacts/Deals/Quotes/Cases, Voice Notes',
    'productivity',
    true,
    6
FROM plans p
WHERE p.plan_type = 'pilot' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_features WHERE plan_id = p.id AND name = 'Mobile App');

-- ONE GROWTH Features (Everything in Pilot plus...)
INSERT INTO plan_features (id, internal_code, plan_id, name, description, category, is_included, display_order)
SELECT 
    uuid_generate_v4(),
    'PLF-' || upper(substring(md5('growth-ai' || random()::text) from 1 for 8)),
    p.id,
    'AI Features',
    'Predictive AI, Generative AI, Natural Language Querying, AI Prompt Builder, AI Query Analytics, AI Chatbot, AI Bot Management',
    'ai',
    true,
    1
FROM plans p
WHERE p.plan_type = 'growth' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_features WHERE plan_id = p.id AND name = 'AI Features');

INSERT INTO plan_features (id, internal_code, plan_id, name, description, category, is_included, display_order)
SELECT 
    uuid_generate_v4(),
    'PLF-' || upper(substring(md5('growth-lead-management' || random()::text) from 1 for 8)),
    p.id,
    'Lead Management',
    'Lead Auto-assignment & Routing',
    'sales',
    true,
    2
FROM plans p
WHERE p.plan_type = 'growth' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_features WHERE plan_id = p.id AND name = 'Lead Management');

INSERT INTO plan_features (id, internal_code, plan_id, name, description, category, is_included, display_order)
SELECT 
    uuid_generate_v4(),
    'PLF-' || upper(substring(md5('growth-action-center' || random()::text) from 1 for 8)),
    p.id,
    'Action Center',
    'Email tracking & real time notifications',
    'productivity',
    true,
    3
FROM plans p
WHERE p.plan_type = 'growth' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_features WHERE plan_id = p.id AND name = 'Action Center');

INSERT INTO plan_features (id, internal_code, plan_id, name, description, category, is_included, display_order)
SELECT 
    uuid_generate_v4(),
    'PLF-' || upper(substring(md5('growth-salesforce-automation' || random()::text) from 1 for 8)),
    p.id,
    'Salesforce Automation',
    'Multiple pipelines, Deal Playbooks',
    'sales',
    true,
    4
FROM plans p
WHERE p.plan_type = 'growth' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_features WHERE plan_id = p.id AND name = 'Salesforce Automation');

INSERT INTO plan_features (id, internal_code, plan_id, name, description, category, is_included, display_order)
SELECT 
    uuid_generate_v4(),
    'PLF-' || upper(substring(md5('growth-marketing-automation' || random()::text) from 1 for 8)),
    p.id,
    'Marketing Automation',
    'Campaigns, 5000 Emails/month or 500 Emails/user',
    'marketing',
    true,
    5
FROM plans p
WHERE p.plan_type = 'growth' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_features WHERE plan_id = p.id AND name = 'Marketing Automation' AND category = 'marketing');

INSERT INTO plan_features (id, internal_code, plan_id, name, description, category, is_included, display_order)
SELECT 
    uuid_generate_v4(),
    'PLF-' || upper(substring(md5('growth-help-desk' || random()::text) from 1 for 8)),
    p.id,
    'Help Desk',
    'Organization matching with Email domain, Agent level business hours, Case satisfaction survey, Articles & FAQs, Customer Portal',
    'support',
    true,
    6
FROM plans p
WHERE p.plan_type = 'growth' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_features WHERE plan_id = p.id AND name = 'Help Desk' AND category = 'support');

INSERT INTO plan_features (id, internal_code, plan_id, name, description, category, is_included, display_order)
SELECT 
    uuid_generate_v4(),
    'PLF-' || upper(substring(md5('growth-inventory' || random()::text) from 1 for 8)),
    p.id,
    'Inventory Management',
    'Invoicing, Sales Order',
    'inventory',
    true,
    7
FROM plans p
WHERE p.plan_type = 'growth' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_features WHERE plan_id = p.id AND name = 'Inventory Management');

INSERT INTO plan_features (id, internal_code, plan_id, name, description, category, is_included, display_order)
SELECT 
    uuid_generate_v4(),
    'PLF-' || upper(substring(md5('growth-analytics' || random()::text) from 1 for 8)),
    p.id,
    'Reports & Analytics',
    'Customizable dashboards, Custom schedule reports',
    'analytics',
    true,
    8
FROM plans p
WHERE p.plan_type = 'growth' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_features WHERE plan_id = p.id AND name = 'Reports & Analytics');

-- ONE PROFESSIONAL Features (Everything in Growth plus...)
INSERT INTO plan_features (id, internal_code, plan_id, name, description, category, is_included, display_order)
SELECT 
    uuid_generate_v4(),
    'PLF-' || upper(substring(md5('professional-salesforce-automation' || random()::text) from 1 for 8)),
    p.id,
    'Salesforce Automation',
    'Multiple Pipelines, Profile & Engagement Scoring, Lead Scoring, Sales Forecasting, Sales Quotas',
    'sales',
    true,
    1
FROM plans p
WHERE p.plan_type = 'professional' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_features WHERE plan_id = p.id AND name = 'Salesforce Automation' AND category = 'sales');

INSERT INTO plan_features (id, internal_code, plan_id, name, description, category, is_included, display_order)
SELECT 
    uuid_generate_v4(),
    'PLF-' || upper(substring(md5('professional-marketing-automation' || random()::text) from 1 for 8)),
    p.id,
    'Marketing Automation',
    '20,000 Emails/month or 2000 Emails/user, Unlimited Custom Email Templates, Image Storage, Autoresponder Email Campaigns, Scheduled Email Campaigns',
    'marketing',
    true,
    2
FROM plans p
WHERE p.plan_type = 'professional' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_features WHERE plan_id = p.id AND name = 'Marketing Automation' AND category = 'marketing');

INSERT INTO plan_features (id, internal_code, plan_id, name, description, category, is_included, display_order)
SELECT 
    uuid_generate_v4(),
    'PLF-' || upper(substring(md5('professional-help-desk' || random()::text) from 1 for 8)),
    p.id,
    'Help Desk',
    'Social Ticketing, Round Robin Ticket Assignment, Least Loaded Ticket Assignment, Agent Level Business Hours, Service Contracts',
    'support',
    true,
    3
FROM plans p
WHERE p.plan_type = 'professional' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_features WHERE plan_id = p.id AND name = 'Help Desk' AND category = 'support');

INSERT INTO plan_features (id, internal_code, plan_id, name, description, category, is_included, display_order)
SELECT 
    uuid_generate_v4(),
    'PLF-' || upper(substring(md5('professional-conversations' || random()::text) from 1 for 8)),
    p.id,
    'Conversations',
    'Internal Team Collaboration, Live Web Chat',
    'collaboration',
    true,
    4
FROM plans p
WHERE p.plan_type = 'professional' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_features WHERE plan_id = p.id AND name = 'Conversations');

INSERT INTO plan_features (id, internal_code, plan_id, name, description, category, is_included, display_order)
SELECT 
    uuid_generate_v4(),
    'PLF-' || upper(substring(md5('professional-dashboards' || random()::text) from 1 for 8)),
    p.id,
    'Dashboards',
    'Sales Insights, Support Insights, Customizable Reports & Dashboards',
    'analytics',
    true,
    5
FROM plans p
WHERE p.plan_type = 'professional' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_features WHERE plan_id = p.id AND name = 'Dashboards');

INSERT INTO plan_features (id, internal_code, plan_id, name, description, category, is_included, display_order)
SELECT 
    uuid_generate_v4(),
    'PLF-' || upper(substring(md5('professional-inventory' || random()::text) from 1 for 8)),
    p.id,
    'Inventory Management',
    'Invoicing, Vendor Management, Purchase Order Management, Subscriptions, Payment Tracking, Sales Order, Assets',
    'inventory',
    true,
    6
FROM plans p
WHERE p.plan_type = 'professional' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_features WHERE plan_id = p.id AND name = 'Inventory Management' AND category = 'inventory');

INSERT INTO plan_features (id, internal_code, plan_id, name, description, category, is_included, display_order)
SELECT 
    uuid_generate_v4(),
    'PLF-' || upper(substring(md5('professional-project-management' || random()::text) from 1 for 8)),
    p.id,
    'Project Management',
    'Task dependencies (Finish to Start), Automated task end times (User business hours)',
    'project',
    true,
    7
FROM plans p
WHERE p.plan_type = 'professional' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_features WHERE plan_id = p.id AND name = 'Project Management');

INSERT INTO plan_features (id, internal_code, plan_id, name, description, category, is_included, display_order)
SELECT 
    uuid_generate_v4(),
    'PLF-' || upper(substring(md5('professional-process-designer' || random()::text) from 1 for 8)),
    p.id,
    'Process Designer',
    'Business Process Automation, Rules, Conditions, and Actions, Workflows and Approvals, Flowcharts, Tasks',
    'administration',
    true,
    8
FROM plans p
WHERE p.plan_type = 'professional' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_features WHERE plan_id = p.id AND name = 'Process Designer');

-- ONE ENTERPRISE Features (Everything in Professional plus...)
INSERT INTO plan_features (id, internal_code, plan_id, name, description, category, is_included, display_order)
SELECT 
    uuid_generate_v4(),
    'PLF-' || upper(substring(md5('enterprise-contact-engagement' || random()::text) from 1 for 8)),
    p.id,
    'Contact Engagement',
    'Best Time to Contact',
    'sales',
    true,
    1
FROM plans p
WHERE p.plan_type = 'enterprise' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_features WHERE plan_id = p.id AND name = 'Contact Engagement' AND category = 'sales');

INSERT INTO plan_features (id, internal_code, plan_id, name, description, category, is_included, display_order)
SELECT 
    uuid_generate_v4(),
    'PLF-' || upper(substring(md5('enterprise-salesforce-automation' || random()::text) from 1 for 8)),
    p.id,
    'Salesforce Automation',
    'Multi Currencies',
    'sales',
    true,
    2
FROM plans p
WHERE p.plan_type = 'enterprise' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_features WHERE plan_id = p.id AND name = 'Salesforce Automation' AND plan_id = p.id AND category = 'sales' AND description = 'Multi Currencies');

INSERT INTO plan_features (id, internal_code, plan_id, name, description, category, is_included, display_order)
SELECT 
    uuid_generate_v4(),
    'PLF-' || upper(substring(md5('enterprise-internal-ticketing' || random()::text) from 1 for 8)),
    p.id,
    'Internal Ticketing',
    'Internal Ticketing system for employees, Internal ticket Insights',
    'support',
    true,
    3
FROM plans p
WHERE p.plan_type = 'enterprise' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_features WHERE plan_id = p.id AND name = 'Internal Ticketing');

INSERT INTO plan_features (id, internal_code, plan_id, name, description, category, is_included, display_order)
SELECT 
    uuid_generate_v4(),
    'PLF-' || upper(substring(md5('enterprise-help-desk' || random()::text) from 1 for 8)),
    p.id,
    'Help Desk',
    'Work order management',
    'support',
    true,
    4
FROM plans p
WHERE p.plan_type = 'enterprise' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_features WHERE plan_id = p.id AND name = 'Help Desk' AND plan_id = p.id AND description = 'Work order management');

INSERT INTO plan_features (id, internal_code, plan_id, name, description, category, is_included, display_order)
SELECT 
    uuid_generate_v4(),
    'PLF-' || upper(substring(md5('enterprise-project-management' || random()::text) from 1 for 8)),
    p.id,
    'Project Management',
    'Automated Time Tracking and Billing, Project key metrics and analytics, Project Templates',
    'project',
    true,
    5
FROM plans p
WHERE p.plan_type = 'enterprise' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_features WHERE plan_id = p.id AND name = 'Project Management' AND category = 'project');

-- ONE AI Features (Everything in Enterprise plus...)
INSERT INTO plan_features (id, internal_code, plan_id, name, description, category, is_included, display_order)
SELECT 
    uuid_generate_v4(),
    'PLF-' || upper(substring(md5('ai-built-in-ai' || random()::text) from 1 for 8)),
    p.id,
    'Built-IN AI',
    'Predictive AI, Generative AI, Natural Language Querying, Voice Assistants Integration, AI Prompt Builder, AI Query Analytics, AI Chatbot, AI Bot Management, Generative AI Designer, Predictive AI Designer',
    'ai',
    true,
    1
FROM plans p
WHERE p.plan_type = 'ai' AND p.billing_period = 'monthly'
  AND NOT EXISTS (SELECT 1 FROM plan_features WHERE plan_id = p.id AND name = 'Built-IN AI');

-- ============================================================================
-- BOOSTER PACKS
-- ============================================================================

-- Extra Users Booster Pack
INSERT INTO booster_packs (id, internal_code, name, description, booster_pack_type, limit_type, limit_increase, limit_unit, monthly_price, annual_price, is_active, display_order)
SELECT 
    uuid_generate_v4(),
    'BSP-' || upper(substring(md5('extra-users' || random()::text) from 1 for 8)),
    'Extra Users Pack',
    'Add 10 additional users to your plan',
    'users',
    'users',
    10,
    'users',
    5.00,
    50.00,
    true,
    1
WHERE NOT EXISTS (SELECT 1 FROM booster_packs WHERE name = 'Extra Users Pack');

-- Storage Boost Booster Pack
INSERT INTO booster_packs (id, internal_code, name, description, booster_pack_type, limit_type, limit_increase, limit_unit, monthly_price, annual_price, is_active, display_order)
SELECT 
    uuid_generate_v4(),
    'BSP-' || upper(substring(md5('storage-boost' || random()::text) from 1 for 8)),
    'Storage Boost',
    'Add 50 GB of additional storage',
    'storage',
    'storage_gb',
    50,
    'GB',
    10.00,
    100.00,
    true,
    2
WHERE NOT EXISTS (SELECT 1 FROM booster_packs WHERE name = 'Storage Boost');

-- Email Boost Booster Pack
INSERT INTO booster_packs (id, internal_code, name, description, booster_pack_type, limit_type, limit_increase, limit_unit, monthly_price, annual_price, is_active, display_order)
SELECT 
    uuid_generate_v4(),
    'BSP-' || upper(substring(md5('email-boost' || random()::text) from 1 for 8)),
    'Email Boost',
    'Add 10,000 additional emails per month',
    'emails',
    'emails_per_month',
    10000,
    'emails/month',
    15.00,
    150.00,
    true,
    3
WHERE NOT EXISTS (SELECT 1 FROM booster_packs WHERE name = 'Email Boost');

-- Create Super Admin User
-- This script creates a super admin user with default credentials
-- 
-- IMPORTANT: Change the password immediately after first login!
-- Default credentials:
--   Email: admin@viridial.com
--   Password: Admin@123456
--
-- Usage: Run this after schema.sql and seeds.sql
--   psql $DATABASE_URL -f sql/create-super-admin.sql

-- Enable pgcrypto extension for password hashing (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- Generate a bcrypt hash for the password (Admin@123456)
-- Using bcrypt with cost factor 10 (standard)
-- Note: This hash corresponds to password: Admin@123456
-- To generate a new hash: SELECT crypt('YourPassword', gen_salt('bf', 10));

-- First, we need to find the Super Admin role ID
-- This assumes the Super Admin role was created via seeds.sql
-- If the role doesn't exist, this script will fail - run seeds.sql first

DO $$
DECLARE
    v_super_admin_role_id UUID;
    v_org_id UUID;
    v_user_id UUID;
    v_user_internal_code VARCHAR(50);
    v_org_internal_code VARCHAR(50);
    v_role_internal_code VARCHAR(50);
    v_password_hash VARCHAR(255);
BEGIN
    -- Find the Super Admin role by name
    SELECT id, internal_code INTO v_super_admin_role_id, v_role_internal_code
    FROM roles
    WHERE name = 'Super Admin'
    LIMIT 1;

    -- If Super Admin role doesn't exist, create a default organization first
    -- (This shouldn't happen if seeds.sql was run, but just in case)
    IF v_super_admin_role_id IS NULL THEN
        RAISE EXCEPTION 'Super Admin role not found. Please run seeds.sql first.';
    END IF;

    -- Generate internal code for organization (format: ORG-XXXXXXXX)
    v_org_internal_code := 'ORG-' || upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));

    -- Check if SaaS Admin organization already exists, if not create it
    SELECT id INTO v_org_id
    FROM organizations
    WHERE name = 'Viridial SaaS Administration'
    LIMIT 1;

    IF v_org_id IS NULL THEN
        -- Create the SaaS Admin organization
        INSERT INTO organizations (
            id,
            internal_code,
            name,
            description,
			slug,
            is_active,
            created_at,
            updated_at
        ) VALUES (
            uuid_generate_v4(),
            v_org_internal_code,
            'Viridial SaaS Administration',
            'Organization for SaaS platform administration and management',
			'viridial-saas-administration',
            true,
            NOW(),
            NOW()
        ) RETURNING id INTO v_org_id;

        RAISE NOTICE 'SaaS Admin organization created with ID: %', v_org_id;
    ELSE
        RAISE NOTICE 'SaaS Admin organization already exists with ID: %. Skipping creation.', v_org_id;
    END IF;

    -- Generate internal code for user (format: USR-XXXXXXXX)
    v_user_internal_code := 'USR-' || upper(substring(md5(random()::text || clock_timestamp()::text) from 1 for 8));

    -- Bcrypt hash for password: Admin@123456
    -- This hash was generated using Node.js bcrypt (10 rounds) for compatibility
    -- Generated using: node -p "const bcrypt = require('bcrypt'); bcrypt.hashSync('Admin@123456', 10)"
    -- IMPORTANT: The hash format must match Node.js bcrypt ($2b$10$...)
    v_password_hash := '$2b$10$ygi.mSwgiGsRmmwlqlR7EeUataF/34sk4NZ08RTAI4XkDGJ05lzvS';

    -- Check if super admin user already exists
    SELECT id INTO v_user_id
    FROM users
    WHERE email = 'admin@viridial.com'
    LIMIT 1;

    IF v_user_id IS NULL THEN
        -- Create the super admin user
        INSERT INTO users (
            id,
            internal_code,
            email,
            password_hash,
            first_name,
            last_name,
            role,
            organization_id,
            is_active,
            email_verified,
            preferred_language,
            created_at,
            updated_at
        ) VALUES (
            uuid_generate_v4(),
            v_user_internal_code,
            'admin@viridial.com',
            v_password_hash,
            'Super',
            'Admin',
            'super_admin',
            v_org_id, -- Super admin is linked to SaaS Admin organization
            true,
            true, -- Email verified by default for super admin
            'en',
            NOW(),
            NOW()
        ) RETURNING id INTO v_user_id;

        RAISE NOTICE 'Super admin user created with ID: %', v_user_id;
    ELSE
        RAISE NOTICE 'Super admin user already exists with ID: %. Skipping creation.', v_user_id;
    END IF;

    -- Assign Super Admin role to the user
    INSERT INTO user_roles (user_id, role_id, assigned_at)
    SELECT v_user_id, v_super_admin_role_id, NOW()
    WHERE NOT EXISTS (
        SELECT 1 FROM user_roles 
        WHERE user_id = v_user_id AND role_id = v_super_admin_role_id
    );

    RAISE NOTICE 'Super Admin role assigned to user.';
    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'SUPER ADMIN CREDENTIALS:';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Email: admin@viridial.com';
    RAISE NOTICE 'Password: Admin@123456';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  IMPORTANT: Change the password immediately after first login!';
    RAISE NOTICE '========================================';

END $$;

-- ============================================================================
-- ASSIGN ROLES TO ORGANIZATION USERS
-- ============================================================================
-- Assign appropriate roles to users created in organizations-seed.sql

-- Assign Admin role to organization admins
INSERT INTO user_roles (user_id, role_id, assigned_at)
SELECT u.id, r.id, NOW()
FROM users u
CROSS JOIN roles r
WHERE r.name = 'Admin' AND r.organization_id IS NULL
  AND u.email IN (
    'admin@viridial-real-estate.fr',
    'admin@property-management-pro.fr',
    'admin@luxury-developments.fr'
  )
  AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = u.id AND ur.role_id = r.id
  );

-- Assign Manager role to agent users
INSERT INTO user_roles (user_id, role_id, assigned_at)
SELECT u.id, r.id, NOW()
FROM users u
CROSS JOIN roles r
WHERE r.name = 'Manager' AND r.organization_id IS NULL
  AND u.email = 'marie.martin@viridial-real-estate.fr'
  AND NOT EXISTS (
    SELECT 1 FROM user_roles ur 
    WHERE ur.user_id = u.id AND ur.role_id = r.id
  );

-- ============================================================================
-- CREATE SUBSCRIPTIONS FOR ORGANIZATIONS
-- ============================================================================
-- Create subscriptions linking organizations to their plans

-- Subscription for Viridial Real Estate (Professional plan)
INSERT INTO subscriptions (
    id,
    internal_code,
    organization_id,
    plan_id,
    status,
    standard_users_count,
    single_app_users_count,
    billing_period,
    monthly_amount,
    currency,
    trial_start_date,
    trial_end_date,
    trial_days,
    current_period_start,
    current_period_end,
    cancel_at_period_end,
    created_at,
    updated_at
)
SELECT 
    uuid_generate_v4(),
    'SUB-' || upper(substring(md5('viridial-subscription' || random()::text) from 1 for 8)),
    o.id,
    p.id,
    'active',
    2,
    0,
    'monthly',
    30.00,
    'USD',
    NOW() - INTERVAL '14 days',
    NOW() + INTERVAL '16 days',
    30,
    NOW() - INTERVAL '14 days',
    NOW() + INTERVAL '16 days',
    false,
    NOW(),
    NOW()
FROM organizations o
CROSS JOIN plans p
WHERE o.slug = 'viridial-real-estate'
  AND p.plan_type = 'professional'
  AND p.billing_period = 'monthly'
  AND NOT EXISTS (
    SELECT 1 FROM subscriptions s 
    WHERE s.organization_id = o.id AND s.status = 'active'
  );

-- Subscription for Property Management Pro (Growth plan)
INSERT INTO subscriptions (
    id,
    internal_code,
    organization_id,
    plan_id,
    status,
    standard_users_count,
    single_app_users_count,
    billing_period,
    monthly_amount,
    currency,
    trial_start_date,
    trial_end_date,
    trial_days,
    current_period_start,
    current_period_end,
    cancel_at_period_end,
    created_at,
    updated_at
)
SELECT 
    uuid_generate_v4(),
    'SUB-' || upper(substring(md5('pmp-subscription' || random()::text) from 1 for 8)),
    o.id,
    p.id,
    'active',
    1,
    0,
    'monthly',
    12.00,
    'USD',
    NOW() - INTERVAL '7 days',
    NOW() + INTERVAL '23 days',
    30,
    NOW() - INTERVAL '7 days',
    NOW() + INTERVAL '23 days',
    false,
    NOW(),
    NOW()
FROM organizations o
CROSS JOIN plans p
WHERE o.slug = 'property-management-pro'
  AND p.plan_type = 'growth'
  AND p.billing_period = 'monthly'
  AND NOT EXISTS (
    SELECT 1 FROM subscriptions s 
    WHERE s.organization_id = o.id AND s.status = 'active'
  );

-- Subscription for Luxury Developments (Enterprise plan)
INSERT INTO subscriptions (
    id,
    internal_code,
    organization_id,
    plan_id,
    status,
    standard_users_count,
    single_app_users_count,
    billing_period,
    monthly_amount,
    currency,
    trial_start_date,
    trial_end_date,
    trial_days,
    current_period_start,
    current_period_end,
    cancel_at_period_end,
    created_at,
    updated_at
)
SELECT 
    uuid_generate_v4(),
    'SUB-' || upper(substring(md5('ld-subscription' || random()::text) from 1 for 8)),
    o.id,
    p.id,
    'active',
    1,
    0,
    'monthly',
    42.00,
    'USD',
    NOW() - INTERVAL '10 days',
    NOW() + INTERVAL '20 days',
    30,
    NOW() - INTERVAL '10 days',
    NOW() + INTERVAL '20 days',
    false,
    NOW(),
    NOW()
FROM organizations o
CROSS JOIN plans p
WHERE o.slug = 'luxury-developments'
  AND p.plan_type = 'enterprise'
  AND p.billing_period = 'monthly'
  AND NOT EXISTS (
    SELECT 1 FROM subscriptions s 
    WHERE s.organization_id = o.id AND s.status = 'active'
  );

-- ============================================================================
-- ASSIGN USER PLANS (Link users to subscriptions)
-- ============================================================================

-- Assign users to their organization's subscription
INSERT INTO user_plans (id, user_id, subscription_id, user_type, created_at, updated_at)
SELECT 
    uuid_generate_v4(),
    u.id,
    s.id,
    'standard',
    NOW(),
    NOW()
FROM users u
INNER JOIN organizations o ON u.organization_id = o.id
INNER JOIN subscriptions s ON s.organization_id = o.id AND s.status = 'active'
WHERE NOT EXISTS (
    SELECT 1 FROM user_plans up 
    WHERE up.user_id = u.id AND up.subscription_id = s.id
);

-- ============================================================================
-- SUMMARY AND VERIFICATION
-- ============================================================================

DO $$
DECLARE
    v_resources_count INTEGER;
    v_features_count INTEGER;
    v_permissions_count INTEGER;
    v_roles_count INTEGER;
    v_users_count INTEGER;
    v_organizations_count INTEGER;
    v_plans_count INTEGER;
    v_subscriptions_count INTEGER;
BEGIN
    -- Count created entities
    SELECT COUNT(*) INTO v_resources_count FROM resources;
    SELECT COUNT(*) INTO v_features_count FROM features;
    SELECT COUNT(*) INTO v_permissions_count FROM permissions;
    SELECT COUNT(*) INTO v_roles_count FROM roles WHERE organization_id IS NULL;
    SELECT COUNT(*) INTO v_users_count FROM users;
    SELECT COUNT(*) INTO v_organizations_count FROM organizations;
    SELECT COUNT(*) INTO v_plans_count FROM plans;
    SELECT COUNT(*) INTO v_subscriptions_count FROM subscriptions;

    RAISE NOTICE '';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'DATABASE SETUP COMPLETE';
    RAISE NOTICE '========================================';
    RAISE NOTICE 'Resources created: %', v_resources_count;
    RAISE NOTICE 'Features created: %', v_features_count;
    RAISE NOTICE 'Permissions created: %', v_permissions_count;
    RAISE NOTICE 'Roles created: %', v_roles_count;
    RAISE NOTICE 'Users created: %', v_users_count;
    RAISE NOTICE 'Organizations created: %', v_organizations_count;
    RAISE NOTICE 'Plans created: %', v_plans_count;
    RAISE NOTICE 'Subscriptions created: %', v_subscriptions_count;
    RAISE NOTICE '';
    RAISE NOTICE 'Default credentials:';
    RAISE NOTICE '  Super Admin: admin@viridial.com / Admin@123456';
    RAISE NOTICE '  Organization Users: Password123!';
    RAISE NOTICE '';
    RAISE NOTICE '⚠️  IMPORTANT: Change all passwords after first login!';
    RAISE NOTICE '========================================';
END $$;

-- ============================================================================
-- END OF COMPLETE DATABASE SETUP
-- ============================================================================
