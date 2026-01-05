# Database Setup Guide

## Overview

This guide explains how to set up the complete database schema for the Peña Bética Escocesa website using the aggregated SQL scripts.

## Files

- **`sql/0000_complete_schema.sql`** - Complete database schema with all tables, indexes, policies, and functions
- **`sql/0001_seed_data.sql`** - Sample data for development and testing
- **`sql/legacy/`** - Individual migration files (for reference only)

## Quick Setup for New Environment

### 1. Create New Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Wait for provisioning to complete
4. Note down your project URL and anon key

### 2. Run Schema Script

In the Supabase SQL Editor:

```sql
-- Run the complete schema setup
-- This creates all tables, policies, functions, and views
```

Then copy and paste the entire contents of `sql/00_complete_schema.sql`

### 3. Run Seed Data (Optional)

For development environments, run the seed data script:

```sql
-- Run the seed data script
-- This adds sample trivia questions, matches, RSVPs, and contact submissions
```

Then copy and paste the entire contents of `sql/01_seed_data.sql`

### 4. Verify Setup

Run this query to verify all tables were created:

```sql
SELECT
    schemaname,
    tablename,
    CASE
        WHEN hasindexes THEN '✅'
        ELSE '❌'
    END as has_indexes,
    CASE
        WHEN rowsecurity THEN '✅'
        ELSE '❌'
    END as rls_enabled
FROM pg_tables
WHERE schemaname = 'public'
    AND tablename IN (
        'matches', 'rsvps', 'contact_submissions',
        'trivia_questions', 'trivia_answers', 'user_trivia_scores',
        'classification_cache'
    )
ORDER BY tablename;
```

Expected output:

```
schemaname | tablename               | has_indexes | rls_enabled
-----------+-------------------------+-------------+------------
public     | classification_cache    | ✅          | ✅
public     | contact_submissions     | ✅          | ✅
public     | matches                 | ✅          | ✅
public     | rsvps                   | ✅          | ✅
public     | trivia_answers          | ✅          | ✅
public     | trivia_questions        | ✅          | ✅
public     | user_trivia_scores      | ✅          | ✅
```

## Environment Variables

Update your application environment variables with the new database credentials:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
```

## Database Schema Overview

### Core Tables

| Table                 | Purpose                        | Key Features                          |
| --------------------- | ------------------------------ | ------------------------------------- |
| `matches`             | Football match data            | External API integration, RLS enabled |
| `rsvps`               | Match attendance confirmations | User linking, GDPR cleanup            |
| `contact_submissions` | Contact form data              | Status tracking, admin management     |

### Trivia System

| Table                | Purpose                 | Key Features                        |
| -------------------- | ----------------------- | ----------------------------------- |
| `trivia_questions`   | Quiz questions          | Categories: betis, scotland, whisky |
| `trivia_answers`     | Multiple choice answers | Correct answer flagging             |
| `user_trivia_scores` | User scores             | Daily score tracking                |

### Supporting Tables

| Table                  | Purpose              | Key Features          |
| ---------------------- | -------------------- | --------------------- |
| `classification_cache` | API response caching | TTL for external data |

### Key Features

- **Row Level Security (RLS)** enabled on all tables
- **GDPR Compliance** with automatic cleanup functions
- **Indexes** optimized for common query patterns
- **Triggers** for automatic timestamp updates
- **Views** for aggregated data (match RSVP counts)

## Migration from Existing Database

If you have an existing database with individual migration files:

### Option 1: Fresh Start (Recommended)

1. Export any important data
2. Create new Supabase project
3. Run `00_complete_schema.sql`
4. Import your data

### Option 2: Update Existing Database

1. Compare current schema with `00_complete_schema.sql`
2. Apply missing tables, columns, and policies manually
3. Test thoroughly

## Development vs Production

### Development Setup

- Use `00_complete_schema.sql` + `01_seed_data.sql`
- Sample data helps with testing
- Can reset database easily

### Production Setup

- Use only `00_complete_schema.sql`
- Import real data separately
- Backup before any changes

## Maintenance

### GDPR Cleanup

The schema includes automatic cleanup functions:

```sql
-- Run monthly to clean old data (GDPR compliance)
SELECT cleanup_old_rsvps();
SELECT cleanup_old_contact_submissions();
```

### Performance Monitoring

Monitor these indexes for performance:

```sql
-- Check index usage
SELECT schemaname, tablename, indexname, idx_scan, idx_tup_read, idx_tup_fetch
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY idx_scan DESC;
```

### Backup Strategy

- Daily automatic backups via Supabase
- Weekly manual exports of critical data
- Point-in-time recovery available

## Troubleshooting

### Common Issues

**RLS Policy Errors**

```sql
-- Check if RLS is enabled
SELECT tablename, rowsecurity FROM pg_tables
WHERE schemaname = 'public' AND tablename = 'your_table';

-- View existing policies
SELECT tablename, policyname, cmd, roles, qual
FROM pg_policies
WHERE schemaname = 'public';
```

**Authentication Issues**

- Verify Clerk integration is working
- Check `auth.jwt()` returns expected user ID
- Test with Supabase Dashboard user simulator

**Performance Issues**

```sql
-- Check for missing indexes
SELECT schemaname, tablename, attname, n_distinct, correlation
FROM pg_stats
WHERE schemaname = 'public'
ORDER BY n_distinct DESC;
```

### Support

- Check Supabase logs for detailed error messages
- Use Supabase Dashboard for real-time monitoring
- Enable query performance insights

## Security Notes

- All tables have RLS enabled by default
- Public access only where explicitly needed
- Admin operations require proper authentication
- Sensitive data is never logged or cached
- Regular security audits of policies

---

**Last Updated**: September 2025  
**Schema Version**: v2.0  
**Compatible with**: Next.js 15, Supabase, Clerk Auth
