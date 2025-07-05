-- Create RSVP table for Peña Bética Escocesa
-- Run this SQL in your Supabase SQL Editor
CREATE TABLE rsvps (
    id BIGSERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    email VARCHAR(255) NOT NULL,
    message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);
-- Create an index on created_at for efficient cleanup queries
CREATE INDEX idx_rsvps_created_at ON rsvps(created_at);
-- Optional: Create an index on email for duplicate checking
CREATE INDEX idx_rsvps_email ON rsvps(email);
-- Enable Row Level Security (optional but recommended)
ALTER TABLE rsvps ENABLE ROW LEVEL SECURITY;
-- Create a policy to allow public inserts (for RSVP form)
CREATE POLICY "Allow public inserts on rsvps" ON rsvps FOR
INSERT TO anon WITH CHECK (true);
-- Create a policy to allow public reads (for displaying RSVP counts)
CREATE POLICY "Allow public reads on rsvps" ON rsvps FOR
SELECT TO anon USING (true);