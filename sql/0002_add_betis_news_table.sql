-- Migration: Add betis_news table for Soylenti feature
-- Description: Store all Betis news with AI analysis. Transfer rumors have ai_probability > 0.
-- Author: Claude Code
-- Date: 2025-12-27

-- Betis news table for storing RSS items with AI analysis
CREATE TABLE IF NOT EXISTS betis_news (
    -- Primary key
    id BIGSERIAL PRIMARY KEY,

    -- Content fields (from RSS)
    title VARCHAR(500) NOT NULL,
    link TEXT NOT NULL,
    pub_date TIMESTAMPTZ NOT NULL,
    source VARCHAR(100) NOT NULL,  -- 'Google News (Fichajes)' | 'Google News (General)' | 'BetisWeb'
    description TEXT,

    -- AI analysis fields
    -- ai_probability > 0: Transfer rumor with credibility score
    -- ai_probability = 0: Regular news (confirmed non-transfer)
    -- ai_probability = NULL: Not yet analyzed
    ai_probability NUMERIC(5, 2) CHECK (ai_probability >= 0 AND ai_probability <= 100),
    ai_analysis TEXT,  -- Gemini's reasoning/explanation
    ai_analyzed_at TIMESTAMPTZ,

    -- Deduplication fields
    content_hash VARCHAR(64) NOT NULL,  -- SHA256 of title+description
    is_duplicate BOOLEAN DEFAULT false,
    duplicate_of_id BIGINT REFERENCES betis_news(id),
    similarity_score NUMERIC(5, 2),  -- Fuzzball score (0-100) for detected duplicates

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_betis_news_pub_date ON betis_news(pub_date DESC);
CREATE INDEX IF NOT EXISTS idx_betis_news_source ON betis_news(source);
CREATE INDEX IF NOT EXISTS idx_betis_news_content_hash ON betis_news(content_hash);
CREATE INDEX IF NOT EXISTS idx_betis_news_is_duplicate ON betis_news(is_duplicate);
CREATE INDEX IF NOT EXISTS idx_betis_news_ai_probability ON betis_news(ai_probability DESC);
CREATE INDEX IF NOT EXISTS idx_betis_news_created_at ON betis_news(created_at DESC);

-- Unique constraint on link to prevent exact duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_betis_news_unique_link ON betis_news(link);

-- Trigger for updated_at
CREATE TRIGGER trigger_update_betis_news_updated_at
    BEFORE UPDATE ON betis_news
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS: Public read, admin write
ALTER TABLE betis_news ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow public read access on betis_news" ON betis_news;
    DROP POLICY IF EXISTS "Allow admin insert on betis_news" ON betis_news;
    DROP POLICY IF EXISTS "Allow admin update on betis_news" ON betis_news;
    DROP POLICY IF EXISTS "Allow admin delete on betis_news" ON betis_news;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- Create RLS policies
CREATE POLICY "Allow public read access on betis_news" ON betis_news
    FOR SELECT USING (true);

CREATE POLICY "Allow admin insert on betis_news" ON betis_news
    FOR INSERT WITH CHECK (
        ((auth.jwt()->>'publicMetadata')::jsonb->>'role' = 'admin')
    );

CREATE POLICY "Allow admin update on betis_news" ON betis_news
    FOR UPDATE USING (
        ((auth.jwt()->>'publicMetadata')::jsonb->>'role' = 'admin')
    );

CREATE POLICY "Allow admin delete on betis_news" ON betis_news
    FOR DELETE USING (
        ((auth.jwt()->>'publicMetadata')::jsonb->>'role' = 'admin')
    );

-- Comments for documentation
COMMENT ON TABLE betis_news IS 'Betis news from RSS feeds. Transfer rumors: ai_probability > 0, regular news: ai_probability = 0.';
COMMENT ON COLUMN betis_news.ai_probability IS 'AI credibility score: >0 = transfer rumor, 0 = regular news, NULL = unanalyzed';
COMMENT ON COLUMN betis_news.content_hash IS 'SHA256 hash of title+description for exact duplicate detection';
COMMENT ON COLUMN betis_news.is_duplicate IS 'True if detected as duplicate of another item';
COMMENT ON COLUMN betis_news.similarity_score IS 'Fuzzball similarity score (0-100) when is_duplicate=true';

-- Grant permissions
GRANT ALL ON TABLE betis_news TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE betis_news_id_seq TO anon, authenticated;
