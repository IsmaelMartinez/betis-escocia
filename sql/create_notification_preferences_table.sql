-- Create notification_preferences table for storing user notification settings
-- This replaces the JSON file-based storage approach

CREATE TABLE IF NOT EXISTS notification_preferences (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL UNIQUE, -- Clerk user ID
  enabled BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Create an index on user_id for fast lookups
CREATE INDEX IF NOT EXISTS idx_notification_preferences_user_id ON notification_preferences(user_id);

-- Create an index on enabled for fast filtering of enabled users
CREATE INDEX IF NOT EXISTS idx_notification_preferences_enabled ON notification_preferences(enabled);

-- Create a trigger to automatically update the updated_at column
CREATE OR REPLACE FUNCTION update_notification_preferences_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_notification_preferences_updated_at
  BEFORE UPDATE ON notification_preferences
  FOR EACH ROW EXECUTE FUNCTION update_notification_preferences_updated_at();

-- Add RLS (Row Level Security) to ensure users can only access their own preferences
ALTER TABLE notification_preferences ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own preferences
CREATE POLICY "Users can view own notification preferences" 
  ON notification_preferences FOR SELECT 
  USING (user_id = auth.jwt() ->> 'sub');

-- Policy: Users can insert their own preferences
CREATE POLICY "Users can insert own notification preferences" 
  ON notification_preferences FOR INSERT 
  WITH CHECK (user_id = auth.jwt() ->> 'sub');

-- Policy: Users can update their own preferences
CREATE POLICY "Users can update own notification preferences" 
  ON notification_preferences FOR UPDATE 
  USING (user_id = auth.jwt() ->> 'sub')
  WITH CHECK (user_id = auth.jwt() ->> 'sub');

-- Policy: Allow admin users to view all preferences (for system management)
CREATE POLICY "Admins can view all notification preferences" 
  ON notification_preferences FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Add helpful comments
COMMENT ON TABLE notification_preferences IS 'Stores user notification preferences for push notifications';
COMMENT ON COLUMN notification_preferences.user_id IS 'Clerk user ID from authentication system';
COMMENT ON COLUMN notification_preferences.enabled IS 'Whether user has notifications enabled';
COMMENT ON COLUMN notification_preferences.created_at IS 'When the preference was first created';
COMMENT ON COLUMN notification_preferences.updated_at IS 'When the preference was last updated';