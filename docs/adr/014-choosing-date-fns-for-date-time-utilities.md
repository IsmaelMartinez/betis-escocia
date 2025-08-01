# ADR-014: Choosing date-fns for Date/Time Utilities

## Status
- **Status**: Proposed
- **Date**: 2025-08-01
- **Authors**: Gemini CLI
- **Decision Maker**: User

## Context
Date and time manipulation, formatting, and display are common requirements across the application (e.g., displaying match dates, RSVP creation times, user registration dates). Initially, some date formatting was done using native JavaScript `Date` methods directly. To ensure consistency, maintainability, and efficient bundle size, a dedicated date utility library is needed.

## Decision
To adopt **date-fns** as the primary library for all date and time manipulation, formatting, and utility functions within the application.

## Consequences
### Positive
- **Modular & Lightweight**: `date-fns` allows importing only the functions needed, leading to smaller bundle sizes compared to monolithic libraries.
- **Immutable Dates**: All `date-fns` functions return new date instances, promoting immutability and preventing unintended side effects.
- **Comprehensive Functionality**: Provides a rich set of functions for parsing, formatting, validating, and manipulating dates.
- **Localization Support**: Easy integration with various locales for displaying dates and times in a user-friendly format.
- **TypeScript Support**: Fully typed, offering excellent developer experience and compile-time safety.
- **Consistency**: Centralizes date logic, ensuring consistent date handling across the application.

### Negative
- **New Dependency**: Introduces a new third-party dependency to the project.
- **Migration Effort**: Requires refactoring existing inline date logic to use `date-fns` functions.

### Neutral
- Replaces native `Date` methods and custom utility functions, standardizing date operations.

## Alternatives Considered

### Option 1: Moment.js
- **Pros**: Very popular, extensive documentation, large community.
- **Cons**: Large bundle size (monolithic), mutable date objects (can lead to bugs), and is in maintenance mode (not actively developing new features).
- **Reason for rejection**: Not suitable for modern React/Next.js applications due to bundle size and immutability concerns.

### Option 2: Luxon
- **Pros**: Modern API, immutable dates, good timezone support.
- **Cons**: Larger bundle size than `date-fns`, and its API can be less intuitive for simple operations compared to `date-fns`'s functional approach.
- **Reason for rejection**: While a strong contender, `date-fns`'s modularity and smaller footprint are more aligned with the project's performance goals.

### Option 3: Native JavaScript Date Object
- **Pros**: No additional dependencies.
- **Cons**: Limited functionality, often requires writing custom utility functions, prone to bugs (mutable), and inconsistent behavior across environments for complex operations.
- **Reason for rejection**: Lacks the comprehensive features, consistency, and developer experience provided by a dedicated library.

## Implementation Notes
- Install `date-fns` via npm.
- Refactor `src/lib/dateUtils.ts` to exclusively use `date-fns` functions.
- Update all components and services that handle dates to import and use functions from `src/lib/dateUtils.ts`.

## References
- date-fns GitHub: [https://github.com/date-fns/date-fns](https://github.com/date-fns/date-fns)
- date-fns Documentation: [https://date-fns.org/](https://date-fns.org/)

## Review
- **Next review date**: 2026-02-01
- **Review criteria**: Performance metrics related to date operations, ease of development, and any emerging requirements for advanced date/time features.
