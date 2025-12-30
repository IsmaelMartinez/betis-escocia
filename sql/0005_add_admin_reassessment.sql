-- Migration: Add admin reassessment fields to betis_news
-- Description: Allow admins to request AI re-analysis with context (wrong player, wrong team, etc.)
-- Author: Claude Code
-- Date: 2025-12-29

-- Add admin reassessment fields to betis_news table
ALTER TABLE betis_news
ADD COLUMN IF NOT EXISTS admin_context TEXT,
ADD COLUMN IF NOT EXISTS needs_reassessment BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS reassessed_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS reassessed_by VARCHAR(255);

-- Index for finding news items that need reassessment
CREATE INDEX IF NOT EXISTS idx_betis_news_needs_reassessment ON betis_news(needs_reassessment) WHERE needs_reassessment = true;

-- Comments for documentation
COMMENT ON COLUMN betis_news.admin_context IS 'Admin-provided context for AI re-analysis (e.g., "wrong player", "wrong team", "not a transfer rumor")';
COMMENT ON COLUMN betis_news.needs_reassessment IS 'Flag indicating this news item is queued for AI re-analysis';
COMMENT ON COLUMN betis_news.reassessed_at IS 'Timestamp of the last AI reassessment';
COMMENT ON COLUMN betis_news.reassessed_by IS 'Clerk user ID of the admin who requested reassessment';
