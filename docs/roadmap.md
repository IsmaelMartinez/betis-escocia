# Roadmap

**Last updated:** 2026-04-13

This document tracks planned work for the Betis Escocia project, organized into near-term, mid-term, and future priorities.

---

## Near-Term: Dependency & Maintenance

### Major Dependency Upgrades

These packages are pinned below latest major versions and need explicit migration:

| Package        | Current | Latest | Risk   | Notes                                                                                                |
| -------------- | ------- | ------ | ------ | ---------------------------------------------------------------------------------------------------- |
| `lucide-react` | 0.577.0 | 1.x    | Medium | Icon library used across the site. v1 renamed/reorganized icons. Audit all imports before upgrading. |
| `typescript`   | 5.9.x   | 6.x    | Medium | TS 6 introduces new strictness rules. Run `tsc --noEmit` after upgrade to assess impact.             |
| `undici`       | 7.x     | 8.x    | Low    | Dev dependency only. May affect MSW/test mocking. Test suite is the main validation.                 |

### Security & Audit

- 6 remaining low-severity vulnerabilities, all in `elliptic` deep inside `@storybook/nextjs`. No fix available without a Storybook major downgrade. Monitor for upstream resolution.
- Dependabot is configured for weekly grouped minor/patch updates with `next`, `react`, `react-dom` excluded for isolated review.
- CI deploy job is commented out pending secret configuration (see former issue #329).

---

## Mid-Term: Architecture Simplification (In Progress)

From the [architecture simplification plan](architecture-simplification-plan.md). Phases 1-3 are complete. The RSVP/Contacto/Dashboard/GDPR surface area was removed in commit 90bbbf2 rather than refactored, so several originally-planned Phase 4-7 splits no longer apply.

### Phase 4: Split Large Components (In Progress)

Target components remaining after the RSVP/Contacto/Dashboard cleanup:

| Component                | Lines | Status     | Plan                                                                |
| ------------------------ | ----- | ---------- | ------------------------------------------------------------------- |
| `AllDatabaseMatches.tsx` | ~490  | Planned    | Extract filtering/pagination into custom hooks.                     |
| `Layout.tsx`             | ~460  | Planned    | Extract Header, Footer, UserMenu components.                        |
| `AdminPageClient.tsx`    | —     | Simplified | Trimmed to matches-only orchestration; RSVP/Contacto views removed. |

### Phase 5: Database Module Split

Split monolithic `supabase.ts` into domain modules. After the recent cleanup the file is smaller, but a split still improves locality:

```
src/lib/api/supabase/
├── client.ts           # Client initialization
├── matches.ts          # Match CRUD
├── trivia.ts           # Trivia operations
├── classification.ts   # Classification cache
└── index.ts            # Re-exports
```

### Phase 6: Test Infrastructure Cleanup

- Centralize mocks into `tests/mocks/` (Supabase, Clerk, navigation)
- Expand MSW handlers for all external APIs (currently only 1 endpoint)
- Reduce setup overhead in test files with heavy mocking

### Phase 7: Hook Extraction

Extract remaining business logic from components into reusable hooks:

- `useMatchFilters` / `usePagination` (from AllDatabaseMatches)
- `useTriviaGame` (from trivia/page)

---

## Mid-Term: Feature Enablement

Features currently behind feature flags, disabled by default:

| Feature        | Flag              | Status          | What's Needed                                                                                      |
| -------------- | ----------------- | --------------- | -------------------------------------------------------------------------------------------------- |
| **Clerk Auth** | `show-clerk-auth` | Built, disabled | User accounts and login. Enable when user-facing features (profiles, auth-gated flows) are needed. |
| **Debug Info** | `show-debug-info` | Built, disabled | Developer-only. Enable per-environment via env vars.                                               |

---

## Future: Enhancement Ideas

### Performance & Scalability

- **API Rate Limiting**: Implement for public routes (trivia, contact form)
- **Database Indexing**: Optimize for frequent queries
- **Bundle Size Analysis**: Use existing `@next/bundle-analyzer` to audit JavaScript bundles
- **Image Optimization**: Audit Next.js Image usage across the site

### User Engagement

- **Trivia Leaderboards**: Expand the trivia system with competitive rankings
- **Expanded Question Database**: More Betis & Scottish football trivia
- **Match Predictions**: Let users predict match scores
- **Social Features**: Enhanced photo sharing via Galeria

### Developer Experience

- **Supabase Type Generation**: Use `supabase gen types` for automatic schema sync
- **CI/CD Enhancement**: Add performance audits, security scans to pipeline
- **Component Documentation**: Expand Storybook coverage for all components
- **Internationalization**: Multi-language support if the community grows

### Infrastructure

- **CI Deploy Job**: Re-enable Vercel deployment via CI once secrets are configured
- **E2E Test Coverage**: Expand Playwright tests for critical user flows
- **Monitoring**: Leverage Sentry more fully for performance monitoring and session replay

---

## What's Working Well (Preserve)

These parts of the architecture are solid and should not be refactored:

- `createApiHandler` pattern for API routes
- Feature flag system (environment variable-based)
- Structured logger with environment awareness
- ADR practice (14 records documenting key decisions)
- CI/CD pipeline with required vs. non-blocking checks
- Security posture: CSP headers, RLS, Clerk admin enforcement
- Design system with branded color classes
- Repo Butler health monitoring

---

## How to Use This Document

- Check this roadmap before starting new work to avoid duplication
- Update status fields as work progresses
- Move completed items to the bottom or remove them
- Add new ideas to the appropriate section with enough context for any contributor
