-- Master Migration Script: Add user_id columns for Clerk authentication
-- Purpose: Run all migrations to add user_id fields for email-based user association
-- Date: 2025-07-16
-- Related: Clerk Authentication Integration PRD - Phase 2

-- =============================================================================
-- BACKUP NOTICE
-- =============================================================================
-- Before running this script, ensure you have a backup of your database:
-- pg_dump -h your_host -U your_user -d your_db > backup_before_user_id_migration.sql

-- =============================================================================
-- MIGRATION 1: Add user_id to rsvps table
-- =============================================================================
\echo 'Running migration 001: Add user_id to rsvps table'

-- Add user_id column to rsvps table
ALTER TABLE rsvps 
ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_rsvps_user_id ON rsvps(user_id);
CREATE INDEX IF NOT EXISTS idx_rsvps_email ON rsvps(email);
CREATE INDEX IF NOT EXISTS idx_rsvps_user_id_created_at ON rsvps(user_id, created_at DESC);

-- Add comment
COMMENT ON COLUMN rsvps.user_id IS 'Clerk user ID for linking RSVP submissions to authenticated users. Null for anonymous submissions.';

\echo 'Migration 001: Completed successfully'

-- =============================================================================
-- MIGRATION 2: Add user_id to contact_submissions table
-- =============================================================================
\echo 'Running migration 002: Add user_id to contact_submissions table'

-- Add user_id column to contact_submissions table
ALTER TABLE contact_submissions 
ADD COLUMN IF NOT EXISTS user_id TEXT;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_contact_submissions_user_id ON contact_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_email ON contact_submissions(email);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_user_id_created_at ON contact_submissions(user_id, created_at DESC);

-- Add comment
COMMENT ON COLUMN contact_submissions.user_id IS 'Clerk user ID for linking contact submissions to authenticated users. Null for anonymous submissions.';

\echo 'Migration 002: Completed successfully'

-- =============================================================================
-- VERIFICATION
-- =============================================================================
\echo 'Verifying migrations...'

-- Check rsvps table structure
SELECT 'rsvps' as table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'rsvps' 
AND column_name = 'user_id';

-- Check contact_submissions table structure
SELECT 'contact_submissions' as table_name, column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'contact_submissions' 
AND column_name = 'user_id';

-- Check indexes
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes 
WHERE tablename IN ('rsvps', 'contact_submissions')
AND indexname LIKE '%user_id%'
ORDER BY tablename, indexname;

\echo 'All migrations completed successfully!'
\echo 'Next steps:'
\echo '1. Test the Clerk webhook endpoint'
\echo '2. Verify email-based user association'
\echo '3. Create user dashboard to display linked data'
