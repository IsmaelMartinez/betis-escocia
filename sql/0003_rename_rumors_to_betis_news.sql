-- Rename rumors table to betis_news to reflect it contains all news, not just transfer rumors
-- Transfer rumors are identified by ai_probability > 0

ALTER TABLE rumors RENAME TO betis_news;

-- Update indexes (PostgreSQL automatically renames constraints when table is renamed)
-- No additional changes needed for indexes or constraints

-- Verify the rename
COMMENT ON TABLE betis_news IS 'Stores all Betis news from RSS feeds. Transfer rumors have ai_probability > 0, regular news has ai_probability = 0.';
