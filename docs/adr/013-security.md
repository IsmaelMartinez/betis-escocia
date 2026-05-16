# ADR-013: Security Architecture

## Status

Accepted

## Decision

Leverage Next.js built-in security rather than custom implementations.

## Approach

- CSP and security headers configured in `next.config.js`
- XSS prevention via React's built-in escaping
- Input validation via Zod schemas in API routes

## What We Use

| Security Need    | Solution                              |
| ---------------- | ------------------------------------- |
| CSP headers      | `next.config.js`                      |
| XSS prevention   | React default                         |
| Input validation | Zod schemas in `createApiHandler`     |

The site is a public static page reading match data from football-data.org. There is no database, no authentication, no user submissions, and no admin surface, so authorisation, RLS, CSRF, and rate-limiting are no longer in scope.

## What We Removed

- Custom HTML sanitization (React handles this)
- Custom CSP generation (moved to config)
- Custom CSRF tokens (no forms accept user-submitted data)
- In-memory rate limiting (no surfaces left to rate-limit)
- Auth/authorisation layer (Clerk + RLS removed in PR #428 / #429)
