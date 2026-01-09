-- Migration: Create property_flags table for moderation workflow
-- Date: 2026-01-08
-- Related to: US-007 - Moderation workflow

CREATE TYPE flag_status AS ENUM ('pending', 'reviewed', 'resolved');

CREATE TABLE IF NOT EXISTS property_flags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
  flagged_by UUID NOT NULL, -- userId from auth-service
  reason TEXT NOT NULL,
  status flag_status NOT NULL DEFAULT 'pending',
  reviewed_by UUID NULL, -- admin userId
  reviewed_at TIMESTAMP NULL,
  moderation_action VARCHAR(50) NULL, -- approve, reject, takedown
  moderation_notes TEXT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_property_flags_property_id ON property_flags(property_id);
CREATE INDEX idx_property_flags_flagged_by ON property_flags(flagged_by);
CREATE INDEX idx_property_flags_status ON property_flags(status);
CREATE INDEX idx_property_flags_created_at ON property_flags(created_at DESC);

-- Update trigger for updated_at
CREATE OR REPLACE FUNCTION update_property_flags_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_property_flags_updated_at
  BEFORE UPDATE ON property_flags
  FOR EACH ROW
  EXECUTE FUNCTION update_property_flags_updated_at();

