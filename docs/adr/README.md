# Architecture Decision Records (ADRs)

Concise documentation of key architectural decisions.

## Index

| #                                              | Decision                        | Status      |
| ---------------------------------------------- | ------------------------------- | ----------- |
| [001](./001-clerk-authentication.md)           | Clerk Authentication            | ✅ Accepted |
| [002](./002-football-api.md)                   | Football-Data.org API           | ✅ Accepted |
| [003](./003-supabase-database.md)              | Supabase Database               | ✅ Accepted |
| [004](./004-feature-flags.md)                  | Feature Flags (env vars)        | ✅ Accepted |
| [005](./005-classification-cache.md)           | Classification Cache            | ✅ Accepted |
| [006](./006-clerk-supabase-jwt.md)             | Clerk-Supabase JWT              | ✅ Accepted |
| [007](./007-trivia-system.md)                  | Trivia Game System              | ✅ Accepted |
| [008](./008-testing-strategy.md)               | Testing (Vitest + Playwright)   | ✅ Accepted |
| [009](./009-storybook.md)                      | Storybook                       | ✅ Accepted |
| [010](./010-error-monitoring.md)               | Sentry Error Monitoring         | ✅ Accepted |
| [011](./011-admin-notifications.md)            | Admin Notifications (OneSignal) | ✅ Accepted |
| [012](./012-libraries.md)                      | Core Libraries                  | ✅ Accepted |
| [013](./013-security.md)                       | Security Architecture           | ✅ Accepted |
| [014](./014-database-migrations.md)            | Database Migration Naming       | ✅ Accepted |

## Creating New ADRs

1. Use the next sequential number (015, 016, etc.)
2. Follow naming: `NNN-kebab-case-title.md`
3. Keep it concise - focus on **decision** and **why**
4. Update this index

## Template

```markdown
# ADR-NNN: Title

## Status

Accepted | Proposed | Deprecated

## Decision

What we decided and why (1-2 sentences).

## Implementation

Key code patterns or configuration.

## References

Links to related docs or ADRs.
```
