# ADR-013: Security Architecture

## Status
Accepted

## Decision
**Leverage Next.js built-in security** rather than custom implementations.

## Approach
- **CSP**: Configured in `next.config.js` (not custom code)
- **Rate limiting**: Next.js middleware
- **XSS protection**: React's built-in escaping
- **Validation**: Zod schemas in API routes

## What We Use
| Security Need | Solution |
|--------------|----------|
| CSP headers | `next.config.js` |
| Rate limiting | Middleware |
| XSS prevention | React default |
| Input validation | Zod schemas |
| Authentication | Clerk |
| Authorization | RLS + Clerk roles |

## What We Removed
- Custom HTML sanitization (React handles this)
- Custom CSP generation (moved to config)
- Custom CSRF tokens (not needed with SameSite cookies)
- In-memory rate limiting (moved to middleware)

## Result
- Reduced `security.ts` from 205 to ~50 lines
- Better security (framework-tested implementations)
- Easier maintenance

