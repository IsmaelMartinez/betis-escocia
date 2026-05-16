# Deployment Guide

The site deploys to Vercel via its GitHub integration. Merging to `main` triggers a production deploy; opening a PR triggers a preview deploy.

## Required setup (Vercel)

1. Connect the GitHub repository to a Vercel project.
2. Set the production environment variables (see below).
3. Branch protection on `main` requires PRs and the `Tests (Required)` check before merge.

## Environment variables

Set these in the Vercel project's "Environment Variables" panel. Required ones must be present in the Production environment; Preview environments can copy them as needed.

| Variable                     | Scope           | Required? | Purpose                                  |
| ---------------------------- | --------------- | --------- | ---------------------------------------- |
| `FOOTBALL_DATA_API_KEY`      | Server          | Yes       | Auth token for football-data.org.        |
| `NEXT_PUBLIC_SITE_URL`       | Client + server | Optional  | Used by `sitemap.ts` and `metadataBase`. |
| `NEXT_PUBLIC_SENTRY_DSN`     | Client          | Optional  | Sentry client DSN.                       |
| `SENTRY_DSN`                 | Server          | Optional  | Sentry server DSN.                       |
| `NEXT_PUBLIC_SENTRY_RELEASE` | Client          | Optional  | Release tag for Sentry.                  |
| `GOOGLE_SITE_VERIFICATION`   | Server (build)  | Optional  | Google Search Console verification.      |
| `FOOTBALL_DATA_API_URL`      | Server          | Optional  | Override the football-data.org base URL. |
| `API_RATE_LIMIT_PER_MINUTE`  | Server          | Optional  | Tweak the axios-rate-limit cap.          |

Vercel's analytics/speed-insights are auto-enabled in production builds when the `VERCEL=1` env var is set (it is, on Vercel).

## CI

`.github/workflows/ci.yml` runs lint, type-check, the Vitest suite, and CodeQL on every PR. The `Tests (Required)` status is the merge gate. The Vercel preview deploy is non-blocking but useful for manual smoke checks.

## Caching

- `/api/matches` is wrapped with `unstable_cache` at 30 minutes (declared via `export const revalidate = 1800`).
- `/api/standings` is wrapped with `unstable_cache` at 24 hours.
- Both routes set `export const dynamic = "force-dynamic"` so they're treated as functions on Vercel; the cache lives at the `unstable_cache` layer rather than the route layer.
- Static assets (`/images/*`, `/_next/static/*`, `/fonts/*`) have one-year immutable cache headers via `next.config.js`.

## Domains and DNS

Vercel's GitHub integration handles the canonical Vercel URL and SSL. If a custom domain is added, set `NEXT_PUBLIC_SITE_URL` so the sitemap and Open Graph metadata pick it up.

## Rollback

Vercel keeps every deploy; promote any previous successful build to production from the Vercel dashboard. Cache may take a few minutes to invalidate on rollback because of the `unstable_cache` windows above.
