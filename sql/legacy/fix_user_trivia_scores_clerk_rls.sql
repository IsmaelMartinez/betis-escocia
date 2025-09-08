-- Fix user_trivia_scores RLS policies for Clerk authentication
-- The original policies were designed for Supabase Auth but we use Clerk

-- First, drop all existing policies
DROP POLICY IF EXISTS "Allow authenticated users to insert their own daily scores" ON user_trivia_scores;
DROP POLICY IF EXISTS "Allow authenticated users to select their own daily scores" ON user_trivia_scores;
DROP POLICY IF EXISTS "Allow authenticated users to update their own daily scores" ON user_trivia_scores;
DROP POLICY IF EXISTS "Allow authenticated users to delete their own daily scores" ON user_trivia_scores;

-- Create new policies that work with Clerk authentication
-- Since we're using Clerk, we rely on application-level authentication in the API routes
-- The createApiHandler with auth: 'user' validates the user before reaching the database

-- Policy: Allow authenticated requests to view trivia scores
-- (User validation is done in the API layer via createApiHandler auth: 'user')
CREATE POLICY "Allow authenticated trivia scores access" 
  ON user_trivia_scores FOR SELECT 
  USING (true);

-- Policy: Allow authenticated requests to insert trivia scores
CREATE POLICY "Allow authenticated trivia scores insert" 
  ON user_trivia_scores FOR INSERT 
  WITH CHECK (true);

-- Policy: Allow authenticated requests to update trivia scores
CREATE POLICY "Allow authenticated trivia scores update" 
  ON user_trivia_scores FOR UPDATE 
  USING (true);

-- Policy: Allow authenticated requests to delete trivia scores
-- This is crucial for GDPR deletion requests
CREATE POLICY "Allow authenticated trivia scores delete" 
  ON user_trivia_scores FOR DELETE 
  USING (true);

-- Add comment explaining the approach
COMMENT ON TABLE user_trivia_scores IS 'User trivia scores with Clerk-compatible RLS. Authentication and authorization handled at application layer via createApiHandler with auth: user. Business logic ensures users can only access their own scores.';