-- DEPRECATED: Use comprehensive_gdpr_cleanup.sql instead
-- Cleanup function to delete RSVPs AND contact submissions older than 3 months (GDPR compliance)
-- This can be run manually or scheduled using pg_cron extension
CREATE OR REPLACE FUNCTION cleanup_old_rsvps() RETURNS INTEGER AS $$
DECLARE 
  rsvp_deleted_count INTEGER;
  contact_deleted_count INTEGER;
  total_deleted_count INTEGER;
BEGIN 
  -- Delete RSVPs older than 3 months (GDPR compliance)
  DELETE FROM rsvps
  WHERE created_at < NOW() - INTERVAL '3 months';
  -- Get count of deleted RSVP rows
  GET DIAGNOSTICS rsvp_deleted_count = ROW_COUNT;
  
  -- Delete contact submissions older than 3 months (GDPR compliance)
  DELETE FROM contact_submissions
  WHERE created_at < NOW() - INTERVAL '3 months';
  -- Get count of deleted contact rows
  GET DIAGNOSTICS contact_deleted_count = ROW_COUNT;
  
  -- Calculate total
  total_deleted_count := rsvp_deleted_count + contact_deleted_count;
  
  -- Log the cleanup
  RAISE NOTICE 'GDPR Cleanup: Deleted % RSVP records and % contact submissions (% total)',
    rsvp_deleted_count, contact_deleted_count, total_deleted_count;
    
  RETURN total_deleted_count;
END;
$$ LANGUAGE plpgsql;
-- Optional: Set up automatic cleanup using pg_cron (if available)
-- Note: pg_cron extension needs to be enabled in Supabase dashboard
-- SELECT cron.schedule('cleanup-old-rsvps', '0 2 * * *', 'SELECT cleanup_old_rsvps();');
-- To manually run the cleanup function:
-- SELECT cleanup_old_rsvps();