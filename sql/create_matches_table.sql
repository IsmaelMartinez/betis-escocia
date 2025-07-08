-- Create matches table for Peña Bética Escocesa
-- Run this SQL in your Supabase SQL Editor

CREATE TABLE matches (
    id BIGSERIAL PRIMARY KEY,
    date_time TIMESTAMPTZ NOT NULL,
    opponent VARCHAR(100) NOT NULL,
    competition VARCHAR(100) NOT NULL,
    home_away VARCHAR(10) NOT NULL CHECK (home_away IN ('home', 'away')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    external_id BIGINT,
    external_source VARCHAR(100)
);

-- Create indexes for efficient queries
CREATE INDEX idx_matches_date_time ON matches(date_time);
CREATE INDEX idx_matches_competition ON matches(competition);
CREATE INDEX idx_matches_home_away ON matches(home_away);

-- Create a partial index for upcoming matches (most common query)
-- Note: We'll filter upcoming matches in queries rather than using a partial index
-- because NOW() is not IMMUTABLE and can't be used in index predicates

-- Enable Row Level Security
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;

-- Create policy to allow public reads (for displaying matches)
CREATE POLICY "Allow public reads on matches" ON matches FOR SELECT TO anon USING (true);

-- Create policy to allow authenticated users to insert/update/delete (for admin)
-- Note: This is a basic policy - proper auth will be added later
CREATE POLICY "Allow authenticated operations on matches" ON matches FOR ALL TO authenticated USING (true);

-- Create function to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_matches_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at on row updates
CREATE TRIGGER update_matches_updated_at_trigger
    BEFORE UPDATE ON matches
    FOR EACH ROW
    EXECUTE FUNCTION update_matches_updated_at();

-- Grant necessary permissions
GRANT SELECT ON matches TO anon;
GRANT ALL ON matches TO authenticated;
GRANT USAGE ON SEQUENCE matches_id_seq TO authenticated;
