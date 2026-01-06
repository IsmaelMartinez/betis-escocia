-- ===============================================================================
-- Peña Bética Escocesa - Database Setup (Migration 0001)
-- ===============================================================================
-- Consolidated schema from migrations 0000-0014
-- Represents current database state as of 2026-01-06
--
-- This file creates a complete fresh database with all tables, functions,
-- triggers, views, RLS policies, and grants needed for the application.
--
-- For seed data (sample questions, matches, etc.), see 0002_seed_data.sql
-- ===============================================================================

-- ===============================================================================
-- 1. EXTENSIONS
-- ===============================================================================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===============================================================================
-- 2. TABLES
-- ===============================================================================

-- =============================================================================
-- CORE TABLES
-- =============================================================================

-- Matches: Football match information with external API integration
CREATE TABLE IF NOT EXISTS matches (
    id BIGSERIAL PRIMARY KEY,
    date_time TIMESTAMPTZ NOT NULL,
    opponent VARCHAR(100) NOT NULL,
    competition VARCHAR(100) NOT NULL,
    home_away VARCHAR(10) NOT NULL CHECK (home_away IN ('home', 'away')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    external_id BIGINT,
    external_source VARCHAR(100),
    result VARCHAR(20) CHECK (result IN ('HOME_WIN', 'AWAY_WIN', 'DRAW')),
    home_score INTEGER,
    away_score INTEGER,
    status VARCHAR(20),
    matchday INTEGER,
    CONSTRAINT unique_external_match UNIQUE (external_id, external_source)
);

CREATE INDEX IF NOT EXISTS idx_matches_date_time ON matches(date_time);
CREATE INDEX IF NOT EXISTS idx_matches_competition ON matches(competition);
CREATE INDEX IF NOT EXISTS idx_matches_home_away ON matches(home_away);
CREATE INDEX IF NOT EXISTS idx_matches_external_id ON matches(external_id);
CREATE INDEX IF NOT EXISTS idx_matches_external_source ON matches(external_source);

-- RSVPs: User RSVPs for match viewing parties
CREATE TABLE IF NOT EXISTS rsvps (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    attendees INTEGER NOT NULL DEFAULT 1,
    whatsapp_interest BOOLEAN NOT NULL DEFAULT false,
    match_date TIMESTAMPTZ NOT NULL,
    match_id BIGINT REFERENCES matches(id) ON DELETE SET NULL,
    user_id TEXT
);

CREATE INDEX IF NOT EXISTS idx_rsvps_created_at ON rsvps(created_at);
CREATE INDEX IF NOT EXISTS idx_rsvps_email ON rsvps(email);
CREATE INDEX IF NOT EXISTS idx_rsvps_match_date ON rsvps(match_date);
CREATE INDEX IF NOT EXISTS idx_rsvps_match_id ON rsvps(match_id);
CREATE INDEX IF NOT EXISTS idx_rsvps_user_id ON rsvps(user_id);
CREATE INDEX IF NOT EXISTS idx_rsvps_user_id_created_at ON rsvps(user_id, created_at DESC);

-- Contact Submissions: Contact form submissions with status tracking
CREATE TABLE IF NOT EXISTS contact_submissions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    subject VARCHAR(255) NOT NULL,
    type VARCHAR(50) CHECK (type IN ('general', 'rsvp', 'photo', 'whatsapp', 'feedback')),
    message TEXT NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    user_id TEXT,
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'in progress', 'resolved', 'closed')),
    updated_by TEXT
);

CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_user_id ON contact_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_user_id_created_at ON contact_submissions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_type ON contact_submissions(type);

-- =============================================================================
-- TRIVIA SYSTEM TABLES
-- =============================================================================

-- Trivia Questions
CREATE TABLE IF NOT EXISTS trivia_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_text TEXT NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('betis', 'scotland', 'whisky')),
    difficulty VARCHAR(20) DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trivia_questions_category ON trivia_questions(category);
CREATE INDEX IF NOT EXISTS idx_trivia_questions_difficulty ON trivia_questions(difficulty);

-- Trivia Answers
CREATE TABLE IF NOT EXISTS trivia_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES trivia_questions(id) ON DELETE CASCADE,
    answer_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_trivia_answers_question_id ON trivia_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_trivia_answers_is_correct ON trivia_answers(is_correct);

-- User Trivia Scores
CREATE TABLE IF NOT EXISTS user_trivia_scores (
    id SERIAL PRIMARY KEY,
    user_id TEXT NOT NULL,
    daily_score INTEGER NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_user_trivia_scores_user_id ON user_trivia_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_user_trivia_scores_timestamp ON user_trivia_scores(timestamp);
CREATE INDEX IF NOT EXISTS idx_user_trivia_scores_user_id_timestamp ON user_trivia_scores(user_id, timestamp DESC);

-- =============================================================================
-- CACHING TABLES
-- =============================================================================

-- Classification Cache: Cached football league standings from external API
CREATE TABLE IF NOT EXISTS classification_cache (
    id SERIAL PRIMARY KEY,
    data JSONB NOT NULL,
    last_updated TIMESTAMPTZ NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_classification_cache_last_updated ON classification_cache(last_updated);

-- =============================================================================
-- SOYLENTI TABLES (Transfer Rumors & News)
-- =============================================================================

-- Betis News: RSS feed items with AI analysis
-- Columns accumulated from migrations 0002, 0003, 0005, 0007
CREATE TABLE IF NOT EXISTS betis_news (
    id BIGSERIAL PRIMARY KEY,
    title VARCHAR(500) NOT NULL,
    link TEXT NOT NULL,
    pub_date TIMESTAMPTZ NOT NULL,
    source VARCHAR(100) NOT NULL,
    description TEXT,

    -- AI Analysis
    ai_probability NUMERIC(5, 2) CHECK (ai_probability >= 0 AND ai_probability <= 100),
    ai_analysis TEXT,
    ai_analyzed_at TIMESTAMPTZ,

    -- Deduplication
    content_hash VARCHAR(64) NOT NULL,
    is_duplicate BOOLEAN DEFAULT false,
    duplicate_of_id BIGINT REFERENCES betis_news(id),
    similarity_score NUMERIC(5, 2),

    -- Transfer tracking
    transfer_direction VARCHAR(10) CHECK (transfer_direction IS NULL OR transfer_direction IN ('in', 'out', 'unknown')),
    transfer_status VARCHAR(15) CHECK (transfer_status IS NULL OR transfer_status IN ('rumor', 'confirmed', 'denied')),

    -- Admin reassessment workflow
    admin_context TEXT,
    needs_reassessment BOOLEAN DEFAULT false,
    reassessed_at TIMESTAMPTZ,
    reassessed_by VARCHAR(255),

    -- Visibility and relevance
    is_hidden BOOLEAN DEFAULT false,
    hidden_at TIMESTAMPTZ,
    hidden_by VARCHAR(100),
    hidden_reason VARCHAR(500),
    is_relevant_to_betis BOOLEAN DEFAULT true,
    irrelevance_reason VARCHAR(500),

    -- Timestamps
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_betis_news_pub_date ON betis_news(pub_date DESC);
CREATE INDEX IF NOT EXISTS idx_betis_news_source ON betis_news(source);
CREATE INDEX IF NOT EXISTS idx_betis_news_content_hash ON betis_news(content_hash);
CREATE INDEX IF NOT EXISTS idx_betis_news_is_duplicate ON betis_news(is_duplicate);
CREATE INDEX IF NOT EXISTS idx_betis_news_ai_probability ON betis_news(ai_probability DESC);
CREATE INDEX IF NOT EXISTS idx_betis_news_created_at ON betis_news(created_at DESC);
CREATE UNIQUE INDEX IF NOT EXISTS idx_betis_news_unique_link ON betis_news(link);
CREATE INDEX IF NOT EXISTS idx_betis_news_transfer_direction ON betis_news(transfer_direction);
CREATE INDEX IF NOT EXISTS idx_betis_news_transfer_status ON betis_news(transfer_status);
CREATE INDEX IF NOT EXISTS idx_betis_news_direction_status ON betis_news(transfer_direction, transfer_status)
    WHERE transfer_direction IS NOT NULL AND transfer_status = 'rumor';
CREATE INDEX IF NOT EXISTS idx_betis_news_needs_reassessment ON betis_news(needs_reassessment)
    WHERE needs_reassessment = true;
CREATE INDEX IF NOT EXISTS idx_betis_news_is_hidden ON betis_news(is_hidden);
CREATE INDEX IF NOT EXISTS idx_betis_news_is_relevant ON betis_news(is_relevant_to_betis);
CREATE INDEX IF NOT EXISTS idx_betis_news_visible ON betis_news(pub_date DESC)
    WHERE is_hidden = false AND is_duplicate = false;
CREATE INDEX IF NOT EXISTS idx_betis_news_cleanup ON betis_news(pub_date)
    WHERE ai_probability = 0;

-- Players: Normalized player tracking
-- Columns accumulated from migrations 0004, 0006, 0008, 0011
CREATE TABLE IF NOT EXISTS players (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(200) NOT NULL,
    normalized_name VARCHAR(200) NOT NULL,
    known_club VARCHAR(200),
    known_position VARCHAR(50),
    first_seen_at TIMESTAMPTZ DEFAULT NOW(),
    last_seen_at TIMESTAMPTZ DEFAULT NOW(),
    rumor_count INTEGER DEFAULT 1,
    created_at TIMESTAMPTZ DEFAULT NOW(),

    -- Player aliases for deduplication
    aliases JSONB DEFAULT '[]'::jsonb,

    -- Current squad tracking
    is_current_squad BOOLEAN DEFAULT FALSE,

    -- Display and external linking
    display_name VARCHAR(100),
    external_id INTEGER
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_players_normalized_name ON players(normalized_name);
CREATE INDEX IF NOT EXISTS idx_players_position ON players(known_position);
CREATE INDEX IF NOT EXISTS idx_players_aliases ON players USING GIN (aliases);
CREATE INDEX IF NOT EXISTS idx_players_current_squad ON players(is_current_squad)
    WHERE is_current_squad = TRUE;
CREATE INDEX IF NOT EXISTS idx_players_external_id ON players(external_id);

-- News-Players Junction: Links news to players with role
CREATE TABLE IF NOT EXISTS news_players (
    id BIGSERIAL PRIMARY KEY,
    news_id BIGINT REFERENCES betis_news(id) ON DELETE CASCADE,
    player_id BIGINT REFERENCES players(id) ON DELETE CASCADE,
    role VARCHAR(20) CHECK (role IN ('target', 'departing', 'mentioned')),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(news_id, player_id)
);

CREATE INDEX IF NOT EXISTS idx_news_players_news_id ON news_players(news_id);
CREATE INDEX IF NOT EXISTS idx_news_players_player_id ON news_players(player_id);
CREATE INDEX IF NOT EXISTS idx_news_players_role ON news_players(role);

-- ===============================================================================
-- 3. FUNCTIONS
-- ===============================================================================

-- Generic updated_at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- GDPR cleanup for old RSVPs
CREATE OR REPLACE FUNCTION cleanup_old_rsvps()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM rsvps WHERE created_at < NOW() - INTERVAL '3 months';
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- GDPR cleanup for old contact submissions
CREATE OR REPLACE FUNCTION cleanup_old_contact_submissions()
RETURNS INTEGER AS $$
DECLARE
    deleted_count INTEGER;
BEGIN
    DELETE FROM contact_submissions WHERE created_at < NOW() - INTERVAL '3 months';
    GET DIAGNOSTICS deleted_count = ROW_COUNT;
    RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- Cleanup old non-rumor news (ai_probability = 0)
CREATE OR REPLACE FUNCTION cleanup_old_non_rumor_news(
    retention_hours INTEGER DEFAULT 24
)
RETURNS TABLE(deleted_count BIGINT) AS $$
DECLARE
    cutoff_timestamp TIMESTAMPTZ;
    rows_deleted BIGINT;
BEGIN
    cutoff_timestamp := NOW() - make_interval(hours => retention_hours);

    DELETE FROM betis_news
    WHERE ai_probability = 0
      AND pub_date < cutoff_timestamp;

    GET DIAGNOSTICS rows_deleted = ROW_COUNT;

    RAISE NOTICE 'Cleaned up % non-rumor news items older than % hours',
        rows_deleted, retention_hours;

    RETURN QUERY SELECT rows_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Revoke public execute, grant only to service_role
REVOKE EXECUTE ON FUNCTION cleanup_old_non_rumor_news(INTEGER) FROM anon, authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_non_rumor_news(INTEGER) TO service_role;

-- ===============================================================================
-- 4. TRIGGERS
-- ===============================================================================

CREATE TRIGGER trigger_update_contact_submissions_updated_at
    BEFORE UPDATE ON contact_submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_matches_updated_at
    BEFORE UPDATE ON matches
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_betis_news_updated_at
    BEFORE UPDATE ON betis_news
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ===============================================================================
-- 5. VIEWS
-- ===============================================================================

-- Match RSVP counts: Aggregates RSVP counts per match
CREATE OR REPLACE VIEW match_rsvp_counts AS
SELECT
    m.id AS match_id,
    m.opponent,
    m.date_time,
    COUNT(r.id) AS rsvp_count,
    COALESCE(SUM(r.attendees), 0) AS total_attendees
FROM matches m
LEFT JOIN rsvps r ON m.id = r.match_id
GROUP BY m.id, m.opponent, m.date_time;

-- ===============================================================================
-- 6. ROW LEVEL SECURITY (RLS) POLICIES
-- ===============================================================================

-- Enable RLS on all tables
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trivia_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trivia_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_trivia_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE classification_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE betis_news ENABLE ROW LEVEL SECURITY;
ALTER TABLE players ENABLE ROW LEVEL SECURITY;
ALTER TABLE news_players ENABLE ROW LEVEL SECURITY;

-- =============================================================================
-- MATCHES POLICIES
-- =============================================================================

CREATE POLICY "Allow public read access on matches" ON matches
    FOR SELECT USING (true);

CREATE POLICY "Allow admin insert on matches" ON matches
    FOR INSERT WITH CHECK (
        (auth.jwt()->'claims'->'publicMetadata'->>'role' = 'admin')
    );

CREATE POLICY "Allow admin update on matches" ON matches
    FOR UPDATE USING (
        (auth.jwt()->'claims'->'publicMetadata'->>'role' = 'admin')
    );

CREATE POLICY "Allow admin delete on matches" ON matches
    FOR DELETE USING (
        (auth.jwt()->'claims'->'publicMetadata'->>'role' = 'admin')
    );

-- =============================================================================
-- RSVPS POLICIES
-- =============================================================================

CREATE POLICY "Allow public read access on rsvps" ON rsvps
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert on rsvps" ON rsvps
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow users to view own rsvps" ON rsvps
    FOR SELECT USING (user_id = auth.jwt() ->> 'sub' OR (auth.jwt()->'claims'->'publicMetadata'->>'role' = 'admin'));

CREATE POLICY "Allow admin delete on rsvps" ON rsvps
    FOR DELETE USING (
        (auth.jwt()->'claims'->'publicMetadata'->>'role' = 'admin')
    );

-- =============================================================================
-- CONTACT SUBMISSIONS POLICIES
-- =============================================================================

CREATE POLICY "Allow public insert on contact_submissions" ON contact_submissions
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public read on contact_submissions" ON contact_submissions
    FOR SELECT USING (true);

CREATE POLICY "Allow users to view own contact_submissions" ON contact_submissions
    FOR SELECT USING (user_id = auth.jwt() ->> 'sub' OR (auth.jwt()->'claims'->'publicMetadata'->>'role' = 'admin'));

CREATE POLICY "Allow admin update on contact_submissions" ON contact_submissions
    FOR UPDATE USING (
        (auth.jwt()->'claims'->'publicMetadata'->>'role' = 'admin')
    );

-- =============================================================================
-- TRIVIA POLICIES
-- =============================================================================

CREATE POLICY "Allow public read on trivia_questions" ON trivia_questions
    FOR SELECT USING (true);

CREATE POLICY "Allow admin insert on trivia_questions" ON trivia_questions
    FOR INSERT WITH CHECK (
        (auth.jwt()->'claims'->'publicMetadata'->>'role' = 'admin')
    );

CREATE POLICY "Allow public read on trivia_answers" ON trivia_answers
    FOR SELECT USING (true);

CREATE POLICY "Allow admin insert on trivia_answers" ON trivia_answers
    FOR INSERT WITH CHECK (
        (auth.jwt()->'claims'->'publicMetadata'->>'role' = 'admin')
    );

CREATE POLICY "Allow users to view own trivia scores" ON user_trivia_scores
    FOR SELECT USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Allow users to insert own trivia scores" ON user_trivia_scores
    FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'sub');

-- =============================================================================
-- CLASSIFICATION CACHE POLICIES
-- =============================================================================

CREATE POLICY "Allow public read on classification_cache" ON classification_cache
    FOR SELECT USING (true);

CREATE POLICY "Allow public insert on classification_cache" ON classification_cache
    FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update on classification_cache" ON classification_cache
    FOR UPDATE USING (true);

-- =============================================================================
-- BETIS NEWS POLICIES
-- =============================================================================

CREATE POLICY "Allow public read access on betis_news" ON betis_news
    FOR SELECT USING (true);

CREATE POLICY "Allow admin insert on betis_news" ON betis_news
    FOR INSERT WITH CHECK (
        (auth.jwt()->'claims'->'publicMetadata'->>'role' = 'admin')
    );

CREATE POLICY "Allow admin update on betis_news" ON betis_news
    FOR UPDATE USING (
        (auth.jwt()->'claims'->'publicMetadata'->>'role' = 'admin')
    );

CREATE POLICY "Allow admin delete on betis_news" ON betis_news
    FOR DELETE USING (
        (auth.jwt()->'claims'->'publicMetadata'->>'role' = 'admin')
    );

-- =============================================================================
-- PLAYERS POLICIES (CORRECTED JWT PATH)
-- =============================================================================

CREATE POLICY "Public read access" ON players
    FOR SELECT USING (true);

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

-- =============================================================================
-- NEWS_PLAYERS POLICIES (CORRECTED JWT PATH)
-- =============================================================================

CREATE POLICY "Public read access" ON news_players
    FOR SELECT USING (true);

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

-- ===============================================================================
-- 7. GRANTS AND PERMISSIONS
-- ===============================================================================

-- Grant specific permissions following principle of least privilege
-- Public read tables
GRANT SELECT ON TABLE matches TO anon, authenticated;
GRANT SELECT ON TABLE trivia_questions TO anon, authenticated;
GRANT SELECT ON TABLE trivia_answers TO anon, authenticated;
GRANT SELECT ON TABLE classification_cache TO anon, authenticated;
GRANT SELECT ON TABLE betis_news TO anon, authenticated;
GRANT SELECT ON TABLE players TO anon, authenticated;
GRANT SELECT ON TABLE news_players TO anon, authenticated;

-- Public read/write tables
GRANT SELECT, INSERT ON TABLE rsvps TO anon, authenticated;
GRANT SELECT, INSERT ON TABLE contact_submissions TO anon, authenticated;
GRANT SELECT, INSERT ON TABLE user_trivia_scores TO anon, authenticated;

-- Sequences (allow usage and select for ID generation)
GRANT USAGE, SELECT ON SEQUENCE matches_id_seq TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE rsvps_id_seq TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE contact_submissions_id_seq TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE user_trivia_scores_id_seq TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE classification_cache_id_seq TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE betis_news_id_seq TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE players_id_seq TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE news_players_id_seq TO anon, authenticated;

-- Functions (allow execute for cleanup and utility functions)
GRANT EXECUTE ON FUNCTION update_updated_at_column() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_rsvps() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION cleanup_old_contact_submissions() TO anon, authenticated;

-- ===============================================================================
-- 8. COMMENTS (Documentation)
-- ===============================================================================

-- Table comments
COMMENT ON TABLE matches IS 'Football match information with external API integration';
COMMENT ON TABLE rsvps IS 'User RSVPs for match viewing parties at Polwarth Tavern';
COMMENT ON TABLE contact_submissions IS 'Contact form submissions with status tracking';
COMMENT ON TABLE trivia_questions IS 'Trivia questions for daily quiz game';
COMMENT ON TABLE trivia_answers IS 'Multiple choice answers for trivia questions';
COMMENT ON TABLE user_trivia_scores IS 'Daily trivia scores for authenticated users';
COMMENT ON TABLE classification_cache IS 'Cached football league standings from external API';
COMMENT ON TABLE betis_news IS 'Betis news from RSS feeds. Transfer rumors: ai_probability > 0, regular news: ai_probability = 0.';
COMMENT ON TABLE players IS 'Normalized player tracking for transfer rumors';
COMMENT ON TABLE news_players IS 'Junction table linking news to players with roles';

-- Function comments
COMMENT ON FUNCTION cleanup_old_non_rumor_news(INTEGER) IS
    'Delete non-rumor news (ai_probability = 0) older than retention period. Default: 24 hours. Requires admin role.';

-- betis_news column comments
COMMENT ON COLUMN betis_news.ai_probability IS 'AI credibility score: >0 = transfer rumor, 0 = regular news, NULL = unanalyzed';
COMMENT ON COLUMN betis_news.content_hash IS 'SHA256 hash of title+description for exact duplicate detection';
COMMENT ON COLUMN betis_news.is_duplicate IS 'True if detected as duplicate of another item';
COMMENT ON COLUMN betis_news.similarity_score IS 'Fuzzball similarity score (0-100) when is_duplicate=true';
COMMENT ON COLUMN betis_news.transfer_direction IS 'Transfer direction: in=arriving, out=leaving, unknown=unclear, NULL=not transfer';
COMMENT ON COLUMN betis_news.transfer_status IS 'Transfer status: rumor=active, confirmed=done, denied=failed, NULL=not transfer';
COMMENT ON COLUMN betis_news.admin_context IS 'Admin-provided context for AI re-analysis';
COMMENT ON COLUMN betis_news.needs_reassessment IS 'Flag indicating this news item is queued for AI re-analysis';
COMMENT ON COLUMN betis_news.reassessed_at IS 'Timestamp of the last AI reassessment';
COMMENT ON COLUMN betis_news.reassessed_by IS 'Clerk user ID of the admin who requested reassessment';
COMMENT ON COLUMN betis_news.is_hidden IS 'Hidden by admin (kept for audit, not shown publicly)';
COMMENT ON COLUMN betis_news.hidden_at IS 'Timestamp when item was hidden';
COMMENT ON COLUMN betis_news.hidden_by IS 'User ID who hid the item';
COMMENT ON COLUMN betis_news.hidden_reason IS 'Reason for hiding';
COMMENT ON COLUMN betis_news.is_relevant_to_betis IS 'AI-determined relevance to Real Betis';
COMMENT ON COLUMN betis_news.irrelevance_reason IS 'AI explanation for why news is not relevant';

-- players column comments
COMMENT ON COLUMN players.aliases IS 'Array of alternative normalized names for this player (nicknames, full names)';
COMMENT ON COLUMN players.is_current_squad IS 'True if player is currently in the Betis squad. Used to help AI distinguish between departing players and transfer targets.';
COMMENT ON COLUMN players.display_name IS 'Short display name for UI (e.g., Isco instead of Francisco Roman Alarcon). If NULL, use name field.';
COMMENT ON COLUMN players.external_id IS 'Football-Data.org player ID for API matching and deduplication';

-- Index comments
COMMENT ON INDEX idx_betis_news_cleanup IS 'Optimizes cleanup queries by indexing non-rumor news by publication date';

-- ===============================================================================
-- SCHEMA SETUP COMPLETE
-- ===============================================================================

SELECT 'Database schema setup completed successfully!' AS status;
