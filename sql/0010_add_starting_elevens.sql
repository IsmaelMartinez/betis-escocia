-- Migration: Add starting_elevens table
-- Purpose: Store saved formations and starting lineups for matches

CREATE TABLE IF NOT EXISTS starting_elevens (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,             -- e.g., "vs Athletic - Copa del Rey"
    description TEXT,
    formation VARCHAR(10) NOT NULL,         -- e.g., "4-3-3", "4-4-2", "3-5-2"

    -- JSONB array of player positions
    -- Each entry: { playerId: number, squadMemberId: number, position: string, x: number, y: number }
    lineup JSONB NOT NULL DEFAULT '[]'::jsonb,

    -- Optional match reference
    match_id BIGINT REFERENCES matches(id) ON DELETE SET NULL,

    -- Metadata
    is_active BOOLEAN DEFAULT TRUE,         -- Show in public views
    is_predicted BOOLEAN DEFAULT FALSE,     -- Predicted vs actual lineup
    created_by TEXT,                        -- Clerk user ID
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- GIN index for JSONB queries on lineup
CREATE INDEX IF NOT EXISTS idx_starting_elevens_lineup ON starting_elevens USING GIN (lineup);
CREATE INDEX IF NOT EXISTS idx_starting_elevens_match ON starting_elevens(match_id);
CREATE INDEX IF NOT EXISTS idx_starting_elevens_active ON starting_elevens(is_active) WHERE is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_starting_elevens_formation ON starting_elevens(formation);

-- Enable RLS
ALTER TABLE starting_elevens ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read access" ON starting_elevens
    FOR SELECT
    USING (true);

-- Admin/service role full access
CREATE POLICY "Service role full access" ON starting_elevens
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

COMMENT ON TABLE starting_elevens IS 'Saved formations and starting lineups, optionally linked to matches';
COMMENT ON COLUMN starting_elevens.lineup IS 'Array of {playerId: number, squadMemberId: number, position: string (GK/CB/etc), x: number (0-100), y: number (0-100)}';
COMMENT ON COLUMN starting_elevens.formation IS 'Formation pattern like 4-3-3, 4-4-2, 3-5-2, 4-2-3-1';
COMMENT ON COLUMN starting_elevens.is_predicted IS 'True if this is a predicted lineup, false if actual/confirmed';
