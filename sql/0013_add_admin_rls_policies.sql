-- Migration: Add admin RLS policies for privileged tables
-- Description: Allow admin users to manage players, news_players, squad_members, and starting_elevens
-- Security fix: Previous implementation only had service_role policies, causing admin API routes to fail
-- Author: Claude Code
-- Date: 2026-01-05

-- Players table: Add admin policies
DROP POLICY IF EXISTS "Admin insert access" ON players;
CREATE POLICY "Admin insert access" ON players
    FOR INSERT
    WITH CHECK (
        ((auth.jwt()->>'publicMetadata')::jsonb->>'role' = 'admin')
    );

DROP POLICY IF EXISTS "Admin update access" ON players;
CREATE POLICY "Admin update access" ON players
    FOR UPDATE
    USING (
        ((auth.jwt()->>'publicMetadata')::jsonb->>'role' = 'admin')
    );

DROP POLICY IF EXISTS "Admin delete access" ON players;
CREATE POLICY "Admin delete access" ON players
    FOR DELETE
    USING (
        ((auth.jwt()->>'publicMetadata')::jsonb->>'role' = 'admin')
    );

-- News_players table: Add admin policies
DROP POLICY IF EXISTS "Admin insert access" ON news_players;
CREATE POLICY "Admin insert access" ON news_players
    FOR INSERT
    WITH CHECK (
        ((auth.jwt()->>'publicMetadata')::jsonb->>'role' = 'admin')
    );

DROP POLICY IF EXISTS "Admin update access" ON news_players;
CREATE POLICY "Admin update access" ON news_players
    FOR UPDATE
    USING (
        ((auth.jwt()->>'publicMetadata')::jsonb->>'role' = 'admin')
    );

DROP POLICY IF EXISTS "Admin delete access" ON news_players;
CREATE POLICY "Admin delete access" ON news_players
    FOR DELETE
    USING (
        ((auth.jwt()->>'publicMetadata')::jsonb->>'role' = 'admin')
    );

-- Squad_members table: Add admin policies
DROP POLICY IF EXISTS "Admin insert access" ON squad_members;
CREATE POLICY "Admin insert access" ON squad_members
    FOR INSERT
    WITH CHECK (
        ((auth.jwt()->>'publicMetadata')::jsonb->>'role' = 'admin')
    );

DROP POLICY IF EXISTS "Admin update access" ON squad_members;
CREATE POLICY "Admin update access" ON squad_members
    FOR UPDATE
    USING (
        ((auth.jwt()->>'publicMetadata')::jsonb->>'role' = 'admin')
    );

DROP POLICY IF EXISTS "Admin delete access" ON squad_members;
CREATE POLICY "Admin delete access" ON squad_members
    FOR DELETE
    USING (
        ((auth.jwt()->>'publicMetadata')::jsonb->>'role' = 'admin')
    );

-- Starting_elevens table: Add admin policies
DROP POLICY IF EXISTS "Admin insert access" ON starting_elevens;
CREATE POLICY "Admin insert access" ON starting_elevens
    FOR INSERT
    WITH CHECK (
        ((auth.jwt()->>'publicMetadata')::jsonb->>'role' = 'admin')
    );

DROP POLICY IF EXISTS "Admin update access" ON starting_elevens;
CREATE POLICY "Admin update access" ON starting_elevens
    FOR UPDATE
    USING (
        ((auth.jwt()->>'publicMetadata')::jsonb->>'role' = 'admin')
    );

DROP POLICY IF EXISTS "Admin delete access" ON starting_elevens;
CREATE POLICY "Admin delete access" ON starting_elevens
    FOR DELETE
    USING (
        ((auth.jwt()->>'publicMetadata')::jsonb->>'role' = 'admin')
    );

-- Comments for documentation
COMMENT ON POLICY "Admin insert access" ON players IS 'Allow authenticated admin users to insert players';
COMMENT ON POLICY "Admin update access" ON players IS 'Allow authenticated admin users to update players';
COMMENT ON POLICY "Admin delete access" ON players IS 'Allow authenticated admin users to delete players';

COMMENT ON POLICY "Admin insert access" ON news_players IS 'Allow authenticated admin users to insert news_players links';
COMMENT ON POLICY "Admin update access" ON news_players IS 'Allow authenticated admin users to update news_players links';
COMMENT ON POLICY "Admin delete access" ON news_players IS 'Allow authenticated admin users to delete news_players links';

COMMENT ON POLICY "Admin insert access" ON squad_members IS 'Allow authenticated admin users to insert squad members';
COMMENT ON POLICY "Admin update access" ON squad_members IS 'Allow authenticated admin users to update squad members';
COMMENT ON POLICY "Admin delete access" ON squad_members IS 'Allow authenticated admin users to delete squad members';

COMMENT ON POLICY "Admin insert access" ON starting_elevens IS 'Allow authenticated admin users to insert starting elevens';
COMMENT ON POLICY "Admin update access" ON starting_elevens IS 'Allow authenticated admin users to update starting elevens';
COMMENT ON POLICY "Admin delete access" ON starting_elevens IS 'Allow authenticated admin users to delete starting elevens';
