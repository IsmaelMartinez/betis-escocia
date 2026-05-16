---
description: Guidelines and patterns for code development workflows.
globs:
  - "src/**/*.ts"
  - "src/**/*.tsx"
  - "src/**/*.js"
  - "src/**/*.jsx"
alwaysApply: false
---

# Development Workflow Instructions

## Description

Guidelines and patterns for the code development workflow on the Peña Bética Escocesa site. The site is a public static page with two football-data.org-backed API routes — no database, no authentication, no admin surface.

## Relevant files

> For the complete architecture overview, see [CLAUDE.md](../../CLAUDE.md).

Key development files:

- `src/lib/api/apiUtils.ts` — `createApiHandler` (Zod validation + response shaping)
- `src/services/footballDataService.ts` — axios-rate-limited football-data.org client
- `src/lib/constants/team.ts` — `REAL_BETIS_TEAM_ID`
- `src/data/` — static TypeScript data (`leyendas`, `efemerides`)

## Guidelines

### API route pattern

```typescript
// Standard API route structure
import { createApiHandler } from "@/lib/api/apiUtils";
import { z } from "zod";

const querySchema = z.object({
  type: z.enum(["all", "upcoming", "recent"]).default("all"),
});

export const GET = createApiHandler({
  schema: querySchema,
  handler: async ({ type }) => {
    return { success: true, items: await fetchItems(type) };
  },
});
```

The wrapper handles Zod validation, response shaping, error mapping, and `BusinessLogicError` → HTTP status mapping. Handlers that return an object with a `success` field have it passed through verbatim; otherwise the data is wrapped in `createSuccessResponse(...)`.

### External data fetching

`FootballDataService` is the only external HTTP client. It's already rate-limited via `axios-rate-limit` and key-bound. Server-side fetches should wrap calls in `unstable_cache`:

```typescript
import { unstable_cache } from "next/cache";

const fetchStandings = unstable_cache(
  async () => new FootballDataService(axios.create()).getLaLigaStandings(),
  ["la-liga-standings"],
  { revalidate: 24 * 60 * 60, tags: ["la-liga-standings"] },
);
```

### Component patterns

#### Storybook for Component Development and Testing

- Storybook v10 with the Vitest addon (`@storybook/addon-vitest`).
- Create `.stories.tsx` files alongside each component.
- Run `npm run storybook` to start the dev server on port 6006.
- See ADR `docs/adr/009-storybook.md`.

#### Mobile-first styling

- Always start with mobile breakpoints and scale up.
- Use branded classes (`bg-betis-verde`, `bg-betis-verde-dark`, `bg-betis-oro`, `bg-scotland-navy`) — never generic Tailwind greens. See `docs/design-system.md` for the full palette.
- Gold accents (`text-betis-oro`) for highlights on dark backgrounds.
- Hamburger menu pattern lives in `src/components/layout/Header.tsx`.
