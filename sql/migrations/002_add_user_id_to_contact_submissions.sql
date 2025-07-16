-- Migration: Add user_id column to contact_submissions table
-- Purpose: Link contact submissions to authenticated users for dashboard display
-- Date: 2025-07-16

-- Add user_id column to contact_submissions table
ALTER TABLE contact_submissions 
ADD COLUMN user_id TEXT;

-- Add index for faster user-based queries
CREATE INDEX IF NOT EXISTS idx_contact_submissions_user_id ON contact_submissions(user_id);

-- Add index for email-based linking queries (used during webhook processing)
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(email);

-- Add index for combined user_id and created_at for dashboard sorting
CREATE INDEX IF NOT EXISTS idx_contact_submissions_user_id_created_at ON contact_submissions(user_id, created_at DESC);

-- Add comment to document the purpose
COMMENT ON COLUMN contact_submissions.user_id IS 'Clerk user ID for linking contact submissions to authenticated users. Null for anonymous submissions.';

-- Verify the changes
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'contact_submissions' 
AND column_name = 'user_id';
