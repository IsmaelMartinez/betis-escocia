-- Add DELETE policy for RSVP table
-- This enables the admin/API to delete RSVPs (e.g., for testing, cleanup, or admin functions)

-- Add policy to allow authenticated users to delete RSVPs
CREATE POLICY "Allow authenticated delete on rsvps" ON rsvps 
FOR DELETE TO authenticated USING (true);

-- Add policy to allow anonymous delete (for API routes that don't use auth)
-- This is needed for our current API structure
CREATE POLICY "Allow public delete on rsvps" ON rsvps 
FOR DELETE TO anon USING (true);

-- Optional: If you want to be more restrictive, you could limit deletes to specific conditions
-- For example, only allow deleting your own RSVPs based on email:
-- CREATE POLICY "Allow delete own rsvp" ON rsvps 
-- FOR DELETE TO anon USING (email = current_setting('request.jwt.claims')::json->>'email');

-- Check current policies (for verification)
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check 
FROM pg_policies 
WHERE tablename = 'rsvps';
