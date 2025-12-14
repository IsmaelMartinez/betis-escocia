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
- Tables: RSVPs, contacts, trivia, classification cache, notification preferences
- Row Level Security (RLS) enabled for user data
- Scheduled functions for GDPR compliance (3-month retention)
- Clerk JWT integration for authenticated queries

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
