# Database Schema

This directory contains the consolidated database schema and seed data for the Betis Escocia project.

## Files

- **0001_setup.sql** - Complete database schema with all tables, functions, triggers, views, RLS policies, and grants
- **0002_seed_data.sql** - Sample data for development (trivia questions, matches, RSVPs, contacts)
- **legacy/** - Historical migration files (reference only)

## Migration Numbering

The schema uses a numbered migration system starting from 0001. This allows for:
- Clear ordering and execution sequence
- Easy addition of future migrations (0003, 0004, etc.)
- Simple tracking of schema evolution over time

The previous 15 migrations (0000-0014) were consolidated into 0001_setup.sql, restarting the numbering system with a clean foundation.

## Setting Up a Fresh Database

### Production or Development Setup

Run the setup migration to create all database objects:

```bash
psql your_database < sql/0001_setup.sql
```

### Development with Sample Data

After running the setup, optionally load seed data:

```bash
psql your_database < sql/0001_setup.sql
psql your_database < sql/0002_seed_data.sql
```

## Schema Organization

The consolidated schema file is organized into logical sections:

1. **Extensions** - PostgreSQL extensions (uuid-ossp, pgcrypto)
2. **Tables** - All tables with complete column definitions
   - Core tables (matches, rsvps, contact_submissions)
   - Trivia system (trivia_questions, trivia_answers, user_trivia_scores)
   - Caching (classification_cache)
   - Soylenti/News (betis_news, players, news_players)
3. **Functions** - Database functions for triggers and cleanup
4. **Triggers** - Automatic updated_at triggers
5. **Views** - Aggregated data views (match_rsvp_counts)
6. **RLS Policies** - Row Level Security policies for all tables
7. **Grants** - Permission grants for anon and authenticated roles
8. **Comments** - Documentation for tables, columns, and functions

## Migration History (Consolidated)

The current schema represents the evolution of 15 incremental migrations (0000-0014) that have been consolidated into a single file:

- **0000**: Foundation schema with core tables
- **0001**: Seed data + user_trivia_scores fixes (SERIAL instead of UUID)
- **0002**: betis_news table for Soylenti feature with AI analysis
- **0003**: Transfer direction and status tracking
- **0004**: Players and news_players tables
- **0005**: Admin reassessment workflow for news
- **0006**: Player aliases for deduplication
- **0007**: **CRITICAL FIX** - Corrected RLS policies with proper JWT paths
- **0008**: Current squad tracking flag
- **0009**: Squad members table (later removed)
- **0010**: Starting elevens/formations table (later removed)
- **0011**: Player display name and external_id
- **0012**: Cleanup function for old non-rumor news
- **0013**: Admin RLS policies for privileged operations
- **0014**: Dropped squad_members and starting_elevens tables

## Key Schema Features

### Row Level Security (RLS)

All tables have RLS enabled with appropriate policies:

- **Public tables**: matches, trivia questions/answers allow public read access
- **User-scoped tables**: rsvps, contact_submissions, user_trivia_scores allow users to view/insert their own data
- **Admin tables**: betis_news, players, news_players require admin role for write operations

### JWT Claims Structure

Admin authentication uses Clerk JWT with this structure:

```json
{
  "claims": {
    "publicMetadata": {
      "role": "admin"
    }
  }
}
```

**Note**: The players and news_players tables use a different JWT path (`auth.jwt()->'claims'->'publicMetadata'->>'role'`) than other tables due to Clerk's nested metadata structure. This was fixed in migration 0007.

### Automatic Cleanup

The schema includes automatic cleanup functions for GDPR compliance:

- **cleanup_old_rsvps()** - Deletes RSVPs older than 3 months
- **cleanup_old_contact_submissions()** - Deletes contact submissions older than 3 months
- **cleanup_old_non_rumor_news()** - Deletes non-rumor news (ai_probability = 0) older than 24 hours

The news cleanup function runs daily via GitHub Actions.

### Player Tracking

The players table supports:

- **Normalization**: normalized_name for deduplication
- **Aliases**: JSONB array for alternative names (nicknames, full names)
- **Squad tracking**: is_current_squad flag to distinguish current players from transfer targets
- **External linking**: external_id for Football-Data.org API matching
- **Display names**: display_name for UI (e.g., "Isco" instead of "Francisco Roman Alarcon")

### Transfer Rumors

The betis_news table includes comprehensive transfer rumor tracking:

- **AI Analysis**: ai_probability field (>0 = rumor, 0 = regular news, NULL = unanalyzed)
- **Direction**: transfer_direction (in/out/unknown)
- **Status**: transfer_status (rumor/confirmed/denied)
- **Deduplication**: content_hash and similarity_score for duplicate detection
- **Visibility**: is_hidden and is_relevant_to_betis for admin curation
- **Reassessment**: Admin can flag items for AI re-analysis with context

## Maintenance

### Applying Schema Changes

For fresh database setups, the schema is defined in `0001_setup.sql`.

For existing production databases that need schema changes:
1. Create a new numbered migration (e.g., `0003_add_new_feature.sql`)
2. Apply the migration to production databases
3. Document the change in this README
4. Future fresh setups can either:
   - Run all migrations sequentially (0001, 0002, 0003, etc.), OR
   - Update 0001_setup.sql to include the changes (and skip obsolete migrations)

### Future Migration Numbering

When adding new schema changes:
- Next migration: `0003_description.sql`
- Then: `0004_description.sql`, `0005_description.sql`, etc.
- Use descriptive names: `0003_add_notifications_table.sql`, `0004_add_user_preferences.sql`

### Backup and Restore

To backup the current schema:

```bash
pg_dump --schema-only your_database > backup_schema.sql
```

To backup with data:

```bash
pg_dump your_database > backup_full.sql
```

## Legacy Migrations

The `legacy/` directory contains the original 15 incremental migration files for historical reference. These are no longer used for fresh database setups but provide insight into how the schema evolved over time.

**Do not run legacy migration files** - they may contain:

- Broken RLS policies (fixed in later migrations)
- Tables that were later dropped (squad_members, starting_elevens)
- Incremental ALTER statements instead of complete CREATE TABLE statements

Always use `0001_setup.sql` for new database setups.
