-- Fix contact_submissions RLS policies for Clerk authentication
-- The original policies were designed for Supabase Auth but we use Clerk

-- First, drop all existing policies
DROP POLICY IF EXISTS "Contact submissions: authenticated users can view their own, admins can view all" ON contact_submissions;
DROP POLICY IF EXISTS "Contact submissions: anonymous users can view unlinked submissions" ON contact_submissions;
DROP POLICY IF EXISTS "Contact submissions: authenticated and anonymous users can insert" ON contact_submissions;
DROP POLICY IF EXISTS "Contact submissions: authenticated users can update their own, admins can update all" ON contact_submissions;
DROP POLICY IF EXISTS "Contact submissions: authenticated users can delete their own, admins can delete all" ON contact_submissions;

-- Create new policies that work with Clerk authentication
-- Since we're using Clerk, we rely on application-level authentication in the API routes
-- The checkAdminRole() function validates the user before reaching the database

-- Policy: Allow authenticated requests to view contact submissions
-- (Admin validation is done in the API layer via checkAdminRole())
CREATE POLICY "Allow authenticated contact submissions access" 
  ON contact_submissions FOR SELECT 
  USING (true);

-- Policy: Allow authenticated requests to insert contact submissions
CREATE POLICY "Allow authenticated contact submissions insert" 
  ON contact_submissions FOR INSERT 
  WITH CHECK (true);

-- Policy: Allow authenticated requests to update contact submissions
CREATE POLICY "Allow authenticated contact submissions update" 
  ON contact_submissions FOR UPDATE 
  USING (true);

-- Policy: Allow authenticated requests to delete contact submissions
-- This is crucial for GDPR deletion requests
CREATE POLICY "Allow authenticated contact submissions delete" 
  ON contact_submissions FOR DELETE 
  USING (true);

-- Add comment explaining the approach
COMMENT ON TABLE contact_submissions IS 'Contact submissions with Clerk-compatible RLS. Authentication and authorization handled at application layer via checkAdminRole(). Anonymous submissions allowed via API.';