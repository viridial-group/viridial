-- Migration: Add media_urls column to properties table if it doesn't exist
-- This script can be run safely multiple times (idempotent)

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
    AND table_name = 'properties' 
    AND column_name = 'media_urls'
  ) THEN
    ALTER TABLE properties ADD COLUMN media_urls jsonb NULL;
    COMMENT ON COLUMN properties.media_urls IS 'Array of media URLs (images, videos) for the property stored as JSONB';
    RAISE NOTICE 'Column media_urls added to properties table';
  ELSE
    RAISE NOTICE 'Column media_urls already exists in properties table';
  END IF;
END $$;
