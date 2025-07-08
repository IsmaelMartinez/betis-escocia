-- Add result, score, and status fields to matches table
-- This enables storing match results and status information from API

ALTER TABLE matches
ADD COLUMN result VARCHAR(20),
ADD COLUMN home_score INTEGER,
ADD COLUMN away_score INTEGER,
ADD COLUMN status VARCHAR(20) DEFAULT 'SCHEDULED',
ADD COLUMN matchday INTEGER;

-- Add indexes for filtering by result and status
CREATE INDEX idx_matches_result ON matches(result);
CREATE INDEX idx_matches_status ON matches(status);
CREATE INDEX idx_matches_matchday ON matches(matchday);

-- Add comments for documentation
COMMENT ON COLUMN matches.result IS 'Match result: HOME_WIN, AWAY_WIN, DRAW, or null if not finished';
COMMENT ON COLUMN matches.home_score IS 'Home team final score';
COMMENT ON COLUMN matches.away_score IS 'Away team final score';
COMMENT ON COLUMN matches.status IS 'Match status from API: SCHEDULED, FINISHED, IN_PLAY, etc.';
COMMENT ON COLUMN matches.matchday IS 'Matchday number from competition';
