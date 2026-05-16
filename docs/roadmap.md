# Roadmap

**Last updated:** 2026-05-16

This document tracks planned and possible future work for the Peña Bética Escocesa site after the 2026-05 static-site simplification (PRs #427–#430). The site is now a public static page with two football-data.org-backed API routes; the database, authentication, admin panel, trivia, RSVP/contact surface, and feature-flag abstraction have all been removed.

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

## Mid-term: leftover cleanup

A final iteration-6 sweep is planned to remove orphaned components and tighten the surviving surface:

- Delete dead match components in `src/components/match/` with no callers (`FilteredMatches`, `PaginatedMatches`, `CompetitionFilter`).
- Trim `src/lib/api/apiUtils.ts` further: with only two `auth-less` routes left, the wrapper is over-engineered.
- Consider whether `tests/integration/api/matches.test.ts` adds anything beyond `matches-comprehensive.test.ts`; if not, delete.
- Trim the CSP allowances in `next.config.js` for captcha / Facebook / hCaptcha origins now that no form on the site uses them.
- Re-evaluate Storybook: with the site reduced to a handful of public components, the dev dependency footprint may not be worth it.

## Future: enhancement ideas

### Performance

- **Bundle Size Analysis**: Use the existing `@next/bundle-analyzer` to audit JavaScript bundles.
- **Image Optimization**: Audit Next.js Image usage across the site.

### Developer experience

- **CI/CD Enhancement**: Add Lighthouse / accessibility audits to the pipeline.
- **Component Documentation**: Expand Storybook coverage for the surviving components.

### Infrastructure

- **E2E Test Coverage**: Expand Playwright tests for the public routes (currently smoke-only).
- **Monitoring**: Leverage Sentry more fully for performance monitoring and session replay if traffic justifies it.

## What's working well (preserve)

- `createApiHandler` pattern for API routes (validation + response shaping)
- ADR practice (a slim set of records documenting load-bearing decisions)
- CI/CD pipeline with required vs. non-blocking checks
- Branded design tokens (`bg-betis-verde`, `bg-betis-oro`, `bg-scotland-navy`)
- Repo Butler health monitoring
