# AI Coding Agent Instructions — Peña Bética Escocesa

## Project Overview

Real Betis supporters club website in Edinburgh, mobile-first, serving match viewing parties at Polwarth Tavern. Built on Next.js 16 with TypeScript. The site is a public static page: no database, no authentication, no admin surface. Match and standings data come directly from football-data.org via `unstable_cache`.

**For comprehensive project details, architecture decisions, and implementation guides, see [CLAUDE.md](../CLAUDE.md).**

## Storybook v10 notes

This project uses Storybook v10. Things to know when generating story code:

- Many Storybook packages (`@storybook/test`, `@storybook/addon-actions`, `@storybook/addon-controls`, `@storybook/addon-interactions`, `@storybook/addon-viewport`) are consolidated into the main `storybook` package. Use `import { within, userEvent } from 'storybook/test';` for `play` functions.
- `@storybook/addon-vitest` is the recommended test integration over the older runner.
- Storybook 9+ requires Node 20+, Next.js 14+, and Vite 5+.

## Workflow Routing

- **Development**: `.github/instructions/development.instructions.md`
- **Testing**: `.github/instructions/testing.instructions.md`
- **Debugging**: `.github/instructions/debugging.instructions.md`
- **Deployment**: `.github/instructions/deployment.instructions.md`
- **Maintenance**: `.github/instructions/maintenance.instructions.md`

## Structured Feature Development Workflow

- `.github/instructions/create-prd.instructions.md` — generate PRDs with guided clarifying questions
- `.github/instructions/generate-tasks.instructions.md` — create detailed task lists from PRDs
- `.github/instructions/process-tasks-list.instructions.md` — implement tasks systematically with completion tracking and git integration

## Critical file locations

- `src/app/` — App Router pages and API routes (`/api/matches`, `/api/standings`)
- `src/services/footballDataService.ts` — axios-rate-limited football-data.org client
- `src/lib/api/apiUtils.ts` — `createApiHandler` (Zod validation + response shaping)
- `src/lib/constants/team.ts` — `REAL_BETIS_TEAM_ID = 90`
- `src/data/` — static TypeScript constants (`leyendas`, `efemerides`)
- `next.config.js` — CSP, security headers, image patterns, package import optimisation

## Testing infrastructure

- `tests/setup.ts` — Vitest configuration and DOM testing setup
- `vitest.config.ts` — Vitest test runner configuration with v8 coverage provider
- `e2e/*.spec.ts` — Playwright E2E tests, all targeting public routes
- `playwright.config.ts` — E2E test configuration (no auth setup required)

## Data flow

`/api/matches` and `/api/standings` are the only data-fetching surfaces. Both wrap `FootballDataService` with `unstable_cache` and return JSON. Client components (`AllMatches`, `UpcomingMatchesWidget`, `ClassificationWidget`) fetch directly from these routes; server components like `/clasificacion` and `/partidos/[matchId]` call `FootballDataService` server-side.

## Additional resources

- **[CLAUDE.md](../CLAUDE.md)** — primary project reference with architecture and patterns
- **ADRs** — `docs/adr/` for the surviving architecture decisions

## Quick Reference

- **Public pages**: `/`, `/partidos`, `/partidos/[matchId]`, `/clasificacion`, `/nosotros`, `/unete`, `/jugadores-historicos`, `/joaquin`
- **API endpoints**: `/api/matches`, `/api/standings`
- **API wrapper**: `src/lib/api/apiUtils.ts` (`createApiHandler`)
- **External data source**: football-data.org via `src/services/footballDataService.ts`
