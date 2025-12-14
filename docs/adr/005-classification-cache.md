# ADR-005: Classification Cache

## Status
Accepted

## Decision
**Upsert-based caching** for Football-Data.org standings to minimize API calls.

## Implementation
- Single row in `classification_cache` table
- Upsert overwrites previous entry (no unbounded growth)
- 60-second cache TTL

```typescript
async function setCachedStandings(standings: { table: StandingEntry[] }) {
  await supabase
    .from('classification_cache')
    .upsert(
      { id: 1, data: standings, last_updated: new Date().toISOString() },
      { onConflict: 'id' }
    );
}
```

## Benefits
- Reduced external API calls
- Fast response times
- Simple single-row architecture

