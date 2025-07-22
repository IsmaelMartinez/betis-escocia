-- Initial setup for Peña Bética Escocesa database
-- Create or update matches table
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'matches'
) THEN CREATE TABLE matches (
    id BIGSERIAL PRIMARY KEY,
    date_time TIMESTAMPTZ NOT NULL,
    opponent VARCHAR(100) NOT NULL,
    competition VARCHAR(100) NOT NULL,
    home_away VARCHAR(10) NOT NULL CHECK (home_away IN ('home', 'away')),
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    external_id BIGINT,
    external_source VARCHAR(100),
    result VARCHAR(20) CHECK (result IN ('HOME_WIN', 'AWAY_WIN', 'DRAW')),
    home_score INTEGER,
    away_score INTEGER,
    status VARCHAR(20),
    matchday INTEGER
);
END IF;
END $$;
-- Create indexes for matches table
CREATE INDEX IF NOT EXISTS idx_matches_date_time ON matches(date_time);
CREATE INDEX IF NOT EXISTS idx_matches_competition ON matches(competition);
CREATE INDEX IF NOT EXISTS idx_matches_home_away ON matches(home_away);
CREATE INDEX IF NOT EXISTS idx_matches_external_id ON matches(external_id);
CREATE INDEX IF NOT EXISTS idx_matches_external_source ON matches(external_source);
-- Add unique constraint to matches table
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints
    WHERE table_name = 'matches'
        AND constraint_name = 'unique_external_match'
) THEN
ALTER TABLE matches
ADD CONSTRAINT unique_external_match UNIQUE (external_id, external_source);
END IF;
END $$;
-- Create or update RSVP table
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'rsvps'
) THEN CREATE TABLE rsvps (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    attendees INTEGER NOT NULL DEFAULT 1,
    whatsapp_interest BOOLEAN NOT NULL DEFAULT false,
    match_date TIMESTAMPTZ NOT NULL DEFAULT '2025-06-28T20:00:00+00:00',
    match_id BIGINT REFERENCES matches(id) ON DELETE
    SET NULL
);
END IF;
END $$;
-- Create indexes for RSVP table
CREATE INDEX IF NOT EXISTS idx_rsvps_created_at ON rsvps(created_at);
CREATE INDEX IF NOT EXISTS idx_rsvps_email ON rsvps(email);
CREATE INDEX IF NOT EXISTS idx_rsvps_match_date ON rsvps(match_date);
CREATE INDEX IF NOT EXISTS idx_rsvps_match_id ON rsvps(match_id);
CREATE INDEX IF NOT EXISTS idx_rsvps_user_id ON rsvps(user_id);
CREATE INDEX IF NOT EXISTS idx_rsvps_user_id_created_at ON rsvps(user_id, created_at DESC);
-- Enable Row Level Security for RSVP table
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;
-- Create policies for RSVP table
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE policyname = 'Allow public inserts on rsvps'
        AND tablename = 'rsvps'
) THEN CREATE POLICY "Allow public inserts on rsvps" ON rsvps FOR
INSERT TO anon WITH CHECK (true);
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE policyname = 'Allow public reads on rsvps'
        AND tablename = 'rsvps'
) THEN CREATE POLICY "Allow public reads on rsvps" ON rsvps FOR
SELECT TO anon USING (true);
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE policyname = 'Allow authenticated delete on rsvps'
        AND tablename = 'rsvps'
) THEN CREATE POLICY "Allow authenticated delete on rsvps" ON rsvps FOR DELETE TO authenticated USING (true);
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE policyname = 'Allow public delete on rsvps'
        AND tablename = 'rsvps'
) THEN CREATE POLICY "Allow public delete on rsvps" ON rsvps FOR DELETE TO anon USING (true);
END IF;
END $$;
-- Create policies for matches table
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE policyname = 'Allow anon insert matches'
        AND tablename = 'matches'
) THEN CREATE POLICY "Allow anon insert matches" ON matches FOR
INSERT TO anon WITH CHECK (true);
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE policyname = 'Allow anon update matches'
        AND tablename = 'matches'
) THEN CREATE POLICY "Allow anon update matches" ON matches FOR
UPDATE TO anon USING (true);
END IF;
IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE policyname = 'Allow anon delete matches'
        AND tablename = 'matches'
) THEN CREATE POLICY "Allow anon delete matches" ON matches FOR DELETE TO anon USING (true);
END IF;
END $$;
-- Grant permissions
GRANT ALL ON matches TO anon,
    authenticated;
GRANT INSERT,
    UPDATE,
    DELETE ON matches TO anon;
GRANT USAGE ON SEQUENCE matches_id_seq TO anon;
-- Cleanup function for old RSVPs
CREATE OR REPLACE FUNCTION cleanup_old_rsvps() RETURNS INTEGER AS $$
DECLARE deleted_count INTEGER;
BEGIN
DELETE FROM rsvps
WHERE created_at < NOW() - INTERVAL '1 month';
GET DIAGNOSTICS deleted_count = ROW_COUNT;
RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;
-- Create or update contact_submissions table
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'contact_submissions'
) THEN CREATE TABLE contact_submissions (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    phone VARCHAR(20),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    user_id TEXT,
    status VARCHAR(20) DEFAULT 'new'
);
END IF;
END $$;
-- Create indexes for contact_submissions table
CREATE INDEX IF NOT EXISTS idx_contact_submissions_created_at ON contact_submissions(created_at);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_user_id ON contact_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_contact_submissions_user_id_created_at ON contact_submissions(user_id, created_at DESC);
-- Enable Row Level Security on the contact_submissions table
ALTER TABLE public.contact_submissions ENABLE ROW LEVEL SECURITY;
-- Create a default deny-all policy if it does not already exist
DO $$ BEGIN IF NOT EXISTS (
    SELECT 1
    FROM pg_policies
    WHERE policyname = 'Deny all access by default'
        AND tablename = 'contact_submissions'
) THEN CREATE POLICY "Deny all access by default" ON public.contact_submissions FOR ALL USING (false);
END IF;
END $$;
-- Enable Row Level Security on the matches table
ALTER TABLE public.matches ENABLE ROW LEVEL SECURITY;
-- Create or replace match_rsvp_counts view
DROP VIEW IF EXISTS match_rsvp_counts;
CREATE OR REPLACE VIEW public.match_rsvp_counts WITH (security_invoker = on) AS
SELECT m.id AS match_id,
    m.opponent,
    m.date_time,
    COUNT(r.id) AS rsvp_count
FROM matches m
    LEFT JOIN rsvps r ON m.id = r.match_id
GROUP BY m.id,
    m.opponent,
    m.date_time;
-- Create or replace function to update matches' updated_at field
CREATE OR REPLACE FUNCTION public.update_matches_updated_at() RETURNS TRIGGER AS $$ BEGIN -- Explicitly set a fixed, minimal search path
SET search_path = 'pg_temp';
-- Your function logic here
RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;