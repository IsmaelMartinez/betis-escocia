-- Migration: Add cleanup function for old non-rumor news
-- Description: Remove news with ai_probability = 0 older than 24 hours to keep database clean
-- Author: Claude Code
-- Date: 2025-01-05

-- Function to delete old non-rumor news
-- Returns the number of rows deleted
CREATE OR REPLACE FUNCTION cleanup_old_non_rumor_news(
    retention_hours INTEGER DEFAULT 24
)
RETURNS TABLE(deleted_count BIGINT) AS $$
DECLARE
    cutoff_timestamp TIMESTAMPTZ;
    rows_deleted BIGINT;
BEGIN
    -- Calculate cutoff timestamp
    cutoff_timestamp := NOW() - (retention_hours || ' hours')::INTERVAL;

    -- Delete news where:
    -- 1. ai_probability = 0 (confirmed non-transfer news, including hidden items)
    -- 2. pub_date is older than cutoff
    DELETE FROM betis_news
    WHERE ai_probability = 0
      AND pub_date < cutoff_timestamp;

    -- Get count of deleted rows
    GET DIAGNOSTICS rows_deleted = ROW_COUNT;

    -- Log the cleanup operation
    RAISE NOTICE 'Cleaned up % non-rumor news items older than % hours',
        rows_deleted, retention_hours;

    RETURN QUERY SELECT rows_deleted;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add comment
COMMENT ON FUNCTION cleanup_old_non_rumor_news(INTEGER) IS
    'Delete non-rumor news (ai_probability = 0) older than retention period. Default: 24 hours.';

-- Performance optimization: Partial index for cleanup queries
CREATE INDEX IF NOT EXISTS idx_betis_news_cleanup ON betis_news(pub_date)
WHERE ai_probability = 0;

COMMENT ON INDEX idx_betis_news_cleanup IS
    'Optimizes cleanup queries by indexing non-rumor news by publication date';

-- Example usage:
-- Manual run: SELECT * FROM cleanup_old_non_rumor_news(24);
-- Check before deleting: SELECT COUNT(*) FROM betis_news WHERE ai_probability = 0 AND pub_date < NOW() - INTERVAL '24 hours';
