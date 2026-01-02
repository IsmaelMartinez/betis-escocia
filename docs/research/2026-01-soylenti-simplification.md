# Research: Soylenti Feature Simplification

**Date**: January 2026
**Status**: Planning
**Author**: Multi-persona code review synthesis

## Executive Summary

A comprehensive multi-persona review of the Soylenti feature identified significant opportunities for simplification across code architecture, type safety, performance, and documentation. This document outlines the findings and proposes a phased approach to address them.

## Background

The Soylenti feature was developed in phases:

- Phase 1: RSS aggregation with basic display
- Phase 2A: AI analysis with Gemini, player extraction
- Phase 2B: Admin reassessment, hide functionality

This organic growth led to code duplication and architectural inconsistencies that now warrant consolidation.

## Review Methodology

Four specialized reviewers analyzed the codebase in parallel:

1. **Architecture Reviewer** - Data flow, separation of concerns, component responsibilities
2. **Type Safety Reviewer** - Type definitions, database/TypeScript mismatches, nullability
3. **Performance Reviewer** - Re-renders, data fetching, caching, bundle size
4. **Simplification Reviewer** - Duplicate code, unnecessary complexity, consolidation opportunities

## Consolidated Findings

### Critical Issues

| Issue                                     | Files Affected                                | Reviewer(s)                               |
| ----------------------------------------- | --------------------------------------------- | ----------------------------------------- |
| Duplicate `Rumor` type definition         | SoylentiClient.tsx, actions.ts, RumorCard.tsx | Architecture, Type Safety, Simplification |
| `ai_probability` string/number mismatch   | All Soylenti files                            | Type Safety, Performance                  |
| Same filter logic in 3+ places            | SoylentiClient.tsx, RumorCard.tsx             | Simplification                            |
| Same DB query pattern in 3 places         | page.tsx, actions.ts                          | Architecture, Simplification              |
| 3 sequential DB queries for player rumors | actions.ts                                    | Performance                               |

### Important Issues

| Issue                               | Files Affected                      | Reviewer(s)      |
| ----------------------------------- | ----------------------------------- | ---------------- |
| No shared data access layer         | Scattered queries                   | Architecture     |
| DateTimeFormat created per card     | RumorCard.tsx                       | Performance      |
| Two filter passes (display + count) | SoylentiClient.tsx                  | Performance      |
| 10 state variables in client        | SoylentiClient.tsx                  | Architecture     |
| Probability color logic duplicated  | RumorCard.tsx, SoylentiNewsList.tsx | Simplification   |
| No URL state for player filter      | SoylentiClient.tsx                  | Performance (UX) |

## Documentation Audit

### Existing Documentation

| Document                                             | Status                   | Update Needed                     |
| ---------------------------------------------------- | ------------------------ | --------------------------------- |
| `docs/adr/015-ai-rumor-scoring.md`                   | Current                  | Add type consolidation decision   |
| `docs/developer-guide.md`                            | Brief mention            | Add Soylenti architecture section |
| `docs/research/2025-12-soylenti-phase2-evolution.md` | Historical               | Reference only                    |
| `CLAUDE.md`                                          | Missing Soylenti details | Add Soylenti patterns section     |

### Documentation Gaps

1. **No Soylenti-specific developer guide** - New developers don't know where to find types, queries, utilities
2. **ADR-015 doesn't cover frontend architecture** - Only covers AI/backend
3. **CLAUDE.md lacks Soylenti patterns** - Should document shared utilities location
4. **No type documentation** - `ai_probability` semantic meaning (0=non-transfer, null=unanalyzed) not documented

### Proposed New Documentation

1. **ADR-016: Soylenti Frontend Architecture** - Document the refactored architecture decisions
2. **Update CLAUDE.md** - Add Soylenti section with key patterns
3. **Update ADR-015** - Add section on frontend type handling

## Implementation Plan

### Phase 1: Foundation (P0 - Immediate)

**Goal**: Create shared types and utilities to eliminate duplication.

#### 1.1 Create Shared Types

**New file**: `src/types/soylenti.ts`

```typescript
// Player role union type
export type PlayerRole = "target" | "departing" | "mentioned";

// Shared player info for client components
export interface PlayerInfo {
  name: string;
  normalizedName?: string;
  role?: PlayerRole;
}

// Client-side rumor representation
export interface Rumor {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  description?: string;
  aiProbability?: number | null;
  aiAnalysis?: string | null;
  players?: PlayerInfo[];
}

// Extended news type for admin (includes DB fields)
export interface BetisNewsWithPlayers extends BetisNews {
  news_players?: Array<{
    player_id: number;
    role: PlayerRole;
    players: {
      id: number;
      name: string;
      normalized_name: string;
    } | null;
  }>;
}
```

**Files to update**:

- `src/app/soylenti/SoylentiClient.tsx` - Remove local types
- `src/app/soylenti/actions.ts` - Remove local types
- `src/components/RumorCard.tsx` - Remove local types
- `src/components/admin/SoylentiNewsList.tsx` - Remove local types
- `src/app/admin/AdminPageClient.tsx` - Remove local types

#### 1.2 Create Shared Utilities

**New file**: `src/lib/soylenti/utils.ts`

```typescript
/**
 * Check if a news item is a transfer rumor.
 * - null/undefined = not yet analyzed
 * - 0 = analyzed, confirmed non-transfer
 * - >0 = transfer rumor with credibility score
 */
export const isTransferRumor = (
  aiProbability?: number | string | null,
): boolean => {
  const prob = Number(aiProbability);
  return !isNaN(prob) && prob > 0;
};

/**
 * Get CSS classes for probability badge based on value.
 * Thresholds: 70+ = high (green), 40-69 = medium (gold), <40 = low (gray)
 */
export const getProbabilityColor = (
  probability?: number | string | null,
): string => {
  const prob = Number(probability);
  if (isNaN(prob) || prob <= 0) return "bg-gray-200 text-gray-700";
  if (prob >= 70) return "bg-betis-verde text-white";
  if (prob >= 40) return "bg-betis-oro text-betis-verde-dark";
  return "bg-gray-200 text-gray-700";
};

// Pre-created formatter for performance
const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  day: "numeric",
  month: "short",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

export const formatSoylentiDate = (dateString: string): string => {
  return dateFormatter.format(new Date(dateString));
};

export const paginateResults = <T>(data: T[], limit: number) => ({
  items: data.length > limit ? data.slice(0, limit) : data,
  hasMore: data.length > limit,
});
```

**Files to update**:

- `src/app/soylenti/SoylentiClient.tsx` - Use isTransferRumor, formatSoylentiDate
- `src/components/RumorCard.tsx` - Use getProbabilityColor, formatSoylentiDate
- `src/components/admin/SoylentiNewsList.tsx` - Use getProbabilityColor
- `src/app/soylenti/page.tsx` - Use paginateResults

### Phase 2: Data Layer (P1 - Short-term)

**Goal**: Consolidate database queries into single location.

#### 2.1 Create Query Layer

**New file**: `src/lib/soylenti/queries.ts`

Key functions:

- `fetchRumors({ limit, cursor, playerName })` - Unified query with optional filters
- `mapToRumor(dbItem)` - Single transformation function

**Files to update/simplify**:

- `src/app/soylenti/page.tsx` - Use fetchRumors
- `src/app/soylenti/actions.ts` - Use fetchRumors (or potentially remove)

#### 2.2 Optimize Player Rumors Query

Replace 3 sequential queries with single JOIN:

```sql
SELECT bn.*, np.role, p.name, p.normalized_name
FROM betis_news bn
INNER JOIN news_players np ON bn.id = np.news_id
INNER JOIN players p ON np.player_id = p.id
WHERE p.normalized_name = $1
  AND bn.is_duplicate = false
  AND bn.is_hidden = false
ORDER BY bn.pub_date DESC
LIMIT $2
```

### Phase 3: Performance (P1 - Short-term)

**Goal**: Eliminate redundant computations.

#### 3.1 Server-side Filtering (COMPLETED)

As of January 2026, the Soylenti page now shows ONLY rumors (ai_probability > 0) with server-side filtering. The "Mostrar noticias" toggle was removed.

All queries now include `.gt("ai_probability", 0)`:
- Initial page load query in `page.tsx`
- Pagination query `fetchMoreRumors()` in `queries.ts`
- Player filtering query `fetchRumorsByPlayer()` in `queries.ts`

Client-side filtering is no longer needed - the `displayedRumors` useMemo simply sorts by date:

```typescript
const displayedRumors = useMemo(
  () =>
    [...rumorsToDisplay].sort(
      (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime(),
    ),
  [rumorsToDisplay],
);
```

#### 3.2 Add Caching

Add to `src/app/soylenti/page.tsx`:

```typescript
export const revalidate = 300; // 5 minutes ISR
```

### Phase 4: Documentation (P1 - Parallel)

**Goal**: Update all documentation to reflect changes.

#### 4.1 Create ADR-016

**New file**: `docs/adr/016-soylenti-frontend-architecture.md`

Contents:

- Decision to consolidate types in `src/types/soylenti.ts`
- Decision to create shared utilities in `src/lib/soylenti/`
- Decision to create data access layer in `src/lib/soylenti/queries.ts`
- Rationale: Eliminate duplication found in multi-persona review

#### 4.2 Update CLAUDE.md

Add new section after "Trivia Game Implementation":

```markdown
## Soylenti Implementation

### Architecture

- **Types**: `src/types/soylenti.ts` - Shared types for Rumor, PlayerInfo
- **Utilities**: `src/lib/soylenti/utils.ts` - isTransferRumor, getProbabilityColor, formatSoylentiDate
- **Queries**: `src/lib/soylenti/queries.ts` - Unified data fetching

### Key Patterns

- `ai_probability` comes from DB as string, always use `Number()` conversion
- Probability semantics: null=unanalyzed, 0=non-transfer, >0=transfer with score
- Color thresholds: 70+=green, 40-69=gold, <40=gray
```

#### 4.3 Update ADR-015

Add section "Frontend Type Handling":

- Document that `ai_probability` is NUMERIC(5,2) in DB but comes as string via Supabase
- Document the semantic meaning of 0 vs null
- Reference new types location

### Phase 5: State Simplification (P2 - Medium-term)

**Goal**: Reduce complexity in SoylentiClient.

#### 5.1 Add URL State for Player Filter

Use `useSearchParams` for `selectedPlayer` to enable:

- Deep linking (`/soylenti?player=nabil-fekir`)
- Browser back/forward navigation
- Shareable filtered views

#### 5.2 Consider Custom Hooks

Extract into focused hooks:

- `useFranMode()` - franMode toggle for credibility display (showAllNews removed - server-side filtering only)
- `useSoylentiPagination()` - hasMore, loadMore, cursor

## Success Metrics

| Metric                                 | Current | Target      |
| -------------------------------------- | ------- | ----------- |
| Lines of code in Soylenti files        | ~800    | ~550 (-30%) |
| Duplicate type definitions             | 4       | 1           |
| Duplicate filter functions             | 3       | 1           |
| DB queries for player rumors           | 3       | 1           |
| DateTimeFormat instances per page load | 50+     | 1           |

## Risk Assessment

| Risk                                       | Mitigation                                |
| ------------------------------------------ | ----------------------------------------- |
| Breaking changes to existing functionality | Comprehensive test coverage exists        |
| Type migration issues                      | Incremental migration, one file at a time |
| Performance regression                     | Before/after benchmarks                   |

## Timeline

| Phase                  | Duration  | Dependencies |
| ---------------------- | --------- | ------------ |
| Phase 1: Foundation    | 1-2 hours | None         |
| Phase 2: Data Layer    | 2-3 hours | Phase 1      |
| Phase 3: Performance   | 1 hour    | Phase 1      |
| Phase 4: Documentation | 1 hour    | Phase 1-3    |
| Phase 5: State         | 2-3 hours | Phase 1-2    |

**Total estimated effort**: 7-10 hours

## References

- [ADR-015: AI Rumor Scoring System](../adr/015-ai-rumor-scoring.md)
- [Phase 2 Evolution Research](./2025-12-soylenti-phase2-evolution.md)
- [Soylenti Refactor Plan](../soylenti-refactor-plan.md) (superseded by this document)
