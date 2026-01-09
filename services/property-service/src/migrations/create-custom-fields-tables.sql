-- Migration: Create custom fields tables (EAV model)
-- Date: 2026-01-08
-- Related to: US-026 - Custom Fields (Réutilisables)

-- Enum for field types
CREATE TYPE custom_field_type AS ENUM (
  'text',
  'textarea',
  'number',
  'date',
  'datetime',
  'boolean',
  'select',
  'multiselect',
  'url',
  'email'
);

-- Table: custom_field_definitions
-- Stores field definitions (metadata) for custom fields
CREATE TABLE IF NOT EXISTS custom_field_definitions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NULL, -- null = global (admin système)
  entity_type VARCHAR(50) NOT NULL, -- 'property', 'lead', 'agency', etc.
  field_key VARCHAR(100) NOT NULL, -- Unique slug per org + entity_type
  label JSONB NOT NULL, -- Multilingual: { "en": "Label", "fr": "Libellé" }
  field_type custom_field_type NOT NULL,
  required BOOLEAN NOT NULL DEFAULT false,
  default_value JSONB NULL,
  validation_rules JSONB NULL, -- { "min": 0, "max": 100, "pattern": "...", etc. }
  options JSONB NULL, -- Array of options for select/multiselect
  reusable BOOLEAN NOT NULL DEFAULT false,
  reusable_entity_types JSONB NULL, -- Array of entity types this field can be reused for
  deleted_at TIMESTAMP NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Unique constraint: field_key must be unique per organization + entity_type
CREATE UNIQUE INDEX IF NOT EXISTS idx_custom_field_definitions_unique_key
  ON custom_field_definitions(organization_id, entity_type, field_key)
  WHERE deleted_at IS NULL;

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_custom_field_definitions_org ON custom_field_definitions(organization_id);
CREATE INDEX IF NOT EXISTS idx_custom_field_definitions_entity_type ON custom_field_definitions(entity_type);
CREATE INDEX IF NOT EXISTS idx_custom_field_definitions_deleted ON custom_field_definitions(deleted_at) WHERE deleted_at IS NULL;

-- Table: custom_field_values
-- Stores actual values for custom fields (EAV model)
CREATE TABLE IF NOT EXISTS custom_field_values (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NULL,
  entity_type VARCHAR(50) NOT NULL, -- 'property', 'lead', 'agency', etc.
  entity_id UUID NOT NULL, -- FK to the entity (property.id, lead.id, etc.)
  field_definition_id UUID NOT NULL REFERENCES custom_field_definitions(id) ON DELETE CASCADE,
  
  -- Typed value columns (only one used based on field_type)
  value_text TEXT NULL, -- For text, textarea, url, email
  value_number DECIMAL(15, 4) NULL, -- For number
  value_date TIMESTAMP NULL, -- For date, datetime
  value_boolean BOOLEAN NULL, -- For boolean
  value_json JSONB NULL, -- For select (single), multiselect (array), complex data
  
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Unique constraint: one value per entity + field definition
CREATE UNIQUE INDEX IF NOT EXISTS idx_custom_field_values_unique
  ON custom_field_values(entity_type, entity_id, field_definition_id);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_custom_field_values_org_entity ON custom_field_values(organization_id, entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_custom_field_values_definition ON custom_field_values(field_definition_id);
CREATE INDEX IF NOT EXISTS idx_custom_field_values_entity ON custom_field_values(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_custom_field_values_text ON custom_field_values(value_text) WHERE value_text IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_custom_field_values_number ON custom_field_values(value_number) WHERE value_number IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_custom_field_values_date ON custom_field_values(value_date) WHERE value_date IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_custom_field_values_json ON custom_field_values USING GIN(value_json) WHERE value_json IS NOT NULL;

