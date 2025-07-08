-- Add external_id and external_source columns to matches table for LaLiga import
-- This enables tracking matches from Football-Data.org API and prevents duplicates

ALTER TABLE matches
ADD COLUMN external_id BIGINT,
ADD COLUMN external_source VARCHAR(100);

-- Create index on external_id for efficient lookups
CREATE INDEX idx_matches_external_id ON matches(external_id);

-- Create index on external_source for efficient filtering
CREATE INDEX idx_matches_external_source ON matches(external_source);

-- Create unique constraint to prevent duplicate imports from same source
ALTER TABLE matches
ADD CONSTRAINT unique_external_match UNIQUE (external_id, external_source);

-- Add comment for documentation
COMMENT ON COLUMN matches.external_id IS 'External API match identifier (e.g., Football-Data.org match ID)';
COMMENT ON COLUMN matches.external_source IS 'Source of external data (e.g., football-data.org)';
