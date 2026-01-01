# ADR-016: Soylenti Frontend Architecture Consolidation

## Status

Accepted

## Context

The Soylenti feature evolved organically through multiple development phases:

- Phase 1: RSS aggregation with basic display
- Phase 2A: AI analysis with Gemini, player extraction
- Phase 2B: Admin reassessment, hide functionality

This growth led to code duplication across the frontend codebase:

- Type definitions duplicated in 6+ files (PlayerInfo, Rumor, BetisNewsWithPlayers)
- Utility functions duplicated in 3+ locations (isTransferRumor, probability color logic, date formatting)
- Database queries repeated with minor variations across page.tsx, actions.ts, and admin components
- The `fetchRumorsByPlayer` function made 3 sequential database queries instead of 1

A multi-persona code review identified these issues and recommended consolidation.

## Decision

We will consolidate the Soylenti frontend code into a shared module structure:

### Shared Types (`src/types/soylenti.ts`)

Single source of truth for all Soylenti-related types:

- `PlayerRole`: Union type for player roles (target, departing, mentioned)
- `PlayerInfo`: Player display information
- `Rumor`: Client-side rumor representation with camelCase fields
- `NewsPlayer`: Junction table record for admin views
- `BetisNewsWithPlayers`: Extended news type with player data

### Shared Utilities (`src/lib/soylenti/utils.ts`)

Consolidated utility functions:

- `isTransferRumor()`: Check if ai_probability > 0, handling string-to-number conversion
- `getProbabilityColor()`: Get CSS classes for probability badges (70/40 thresholds)
- `formatSoylentiDate()`: Spanish locale date formatting with singleton DateTimeFormat
- `paginateResults()`: Generic pagination helper

### Query Layer (`src/lib/soylenti/queries.ts`)

Consolidated database queries:

- `mapToRumor()`: Transform database records to client types
- `fetchRumorsByPlayer()`: Optimized single-query approach using `!inner` joins
- `fetchMoreRumors()`: Cursor-based pagination
- `fetchInitialRumors()`: Initial page load query

## Consequences

### Positive

- **Reduced duplication**: Type definitions reduced from 8+ instances to 1
- **Improved performance**: `fetchRumorsByPlayer` reduced from 3 queries to 1
- **Better maintainability**: Changes to types/utilities only needed in one place
- **Consistent behavior**: All components use the same probability thresholds and formatting
- **Documented patterns**: Clear location for Soylenti-related code

### Negative

- **Import changes required**: Existing components need to update their imports
- **Learning curve**: Developers need to know about the shared module structure

## References

- [ADR-015: AI Rumor Scoring System](./015-ai-rumor-scoring.md)
- [Research: Soylenti Simplification](../research/2026-01-soylenti-simplification.md)
