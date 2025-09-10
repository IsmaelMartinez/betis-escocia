-- Fix notification preferences policies for Clerk authentication
-- The original policies were designed for Supabase Auth but we use Clerk

-- First, drop all existing policies
DROP POLICY IF EXISTS "Users can view own notification preferences" ON notification_preferences;
DROP POLICY IF EXISTS "Users can insert own notification preferences" ON notification_preferences;
DROP POLICY IF EXISTS "Users can update own notification preferences" ON notification_preferences;
DROP POLICY IF EXISTS "Admins can view all notification preferences" ON notification_preferences;
DROP POLICY IF EXISTS "Admins can update all notification preferences" ON notification_preferences;
DROP POLICY IF EXISTS "Admins can insert all notification preferences" ON notification_preferences;

-- Create new policies that work with Clerk authentication
-- Since we're using Clerk, we rely on application-level authentication in the API routes
-- The checkAdminRole() function validates the user before reaching the database

-- Policy: Allow authenticated requests to view notification preferences
-- (Admin validation is done in the API layer via checkAdminRole())
CREATE POLICY "Allow authenticated notification preferences access" 
  ON notification_preferences FOR SELECT 
  USING (true);

-- Policy: Allow authenticated requests to insert notification preferences
CREATE POLICY "Allow authenticated notification preferences insert" 
  ON notification_preferences FOR INSERT 
  WITH CHECK (true);

-- Policy: Allow authenticated requests to update notification preferences
CREATE POLICY "Allow authenticated notification preferences update" 
  ON notification_preferences FOR UPDATE 
  USING (true);

-- Policy: Allow authenticated requests to delete notification preferences
CREATE POLICY "Allow authenticated notification preferences delete" 
  ON notification_preferences FOR DELETE 
  USING (true);

-- Add comment explaining the approach
COMMENT ON TABLE notification_preferences IS 'Stores user notification preferences. RLS policies are permissive because authentication and authorization are handled at the application layer via Clerk + checkAdminRole()';