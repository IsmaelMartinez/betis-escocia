# Architecture Decision Records (ADRs)

This directory contains Architecture Decision Records documenting key architectural decisions made throughout the project lifecycle.

## Index

### Authentication & Authorization
- [001 - Clerk Authentication](./001-clerk-authentication.md) - Selected Clerk for user authentication
- [006 - Clerk Supabase JWT Integration](./006-clerk-supabase-jwt-integration.md) - JWT token integration between Clerk and Supabase
- [007 - Clerk Webhooks for Data Sync](./007-clerk-webhooks-for-data-sync.md) - User data synchronization strategy
- [009 - Clerk E2E Testing](./009-clerk-e2e-testing.md) - End-to-end testing with authentication

### Database & APIs  
- [002 - Football API](./002-football-api.md) - Football-Data.org API selection and implementation
- [003 - Supabase Database](./003-supabase-database.md) - Database architecture and Row Level Security
- [005 - Optimizing Classification Cache Storage](./005-optimizing-classification-cache-storage.md) - Caching strategy for external API data

### Feature Management & UI
- [004 - Flagsmith Feature Flags](./004-flagsmith-feature-flags.md) - Feature flag system implementation
- [008 - Trivia Game Implementation](./008-trivia-game-implementation.md) - Game mechanics and database design
- [013 - Choosing Sonner for Toast Notifications](./013-choosing-sonner-for-toast-notifications.md) - Toast notification library selection
- [016 - Admin Push Notifications](./016-admin-push-notifications.md) - Real-time notification system

### Development Tools & Workflow
- [010 - Storybook v9 Migration](./010-storybook-v9-migration.md) - Component development and testing platform
- [015 - Jest to Vitest Migration](./015-jest-to-vitest-migration.md) - Test runner migration for better performance
- [014 - Choosing date-fns for Date/Time Utilities](./014-choosing-date-fns-for-date-time-utilities.md) - Date handling library selection

### Monitoring & Optimization
- [011 - Sentry Error Monitoring](./011-sentry-error-monitoring.md) - Error tracking and monitoring setup
- [012 - Email Service Provider Analysis](./012-email-service-provider-analysis.md) - Email service evaluation
- [017 - Simplify Date Utilities](./017-simplify-date-utilities.md) - Date utility consolidation
- [018 - Simplify Security Layer](./018-simplify-security-layer.md) - Security architecture simplification

## ADR Template

New ADRs should follow the template provided in [template.md](./template.md).

## Numbering Convention

ADRs are numbered sequentially starting from 001. When creating a new ADR:
1. Use the next available number (currently 019)
2. Follow the naming pattern: `{number}-{kebab-case-title}.md`
3. Update this index with the new ADR

## Status Legend

- ✅ **Accepted** - Decision implemented and active
- 🚧 **Proposed** - Under consideration  
- ❌ **Rejected** - Decision not adopted
- 📝 **Draft** - Work in progress
- 🔄 **Superseded** - Replaced by newer decision