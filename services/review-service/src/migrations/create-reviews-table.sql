-- Create reviews table
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    entity_type VARCHAR(50) NOT NULL CHECK (entity_type IN ('property', 'city', 'neighborhood', 'country')),
    entity_id UUID NOT NULL,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title VARCHAR(200),
    comment TEXT,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
    
    -- New features inspired by Google Reviews, Airbnb, TripAdvisor
    photos JSONB, -- Array of photo URLs
    tags JSONB, -- Array of tag enums (security, location, price, etc.)
    recommended BOOLEAN, -- Would recommend this entity?
    verified BOOLEAN NOT NULL DEFAULT FALSE, -- Verified purchase/stay
    visit_date DATE, -- When did the user visit/stay?
    helpful_count INTEGER NOT NULL DEFAULT 0, -- Count of helpful votes
    not_helpful_count INTEGER NOT NULL DEFAULT 0, -- Count of not helpful votes
    
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP
);

-- Indexes for faster queries
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_reviews_entity_type ON reviews(entity_type);
CREATE INDEX IF NOT EXISTS idx_reviews_entity_id ON reviews(entity_id);
CREATE INDEX IF NOT EXISTS idx_reviews_entity_type_id ON reviews(entity_type, entity_id);
CREATE INDEX IF NOT EXISTS idx_reviews_status ON reviews(status);
CREATE INDEX IF NOT EXISTS idx_reviews_deleted_at ON reviews(deleted_at);
CREATE INDEX IF NOT EXISTS idx_reviews_created_at ON reviews(created_at DESC);

-- Unique constraint: one review per user per entity (only for non-deleted reviews)
-- Using partial index to allow multiple reviews when deleted_at is not null
CREATE UNIQUE INDEX IF NOT EXISTS idx_reviews_unique_user_entity 
    ON reviews(user_id, entity_type, entity_id) 
    WHERE deleted_at IS NULL;

-- Trigger to update updated_at automatically
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

-- Comments for documentation
COMMENT ON TABLE reviews IS 'Stores user reviews for properties, cities, neighborhoods, and countries';
COMMENT ON COLUMN reviews.entity_type IS 'Type of entity being reviewed: property, city, neighborhood, or country';
COMMENT ON COLUMN reviews.entity_id IS 'UUID of the entity being reviewed';
COMMENT ON COLUMN reviews.rating IS 'Rating from 1 to 5 stars';
COMMENT ON COLUMN reviews.status IS 'Review moderation status: pending, approved, or rejected';
COMMENT ON COLUMN reviews.photos IS 'Array of photo URLs attached to the review';
COMMENT ON COLUMN reviews.tags IS 'Array of tags/categories (security, location, price, quality, etc.)';
COMMENT ON COLUMN reviews.recommended IS 'Would the user recommend this entity?';
COMMENT ON COLUMN reviews.verified IS 'Verified purchase/stay (user actually stayed/lived there)';
COMMENT ON COLUMN reviews.visit_date IS 'Date when the user visited/stayed';
COMMENT ON COLUMN reviews.helpful_count IS 'Number of helpful votes';
COMMENT ON COLUMN reviews.not_helpful_count IS 'Number of not helpful votes';
COMMENT ON COLUMN reviews.deleted_at IS 'Soft delete timestamp (NULL if not deleted)';

