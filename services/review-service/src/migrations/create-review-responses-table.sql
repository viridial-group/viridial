-- Create review_responses table for owner/manager responses to reviews
CREATE TABLE IF NOT EXISTS review_responses (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    review_id UUID NOT NULL REFERENCES reviews(id) ON DELETE CASCADE,
    user_id UUID NOT NULL, -- User who responded (usually owner/manager)
    content TEXT NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP,
    
    -- One response per user per review (soft delete allows multiple over time)
    CONSTRAINT unique_user_review_response UNIQUE (user_id, review_id, deleted_at) 
        DEFERRABLE INITIALLY DEFERRED
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_review_responses_review_id ON review_responses(review_id);
CREATE INDEX IF NOT EXISTS idx_review_responses_user_id ON review_responses(user_id);
CREATE INDEX IF NOT EXISTS idx_review_responses_deleted_at ON review_responses(deleted_at);
CREATE INDEX IF NOT EXISTS idx_review_responses_created_at ON review_responses(created_at DESC);

-- Trigger to update updated_at automatically
CREATE OR REPLACE FUNCTION update_review_responses_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_review_responses_updated_at
    BEFORE UPDATE ON review_responses
    FOR EACH ROW
    EXECUTE FUNCTION update_review_responses_updated_at();

-- Comments for documentation
COMMENT ON TABLE review_responses IS 'Stores responses from owners/managers to reviews (like Google Business, Airbnb)';
COMMENT ON COLUMN review_responses.user_id IS 'User who responded (usually the owner/manager of the reviewed entity)';

