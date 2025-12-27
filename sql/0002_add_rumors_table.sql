-- Migration: Add rumors table for Phase 2 Soylenti feature
-- Description: Store analyzed transfer rumors with AI credibility scores and deduplication
-- Author: Claude Code
-- Date: 2025-12-27

-- Rumors table for storing analyzed transfer rumors
CREATE TABLE IF NOT EXISTS rumors (
    -- Primary key
    id BIGSERIAL PRIMARY KEY,

    -- Content fields (from RSS)
    title VARCHAR(500) NOT NULL,
    link TEXT NOT NULL,
    pub_date TIMESTAMPTZ NOT NULL,
    source VARCHAR(100) NOT NULL,  -- 'Google News (Fichajes)' | 'Google News (General)' | 'BetisWeb'
    description TEXT,

    -- AI analysis fields
    ai_probability NUMERIC(5, 2) CHECK (ai_probability >= 0 AND ai_probability <= 100),
    ai_analysis TEXT,  -- Gemini's reasoning/explanation
    ai_analyzed_at TIMESTAMPTZ,

    -- Deduplication fields
    content_hash VARCHAR(64) NOT NULL,  -- SHA256 of title+description
    is_duplicate BOOLEAN DEFAULT false,
    duplicate_of_id BIGINT REFERENCES rumors(id),  -- Points to original rumor if duplicate
    similarity_score NUMERIC(5, 2),  -- Fuzzball score (0-100) for detected duplicates

    -- Metadata
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_rumors_pub_date ON rumors(pub_date DESC);
CREATE INDEX IF NOT EXISTS idx_rumors_source ON rumors(source);
CREATE INDEX IF NOT EXISTS idx_rumors_content_hash ON rumors(content_hash);
CREATE INDEX IF NOT EXISTS idx_rumors_is_duplicate ON rumors(is_duplicate);
CREATE INDEX IF NOT EXISTS idx_rumors_ai_probability ON rumors(ai_probability DESC);
CREATE INDEX IF NOT EXISTS idx_rumors_created_at ON rumors(created_at DESC);

-- Unique constraint on link to prevent exact duplicates
CREATE UNIQUE INDEX IF NOT EXISTS idx_rumors_unique_link ON rumors(link);

-- Trigger for updated_at
CREATE TRIGGER trigger_update_rumors_updated_at
    BEFORE UPDATE ON rumors
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- RLS: Public read, admin write (no user submissions in Phase 2)
ALTER TABLE rumors ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotency)
DO $$
BEGIN
    DROP POLICY IF EXISTS "Allow public read access on rumors" ON rumors;
    DROP POLICY IF EXISTS "Allow admin insert on rumors" ON rumors;
    DROP POLICY IF EXISTS "Allow admin update on rumors" ON rumors;
    DROP POLICY IF EXISTS "Allow admin delete on rumors" ON rumors;
EXCEPTION
    WHEN undefined_object THEN NULL;
END $$;

-- Create RLS policies
CREATE POLICY "Allow public read access on rumors" ON rumors
    FOR SELECT USING (true);

CREATE POLICY "Allow admin insert on rumors" ON rumors
    FOR INSERT WITH CHECK (
        ((auth.jwt()->>'publicMetadata')::jsonb->>'role' = 'admin')
    );

CREATE POLICY "Allow admin update on rumors" ON rumors
    FOR UPDATE USING (
        ((auth.jwt()->>'publicMetadata')::jsonb->>'role' = 'admin')
    );

CREATE POLICY "Allow admin delete on rumors" ON rumors
    FOR DELETE USING (
        ((auth.jwt()->>'publicMetadata')::jsonb->>'role' = 'admin')
    );

-- Comments for documentation
COMMENT ON TABLE rumors IS 'Transfer rumors from RSS feeds with AI credibility analysis and deduplication';
COMMENT ON COLUMN rumors.ai_probability IS 'Gemini AI probability score (0-100) for rumor credibility';
COMMENT ON COLUMN rumors.content_hash IS 'SHA256 hash of title+description for exact duplicate detection';
COMMENT ON COLUMN rumors.is_duplicate IS 'True if Fuzzball detected this as a duplicate of another rumor';
COMMENT ON COLUMN rumors.similarity_score IS 'Fuzzball similarity score (0-100) when is_duplicate=true';

-- Grant permissions
GRANT ALL ON TABLE rumors TO anon, authenticated;
GRANT USAGE, SELECT ON SEQUENCE rumors_id_seq TO anon, authenticated;
