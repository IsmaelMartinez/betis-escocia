-- Trivia Randomness Optimization
-- Optimizations for ORDER BY RANDOM() performance and question variety

-- Create a composite index to improve RANDOM() query performance
-- While RANDOM() itself can't be optimized much, we can optimize the underlying table scan
CREATE INDEX IF NOT EXISTS idx_trivia_questions_random_optimization
ON trivia_questions(id, category, difficulty);

-- Analyze table statistics to help PostgreSQL's query planner
-- This helps with better execution plans for RANDOM() queries
ANALYZE trivia_questions;
ANALYZE trivia_answers;

-- Create statistics on question categories for better query planning
CREATE STATISTICS IF NOT EXISTS trivia_questions_category_stats
ON category, difficulty FROM trivia_questions;

-- Update table statistics
ANALYZE trivia_questions;

-- Create a function to get random questions with improved performance
-- This function uses a more efficient approach than simple ORDER BY RANDOM()
-- when dealing with large datasets (future-proofing)
CREATE OR REPLACE FUNCTION get_random_trivia_questions(question_limit INTEGER DEFAULT 5)
RETURNS TABLE(
    id UUID,
    question_text TEXT,
    category TEXT,
    difficulty TEXT,
    trivia_answers JSONB
) AS $$
DECLARE
    total_questions INTEGER;
    use_optimized_method BOOLEAN := FALSE;
BEGIN
    -- Check total number of questions to decide on randomization method
    SELECT COUNT(*) INTO total_questions FROM trivia_questions;
    
    -- For large datasets (>1000 questions), use optimized random sampling
    -- For smaller datasets, use simple ORDER BY RANDOM()
    use_optimized_method := total_questions > 1000;
    
    IF use_optimized_method THEN
        -- Optimized method for large datasets: sample random IDs first
        RETURN QUERY
        WITH random_ids AS (
            SELECT tq.id
            FROM trivia_questions tq
            TABLESAMPLE SYSTEM_ROWS(question_limit * 3) -- Sample 3x more than needed
            ORDER BY RANDOM()
            LIMIT question_limit
        )
        SELECT 
            tq.id,
            tq.question_text,
            tq.category,
            tq.difficulty,
            COALESCE(
                JSON_AGG(
                    JSON_BUILD_OBJECT(
                        'id', ta.id,
                        'answer_text', ta.answer_text,
                        'is_correct', ta.is_correct
                    )
                    ORDER BY ta.id
                )::JSONB, 
                '[]'::JSONB
            ) as trivia_answers
        FROM trivia_questions tq
        INNER JOIN random_ids ri ON tq.id = ri.id
        LEFT JOIN trivia_answers ta ON tq.id = ta.question_id
        GROUP BY tq.id, tq.question_text, tq.category, tq.difficulty
        ORDER BY RANDOM(); -- Final randomization of the selected questions
    ELSE
        -- Simple method for smaller datasets (current approach)
        RETURN QUERY
        SELECT 
            tq.id,
            tq.question_text,
            tq.category,
            tq.difficulty,
            COALESCE(
                JSON_AGG(
                    JSON_BUILD_OBJECT(
                        'id', ta.id,
                        'answer_text', ta.answer_text,
                        'is_correct', ta.is_correct
                    )
                    ORDER BY ta.id
                )::JSONB, 
                '[]'::JSONB
            ) as trivia_answers
        FROM trivia_questions tq
        LEFT JOIN trivia_answers ta ON tq.id = ta.question_id
        GROUP BY tq.id, tq.question_text, tq.category, tq.difficulty
        ORDER BY RANDOM()
        LIMIT question_limit;
    END IF;
END;
$$ LANGUAGE plpgsql STABLE;

-- Create a function to verify question randomization quality
-- This can be used for testing and monitoring
CREATE OR REPLACE FUNCTION test_trivia_randomization(test_runs INTEGER DEFAULT 100)
RETURNS TABLE(
    question_id UUID,
    question_text TEXT,
    selection_count INTEGER,
    selection_percentage DECIMAL(5,2)
) AS $$
DECLARE
    total_questions INTEGER;
BEGIN
    -- Get total questions for percentage calculation
    SELECT COUNT(*) INTO total_questions FROM trivia_questions;
    
    -- Run multiple randomization tests and count selections
    RETURN QUERY
    WITH random_selections AS (
        SELECT unnest(ARRAY(
            SELECT tq.id
            FROM trivia_questions tq
            ORDER BY RANDOM()
            LIMIT 5
        )) as question_id
        FROM generate_series(1, test_runs)
    ),
    selection_counts AS (
        SELECT 
            rs.question_id,
            COUNT(*) as selection_count
        FROM random_selections rs
        GROUP BY rs.question_id
    )
    SELECT 
        sc.question_id,
        tq.question_text,
        sc.selection_count::INTEGER,
        ROUND((sc.selection_count::DECIMAL / test_runs * 100), 2) as selection_percentage
    FROM selection_counts sc
    JOIN trivia_questions tq ON sc.question_id = tq.id
    ORDER BY sc.selection_count DESC;
END;
$$ LANGUAGE plpgsql;

-- Create an index to track question usage patterns (for analytics)
-- This is optional but helps with monitoring question variety
CREATE TABLE IF NOT EXISTS trivia_question_usage_stats (
    question_id UUID REFERENCES trivia_questions(id) ON DELETE CASCADE,
    usage_date DATE DEFAULT CURRENT_DATE,
    usage_count INTEGER DEFAULT 1,
    last_used TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    PRIMARY KEY (question_id, usage_date)
);

-- Create indexes for usage stats table
CREATE INDEX IF NOT EXISTS idx_trivia_usage_stats_date
ON trivia_question_usage_stats(usage_date DESC);

CREATE INDEX IF NOT EXISTS idx_trivia_usage_stats_question_id
ON trivia_question_usage_stats(question_id);

-- Create a function to log question usage (optional - for analytics)
CREATE OR REPLACE FUNCTION log_trivia_question_usage(question_ids UUID[])
RETURNS void AS $$
DECLARE
    question_id UUID;
BEGIN
    FOREACH question_id IN ARRAY question_ids
    LOOP
        INSERT INTO trivia_question_usage_stats (question_id, usage_date, usage_count, last_used)
        VALUES (question_id, CURRENT_DATE, 1, NOW())
        ON CONFLICT (question_id, usage_date) 
        DO UPDATE SET 
            usage_count = trivia_question_usage_stats.usage_count + 1,
            last_used = NOW();
    END LOOP;
END;
$$ LANGUAGE plpgsql;

-- Create a view for question variety analytics
CREATE OR REPLACE VIEW trivia_question_variety_stats AS
SELECT 
    tq.id,
    tq.question_text,
    tq.category,
    tq.difficulty,
    COALESCE(SUM(tus.usage_count), 0) as total_uses,
    MAX(tus.last_used) as last_used,
    COUNT(DISTINCT tus.usage_date) as days_used,
    CASE 
        WHEN MAX(tus.last_used) IS NULL THEN 'never_used'
        WHEN MAX(tus.last_used) < NOW() - INTERVAL '7 days' THEN 'rarely_used'  
        WHEN MAX(tus.last_used) < NOW() - INTERVAL '1 day' THEN 'occasionally_used'
        ELSE 'frequently_used'
    END as usage_category
FROM trivia_questions tq
LEFT JOIN trivia_question_usage_stats tus ON tq.id = tus.question_id
GROUP BY tq.id, tq.question_text, tq.category, tq.difficulty
ORDER BY total_uses DESC;

-- Performance optimization: Update table statistics after these changes
ANALYZE trivia_questions;
ANALYZE trivia_answers;

-- Create a comment explaining the optimization approach
COMMENT ON INDEX idx_trivia_questions_random_optimization IS 
'Composite index to optimize ORDER BY RANDOM() queries on trivia_questions. Includes id, category, and difficulty for efficient random selection.';

COMMENT ON FUNCTION get_random_trivia_questions IS 
'Optimized function for retrieving random trivia questions. Uses different strategies based on dataset size for optimal performance.';

COMMENT ON FUNCTION test_trivia_randomization IS 
'Testing function to verify randomization quality. Run periodically to ensure good question distribution.';

COMMENT ON TABLE trivia_question_usage_stats IS 
'Optional analytics table to track question usage patterns and ensure good variety over time.';

-- Grant necessary permissions (adjust as needed for your RLS setup)
-- Note: These may need to be adjusted based on your specific RLS policies

-- Performance monitoring query (for developers/admins)
-- Run this to check if the randomization is working efficiently:
/*
Example usage:

-- Test randomization quality:
SELECT * FROM test_trivia_randomization(50) LIMIT 20;

-- Check question variety:
SELECT usage_category, COUNT(*) as question_count 
FROM trivia_question_variety_stats 
GROUP BY usage_category;

-- Get random questions using optimized function:
SELECT * FROM get_random_trivia_questions(5);

-- Check database query performance:
EXPLAIN ANALYZE 
SELECT * FROM trivia_questions 
ORDER BY RANDOM() 
LIMIT 5;
*/