# Security

The site is a public static page reading match data from football-data.org. There is no database, no authentication, no user submissions, and no admin surface, so most traditional web-app threats are out of scope.

What remains:

## Browser security headers

All headers are configured in `next.config.js` and applied to every route:

- **Content-Security-Policy** — locks down sources for scripts, styles, images, fonts, connections, frames. Sets `frame-ancestors 'none'` to prevent clickjacking.
- **X-Content-Type-Options**: `nosniff`
- **X-Frame-Options**: `DENY`
- **Referrer-Policy**: `strict-origin-when-cross-origin`
- **Permissions-Policy**: blocks `camera`, `microphone`, `geolocation`
- **Strict-Transport-Security** (HSTS): max-age one year, includeSubDomains, preload

Static assets (`/images/*`, `/_next/static/*`, `/fonts/*`) carry an immutable one-year cache header.

## Input validation

The only inputs accepted by the API are query parameters on `/api/matches` (which exposes `type` and `live`) and `/api/standings` (none). Both are validated by Zod schemas in `src/lib/api/apiUtils.ts` before reaching the route handler. Invalid input returns HTTP 400 with a Spanish error message; no input ever reaches a templated SQL query because there is no database.

## XSS

React's default escaping handles HTML rendering. No raw HTML injection helpers are used in product code.

## Third-party origins

The CSP allows these external origins (see `next.config.js`):

- `script-src`: `'self'`, `'unsafe-inline'`, `'unsafe-eval'`, plus Vercel Live / Analytics (`vercel.live`, `va.vercel-scripts.com`, `vercel.app`). The two `unsafe-*` allowances are required by Next.js bootstrap scripts and `next/dynamic`.
- `style-src`: `'self'` plus `'unsafe-inline'` (Tailwind 4 emits inline styles during SSR).
- `font-src`: `'self' data:` only — Google Fonts are self-hosted via `next/font/google` (Next.js downloads the font files at build time and serves them from `/_next/static/media/`).
- `connect-src`: `'self'`, `vercel.live`, `vercel.app`.
- `frame-src`: `'self'` and Vercel Live.
- `img-src` is `'self' data: https: blob:` to allow club crests served by football-data.org.

## Reporting a vulnerability

Open a private security advisory on the repo or email the maintainers directly rather than filing a public issue.
