## Relevant Files

- `src/app/api/standings/route.ts` - Contains the `getCachedStandings` and `setCachedStandings` functions.
- `sql/add_cache_id_column.sql` - (Potential new file) Database migration script to add `id` column and unique constraint.
- `tests/integration/standings.test.ts` - (Potential new file) Integration tests for the cache logic.

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Tasks

- [ ] 1.0 Prepare Database Schema for Upsert
  - [ ] 1.1 Create a migration script (e.g., `sql/add_cache_id_column.sql`) to add an `id` column with a default value of `1` and a `UNIQUE` constraint to the `classification_cache` table.
  - [ ] 1.2 Apply the database migration script to your development environment.
  - [ ] 1.3 Verify the schema change in your Supabase dashboard or by querying the database.
- [ ] 2.0 Modify `setCachedStandings` to Use Upsert
  - [ ] 2.1 Open `src/app/api/standings/route.ts`.
  - [ ] 2.2 Change the `supabase.from('classification_cache').insert(...)` call to `supabase.from('classification_cache').upsert(...)`.
  - [ ] 2.3 Ensure the `upsert` call includes `{ id: 1, ... }` in the data object and `{ onConflict: 'id' }` in the options object.
- [ ] 3.0 Implement Comprehensive Tests for Cache Logic
  - [ ] 3.1 Determine the most suitable testing approach:
    -   **Integration Tests:** Recommended for this scenario, as it involves interaction with the database and external API (mocked). This will verify the end-to-end caching behavior.
    -   **Unit Tests:** Could be used for `setCachedStandings` in isolation, but would require extensive mocking of Supabase client.
  - [ ] 3.2 Create a new test file (e.g., `tests/integration/standings.test.ts`).
  - [ ] 3.3 Write test cases to cover:
    -   Initial cache population (first call to `GET`).
    -   Cache hit (subsequent calls within `CACHE_DURATION_HOURS`).
    -   Cache refresh (calls after `CACHE_DURATION_HOURS` have passed).
    -   Error handling during external API calls and database operations.
  - [ ] 3.4 Run the newly created tests to ensure the cache logic works as expected.
