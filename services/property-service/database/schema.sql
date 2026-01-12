-- =====================================================
-- Property Service Database Schema
-- =====================================================
-- This file contains the complete database schema for the property service
-- including all tables, indexes, constraints, and seed data.
-- Uses reference tables instead of SQL ENUMs for better flexibility.

-- =====================================================
-- 0. DROP TABLES (if they exist, in reverse dependency order)
-- =====================================================
-- Drop tables in reverse order of dependencies to avoid foreign key constraint errors

-- Drop main tables first (those with foreign keys)
DROP TABLE IF EXISTS custom_field_values CASCADE;
DROP TABLE IF EXISTS custom_field_definitions CASCADE;
DROP TABLE IF EXISTS import_jobs CASCADE;
DROP TABLE IF EXISTS property_favorites CASCADE;
DROP TABLE IF EXISTS property_flags CASCADE;
DROP TABLE IF EXISTS property_details CASCADE;
DROP TABLE IF EXISTS property_translations CASCADE;
DROP TABLE IF EXISTS properties CASCADE;
DROP TABLE IF EXISTS neighborhoods CASCADE;

-- Drop reference tables (those referenced by main tables)
DROP TABLE IF EXISTS import_statuses CASCADE;
DROP TABLE IF EXISTS custom_field_types CASCADE;
DROP TABLE IF EXISTS flag_statuses CASCADE;
DROP TABLE IF EXISTS property_types CASCADE; -- CASCADE will also drop subtypes
DROP TABLE IF EXISTS property_statuses CASCADE;

-- =====================================================
-- 1. REFERENCE TABLES (Types and Subtypes)
-- =====================================================

-- Property Status Reference Table
CREATE TABLE IF NOT EXISTS property_statuses (
    code VARCHAR(50) PRIMARY KEY,
    label JSONB NOT NULL, -- Multilingual labels: {"fr": "Brouillon", "en": "Draft"}
    description JSONB, -- Optional description
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_property_statuses_active ON property_statuses(is_active);
CREATE INDEX IF NOT EXISTS idx_property_statuses_order ON property_statuses(display_order);

-- Property Type Reference Table (with subtypes support)
CREATE TABLE IF NOT EXISTS property_types (
    code VARCHAR(50) PRIMARY KEY,
    parent_code VARCHAR(50), -- NULL for main types, code of parent for subtypes
    label JSONB NOT NULL, -- Multilingual labels: {"fr": "Maison", "en": "House"}
    description JSONB,
    icon VARCHAR(100), -- Icon identifier
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_property_type_parent FOREIGN KEY (parent_code) REFERENCES property_types(code) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_property_types_parent ON property_types(parent_code);
CREATE INDEX IF NOT EXISTS idx_property_types_active ON property_types(is_active);
CREATE INDEX IF NOT EXISTS idx_property_types_order ON property_types(display_order);

-- Flag Status Reference Table
CREATE TABLE IF NOT EXISTS flag_statuses (
    code VARCHAR(50) PRIMARY KEY,
    label JSONB NOT NULL,
    description JSONB,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_flag_statuses_active ON flag_statuses(is_active);
CREATE INDEX IF NOT EXISTS idx_flag_statuses_order ON flag_statuses(display_order);

-- Custom Field Type Reference Table
CREATE TABLE IF NOT EXISTS custom_field_types (
    code VARCHAR(50) PRIMARY KEY,
    label JSONB NOT NULL,
    description JSONB,
    validation_schema JSONB, -- JSON schema for validation
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_custom_field_types_active ON custom_field_types(is_active);
CREATE INDEX IF NOT EXISTS idx_custom_field_types_order ON custom_field_types(display_order);

-- Import Status Reference Table
CREATE TABLE IF NOT EXISTS import_statuses (
    code VARCHAR(50) PRIMARY KEY,
    label JSONB NOT NULL,
    description JSONB,
    display_order INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_import_statuses_active ON import_statuses(is_active);
CREATE INDEX IF NOT EXISTS idx_import_statuses_order ON import_statuses(display_order);

-- =====================================================
-- 2. MAIN TABLES
-- =====================================================

-- Neighborhoods Table
CREATE TABLE IF NOT EXISTS neighborhoods (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    slug VARCHAR(100) UNIQUE NOT NULL,
    name VARCHAR(200) NOT NULL,
    description JSONB NOT NULL DEFAULT '{}',
    city VARCHAR(100) NOT NULL,
    region VARCHAR(100),
    country VARCHAR(100),
    postal_code VARCHAR(20),
    center_latitude DECIMAL(10, 8),
    center_longitude DECIMAL(11, 8),
    stats JSONB,
    features JSONB,
    media_urls JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_neighborhoods_slug ON neighborhoods(slug);
CREATE INDEX IF NOT EXISTS idx_neighborhoods_city ON neighborhoods(city);
CREATE INDEX IF NOT EXISTS idx_neighborhoods_region ON neighborhoods(region);
CREATE INDEX IF NOT EXISTS idx_neighborhoods_country ON neighborhoods(country);

-- Properties Table
CREATE TABLE IF NOT EXISTS properties (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    internal_code VARCHAR(50) NOT NULL UNIQUE, -- Generated automatically by service on create
    external_code VARCHAR(100), -- Optional external reference code (can be NULL)
    user_id VARCHAR(255) NOT NULL,
    status_code VARCHAR(50) NOT NULL DEFAULT 'draft',
    type_code VARCHAR(50) NOT NULL,
    price DECIMAL(12, 2) NOT NULL,
    currency VARCHAR(3) DEFAULT 'EUR',
    latitude DECIMAL(10, 8),
    longitude DECIMAL(11, 8),
    street VARCHAR(255),
    postal_code VARCHAR(20),
    city VARCHAR(100),
    region VARCHAR(100),
    country VARCHAR(100),
    neighborhood_id UUID,
    media_urls JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    published_at TIMESTAMP,
    deleted_at TIMESTAMP,
    CONSTRAINT fk_property_neighborhood FOREIGN KEY (neighborhood_id) REFERENCES neighborhoods(id) ON DELETE SET NULL,
    CONSTRAINT fk_property_status FOREIGN KEY (status_code) REFERENCES property_statuses(code),
    CONSTRAINT fk_property_type FOREIGN KEY (type_code) REFERENCES property_types(code)
);

CREATE INDEX IF NOT EXISTS idx_properties_internal_code ON properties(internal_code);
CREATE INDEX IF NOT EXISTS idx_properties_external_code ON properties(external_code) WHERE external_code IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_properties_user_id ON properties(user_id);
CREATE INDEX IF NOT EXISTS idx_properties_status_code ON properties(status_code);
CREATE INDEX IF NOT EXISTS idx_properties_type_code ON properties(type_code);
CREATE INDEX IF NOT EXISTS idx_properties_postal_code ON properties(postal_code);
CREATE INDEX IF NOT EXISTS idx_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS idx_properties_country ON properties(country);
CREATE INDEX IF NOT EXISTS idx_properties_neighborhood_id ON properties(neighborhood_id);
CREATE INDEX IF NOT EXISTS idx_properties_deleted_at ON properties(deleted_at);
CREATE INDEX IF NOT EXISTS idx_properties_location ON properties(latitude, longitude) WHERE latitude IS NOT NULL AND longitude IS NOT NULL;

-- Property Translations Table
CREATE TABLE IF NOT EXISTS property_translations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL,
    language VARCHAR(5) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    notes TEXT,
    meta_title VARCHAR(255),
    meta_description TEXT,
    CONSTRAINT fk_translation_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    CONSTRAINT uk_translation_property_language UNIQUE (property_id, language)
);

CREATE INDEX IF NOT EXISTS idx_translations_property_id ON property_translations(property_id);
CREATE INDEX IF NOT EXISTS idx_translations_language ON property_translations(language);

-- Property Details Table
CREATE TABLE IF NOT EXISTS property_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID UNIQUE NOT NULL,
    surface_area DECIMAL(10, 2),
    land_area DECIMAL(10, 2),
    bedrooms INT,
    bathrooms INT,
    total_rooms INT,
    has_garage BOOLEAN DEFAULT FALSE,
    garage_spaces INT,
    has_parking BOOLEAN DEFAULT FALSE,
    parking_spaces INT,
    has_elevator BOOLEAN DEFAULT FALSE,
    has_balcony BOOLEAN DEFAULT FALSE,
    has_terrace BOOLEAN DEFAULT FALSE,
    has_garden BOOLEAN DEFAULT FALSE,
    has_pool BOOLEAN DEFAULT FALSE,
    has_fireplace BOOLEAN DEFAULT FALSE,
    has_air_conditioning BOOLEAN DEFAULT FALSE,
    has_heating BOOLEAN DEFAULT FALSE,
    floor_number INT,
    total_floors INT,
    has_storage BOOLEAN DEFAULT FALSE,
    construction_year INT,
    renovation_year INT,
    energy_class VARCHAR(10),
    energy_consumption DECIMAL(10, 2),
    greenhouse_gas_emissions DECIMAL(10, 2),
    zoning VARCHAR(50),
    buildable BOOLEAN,
    building_rights DECIMAL(10, 2),
    commercial_type VARCHAR(50),
    business_license BOOLEAN DEFAULT FALSE,
    max_capacity INT,
    amenities JSONB,
    features JSONB,
    CONSTRAINT fk_details_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_details_property_id ON property_details(property_id);

-- Property Flags Table
CREATE TABLE IF NOT EXISTS property_flags (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    property_id UUID NOT NULL,
    flagged_by VARCHAR(255) NOT NULL,
    reason TEXT NOT NULL,
    status_code VARCHAR(50) NOT NULL DEFAULT 'pending',
    reviewed_by VARCHAR(255),
    reviewed_at TIMESTAMP,
    moderation_action VARCHAR(50),
    moderation_notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_flag_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    CONSTRAINT fk_flag_status FOREIGN KEY (status_code) REFERENCES flag_statuses(code)
);

CREATE INDEX IF NOT EXISTS idx_flags_property_id ON property_flags(property_id);
CREATE INDEX IF NOT EXISTS idx_flags_flagged_by ON property_flags(flagged_by);
CREATE INDEX IF NOT EXISTS idx_flags_status_code ON property_flags(status_code);

-- Property Favorites Table
CREATE TABLE IF NOT EXISTS property_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    property_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_favorite_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
    CONSTRAINT uk_favorite_user_property UNIQUE (user_id, property_id)
);

CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON property_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_property_id ON property_favorites(property_id);

-- Custom Field Definitions Table
CREATE TABLE IF NOT EXISTS custom_field_definitions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID,
    entity_type VARCHAR(50) NOT NULL,
    field_key VARCHAR(100) NOT NULL,
    label JSONB NOT NULL,
    field_type_code VARCHAR(50) NOT NULL,
    required BOOLEAN DEFAULT FALSE,
    default_value JSONB,
    validation_rules JSONB,
    options JSONB,
    reusable BOOLEAN DEFAULT FALSE,
    reusable_entity_types JSONB,
    deleted_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uk_field_org_entity_key UNIQUE (organization_id, entity_type, field_key),
    CONSTRAINT fk_field_type FOREIGN KEY (field_type_code) REFERENCES custom_field_types(code)
);

CREATE INDEX IF NOT EXISTS idx_field_def_org_id ON custom_field_definitions(organization_id);
CREATE INDEX IF NOT EXISTS idx_field_def_entity_type ON custom_field_definitions(entity_type);
CREATE INDEX IF NOT EXISTS idx_field_def_deleted_at ON custom_field_definitions(deleted_at);
CREATE INDEX IF NOT EXISTS idx_field_def_field_type_code ON custom_field_definitions(field_type_code);

-- Custom Field Values Table
CREATE TABLE IF NOT EXISTS custom_field_values (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    organization_id UUID,
    entity_type VARCHAR(50) NOT NULL,
    entity_id UUID NOT NULL,
    field_definition_id UUID NOT NULL,
    value_text TEXT,
    value_number DECIMAL(15, 4),
    value_date TIMESTAMP,
    value_boolean BOOLEAN,
    value_json JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_value_field_def FOREIGN KEY (field_definition_id) REFERENCES custom_field_definitions(id) ON DELETE CASCADE,
    CONSTRAINT uk_value_entity_field UNIQUE (entity_type, entity_id, field_definition_id)
);

CREATE INDEX IF NOT EXISTS idx_field_values_org_id ON custom_field_values(organization_id);
CREATE INDEX IF NOT EXISTS idx_field_values_entity ON custom_field_values(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_field_values_field_def_id ON custom_field_values(field_definition_id);

-- Import Jobs Table
CREATE TABLE IF NOT EXISTS import_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    status_code VARCHAR(50) NOT NULL DEFAULT 'processing',
    total_count INT DEFAULT 0,
    success_count INT DEFAULT 0,
    error_count INT DEFAULT 0,
    errors JSONB,
    file_name VARCHAR(255),
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP,
    CONSTRAINT fk_import_status FOREIGN KEY (status_code) REFERENCES import_statuses(code)
);

CREATE INDEX IF NOT EXISTS idx_import_jobs_user_id ON import_jobs(user_id);
CREATE INDEX IF NOT EXISTS idx_import_jobs_status_code ON import_jobs(status_code);

-- =====================================================
-- 3. SEED DATA - Reference Tables
-- =====================================================

-- Property Statuses
INSERT INTO property_statuses (code, label, description, display_order, is_active) VALUES
('draft', 
 '{"fr": "Brouillon", "en": "Draft"}',
 '{"fr": "Propriété en cours de création, non publiée", "en": "Property being created, not published"}',
 1, TRUE)
ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label, description = EXCLUDED.description, display_order = EXCLUDED.display_order;

INSERT INTO property_statuses (code, label, description, display_order, is_active) VALUES
('review', 
 '{"fr": "En révision", "en": "Under Review"}',
 '{"fr": "Propriété soumise pour modération", "en": "Property submitted for moderation"}',
 2, TRUE)
ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label, description = EXCLUDED.description, display_order = EXCLUDED.display_order;

INSERT INTO property_statuses (code, label, description, display_order, is_active) VALUES
('listed', 
 '{"fr": "Publiée", "en": "Listed"}',
 '{"fr": "Propriété publiée et visible publiquement", "en": "Property published and publicly visible"}',
 3, TRUE)
ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label, description = EXCLUDED.description, display_order = EXCLUDED.display_order;

INSERT INTO property_statuses (code, label, description, display_order, is_active) VALUES
('flagged', 
 '{"fr": "Signalée", "en": "Flagged"}',
 '{"fr": "Propriété signalée, nécessite une révision", "en": "Property flagged, requires review"}',
 4, TRUE)
ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label, description = EXCLUDED.description, display_order = EXCLUDED.display_order;

INSERT INTO property_statuses (code, label, description, display_order, is_active) VALUES
('archived', 
 '{"fr": "Archivée", "en": "Archived"}',
 '{"fr": "Propriété archivée, non visible publiquement", "en": "Property archived, not publicly visible"}',
 5, TRUE)
ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label, description = EXCLUDED.description, display_order = EXCLUDED.display_order;

-- Property Types (Main Types)
INSERT INTO property_types (code, parent_code, label, description, icon, display_order, is_active) VALUES
('house', 
 NULL,
 '{"fr": "Maison", "en": "House"}',
 '{"fr": "Maison individuelle avec jardin", "en": "Detached house with garden"}',
 'home',
 1, TRUE)
ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label, description = EXCLUDED.description, icon = EXCLUDED.icon, display_order = EXCLUDED.display_order;

INSERT INTO property_types (code, parent_code, label, description, icon, display_order, is_active) VALUES
('apartment', 
 NULL,
 '{"fr": "Appartement", "en": "Apartment"}',
 '{"fr": "Appartement dans un immeuble", "en": "Apartment in a building"}',
 'building',
 2, TRUE)
ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label, description = EXCLUDED.description, icon = EXCLUDED.icon, display_order = EXCLUDED.display_order;

INSERT INTO property_types (code, parent_code, label, description, icon, display_order, is_active) VALUES
('villa', 
 NULL,
 '{"fr": "Villa", "en": "Villa"}',
 '{"fr": "Villa de luxe avec piscine et jardin", "en": "Luxury villa with pool and garden"}',
 'home',
 3, TRUE)
ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label, description = EXCLUDED.description, icon = EXCLUDED.icon, display_order = EXCLUDED.display_order;

INSERT INTO property_types (code, parent_code, label, description, icon, display_order, is_active) VALUES
('land', 
 NULL,
 '{"fr": "Terrain", "en": "Land"}',
 '{"fr": "Terrain constructible ou non constructible", "en": "Buildable or non-buildable land"}',
 'map-pin',
 4, TRUE)
ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label, description = EXCLUDED.description, icon = EXCLUDED.icon, display_order = EXCLUDED.display_order;

INSERT INTO property_types (code, parent_code, label, description, icon, display_order, is_active) VALUES
('commercial', 
 NULL,
 '{"fr": "Local Commercial", "en": "Commercial"}',
 '{"fr": "Local commercial ou bureau", "en": "Commercial space or office"}',
 'briefcase',
 5, TRUE)
ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label, description = EXCLUDED.description, icon = EXCLUDED.icon, display_order = EXCLUDED.display_order;

INSERT INTO property_types (code, parent_code, label, description, icon, display_order, is_active) VALUES
('other', 
 NULL,
 '{"fr": "Autre", "en": "Other"}',
 '{"fr": "Autre type de propriété", "en": "Other type of property"}',
 'help-circle',
 6, TRUE)
ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label, description = EXCLUDED.description, icon = EXCLUDED.icon, display_order = EXCLUDED.display_order;

-- Property Types (Subtypes for Commercial)
INSERT INTO property_types (code, parent_code, label, description, icon, display_order, is_active) VALUES
('commercial_office', 
 'commercial',
 '{"fr": "Bureau", "en": "Office"}',
 '{"fr": "Espace de bureau", "en": "Office space"}',
 'briefcase',
 1, TRUE)
ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label, description = EXCLUDED.description, icon = EXCLUDED.icon, display_order = EXCLUDED.display_order;

INSERT INTO property_types (code, parent_code, label, description, icon, display_order, is_active) VALUES
('commercial_retail', 
 'commercial',
 '{"fr": "Commerce de Détail", "en": "Retail"}',
 '{"fr": "Magasin ou boutique", "en": "Store or shop"}',
 'shopping-bag',
 2, TRUE)
ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label, description = EXCLUDED.description, icon = EXCLUDED.icon, display_order = EXCLUDED.display_order;

INSERT INTO property_types (code, parent_code, label, description, icon, display_order, is_active) VALUES
('commercial_warehouse', 
 'commercial',
 '{"fr": "Entrepôt", "en": "Warehouse"}',
 '{"fr": "Entrepôt ou espace de stockage", "en": "Warehouse or storage space"}',
 'warehouse',
 3, TRUE)
ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label, description = EXCLUDED.description, icon = EXCLUDED.icon, display_order = EXCLUDED.display_order;

INSERT INTO property_types (code, parent_code, label, description, icon, display_order, is_active) VALUES
('commercial_restaurant', 
 'commercial',
 '{"fr": "Restaurant", "en": "Restaurant"}',
 '{"fr": "Restaurant ou café", "en": "Restaurant or café"}',
 'utensils',
 4, TRUE)
ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label, description = EXCLUDED.description, icon = EXCLUDED.icon, display_order = EXCLUDED.display_order;

INSERT INTO property_types (code, parent_code, label, description, icon, display_order, is_active) VALUES
('commercial_hotel', 
 'commercial',
 '{"fr": "Hôtel", "en": "Hotel"}',
 '{"fr": "Hôtel ou établissement hôtelier", "en": "Hotel or hospitality establishment"}',
 'hotel',
 5, TRUE)
ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label, description = EXCLUDED.description, icon = EXCLUDED.icon, display_order = EXCLUDED.display_order;

-- Property Types (Subtypes for Land)
INSERT INTO property_types (code, parent_code, label, description, icon, display_order, is_active) VALUES
('land_residential', 
 'land',
 '{"fr": "Terrain Résidentiel", "en": "Residential Land"}',
 '{"fr": "Terrain constructible pour usage résidentiel", "en": "Buildable land for residential use"}',
 'map-pin',
 1, TRUE)
ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label, description = EXCLUDED.description, icon = EXCLUDED.icon, display_order = EXCLUDED.display_order;

INSERT INTO property_types (code, parent_code, label, description, icon, display_order, is_active) VALUES
('land_commercial', 
 'land',
 '{"fr": "Terrain Commercial", "en": "Commercial Land"}',
 '{"fr": "Terrain constructible pour usage commercial", "en": "Buildable land for commercial use"}',
 'briefcase',
 2, TRUE)
ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label, description = EXCLUDED.description, icon = EXCLUDED.icon, display_order = EXCLUDED.display_order;

INSERT INTO property_types (code, parent_code, label, description, icon, display_order, is_active) VALUES
('land_agricultural', 
 'land',
 '{"fr": "Terrain Agricole", "en": "Agricultural Land"}',
 '{"fr": "Terrain agricole ou rural", "en": "Agricultural or rural land"}',
 'tractor',
 3, TRUE)
ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label, description = EXCLUDED.description, icon = EXCLUDED.icon, display_order = EXCLUDED.display_order;

-- Flag Statuses
INSERT INTO flag_statuses (code, label, description, display_order, is_active) VALUES
('pending', 
 '{"fr": "En attente", "en": "Pending"}',
 '{"fr": "Signalement en attente de révision", "en": "Flag pending review"}',
 1, TRUE)
ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label, description = EXCLUDED.description, display_order = EXCLUDED.display_order;

INSERT INTO flag_statuses (code, label, description, display_order, is_active) VALUES
('reviewed', 
 '{"fr": "Révisé", "en": "Reviewed"}',
 '{"fr": "Signalement révisé par un modérateur", "en": "Flag reviewed by moderator"}',
 2, TRUE)
ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label, description = EXCLUDED.description, display_order = EXCLUDED.display_order;

INSERT INTO flag_statuses (code, label, description, display_order, is_active) VALUES
('resolved', 
 '{"fr": "Résolu", "en": "Resolved"}',
 '{"fr": "Signalement résolu et fermé", "en": "Flag resolved and closed"}',
 3, TRUE)
ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label, description = EXCLUDED.description, display_order = EXCLUDED.display_order;

-- Custom Field Types
INSERT INTO custom_field_types (code, label, description, validation_schema, display_order, is_active) VALUES
('text', 
 '{"fr": "Texte", "en": "Text"}',
 '{"fr": "Champ texte simple", "en": "Simple text field"}',
 '{"type": "string", "maxLength": 255}',
 1, TRUE)
ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label, description = EXCLUDED.description, validation_schema = EXCLUDED.validation_schema, display_order = EXCLUDED.display_order;

INSERT INTO custom_field_types (code, label, description, validation_schema, display_order, is_active) VALUES
('textarea', 
 '{"fr": "Zone de texte", "en": "Textarea"}',
 '{"fr": "Champ texte multiligne", "en": "Multiline text field"}',
 '{"type": "string"}',
 2, TRUE)
ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label, description = EXCLUDED.description, validation_schema = EXCLUDED.validation_schema, display_order = EXCLUDED.display_order;

INSERT INTO custom_field_types (code, label, description, validation_schema, display_order, is_active) VALUES
('number', 
 '{"fr": "Nombre", "en": "Number"}',
 '{"fr": "Champ numérique", "en": "Numeric field"}',
 '{"type": "number"}',
 3, TRUE)
ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label, description = EXCLUDED.description, validation_schema = EXCLUDED.validation_schema, display_order = EXCLUDED.display_order;

INSERT INTO custom_field_types (code, label, description, validation_schema, display_order, is_active) VALUES
('date', 
 '{"fr": "Date", "en": "Date"}',
 '{"fr": "Champ date", "en": "Date field"}',
 '{"type": "string", "format": "date"}',
 4, TRUE)
ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label, description = EXCLUDED.description, validation_schema = EXCLUDED.validation_schema, display_order = EXCLUDED.display_order;

INSERT INTO custom_field_types (code, label, description, validation_schema, display_order, is_active) VALUES
('datetime', 
 '{"fr": "Date et Heure", "en": "DateTime"}',
 '{"fr": "Champ date et heure", "en": "Date and time field"}',
 '{"type": "string", "format": "date-time"}',
 5, TRUE)
ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label, description = EXCLUDED.description, validation_schema = EXCLUDED.validation_schema, display_order = EXCLUDED.display_order;

INSERT INTO custom_field_types (code, label, description, validation_schema, display_order, is_active) VALUES
('boolean', 
 '{"fr": "Booléen", "en": "Boolean"}',
 '{"fr": "Champ oui/non", "en": "Yes/no field"}',
 '{"type": "boolean"}',
 6, TRUE)
ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label, description = EXCLUDED.description, validation_schema = EXCLUDED.validation_schema, display_order = EXCLUDED.display_order;

INSERT INTO custom_field_types (code, label, description, validation_schema, display_order, is_active) VALUES
('select', 
 '{"fr": "Sélection", "en": "Select"}',
 '{"fr": "Liste déroulante à choix unique", "en": "Single choice dropdown"}',
 '{"type": "string"}',
 7, TRUE)
ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label, description = EXCLUDED.description, validation_schema = EXCLUDED.validation_schema, display_order = EXCLUDED.display_order;

INSERT INTO custom_field_types (code, label, description, validation_schema, display_order, is_active) VALUES
('multiselect', 
 '{"fr": "Sélection Multiple", "en": "Multi-Select"}',
 '{"fr": "Liste à choix multiples", "en": "Multiple choice list"}',
 '{"type": "array", "items": {"type": "string"}}',
 8, TRUE)
ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label, description = EXCLUDED.description, validation_schema = EXCLUDED.validation_schema, display_order = EXCLUDED.display_order;

INSERT INTO custom_field_types (code, label, description, validation_schema, display_order, is_active) VALUES
('url', 
 '{"fr": "URL", "en": "URL"}',
 '{"fr": "Champ URL", "en": "URL field"}',
 '{"type": "string", "format": "uri"}',
 9, TRUE)
ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label, description = EXCLUDED.description, validation_schema = EXCLUDED.validation_schema, display_order = EXCLUDED.display_order;

INSERT INTO custom_field_types (code, label, description, validation_schema, display_order, is_active) VALUES
('email', 
 '{"fr": "Email", "en": "Email"}',
 '{"fr": "Champ email", "en": "Email field"}',
 '{"type": "string", "format": "email"}',
 10, TRUE)
ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label, description = EXCLUDED.description, validation_schema = EXCLUDED.validation_schema, display_order = EXCLUDED.display_order;

-- Import Statuses
INSERT INTO import_statuses (code, label, description, display_order, is_active) VALUES
('processing', 
 '{"fr": "En cours", "en": "Processing"}',
 '{"fr": "Import en cours de traitement", "en": "Import being processed"}',
 1, TRUE)
ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label, description = EXCLUDED.description, display_order = EXCLUDED.display_order;

INSERT INTO import_statuses (code, label, description, display_order, is_active) VALUES
('completed', 
 '{"fr": "Terminé", "en": "Completed"}',
 '{"fr": "Import terminé avec succès", "en": "Import completed successfully"}',
 2, TRUE)
ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label, description = EXCLUDED.description, display_order = EXCLUDED.display_order;

INSERT INTO import_statuses (code, label, description, display_order, is_active) VALUES
('failed', 
 '{"fr": "Échoué", "en": "Failed"}',
 '{"fr": "Import échoué", "en": "Import failed"}',
 3, TRUE)
ON CONFLICT (code) DO UPDATE SET label = EXCLUDED.label, description = EXCLUDED.description, display_order = EXCLUDED.display_order;

-- =====================================================
-- 4. SEED DATA - Main Tables
-- =====================================================

-- Insert Neighborhoods
INSERT INTO neighborhoods (id, slug, name, description, city, region, country, postal_code, center_latitude, center_longitude, stats, features, media_urls) VALUES
('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'marrakech-medina', 'Marrakech Médina', 
 '{"fr": "Le cœur historique de Marrakech avec ses souks animés et ses riads traditionnels", "en": "The historic heart of Marrakech with its bustling souks and traditional riads"}',
 'Marrakech', 'Marrakech-Safi', 'Morocco', '40000', 31.6295, -7.9811,
 '{"averagePrice": {"apartment": 250000, "house": 450000, "villa": 800000}, "propertyCount": 150, "averagePriceOverall": 500000, "medianPrice": 350000, "minPrice": 120000, "maxPrice": 1200000, "lastUpdated": "2024-01-15T10:00:00Z"}',
 '{"publicTransport": {"bus": true, "stations": ["Jemaa el-Fnaa", "Koutoubia"]}, "amenities": {"schools": 12, "hospitals": 3, "parks": 2, "shopping": true, "restaurants": true, "nightlife": true}, "type": "tourist", "safetyScore": 8, "qualityOfLife": 9}',
 '["https://example.com/images/neighborhoods/marrakech-medina-1.jpg", "https://example.com/images/neighborhoods/marrakech-medina-2.jpg"]')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO neighborhoods (id, slug, name, description, city, region, country, postal_code, center_latitude, center_longitude, stats, features, media_urls) VALUES
('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'casablanca-ain-diab', 'Casablanca Ain Diab',
 '{"fr": "Quartier résidentiel et commercial moderne avec vue sur l''océan Atlantique", "en": "Modern residential and commercial district with views of the Atlantic Ocean"}',
 'Casablanca', 'Casablanca-Settat', 'Morocco', '20000', 33.5731, -7.5898,
 '{"averagePrice": {"apartment": 1800000, "house": 3500000, "villa": 6000000}, "propertyCount": 85, "averagePriceOverall": 3764700, "medianPrice": 2500000, "minPrice": 800000, "maxPrice": 15000000, "lastUpdated": "2024-01-15T10:00:00Z"}',
 '{"publicTransport": {"tram": true, "bus": true, "stations": ["Ain Diab", "Corniche"]}, "amenities": {"schools": 8, "hospitals": 2, "parks": 3, "shopping": true, "restaurants": true, "beaches": true, "sports": true}, "type": "residential", "safetyScore": 9, "qualityOfLife": 9, "demographics": {"averageAge": 42, "population": 25000, "familyFriendly": true}}',
 '["https://example.com/images/neighborhoods/casablanca-ain-diab-1.jpg", "https://example.com/images/neighborhoods/casablanca-ain-diab-2.jpg"]')
ON CONFLICT (slug) DO NOTHING;

INSERT INTO neighborhoods (id, slug, name, description, city, region, country, postal_code, center_latitude, center_longitude, stats, features, media_urls) VALUES
('c3d4e5f6-a7b8-9012-cdef-123456789012', 'rabat-agdal', 'Rabat Agdal',
 '{"fr": "Quartier résidentiel calme et verdoyant proche du centre-ville", "en": "Quiet and green residential area close to the city center"}',
 'Rabat', 'Rabat-Salé-Kénitra', 'Morocco', '10000', 34.0209, -6.8416,
 '{"averagePrice": {"apartment": 1200000, "house": 2800000, "villa": 4500000}, "propertyCount": 120, "averagePriceOverall": 2833300, "medianPrice": 2000000, "minPrice": 600000, "maxPrice": 8000000, "lastUpdated": "2024-01-15T10:00:00Z"}',
 '{"publicTransport": {"tram": true, "bus": true, "train": true, "stations": ["Agdal", "Rabat-Ville"]}, "amenities": {"schools": 15, "hospitals": 4, "parks": 5, "shopping": true, "restaurants": true}, "type": "residential", "safetyScore": 9, "qualityOfLife": 9, "demographics": {"averageAge": 38, "population": 35000, "familyFriendly": true, "studentArea": true}}',
 '["https://example.com/images/neighborhoods/rabat-agdal-1.jpg"]')
ON CONFLICT (slug) DO NOTHING;

-- Insert Properties
INSERT INTO properties (id, internal_code, external_code, user_id, status_code, type_code, price, currency, latitude, longitude, street, postal_code, city, region, country, neighborhood_id, media_urls, created_at, updated_at, published_at) VALUES
('a1a2b3c4-d5e6-7890-abcd-ef1234567890', 'PROP-2024-000001', NULL, 'user-001', 'listed', 'apartment', 280000.00, 'EUR', 31.6295, -7.9811, 
 'Rue Riad Zitoun Lakdim', '40000', 'Marrakech', 'Marrakech-Safi', 'Morocco', 
 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
 '["https://example.com/images/properties/riad-marrakech-1.jpg", "https://example.com/images/properties/riad-marrakech-2.jpg", "https://example.com/images/properties/riad-marrakech-3.jpg"]',
 '2024-01-10 10:00:00', '2024-01-15 14:30:00', '2024-01-12 09:00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO properties (id, internal_code, external_code, user_id, status_code, type_code, price, currency, latitude, longitude, street, postal_code, city, region, country, neighborhood_id, media_urls, created_at, updated_at, published_at) VALUES
('a2b3c4d5-e6f7-8901-bcde-f12345678901', 'PROP-2024-000002', NULL, 'user-001', 'listed', 'villa', 850000.00, 'EUR', 33.5731, -7.5898,
 'Boulevard de la Corniche', '20000', 'Casablanca', 'Casablanca-Settat', 'Morocco',
 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
 '["https://example.com/images/properties/villa-casablanca-1.jpg", "https://example.com/images/properties/villa-casablanca-2.jpg", "https://example.com/images/properties/villa-casablanca-3.jpg", "https://example.com/images/properties/villa-casablanca-4.jpg"]',
 '2024-01-08 08:00:00', '2024-01-14 16:20:00', '2024-01-10 10:00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO properties (id, internal_code, external_code, user_id, status_code, type_code, price, currency, latitude, longitude, street, postal_code, city, region, country, neighborhood_id, media_urls, created_at, updated_at, published_at) VALUES
('a3c4d5e6-f7a8-9012-cdef-123456789012', 'PROP-2024-000003', NULL, 'user-002', 'listed', 'house', 420000.00, 'EUR', 34.0209, -6.8416,
 'Avenue Allal Ben Abdellah', '10000', 'Rabat', 'Rabat-Salé-Kénitra', 'Morocco',
 'c3d4e5f6-a7b8-9012-cdef-123456789012',
 '["https://example.com/images/properties/house-rabat-1.jpg", "https://example.com/images/properties/house-rabat-2.jpg"]',
 '2024-01-12 12:00:00', '2024-01-16 11:15:00', '2024-01-13 08:30:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO properties (id, internal_code, external_code, user_id, status_code, type_code, price, currency, latitude, longitude, street, postal_code, city, region, country, neighborhood_id, media_urls, created_at, updated_at) VALUES
('a4d5e6f7-a8b9-0123-def0-123456789013', 'PROP-2024-000004', NULL, 'user-002', 'draft', 'apartment', 195000.00, 'EUR', 31.6295, -7.9811,
 'Derb Dabachi', '40000', 'Marrakech', 'Marrakech-Safi', 'Morocco',
 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
 '["https://example.com/images/properties/apartment-marrakech-1.jpg"]',
 '2024-01-15 09:00:00', '2024-01-15 09:00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO properties (id, internal_code, external_code, user_id, status_code, type_code, price, currency, latitude, longitude, street, postal_code, city, region, country, neighborhood_id, media_urls, created_at, updated_at, published_at) VALUES
('a5e6f7a8-b9c0-1234-ef01-123456789014', 'PROP-2024-000005', NULL, 'user-003', 'listed', 'commercial_retail', 1200000.00, 'EUR', 33.5731, -7.5898,
 'Avenue Mohammed V', '20000', 'Casablanca', 'Casablanca-Settat', 'Morocco',
 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
 '["https://example.com/images/properties/commercial-casablanca-1.jpg", "https://example.com/images/properties/commercial-casablanca-2.jpg"]',
 '2024-01-11 10:30:00', '2024-01-15 13:45:00', '2024-01-12 10:00:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO properties (id, internal_code, external_code, user_id, status_code, type_code, price, currency, latitude, longitude, street, postal_code, city, region, country, neighborhood_id, media_urls, created_at, updated_at, published_at) VALUES
('a6f7a8b9-c0d1-2345-f012-123456789015', 'PROP-2024-000006', NULL, 'user-001', 'listed', 'land_residential', 150000.00, 'EUR', 34.0209, -6.8416,
 'Route de Témara', '10000', 'Rabat', 'Rabat-Salé-Kénitra', 'Morocco',
 'c3d4e5f6-a7b8-9012-cdef-123456789012',
 NULL,
 '2024-01-09 14:00:00', '2024-01-13 10:20:00', '2024-01-10 11:00:00')
ON CONFLICT (id) DO NOTHING;

-- Insert Property Translations
INSERT INTO property_translations (id, property_id, language, title, description, notes, meta_title, meta_description) VALUES
('b1a2b3c4-d5e6-7890-abcd-ef1234567890', 'a1a2b3c4-d5e6-7890-abcd-ef1234567890', 'fr',
 'Riad Traditionnel dans la Médina de Marrakech',
 'Magnifique riad traditionnel restauré avec cour intérieure, 3 chambres, 2 salles de bain, terrasse avec vue sur les toits de la médina. Idéal pour investissement locatif ou résidence secondaire.',
 'Propriété authentique dans le cœur historique de Marrakech. Accès facile aux souks et sites touristiques.',
 'Riad Traditionnel Marrakech Médina - 280 000 €',
 'Riad traditionnel restauré dans la médina de Marrakech. 3 chambres, terrasse avec vue. Parfait pour investissement ou résidence secondaire.')
ON CONFLICT (property_id, language) DO NOTHING;

INSERT INTO property_translations (id, property_id, language, title, description, notes, meta_title, meta_description) VALUES
('b1a2b3c5-d5e6-7890-abcd-ef1234567890', 'a1a2b3c4-d5e6-7890-abcd-ef1234567890', 'en',
 'Traditional Riad in Marrakech Medina',
 'Beautiful restored traditional riad with inner courtyard, 3 bedrooms, 2 bathrooms, terrace with views over the medina rooftops. Ideal for rental investment or second home.',
 'Authentic property in the historic heart of Marrakech. Easy access to souks and tourist sites.',
 'Traditional Riad Marrakech Medina - €280,000',
 'Restored traditional riad in Marrakech medina. 3 bedrooms, terrace with views. Perfect for investment or second home.')
ON CONFLICT (property_id, language) DO NOTHING;

INSERT INTO property_translations (id, property_id, language, title, description, notes, meta_title, meta_description) VALUES
('b2b3c4d5-e6f7-8901-bcde-f12345678901', 'a2b3c4d5-e6f7-8901-bcde-f12345678901', 'fr',
 'Villa Moderne avec Vue sur Mer à Casablanca',
 'Superbe villa moderne de 350m² avec jardin paysager, piscine, 5 chambres, 4 salles de bain, garage double. Située dans le quartier résidentiel d''Ain Diab avec vue imprenable sur l''océan Atlantique.',
 'Villa de prestige dans un quartier sécurisé. Proche des écoles internationales et des plages.',
 'Villa Moderne Casablanca Ain Diab - 850 000 €',
 'Villa moderne 350m² avec piscine et vue sur mer à Casablanca. 5 chambres, jardin paysager. Quartier Ain Diab.')
ON CONFLICT (property_id, language) DO NOTHING;

INSERT INTO property_translations (id, property_id, language, title, description, notes, meta_title, meta_description) VALUES
('b2b3c4d6-e6f7-8901-bcde-f12345678901', 'a2b3c4d5-e6f7-8901-bcde-f12345678901', 'en',
 'Modern Villa with Sea View in Casablanca',
 'Beautiful modern villa of 350m² with landscaped garden, swimming pool, 5 bedrooms, 4 bathrooms, double garage. Located in the residential district of Ain Diab with stunning views of the Atlantic Ocean.',
 'Prestige villa in a secure neighborhood. Close to international schools and beaches.',
 'Modern Villa Casablanca Ain Diab - €850,000',
 'Modern 350m² villa with pool and sea view in Casablanca. 5 bedrooms, landscaped garden. Ain Diab district.')
ON CONFLICT (property_id, language) DO NOTHING;

INSERT INTO property_translations (id, property_id, language, title, description, notes, meta_title, meta_description) VALUES
('b3c4d5e6-f7a8-9012-cdef-123456789012', 'a3c4d5e6-f7a8-9012-cdef-123456789012', 'fr',
 'Maison Familiale à Rabat Agdal',
 'Charmante maison de 180m² avec jardin, 4 chambres, 2 salles de bain, salon spacieux, cuisine équipée. Quartier calme et résidentiel, proche des écoles et commerces.',
 'Maison idéale pour une famille. Proche du centre-ville et des transports en commun.',
 'Maison Familiale Rabat Agdal - 420 000 €',
 'Maison 180m² avec jardin à Rabat Agdal. 4 chambres, quartier calme et résidentiel.')
ON CONFLICT (property_id, language) DO NOTHING;

INSERT INTO property_translations (id, property_id, language, title, description, notes, meta_title, meta_description) VALUES
('b3c4d5e7-f7a8-9012-cdef-123456789012', 'a3c4d5e6-f7a8-9012-cdef-123456789012', 'en',
 'Family House in Rabat Agdal',
 'Charming 180m² house with garden, 4 bedrooms, 2 bathrooms, spacious living room, fitted kitchen. Quiet residential neighborhood, close to schools and shops.',
 'Ideal house for a family. Close to city center and public transport.',
 'Family House Rabat Agdal - €420,000',
 '180m² house with garden in Rabat Agdal. 4 bedrooms, quiet residential neighborhood.')
ON CONFLICT (property_id, language) DO NOTHING;

INSERT INTO property_translations (id, property_id, language, title, description, notes, meta_title, meta_description) VALUES
('b4d5e6f7-a8b9-0123-def0-123456789013', 'a4d5e6f7-a8b9-0123-def0-123456789013', 'fr',
 'Appartement Moderne Marrakech',
 'Appartement moderne de 85m², 2 chambres, 1 salle de bain, balcon, situé dans la médina. En cours de rénovation.',
 'Projet en cours. Rénovation prévue pour fin 2024.',
 'Appartement Moderne Marrakech - 195 000 €',
 'Appartement 85m² en rénovation dans la médina de Marrakech. 2 chambres.')
ON CONFLICT (property_id, language) DO NOTHING;

INSERT INTO property_translations (id, property_id, language, title, description, notes, meta_title, meta_description) VALUES
('b5e6f7a8-b9c0-1234-ef01-123456789014', 'a5e6f7a8-b9c0-1234-ef01-123456789014', 'fr',
 'Local Commercial Centre-Ville Casablanca',
 'Local commercial de 200m² idéal pour commerce de détail ou bureau. Situé avenue Mohammed V, emplacement stratégique avec forte affluence. Licence commerciale incluse.',
 'Excellent emplacement pour commerce. Forte visibilité et passage.',
 'Local Commercial Casablanca - 1 200 000 €',
 'Local commercial 200m² avenue Mohammed V à Casablanca. Emplacement stratégique, licence incluse.')
ON CONFLICT (property_id, language) DO NOTHING;

INSERT INTO property_translations (id, property_id, language, title, description, notes, meta_title, meta_description) VALUES
('b6f7a8b9-c0d1-2345-f012-123456789015', 'a6f7a8b9-c0d1-2345-f012-123456789015', 'fr',
 'Terrain Constructible Rabat',
 'Terrain constructible de 500m², zone résidentielle, permis de construire possible. Vue dégagée, accès facile.',
 'Terrain idéal pour construction de villa individuelle.',
 'Terrain Constructible Rabat - 150 000 €',
 'Terrain constructible 500m² à Rabat. Zone résidentielle, permis de construire possible.')
ON CONFLICT (property_id, language) DO NOTHING;

-- Insert Property Details (same as before)
INSERT INTO property_details (id, property_id, surface_area, land_area, bedrooms, bathrooms, total_rooms, has_garage, garage_spaces, has_parking, parking_spaces, has_elevator, has_balcony, has_terrace, has_garden, has_pool, has_fireplace, has_air_conditioning, has_heating, floor_number, total_floors, has_storage, construction_year, renovation_year, energy_class, energy_consumption, greenhouse_gas_emissions, amenities, features) VALUES
('c1a2b3c4-d5e6-7890-abcd-ef1234567890', 'a1a2b3c4-d5e6-7890-abcd-ef1234567890', 180.00, NULL, 3, 2, 5, FALSE, NULL, FALSE, NULL, FALSE, FALSE, TRUE, FALSE, FALSE, TRUE, TRUE, TRUE, NULL, 2, TRUE, 1950, 2020, 'C', 120.50, 15.30, 
 '["wifi", "security", "traditional_architecture"]',
 '{"courtyard": true, "rooftop_terrace": true, "traditional_tiles": true}')
ON CONFLICT (property_id) DO NOTHING;

INSERT INTO property_details (id, property_id, surface_area, land_area, bedrooms, bathrooms, total_rooms, has_garage, garage_spaces, has_parking, parking_spaces, has_elevator, has_balcony, has_terrace, has_garden, has_pool, has_fireplace, has_air_conditioning, has_heating, floor_number, total_floors, has_storage, construction_year, renovation_year, energy_class, energy_consumption, greenhouse_gas_emissions, amenities, features) VALUES
('c2b3c4d5-e6f7-8901-bcde-f12345678901', 'a2b3c4d5-e6f7-8901-bcde-f12345678901', 350.00, 800.00, 5, 4, 8, TRUE, 2, TRUE, 4, FALSE, TRUE, TRUE, TRUE, TRUE, FALSE, TRUE, TRUE, NULL, 2, TRUE, 2015, NULL, 'B', 85.20, 8.50,
 '["wifi", "security", "alarm", "video_surveillance", "home_automation"]',
 '{"sea_view": true, "beach_access": true, "landscaped_garden": true, "pool_heating": true}')
ON CONFLICT (property_id) DO NOTHING;

INSERT INTO property_details (id, property_id, surface_area, land_area, bedrooms, bathrooms, total_rooms, has_garage, garage_spaces, has_parking, parking_spaces, has_elevator, has_balcony, has_terrace, has_garden, has_pool, has_fireplace, has_air_conditioning, has_heating, floor_number, total_floors, has_storage, construction_year, renovation_year, energy_class, energy_consumption, greenhouse_gas_emissions, amenities, features) VALUES
('c3c4d5e6-f7a8-9012-cdef-123456789012', 'a3c4d5e6-f7a8-9012-cdef-123456789012', 180.00, 300.00, 4, 2, 6, TRUE, 1, TRUE, 2, FALSE, FALSE, FALSE, TRUE, FALSE, FALSE, TRUE, TRUE, NULL, 1, FALSE, 2005, 2018, 'C', 110.00, 12.80,
 '["wifi", "security"]',
 '{"garden_size": 300, "quiet_neighborhood": true}')
ON CONFLICT (property_id) DO NOTHING;

INSERT INTO property_details (id, property_id, surface_area, land_area, bedrooms, bathrooms, total_rooms, has_garage, garage_spaces, has_parking, parking_spaces, has_elevator, has_balcony, has_terrace, has_garden, has_pool, has_fireplace, has_air_conditioning, has_heating, floor_number, total_floors, has_storage, construction_year, renovation_year, energy_class, energy_consumption, greenhouse_gas_emissions, amenities, features) VALUES
('c4d5e6f7-a8b9-0123-def0-123456789013', 'a4d5e6f7-a8b9-0123-def0-123456789013', 85.00, NULL, 2, 1, 3, FALSE, NULL, FALSE, NULL, FALSE, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, TRUE, 2, 3, FALSE, 1980, NULL, 'D', 150.00, 20.00,
 NULL,
 '{"renovation_planned": true, "renovation_budget": 50000}')
ON CONFLICT (property_id) DO NOTHING;

INSERT INTO property_details (id, property_id, surface_area, land_area, bedrooms, bathrooms, total_rooms, has_garage, garage_spaces, has_parking, parking_spaces, has_elevator, has_balcony, has_terrace, has_garden, has_pool, has_fireplace, has_air_conditioning, has_heating, floor_number, total_floors, has_storage, construction_year, renovation_year, energy_class, energy_consumption, greenhouse_gas_emissions, commercial_type, business_license, max_capacity, amenities, features) VALUES
('c5e6f7a8-b9c0-1234-ef01-123456789014', 'a5e6f7a8-b9c0-1234-ef01-123456789014', 200.00, NULL, NULL, 2, NULL, FALSE, NULL, TRUE, 3, TRUE, FALSE, FALSE, FALSE, FALSE, FALSE, TRUE, TRUE, 1, 5, TRUE, 1990, 2010, NULL, NULL, NULL,
 'Retail', TRUE, 50,
 '["wifi", "security", "air_conditioning"]',
 '{"storefront": true, "high_traffic": true, "display_windows": true}')
ON CONFLICT (property_id) DO NOTHING;

INSERT INTO property_details (id, property_id, surface_area, land_area, zoning, buildable, building_rights, amenities, features) VALUES
('c6f7a8b9-c0d1-2345-f012-123456789015', 'a6f7a8b9-c0d1-2345-f012-123456789015', NULL, 500.00,
 'Residential', TRUE, 300.00,
 NULL,
 '{"slope": "flat", "access_road": true, "utilities_available": true}')
ON CONFLICT (property_id) DO NOTHING;

-- Insert Property Favorites
INSERT INTO property_favorites (id, user_id, property_id, created_at) VALUES
('e1a2b3c4-d5e6-7890-abcd-ef1234567890', 'user-004', 'a1a2b3c4-d5e6-7890-abcd-ef1234567890', '2024-01-13 10:00:00'),
('e2b3c4d5-e6f7-8901-bcde-f12345678901', 'user-004', 'a2b3c4d5-e6f7-8901-bcde-f12345678901', '2024-01-14 15:30:00'),
('e3c4d5e6-f7a8-9012-cdef-123456789012', 'user-005', 'a1a2b3c4-d5e6-7890-abcd-ef1234567890', '2024-01-15 09:20:00'),
('e4d5e6f7-a8b9-0123-def0-123456789013', 'user-005', 'a3c4d5e6-f7a8-9012-cdef-123456789012', '2024-01-16 11:45:00')
ON CONFLICT (user_id, property_id) DO NOTHING;

-- Insert Property Flags
INSERT INTO property_flags (id, property_id, flagged_by, reason, status_code, reviewed_by, reviewed_at, moderation_action, moderation_notes, created_at, updated_at) VALUES
('f1a2b3c4-d5e6-7890-abcd-ef1234567890', 'a4d5e6f7-a8b9-0123-def0-123456789013', 'user-006',
 'Prix semble trop bas pour la zone. Vérification nécessaire.',
 'pending', NULL, NULL, NULL, NULL,
 '2024-01-15 16:00:00', '2024-01-15 16:00:00')
ON CONFLICT (id) DO NOTHING;

-- Insert Custom Field Definitions
INSERT INTO custom_field_definitions (id, organization_id, entity_type, field_key, label, field_type_code, required, default_value, validation_rules, options, reusable, reusable_entity_types, created_at, updated_at) VALUES
('c1a2b3c4-d5e6-7890-abcd-ef1234567890', NULL, 'property', 'swimming_pool_size',
 '{"fr": "Taille de la piscine", "en": "Swimming Pool Size"}',
 'select', FALSE, NULL, NULL,
 '["Small (< 20m²)", "Medium (20-40m²)", "Large (> 40m²)"]',
 FALSE, NULL,
 '2024-01-01 10:00:00', '2024-01-01 10:00:00')
ON CONFLICT (organization_id, entity_type, field_key) DO NOTHING;

INSERT INTO custom_field_definitions (id, organization_id, entity_type, field_key, label, field_type_code, required, default_value, validation_rules, options, reusable, reusable_entity_types, created_at, updated_at) VALUES
('c2b3c4d5-e6f7-8901-bcde-f12345678901', NULL, 'property', 'year_built',
 '{"fr": "Année de construction", "en": "Year Built"}',
 'number', FALSE, NULL,
 '{"min": 1800, "max": 2024}',
 NULL, FALSE, NULL,
 '2024-01-01 10:00:00', '2024-01-01 10:00:00')
ON CONFLICT (organization_id, entity_type, field_key) DO NOTHING;

INSERT INTO custom_field_definitions (id, organization_id, entity_type, field_key, label, field_type_code, required, default_value, validation_rules, options, reusable, reusable_entity_types, created_at, updated_at) VALUES
('c3c4d5e6-f7a8-9012-cdef-123456789012', NULL, 'property', 'proximity_to_beach',
 '{"fr": "Proximité de la plage", "en": "Proximity to Beach"}',
 'select', FALSE, NULL, NULL,
 '["On the beach", "Less than 100m", "100-500m", "500m-1km", "More than 1km"]',
 FALSE, NULL,
 '2024-01-01 10:00:00', '2024-01-01 10:00:00')
ON CONFLICT (organization_id, entity_type, field_key) DO NOTHING;

-- Insert Custom Field Values
INSERT INTO custom_field_values (id, organization_id, entity_type, entity_id, field_definition_id, value_text, value_number, value_date, value_boolean, value_json, created_at, updated_at) VALUES
('d1a2b3c4-d5e6-7890-abcd-ef1234567890', NULL, 'property', 'a2b3c4d5-e6f7-8901-bcde-f12345678901', 'c1a2b3c4-d5e6-7890-abcd-ef1234567890',
 NULL, NULL, NULL, NULL, '"Large (> 40m²)"',
 '2024-01-10 10:00:00', '2024-01-10 10:00:00')
ON CONFLICT (entity_type, entity_id, field_definition_id) DO NOTHING;

INSERT INTO custom_field_values (id, organization_id, entity_type, entity_id, field_definition_id, value_text, value_number, value_date, value_boolean, value_json, created_at, updated_at) VALUES
('d2b3c4d5-e6f7-8901-bcde-f12345678901', NULL, 'property', 'a2b3c4d5-e6f7-8901-bcde-f12345678901', 'c3c4d5e6-f7a8-9012-cdef-123456789012',
 NULL, NULL, NULL, NULL, '"On the beach"',
 '2024-01-10 10:00:00', '2024-01-10 10:00:00')
ON CONFLICT (entity_type, entity_id, field_definition_id) DO NOTHING;

INSERT INTO custom_field_values (id, organization_id, entity_type, entity_id, field_definition_id, value_text, value_number, value_date, value_boolean, value_json, created_at, updated_at) VALUES
('d3c4d5e6-f7a8-9012-cdef-123456789012', NULL, 'property', 'a3c4d5e6-f7a8-9012-cdef-123456789012', 'c2b3c4d5-e6f7-8901-bcde-f12345678901',
 NULL, 2005, NULL, NULL, NULL,
 '2024-01-12 12:00:00', '2024-01-12 12:00:00')
ON CONFLICT (entity_type, entity_id, field_definition_id) DO NOTHING;

-- Insert Import Jobs
INSERT INTO import_jobs (id, user_id, status_code, total_count, success_count, error_count, errors, file_name, notes, created_at, updated_at, completed_at) VALUES
('1a2b3c4d-e5f6-7890-abcd-ef1234567890', 'user-001', 'completed', 50, 48, 2,
 '[{"row": 12, "property": {"title": "Test Property"}, "errors": ["Invalid price format"]}, {"row": 35, "property": {"title": "Another Property"}, "errors": ["Missing required field: city"]}]',
 'properties_import_2024_01_15.csv',
 'Import initial des propriétés depuis fichier CSV',
 '2024-01-15 08:00:00', '2024-01-15 08:15:00', '2024-01-15 08:15:00')
ON CONFLICT (id) DO NOTHING;

INSERT INTO import_jobs (id, user_id, status_code, total_count, success_count, error_count, errors, file_name, notes, created_at, updated_at) VALUES
('2b3c4d5e-f6a7-8901-bcde-f12345678901', 'user-002', 'processing', 100, 0, 0,
 NULL,
 'bulk_properties_import_2024_01_16.csv',
 'Import en cours de 100 propriétés',
 '2024-01-16 10:00:00', '2024-01-16 10:00:00')
ON CONFLICT (id) DO NOTHING;

-- =====================================================
-- 5. COMMENTS
-- =====================================================

COMMENT ON TABLE property_statuses IS 'Statuts des propriétés (brouillon, publiée, etc.)';
COMMENT ON TABLE property_types IS 'Types de propriétés avec support des sous-types';
COMMENT ON TABLE flag_statuses IS 'Statuts des signalements';
COMMENT ON TABLE custom_field_types IS 'Types de champs personnalisés disponibles';
COMMENT ON TABLE import_statuses IS 'Statuts des jobs d''import';
COMMENT ON TABLE neighborhoods IS 'Quartiers avec leurs caractéristiques et statistiques';
COMMENT ON TABLE properties IS 'Propriétés immobilières avec leurs informations principales';
COMMENT ON COLUMN properties.internal_code IS 'Code interne généré automatiquement par le service lors de la création (format: PROP-YYYY-NNNNNN)';
COMMENT ON COLUMN properties.external_code IS 'Code externe optionnel pour référence externe (peut être NULL)';
COMMENT ON TABLE property_translations IS 'Traductions multilingues des propriétés';
COMMENT ON TABLE property_details IS 'Détails enrichis des propriétés selon leur type';
COMMENT ON TABLE property_flags IS 'Signalements de propriétés pour modération';
COMMENT ON TABLE property_favorites IS 'Favoris des utilisateurs pour les propriétés';
COMMENT ON TABLE custom_field_definitions IS 'Définitions de champs personnalisés réutilisables';
COMMENT ON TABLE custom_field_values IS 'Valeurs des champs personnalisés pour les entités';
COMMENT ON TABLE import_jobs IS 'Jobs d''import en masse de propriétés';
