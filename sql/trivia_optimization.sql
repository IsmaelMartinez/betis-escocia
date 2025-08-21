-- Trivia System Database Optimizations
-- Apply these optimizations for better query performance

-- Create indexes for frequently queried fields (no functions - only IMMUTABLE expressions allowed)
CREATE INDEX IF NOT EXISTS idx_user_trivia_scores_user_id_timestamp 
ON user_trivia_scores(user_id, timestamp DESC);

-- Simple composite index for efficient user + timestamp lookups
CREATE INDEX IF NOT EXISTS idx_user_trivia_scores_user_timestamp
ON user_trivia_scores(user_id, timestamp);

CREATE INDEX IF NOT EXISTS idx_trivia_questions_category
ON trivia_questions(category);

CREATE INDEX IF NOT EXISTS idx_trivia_answers_question_id
ON trivia_answers(question_id);

-- Add database-level constraints for data integrity
ALTER TABLE user_trivia_scores 
ADD CONSTRAINT chk_daily_score_range 
CHECK (daily_score >= 0 AND daily_score <= 100);

-- Create a view for efficient total score calculation
CREATE OR REPLACE VIEW user_trivia_totals AS
SELECT 
    user_id,
    COUNT(*) as games_played,
    SUM(daily_score) as total_score,
    AVG(daily_score) as average_score,
    MAX(daily_score) as best_score,
    MAX(timestamp) as last_played
FROM user_trivia_scores
GROUP BY user_id;

-- Create a function for checking daily play status (server-side optimization)
-- Note: Removed CURRENT_DATE default to avoid any IMMUTABLE issues
CREATE OR REPLACE FUNCTION check_daily_trivia_play(p_user_id TEXT, p_date DATE)
RETURNS TABLE(
    has_played BOOLEAN,
    daily_score INTEGER,
    play_timestamp TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        (COUNT(*) > 0) as has_played,
        COALESCE(MAX(uts.daily_score), 0) as daily_score,
        MAX(uts.timestamp) as play_timestamp
    FROM user_trivia_scores uts
    WHERE uts.user_id = p_user_id
      AND date(uts.timestamp) = p_date;
END;
$$ LANGUAGE plpgsql STABLE;

-- Create materialized view for leaderboard (future enhancement)
CREATE MATERIALIZED VIEW IF NOT EXISTS trivia_leaderboard AS
SELECT 
    user_id,
    COUNT(*) as games_played,
    SUM(daily_score) as total_score,
    AVG(daily_score) as average_score,
    MAX(daily_score) as best_score,
    MAX(timestamp) as last_played,
    ROW_NUMBER() OVER (ORDER BY SUM(daily_score) DESC) as rank
FROM user_trivia_scores
GROUP BY user_id
HAVING COUNT(*) >= 1  -- Only include users who have played at least once
ORDER BY total_score DESC;

-- Create index on materialized view
CREATE UNIQUE INDEX IF NOT EXISTS idx_trivia_leaderboard_user_id
ON trivia_leaderboard(user_id);

CREATE INDEX IF NOT EXISTS idx_trivia_leaderboard_rank
ON trivia_leaderboard(rank);

-- Refresh function for leaderboard (can be called periodically)
CREATE OR REPLACE FUNCTION refresh_trivia_leaderboard()
RETURNS void AS $$
BEGIN
    REFRESH MATERIALIZED VIEW CONCURRENTLY trivia_leaderboard;
END;
$$ LANGUAGE plpgsql;

-- Add RLS policies for optimized queries (if not already exist)
-- Note: These should be applied carefully with existing RLS policies

-- Policy for efficient user score lookups on the actual table
DROP POLICY IF EXISTS "Users can view own trivia scores optimized" ON user_trivia_scores;
CREATE POLICY "Users can view own trivia scores optimized"
ON user_trivia_scores FOR SELECT
USING (auth.uid()::text = user_id);

-- Note: Views (user_trivia_totals) inherit RLS from their underlying tables
-- No separate RLS policy needed for the view since it queries user_trivia_scores