-- Migration: Add soft delete support to properties table
-- Date: 2026-01-08
-- Related to: Property Service improvements

-- Add deleted_at column for soft delete
ALTER TABLE properties
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMP NULL;

-- Create index for soft delete queries
CREATE INDEX IF NOT EXISTS idx_properties_deleted_at ON properties(deleted_at)
WHERE deleted_at IS NULL;

-- Update existing queries to exclude soft-deleted properties
-- Note: This is handled in application code, but index helps performance

