# ADR-003: Supabase Database

## Status
Accepted

## Decision
**Supabase** (PostgreSQL) is our database solution.

## Why Supabase
- **Cost**: Free tier (500MB storage, 2GB bandwidth)
- **Features**: Full PostgreSQL, auto-generated APIs, real-time
- **Compliance**: Built-in GDPR data retention support
- **Admin UI**: Excellent web dashboard for data management

## Implementation
- Tables in active use: `matches`, `trivia_questions`, `trivia_answers`, `user_trivia_scores`, `classification_cache`
- Row Level Security (RLS) enabled for user data
- Clerk JWT integration for authenticated queries

Note: the SQL schema (`sql/0001_setup.sql`) still contains legacy `rsvps` and `contact_submissions` tables from earlier iterations; the application code no longer reads or writes them (see commit 90bbbf2).

## Key Patterns
```typescript
// Anonymous client (public data)
import { supabase } from '@/lib/supabase';

// Authenticated client (user-specific data with RLS)
const supabase = getAuthenticatedSupabaseClient(clerkToken);
```

## References
- [Supabase Documentation](https://supabase.com/docs)
- ADR-006: Clerk-Supabase JWT Integration
