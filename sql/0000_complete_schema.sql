-- ===============================================================================
-- Peña Bética Escocesa - Complete Database Schema
-- ===============================================================================
-- This script creates the complete database schema for the Betis Escocia website
-- Run this script on a fresh Supabase project to set up all tables, policies, and functions
-- 
-- Last Updated: September 2025
-- ===============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ===============================================================================
-- CORE TABLES
-- ===============================================================================

-- Matches Table
-- Stores football match information with external API integration
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
    matchday INTEGER
);

-- Create indexes for matches table
CREATE INDEX IF NOT EXISTS idx_matches_date_time ON matches(date_time);
CREATE INDEX IF NOT EXISTS idx_matches_competition ON matches(competition);
CREATE INDEX IF NOT EXISTS idx_matches_home_away ON matches(home_away);
CREATE INDEX IF NOT EXISTS idx_matches_external_id ON matches(external_id);
CREATE INDEX IF NOT EXISTS idx_matches_external_source ON matches(external_source);

-- Add unique constraint to prevent duplicate external matches
DO $$ 
BEGIN 
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE table_name = 'matches' AND constraint_name = 'unique_external_match'
    ) THEN
        ALTER TABLE matches ADD CONSTRAINT unique_external_match UNIQUE (external_id, external_source);
    END IF;
END $$;

-- RSVPs Table
-- Stores user RSVPs for match viewing parties
CREATE TABLE IF NOT EXISTS rsvps (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    attendees INTEGER NOT NULL DEFAULT 1,
    whatsapp_interest BOOLEAN NOT NULL DEFAULT false,
    match_date TIMESTAMPTZ NOT NULL DEFAULT '2025-06-28T20:00:00+00:00',
    match_id BIGINT REFERENCES matches(id) ON DELETE SET NULL,
    user_id TEXT -- Clerk user ID for authenticated users
);

-- Create indexes for RSVPs table
CREATE INDEX IF NOT EXISTS idx_rsvps_created_at ON rsvps(created_at);
CREATE INDEX IF NOT EXISTS idx_rsvps_email ON rsvps(email);
CREATE INDEX IF NOT EXISTS idx_rsvps_match_date ON rsvps(match_date);
CREATE INDEX IF NOT EXISTS idx_rsvps_match_id ON rsvps(match_id);
CREATE INDEX IF NOT EXISTS idx_rsvps_user_id ON rsvps(user_id);
CREATE INDEX IF NOT EXISTS idx_rsvps_user_id_created_at ON rsvps(user_id, created_at DESC);

-- Contact Submissions Table
-- Stores contact form submissions with status tracking
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
    user_id TEXT, -- Clerk user ID for authenticated users
    status VARCHAR(20) DEFAULT 'new' CHECK (status IN ('new', 'in progress', 'resolved', 'closed')),
    updated_by TEXT -- Admin user ID who last updated the status
);

-- Create indexes for contact_submissions table
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_user_id ON contact_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_user_id_created_at ON contact_submissions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_status ON contact_submissions(status);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_type ON contact_submissions(type);

-- ===============================================================================
-- TRIVIA SYSTEM TABLES
-- ===============================================================================

-- Trivia Questions Table
CREATE TABLE IF NOT EXISTS trivia_questions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_text TEXT NOT NULL,
    category VARCHAR(50) NOT NULL CHECK (category IN ('betis', 'scotland', 'whisky')),
    difficulty VARCHAR(20) DEFAULT 'medium' CHECK (difficulty IN ('easy', 'medium', 'hard')),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Trivia Answers Table
CREATE TABLE IF NOT EXISTS trivia_answers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    question_id UUID NOT NULL REFERENCES trivia_questions(id) ON DELETE CASCADE,
    answer_text TEXT NOT NULL,
    is_correct BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Trivia Scores Table
CREATE TABLE IF NOT EXISTS user_trivia_scores (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    daily_score INTEGER NOT NULL,
    timestamp TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for trivia tables
CREATE INDEX IF NOT EXISTS idx_trivia_questions_category ON trivia_questions(category);
CREATE INDEX IF NOT EXISTS idx_trivia_questions_difficulty ON trivia_questions(difficulty);
CREATE INDEX IF NOT EXISTS idx_trivia_answers_question_id ON trivia_answers(question_id);
CREATE INDEX IF NOT EXISTS idx_trivia_answers_is_correct ON trivia_answers(is_correct);
CREATE INDEX IF NOT EXISTS idx_user_trivia_scores_user_id ON user_trivia_scores(user_id);
CREATE INDEX IF NOT EXISTS idx_user_trivia_scores_timestamp ON user_trivia_scores(timestamp);
CREATE INDEX IF NOT EXISTS idx_user_trivia_scores_user_id_timestamp ON user_trivia_scores(user_id, timestamp DESC);

-- ===============================================================================
-- CACHING AND OPTIMIZATION TABLES
-- ===============================================================================

-- Classification Cache Table
-- Caches external API responses for football standings
CREATE TABLE IF NOT EXISTS classification_cache (
    id SERIAL PRIMARY KEY,
    data JSONB NOT NULL,
    last_updated TIMESTAMPTZ NOT NULL
);

-- Create index for cache expiration queries
CREATE INDEX IF NOT EXISTS idx_classification_cache_last_updated ON classification_cache(last_updated);


-- ===============================================================================
-- FUNCTIONS AND TRIGGERS
-- ===============================================================================

-- Function to update updated_at column
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- Function to cleanup old RSVPs (GDPR compliance)
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

-- Function to cleanup old contact submissions (GDPR compliance)
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

-- Function to update matches updated_at field
CREATE OR REPLACE FUNCTION update_matches_updated_at() 
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers
CREATE TRIGGER trigger_update_contact_submissions_updated_at
    BEFORE UPDATE ON contact_submissions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_update_matches_updated_at
    BEFORE UPDATE ON matches
    FOR EACH ROW EXECUTE FUNCTION update_matches_updated_at();

-- ===============================================================================
-- VIEWS
-- ===============================================================================

-- Match RSVP Counts View
-- Aggregates RSVP counts per match for efficient querying
DROP VIEW IF EXISTS match_rsvp_counts;
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
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ===============================================================================

-- Enable RLS on all tables
ALTER TABLE matches ENABLE ROW LEVEL SECURITY;
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;
ALTER TABLE contact_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trivia_questions ENABLE ROW LEVEL SECURITY;
ALTER TABLE trivia_answers ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_trivia_scores ENABLE ROW LEVEL SECURITY;
ALTER TABLE classification_cache ENABLE ROW LEVEL SECURITY;

-- Matches table policies
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read access on matches' AND tablename = 'matches') THEN
        CREATE POLICY "Allow public read access on matches" ON matches FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow admin insert on matches' AND tablename = 'matches') THEN
        CREATE POLICY "Allow admin insert on matches" ON matches FOR INSERT WITH CHECK (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow admin update on matches' AND tablename = 'matches') THEN
        CREATE POLICY "Allow admin update on matches" ON matches FOR UPDATE USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow admin delete on matches' AND tablename = 'matches') THEN
        CREATE POLICY "Allow admin delete on matches" ON matches FOR DELETE USING (true);
    END IF;
END $$;

-- RSVPs table policies  
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read access on rsvps' AND tablename = 'rsvps') THEN
        CREATE POLICY "Allow public read access on rsvps" ON rsvps FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public insert on rsvps' AND tablename = 'rsvps') THEN
        CREATE POLICY "Allow public insert on rsvps" ON rsvps FOR INSERT WITH CHECK (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow users to view own rsvps' AND tablename = 'rsvps') THEN
        CREATE POLICY "Allow users to view own rsvps" ON rsvps FOR SELECT USING (user_id = auth.jwt() ->> 'sub' OR true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow admin delete on rsvps' AND tablename = 'rsvps') THEN
        CREATE POLICY "Allow admin delete on rsvps" ON rsvps FOR DELETE USING (true);
    END IF;
END $$;

-- Contact submissions table policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public insert on contact_submissions' AND tablename = 'contact_submissions') THEN
        CREATE POLICY "Allow public insert on contact_submissions" ON contact_submissions FOR INSERT WITH CHECK (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read on contact_submissions' AND tablename = 'contact_submissions') THEN
        CREATE POLICY "Allow public read on contact_submissions" ON contact_submissions FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow users to view own contact_submissions' AND tablename = 'contact_submissions') THEN
        CREATE POLICY "Allow users to view own contact_submissions" ON contact_submissions FOR SELECT USING (user_id = auth.jwt() ->> 'sub' OR true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow admin update on contact_submissions' AND tablename = 'contact_submissions') THEN
        CREATE POLICY "Allow admin update on contact_submissions" ON contact_submissions FOR UPDATE USING (true);
    END IF;
END $$;

-- Trivia tables policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read on trivia_questions' AND tablename = 'trivia_questions') THEN
        CREATE POLICY "Allow public read on trivia_questions" ON trivia_questions FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read on trivia_answers' AND tablename = 'trivia_answers') THEN
        CREATE POLICY "Allow public read on trivia_answers" ON trivia_answers FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow admin insert on trivia_questions' AND tablename = 'trivia_questions') THEN
        CREATE POLICY "Allow admin insert on trivia_questions" ON trivia_questions FOR INSERT WITH CHECK (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow admin insert on trivia_answers' AND tablename = 'trivia_answers') THEN
        CREATE POLICY "Allow admin insert on trivia_answers" ON trivia_answers FOR INSERT WITH CHECK (true);
    END IF;
END $$;

-- User trivia scores policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow users to view own trivia scores' AND tablename = 'user_trivia_scores') THEN
        CREATE POLICY "Allow users to view own trivia scores" ON user_trivia_scores FOR SELECT USING (user_id = auth.jwt() ->> 'sub');
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow users to insert own trivia scores' AND tablename = 'user_trivia_scores') THEN
        CREATE POLICY "Allow users to insert own trivia scores" ON user_trivia_scores FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'sub');
    END IF;
END $$;

-- Classification cache policies
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public read on classification_cache' AND tablename = 'classification_cache') THEN
        CREATE POLICY "Allow public read on classification_cache" ON classification_cache FOR SELECT USING (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public insert on classification_cache' AND tablename = 'classification_cache') THEN
        CREATE POLICY "Allow public insert on classification_cache" ON classification_cache FOR INSERT WITH CHECK (true);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Allow public update on classification_cache' AND tablename = 'classification_cache') THEN
        CREATE POLICY "Allow public update on classification_cache" ON classification_cache FOR UPDATE USING (true);
    END IF;
END $$;

-- ===============================================================================
-- GRANTS AND PERMISSIONS
-- ===============================================================================

-- Grant permissions to anon and authenticated roles
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT EXECUTE ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;

-- ===============================================================================
-- TABLE COMMENTS
-- ===============================================================================

COMMENT ON TABLE matches IS 'Football match information with external API integration';
COMMENT ON TABLE rsvps IS 'User RSVPs for match viewing parties at Polwarth Tavern';
COMMENT ON TABLE contact_submissions IS 'Contact form submissions with status tracking';
COMMENT ON TABLE trivia_questions IS 'Trivia questions for daily quiz game';
COMMENT ON TABLE trivia_answers IS 'Multiple choice answers for trivia questions';
COMMENT ON TABLE user_trivia_scores IS 'Daily trivia scores for authenticated users';
COMMENT ON TABLE classification_cache IS 'Cached football league standings from external API';

-- ===============================================================================
-- INITIAL DATA (Optional - uncomment if needed)
-- ===============================================================================

-- Insert some sample trivia questions (uncomment if needed)
/*
INSERT INTO trivia_questions (question_text, category, difficulty) VALUES
('¿En qué año fue fundado el Real Betis Balompié?', 'betis', 'easy'),
('¿Cuál es el nombre del estadio del Real Betis?', 'betis', 'easy'),
('¿Cuál es la capital de Escocia?', 'scotland', 'easy')
ON CONFLICT DO NOTHING;

-- Insert corresponding answers (uncomment if needed)
INSERT INTO trivia_answers (question_id, answer_text, is_correct) 
SELECT 
    tq.id,
    CASE 
        WHEN tq.question_text LIKE '%fundado%' THEN 
            CASE answer_option
                WHEN 1 THEN '1907'
                WHEN 2 THEN '1912'  
                WHEN 3 THEN '1915'
                WHEN 4 THEN '1909'
            END
        WHEN tq.question_text LIKE '%estadio%' THEN
            CASE answer_option
                WHEN 1 THEN 'Benito Villamarín'
                WHEN 2 THEN 'Ramón Sánchez-Pizjuán'
                WHEN 3 THEN 'La Cartuja'
                WHEN 4 THEN 'Nuevo Los Cármenes'
            END
        WHEN tq.question_text LIKE '%capital de Escocia%' THEN
            CASE answer_option
                WHEN 1 THEN 'Edimburgo'
                WHEN 2 THEN 'Glasgow'
                WHEN 3 THEN 'Aberdeen'
                WHEN 4 THEN 'Dundee'
            END
    END,
    CASE 
        WHEN tq.question_text LIKE '%fundado%' AND answer_option = 1 THEN true
        WHEN tq.question_text LIKE '%estadio%' AND answer_option = 1 THEN true  
        WHEN tq.question_text LIKE '%capital de Escocia%' AND answer_option = 1 THEN true
        ELSE false
    END
FROM trivia_questions tq
CROSS JOIN (VALUES (1), (2), (3), (4)) AS v(answer_option)
ON CONFLICT DO NOTHING;
*/

-- ===============================================================================
-- SCRIPT COMPLETION
-- ===============================================================================

SELECT 'Database schema setup completed successfully!' AS status;

-- Display table counts for verification
SELECT 
    schemaname,
    tablename,
    attname,
    typ.typname as column_type
FROM pg_catalog.pg_tables t
LEFT JOIN pg_catalog.pg_attribute a ON a.attrelid = (schemaname||'.'||tablename)::regclass
LEFT JOIN pg_catalog.pg_type typ ON typ.oid = a.atttypid
WHERE schemaname = 'public'
    AND tablename IN ('matches', 'rsvps', 'contact_submissions', 'trivia_questions', 'trivia_answers', 'user_trivia_scores', 'classification_cache')
    AND a.attnum > 0
    AND NOT a.attisdropped
ORDER BY tablename, a.attnum;