-- Migration: Add squad_members table
-- Purpose: Store current Real Betis squad with rich player data (position, shirt number, etc.)
-- Links to players table for continuity with rumor tracking

CREATE TABLE IF NOT EXISTS squad_members (
    id BIGSERIAL PRIMARY KEY,
    player_id BIGINT NOT NULL REFERENCES players(id) ON DELETE CASCADE,

    -- Player details from Football-Data.org API
    external_id INTEGER,                    -- Football-Data.org player ID
    shirt_number INTEGER CHECK (shirt_number IS NULL OR (shirt_number BETWEEN 1 AND 99)),
    position VARCHAR(30) CHECK (position IS NULL OR position IN (
        'Goalkeeper', 'Centre-Back', 'Left-Back', 'Right-Back',
        'Defensive Midfield', 'Central Midfield', 'Attacking Midfield',
        'Left Winger', 'Right Winger', 'Centre-Forward'
    )),
    position_short VARCHAR(3),              -- GK, CB, LB, RB, DM, CM, AM, LW, RW, ST
    date_of_birth DATE,
    nationality VARCHAR(100),
    photo_url TEXT,                         -- Optional player photo

    -- Squad status
    is_captain BOOLEAN DEFAULT FALSE,
    is_vice_captain BOOLEAN DEFAULT FALSE,
    squad_status VARCHAR(20) DEFAULT 'active' CHECK (squad_status IN (
        'active', 'injured', 'suspended', 'loaned_out', 'on_loan'
    )),

    -- Metadata
    joined_at TIMESTAMPTZ,                  -- When player joined squad
    contract_until DATE,                    -- Contract expiration
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),

    -- Ensure one squad entry per player
    UNIQUE(player_id)
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_squad_members_position ON squad_members(position);
CREATE INDEX IF NOT EXISTS idx_squad_members_status ON squad_members(squad_status);
CREATE INDEX IF NOT EXISTS idx_squad_members_shirt ON squad_members(shirt_number);
CREATE INDEX IF NOT EXISTS idx_squad_members_external_id ON squad_members(external_id);

-- Enable RLS
ALTER TABLE squad_members ENABLE ROW LEVEL SECURITY;

-- Public read access
CREATE POLICY "Public read access" ON squad_members
    FOR SELECT
    USING (true);

-- Admin/service role full access for all operations
CREATE POLICY "Service role full access" ON squad_members
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

COMMENT ON TABLE squad_members IS 'Current Real Betis squad with rich player data. Links to players table for rumor tracking continuity.';
COMMENT ON COLUMN squad_members.external_id IS 'Football-Data.org player ID for API matching';
COMMENT ON COLUMN squad_members.position_short IS 'Short position code: GK, CB, LB, RB, DM, CM, AM, LW, RW, ST';
COMMENT ON COLUMN squad_members.squad_status IS 'Current status: active, injured, suspended, loaned_out, on_loan';
