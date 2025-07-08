-- Temporary policy to allow anonymous inserts for data population
-- Run this BEFORE running the populate script, then remove it after

-- Allow anonymous users to insert matches temporarily (for data population)
CREATE POLICY "Temp allow anon insert matches" ON matches FOR INSERT TO anon WITH CHECK (true);

-- After running the populate script, remove this policy:
-- DROP POLICY "Temp allow anon insert matches" ON matches;
