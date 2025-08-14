-- Comprehensive GDPR cleanup function to handle both RSVPs and contact submissions
-- This replaces the old cleanup_old_rsvps function with a more complete solution

-- Drop the old function if it exists
DROP FUNCTION IF EXISTS cleanup_old_rsvps();

-- Create comprehensive GDPR cleanup function
CREATE OR REPLACE FUNCTION cleanup_old_data() RETURNS TABLE(
  rsvps_deleted INTEGER,
  contacts_deleted INTEGER,
  total_deleted INTEGER
) AS $$
DECLARE 
  rsvp_count INTEGER;
  contact_count INTEGER;
BEGIN
  -- Delete RSVPs older than 3 months (GDPR retention period)
  DELETE FROM rsvps
  WHERE created_at < NOW() - INTERVAL '3 months';
  
  -- Get count of deleted RSVP rows
  GET DIAGNOSTICS rsvp_count = ROW_COUNT;
  
  -- Delete contact submissions older than 3 months (GDPR retention period)
  DELETE FROM contact_submissions
  WHERE created_at < NOW() - INTERVAL '3 months';
  
  -- Get count of deleted contact rows
  GET DIAGNOSTICS contact_count = ROW_COUNT;
  
  -- Log the cleanup
  RAISE NOTICE 'GDPR Cleanup: Deleted % RSVP records and % contact submissions (% total)', 
    rsvp_count, contact_count, (rsvp_count + contact_count);
  
  -- Return the results
  RETURN QUERY SELECT rsvp_count, contact_count, (rsvp_count + contact_count);
END;
$$ LANGUAGE plpgsql;

-- Create a function to cleanup specific user data (for GDPR deletion requests)
CREATE OR REPLACE FUNCTION cleanup_user_data(target_user_id VARCHAR) RETURNS TABLE(
  rsvps_deleted INTEGER,
  contacts_deleted INTEGER,
  total_deleted INTEGER
) AS $$
DECLARE 
  rsvp_count INTEGER;
  contact_count INTEGER;
BEGIN
  -- Delete all RSVPs for the specific user
  DELETE FROM rsvps
  WHERE user_id = target_user_id;
  
  -- Get count of deleted RSVP rows
  GET DIAGNOSTICS rsvp_count = ROW_COUNT;
  
  -- Delete all contact submissions for the specific user
  DELETE FROM contact_submissions
  WHERE user_id = target_user_id;
  
  -- Get count of deleted contact rows
  GET DIAGNOSTICS contact_count = ROW_COUNT;
  
  -- Log the cleanup
  RAISE NOTICE 'User Data Cleanup: Deleted % RSVP records and % contact submissions for user % (% total)', 
    rsvp_count, contact_count, target_user_id, (rsvp_count + contact_count);
  
  -- Return the results
  RETURN QUERY SELECT rsvp_count, contact_count, (rsvp_count + contact_count);
END;
$$ LANGUAGE plpgsql;

-- Optional: Set up automatic cleanup using pg_cron (if available)
-- Note: pg_cron extension needs to be enabled in Supabase dashboard
-- Runs daily at 2 AM
-- SELECT cron.schedule('gdpr-cleanup', '0 2 * * *', 'SELECT cleanup_old_data();');

-- To manually run the cleanup functions:
-- SELECT * FROM cleanup_old_data();  -- Clean old data (3+ months)
-- SELECT * FROM cleanup_user_data('user_12345');  -- Clean specific user data

-- Add helpful comments
COMMENT ON FUNCTION cleanup_old_data() IS 'GDPR compliant cleanup of RSVPs and contact submissions older than 3 months';
COMMENT ON FUNCTION cleanup_user_data(VARCHAR) IS 'GDPR deletion request handler - removes all data for a specific user';