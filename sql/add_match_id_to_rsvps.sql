-- Add match_id foreign key to RSVP table
-- Run this SQL in your Supabase SQL Editor AFTER creating the matches table

-- Add match_id column to rsvps table
ALTER TABLE rsvps 
ADD COLUMN match_id BIGINT REFERENCES matches(id) ON DELETE SET NULL;

-- Create index for efficient joins between rsvps and matches
CREATE INDEX idx_rsvps_match_id ON rsvps(match_id);

-- Update existing RSVPs to be backward compatible (they won't have match_id)
-- This allows old RSVPs to exist without being linked to specific matches
-- New RSVPs should include match_id when created

-- Optional: Add a view to get RSVP counts per match
CREATE OR REPLACE VIEW match_rsvp_counts AS
SELECT 
    m.id as match_id,
    m.opponent,
    m.date_time,
    COALESCE(SUM(r.attendees), 0) as total_attendees,
    COUNT(r.id) as rsvp_count
FROM matches m
LEFT JOIN rsvps r ON m.id = r.match_id
GROUP BY m.id, m.opponent, m.date_time
ORDER BY m.date_time;

-- Grant permissions for the view
GRANT SELECT ON match_rsvp_counts TO anon, authenticated;
