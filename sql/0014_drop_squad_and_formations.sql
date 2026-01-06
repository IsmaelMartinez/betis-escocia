-- Drop squad management and starting eleven tables
-- These features have been removed from the admin panel

-- Drop starting_elevens table with CASCADE to remove all dependencies
DROP TABLE IF EXISTS starting_elevens CASCADE;

-- Drop squad_members table with CASCADE to remove all dependencies
DROP TABLE IF EXISTS squad_members CASCADE;

-- Note: The players table and its is_current_squad column are preserved
-- The sync functionality now only updates the players table
