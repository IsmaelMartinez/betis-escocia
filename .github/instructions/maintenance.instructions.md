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
- **README Updates**: Update main README.md if the feature affects user-facing functionality.
- **Merge Documentation**: Fold one-off research / comparison notes into the existing canonical doc rather than leaving the comparison sitting alongside it.

### Code Cleanup and Optimization Patterns

#### Performance Optimization

- **Image Optimization**: Ensure Next.js `Image` component is used effectively with proper `priority` and `sizes` for LCP.
- **Data Fetching**: Tune the cache windows if the freshness/cost trade-off changes — `/api/matches` uses route-segment `revalidate = 1800` (30 min); `/api/standings` wraps the fetch in `unstable_cache` (24 h, tag `"la-liga-standings"`).
- **Bundle Size**: Analyze and reduce JavaScript bundle size via `@next/bundle-analyzer`.

#### Scalability

- **football-data.org rate limit**: `axios-rate-limit` caps at 10 req/min via `API_RATE_LIMIT_PER_MINUTE`. The `unstable_cache` layer keeps real outbound traffic far below this.

#### Robust Error Handling & Logging

- Review error boundaries (`src/app/error.tsx`, `src/app/global-error.tsx`, `src/components/ErrorBoundary.tsx`) and ensure comprehensive logging (e.g., Sentry, LogRocket) is in place for production.

#### Centralized State Management

- For more complex UIs, consider a state management library (e.g., Zustand, Jotai, React Context API) if not already implicitly handled by Next.js/React Query patterns.
