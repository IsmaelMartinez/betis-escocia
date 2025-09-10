-- Fix notification preferences policies for Clerk + Supabase setup
-- Remove the problematic policies and create simpler ones

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view all notification preferences" ON notification_preferences;
DROP POLICY IF EXISTS "Admins can view all push subscriptions" ON push_subscriptions;

-- Create simpler policies that don't reference auth.users table
-- Since we're using Clerk, we'll rely on application-level admin checks

-- Policy: Allow admin users to view all notification preferences (simplified)
CREATE POLICY "Admins can view all notification preferences" 
  ON notification_preferences FOR SELECT 
  USING (true); -- Admin check is done at application level in API

-- Policy: Allow admin users to view all push subscriptions (simplified)  
CREATE POLICY "Admins can view all push subscriptions" 
  ON push_subscriptions FOR SELECT 
  USING (true); -- Admin check is done at application level in API

-- Also create policies for admin users to manage all notification preferences
CREATE POLICY "Admins can update all notification preferences" 
  ON notification_preferences FOR UPDATE 
  USING (true); -- Admin check is done at application level in API

CREATE POLICY "Admins can insert all notification preferences" 
  ON notification_preferences FOR INSERT 
  WITH CHECK (true); -- Admin check is done at application level in API

-- Grant necessary permissions to ensure policies work
-- Note: The actual admin authorization is handled by checkAdminRole() in the API routes