# DB Removal Plan

Working plan for removing the Supabase database from the Peña Bética
Escocesa site. The DB powers four feature areas and engagement on those
pages is low; the goal is to reduce moving parts (and the Supabase
dependency entirely) without losing the public-facing UX that still
matters.

Tracking branch: `claude/assess-db-removal-r9XiN`.

## Why

The DB currently backs:

- **Trivia** (`/trivia`) — high coupling, no engagement.
- **Partidos** (`/partidos`, homepage widget) — table is a cache + admin
  edit layer over Football-Data.org.
- **Clasificación** (`/clasificacion`) — single-row 24h cache.
- **Admin panel** (`/admin`) — only manages matches.

Already-dead tables in the schema: `rsvps`, `contact_submissions`,
`betis_news`, `players`, `news_players`.

## Phases

### Phase 1 — Delete trivia (IN PROGRESS)

Trivia has the deepest Clerk-Supabase coupling (RLS via Clerk JWT,
`user_trivia_scores` daily limits, three tables). Removing it
eliminates the strongest argument for keeping the DB and the
Clerk-Supabase JWT template.

**Scope:**

- Delete `src/app/trivia/`, `src/app/api/trivia/`,
  `src/lib/trivia/`, `src/lib/schemas/trivia.ts`,
  `src/types/trivia.ts`, `src/components/trivia/`.
- Strip trivia types and CRUD from `src/lib/api/supabase.ts`.
- Remove the trivia link from `UserMenu` (desktop + mobile).
- Update sign-in/sign-up copy ("Inicia sesión para jugar al trivia").
- Drop `TRIVIA` block from `standardErrors.ts` and `update-trivia`
  script from `package.json`.
- Delete trivia tests, stories, e2e specs, and the playwright
  global-setup smoke step.
- Move trivia SQL out of `sql/legacy/` (already legacy) — leave a
  one-line teardown note for the live DB.
- Update CLAUDE.md to drop the trivia section.

**Acceptance:** `npm run lint`, `npm run type-check`, and `npm test`
pass with no trivia references in `src/`.

### Phase 2 — Partidos to live API

- Switch `/partidos` and the homepage upcoming-matches widget to call
  Football-Data.org directly (the `/api/matches` route already does
  this).
- Drop `matches`-table reads/writes from components and hooks.
- Delete the admin panel (its only feature is match curation).
- Drop the admin sync endpoints and the
  `/api/sync-outdated-matches` background job.
- Lose: admin manual match edits, historical match cache. Public UX
  stays the same.

### Phase 3 — Standings without cache

- Remove `classification_cache` usage in `/api/standings`.
- Hit Football-Data.org directly each request, or wrap with a short
  in-memory cache. No user-visible change.

### Phase 4 — Drop Supabase

- Delete `src/lib/api/supabase.ts` and remaining helpers.
- Remove `@supabase/supabase-js` from `package.json`.
- Delete `SUPABASE_*` env vars from `.env.local.example` and
  `src/types/env.d.ts`.
- Drop the Clerk → Supabase JWT template wiring
  (`getAuthenticatedSupabaseClient`).
- Decide whether Clerk still earns its keep with no authenticated
  features. If not, queue a separate Clerk-removal phase.
- Archive `sql/` or leave a teardown script for dropping the live
  Supabase project.

## Out of scope (for now)

- Removing Clerk itself (revisit after Phase 4).
- Migrating to a different DB or backend.
- Re-enabling any of the removed features in a "lite" form
  (e.g. localStorage trivia).
