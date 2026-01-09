-- Migration: Create property_favorites table
-- Description: Table to store user favorite properties

CREATE TABLE IF NOT EXISTS property_favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id VARCHAR(255) NOT NULL,
    property_id UUID NOT NULL REFERENCES properties(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_user_property_favorite UNIQUE (user_id, property_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_property_favorites_user_id ON property_favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_property_favorites_property_id ON property_favorites(property_id);
CREATE INDEX IF NOT EXISTS idx_property_favorites_created_at ON property_favorites(created_at);

