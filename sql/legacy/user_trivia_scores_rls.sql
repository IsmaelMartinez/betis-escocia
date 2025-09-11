-- Enable Row Level Security for user_trivia_scores table
ALTER TABLE user_trivia_scores ENABLE ROW LEVEL SECURITY;

-- Policy to allow authenticated users to insert their own daily scores
CREATE POLICY "Allow authenticated users to insert their own daily scores"
ON user_trivia_scores FOR INSERT TO authenticated
WITH CHECK (auth.jwt()->>'sub' = user_id);

-- Policy to allow authenticated users to select their own daily scores
CREATE POLICY "Allow authenticated users to select their own daily scores"
ON user_trivia_scores FOR SELECT TO authenticated
USING (auth.jwt()->>'sub' = user_id);

-- Policy to allow authenticated users to update their own daily scores (if needed, though daily score is usually a single insert)
-- CREATE POLICY "Allow authenticated users to update their own daily scores"
-- ON user_trivia_scores FOR UPDATE TO authenticated
-- USING (auth.jwt()->>'sub' = user_id) WITH CHECK (auth.jwt()->>'sub' = user_id);

-- Policy to allow authenticated users to delete their own daily scores (if needed)
-- CREATE POLICY "Allow authenticated users to delete their own daily scores"
-- ON user_trivia_scores FOR DELETE TO authenticated
-- USING (auth.jwt()->>'sub' = user_id);
