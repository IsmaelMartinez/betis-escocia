# Testing Guide

The site uses Vitest for unit and integration tests, and Playwright for end-to-end tests. Storybook covers component-level visual checks.

## Running tests

```bash
npm test                 # Full Vitest run
npm run test:watch       # Watch mode
npm run test:coverage    # v8 coverage with 80% thresholds
npm run test:e2e         # Playwright (headless)
npm run test:e2e:headed  # Playwright with browser UI
npm run storybook        # Storybook dev server
```

## Layout

```
tests/
├── unit/                # Vitest unit tests for components and pure functions
├── integration/         # Vitest integration tests for API routes
├── helpers/             # Test utilities
├── msw/                 # MSW handlers for external API mocking
└── setup.ts             # jsdom + jest-dom matchers

e2e/                     # Playwright specs (public routes only)
```

## Patterns

### Component tests

Use `@testing-library/react` plus the `jest-dom` matchers wired up in `tests/setup.ts`. Mock heavy children with `vi.mock(...)`:

```typescript
vi.mock("@/components/match/MatchCard", () => ({
  default: ({ opponent }: { opponent: string }) => (
    <div data-testid="match-card">{opponent}</div>
  ),
}));
```

### Mocking `fetch` for client components

`AllMatches` and `UpcomingMatchesWidget` fetch directly from `/api/matches`. Stub `fetch` per test rather than reaching for MSW:

```typescript
beforeEach(() => {
  vi.stubGlobal("fetch", vi.fn());
});
afterEach(() => {
  vi.unstubAllGlobals();
});

(fetch as ReturnType<typeof vi.fn>).mockResolvedValue({
  ok: true,
  json: async () => ({ matches: sampleMatches }),
});
```

### API route tests

Test the route handler directly through the `createApiHandler` wrapper. The wrapper validates query params via Zod and shapes responses; assert against the parsed JSON.

```typescript
import { GET } from "@/app/api/matches/route";

const request = new NextRequest(
  "http://localhost:3000/api/matches?type=all&live=true",
);
const response = await GET(request);
const data = await response.json();

expect(response.status).toBe(200);
expect(data.matches).toBeInstanceOf(Array);
```

`FootballDataService` should be mocked so tests don't hit the live API; see `tests/integration/api/matches-comprehensive.test.ts` for a working example.

## E2E

All Playwright specs target public routes (`/`, `/partidos`, `/clasificacion`, etc.). There is no auth setup; `playwright.config.ts` only requires `FOOTBALL_DATA_API_KEY` in CI for the matches/standings pages to render real data. Tests can run against the bundled `npm run dev` server (configured automatically) or any environment via `PLAYWRIGHT_BASE_URL`.

Use the `fixtures.ts` helpers in `e2e/` for shared selectors and navigation utilities.

## Storybook

Storybook v10 with the Vitest addon. Stories live next to components as `*.stories.tsx`. The MSW addon is available for stories that need a mocked API response. Run `npm run storybook` on port 6006.

## Coverage

`vitest.config.ts` enforces 80% thresholds for lines, functions, branches, and statements. CI fails if coverage drops below those numbers.
