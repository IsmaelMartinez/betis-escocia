# Deployment Workflow Instructions

## Description

Guidelines for CI/CD and deployment workflows. The project deploys to Vercel via its native Git integration; CI runs lint, type-check, the Vitest suite, build, and (non-blocking) Storybook build + coverage.

## Relevant files

- `.github/workflows/ci.yml` — required and non-blocking jobs.
- `next.config.js` — Next.js configuration, CSP, image patterns.
- `.env.local.example` — required and optional environment variables.

## Guidelines

### CI pipeline (GitHub Actions)

Two jobs run on every push and PR:

- **Tests (Required)** — `npm run lint`, `npm run type-check`, `npm test`, `npm run build`. This is the merge gate.
- **Quality Checks (Non-blocking)** — `npm run build-storybook`, `npm run test:coverage`, Codecov upload. Failures do not block merge.

Both jobs run on Node 22 and share a single secret: `FOOTBALL_DATA_API_KEY`.

### Vercel deployment

Vercel's GitHub integration deploys on every PR (preview) and on every merge to `main` (production). The CI pipeline does not handle deploys.

### Environment setup

Required:

- `FOOTBALL_DATA_API_KEY` — football-data.org API key.

Optional:

- `NEXT_PUBLIC_SITE_URL` — overrides the canonical site URL for the sitemap and Open Graph metadata.
- `NEXT_PUBLIC_SENTRY_DSN`, `SENTRY_DSN`, `NEXT_PUBLIC_SENTRY_RELEASE` — Sentry wiring.
- `GOOGLE_SITE_VERIFICATION` — Google Search Console verification.

See `docs/deployment-guide.md` for the full table including scope (client/server/build) and `docs/developer-guide.md` for local-dev specifics.
