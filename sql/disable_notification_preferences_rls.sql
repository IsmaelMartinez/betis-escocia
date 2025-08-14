-- Temporary fix: Disable RLS on notification_preferences table
-- This allows the application to work while we implement proper Clerk-compatible policies

-- Disable Row Level Security on notification_preferences table
-- Security is handled at the application layer via checkAdminRole()
ALTER TABLE notification_preferences DISABLE ROW LEVEL SECURITY;

-- Add comment explaining this is a temporary measure
COMMENT ON TABLE notification_preferences IS 'RLS temporarily disabled. Security handled by application layer (checkAdminRole()). Admin-only access enforced in API routes.';