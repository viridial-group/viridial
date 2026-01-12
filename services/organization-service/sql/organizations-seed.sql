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

