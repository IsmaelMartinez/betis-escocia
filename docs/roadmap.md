# Roadmap

**Last updated:** 2026-05-16

This document tracks planned and possible future work for the Peña Bética Escocesa site after the 2026-05 static-site simplification (PRs #427–#432). The site is now a public static page with two football-data.org-backed API routes; the database, authentication, admin panel, trivia, RSVP/contact surface, and feature-flag abstraction have all been removed, and a final dead-code/CSP/orphan-component sweep landed in PR #432.

## Recently completed

The static-site simplification ran over six PRs in May 2026:

- **#427** — switched `/partidos` to the live football-data.org API, removed the admin panel and background sync.
- **#428** — removed the Supabase dependency, SQL folder, and remaining DB helpers.
- **#429** — removed Clerk authentication, middleware, sign-in/sign-up pages.
- **#430** — removed the feature-flag abstraction and inlined the nav.
- **#431** — removed obsolete ADRs and rewrote the docs to match reality.
- **#432** — deleted orphan components (FilteredMatches, PaginatedMatches, CompetitionFilter, FacebookPagePlugin, InstagramEmbed, SocialMediaDashboard), stripped `log.database` / `log.featureFlag`, dropped the mock-heavy `matches.test.ts`, trimmed unused CSP origins (reCAPTCHA, hCaptcha, Cloudflare Turnstile, Google Fonts since `next/font` self-hosts), fixed a stale `nextConfigPath` in `.storybook/main.ts`.

End-state: a public static page reading match data from football-data.org, with no DB, auth, admin, or feature-flag surface.

## Near-term: maintenance

### Major dependency upgrades

These packages are pinned below latest major versions and need explicit migration:

| Package        | Current | Latest | Risk   | Notes                                                                                                |
| -------------- | ------- | ------ | ------ | ---------------------------------------------------------------------------------------------------- |
| `lucide-react` | 0.577.0 | 1.x    | Medium | Icon library used across the site. v1 renamed/reorganized icons. Audit all imports before upgrading. |
| `typescript`   | 5.9.x   | 6.x    | Medium | TS 6 introduces new strictness rules. Run `tsc --noEmit` after upgrade to assess impact.             |
| `undici`       | 7.x     | 8.x    | Low    | Dev dependency only. May affect MSW/test mocking. Test suite is the main validation.                 |

### Audit

- A handful of low-severity advisories remain in `elliptic` deep inside `@storybook/nextjs`. No fix available without a Storybook major downgrade. Monitor for upstream resolution.
- Dependabot is configured for weekly grouped minor/patch updates with `next`, `react`, `react-dom` excluded for isolated review.

## Mid-term: optional follow-ups

Items that were considered during iteration 6 but deferred. None are blocking; pick up if they earn their keep.

- **Trim `apiUtils.ts` further.** With only two `auth-less` routes left, the wrapper still ships a `BusinessLogicError` class and a fall-through `createSuccessResponse` branch that is unreachable in practice. Inlining the validation into each route would lose ~100 lines but couple them; keeping the wrapper is cheap.
- **Re-evaluate Storybook.** With the site reduced to ~25 surviving components, the dev-dependency footprint (Storybook v10, addons, MSW Storybook addon) may not be worth the value. Removing it would drop several MB of `devDependencies` but lose the visual-isolation workflow.
- **Strip the remaining specialised logger helpers.** `log.auth`, `log.apiRequest`, `log.business`, `log.child` have no live callers. Left in place during iteration 6 because they're idiomatic logger surface; revisit if the logger gets touched for another reason.
- **Drop FacebookSDK and the Facebook CSP origins.** `src/components/social/FacebookSDK.tsx` still injects `connect.facebook.net/en_GB/sdk.js` with `xfbml=1`, but the only consumers (`FacebookPagePlugin`, embed-style components) were deleted in #432. The SDK now loads and does nothing. Removing the component lets `connect.facebook.net` and `www.facebook.com` come out of the CSP too.

## Future: enhancement ideas

### Performance

- **Bundle Size Analysis**: Use the existing `@next/bundle-analyzer` to audit JavaScript bundles.
- **Image Optimization**: Audit Next.js Image usage across the site.

### Developer experience

- **CI/CD Enhancement**: Add Lighthouse / accessibility audits to the pipeline.
- **Component Documentation**: Expand Storybook coverage for the surviving components (if Storybook stays — see mid-term).

### Infrastructure

- **E2E Test Coverage**: Expand Playwright tests for the public routes (currently smoke-only).
- **Monitoring**: Leverage Sentry more fully for performance monitoring and session replay if traffic justifies it.

## What's working well (preserve)

- `createApiHandler` pattern for API routes (validation + response shaping)
- ADR practice (a slim set of records documenting load-bearing decisions)
- CI/CD pipeline with required vs. non-blocking checks
- Branded design tokens (`bg-betis-verde`, `bg-betis-oro`, `bg-scotland-navy`)
- Repo Butler health monitoring
