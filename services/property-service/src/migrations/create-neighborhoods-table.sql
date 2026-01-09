-- Migration: Create neighborhoods table
-- Description: Table pour stocker les informations sur les quartiers

CREATE TABLE IF NOT EXISTS neighborhoods (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(100) UNIQUE NOT NULL,
  name VARCHAR(200) NOT NULL,
  description JSONB NOT NULL DEFAULT '{}'::jsonb,
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

-- Indexes
CREATE INDEX IF NOT EXISTS idx_neighborhoods_slug ON neighborhoods(slug);
CREATE INDEX IF NOT EXISTS idx_neighborhoods_city ON neighborhoods(city);
CREATE INDEX IF NOT EXISTS idx_neighborhoods_region ON neighborhoods(region);
CREATE INDEX IF NOT EXISTS idx_neighborhoods_country ON neighborhoods(country);
CREATE INDEX IF NOT EXISTS idx_neighborhoods_postal_code ON neighborhoods(postal_code);

-- Add neighborhood_id to properties table
ALTER TABLE properties ADD COLUMN IF NOT EXISTS neighborhood_id UUID;
CREATE INDEX IF NOT EXISTS idx_properties_neighborhood_id ON properties(neighborhood_id);

-- Foreign key constraint
ALTER TABLE properties
  ADD CONSTRAINT fk_properties_neighborhood
  FOREIGN KEY (neighborhood_id)
  REFERENCES neighborhoods(id)
  ON DELETE SET NULL;

-- Update trigger for updated_at
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

