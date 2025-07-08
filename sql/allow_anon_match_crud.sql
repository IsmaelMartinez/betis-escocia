-- Allow anonymous users to perform CRUD operations on matches
-- This is needed for the admin panel to work without authentication
-- Note: In production, this should be secured with proper authentication

-- Create policy to allow anonymous users to insert matches
CREATE POLICY "Allow anon insert matches" ON matches FOR INSERT TO anon WITH CHECK (true);

-- Create policy to allow anonymous users to update matches
CREATE POLICY "Allow anon update matches" ON matches FOR UPDATE TO anon USING (true);

-- Create policy to allow anonymous users to delete matches
CREATE POLICY "Allow anon delete matches" ON matches FOR DELETE TO anon USING (true);

-- Grant necessary permissions
GRANT INSERT, UPDATE, DELETE ON matches TO anon;
GRANT USAGE ON SEQUENCE matches_id_seq TO anon;
