# Roadmap

**Last updated:** 2026-05-18

This document tracks planned and possible future work for the Peña Bética Escocesa site after the 2026-05 static-site simplification. The site is now a public static page with two football-data.org-backed API routes; the database, authentication, admin panel, trivia, RSVP/contact surface, feature-flag abstraction, Storybook, MSW, and Sentry observability have all been removed.

## Recently completed

The static-site simplification ran over twelve PRs in May 2026:

- **#427** — switched `/partidos` to the live football-data.org API, removed the admin panel and background sync.
- **#428** — removed the Supabase dependency, SQL folder, and remaining DB helpers.
- **#429** — removed Clerk authentication, middleware, sign-in/sign-up pages.
- **#430** — removed the feature-flag abstraction and inlined the nav.
- **#431** — removed obsolete ADRs and rewrote the docs to match reality.
- **#432** — deleted orphan components, stripped dead logger helpers, trimmed unused CSP origins, dropped the mock-heavy `matches.test.ts`.
- **#434** — dropped the orphan FacebookSDK and trimmed Facebook CSP origins.
- **#435** — trimmed dead `BusinessLogicError` and unexported `apiUtils` helpers.
- **#436** — stripped dead logger helpers (`auth`, `apiRequest`, `business`, `child`).
- **#437 / #438** — removed Storybook entirely; cleanup sweep removed dead schemas, MSW, stale `.vscode/` and `vitest.config.ts` env vars, refreshed PWA shortcuts.
- **#439** — removed Sentry error monitoring (never fully wired in Vercel) and the `@sentry/nextjs` dependency.

End-state: a public static page with twelve routes (ten static + two dynamic API routes), one external dependency (football-data.org), no DB / auth / admin / feature flags / Storybook / MSW / Sentry.

## Near-term: maintenance

Dependabot is configured for weekly grouped minor/patch updates with `next`, `react`, `react-dom` excluded for isolated review. Major framework versions (Next.js, React, TypeScript) and the icon library (`lucide-react`) are all on current latest; revisit when the next major drops.

## Future: enhancement ideas

### Performance

- **Bundle Size Analysis**: Use the existing `@next/bundle-analyzer` to audit JavaScript bundles.
- **Image Optimization**: Audit Next.js Image usage across the site.

### Developer experience

- **CI/CD Enhancement**: Add Lighthouse / accessibility audits to the pipeline.

### Infrastructure

- **E2E Test Coverage**: Expand Playwright tests for the public routes (currently smoke-only).

## What's working well (preserve)

- `createApiHandler` pattern for API routes (validation + response shaping)
- ADR practice (a slim set of records documenting load-bearing decisions)
- CI/CD pipeline with required vs. non-blocking checks
- Branded design tokens (`bg-betis-verde`, `bg-betis-oro`, `bg-scotland-navy`)
- Repo Butler health monitoring
