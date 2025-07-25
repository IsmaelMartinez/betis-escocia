# Documentation Updates - July 25, 2025

## Recent Changes

### ADR-010: Storybook v9 Migration (NEW)

A comprehensive ADR documenting the migration from Storybook v8 to v9, including:

- **Package consolidation**: Essential addons moved to core
- **Performance improvements**: 48% lighter bundle sizes
- **Configuration updates**: Updated `.storybook/main.ts` and import paths
- **Migration process**: Using official automigration tools

**Location**: `docs/adr/010-storybook-v9-migration.md`

### Updated Storybook Guide

Enhanced the storybook guide (`docs/storybook-guide.md`) with:

- **Version specification**: Now clearly indicates Storybook v9.0.18
- **Package structure changes**: Documents which addons are now built-in
- **Migration notes**: References the new ADR for migration details
- **Performance notes**: Highlights v9 improvements

### Updated Project Overview (GEMINI.md)

Refreshed the main project documentation with:

- **Current technology versions**: Next.js 15, Storybook v9.0.18, Tailwind CSS v4
- **Testing improvements**: Enhanced component testing with Vitest integration
- **Performance updates**: Documented bundle size improvements
- **Completed improvements**: Marked Storybook v9 migration as completed

## Documentation Structure

```
docs/
├── adr/                          # Architecture Decision Records
│   ├── 001-clerk-authentication.md
│   ├── 002-football-api.md
│   ├── ...
│   ├── 009-clerk-e2e-testing.md
│   └── 010-storybook-v9-migration.md  # ← NEW
├── api/                          # API documentation
├── development/                  # Development guidelines
├── historical/                   # Historical research
├── security/                     # Security documentation
├── storybook/                    # Storybook-specific docs
│   └── templates/                # Component documentation templates
├── storybook-guide.md           # ← UPDATED: Now covers v9
└── README.md                    # ← This file
```

## Next Steps

1. **Review and validate** the updated documentation accuracy
2. **Update component stories** to leverage new Storybook v9 features
3. **Expand testing coverage** using the enhanced Vitest integration
4. **Monitor performance** improvements from the v9 migration

## Maintenance Notes

- ADRs should be reviewed every 6 months for relevance
- Storybook guide should be updated when new features are added
- GEMINI.md serves as the primary reference for AI agents and should be kept current
