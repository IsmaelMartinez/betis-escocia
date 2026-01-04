-- Migration: Add current squad tracking to players table
-- Date: 2026-01-04
-- Purpose: Track which players are currently in the Betis squad so AI analysis
--          can correctly identify players as departing (current squad) vs targets (not in squad)

-- Add is_current_squad column to players table
ALTER TABLE players ADD COLUMN IF NOT EXISTS is_current_squad BOOLEAN DEFAULT FALSE;

-- Index for efficient squad queries
CREATE INDEX IF NOT EXISTS idx_players_current_squad ON players(is_current_squad) WHERE is_current_squad = TRUE;

-- Comment for documentation
COMMENT ON COLUMN players.is_current_squad IS 'True if player is currently in the Betis squad. Used to help AI distinguish between departing players and transfer targets.';
