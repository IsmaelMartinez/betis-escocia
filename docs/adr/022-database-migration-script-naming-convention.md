# ADR-022: Database Migration Script Naming Convention

## Status
- **Status**: Accepted
- **Date**: 2025-09-08  
- **Authors**: Claude Code Assistant
- **Decision Maker**: Development Team

## Context

The project has accumulated multiple individual SQL migration files (`sql/*.sql`) that need to be executed in a specific order for proper database setup. The current naming scheme is inconsistent and doesn't guarantee sequential execution. With the introduction of aggregated database scripts and the need for future migrations, we need a standardized naming convention that:

1. Ensures scripts execute in the correct order
2. Allows for expansion without renumbering existing scripts
3. Makes script purpose immediately clear from the filename
4. Supports both schema changes and data migrations

Current situation:
- Multiple individual migration files with inconsistent naming
- New aggregated scripts (`00_complete_schema.sql`, `01_seed_data.sql`)
- Need for future migration scripts as the application evolves
- Risk of executing scripts in wrong order during deployment

## Decision

We will adopt a **4-digit numerical prefix naming convention** for all database migration scripts:

### Naming Pattern
```
NNNN_descriptive_name.sql
```

Where:
- `NNNN` = 4-digit zero-padded sequential number (0001, 0002, 0003, etc.)
- `descriptive_name` = Snake_case description of the script's purpose
- Scripts execute in numerical order

### Numbering Strategy

**Sequential numbering** starting from 0000 and incrementing by 1 for each new migration:

- 0000, 0001, 0002, 0003, etc.
- No gaps or reserved ranges - just chronological order
- Simple and predictable

### File Naming Examples
```
0000_complete_schema.sql              # Initial complete database schema
0001_seed_data.sql                    # Initial sample data
0002_add_notification_preferences.sql # Add notification preferences table
0003_add_user_avatar_column.sql      # Add avatar column to users
0004_optimize_rsvp_queries.sql       # Add indexes for RSVP queries
0005_migrate_legacy_contact_data.sql # Migrate old contact format
0006_cleanup_expired_cache.sql      # Remove expired cache entries
```

## Consequences

### Positive
- **Guaranteed execution order**: Scripts run in predictable sequence
- **Future-proof**: 4-digit prefix allows 10,000 migrations before needing renumbering
- **Clear categorization**: Number ranges indicate script type and purpose
- **Easy identification**: Script purpose is immediately apparent from filename
- **Tool compatibility**: Works with standard database migration tools
- **Version control friendly**: Clear diffs and history tracking

### Negative
- **Migration effort**: Existing scripts need to be renamed to follow convention
- **Discipline required**: Team must consistently follow numbering scheme
- **Gap management**: Unused numbers create gaps in sequence (acceptable trade-off)

### Neutral
- **Learning curve**: Team needs to learn new naming convention
- **Documentation overhead**: Need to maintain migration log/changelog

## Alternatives Considered

### Option 1: Timestamp-based naming (YYYYMMDD_HHMMSS_)
- **Pros**: Naturally chronological, avoids conflicts in team environment
- **Cons**: Less human-readable, harder to categorize by purpose, longer filenames
- **Reason for rejection**: 4-digit sequential is cleaner and more predictable

### Option 2: 3-digit numbering (001_, 002_, etc.)
- **Pros**: Shorter filenames, simpler numbering
- **Cons**: Only 1,000 possible migrations, may need renumbering sooner
- **Reason for rejection**: 4-digit provides better future-proofing

### Option 3: Semantic versioning approach (v1.0.1_)
- **Pros**: Follows familiar versioning pattern
- **Cons**: Complex for simple migration ordering, unclear numbering progression
- **Reason for rejection**: Over-engineered for migration script naming

### Option 4: Keep current ad-hoc naming
- **Pros**: No migration effort required
- **Cons**: Continues current problems with ordering and clarity
- **Reason for rejection**: Doesn't solve the core problems

## Implementation Notes

### Migration Plan
1. **Rename existing scripts** to follow new convention:
   ```bash
   # Examples:
   initial_setup.sql → 0000_complete_schema.sql
   create_trivia_tables.sql → (integrated into 0000_)
   populate_trivia_data.sql → 0001_seed_data.sql
   ```

2. **Update documentation** to reference new filenames

3. **Update deployment procedures** to use new naming convention

### Directory Structure
```
sql/
├── 0000_complete_schema.sql      # Main schema
├── 0001_seed_data.sql           # Sample data  
├── legacy/                      # Archive of old individual files
│   ├── initial_setup.sql
│   ├── create_trivia_tables.sql
│   └── ...
└── README.md                    # Migration guide
```

### Migration Script Template
```sql
-- Migration: NNNN_descriptive_name.sql
-- Purpose: [Brief description of changes]
-- Dependencies: [Previous migration numbers if any]
-- Date: YYYY-MM-DD
-- Author: [Author name]

-- BEGIN MIGRATION
[SQL statements here]

-- Verification queries
SELECT 'Migration NNNN completed successfully' as status;

-- END MIGRATION
```

## References
- [Database Setup Guide](../database-setup.md)
- [Deployment Guide](../deployment-guide.md)
- [Supabase Migration Best Practices](https://supabase.com/docs/guides/database/migrations)

## Review
- **Next review date**: 2026-03-08 (6 months)
- **Review criteria**: When we approach 1000 migrations in any category, or when the numbering scheme becomes problematic