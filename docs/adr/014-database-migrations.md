# ADR-014: Database Migration Naming

## Status
Accepted

## Decision
**4-digit sequential prefix** for database migration scripts.

## Naming Pattern
```
NNNN_descriptive_name.sql
```

Examples:
```
0000_complete_schema.sql
0001_seed_data.sql
0002_add_notification_preferences.sql
```

## Directory Structure
```
sql/
├── 0000_complete_schema.sql
├── 0001_seed_data.sql
├── legacy/                    # Archived old scripts
└── README.md
```

## Benefits
- Guaranteed execution order
- 10,000 possible migrations before renumbering
- Clear purpose from filename
- Works with standard migration tools

