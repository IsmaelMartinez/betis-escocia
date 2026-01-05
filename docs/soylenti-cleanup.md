# Soylenti News Cleanup

Automatic cleanup of non-rumor news items to keep the database lean and focused on transfer rumors.

## Overview

The cleanup system removes news items that have been analyzed and confirmed to NOT be transfer rumors (`ai_probability = 0`) after they're 24 hours old. This keeps the database clean while preserving actual transfer rumors indefinitely.

## What Gets Deleted

- News with `ai_probability = 0` (confirmed non-transfer news)
- Published more than 24 hours ago (`pub_date < NOW() - 24 hours`)
- Not manually hidden by admins (`is_hidden = false`)

## What Is Preserved

- Transfer rumors (`ai_probability > 0`) - kept indefinitely
- Unanalyzed news (`ai_probability = NULL`) - kept until analyzed
- Hidden news (`is_hidden = true`) - admin manages manually
- Recent non-rumors (less than 24 hours old)

## Database Function

The cleanup logic lives in a PostgreSQL function:

```sql
-- Run cleanup with default 24 hour retention
SELECT * FROM cleanup_old_non_rumor_news(24);

-- Check what would be deleted (dry run)
SELECT COUNT(*) FROM betis_news
WHERE ai_probability = 0
  AND pub_date < NOW() - INTERVAL '24 hours'
  AND is_hidden = false;
```

**Migration:** `sql/0012_add_news_cleanup_function.sql`

## Running the Cleanup

### 1. Automated via GitHub Actions (Recommended)

The cleanup runs automatically every day at 2 AM UTC via GitHub Actions.

**Workflow file:** `.github/workflows/cleanup-old-news.yml`

The workflow:
- Runs daily at 2 AM UTC
- Can be triggered manually via GitHub Actions UI
- Uses production Supabase credentials from GitHub Secrets
- Reports status and deleted count
- Times out after 10 minutes if stuck

**Setup:**

Ensure the following secrets are configured in your GitHub repository:
- `SUPABASE_PRODUCTION_URL` (or fallback to `NEXT_PUBLIC_SUPABASE_URL`)
- `SUPABASE_PRODUCTION_SERVICE_ROLE_KEY` (or fallback to `NEXT_PUBLIC_SUPABASE_ANON_KEY`)

**Manual trigger:**

1. Go to GitHub Actions tab
2. Select "Cleanup Old News (Scheduled)" workflow
3. Click "Run workflow" button
4. Select branch and run

### 2. Local Manual Execution

Run the Node.js script manually for testing or one-off cleanups:

```bash
npm run cleanup-news
```

This will:
1. Check how many items would be deleted
2. Call the database cleanup function
3. Report results

**Requirements:**
- `.env.local` file with Supabase credentials:
  ```bash
  NEXT_PUBLIC_SUPABASE_URL=your-project-url
  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
  ```

## Monitoring

### View GitHub Actions runs

1. Navigate to "Actions" tab in GitHub
2. Select "Cleanup Old News (Scheduled)"
3. View run history, logs, and status

### Check cleanup history

Query the database to see when cleanups have run:

```sql
-- Check current non-rumor news count
SELECT COUNT(*) FROM betis_news WHERE ai_probability = 0;

-- Check oldest non-rumor news
SELECT
  MIN(pub_date) as oldest_non_rumor,
  COUNT(*) as total_non_rumors
FROM betis_news
WHERE ai_probability = 0;
```

### Query what would be deleted

```sql
SELECT
  COUNT(*) as items_to_delete,
  MIN(pub_date) as oldest,
  MAX(pub_date) as newest
FROM betis_news
WHERE ai_probability = 0
  AND pub_date < NOW() - INTERVAL '24 hours'
  AND is_hidden = false;
```

### Recent cleanup impact

```sql
-- Check database size
SELECT pg_size_pretty(pg_total_relation_size('betis_news')) as table_size;

-- Check news distribution
SELECT
  CASE
    WHEN ai_probability IS NULL THEN 'Unanalyzed'
    WHEN ai_probability = 0 THEN 'Non-rumor'
    WHEN ai_probability > 0 THEN 'Rumor'
  END as category,
  COUNT(*) as count
FROM betis_news
GROUP BY category;
```

## Configuration

### Change Retention Period

To modify the 24-hour retention period:

**Option 1: Update the SQL function default**

Edit `sql/0012_add_news_cleanup_function.sql`:

```sql
CREATE OR REPLACE FUNCTION cleanup_old_non_rumor_news(
    retention_hours INTEGER DEFAULT 48  -- Changed from 24
)
```

**Option 2: Update the script call**

Edit `scripts/cleanup-old-news.ts`:

```typescript
const { data, error } = await supabase.rpc("cleanup_old_non_rumor_news", {
  retention_hours: 48, // Changed from 24
});
```

### Change Schedule

To modify when the cleanup runs, edit `.github/workflows/cleanup-old-news.yml`:

```yaml
on:
  schedule:
    # Every 6 hours instead of daily
    - cron: '0 */6 * * *'
```

Common cron patterns:
- `0 2 * * *` - Daily at 2 AM UTC (current)
- `0 */6 * * *` - Every 6 hours
- `0 0 * * 0` - Weekly on Sunday at midnight
- `0 3 * * 1-5` - Weekdays at 3 AM UTC

## Troubleshooting

### GitHub Actions workflow failing

**Check workflow logs:**
1. Go to Actions tab
2. Click on failed run
3. Expand "Run news cleanup" step
4. Review error messages

**Common issues:**

1. **Missing secrets:** Verify `SUPABASE_PRODUCTION_URL` and `SUPABASE_PRODUCTION_SERVICE_ROLE_KEY` are set
2. **Function not found:** Apply SQL migration `sql/0012_add_news_cleanup_function.sql` to database
3. **Permission denied:** Ensure the function was created with `SECURITY DEFINER`

### Local script fails with connection error

Ensure `.env.local` has correct credentials:
```bash
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

### Nothing gets deleted

Check if items exist:
```sql
-- Count non-rumor news older than 24 hours
SELECT COUNT(*)
FROM betis_news
WHERE ai_probability = 0
  AND pub_date < NOW() - INTERVAL '24 hours'
  AND is_hidden = false;
```

If count is 0, there's nothing to delete (expected behavior).

### Function times out or is slow

Check database performance:

```sql
-- Check table size
SELECT pg_size_pretty(pg_total_relation_size('betis_news'));

-- Verify indexes exist
SELECT indexname FROM pg_indexes WHERE tablename = 'betis_news';
```

Ensure the `idx_betis_news_ai_probability` and `idx_betis_news_pub_date` indexes exist for optimal performance.

## Migration Steps

1. **Apply SQL migration:**
   - Open Supabase SQL Editor
   - Run `sql/0012_add_news_cleanup_function.sql`
   - Verify function was created:
     ```sql
     SELECT proname FROM pg_proc WHERE proname = 'cleanup_old_non_rumor_news';
     ```

2. **Configure GitHub Secrets:**
   - Go to repository Settings → Secrets and variables → Actions
   - Add `SUPABASE_PRODUCTION_URL` and `SUPABASE_PRODUCTION_SERVICE_ROLE_KEY`

3. **Test locally:**
   ```bash
   npm run cleanup-news
   ```

4. **Deploy workflow:**
   - Merge PR with `.github/workflows/cleanup-old-news.yml`
   - Workflow will run automatically on schedule

5. **Verify first run:**
   - Monitor GitHub Actions for first scheduled run
   - Check logs to confirm successful execution

## See Also

- [Soylenti Feature Documentation](../CLAUDE.md#soylenti-implementation)
- [Database Schema](../sql/0002_add_betis_news_table.sql)
- [Rumor Sync Service](../src/services/rumorSyncService.ts)
- [Rumor Sync Workflow](../.github/workflows/sync-rumors.yml)
