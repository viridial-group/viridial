-- Migration: Create property_details table for enriched property fields
-- Date: 2026-01-08
-- Related to: US-007 - Property enrichment by type

CREATE TABLE IF NOT EXISTS property_details (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL UNIQUE REFERENCES properties(id) ON DELETE CASCADE,
  
  -- Surface et dimensions (tous types)
  surface_area DECIMAL(10, 2) NULL, -- m²
  land_area DECIMAL(10, 2) NULL, -- m²
  
  -- Chambres et pièces (house, apartment, villa)
  bedrooms INTEGER NULL,
  bathrooms INTEGER NULL,
  total_rooms INTEGER NULL,
  
  -- Caractéristiques générales
  has_garage BOOLEAN NOT NULL DEFAULT false,
  garage_spaces INTEGER NULL,
  has_parking BOOLEAN NOT NULL DEFAULT false,
  parking_spaces INTEGER NULL,
  has_elevator BOOLEAN NOT NULL DEFAULT false,
  has_balcony BOOLEAN NOT NULL DEFAULT false,
  has_terrace BOOLEAN NOT NULL DEFAULT false,
  has_garden BOOLEAN NOT NULL DEFAULT false,
  has_pool BOOLEAN NOT NULL DEFAULT false,
  has_fireplace BOOLEAN NOT NULL DEFAULT false,
  has_air_conditioning BOOLEAN NOT NULL DEFAULT false,
  has_heating BOOLEAN NOT NULL DEFAULT false,
  
  -- Appartement spécifique
  floor_number INTEGER NULL,
  total_floors INTEGER NULL,
  has_storage BOOLEAN NOT NULL DEFAULT false,
  
  -- Maison/Villa spécifique
  construction_year INTEGER NULL,
  renovation_year INTEGER NULL,
  energy_class VARCHAR(10) NULL, -- A, B, C, D, E, F, G
  energy_consumption DECIMAL(10, 2) NULL, -- kWh/m²/year
  greenhouse_gas_emissions DECIMAL(10, 2) NULL, -- kg CO2/m²/year
  
  -- Terrain spécifique
  zoning VARCHAR(50) NULL, -- Residential, Commercial, Mixed, etc.
  buildable BOOLEAN NULL,
  building_rights DECIMAL(10, 2) NULL, -- m² constructibles
  
  -- Commercial spécifique
  commercial_type VARCHAR(50) NULL, -- Office, Retail, Warehouse, etc.
  business_license BOOLEAN NOT NULL DEFAULT false,
  max_capacity INTEGER NULL, -- Personnes
  
  -- Autres caractéristiques (JSON pour flexibilité)
  amenities JSONB NULL, -- ["wifi", "security", "concierge", etc.]
  features JSONB NULL -- Autres caractéristiques spécifiques
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_property_details_property_id ON property_details(property_id);
CREATE INDEX IF NOT EXISTS idx_property_details_bedrooms ON property_details(bedrooms) WHERE bedrooms IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_property_details_surface_area ON property_details(surface_area) WHERE surface_area IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_property_details_energy_class ON property_details(energy_class) WHERE energy_class IS NOT NULL;

