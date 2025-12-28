-- Migration: Add transfer direction and status columns for In/Out tracking
-- Description: Classify rumors as incoming/outgoing and track their status (rumor/confirmed/denied)
-- Author: Claude Code
-- Date: 2025-12-28

-- Add transfer direction column
-- 'in' = player coming to Betis
-- 'out' = player leaving Betis
-- 'unknown' = direction unclear from the rumor
-- NULL = not a transfer rumor or not analyzed
ALTER TABLE betis_news ADD COLUMN IF NOT EXISTS transfer_direction VARCHAR(10)
    CHECK (transfer_direction IS NULL OR transfer_direction IN ('in', 'out', 'unknown'));

-- Add transfer status column
-- 'rumor' = unconfirmed transfer rumor (active)
-- 'confirmed' = transfer completed (hide from active rumors)
-- 'denied' = transfer fell through (hide from active rumors)
-- NULL = not a transfer rumor or not analyzed
ALTER TABLE betis_news ADD COLUMN IF NOT EXISTS transfer_status VARCHAR(15)
    CHECK (transfer_status IS NULL OR transfer_status IN ('rumor', 'confirmed', 'denied'));

-- Index for filtering by direction (common query pattern)
CREATE INDEX IF NOT EXISTS idx_betis_news_transfer_direction ON betis_news(transfer_direction);

-- Index for filtering active rumors (status = 'rumor')
CREATE INDEX IF NOT EXISTS idx_betis_news_transfer_status ON betis_news(transfer_status);

-- Composite index for common filter: active rumors by direction
CREATE INDEX IF NOT EXISTS idx_betis_news_direction_status ON betis_news(transfer_direction, transfer_status)
    WHERE transfer_direction IS NOT NULL AND transfer_status = 'rumor';

-- Comments for documentation
COMMENT ON COLUMN betis_news.transfer_direction IS 'Transfer direction: in=arriving, out=leaving, unknown=unclear, NULL=not transfer';
COMMENT ON COLUMN betis_news.transfer_status IS 'Transfer status: rumor=active, confirmed=done, denied=failed, NULL=not transfer';
