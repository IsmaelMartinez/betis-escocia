-- Add missing columns to the RSVP table
-- Run this SQL in your Supabase SQL Editor after creating the initial table
ALTER TABLE rsvps
ADD COLUMN attendees INTEGER NOT NULL DEFAULT 1,
    ADD COLUMN whatsapp_interest BOOLEAN NOT NULL DEFAULT false,
    ADD COLUMN match_date TIMESTAMPTZ NOT NULL DEFAULT '2025-06-28T20:00:00+00:00';
-- Create an index on match_date for efficient filtering
CREATE INDEX idx_rsvps_match_date ON rsvps(match_date);
-- Update the cleanup function to work with the new schema
-- Drop the existing function first (it had a different return type)
DROP FUNCTION IF EXISTS cleanup_old_rsvps();
-- Create the updated cleanup function
CREATE OR REPLACE FUNCTION cleanup_old_rsvps() RETURNS INTEGER AS $$
DECLARE deleted_count INTEGER;
BEGIN -- Delete RSVPs older than 1 month
DELETE FROM rsvps
WHERE created_at < NOW() - INTERVAL '1 month';
-- Get count of deleted rows
GET DIAGNOSTICS deleted_count = ROW_COUNT;
-- Log the cleanup operation
RAISE NOTICE 'Deleted % old RSVP records',
deleted_count;
RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;
-- Grant execute permission on the function
GRANT EXECUTE ON FUNCTION cleanup_old_rsvps() TO anon,
    authenticated;