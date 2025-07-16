-- Migration: Add user_id column to rsvps table
-- Purpose: Link RSVP submissions to authenticated users for dashboard display
-- Date: 2025-07-16

-- Add user_id column to rsvps table
ALTER TABLE rsvps 
ADD COLUMN user_id TEXT;

-- Add index for faster user-based queries
CREATE INDEX IF NOT EXISTS idx_rsvps_user_id ON rsvps(user_id);

-- Add index for email-based linking queries (used during webhook processing)
CREATE INDEX IF NOT EXISTS idx_rsvps_email ON rsvps(email);

-- Add index for combined user_id and created_at for dashboard sorting
CREATE INDEX IF NOT EXISTS idx_rsvps_user_id_created_at ON rsvps(user_id, created_at DESC);

-- Add comment to document the purpose
COMMENT ON COLUMN rsvps.user_id IS 'Clerk user ID for linking RSVP submissions to authenticated users. Null for anonymous submissions.';

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'rsvps' 
AND column_name = 'user_id';
