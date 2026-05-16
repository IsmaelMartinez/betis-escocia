# Developer Guide

This guide covers everything you need to develop on the Peña Bética Escocesa site.

## Quick Start

```bash
git clone git@github.com:IsmaelMartinez/betis-escocia.git
cd betis-escocia
npm install
cp .env.local.example .env.local   # fill in FOOTBALL_DATA_API_KEY
npm run dev
```

The dev server runs on http://localhost:3000 with Turbopack. Match and standings data are fetched from football-data.org on demand; without a valid `FOOTBALL_DATA_API_KEY` the `/partidos` and `/clasificacion` pages will surface error states but the rest of the site renders fine.

## Required Tools

- Node.js 22.13+ or 24+ (see `engines` in `package.json`)
- npm (no other package manager is configured)
- A Vercel account is only needed if you want to deploy a preview

## Environment Variables

Only `FOOTBALL_DATA_API_KEY` is required. Get a free key at https://www.football-data.org/.

Optional:

| Variable                    | Purpose                                                    |
| --------------------------- | ---------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`      | Used by `sitemap.ts` and `metadataBase`. Defaults to prod. |
| `NEXT_PUBLIC_SENTRY_DSN`    | Sentry client DSN. Sentry is silent without it.            |
| `SENTRY_DSN`                | Sentry server DSN (used by the Next.js Sentry SDK).        |
| `GOOGLE_SITE_VERIFICATION`  | Google Search Console verification tag.                    |
| `FOOTBALL_DATA_API_URL`     | Override the football-data.org base URL (rare).            |
| `API_RATE_LIMIT_PER_MINUTE` | Override the default 10 req/min cap.                       |

Pre-commit hooks (lint, prettier, type-check) run via Lefthook; they install on `npm install` via the `prepare` script.

## Architecture

- **Next.js 16 App Router** with React 19 and TypeScript.
- **Public pages** are statically rendered where possible: `/`, `/nosotros`, `/unete`, `/jugadores-historicos`, `/joaquin`, and `/partidos` are `○ (Static)`.
- **Dynamic pages** that fetch from football-data.org on demand: `/clasificacion`, `/partidos/[matchId]`.
- **API routes** at `/api/matches` and `/api/standings` wrap `FootballDataService` with `unstable_cache` (30 min and 24 h respectively).
- **No database, no authentication, no admin surface.** All site content is either compile-time static (TypeScript constants in `src/data/`) or comes from football-data.org.

## Code Patterns

### Adding a new API route

```typescript
// src/app/api/example/route.ts
import { createApiHandler } from "@/lib/api/apiUtils";
import { z } from "zod";

const querySchema = z.object({
  limit: z.coerce.number().min(1).max(50).default(10),
});

export const GET = createApiHandler({
  schema: querySchema,
  handler: async ({ limit }) => {
    const items = await fetchSomething(limit);
    return { success: true, items };
  },
});
```

The wrapper handles Zod validation, response shaping, error mapping, and `BusinessLogicError` → HTTP status. If the handler returns an object with `success`, it's passed through verbatim; otherwise it's wrapped in `createSuccessResponse(data)`.

### Adding a new page

Create `src/app/<route>/page.tsx`. If the page depends on external data, wrap fetches in `unstable_cache` and choose an appropriate `revalidate` window. Public pages should be static-renderable; reach for `force-dynamic` only when the page truly needs to be re-fetched per request (e.g. `/clasificacion`).

### Adding a new component

Create the component plus a `.stories.tsx` alongside it. Mobile-first, use the Betis brand tokens (see `docs/design-system.md` and `CLAUDE.md`). Run `npm run storybook` to develop in isolation.

## Common Tasks

### Re-pull dependencies cleanly

If your `node_modules` get into a bad state (e.g. after reverting a major version bump):

```bash
git checkout main -- package.json package-lock.json
rm -rf node_modules
npm install
```

Avoid `--legacy-peer-deps`; use the `overrides` field in `package.json` for genuine peer-dep conflicts.

### Verify before a PR

```bash
npm run lint
npm run type-check
npm test
npm run build
```

Lefthook runs the first three on commit, but `npm run build` only runs in CI; it catches issues that the dev server tolerates.

## References

- `CLAUDE.md` — quick orientation aimed at Claude Code sessions
- `docs/testing-guide.md` — how the test suites are structured
- `docs/deployment-guide.md` — Vercel deploy specifics
- `docs/design-system.md` — colour, typography, accessibility
- `docs/adr/` — architecture decision records
