-- Migration: Add players and news_players tables for Phase 2A
-- Date: 2025-12-28

-- Players table for normalized player data
CREATE TABLE IF NOT EXISTS players (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    normalized_name VARCHAR(200) NOT NULL,
    known_club VARCHAR(200),
    known_position VARCHAR(50),
    first_seen_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    rumor_count INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Unique index on normalized name for deduplication
CREATE UNIQUE INDEX IF NOT EXISTS idx_players_normalized_name ON players(normalized_name);

-- Index for position-based queries (Phase 2B)
CREATE INDEX IF NOT EXISTS idx_players_position ON players(known_position);

-- Junction table linking news to players
CREATE TABLE IF NOT EXISTS news_players (
    id BIGSERIAL PRIMARY KEY,
    news_id BIGINT REFERENCES betis_news(id) ON DELETE CASCADE,
    player_id BIGINT REFERENCES players(id) ON DELETE CASCADE,
    role VARCHAR(20) CHECK (role IN ('target', 'departing', 'mentioned')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(news_id, player_id)
);

-- Indexes for efficient joins
CREATE INDEX IF NOT EXISTS idx_news_players_news_id ON news_players(news_id);
CREATE INDEX IF NOT EXISTS idx_news_players_player_id ON news_players(player_id);
CREATE INDEX IF NOT EXISTS idx_news_players_role ON news_players(role);

-- Enable RLS
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_players ENABLE ROW LEVEL SECURITY;

-- Public read access policies
DROP POLICY IF EXISTS "Public read access" ON players;
CREATE POLICY "Public read access" ON players FOR SELECT USING (true);

DROP POLICY IF EXISTS "Public read access" ON news_players;
CREATE POLICY "Public read access" ON news_players FOR SELECT USING (true);

-- Service role insert/update policies for sync service
DROP POLICY IF EXISTS "Service role full access" ON players;
CREATE POLICY "Service role full access" ON players
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');

DROP POLICY IF EXISTS "Service role full access" ON news_players;
CREATE POLICY "Service role full access" ON news_players
    FOR ALL
    USING (auth.role() = 'service_role')
    WITH CHECK (auth.role() = 'service_role');
