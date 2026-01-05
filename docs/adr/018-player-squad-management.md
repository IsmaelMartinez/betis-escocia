# ADR-018: Player and Squad Management System

## Status
Accepted

## Decision
**Comprehensive player management system** with separate squad tracking, formation builder, and Football-Data.org sync integration.

## Architecture

### Database Design
- **squad_members table**: Canonical source for current squad with rich metadata (position, DOB, nationality, shirt numbers)
- **starting_elevens table**: Saved formations with JSONB lineup data and visual coordinates
- **players table enhancements**: Added `display_name` and `external_id` for sync deduplication

### Key Design Decisions

**Separate squad_members vs Flags**
- Dedicated table enables complex metadata (position, status, contract dates) without polluting players table
- Maintains separation of concerns: `players` = rumor tracking, `squad_members` = current roster
- Supports rich queries: group by position, filter by status, calculate ages
- UNIQUE constraint on `player_id` ensures one squad entry per player

**External ID Linking**
- Football-Data.org IDs stored on both tables for reliable sync matching
- Enables idempotent syncs surviving name changes
- Dual matching: normalized name first, then aliases, finally external ID

**Batch Operations Pattern**
- All sync operations use batched updates with `Promise.all()` to prevent N+1 queries
- Collect data in first pass, execute batch operations in second pass
- Departed player handling: marks as "loaned_out" instead of deleting (preserves history)

**Service Role for Sync**
- Both script (`sync-squad.ts`) and API route (`/api/admin/squad/sync`) use service role client
- Bypasses RLS for admin operations while maintaining security boundaries
- Enables efficient batch operations without per-row permission checks

## API Routes

All routes use `createApiHandler` abstraction for consistent auth and validation:

### Squad Management
```typescript
GET/POST /api/admin/squad              // List/add squad members
GET/PATCH/DELETE /api/admin/squad/[id] // Individual operations
POST /api/admin/squad/sync             // Sync from Football-Data.org
```

### Formations
```typescript
GET/POST /api/admin/formations         // List/create formations
GET/PATCH/DELETE /api/admin/formations/[id]
```

### Player Operations
```typescript
GET /api/admin/players                 // List with filters (search, currentSquad, withRumors)
GET/PATCH/POST/DELETE /api/admin/players/[id]/aliases // Alias management
POST /api/admin/soylenti/players/merge // Merge duplicate players
```

## Data Flow

### Squad Sync
```
Football-Data.org API → sync endpoint → normalize names →
match existing players → batch update/create →
mark departed players → return statistics
```

### Formation Creation
```
Select formation → assign players to positions →
build JSONB lineup (playerId, position, x%, y%) →
validate 11 players → save to database
```

### Player Merge
```
Select primary & duplicate → preview merge →
transfer betis_news records → add alias →
cascade delete duplicate
```

## UI Components

- **PlayersTab**: Main container with 4 sub-views (all players, squad, merge, starting XI)
- **SquadManagement**: Position-grouped display with sync button
- **PlayerMergeUI**: Two-panel search interface for deduplication
- **StartingElevenBuilder**: Visual pitch with drag-and-drop player assignment

## Security

- **Authentication**: Admin-only routes via `auth: 'admin'`
- **RLS Policies**: Public read + service role full access
- **Validation**: Zod schemas for all inputs with ILIKE escaping for SQL injection prevention
- **Data Integrity**: Foreign key constraints, UNIQUE constraints, duplicate handling (error code 23505)

## Performance

- **Batch Operations**: Prevents N+1 queries via `Promise.all()` and `.in()` filters
- **Indexed Queries**: Indexes on position, status, shirt_number, external_id, JSONB lineup
- **Pagination**: Bounded limits (max 100 per page, max page 1000)

## Integration Points

- **Football-Data.org**: Free tier covers La Liga (Real Betis squad data)
- **Soylenti**: Players table shared with rumor tracking system
- **Clerk**: Admin authentication with role-based access

## Limitations & Future Improvements

- **RLS Policy Gap**: Authenticated admin users may need explicit policy (current: service role only)
- **Manual Player Add**: No UI for manually adding players to squad (only via sync)
- **Testing Coverage**: API routes and sync logic need comprehensive test suite
- **createApiHandler Enhancement**: Route params not passed to handlers (uses URL parsing workaround)

## References

- [Football-Data.org API](./002-football-api.md)
- [Database Migrations](./014-database-migrations.md)
- [Clerk Authentication](./001-clerk-authentication.md)
- Implementation: PR #252
