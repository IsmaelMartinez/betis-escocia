# AI Coding Agent Instructions - Peña Bética Escocesa

## Project Overview

Real Betis supporters club website in Edinburgh with mobile-first design, serving match viewing parties at Polwarth Tavern. Built on Next.js 15 with TypeScript, featuring secure-by-default architecture using feature flags.

**📖 For comprehensive project details, architecture decisions, and implementation guides, see [CLAUDE.md](../CLAUDE.md) - it contains up-to-date information about technologies, patterns, and development practices.**

## Storybook 9 Integration Notes

This project uses Storybook v9.0.18. Key changes and considerations for AI assistants:

- **Package Consolidation**: Many Storybook packages (e.g., `@storybook/test`, `@storybook/addon-actions`, `@storybook/addon-controls`, `@storybook/addon-interactions`, `@storybook/addon-viewport`) are now consolidated into the main `storybook` package. When importing utilities like `within` and `userEvent` for `play` functions, use the `storybook/test` path (e.g., `import { within, userEvent } from 'storybook/test';`).
- **Vitest Addon**: `@storybook/addon-vitest` v9.1.1 is integrated for component testing and is the recommended approach over the older test runner. This enables the full Storybook Test experience.
- **Breaking Changes**: Be aware of other breaking changes in Storybook 9, such as Node.js 20+, Next.js 14+, and Vite 5+ requirements. Refer to the official Storybook migration guide for a complete list.

## Workflow Routing

This document serves as a router to direct you to the appropriate workflow-specific instructions. Please select the workflow that best matches your current task:

- **Development**: For code development patterns, architectural decisions, and integration patterns.
  - Reference: `@.github/instructions/development.instructions.md`
- **Testing**: For testing strategies, mocking patterns, and test coverage.
  - Reference: `@.github/instructions/testing.instructions.md`
- **Debugging**: For problem-solving, common pitfalls, and error resolution.
  - Reference: `@.github/instructions/debugging.instructions.md`
- **Deployment**: For CI/CD workflows, environment setup, and deployment patterns.
  - Reference: `@.github/instructions/deployment.instructions.md`
- **Maintenance**: For refactoring, dependency management, and code optimization.
  - Reference: `@.github/instructions/maintenance.instructions.md`

## Structured Feature Development Workflow

For systematic feature development with AI assistance, use the structured workflow instructions:

- **`.github/instructions/create-prd.instructions.md`** - Generate Product Requirements Documents (PRDs) with guided clarifying questions
- **`.github/instructions/generate-tasks.instructions.md`** - Create detailed task lists from PRDs with parent/sub-task breakdown
- **`.github/instructions/process-tasks-list.instructions.md`** - Implement tasks systematically with completion tracking and git integration

**Usage**: Reference these instructions (e.g., `@create-prd.instructions.md`) to follow the structured development process from idea to implementation.

## Documentation & Task Management Workflow

When completing PRDs and their associated tasks:

1. **Task Completion**: Mark all sub-tasks as `[x]` completed in the task list
2. **Quality Assurance**: Run full test suite, resolve all lint/type-check errors
3. **Code Commit**: Stage and commit changes with descriptive commit messages
4. **Documentation Updates**: Update relevant ADRs, README.md, and technical docs
5. **Feature Documentation**: Update feature flags, API docs, or user guides as needed
6. **Historical Organization**: Move completed work to historical documentation:
   - Move `tasks-prd-[feature].md` to `docs/historical/completed-tasks/`
   - Move `prd-[feature].md` to `docs/historical/implemented-features/`
   - Update `docs/historical/documentation-reorganization.md` with the move
   - **Learning**: Storybook v9 migration PRDs and tasks have been moved to these historical directories.
7. **README Updates**: Update main README.md if the feature affects user-facing functionality
8. **Merge Documentation**: Merge any research/comparison docs into existing documentation (e.g., feature flag comparisons into main feature flag docs)

This workflow ensures completed work is properly archived while keeping active planning documents in the `/tasks` folder.

## Critical File Locations

### Core Architecture

- `src/middleware.ts` - Route protection and security headers
- `src/lib/flagsmith/` - Feature flag management system
- `src/lib/supabase.ts` - Database client and type definitions
- `src/lib/adminApiProtection.ts` - API security utilities

### Testing Infrastructure

- `tests/setup.ts` - Vitest configuration and DOM testing setup
- `vitest.config.ts` - Vitest test runner configuration with path aliases and environment variables
- `playwright/global.setup.ts` - E2E auth setup with Clerk
- `e2e/*.spec.ts` - End-to-end test patterns

### Configuration

- `vitest.config.ts` - Vitest test runner configuration with v8 coverage provider
- `playwright.config.ts` - E2E test configuration with auth state

## Data Flow Patterns

### User Submission Flow

1. Anonymous form submission → Supabase
2. Webhook associates with user by email
3. User dashboard shows historical data via authenticated queries

### External API Integration

1. Check cache table first (`classification_cache`)
2. If stale, fetch from external API
3. Update cache with TTL
4. Return cached data with source indicator

## Additional Resources

### Comprehensive Project Documentation

- **[CLAUDE.md](../CLAUDE.md)**: Primary project reference with complete architecture, patterns, and development practices
- **Database schema**: See `sql/` directory for migrations  
- **Documentation**: Comprehensive ADRs in `docs/adr/`
- **Feature flags**: Complete guide in `docs/feature-flags.md`

### Model Context Protocol (MCP) Servers

This project utilizes Model Context Protocol (MCP) servers to extend the Gemini CLI's capabilities. Specifically, we are integrating with:

- **GitHub MCP Server**: For interacting with GitHub repositories and workflows.
- **Supabase MCP Server**: For direct database interactions and schema management.

## Quick Reference

- **Admin dashboard**: `/admin` (requires admin role)
- **API endpoints**: Follow RESTful patterns in `src/app/api/`
- **Feature flag implementation**: `src/lib/flagsmith/`
- **Trivia game**: Full implementation details in [CLAUDE.md](../CLAUDE.md)

---

**Note on User Profile Editing**: For user profile editing on the dashboard, leverage Clerk's built-in `<UserProfile />` component. This component provides a secure and comprehensive solution for users to manage their profile information, including first name and surname, without requiring custom UI development. Refer to Clerk's documentation for integration details: [https://clerk.com/docs/nextjs/components/user/user-profile](https://clerk.com/docs/nextjs/components/user/user-profile)