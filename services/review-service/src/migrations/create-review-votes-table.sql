-- Create review_votes table for helpful/not helpful votes
CREATE TABLE IF NOT EXISTS review_votes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    user_id UUID NOT NULL,
    vote_type VARCHAR(20) NOT NULL CHECK (vote_type IN ('helpful', 'not_helpful')),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Unique constraint: one vote per user per review
    CONSTRAINT unique_user_review_vote UNIQUE (user_id, review_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_review_votes_review_id ON review_votes(review_id);
CREATE INDEX IF NOT EXISTS idx_review_votes_user_id ON review_votes(user_id);
CREATE INDEX IF NOT EXISTS idx_review_votes_vote_type ON review_votes(vote_type);
CREATE INDEX IF NOT EXISTS idx_review_votes_created_at ON review_votes(created_at DESC);

-- Comments for documentation
COMMENT ON TABLE review_votes IS 'Stores helpful/not helpful votes on reviews (like Google Reviews)';
COMMENT ON COLUMN review_votes.vote_type IS 'Type of vote: helpful or not_helpful';

