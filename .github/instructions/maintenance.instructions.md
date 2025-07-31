---
description: Guidelines and patterns for code maintenance, refactoring, and optimization.
globs:
  - "src/**/*.ts"
  - "src/**/*.tsx"
  - "src/**/*.js"
  - "src/**/*.jsx"
alwaysApply: false
---
# Maintenance Workflow Instructions

## Description
This document outlines the guidelines and patterns for code maintenance, refactoring, and optimization, including dependency management and documentation update procedures.

## Relevant Files
- `package.json`: Manages project dependencies.
- `docs/`: Contains various documentation files, including ADRs and development guidelines.
- `src/`: Contains the main application source code.

## Guidelines

### Dependency Management Guidelines
- **Latest Library Versions**: Always use the latest stable versions of libraries and frameworks to ensure security, performance, and access to newest features. Research current versions before implementation.
- **Verify library version compatibility**: Ensure that all libraries, especially those related to styling (e.g., Tailwind CSS, PostCSS) and build processes (e.g., Next.js, Storybook), are compatible with each other to avoid integration issues and unexpected behavior.

### Documentation Update Procedures
- **Documentation Updates**: Update relevant ADRs, README.md, and technical docs when making significant changes.
- **Feature Documentation**: Update feature flags, API docs, or user guides as needed.
- **Historical Organization**: Move completed work to historical documentation:
  - Move `tasks-prd-[feature].md` to `docs/historical/completed-tasks/`
  - Move `prd-[feature].md` to `docs/historical/implemented-features/`
  - Update `docs/historical/documentation-reorganization.md` with the move.
- **README Updates**: Update main README.md if the feature affects user-facing functionality.
- **Merge Documentation**: Merge any research/comparison docs into existing documentation (e.g., feature flag comparisons into main feature flag docs).

### Code Cleanup and Optimization Patterns

#### Performance Optimization
- **Image Optimization**: Ensure Next.js `Image` component is used effectively with proper `priority` and `sizes` for LCP.
- **Data Fetching**: Optimize Supabase queries, consider server-side caching strategies (Next.js `revalidate` options, SWR/React Query).
- **Bundle Size**: Analyze and reduce JavaScript bundle size.

#### Scalability
- **API Rate Limiting**: Implement rate limiting for public API routes to prevent abuse.
- **Database Indexing**: Ensure appropriate database indexes are in place for frequently queried columns in Supabase.

#### Robust Error Handling & Logging
- Review error boundaries (`src/app/error.tsx`, `src/app/global-error.tsx`, `src/components/ErrorBoundary.tsx`) and ensure comprehensive logging (e.g., Sentry, LogRocket) is in place for production.

#### Centralized State Management
- For more complex UIs, consider a state management library (e.g., Zustand, Jotai, React Context API) if not already implicitly handled by Next.js/React Query patterns.


