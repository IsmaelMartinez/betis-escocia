# Soylenti News Cleanup

Automatically deletes non-rumor news (`ai_probability = 0`) after 24 hours to keep the database focused on transfer rumors.

## What Gets Deleted

- News with `ai_probability = 0` (confirmed non-transfer news)
- Published more than 24 hours ago

## What Is Preserved

- Transfer rumors (`ai_probability > 0`) - kept indefinitely
- Unanalyzed news (`ai_probability = NULL`) - kept until analyzed

## Automated Cleanup (GitHub Actions)

Runs daily at 2 AM UTC via `.github/workflows/cleanup-old-news.yml`

**Manual trigger:**

1. Go to GitHub Actions tab
2. Select "Cleanup Old News (Scheduled)"
3. Click "Run workflow"

**Required secrets:**

- `SUPABASE_PRODUCTION_URL`
- `SUPABASE_PRODUCTION_SERVICE_ROLE_KEY`

## Manual Cleanup (Local)

```bash
npm run cleanup-news
```

**Required in `.env.local`:**

```bash
NEXT_PUBLIC_SUPABASE_URL=your-project-url
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

**Optional - change retention period (default: 24h):**

```bash
CLEANUP_RETENTION_HOURS=48
```

## Database Function

PostgreSQL function in `sql/0012_add_news_cleanup_function.sql`

**Security:** Function requires admin role and is only executable by `service_role`. Public roles (`anon`, `authenticated`) cannot execute it, preventing unauthorized deletions.

```sql
-- Run manually (requires admin role)
SELECT * FROM cleanup_old_non_rumor_news(24);

-- Check what would be deleted
SELECT COUNT(*) FROM betis_news
WHERE ai_probability = 0
  AND pub_date < NOW() - INTERVAL '24 hours';
```

## Migration

1. Apply SQL migration in Supabase SQL Editor
2. Verify function exists:
   ```sql
   SELECT proname FROM pg_proc WHERE proname = 'cleanup_old_non_rumor_news';
   ```
3. Test locally: `npm run cleanup-news`

## Troubleshooting

**Missing credentials:**

- Workflow needs `SUPABASE_PRODUCTION_SERVICE_ROLE_KEY` (not anon key)
- Local needs `SUPABASE_SERVICE_ROLE_KEY` in `.env.local`

**Nothing deleted:**

- Normal if no non-rumors older than 24 hours exist

**Function not found:**

- Apply SQL migration to database

**Access denied error:**

- Function requires admin role in JWT metadata
- Script must use `service_role` key, not `anon` key
- Public roles cannot execute this function (security feature)

## See Also

- [Soylenti Feature](../CLAUDE.md#soylenti-implementation)
- [Database Schema](../sql/0002_add_betis_news_table.sql)
- [Rumor Sync Workflow](../.github/workflows/sync-rumors.yml)
