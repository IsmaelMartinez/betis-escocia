## Architectural Decision Record: ADR-005 - Optimizing Classification Cache Storage

**1. Title:** Optimizing Classification Cache Storage

**2. Status:** Proposed

**3. Context:**
The application's classification data is cached in the `classification_cache` Supabase table to reduce external API calls and improve response times. The current implementation of `setCachedStandings` in `src/app/api/standings/route.ts` inserts a new row into the `classification_cache` table every time the cache is updated (i.e., when the external API is called). This leads to an unbounded growth of the `classification_cache` table, storing multiple historical versions of the classification data, which is inefficient for a cache that only needs to store the latest valid data.

**4. Decision:**
We will modify the `setCachedStandings` function to use an `upsert` operation instead of a plain `insert`. This will ensure that only the latest classification data is stored in the `classification_cache` table, overwriting the previous entry rather than adding a new one.

**5. Consequences:**

*   **Positive:**
    *   **Improved Database Efficiency:** The `classification_cache` table will no longer grow indefinitely, reducing storage consumption and improving query performance for `getCachedStandings` (though current `limit(1)` mitigates this somewhat).
    *   **Clearer Cache State:** The database will accurately reflect the single, most recent cached classification, simplifying debugging and understanding of the cache's state.
    *   **Reduced Supabase Costs:** Potentially lower storage costs if the table were to grow very large.

*   **Negative:**
    *   Requires adding a unique constraint to the `classification_cache` table if one doesn't already exist on a suitable column. This might involve a database migration.

**6. Alternatives Considered:**

*   **Periodically cleaning old cache entries:** This would involve a separate process (e.g., a Supabase function or a scheduled job) to delete old rows. This is less efficient than an `upsert` as it still allows the table to grow temporarily and requires additional management overhead.
*   **Not caching at all:** This would negate the performance benefits of caching and increase reliance on the external API.

**7. Detailed Plan (Implementation Steps):**

1.  **Database Schema Update (if necessary):**
    *   Ensure the `classification_cache` table has a unique constraint on a column that will always hold the same value for the single cache entry. A common approach is to add a dummy `id` column (e.g., `id` with a default value of `1`) and a unique constraint, or a `cache_key` column with a fixed value.
    *   *Assumption:* For this ADR, we assume a unique `id` column (e.g., `id` with a default value of `1`) can be used for the upsert. If not, a new unique column will need to be added.

2.  **Modify `setCachedStandings` function:**
    *   Change the `insert` call to an `upsert` call, specifying the `onConflict` column.

**Example of `setCachedStandings` modification (assuming a unique `id` column):**

```typescript
async function setCachedStandings(standings: { table: StandingEntry[] }) {
  const { error } = await supabase
    .from('classification_cache')
    .upsert(
      { id: 1, data: standings, last_updated: new Date().toISOString() },
      { onConflict: 'id' } // Specify the unique column for conflict resolution
    );

  if (error) {
    console.error('Error saving standings to cache:', error);
  }
}
```
