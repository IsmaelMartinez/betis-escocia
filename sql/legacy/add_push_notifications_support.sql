-- Add support for push notifications by updating notification_preferences and creating push_subscriptions table

-- First, update the notification_preferences table to include specific notification types
ALTER TABLE notification_preferences 
ADD COLUMN IF NOT EXISTS rsvp_notifications BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN IF NOT EXISTS contact_notifications BOOLEAN NOT NULL DEFAULT true;

-- Update existing records to have the new columns enabled by default
UPDATE notification_preferences 
SET rsvp_notifications = true, contact_notifications = true 
WHERE rsvp_notifications IS NULL OR contact_notifications IS NULL;

-- Create push_subscriptions table to store browser push subscription endpoints
CREATE TABLE IF NOT EXISTS push_subscriptions (
  id SERIAL PRIMARY KEY,
  user_id VARCHAR(255) NOT NULL, -- Clerk user ID
  endpoint TEXT NOT NULL,
  p256dh_key TEXT NOT NULL,
  auth_key TEXT NOT NULL,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  last_used_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  
  -- Ensure one subscription per user (can be updated)
  CONSTRAINT unique_user_subscription UNIQUE(user_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_user_id ON push_subscriptions(user_id);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_endpoint ON push_subscriptions(endpoint);
CREATE INDEX IF NOT EXISTS idx_push_subscriptions_last_used ON push_subscriptions(last_used_at);

-- Create trigger to update the updated_at column
CREATE OR REPLACE FUNCTION update_push_subscriptions_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = CURRENT_TIMESTAMP;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_push_subscriptions_updated_at
  BEFORE UPDATE ON push_subscriptions
  FOR EACH ROW EXECUTE FUNCTION update_push_subscriptions_updated_at();

-- Enable RLS for push_subscriptions
ALTER TABLE push_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own subscriptions
CREATE POLICY "Users can view own push subscriptions" 
  ON push_subscriptions FOR SELECT 
  USING (user_id = auth.jwt() ->> 'sub');

-- Policy: Users can insert their own subscriptions
CREATE POLICY "Users can insert own push subscriptions" 
  ON push_subscriptions FOR INSERT 
  WITH CHECK (user_id = auth.jwt() ->> 'sub');

-- Policy: Users can update their own subscriptions
CREATE POLICY "Users can update own push subscriptions" 
  ON push_subscriptions FOR UPDATE 
  USING (user_id = auth.jwt() ->> 'sub')
  WITH CHECK (user_id = auth.jwt() ->> 'sub');

-- Policy: Users can delete their own subscriptions
CREATE POLICY "Users can delete own push subscriptions" 
  ON push_subscriptions FOR DELETE 
  USING (user_id = auth.jwt() ->> 'sub');

-- Policy: Allow admin users to view all subscriptions (for notification sending)
CREATE POLICY "Admins can view all push subscriptions" 
  ON push_subscriptions FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = auth.uid() 
      AND auth.users.raw_user_meta_data->>'role' = 'admin'
    )
  );

-- Add helpful comments
COMMENT ON TABLE push_subscriptions IS 'Stores browser push notification subscription endpoints for users';
COMMENT ON COLUMN push_subscriptions.user_id IS 'Clerk user ID from authentication system';
COMMENT ON COLUMN push_subscriptions.endpoint IS 'Push service endpoint URL for sending notifications';
COMMENT ON COLUMN push_subscriptions.p256dh_key IS 'Public key for message encryption (base64 encoded)';
COMMENT ON COLUMN push_subscriptions.auth_key IS 'Authentication key for message encryption (base64 encoded)';
COMMENT ON COLUMN push_subscriptions.user_agent IS 'Browser user agent string for debugging';
COMMENT ON COLUMN push_subscriptions.last_used_at IS 'When this subscription was last used for sending notifications';

-- Update the notification_preferences comments
COMMENT ON COLUMN notification_preferences.enabled IS 'Whether user has any notifications enabled (master toggle)';
COMMENT ON COLUMN notification_preferences.rsvp_notifications IS 'Whether user wants to receive RSVP notifications';
COMMENT ON COLUMN notification_preferences.contact_notifications IS 'Whether user wants to receive contact form notifications';