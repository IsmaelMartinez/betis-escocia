-- Cleanup function to delete RSVPs older than 1 month
-- This can be run manually or scheduled using pg_cron extension
-- Function to delete old RSVPs
CREATE OR REPLACE FUNCTION cleanup_old_rsvps() RETURNS INTEGER AS $$
DECLARE deleted_count INTEGER;
BEGIN -- Delete RSVPs older than 1 month
DELETE FROM rsvps
WHERE created_at < NOW() - INTERVAL '1 month';
-- Get count of deleted rows
GET DIAGNOSTICS deleted_count = ROW_COUNT;
-- Log the cleanup (optional)
RAISE NOTICE 'Deleted % old RSVP records',
deleted_count;
RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;
-- Optional: Set up automatic cleanup using pg_cron (if available)
-- Note: pg_cron extension needs to be enabled in Supabase dashboard
-- SELECT cron.schedule('cleanup-old-rsvps', '0 2 * * *', 'SELECT cleanup_old_rsvps();');
-- To manually run the cleanup function:
-- SELECT cleanup_old_rsvps();