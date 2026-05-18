---
description: Guidelines and patterns for debugging and problem-solving.
globs:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
alwaysApply: false
---

# Debugging Workflow Instructions

## Description

Guidelines for debugging the Peña Bética Escocesa site. The site is a public static page with two football-data.org-backed API routes; most classical web-app failure modes (auth, RLS, form abuse) do not apply.

## Relevant files

- `src/app/error.tsx` — Next.js page-level error boundary
- `src/app/global-error.tsx` — Next.js global error boundary
- `src/components/ErrorBoundary.tsx` — reusable React error boundary
- `src/services/footballDataService.ts` — axios-rate-limited client; most data-related errors surface here
- `docs/adr/` — Architecture Decision Records for surviving systems

## Guidelines

### Common pitfalls

- **Always use latest stable versions** — research current library versions before implementation.
- **Verify library version compatibility** — Tailwind/PostCSS and Next.js major versions can have breaking peer changes.

### Error resolution patterns

#### football-data.org API errors

- **403 / 401**: `FOOTBALL_DATA_API_KEY` missing or invalid. Verify the value in `.env.local` (local dev) or the Vercel project's Environment Variables panel (prod).
- **429**: rate-limited. `FootballDataService` already wraps axios with `axios-rate-limit`; if you're seeing this you have probably set `API_RATE_LIMIT_PER_MINUTE` too high or you're running multiple instances against the same key.
- **Empty match list**: the season parameter expects the _start_ year of the season (e.g. `2025` for the 2025-2026 season). See `getCurrentFootballSeason()` in `footballDataService.ts`.
- **Stale data after deploy**: `/api/matches` caches at 30 min via route-segment `revalidate`; `/api/standings` caches at 24 h via `unstable_cache` (tag `"la-liga-standings"`). For matches, wait for the cache window or hit the route with a different query to force a fresh segment; for standings, call `revalidateTag("la-liga-standings")` from a server action to force a refresh in code.

### Troubleshooting sections in existing documentation

- Consult relevant ADRs in `docs/adr/` for the architectural decisions that might be biting you.
- `docs/api/football-data-api-implementation.md` documents quirks of the football-data.org integration.
