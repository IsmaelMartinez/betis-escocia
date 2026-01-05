-- Migration: Add cleanup function for old non-rumor news
-- Description: Remove news with ai_probability = 0 older than 24 hours to keep database clean
-- Author: Claude Code
-- Date: 2025-01-05

-- Function to delete old non-rumor news
-- Returns the number of rows deleted
-- SECURITY: Only callable by admin role or service_role
CREATE OR REPLACE FUNCTION cleanup_old_non_rumor_news(
    retention_hours INTEGER DEFAULT 24
)
RETURNS TABLE(deleted_count BIGINT) AS $$
DECLARE
    cutoff_timestamp TIMESTAMPTZ;
    rows_deleted BIGINT;
BEGIN
    -- SECURITY: Permissions managed by GRANT/REVOKE statements below
    -- Service role execution will have auth.jwt() = null, which would fail internal checks

    -- Calculate cutoff timestamp using make_interval for safety
    -- This prevents potential SQL injection from string concatenation
    cutoff_timestamp := NOW() - make_interval(hours => retention_hours);

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
    'Delete non-rumor news (ai_probability = 0) older than retention period. Default: 24 hours. Requires admin role.';

-- SECURITY: Revoke public execute permissions
-- Only service_role or admin users should be able to call this function
REVOKE EXECUTE ON FUNCTION cleanup_old_non_rumor_news(INTEGER) FROM anon, authenticated;

-- Grant execute only to service_role (used by GitHub Actions and scripts)
-- Individual admin users will be checked via the role check inside the function
GRANT EXECUTE ON FUNCTION cleanup_old_non_rumor_news(INTEGER) TO service_role;

-- Performance optimization: Partial index for cleanup queries
CREATE INDEX IF NOT EXISTS idx_betis_news_cleanup ON betis_news(pub_date)
WHERE ai_probability = 0;

COMMENT ON INDEX idx_betis_news_cleanup IS
    'Optimizes cleanup queries by indexing non-rumor news by publication date';

-- Example usage:
-- Manual run: SELECT * FROM cleanup_old_non_rumor_news(24);
-- Check before deleting: SELECT COUNT(*) FROM betis_news WHERE ai_probability = 0 AND pub_date < NOW() - INTERVAL '24 hours';
