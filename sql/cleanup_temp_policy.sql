-- Remove temporary policy after data population
-- Run this AFTER running the populate script

DROP POLICY IF EXISTS "Temp allow anon insert matches" ON matches;
