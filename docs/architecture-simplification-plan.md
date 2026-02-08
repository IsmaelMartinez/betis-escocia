# Architecture Review & Simplification Plan

**Date:** 2025-02-07

## Context

A comprehensive review of the betis-escocia codebase was performed to identify opportunities for simplification and improvement. The project is a Next.js 15 application (~17K lines of source, ~40K lines of tests, 166 source files) serving as a Real Betis supporters club website in Edinburgh.

## Overall Assessment

The codebase has **solid fundamentals**: consistent API handler patterns (`createApiHandler`), a clean feature flag system, strong security posture (CSP, RLS, Clerk), and good test coverage. The main issues are structural — large files mixing concerns, a flat component directory, monolithic database module, and inconsistent test mocking. None of these are urgent defects, but addressing them will reduce cognitive load and maintenance cost as the project grows.

---

## Issue 1: Flat Component Directory — RESOLVED (Phase 2)

**Severity: HIGH** — Was the hardest part of the codebase to navigate.

### Current Structure (after Phase 2)

```
src/components/
├── layout/         # Layout
├── match/          # MatchCard, MatchTicket, AllDatabaseMatches, BackgroundMatchSync,
│                   # UpcomingMatches, FilteredMatches, PaginatedMatches,
│                   # CompetitionFilter, ShareMatch, UpcomingMatchesWidget
├── rsvp/           # RSVPWidget, RSVPForm, RSVPModal
├── trivia/         # GameTimer
├── hero/           # Hero, HeroCommunity, CulturalFusionHero
├── social/         # FacebookPagePlugin, InstagramEmbed, SocialMediaDashboard, FacebookSDK
├── widgets/        # ClassificationWidget, BetisPositionWidget, CommunityStats
├── admin/          # (existing)
├── patterns/       # (existing)
├── ui/             # (existing)
├── user/           # (existing)
└── *.tsx           # ~30 general-purpose components (BetisLogo, ErrorBoundary, etc.)
```

All stories files live alongside their components. All imports across src/ and tests/ were updated.

---

## Issue 2: Monolithic `supabase.ts` (790 lines)

**Severity: HIGH** — Single file contains all types, all CRUD operations, and client initialization for every feature.

### Current Problems

- 13+ CRUD functions following identical patterns (duplicated boilerplate)
- Type definitions for 5 tables mixed with operations
- Functions like `getUpcomingMatchesWithRSVPCounts` and `getAllMatchesWithRSVPCounts` share ~70% code
- Any schema change touches this massive file

### Proposed Structure

```
src/lib/supabase/
├── client.ts              # Client initialization only (~40 lines)
├── matches.ts             # Match types + CRUD operations
├── rsvps.ts               # RSVP types + operations
├── contacts.ts            # Contact types + operations
├── trivia.ts              # Trivia types + operations
├── classification.ts      # Classification cache operations
└── index.ts               # Re-exports for backward compatibility
```

### Optional: CRUD Factory

The repetitive CRUD pattern could be reduced with a factory:

```typescript
// supabase/crud.ts
export function createCrudOps<T>(tableName: string) {
  return {
    getAll: (limit?: number) =>
      supabase
        .from(tableName)
        .select("*")
        .order("created_at", { ascending: false })
        .limit(limit ?? 1000),
    getById: (id: string | number) =>
      supabase.from(tableName).select("*").eq("id", id).single(),
    create: (data: Partial<T>) =>
      supabase.from(tableName).insert([data]).select().single(),
    update: (id: string | number, data: Partial<T>) =>
      supabase.from(tableName).update(data).eq("id", id).select().single(),
    delete: (id: string | number) =>
      supabase.from(tableName).delete().eq("id", id),
  };
}
```

This is optional — the file split alone provides most of the benefit. Only add the factory if the repetition bothers you in practice.

---

## Issue 3: Large Components Mixing Concerns

**Severity: MEDIUM** — Several components exceed 500 lines by combining data fetching, business logic, and rendering.

### AdminPageClient.tsx (868 lines)

**Problem:** 11+ `useState` declarations, CSV export logic, stats fetching, 4 different views — all in one component.

**Proposed extraction:**

| Extract to                   | Lines | What                                           |
| ---------------------------- | ----- | ---------------------------------------------- |
| `hooks/useAdminStats.ts`     | ~80   | Stats fetching, refresh, sync logic            |
| `lib/csvExport.ts`           | ~70   | `downloadCSV`, `exportRSVPs`, `exportContacts` |
| `AdminDashboardView.tsx`     | ~150  | Dashboard stats & recent activity              |
| `AdminContactsView.tsx`      | ~80   | Contact list with filtering                    |
| Parent `AdminPageClient.tsx` | ~200  | View routing and shared state                  |

### RSVPWidget.tsx (531 lines)

**Problem:** Dual code path — one using a hook (`useRSVPData`), one using local state — to support both production and Storybook usage.

**Proposed fix:** Split into two thin wrappers over a shared base:

```
RSVPWidgetConnected.tsx   — Uses useRSVPData hook (production)
RSVPWidgetStandalone.tsx  — Uses local state (Storybook/tests)
RSVPWidgetBase.tsx        — Shared UI (~300 lines)
```

### contacto/page.tsx (644 lines)

**Problem:** Static content (FAQs, contact methods, form type definitions) mixed with form logic.

**Proposed extraction:**

- `constants/contact.ts` — Form types, FAQs, contact methods
- `hooks/useContactForm.ts` — Form state, validation, submission
- Parent page reduced to ~150 lines of composition

### AllDatabaseMatches.tsx (486 lines)

**Problem:** Filtering logic, pagination, and match grouping all inline.

**Proposed extraction:**

- `hooks/useMatchFilters.ts` — Filter and competition state
- `components/match/MatchPagination.tsx` — Reusable pagination
- Parent component reduced to ~200 lines

### Layout.tsx (464 lines)

**Problem:** Header, mobile nav, user menu, footer, and debug info all in one file. Nav rendering duplicated for desktop and mobile.

**Proposed extraction:**

- `layout/Header.tsx` — Desktop/mobile nav with shared `NavItems`
- `layout/Footer.tsx` — Footer sections
- `layout/UserMenu.tsx` — Auth-aware user controls
- Parent `Layout.tsx` reduced to ~60 lines

---

## Issue 4: Trivia API Route Complexity (531 lines)

**Severity: MEDIUM** — Four async functions with repetitive error handling and context building.

### Current Problems

- Error handling blocks repeated 3+ times with identical structure
- `TriviaErrorContext` object built verbatim in multiple places
- Route file contains business logic that belongs in a service module

### Proposed Fix

1. **Move operations to `lib/trivia/operations.ts`** — `getTriviaQuestions`, `saveTriviaScore`, etc.
2. **Extract error wrapper** — `withTriviaErrorHandling()` eliminates the repeated try/catch/log/track pattern
3. **Extract context builder** — `buildTriviaContext(request, userId, action)` removes duplication
4. **Route file becomes ~100 lines** — Just `createApiHandler` wrappers calling operations

---

## Issue 5: Test Infrastructure Inconsistency

**Severity: MEDIUM** — 360 `vi.mock()` calls across tests with no DRY principle; unused test helpers.

### Current Problems

1. **Duplicated mocking:** Supabase client mocked identically in 5+ integration test files. Clerk mocked inline in many tests despite existing `__mocks__/` directory.
2. **Dead code:** `mockFactories.ts` (216 lines) and `testHelpers.ts` (33 lines) are never imported anywhere.
3. **MSW underutilized:** Only 1 endpoint mocked in MSW handlers; many tests mock `global.fetch` directly.
4. **Setup-heavy tests:** Some test files have 28 mocks and 150 lines of setup for 300 lines of assertions.

### Proposed Fixes

**Priority 1 — Centralize mocks:**

```
tests/mocks/
├── supabase.ts      # Single source of truth for Supabase mocking
├── clerk.ts         # Clerk mock setup
├── navigation.ts    # next/navigation mocks
├── components.ts    # Common component mocks
└── index.ts         # Barrel export
```

**Priority 2 — Activate or remove dead helpers:**

Either integrate `mockFactories.ts` into tests (it already has useful factory functions for Match, RSVP, Contact, Trivia entities) or delete it.

**Priority 3 — Expand MSW handlers:**

Move all external API mocking from inline `global.fetch` overrides to MSW. This makes tests more realistic and reduces fragile mock coupling.

---

## Issue 6: Missing Custom Hooks

**Severity: LOW** — Business logic embedded in components that could be extracted for reuse and testability.

### Current State

Only 2 hooks exist: `useRSVPData` and `useApiData`.

### Candidates for Extraction

| Hook              | Source Component   | Benefit                            |
| ----------------- | ------------------ | ---------------------------------- |
| `useAdminStats`   | AdminPageClient    | Decouple fetch logic from UI       |
| `useContactForm`  | contacto/page      | Reusable form state management     |
| `useMatchFilters` | AllDatabaseMatches | Reusable filter + pagination logic |
| `usePagination`   | AllDatabaseMatches | Generic pagination utility         |
| `useTriviaGame`   | trivia/page        | Clean game state machine           |

### Proposed Location

```
src/lib/hooks/
├── useAdminStats.ts
├── useApiData.ts       (move from current location)
├── useContactForm.ts
├── useMatchFilters.ts
├── usePagination.ts
├── useRSVPData.ts      (move from src/hooks/)
└── index.ts
```

---

## Issue 7: Competition Constants Duplication

**Severity: LOW** — Competition display names and ribbon colors are defined inline in multiple components.

### Affected Files

- `MatchTicket.tsx` — `getCompetitionRibbon()` (31 lines), `getCompetitionDisplayName()` (15 lines)
- `MatchCard.tsx` — Similar mapping logic

### Proposed Fix

```typescript
// constants/competitions.ts
export const COMPETITION_CONFIG: Record<
  string,
  { ribbon: string; display: string }
> = {
  laliga: { ribbon: "from-red-600 to-red-700", display: "LaLiga" },
  champions: {
    ribbon: "from-blue-600 to-blue-800",
    display: "Champions League",
  },
  europa: { ribbon: "from-orange-500 to-orange-600", display: "Europa League" },
  conference: {
    ribbon: "from-green-600 to-green-700",
    display: "Conference League",
  },
  copa: { ribbon: "from-yellow-600 to-yellow-700", display: "Copa del Rey" },
};
```

---

## What NOT to Change

These parts of the architecture are working well and should be preserved:

- **`createApiHandler` pattern** (`apiUtils.ts`) — Clean, consistent, well-typed
- **Feature flag system** (`featureFlags.ts`) — Simple, effective, well-documented
- **Logger** (`logger.ts`) — Well-structured, environment-aware
- **ADR practice** — 14 ADRs providing valuable decision context
- **CI/CD pipeline** — Proper separation of required vs. non-blocking checks
- **SQL migration consolidation** — Clean two-file approach
- **Security posture** — CSP headers, RLS, admin role enforcement
- **Design system** — Branded color classes, well-documented

---

## Implementation Phases

### Phase 1: Quick Wins (low risk, immediate clarity) -- DONE

1. ~~Extract CSV utilities from AdminPageClient~~ -> `src/lib/csvExport.ts`
2. ~~Move contact form constants to `constants/contact.ts`~~ -> `src/lib/constants/contact.ts`
3. ~~Create `constants/competitions.ts` from duplicated mappings~~ -> `src/lib/constants/competitions.ts`
4. ~~Delete unused `mockFactories.ts` and `testHelpers.ts`~~ -> deleted

### Phase 2: Component Organization -- DONE

1. ~~Create component subdirectories (`layout/`, `match/`, `rsvp/`, etc.)~~
2. ~~Move components in batches, updating imports~~
3. ~~Run full test suite after each batch (all 2237 tests passing)~~
4. ~~Update Storybook paths~~

Components moved:
- `layout/` — Layout
- `match/` — MatchCard, MatchTicket, AllDatabaseMatches, BackgroundMatchSync, UpcomingMatches, FilteredMatches, PaginatedMatches, CompetitionFilter, ShareMatch, UpcomingMatchesWidget
- `rsvp/` — RSVPWidget, RSVPForm, RSVPModal
- `trivia/` — GameTimer
- `hero/` — Hero, HeroCommunity, CulturalFusionHero
- `social/` — FacebookPagePlugin, InstagramEmbed, SocialMediaDashboard, FacebookSDK
- `widgets/` — ClassificationWidget, BetisPositionWidget, CommunityStats

### Phase 3: Hook and Library Organization -- DONE

Organized `src/hooks` and `src/lib` into logical subdirectories for improved discoverability and maintainability.

**New Structure:**

```
src/hooks/
└── data/               # Data fetching hooks
    ├── useRSVPData.ts
    └── useApiData.ts

src/lib/
├── api/                # API clients and utilities
│   ├── apiUtils.ts
│   └── supabase.ts
├── auth/               # Authentication & authorization
│   ├── adminApiProtection.ts
│   ├── roleUtils.ts
│   └── withAdminRole.tsx
├── clerk/              # Clerk mocks (existing)
├── constants/          # Constants (existing)
├── features/           # Feature management
│   ├── featureFlags.ts
│   └── featureProtection.tsx
├── schemas/            # Validation schemas (existing)
├── trivia/             # Trivia utilities (existing)
└── utils/              # General utilities
    ├── config.ts
    ├── csvExport.ts
    ├── designSystem.ts
    ├── logger.ts
    ├── matchUtils.ts
    └── standardErrors.ts
```

**Changes:**
1. Created domain-focused subdirectories in `src/lib/`
2. Moved all hooks to `src/hooks/data/` (consolidated from `src/hooks/` and `src/lib/hooks/`)
3. Updated 200+ import paths across src/ and tests/
4. Updated all vi.mock() and jest.mock() calls in tests
5. Type-check and lint passing

**Benefits:**
- Clear separation of concerns (API, auth, features, utils)
- Easier to find related functionality
- Reduced cognitive load when navigating codebase
- Foundation for future modularization

### Phase 4: Split Large Components -- IN PROGRESS

**Target components (2,284 lines total):**
- AdminPageClient.tsx: 803 lines
- RSVPWidget.tsx: 531 lines
- AllDatabaseMatches.tsx: 486 lines
- Layout.tsx: 464 lines

**Planned splits:**
1. **AdminPageClient** → Extract custom hooks + create view components
   - ✅ Created `useAdminStats` hook (extracting stats fetching logic)
   - TODO: Create `useAdminMatches`, `useAdminContacts` hooks
   - TODO: Create DashboardView, MatchesView, ContactsView components
   - TODO: Simplify main component to orchestrate views
2. **Layout** → Extract Header, Footer, UserMenu components
3. **RSVPWidget** → Simplify dual-path logic (anonymous vs authenticated)
4. **AllDatabaseMatches** → Extract filtering/pagination into custom hooks

**Initial work (Phase 4.1):**
- Created `src/app/admin/hooks/useAdminStats.ts` - demonstrates pattern for extracting data fetching logic into reusable hooks
- Establishes structure for further component decomposition

**Expected benefits:**
- Smaller, focused components (target: <300 lines each)
- Reusable hooks for data fetching
- Easier testing of individual pieces
- Improved maintainability

### Phase 5: Database Module Split

1. Create `lib/supabase/` or `lib/api/database/` subdirectory structure
2. Move operations by feature domain (matches, rsvps, contacts, trivia, classification)
3. Create `index.ts` re-exports for backward compatibility
4. Update imports across codebase
5. Consider CRUD factory pattern to reduce boilerplate

### Phase 6: Test Infrastructure Cleanup

1. Centralize mocks into `tests/mocks/` directory
2. Create test fixture factories if needed
3. Expand MSW handlers for all external APIs
4. Reduce setup overhead in heaviest test files
5. Address any test failures from Phase 3 reorganization

### Phase 7: Hook Extraction (Additional)

1. Extract hooks from components with heavy state logic
2. Create additional hook categories as needed (ui/, form/, etc.)
3. Add unit tests for extracted hooks

---

## Expected Outcomes

**Positive:**

- Reduced cognitive load when navigating the codebase
- Easier onboarding for new contributors
- Better test maintainability through centralized mocking
- Clearer separation of concerns in large components
- Reusable hooks reduce duplication across features

**Trade-offs:**

- Import paths change (mitigated by barrel exports and IDE refactoring)
- Temporary code churn in PRs
- Need to update Storybook paths after component moves

**Neutral:**

- No performance impact (same code, better organized)
- No change to user-facing behavior
- No new dependencies required
