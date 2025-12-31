-- Migration: Fix players RLS policies and add hidden news feature
-- Description: Allow admin users to manage players, add hidden flag for irrelevant news
-- Date: 2025-12-30

-- ============================================
-- PART 1: Fix players table RLS and grants
-- ============================================

-- Grant table permissions (MISSING from original 0004!)
GRANT ALL ON TABLE players TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE players_id_seq TO anon, authenticated;

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Service role full access" ON players;
DROP POLICY IF EXISTS "Admin insert access" ON players;
DROP POLICY IF EXISTS "Admin update access" ON players;
DROP POLICY IF EXISTS "Admin delete access" ON players;
DROP POLICY IF EXISTS "Public read access" ON players;

-- Create policies - publicMetadata is nested inside 'claims' in Clerk JWT
CREATE POLICY "Public read access" ON players FOR SELECT USING (true);

CREATE POLICY "Admin insert access" ON players
    FOR INSERT WITH CHECK (
        (auth.jwt()->'claims'->'publicMetadata'->>'role' = 'admin')
    );

CREATE POLICY "Admin update access" ON players
    FOR UPDATE USING (
        (auth.jwt()->'claims'->'publicMetadata'->>'role' = 'admin')
    );

CREATE POLICY "Admin delete access" ON players
    FOR DELETE USING (
        (auth.jwt()->'claims'->'publicMetadata'->>'role' = 'admin')
    );

-- ============================================
-- PART 2: Fix news_players table RLS and grants
-- ============================================

-- Grant table permissions (MISSING from original 0004!)
GRANT ALL ON TABLE news_players TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE news_players_id_seq TO anon, authenticated;

-- Drop ALL existing policies to start fresh
DROP POLICY IF EXISTS "Service role full access" ON news_players;
DROP POLICY IF EXISTS "Admin insert access" ON news_players;
DROP POLICY IF EXISTS "Admin update access" ON news_players;
DROP POLICY IF EXISTS "Admin delete access" ON news_players;
DROP POLICY IF EXISTS "Public read access" ON news_players;

-- Create policies - publicMetadata is nested inside 'claims' in Clerk JWT
CREATE POLICY "Public read access" ON news_players FOR SELECT USING (true);

CREATE POLICY "Admin insert access" ON news_players
    FOR INSERT WITH CHECK (
        (auth.jwt()->'claims'->'publicMetadata'->>'role' = 'admin')
    );

CREATE POLICY "Admin update access" ON news_players
    FOR UPDATE USING (
        (auth.jwt()->'claims'->'publicMetadata'->>'role' = 'admin')
    );

CREATE POLICY "Admin delete access" ON news_players
    FOR DELETE USING (
        (auth.jwt()->'claims'->'publicMetadata'->>'role' = 'admin')
    );

-- ============================================
-- PART 3: Add hidden news feature to betis_news
-- ============================================

-- Add hidden flag columns (idempotent - won't fail if columns exist)
ALTER TABLE betis_news ADD COLUMN IF NOT EXISTS is_hidden BOOLEAN DEFAULT false;
ALTER TABLE betis_news ADD COLUMN IF NOT EXISTS hidden_at TIMESTAMPTZ;
ALTER TABLE betis_news ADD COLUMN IF NOT EXISTS hidden_by VARCHAR(100);
ALTER TABLE betis_news ADD COLUMN IF NOT EXISTS hidden_reason VARCHAR(500);

-- Add AI relevance columns for automatic filtering
ALTER TABLE betis_news ADD COLUMN IF NOT EXISTS is_relevant_to_betis BOOLEAN DEFAULT true;
ALTER TABLE betis_news ADD COLUMN IF NOT EXISTS irrelevance_reason VARCHAR(500);

-- Index for efficient filtering of hidden news
CREATE INDEX IF NOT EXISTS idx_betis_news_is_hidden ON betis_news(is_hidden);
CREATE INDEX IF NOT EXISTS idx_betis_news_is_relevant ON betis_news(is_relevant_to_betis);

-- Composite index for common query pattern (non-hidden, non-duplicate)
CREATE INDEX IF NOT EXISTS idx_betis_news_visible
    ON betis_news(pub_date DESC)
    WHERE is_hidden = false AND is_duplicate = false;

-- Comments
COMMENT ON COLUMN betis_news.is_hidden IS 'Hidden by admin (kept for audit, not shown publicly)';
COMMENT ON COLUMN betis_news.hidden_at IS 'Timestamp when item was hidden';
COMMENT ON COLUMN betis_news.hidden_by IS 'User ID who hid the item';
COMMENT ON COLUMN betis_news.hidden_reason IS 'Reason for hiding (e.g., "Not related to Betis")';
COMMENT ON COLUMN betis_news.is_relevant_to_betis IS 'AI-determined relevance to Real Betis';
COMMENT ON COLUMN betis_news.irrelevance_reason IS 'AI explanation for why news is not relevant';
