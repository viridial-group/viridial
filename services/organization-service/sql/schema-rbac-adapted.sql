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

