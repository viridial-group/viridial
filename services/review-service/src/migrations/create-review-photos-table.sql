-- Create review_photos table for photos attached to reviews
CREATE TABLE IF NOT EXISTS review_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    url VARCHAR(500) NOT NULL,
    thumbnail_url VARCHAR(500), -- Thumbnail version for faster loading
    alt VARCHAR(100), -- Alt text for accessibility
    width INTEGER, -- Original width in pixels
    height INTEGER, -- Original height in pixels
    display_order INTEGER NOT NULL DEFAULT 0, -- Display order
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_review_photos_review_id ON review_photos(review_id);
CREATE INDEX IF NOT EXISTS idx_review_photos_order ON review_photos(review_id, display_order);

-- Comments for documentation
COMMENT ON TABLE review_photos IS 'Stores photos attached to reviews (like Google Reviews, Airbnb)';
COMMENT ON COLUMN review_photos.url IS 'Full URL to the photo';
COMMENT ON COLUMN review_photos.thumbnail_url IS 'Thumbnail URL for faster loading';
COMMENT ON COLUMN review_photos.display_order IS 'Display order of photos in the review';

