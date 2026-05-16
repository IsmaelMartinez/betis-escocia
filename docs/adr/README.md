# Architecture Decision Records (ADRs)

Concise documentation of key architectural decisions.

## Index

| #                                | Decision                      | Status                             |
| -------------------------------- | ----------------------------- | ---------------------------------- |
| [002](./002-football-api.md)     | Football-Data.org API         | ✅ Accepted                        |
| [004](./004-feature-flags.md)    | Feature Flags (env vars)      | ⚠️ Superseded (removed 2026-05-16) |
| [008](./008-testing-strategy.md) | Testing (Vitest + Playwright) | ✅ Accepted                        |
| [009](./009-storybook.md)        | Storybook                     | ✅ Accepted                        |
| [010](./010-error-monitoring.md) | Sentry Error Monitoring       | ✅ Accepted                        |
| [012](./012-libraries.md)        | Core Libraries                | ✅ Accepted                        |
| [013](./013-security.md)         | Security Architecture         | ✅ Accepted                        |

ADRs 001 (Clerk), 003 (Supabase), 005 (Classification Cache), 006 (Clerk-Supabase JWT), 007 (Trivia System), 011 (Admin Notifications), and 014 (Database Migrations) were removed during the 2026-05 static-site simplification. The site no longer has a database, authentication, or user-submitted content. Match and standings data come directly from football-data.org via `unstable_cache`.

## Creating New ADRs

1. Use the next sequential number (015, 016, etc.)
2. Follow naming: `NNN-kebab-case-title.md`
3. Keep it concise — focus on **decision** and **why**
4. Update this index

## Template

```markdown
# ADR-NNN: Title

## Status

Accepted | Proposed | Deprecated | Superseded

## Decision

What we decided and why (1-2 sentences).

## Implementation

Key code patterns or configuration.

## References

Links to related docs or ADRs.
```
