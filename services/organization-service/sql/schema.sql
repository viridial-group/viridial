-- Organization Service Database Schema
-- Generated SQL for all entities
-- Note: UUIDs are used for primary keys. Ensure uuid-ossp extension is enabled in PostgreSQL.

-- Enable UUID extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================================
-- DROP EXISTING TABLES (for re-initialization)
-- ============================================================================
-- Drop all tables in reverse dependency order (CASCADE handles foreign keys)
-- Using IF EXISTS makes this idempotent (safe to run multiple times)

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
-- TABLES
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

-- Resources
CREATE TABLE resources (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    internal_code VARCHAR(50) NOT NULL UNIQUE,
    external_code VARCHAR(255) NULL,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255) NULL,
    category VARCHAR(100) NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Features
CREATE TABLE features (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    internal_code VARCHAR(50) NOT NULL UNIQUE,
    external_code VARCHAR(255) NULL,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255) NULL,
    category VARCHAR(100) NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Permissions
CREATE TABLE permissions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    internal_code VARCHAR(50) NOT NULL UNIQUE,
    external_code VARCHAR(255) NULL,
    resource_id UUID NULL,
    resource VARCHAR(100) NOT NULL,
    action VARCHAR(50) NOT NULL,
    description VARCHAR(255) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_permission_resource FOREIGN KEY (resource_id) REFERENCES resources(id) ON DELETE SET NULL,
    CONSTRAINT uk_permission_resource_action UNIQUE (resource_id, action)
);

-- Roles
CREATE TABLE roles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    internal_code VARCHAR(50) NOT NULL UNIQUE,
    external_code VARCHAR(255) NULL,
    name VARCHAR(100) NOT NULL,
    description VARCHAR(255) NULL,
    organization_id UUID NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    parent_id UUID NULL,
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
    role VARCHAR(50) NOT NULL DEFAULT 'user',
    organization_id UUID NULL,
    is_active BOOLEAN NOT NULL DEFAULT true,
    email_verified BOOLEAN NOT NULL DEFAULT false,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_user_organization FOREIGN KEY (organization_id) REFERENCES organizations(id) ON DELETE SET NULL
);

-- User Roles (Junction Table)
CREATE TABLE user_roles (
    user_id UUID NOT NULL,
    role_id UUID NOT NULL,
    assigned_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (user_id, role_id),
    CONSTRAINT fk_user_role_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_user_role_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT uk_user_role UNIQUE (user_id, role_id)
);

-- Role Permissions (Junction Table)
CREATE TABLE role_permissions (
    role_id UUID NOT NULL,
    permission_id UUID NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_role_permission_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT fk_role_permission_permission FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

-- Feature Permissions (Junction Table)
CREATE TABLE feature_permissions (
    feature_id UUID NOT NULL,
    permission_id UUID NOT NULL,
    PRIMARY KEY (feature_id, permission_id),
    CONSTRAINT fk_feature_permission_feature FOREIGN KEY (feature_id) REFERENCES features(id) ON DELETE CASCADE,
    CONSTRAINT fk_feature_permission_permission FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

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

-- Plan Features
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
-- INDEXES
-- ============================================================================

-- Organizations indexes
CREATE INDEX idx_organizations_name ON organizations(name);
CREATE INDEX idx_organizations_country_city ON organizations(country, city);
CREATE INDEX idx_organizations_plan ON organizations(plan);
CREATE INDEX idx_organizations_is_active ON organizations(is_active);
CREATE INDEX idx_organizations_is_active_plan ON organizations(is_active, plan);
CREATE INDEX idx_organizations_parent_id ON organizations(parent_id);
CREATE INDEX idx_organizations_parent_id_is_active ON organizations(parent_id, is_active);
CREATE INDEX idx_organizations_subscription_status_compliance_status ON organizations(subscription_status, compliance_status);
CREATE INDEX idx_organizations_created_at ON organizations(created_at);
CREATE INDEX idx_organizations_updated_at ON organizations(updated_at);
CREATE INDEX idx_organizations_registration_number ON organizations(registration_number);
CREATE INDEX idx_organizations_vat_number ON organizations(vat_number);
CREATE INDEX idx_organizations_rcs_number ON organizations(rcs_number);
CREATE INDEX idx_organizations_siren ON organizations(siren);
CREATE INDEX idx_organizations_siret ON organizations(siret);
CREATE INDEX idx_organizations_industry ON organizations(industry);

-- Resources indexes
CREATE INDEX idx_resources_external_code ON resources(external_code);

-- Features indexes
CREATE INDEX idx_features_external_code ON features(external_code);

-- Permissions indexes
CREATE INDEX idx_permissions_external_code ON permissions(external_code);
CREATE INDEX idx_permissions_resource_id ON permissions(resource_id);

-- Roles indexes
CREATE INDEX idx_roles_external_code ON roles(external_code);
CREATE INDEX idx_roles_organization_id ON roles(organization_id);
CREATE INDEX idx_roles_parent_id ON roles(parent_id);

-- Users indexes
CREATE INDEX idx_users_external_code ON users(external_code);
CREATE INDEX idx_users_organization_id ON users(organization_id);

-- User Roles indexes (unique index already defined in PRIMARY KEY)
CREATE INDEX idx_user_roles_user_id ON user_roles(user_id);
CREATE INDEX idx_user_roles_role_id ON user_roles(role_id);

-- Role Permissions indexes (unique index already defined in PRIMARY KEY)
CREATE INDEX idx_role_permissions_role_id ON role_permissions(role_id);
CREATE INDEX idx_role_permissions_permission_id ON role_permissions(permission_id);

-- Feature Permissions indexes (unique index already defined in PRIMARY KEY)
CREATE INDEX idx_feature_permissions_feature_id ON feature_permissions(feature_id);
CREATE INDEX idx_feature_permissions_permission_id ON feature_permissions(permission_id);

-- Organization Addresses indexes
CREATE INDEX idx_organization_addresses_external_code ON organization_addresses(external_code);
CREATE INDEX idx_organization_addresses_organization_id ON organization_addresses(organization_id);
CREATE INDEX idx_organization_addresses_type ON organization_addresses(type);
CREATE INDEX idx_organization_addresses_city ON organization_addresses(city);
CREATE INDEX idx_organization_addresses_country ON organization_addresses(country);

-- Organization Phones indexes
CREATE INDEX idx_organization_phones_external_code ON organization_phones(external_code);
CREATE INDEX idx_organization_phones_organization_id ON organization_phones(organization_id);
CREATE INDEX idx_organization_phones_type ON organization_phones(type);
CREATE INDEX idx_organization_phones_number ON organization_phones(number);

-- Organization Emails indexes
CREATE INDEX idx_organization_emails_external_code ON organization_emails(external_code);
CREATE INDEX idx_organization_emails_organization_id ON organization_emails(organization_id);
CREATE INDEX idx_organization_emails_type ON organization_emails(type);
CREATE INDEX idx_organization_emails_address ON organization_emails(address);

-- Password Reset Tokens indexes
CREATE INDEX idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);

-- Email Verification Tokens indexes
CREATE INDEX idx_email_verification_tokens_user_id ON email_verification_tokens(user_id);

-- Plans indexes
CREATE INDEX idx_plans_internal_code ON plans(internal_code);
CREATE INDEX idx_plans_external_code ON plans(external_code);
CREATE INDEX idx_plans_plan_type ON plans(plan_type);
CREATE INDEX idx_plans_billing_period ON plans(billing_period);
CREATE INDEX idx_plans_is_active ON plans(is_active);
CREATE INDEX idx_plans_is_active_plan_type ON plans(is_active, plan_type);
CREATE INDEX idx_plans_is_featured ON plans(is_featured);
CREATE INDEX idx_plans_display_order ON plans(display_order);

-- Plan Features indexes
CREATE INDEX idx_plan_features_internal_code ON plan_features(internal_code);
CREATE INDEX idx_plan_features_plan_id ON plan_features(plan_id);
CREATE INDEX idx_plan_features_plan_id_category ON plan_features(plan_id, category);
CREATE INDEX idx_plan_features_plan_id_is_included ON plan_features(plan_id, is_included);
CREATE INDEX idx_plan_features_display_order ON plan_features(display_order);

-- Plan Limits indexes
CREATE INDEX idx_plan_limits_internal_code ON plan_limits(internal_code);
CREATE INDEX idx_plan_limits_plan_id ON plan_limits(plan_id);
CREATE INDEX idx_plan_limits_plan_id_limit_type ON plan_limits(plan_id, limit_type);

-- Subscriptions indexes
CREATE INDEX idx_subscriptions_internal_code ON subscriptions(internal_code);
CREATE INDEX idx_subscriptions_organization_id ON subscriptions(organization_id);
CREATE INDEX idx_subscriptions_plan_id ON subscriptions(plan_id);
CREATE INDEX idx_subscriptions_status ON subscriptions(status);
CREATE INDEX idx_subscriptions_organization_id_status ON subscriptions(organization_id, status);
CREATE INDEX idx_subscriptions_plan_id_status ON subscriptions(plan_id, status);
CREATE INDEX idx_subscriptions_status_current_period_end ON subscriptions(status, current_period_end);
CREATE INDEX idx_subscriptions_current_period_end ON subscriptions(current_period_end);

-- User Plans indexes
CREATE INDEX idx_user_plans_user_id ON user_plans(user_id);
CREATE INDEX idx_user_plans_subscription_id ON user_plans(subscription_id);
CREATE INDEX idx_user_plans_subscription_id_user_type ON user_plans(subscription_id, user_type);

-- Booster Packs indexes
CREATE INDEX idx_booster_packs_internal_code ON booster_packs(internal_code);
CREATE INDEX idx_booster_packs_external_code ON booster_packs(external_code);
CREATE INDEX idx_booster_packs_booster_pack_type ON booster_packs(booster_pack_type);
CREATE INDEX idx_booster_packs_is_active ON booster_packs(is_active);
CREATE INDEX idx_booster_packs_is_active_booster_pack_type ON booster_packs(is_active, booster_pack_type);
CREATE INDEX idx_booster_packs_limit_type ON booster_packs(limit_type);
CREATE INDEX idx_booster_packs_display_order ON booster_packs(display_order);

