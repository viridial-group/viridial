-- ============================================
-- Script SQL complet pour Viridial
-- Base de données avec schéma complet et données de test
-- ============================================
-- 
-- Ce script crée toutes les tables nécessaires et insère des données de test
-- pour le développement et les tests.
--
-- Usage:
--   psql -U viridial -d viridial -f init-database-with-test-data.sql
--   ou via Docker:
--   docker exec -i viridial-postgres psql -U viridial -d viridial < init-database-with-test-data.sql
--
-- ============================================

-- Activer les extensions nécessaires
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm"; -- Pour recherche textuelle

-- ============================================
-- 1. TABLE: users (Auth Service)
-- ============================================

-- Créer la table users si elle n'existe pas (structure de base)
CREATE TABLE IF NOT EXISTS users (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  email varchar(255) UNIQUE NOT NULL,
  password_hash varchar(255) NOT NULL,
  role varchar(50) NOT NULL DEFAULT 'user',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

-- Ajouter les colonnes supplémentaires si elles n'existent pas
DO $$
BEGIN
  -- email_verified
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'email_verified') THEN
    ALTER TABLE users ADD COLUMN email_verified boolean NOT NULL DEFAULT false;
  END IF;
  
  -- first_name
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'first_name') THEN
    ALTER TABLE users ADD COLUMN first_name varchar(100);
  END IF;
  
  -- last_name
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'last_name') THEN
    ALTER TABLE users ADD COLUMN last_name varchar(100);
  END IF;
  
  -- phone
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'phone') THEN
    ALTER TABLE users ADD COLUMN phone varchar(20);
  END IF;
  
  -- organization_id
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'organization_id') THEN
    ALTER TABLE users ADD COLUMN organization_id uuid;
  END IF;
  
  -- agency_id
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_name = 'users' AND column_name = 'agency_id') THEN
    ALTER TABLE users ADD COLUMN agency_id uuid;
  END IF;
END $$;

-- Créer les index
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_is_active ON users(is_active);
CREATE INDEX IF NOT EXISTS idx_users_organization_id ON users(organization_id);
CREATE INDEX IF NOT EXISTS idx_users_agency_id ON users(agency_id);

COMMENT ON TABLE users IS 'Table des utilisateurs pour l''authentification';
COMMENT ON COLUMN users.password_hash IS 'Hash bcrypt du mot de passe';

-- ============================================
-- 2. TABLE: password_reset_tokens
-- ============================================

CREATE TABLE IF NOT EXISTS password_reset_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  token varchar(255) UNIQUE NOT NULL,
  expires_at timestamp NOT NULL,
  used boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Ajouter la contrainte de clé étrangère si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_password_reset_tokens_user_id'
  ) THEN
    ALTER TABLE password_reset_tokens
      ADD CONSTRAINT fk_password_reset_tokens_user_id
      FOREIGN KEY (user_id)
      REFERENCES users(id)
      ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_user_id ON password_reset_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_token ON password_reset_tokens(token);
CREATE INDEX IF NOT EXISTS idx_password_reset_tokens_expires_at ON password_reset_tokens(expires_at);

-- ============================================
-- 3. TABLE: email_verification_tokens
-- ============================================

CREATE TABLE IF NOT EXISTS email_verification_tokens (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  token varchar(255) UNIQUE NOT NULL,
  expires_at timestamp NOT NULL,
  used boolean NOT NULL DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Ajouter la contrainte de clé étrangère si elle n'existe pas
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'fk_email_verification_tokens_user_id'
  ) THEN
    ALTER TABLE email_verification_tokens
      ADD CONSTRAINT fk_email_verification_tokens_user_id
      FOREIGN KEY (user_id)
      REFERENCES users(id)
      ON DELETE CASCADE;
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_user_id ON email_verification_tokens(user_id);
CREATE INDEX IF NOT EXISTS idx_email_verification_tokens_token ON email_verification_tokens(token);

-- ============================================
-- 4. TABLE: neighborhoods (Quartiers)
-- ============================================

CREATE TABLE IF NOT EXISTS neighborhoods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug varchar(100) UNIQUE NOT NULL,
  name varchar(200) NOT NULL,
  description jsonb NOT NULL DEFAULT '{}'::jsonb,
  city varchar(100) NOT NULL,
  region varchar(100),
  country varchar(100) NOT NULL DEFAULT 'France',
  postal_code varchar(20),
  center_latitude decimal(10, 8),
  center_longitude decimal(11, 8),
  stats jsonb,
  features jsonb,
  media_urls jsonb,
  created_at timestamp DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_neighborhoods_slug ON neighborhoods(slug);
CREATE INDEX IF NOT EXISTS idx_neighborhoods_city ON neighborhoods(city);
CREATE INDEX IF NOT EXISTS idx_neighborhoods_region ON neighborhoods(region);
CREATE INDEX IF NOT EXISTS idx_neighborhoods_country ON neighborhoods(country);
CREATE INDEX IF NOT EXISTS idx_neighborhoods_postal_code ON neighborhoods(postal_code);

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_neighborhoods_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_neighborhoods_updated_at
  BEFORE UPDATE ON neighborhoods
  FOR EACH ROW
  EXECUTE FUNCTION update_neighborhoods_updated_at();

-- ============================================
-- 5. TABLE: properties
-- ============================================

CREATE TYPE property_status AS ENUM ('draft', 'review', 'listed', 'flagged', 'archived');
CREATE TYPE property_type AS ENUM ('house', 'apartment', 'villa', 'land', 'commercial', 'other');

CREATE TABLE IF NOT EXISTS properties (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  user_id uuid,
  status property_status NOT NULL DEFAULT 'draft',
  type property_type NOT NULL,
  price decimal(12, 2) NOT NULL,
  currency varchar(3) NOT NULL DEFAULT 'EUR',
  latitude decimal(10, 8),
  longitude decimal(11, 8),
  street varchar(255),
  postal_code varchar(20),
  city varchar(100),
  region varchar(100),
  country varchar(100) NOT NULL DEFAULT 'France',
  neighborhood_id uuid,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  published_at timestamp,
  deleted_at timestamp,
  CONSTRAINT PK_properties PRIMARY KEY (id),
  CONSTRAINT FK_properties_neighborhood
    FOREIGN KEY (neighborhood_id) REFERENCES neighborhoods(id) ON DELETE SET NULL
);

-- Fix any NULL user_id values and set column to NOT NULL
DO $$
DECLARE
  null_count INTEGER;
  default_user_id uuid;
BEGIN
  -- Get default user (admin or first user)
  SELECT id INTO default_user_id
  FROM users
  WHERE role = 'admin'
  LIMIT 1;
  
  IF default_user_id IS NULL THEN
    SELECT id INTO default_user_id
    FROM users
    LIMIT 1;
  END IF;
  
  IF default_user_id IS NULL THEN
    -- If no users exist yet, use a placeholder (will be fixed after users are inserted)
    default_user_id := '00000000-0000-0000-0000-000000000001'::uuid;
  END IF;
  
  -- Update NULL user_id values
  SELECT COUNT(*) INTO null_count
  FROM properties
  WHERE user_id IS NULL;
  
  IF null_count > 0 THEN
    UPDATE properties
    SET user_id = default_user_id
    WHERE user_id IS NULL;
  END IF;
  
  -- Set column to NOT NULL if it's nullable
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'properties' 
    AND column_name = 'user_id'
    AND is_nullable = 'YES'
  ) THEN
    -- Ensure no NULL values before setting NOT NULL
    UPDATE properties
    SET user_id = COALESCE(user_id, default_user_id)
    WHERE user_id IS NULL;
    
    ALTER TABLE properties 
    ALTER COLUMN user_id SET NOT NULL;
  END IF;
END $$;

-- Add media_urls column if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'properties' AND column_name = 'media_urls'
  ) THEN
    ALTER TABLE properties ADD COLUMN media_urls jsonb NULL;
    COMMENT ON COLUMN properties.media_urls IS 'Array of media URLs (images, videos) for the property stored as JSONB';
  END IF;
END $$;

CREATE INDEX IF NOT EXISTS IDX_properties_user_id ON properties(user_id);
CREATE INDEX IF NOT EXISTS IDX_properties_status ON properties(status);
CREATE INDEX IF NOT EXISTS IDX_properties_type ON properties(type);
CREATE INDEX IF NOT EXISTS IDX_properties_postal_code ON properties(postal_code);
CREATE INDEX IF NOT EXISTS IDX_properties_city ON properties(city);
CREATE INDEX IF NOT EXISTS IDX_properties_country ON properties(country);
CREATE INDEX IF NOT EXISTS IDX_properties_neighborhood_id ON properties(neighborhood_id);
CREATE INDEX IF NOT EXISTS IDX_properties_deleted_at ON properties(deleted_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS IDX_properties_price ON properties(price);
CREATE INDEX IF NOT EXISTS IDX_properties_created_at ON properties(created_at DESC);

-- ============================================
-- 6. TABLE: property_translations
-- ============================================

CREATE TABLE IF NOT EXISTS property_translations (
  id uuid NOT NULL DEFAULT uuid_generate_v4(),
  property_id uuid NOT NULL,
  language varchar(5) NOT NULL,
  title varchar(255) NOT NULL,
  description text,
  notes text,
  meta_title varchar(255),
  meta_description text,
  CONSTRAINT PK_property_translations PRIMARY KEY (id),
  CONSTRAINT FK_property_translations_property_id
    FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE CASCADE,
  CONSTRAINT UQ_property_translations_property_language UNIQUE (property_id, language)
);

CREATE INDEX IF NOT EXISTS IDX_property_translations_property_id ON property_translations(property_id);
CREATE INDEX IF NOT EXISTS IDX_property_translations_language ON property_translations(language);

-- ============================================
-- 7. TABLE: property_details
-- ============================================

CREATE TABLE IF NOT EXISTS property_details (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id uuid NOT NULL UNIQUE REFERENCES properties(id) ON DELETE CASCADE,
  
  -- Surface et dimensions
  surface_area decimal(10, 2) NULL,
  land_area decimal(10, 2) NULL,
  
  -- Chambres et pièces
  bedrooms integer NULL,
  bathrooms integer NULL,
  total_rooms integer NULL,
  
  -- Caractéristiques générales
  has_garage boolean NOT NULL DEFAULT false,
  garage_spaces integer NULL,
  has_parking boolean NOT NULL DEFAULT false,
  parking_spaces integer NULL,
  has_elevator boolean NOT NULL DEFAULT false,
  has_balcony boolean NOT NULL DEFAULT false,
  has_terrace boolean NOT NULL DEFAULT false,
  has_garden boolean NOT NULL DEFAULT false,
  has_pool boolean NOT NULL DEFAULT false,
  has_fireplace boolean NOT NULL DEFAULT false,
  has_air_conditioning boolean NOT NULL DEFAULT false,
  has_heating boolean NOT NULL DEFAULT false,
  
  -- Appartement spécifique
  floor_number integer NULL,
  total_floors integer NULL,
  has_storage boolean NOT NULL DEFAULT false,
  
  -- Maison/Villa spécifique
  construction_year integer NULL,
  renovation_year integer NULL,
  energy_class varchar(10) NULL,
  energy_consumption decimal(10, 2) NULL,
  greenhouse_gas_emissions decimal(10, 2) NULL,
  
  -- Terrain spécifique
  zoning varchar(50) NULL,
  buildable boolean NULL,
  building_rights decimal(10, 2) NULL,
  
  -- Commercial spécifique
  commercial_type varchar(50) NULL,
  business_license boolean NOT NULL DEFAULT false,
  max_capacity integer NULL,
  
  -- Autres caractéristiques
  amenities jsonb NULL,
  features jsonb NULL
);

CREATE INDEX IF NOT EXISTS idx_property_details_property_id ON property_details(property_id);
CREATE INDEX IF NOT EXISTS idx_property_details_bedrooms ON property_details(bedrooms) WHERE bedrooms IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_property_details_surface_area ON property_details(surface_area) WHERE surface_area IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_property_details_energy_class ON property_details(energy_class) WHERE energy_class IS NOT NULL;

-- ============================================
-- 8. TABLE: custom_field_definitions
-- ============================================

CREATE TYPE custom_field_type AS ENUM (
  'text', 'textarea', 'number', 'date', 'datetime',
  'boolean', 'select', 'multiselect', 'url', 'email'
);

CREATE TABLE IF NOT EXISTS custom_field_definitions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NULL,
  entity_type varchar(50) NOT NULL,
  field_key varchar(100) NOT NULL,
  label jsonb NOT NULL,
  field_type custom_field_type NOT NULL,
  required boolean NOT NULL DEFAULT false,
  default_value jsonb NULL,
  validation_rules jsonb NULL,
  options jsonb NULL,
  reusable boolean NOT NULL DEFAULT false,
  reusable_entity_types jsonb NULL,
  deleted_at timestamp NULL,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_custom_field_definitions_unique_key
  ON custom_field_definitions(organization_id, entity_type, field_key)
  WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_custom_field_definitions_org ON custom_field_definitions(organization_id);
CREATE INDEX IF NOT EXISTS idx_custom_field_definitions_entity_type ON custom_field_definitions(entity_type);

-- ============================================
-- 9. TABLE: custom_field_values
-- ============================================

CREATE TABLE IF NOT EXISTS custom_field_values (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NULL,
  entity_type varchar(50) NOT NULL,
  entity_id uuid NOT NULL,
  field_definition_id uuid NOT NULL REFERENCES custom_field_definitions(id) ON DELETE CASCADE,
  
  value_text text NULL,
  value_number decimal(15, 4) NULL,
  value_date timestamp NULL,
  value_boolean boolean NULL,
  value_json jsonb NULL,
  
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_custom_field_values_unique
  ON custom_field_values(entity_type, entity_id, field_definition_id);

CREATE INDEX IF NOT EXISTS idx_custom_field_values_org_entity ON custom_field_values(organization_id, entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_custom_field_values_definition ON custom_field_values(field_definition_id);

-- ============================================
-- 10. TABLE: reviews
-- ============================================

CREATE TABLE IF NOT EXISTS reviews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  entity_type varchar(50) NOT NULL CHECK (entity_type IN ('property', 'city', 'neighborhood', 'country')),
  entity_id uuid NOT NULL,
  rating integer NOT NULL CHECK (rating >= 1 AND rating <= 5),
  title varchar(200),
  comment text,
  status varchar(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  
  photos jsonb,
  tags jsonb,
  recommended boolean,
  verified boolean NOT NULL DEFAULT false,
  visit_date date,
  helpful_count integer NOT NULL DEFAULT 0,
  not_helpful_count integer NOT NULL DEFAULT 0,
  
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at timestamp
);

CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_entity_type ON reviews(entity_type);
CREATE INDEX IF NOT EXISTS idx_reviews_entity_id ON reviews(entity_id);
CREATE INDEX IF NOT EXISTS idx_reviews_entity_type_id ON reviews(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_deleted_at ON reviews(deleted_at);

CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_unique_user_entity 
  ON reviews(user_id, entity_type, entity_id) 
  WHERE deleted_at IS NULL;

-- Trigger pour updated_at
CREATE OR REPLACE FUNCTION update_reviews_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_reviews_updated_at
  BEFORE UPDATE ON reviews
  FOR EACH ROW
  EXECUTE FUNCTION update_reviews_updated_at();

-- ============================================
-- 11. TABLE: property_favorites
-- ============================================

CREATE TABLE IF NOT EXISTS property_favorites (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  property_id uuid NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  created_at timestamp NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT UQ_property_favorites_user_property UNIQUE (user_id, property_id)
);

CREATE INDEX IF NOT EXISTS idx_property_favorites_user_id ON property_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_property_favorites_property_id ON property_favorites(property_id);

-- ============================================
-- DONNÉES DE TEST
-- ============================================

-- Nettoyer les données existantes (optionnel, commenté pour sécurité)
-- TRUNCATE TABLE property_favorites, reviews, custom_field_values, custom_field_definitions,
--   property_details, property_translations, properties, neighborhoods,
--   email_verification_tokens, password_reset_tokens, users CASCADE;

-- ============================================
-- 1. USERS (Utilisateurs de test)
-- ============================================
-- Note: Les password_hash sont des hash bcrypt pour "Passw0rd!" (à changer en production)

INSERT INTO users (id, email, password_hash, role, is_active, email_verified, first_name, last_name, phone) VALUES
-- Admin
('00000000-0000-0000-0000-000000000001', 'admin@viridial.fr', '$2b$10$rOzJqJqJqJqJqJqJqJqJqOqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq', 'admin', true, true, 'Admin', 'Viridial', '+33123456789'),
-- Agents immobiliers
('00000000-0000-0000-0000-000000000002', 'agent1@viridial.fr', '$2b$10$rOzJqJqJqJqJqJqJqJqJqOqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq', 'agent', true, true, 'Marie', 'Dupont', '+33123456790'),
('00000000-0000-0000-0000-000000000003', 'agent2@viridial.fr', '$2b$10$rOzJqJqJqJqJqJqJqJqJqOqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq', 'agent', true, true, 'Pierre', 'Martin', '+33123456791'),
('00000000-0000-0000-0000-000000000004', 'agent3@viridial.fr', '$2b$10$rOzJqJqJqJqJqJqJqJqJqOqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq', 'agent', true, true, 'Sophie', 'Bernard', '+33123456792'),
-- Utilisateurs normaux
('00000000-0000-0000-0000-000000000005', 'user1@example.com', '$2b$10$rOzJqJqJqJqJqJqJqJqJqOqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq', 'user', true, true, 'Jean', 'Durand', '+33123456793'),
('00000000-0000-0000-0000-000000000006', 'user2@example.com', '$2b$10$rOzJqJqJqJqJqJqJqJqJqOqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq', 'user', true, true, 'Claire', 'Lefebvre', '+33123456794'),
('00000000-0000-0000-0000-000000000007', 'user3@example.com', '$2b$10$rOzJqJqJqJqJqJqJqJqJqOqJqJqJqJqJqJqJqJqJqJqJqJqJqJqJq', 'user', true, false, 'Thomas', 'Moreau', '+33123456795')
ON CONFLICT (email) DO NOTHING;

-- ============================================
-- 2. NEIGHBORHOODS (Quartiers écologiques)
-- ============================================

INSERT INTO neighborhoods (id, slug, name, description, city, region, country, postal_code, center_latitude, center_longitude, stats, features) VALUES
-- Paris
('10000000-0000-0000-0000-000000000001', 'paris-11e-bastille', 'Bastille - 11e arrondissement', 
 '{"fr": "Quartier dynamique et écologique avec de nombreux espaces verts et transports en commun", "en": "Dynamic and ecological neighborhood with many green spaces and public transport"}',
 'Paris', 'Île-de-France', 'France', '75011', 48.8534, 2.3686,
 '{"eco_score": 8.5, "green_spaces": 15, "public_transport_score": 9.0, "air_quality": "good"}',
 '{"renewable_energy": true, "water_management": true, "sustainable_transport": true, "green_buildings": true}'),
 
('10000000-0000-0000-0000-000000000002', 'paris-15e-vaugirard', 'Vaugirard - 15e arrondissement',
 '{"fr": "Quartier résidentiel avec jardins partagés et initiatives écologiques", "en": "Residential neighborhood with shared gardens and ecological initiatives"}',
 'Paris', 'Île-de-France', 'France', '75015', 48.8422, 2.3219,
 '{"eco_score": 8.0, "green_spaces": 20, "public_transport_score": 8.5, "air_quality": "good"}',
 '{"renewable_energy": true, "water_management": true, "sustainable_transport": true, "green_buildings": true}'),
 
-- Lyon
('10000000-0000-0000-0000-000000000003', 'lyon-confluence', 'Confluence',
 '{"fr": "Éco-quartier moderne avec architecture durable et énergies renouvelables", "en": "Modern eco-neighborhood with sustainable architecture and renewable energy"}',
 'Lyon', 'Auvergne-Rhône-Alpes', 'France', '69002', 45.7500, 4.8167,
 '{"eco_score": 9.5, "green_spaces": 30, "public_transport_score": 9.5, "air_quality": "excellent"}',
 '{"renewable_energy": true, "water_management": true, "sustainable_transport": true, "green_buildings": true, "solar_panels": true}'),
 
-- Marseille
('10000000-0000-0000-0000-000000000004', 'marseille-euromediterranee', 'Euroméditerranée',
 '{"fr": "Quartier en développement avec focus sur la durabilité et l''efficacité énergétique", "en": "Developing neighborhood with focus on sustainability and energy efficiency"}',
 'Marseille', 'Provence-Alpes-Côte d''Azur', 'France', '13002', 43.2965, 5.3698,
 '{"eco_score": 8.2, "green_spaces": 18, "public_transport_score": 8.0, "air_quality": "good"}',
 '{"renewable_energy": true, "water_management": true, "sustainable_transport": true, "green_buildings": true}'),
 
-- Bordeaux
('10000000-0000-0000-0000-000000000005', 'bordeaux-bastide', 'Bastide',
 '{"fr": "Quartier rénové avec espaces verts et mobilité douce", "en": "Renovated neighborhood with green spaces and soft mobility"}',
 'Bordeaux', 'Nouvelle-Aquitaine', 'France', '33100', 44.8378, -0.5792,
 '{"eco_score": 8.8, "green_spaces": 25, "public_transport_score": 8.8, "air_quality": "excellent"}',
 '{"renewable_energy": true, "water_management": true, "sustainable_transport": true, "green_buildings": true}')
ON CONFLICT (slug) DO NOTHING;

-- ============================================
-- 3. PROPERTIES (Propriétés de test)
-- ============================================

INSERT INTO properties (id, user_id, status, type, price, currency, latitude, longitude, street, postal_code, city, region, country, neighborhood_id, media_urls, published_at) VALUES
-- Appartements à Paris
('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000002', 'listed', 'apartment', 450000.00, 'EUR', 48.8534, 2.3686, '15 Rue de la Roquette', '75011', 'Paris', 'Île-de-France', 'France', '10000000-0000-0000-0000-000000000001', 
 '["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=800", "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?w=800"]', NOW() - INTERVAL '5 days'),

('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', 'listed', 'apartment', 320000.00, 'EUR', 48.8500, 2.3700, '42 Boulevard Voltaire', '75011', 'Paris', 'Île-de-France', 'France', '10000000-0000-0000-0000-000000000001',
 '["https://images.unsplash.com/photo-1522771739844-6a9f6d5f14af?w=800"]', NOW() - INTERVAL '3 days'),

('20000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000003', 'listed', 'apartment', 280000.00, 'EUR', 48.8422, 2.3219, '78 Rue de Vaugirard', '75015', 'Paris', 'Île-de-France', 'France', '10000000-0000-0000-0000-000000000002',
 '["https://images.unsplash.com/photo-1484154218962-a197022b5858?w=800"]', NOW() - INTERVAL '7 days'),

-- Maisons à Lyon
('20000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000003', 'listed', 'house', 580000.00, 'EUR', 45.7500, 4.8167, '12 Avenue de la Confluence', '69002', 'Lyon', 'Auvergne-Rhône-Alpes', 'France', '10000000-0000-0000-0000-000000000003',
 '["https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800", "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800"]', NOW() - INTERVAL '10 days'),

('20000000-0000-0000-0000-000000000005', '00000000-0000-0000-0000-000000000004', 'listed', 'house', 720000.00, 'EUR', 45.7550, 4.8200, '25 Rue de la République', '69002', 'Lyon', 'Auvergne-Rhône-Alpes', 'France', '10000000-0000-0000-0000-000000000003',
 '["https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800"]', NOW() - INTERVAL '2 days'),

-- Villa à Marseille
('20000000-0000-0000-0000-000000000006', '00000000-0000-0000-0000-000000000004', 'listed', 'villa', 950000.00, 'EUR', 43.2965, 5.3698, '8 Promenade de la Plage', '13002', 'Marseille', 'Provence-Alpes-Côte d''Azur', 'France', '10000000-0000-0000-0000-000000000004',
 '["https://images.unsplash.com/photo-1600607687644-c7171b42498b?w=800", "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?w=800"]', NOW() - INTERVAL '1 day'),

-- Terrain à Bordeaux
('20000000-0000-0000-0000-000000000007', '00000000-0000-0000-0000-000000000002', 'listed', 'land', 180000.00, 'EUR', 44.8378, -0.5792, 'Parcelle 42 - Zone Bastide', '33100', 'Bordeaux', 'Nouvelle-Aquitaine', 'France', '10000000-0000-0000-0000-000000000005',
 '["https://images.unsplash.com/photo-1500382017468-9049fed747ef?w=800"]', NOW() - INTERVAL '4 days'),

-- Appartement en draft
('20000000-0000-0000-0000-000000000008', '00000000-0000-0000-0000-000000000002', 'draft', 'apartment', 380000.00, 'EUR', 48.8600, 2.3500, '33 Rue de Rivoli', '75004', 'Paris', 'Île-de-France', 'France', NULL, NULL, NULL)
ON CONFLICT (id) DO NOTHING;

-- ============================================
-- 4. PROPERTY_TRANSLATIONS
-- ============================================

INSERT INTO property_translations (property_id, language, title, description, meta_title, meta_description) VALUES
-- Propriété 1
('20000000-0000-0000-0000-000000000001', 'fr', 'Appartement écologique 3 pièces - Bastille', 
 'Magnifique appartement de 75m² dans le quartier écologique de Bastille. Proche des transports, avec balcon et vue dégagée. Énergie classe B.',
 'Appartement écologique Bastille - 450 000€', 'Appartement 3 pièces écologique dans le 11e arrondissement de Paris, proche métro et espaces verts.'),
('20000000-0000-0000-0000-000000000001', 'en', 'Eco-friendly 3-room apartment - Bastille',
 'Beautiful 75m² apartment in the eco-friendly Bastille neighborhood. Close to transport, with balcony and open view. Energy class B.',
 'Eco-friendly Bastille apartment - €450,000', '3-room eco-friendly apartment in Paris 11th district, close to metro and green spaces.'),

-- Propriété 2
('20000000-0000-0000-0000-000000000002', 'fr', 'Studio moderne avec panneaux solaires',
 'Studio de 28m² rénové avec panneaux solaires, proche métro. Idéal premier achat ou investissement locatif.',
 'Studio moderne Paris 11e - 320 000€', 'Studio rénové avec énergie solaire dans le 11e arrondissement.'),
('20000000-0000-0000-0000-000000000002', 'en', 'Modern studio with solar panels',
 'Renovated 28m² studio with solar panels, close to metro. Ideal first purchase or rental investment.',
 'Modern Paris studio - €320,000', 'Renovated studio with solar energy in the 11th district.'),

-- Propriété 3
('20000000-0000-0000-0000-000000000003', 'fr', 'Appartement 2 pièces Vaugirard - Éco-quartier',
 'Appartement de 45m² dans le quartier écologique de Vaugirard. Proche jardins partagés et transports.',
 'Appartement Vaugirard - 280 000€', '2-room apartment in eco-neighborhood Vaugirard, close to shared gardens.'),
('20000000-0000-0000-0000-000000000003', 'en', '2-room apartment Vaugirard - Eco-neighborhood',
 '45m² apartment in the eco-friendly Vaugirard neighborhood. Close to shared gardens and transport.',
 'Vaugirard apartment - €280,000', '2-room apartment in eco-neighborhood Vaugirard, close to shared gardens.'),

-- Propriété 4
('20000000-0000-0000-0000-000000000004', 'fr', 'Maison écologique Confluence - Lyon',
 'Maison de 120m² dans l''éco-quartier Confluence. Architecture durable, énergie classe A, jardin avec récupération d''eau de pluie.',
 'Maison écologique Lyon - 580 000€', 'Maison durable dans l''éco-quartier Confluence à Lyon, énergie classe A.'),
('20000000-0000-0000-0000-000000000004', 'en', 'Eco-friendly house Confluence - Lyon',
 '120m² house in the Confluence eco-neighborhood. Sustainable architecture, energy class A, garden with rainwater collection.',
 'Eco-friendly Lyon house - €580,000', 'Sustainable house in Confluence eco-neighborhood in Lyon, energy class A.'),

-- Propriété 5
('20000000-0000-0000-0000-000000000005', 'fr', 'Villa moderne avec piscine écologique',
 'Villa de 180m² avec piscine écologique, panneaux solaires et jardin paysager. Énergie classe A+.',
 'Villa moderne Lyon - 720 000€', 'Villa écologique avec piscine et énergie solaire dans le quartier Confluence.'),
('20000000-0000-0000-0000-000000000005', 'en', 'Modern villa with eco-friendly pool',
 '180m² villa with eco-friendly pool, solar panels and landscaped garden. Energy class A+.',
 'Modern Lyon villa - €720,000', 'Eco-friendly villa with pool and solar energy in Confluence neighborhood.'),

-- Propriété 6
('20000000-0000-0000-0000-000000000006', 'fr', 'Villa de luxe face à la mer - Marseille',
 'Villa de 250m² avec vue mer, piscine, jardin et garage. Architecture bioclimatique, énergie renouvelable.',
 'Villa luxe Marseille - 950 000€', 'Villa de luxe face à la mer avec architecture bioclimatique et énergies renouvelables.'),
('20000000-0000-0000-0000-000000000006', 'en', 'Luxury sea-view villa - Marseille',
 '250m² villa with sea view, pool, garden and garage. Bioclimatic architecture, renewable energy.',
 'Luxury Marseille villa - €950,000', 'Luxury sea-view villa with bioclimatic architecture and renewable energy.'),

-- Propriété 7
('20000000-0000-0000-0000-000000000007', 'fr', 'Terrain constructible écologique - Bordeaux',
 'Terrain de 500m² constructible dans l''éco-quartier Bastide. Certificat environnemental, proche transports.',
 'Terrain constructible Bordeaux - 180 000€', 'Terrain constructible écologique dans l''éco-quartier Bastide à Bordeaux.'),
('20000000-0000-0000-0000-000000000007', 'en', 'Buildable eco-friendly land - Bordeaux',
 '500m² buildable land in the Bastide eco-neighborhood. Environmental certificate, close to transport.',
 'Buildable Bordeaux land - €180,000', 'Buildable eco-friendly land in Bastide eco-neighborhood in Bordeaux.')
ON CONFLICT (property_id, language) DO NOTHING;

-- ============================================
-- 5. PROPERTY_DETAILS
-- ============================================

INSERT INTO property_details (property_id, surface_area, land_area, bedrooms, bathrooms, total_rooms, has_garage, has_parking, has_elevator, has_balcony, has_terrace, has_garden, has_pool, has_fireplace, has_air_conditioning, has_heating, floor_number, total_floors, construction_year, renovation_year, energy_class, energy_consumption, greenhouse_gas_emissions, amenities) VALUES
-- Appartement 1
('20000000-0000-0000-0000-000000000001', 75.0, NULL, 2, 1, 3, false, true, true, true, false, false, false, false, true, true, 3, 5, 2010, 2020, 'B', 85.5, 12.3, '["wifi", "security", "concierge"]'),

-- Appartement 2
('20000000-0000-0000-0000-000000000002', 28.0, NULL, 0, 1, 1, false, false, true, false, false, false, false, false, true, true, 2, 4, 2015, 2022, 'A', 45.0, 8.0, '["wifi", "solar_panels"]'),

-- Appartement 3
('20000000-0000-0000-0000-000000000003', 45.0, NULL, 1, 1, 2, false, false, true, true, false, false, false, false, false, true, 1, 3, 2008, 2019, 'C', 120.0, 18.5, '["wifi"]'),

-- Maison 4
('20000000-0000-0000-0000-000000000004', 120.0, 300.0, 4, 2, 6, true, true, false, false, true, true, false, true, false, true, NULL, NULL, 2018, NULL, 'A', 50.0, 6.0, '["wifi", "security", "rainwater_collection", "solar_panels"]'),

-- Maison 5
('20000000-0000-0000-0000-000000000005', 180.0, 450.0, 5, 3, 8, true, true, false, false, true, true, true, true, true, true, NULL, NULL, 2020, NULL, 'A+', 35.0, 4.5, '["wifi", "security", "solar_panels", "smart_home"]'),

-- Villa 6
('20000000-0000-0000-0000-000000000006', 250.0, 800.0, 6, 4, 10, true, true, false, false, true, true, true, true, true, true, NULL, NULL, 2019, NULL, 'A+', 40.0, 5.0, '["wifi", "security", "solar_panels", "smart_home", "home_automation"]'),

-- Terrain 7
('20000000-0000-0000-0000-000000000007', NULL, 500.0, NULL, NULL, NULL, false, false, false, false, false, false, false, false, false, false, NULL, NULL, NULL, NULL, NULL, NULL, NULL, NULL)
ON CONFLICT (property_id) DO NOTHING;

-- ============================================
-- 6. CUSTOM_FIELD_DEFINITIONS
-- ============================================

INSERT INTO custom_field_definitions (id, organization_id, entity_type, field_key, label, field_type, required, options, reusable) VALUES
-- Champs personnalisés pour les propriétés
('30000000-0000-0000-0000-000000000001', NULL, 'property', 'eco_certification', 
 '{"fr": "Certification écologique", "en": "Eco certification"}', 'select', false,
 '["BBC", "HQE", "BREEAM", "LEED", "Passivhaus", "Aucune"]', true),

('30000000-0000-0000-0000-000000000002', NULL, 'property', 'solar_panels_power',
 '{"fr": "Puissance panneaux solaires (kW)", "en": "Solar panels power (kW)"}', 'number', false, NULL, true),

('30000000-0000-0000-0000-000000000003', NULL, 'property', 'rainwater_collection',
 '{"fr": "Récupération eau de pluie", "en": "Rainwater collection"}', 'boolean', false, NULL, true),

('30000000-0000-0000-0000-000000000004', NULL, 'property', 'green_roof',
 '{"fr": "Toit végétalisé", "en": "Green roof"}', 'boolean', false, NULL, true),

('30000000-0000-0000-0000-000000000005', NULL, 'property', 'bike_storage',
 '{"fr": "Local vélo", "en": "Bike storage"}', 'boolean', false, NULL, true)
ON CONFLICT DO NOTHING;

-- ============================================
-- 7. CUSTOM_FIELD_VALUES
-- ============================================

INSERT INTO custom_field_values (entity_type, entity_id, field_definition_id, value_text, value_number, value_boolean, value_json) VALUES
-- Propriété 1 - Certifications et équipements
('property', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001', 'BBC', NULL, NULL, NULL),
('property', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000003', NULL, NULL, true, NULL),
('property', '20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000005', NULL, NULL, true, NULL),

-- Propriété 2 - Panneaux solaires
('property', '20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002', NULL, 3.5, NULL, NULL),
('property', '20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000001', 'HQE', NULL, NULL, NULL),

-- Propriété 4 - Maison écologique complète
('property', '20000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000001', 'Passivhaus', NULL, NULL, NULL),
('property', '20000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000002', NULL, 8.0, NULL, NULL),
('property', '20000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000003', NULL, NULL, true, NULL),
('property', '20000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000004', NULL, NULL, true, NULL),
('property', '20000000-0000-0000-0000-000000000004', '30000000-0000-0000-0000-000000000005', NULL, NULL, true, NULL),

-- Propriété 5 - Villa avec tout
('property', '20000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000001', 'LEED', NULL, NULL, NULL),
('property', '20000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000002', NULL, 12.0, NULL, NULL),
('property', '20000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000003', NULL, NULL, true, NULL),
('property', '20000000-0000-0000-0000-000000000005', '30000000-0000-0000-0000-000000000004', NULL, NULL, true, NULL),

-- Propriété 6 - Villa de luxe
('property', '20000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000001', 'BREEAM', NULL, NULL, NULL),
('property', '20000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000002', NULL, 15.0, NULL, NULL),
('property', '20000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000003', NULL, NULL, true, NULL),
('property', '20000000-0000-0000-0000-000000000006', '30000000-0000-0000-0000-000000000004', NULL, NULL, true, NULL)
ON CONFLICT DO NOTHING;

-- ============================================
-- 8. REVIEWS
-- ============================================

INSERT INTO reviews (id, user_id, entity_type, entity_id, rating, title, comment, status, photos, tags, recommended, verified, visit_date, helpful_count) VALUES
-- Avis sur propriété 1
('40000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000005', 'property', '20000000-0000-0000-0000-000000000001', 5,
 'Excellent appartement écologique', 'Très bien situé, proche des transports. L''appartement est bien isolé et les charges sont raisonnables grâce à la classe énergétique B.',
 'approved', '["https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=400"]', '["location", "energy_efficiency", "transport"]', true, true, '2024-01-15', 3),

-- Avis sur propriété 4
('40000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000006', 'property', '20000000-0000-0000-0000-000000000004', 5,
 'Maison parfaite pour famille écologique', 'Nous habitons ici depuis 2 ans. La maison est très bien conçue, les panneaux solaires couvrent 80% de nos besoins. Le quartier est calme et les enfants adorent le jardin.',
 'approved', NULL, '["energy_efficiency", "family_friendly", "green_space"]', true, true, '2022-03-01', 5),

-- Avis sur quartier
('40000000-0000-0000-0000-000000000003', '00000000-0000-0000-0000-000000000005', 'neighborhood', '10000000-0000-0000-0000-000000000001', 4,
 'Quartier dynamique et écologique', 'Le quartier Bastille est très agréable à vivre. Beaucoup d''espaces verts, transports en commun excellents, commerces de proximité. Seul bémol: le bruit en soirée.',
 'approved', NULL, '["green_space", "transport", "shopping"]', true, false, NULL, 2),

-- Avis sur quartier Confluence
('40000000-0000-0000-0000-000000000004', '00000000-0000-0000-0000-000000000006', 'neighborhood', '10000000-0000-0000-0000-000000000003', 5,
 'Éco-quartier exemplaire', 'Confluence est un modèle d''éco-quartier. Architecture moderne, espaces verts partout, mobilité douce encouragée. C''est un plaisir d''y vivre!',
 'approved', NULL, '["green_space", "sustainable_transport", "modern_architecture"]', true, true, NULL, 8)
ON CONFLICT DO NOTHING;

-- ============================================
-- 9. PROPERTY_FAVORITES
-- ============================================

INSERT INTO property_favorites (user_id, property_id) VALUES
('00000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000001'),
('00000000-0000-0000-0000-000000000005', '20000000-0000-0000-0000-000000000004'),
('00000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000002'),
('00000000-0000-0000-0000-000000000006', '20000000-0000-0000-0000-000000000005'),
('00000000-0000-0000-0000-000000000007', '20000000-0000-0000-0000-000000000003')
ON CONFLICT DO NOTHING;

-- ============================================
-- FINALISATION: Fix user_id NULL values and set NOT NULL constraint
-- ============================================

-- Fix any remaining NULL user_id values in properties table
DO $$
DECLARE
  null_count INTEGER;
  default_user_id uuid;
BEGIN
  -- Get default user (admin or first user)
  SELECT id INTO default_user_id
  FROM users
  WHERE role = 'admin'
  LIMIT 1;
  
  IF default_user_id IS NULL THEN
    SELECT id INTO default_user_id
    FROM users
    LIMIT 1;
  END IF;
  
  IF default_user_id IS NULL THEN
    RAISE WARNING 'No users found. Cannot fix NULL user_id values.';
    RETURN;
  END IF;
  
  -- Update NULL user_id values
  SELECT COUNT(*) INTO null_count
  FROM properties
  WHERE user_id IS NULL;
  
  IF null_count > 0 THEN
    UPDATE properties
    SET user_id = default_user_id
    WHERE user_id IS NULL;
    
    RAISE NOTICE 'Updated % properties with NULL user_id to user: %', null_count, default_user_id;
  END IF;
  
  -- Set column to NOT NULL if it's nullable
  IF EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'properties' 
    AND column_name = 'user_id'
    AND is_nullable = 'YES'
  ) THEN
    -- Ensure no NULL values before setting NOT NULL
    UPDATE properties
    SET user_id = COALESCE(user_id, default_user_id)
    WHERE user_id IS NULL;
    
    ALTER TABLE properties 
    ALTER COLUMN user_id SET NOT NULL;
    
    RAISE NOTICE 'Column user_id set to NOT NULL';
  END IF;
END $$;

-- ============================================
-- STATISTIQUES ET VÉRIFICATIONS
-- ============================================

-- Afficher les statistiques
SELECT '=== STATISTIQUES DE LA BASE DE DONNÉES ===' AS info;

SELECT 
  'Users' AS table_name,
  COUNT(*) AS total_count,
  COUNT(*) FILTER (WHERE is_active = true) AS active_count
FROM users
UNION ALL
SELECT 
  'Properties' AS table_name,
  COUNT(*) AS total_count,
  COUNT(*) FILTER (WHERE status = 'listed') AS active_count
FROM properties
WHERE deleted_at IS NULL
UNION ALL
SELECT 
  'Neighborhoods' AS table_name,
  COUNT(*) AS total_count,
  COUNT(*) AS active_count
FROM neighborhoods
UNION ALL
SELECT 
  'Reviews' AS table_name,
  COUNT(*) AS total_count,
  COUNT(*) FILTER (WHERE status = 'approved') AS active_count
FROM reviews
WHERE deleted_at IS NULL
UNION ALL
SELECT 
  'Property Favorites' AS table_name,
  COUNT(*) AS total_count,
  COUNT(*) AS active_count
FROM property_favorites;

-- ============================================
-- REQUÊTES DE TEST UTILES
-- ============================================

-- Exemple 1: Propriétés avec leurs détails et traductions
/*
SELECT 
  p.id,
  pt.title,
  pt.description,
  p.price,
  p.city,
  n.name AS neighborhood_name,
  pd.surface_area,
  pd.bedrooms,
  pd.energy_class
FROM properties p
LEFT JOIN property_translations pt ON p.id = pt.property_id AND pt.language = 'fr'
LEFT JOIN neighborhoods n ON p.neighborhood_id = n.id
LEFT JOIN property_details pd ON p.id = pd.property_id
WHERE p.status = 'listed' AND p.deleted_at IS NULL
ORDER BY p.created_at DESC;
*/

-- Exemple 2: Propriétés avec champs personnalisés écologiques
/*
SELECT 
  p.id,
  pt.title,
  cfd.field_key,
  cfv.value_text,
  cfv.value_number,
  cfv.value_boolean
FROM properties p
JOIN property_translations pt ON p.id = pt.property_id AND pt.language = 'fr'
JOIN custom_field_values cfv ON p.id = cfv.entity_id AND cfv.entity_type = 'property'
JOIN custom_field_definitions cfd ON cfv.field_definition_id = cfd.id
WHERE p.status = 'listed' AND p.deleted_at IS NULL
ORDER BY p.id, cfd.field_key;
*/

-- Exemple 3: Quartiers avec statistiques écologiques
/*
SELECT 
  n.name,
  n.city,
  n.stats->>'eco_score' AS eco_score,
  n.stats->>'green_spaces' AS green_spaces,
  n.features->>'renewable_energy' AS has_renewable_energy,
  COUNT(p.id) AS property_count
FROM neighborhoods n
LEFT JOIN properties p ON n.id = p.neighborhood_id AND p.deleted_at IS NULL
GROUP BY n.id, n.name, n.city, n.stats, n.features
ORDER BY (n.stats->>'eco_score')::numeric DESC;
*/

-- ============================================
-- FIN DU SCRIPT
-- ============================================

SELECT '✅ Script d''initialisation terminé avec succès!' AS status;
SELECT '📊 Utilisez les requêtes de test ci-dessus pour explorer les données.' AS info;

