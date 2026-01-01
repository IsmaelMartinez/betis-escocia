# Soylenti Feature Refactor Plan

## Review Summary

Four specialized reviewers analyzed the Soylenti feature code from different perspectives: Architecture, Type Safety, Performance, and Simplification. This document consolidates their findings into an actionable improvement plan.

## Consolidated Findings

### Theme 1: Type System Issues (Critical)

All reviewers flagged type-related problems:

1. `ai_probability` returns as string from Supabase but is typed as `number | null`
2. Duplicate type definitions for `Rumor`, `PlayerInfo`, `BetisNewsWithPlayers` across 4+ files
3. Inconsistent snake_case vs camelCase field naming
4. Missing shared types location (`src/types/soylenti.ts` doesn't exist)

### Theme 2: Code Duplication (Critical)

Identical logic appears in multiple places:

1. Filter logic for "is transfer rumor" (`prob > 0`) in 3 locations
2. Database query pattern with same select/filters in 3 locations
3. Probability color thresholds (70/40) in 2 locations
4. Date formatting in 3 locations
5. Data transformation (mapRumor) duplicated instead of reused

### Theme 3: Performance Issues (Important)

1. Client-side sorting recreates Date objects on every comparison
2. Two separate filter passes for displayedRumors and rumorCount
3. `fetchRumorsByPlayer` makes 3 sequential DB queries instead of 1 join
4. No pagination for player-filtered rumors
5. DateTimeFormat instantiated on every RumorCard render

### Theme 4: Architecture Concerns (Important)

1. No clear data access layer - queries scattered across components
2. Mixed server/client data fetching patterns
3. 10 state variables in SoylentiClient with complex interdependencies
4. No URL state for player filter (breaks deep linking)

## Action Plan

### Phase 1: Type System Consolidation (Immediate)

Create a single source of truth for Soylenti types.

**Files to create:**

- `src/types/soylenti.ts`

**Changes:**

```typescript
// src/types/soylenti.ts
export type PlayerRole = "target" | "departing" | "mentioned";

export interface PlayerInfo {
  name: string;
  normalizedName?: string;
  role?: PlayerRole;
}

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

export interface BetisNewsWithPlayers extends BetisNews {
  news_players?: NewsPlayer[];
}
```

**Files to update:**

- `src/app/soylenti/SoylentiClient.tsx` - remove local types, import from shared
- `src/app/soylenti/actions.ts` - remove local types, import from shared
- `src/components/RumorCard.tsx` - remove local types, import from shared
- `src/components/admin/SoylentiNewsList.tsx` - remove local types, import from shared
- `src/app/admin/AdminPageClient.tsx` - remove local types, import from shared

### Phase 2: Shared Utilities (Immediate)

Create utilities to eliminate duplicate logic.

**Files to create:**

- `src/lib/soylenti/utils.ts`

**Changes:**

```typescript
// src/lib/soylenti/utils.ts

/**
 * Check if a news item is a transfer rumor (ai_probability > 0)
 */
export const isTransferRumor = (
  aiProbability?: number | string | null,
): boolean => {
  const prob = Number(aiProbability);
  return !isNaN(prob) && prob > 0;
};

/**
 * Get the probability badge color class based on value
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

/**
 * Shared date formatter for Soylenti dates
 */
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

/**
 * Paginate results helper
 */
export const paginateResults = <T>(data: T[], limit: number) => ({
  items: data.length > limit ? data.slice(0, limit) : data,
  hasMore: data.length > limit,
});
```

**Files to update:**

- `src/app/soylenti/SoylentiClient.tsx` - use shared utilities
- `src/components/RumorCard.tsx` - use shared utilities
- `src/components/admin/SoylentiNewsList.tsx` - use shared utilities

### Phase 3: Data Access Layer (Short-term)

Consolidate database queries into a single location.

**Files to create:**

- `src/lib/soylenti/queries.ts`

**Changes:**

```typescript
// src/lib/soylenti/queries.ts
import { supabase } from "@/lib/supabase";
import type { Rumor } from "@/types/soylenti";

const NEWS_SELECT = `
  *,
  news_players (
    players (
      name,
      normalized_name
    )
  )
`;

const mapToRumor = (item: any): Rumor => ({
  title: item.title,
  link: item.link,
  pubDate: item.pub_date,
  source: item.source,
  description: item.description,
  aiProbability: item.ai_probability,
  aiAnalysis: item.ai_analysis,
  players:
    item.news_players?.map((np: any) => ({
      name: np.players?.name || "",
      normalizedName: np.players?.normalized_name || "",
    })) || [],
});

export async function fetchRumors(options: {
  limit?: number;
  cursor?: string;
  playerNormalizedName?: string;
}) {
  const { limit = 50, cursor, playerNormalizedName } = options;

  let query = supabase
    .from("betis_news")
    .select(NEWS_SELECT)
    .eq("is_duplicate", false)
    .eq("is_hidden", false)
    .order("pub_date", { ascending: false })
    .limit(limit + 1);

  if (cursor) {
    query = query.lt("pub_date", cursor);
  }

  if (playerNormalizedName) {
    // Use join filter instead of 3 separate queries
    query = query.eq(
      "news_players.players.normalized_name",
      playerNormalizedName,
    );
  }

  const { data, error } = await query;

  if (error) throw error;

  return {
    rumors: (data || []).slice(0, limit).map(mapToRumor),
    hasMore: (data?.length || 0) > limit,
  };
}
```

**Files to update:**

- `src/app/soylenti/page.tsx` - use shared queries
- `src/app/soylenti/actions.ts` - use shared queries (or delete entirely)

### Phase 4: Performance Optimizations (Short-term)

1. **Combine filter and count into single pass**
   - File: `src/app/soylenti/SoylentiClient.tsx:63-85`
   - Change: Single useMemo that returns both displayedRumors and rumorCount

2. **Pre-parse dates for sorting**
   - Add `pubDateMs: number` to Rumor type (computed once)
   - Sort by numeric timestamp instead of creating Date objects

3. **Add pagination to player rumors**
   - File: `src/app/soylenti/actions.ts:fetchRumorsByPlayer`
   - Add limit/cursor parameters

4. **Add cache headers**
   - File: `src/app/soylenti/page.tsx`
   - Add `export const revalidate = 300;` for 5-minute ISR

### Phase 5: State Simplification (Medium-term)

1. **Reduce SoylentiClient state variables**
   - Combine related state into objects
   - Remove intermediate computed values

2. **Add URL state for player filter**
   - Use `useSearchParams` for selectedPlayer
   - Enable deep linking and browser history

3. **Consider extracting custom hooks**
   - `useSoylentiFilters()` for filter state
   - `useSoylentiPagination()` for pagination logic

## Priority Matrix

| Task                             | Impact | Effort | Priority |
| -------------------------------- | ------ | ------ | -------- |
| Create shared types              | High   | Low    | P0       |
| Create shared utilities          | High   | Low    | P0       |
| Fix ai_probability type coercion | High   | Low    | P0       |
| Consolidate database queries     | High   | Medium | P1       |
| Combine filter/count passes      | Medium | Low    | P1       |
| Add player rumors pagination     | Medium | Medium | P2       |
| Pre-parse dates for sorting      | Low    | Low    | P2       |
| Add URL state for filters        | Medium | Medium | P2       |
| State refactoring                | Medium | High   | P3       |

## Estimated Impact

- **Code reduction**: ~30-40% fewer lines in Soylenti files
- **Performance**: ~2x faster client-side filtering with optimizations
- **Maintainability**: Single source of truth for types and queries
- **Developer experience**: Clear patterns, less confusion about where logic lives
