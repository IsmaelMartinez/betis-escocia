# Gemini CLI Project Summary - Betis

This document provides a quick overview of the Betis project's key technologies and patterns, intended for the Gemini CLI agent's future reference.

## Core Technologies:
- **Frontend:** Next.js (React)
- **Styling:** Tailwind CSS (implied by `postcss.config.mjs` and `globals.css`)
- **Database:** Supabase (PostgreSQL backend, used for matches, RSVPs, contact submissions).
  - **Client:** `@supabase/supabase-js` (`src/lib/supabase.ts`)
- **Authentication:** Clerk (implied by `.clerk/` directory and historical docs like `docs/historical/clerk-evaluation-results.md`)
- **Feature Flags:** Flagsmith (implied by `docs/adr/004-flagsmith-feature-flags.md` and `src/lib/flagsmith/`)
- **Testing:** Playwright (E2E tests in `e2e/`, config in `playwright.config.ts`), Jest/React Testing Library (implied by `tests/unit/` and `tests/canary/` structure, common with Next.js/React)
- **Linting/Formatting:** ESLint (`eslint.config.mjs`)

## Key Data Handling Patterns:
- **Supabase Integration:** `src/lib/supabase.ts` contains core CRUD operations and type definitions for interacting with Supabase tables (e.g., `matches`, `rsvps`, `contact_submissions`).
- **JSON File Storage:** Some data, like `camiseta-votes.json` and `camiseta-voting.json`, is stored directly in JSON files within the `data/` directory. This is used for simpler, less dynamic data or voting mechanisms.
- **User Linking:** Supabase tables (e.g., `rsvps`, `contact_submissions`) include a `user_id` field, indicating that user-specific data is linked via authentication. Functions like `linkExistingSubmissionsToUser` exist.

## Project Structure Highlights:
- `src/app/`: Next.js App Router structure for pages and API routes.
- `src/components/`: Reusable React components.
- `src/lib/`: Utility functions, API clients (Supabase, Flagsmith), and authentication helpers.
- `data/`: JSON files for specific data sets.
- `docs/`: Extensive documentation, including Architecture Decision Records (ADRs) and historical research.
- `e2e/`: Playwright end-to-end tests.
- `tests/`: Unit and canary tests.

## Potential Areas for Improvement/Expansion (as a Principal Software Developer would think):

1.  **Centralized State Management:** For more complex UIs, consider a state management library (e.g., Zustand, Jotai, React Context API) if not already implicitly handled by Next.js/React Query patterns.
2.  **Robust Error Handling & Logging:** Review error boundaries (`src/app/error.tsx`, `src/app/global-error.tsx`, `src/components/ErrorBoundary.tsx`) and ensure comprehensive logging (e.g., Sentry, LogRocket) is in place for production.
3.  **Performance Optimization:**
    *   **Image Optimization:** Ensure Next.js `Image` component is used effectively with proper `priority` and `sizes` for LCP.
    *   **Data Fetching:** Optimize Supabase queries, consider server-side caching strategies (Next.js `revalidate` options, SWR/React Query).
    *   **Bundle Size:** Analyze and reduce JavaScript bundle size.
4.  **Scalability:**
    *   **API Rate Limiting:** Implement rate limiting for public API routes to prevent abuse.
    *   **Database Indexing:** Ensure appropriate database indexes are in place for frequently queried columns in Supabase.
5.  **Developer Experience (DX):**
    *   **Code Generation:** Explore tools like `supabase gen types` for generating TypeScript types from the database schema to improve type safety and reduce manual work.
    *   **Storybook:** Consider Storybook for isolated component development and documentation.
6.  **Testing Coverage:** While E2E and some unit tests exist, ensure critical business logic and UI interactions have sufficient test coverage.
7.  **CI/CD Enhancements:** Review `github/workflows/` for opportunities to add more automated checks (e.g., performance audits, security scans).
8.  **User Engagement Features:** As discussed, implementing game mechanics (trivia, prediction games) with a point system could significantly boost engagement. This would require:
    *   A `points` column in a user profile table (or a dedicated `user_points` table).
    *   New Supabase tables for game-specific data (e.g., `predictions`, `quiz_questions`, `quiz_answers`).
    *   Backend logic to calculate and award points.
    *   Frontend components for game interaction and displaying scores/leaderboards.
9.  **Internationalization (i18n):** If the audience is global, consider implementing i18n for content.

## Pointers for Future Interactions:
- **Always check `src/lib/supabase.ts`** for database interaction patterns.
- **Look for existing UI components in `src/components/`** before creating new ones.
- **Consult `docs/adr/`** for architectural decisions.
- **For authentication, assume Clerk** unless otherwise specified.
- **For feature flags, assume Flagsmith.**
- **When proposing new features, consider how they integrate with Supabase and Clerk.**
