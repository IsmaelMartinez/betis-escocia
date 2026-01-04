-- Migration: Enhance players table with display_name and external_id
-- Purpose: Support short display names (e.g., "Isco" vs "Francisco Roman Alarcon")
--          and link to Football-Data.org API

-- Add display_name for UI purposes (allows Isco vs Francisco Roman Alarcon)
ALTER TABLE players ADD COLUMN IF NOT EXISTS display_name VARCHAR(100);

-- Add external_id for Football-Data.org API linking
ALTER TABLE players ADD COLUMN IF NOT EXISTS external_id INTEGER;

-- Create index for external ID lookups
CREATE INDEX IF NOT EXISTS idx_players_external_id ON players(external_id);

COMMENT ON COLUMN players.display_name IS 'Short display name for UI (e.g., Isco instead of Francisco Roman Alarcon). If NULL, use name field.';
COMMENT ON COLUMN players.external_id IS 'Football-Data.org player ID for API matching and deduplication';
