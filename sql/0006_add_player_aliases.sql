-- Migration: Add aliases column to players table for nickname handling
-- Date: 2025-12-30
-- Purpose: Allow deduplication of players known by multiple names (e.g., Isco / Isco Alarcón)

-- Add aliases column as JSONB array of normalized names
ALTER TABLE players
ADD COLUMN IF NOT EXISTS aliases JSONB DEFAULT '[]'::jsonb;

-- Create GIN index for efficient alias lookups
CREATE INDEX IF NOT EXISTS idx_players_aliases ON players USING GIN (aliases);

-- Comment for documentation
COMMENT ON COLUMN players.aliases IS 'Array of alternative normalized names for this player (nicknames, full names)';
