-- Add external_id and external_source columns to matches table
-- This allows us to track matches imported from external APIs and avoid duplicates

-- Add the columns
ALTER TABLE matches 
ADD COLUMN external_id BIGINT,
ADD COLUMN external_source VARCHAR(100);

-- Add index for efficient duplicate checking
CREATE INDEX idx_matches_external_id ON matches(external_id);
CREATE INDEX idx_matches_external_source ON matches(external_source);

-- Add unique constraint to prevent duplicate external matches
ALTER TABLE matches 
ADD CONSTRAINT unique_external_match 
UNIQUE (external_id, external_source);

-- Grant permissions
GRANT ALL ON matches TO anon, authenticated;
