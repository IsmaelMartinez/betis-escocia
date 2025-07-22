# Gemini CLI Project Summary - Betis

This document provides a quick overview of the Betis project's key technologies and patterns, intended for the Gemini CLI agent's future reference.

## Core Technologies:
- **Frontend:** Next.js (React)
- **Styling:** Tailwind CSS (implied by `postcss.config.mjs` and `globals.css`)
- **Database:** Supabase (PostgreSQL backend, used for matches, RSVPs, contact submissions).
  - **Client:** `@supabase/supabase-js` (`src/lib/supabase.ts`)
- **Authentication:** Clerk (implied by `.clerk/` directory and historical docs like `docs/historical/clerk-evaluation-results.md`)
- **Feature Flags:** Flagsmith (implied by `docs/adr/004-flagsmith-feature-flags.md` and `src/lib/flags/`)
- **Testing:** Playwright (E2E tests in `e2e/`, config in `playwright.config.ts`), Jest/React Testing Library (implied by `tests/unit/` and `tests/canary/` structure, common with Next.js/React)
- **Linting/Formatting:** ESLint (`eslint.config.mjs`)

## Key Data Handling Patterns:
- **Supabase Integration:** `src/lib/supabase.ts` contains core CRUD operations and type definitions for interacting with Supabase tables (e.g., `matches`, `rsvps`, `contact_submissions`).
  - **`contact_submissions` Table Schema:** This table now includes `phone` (VARCHAR(20)), `subject` (VARCHAR(255) NOT NULL), `type` (VARCHAR(50)), and `status` (VARCHAR(20) DEFAULT 'new') columns.
- **JSON File Storage (Prototype):** Some data, like `camiseta-votes.json` and `camiseta-voting.json`, is currently stored directly in JSON files within the `data/` directory. This is a prototype solution for simpler, less dynamic data or voting mechanisms and is intended to be migrated to the Supabase database in the future.
- **User Linking & Clerk Webhooks:** Supabase tables (e.g., `rsvps`, `contact_submissions`) include a `user_id` field, indicating that user-specific data is linked via authentication. While ADR 006 details the direct JWT integration for Row Level Security (RLS) and real-time authentication, Clerk webhooks (`src/app/api/webhooks/clerk/route.ts`) serve a complementary purpose. They are used for: 
    - **Historical Data Linking:** Associating pre-authenticated or anonymous submissions (e.g., via email) with a Clerk user's `user_id` when they sign up or log in.
    - **Data Synchronization:** Keeping Supabase user data in sync with Clerk (e.g., handling user deletions).
    Functions like `linkExistingSubmissionsToUser` and `unlinkUserSubmissions` facilitate this synchronization.

## Project Structure Highlights:
- `src/app/`: Next.js App Router structure for pages and API routes.
- `src/components/`: Reusable React components.
- `src/lib/`: Utility functions, API clients (Supabase, Flagsmith), and authentication helpers.
- `data/`: JSON files for specific data sets (including prototype voting data).
- `docs/`: Extensive documentation, including:
    - **Architecture Decision Records (ADRs):** Located in `docs/adr/`, these documents capture significant architectural decisions and their rationale (e.g., `001-clerk-authentication.md`, `003-supabase-database.md`, `004-flagsmith-feature-flags.md`, `007-clerk-webhooks-for-data-sync.md`).
    - **API Documentation:** `docs/api/` contains details on API solutions and considerations.
    - **Development Guidelines:** `docs/development/` provides information on documentation guidelines and onboarding.
    - **Historical Research:** `docs/historical/` contains past research and evaluations, particularly around authentication providers.
    - **Security Documentation:** `docs/security/` outlines security practices and summaries.
    - Other standalone READMEs and markdown files covering various aspects of the project.
- `.github/instructions/`: This directory contains `.mdc` (Markdown Command) files that define specific AI-assisted development workflows, particularly for feature development. These files guide the AI agent through processes like PRD creation, task list generation, and iterative task implementation.
    - **`README.md`**: Provides an overview of the AI Dev Tasks workflow, emphasizing structured development, step-by-step verification, and managing complexity.
    - **`copilot-instructions.md`**: Offers general project overview, technical stack details, coding guidelines, and special considerations for AI assistants like Copilot (and by extension, Gemini CLI).
    - **`create-prd.instructions.md`**: Defines the process for generating Product Requirements Documents (PRDs), including clarifying questions and PRD structure.
    - **`generate-tasks.instructions.md`**: Outlines the steps for creating detailed task lists from PRDs, including parent and sub-tasks, and identifying relevant files.
    - **`process-tasks-list.instructions.md`**: Provides guidelines for implementing tasks one by one, marking completion, running tests, and committing changes.
- `e2e/`: Playwright end-to-end tests.
- `tests/`: Unit and canary tests.

## Potential Areas for Improvement/Expansion (as a Principal Software Developer would think):

This section outlines areas for future development and optimization. It's crucial to regularly review these points to assess progress and re-prioritize based on current project needs and completed work.

1.  **Centralized State Management:** For more complex UIs, consider a state management library (e.g., Zustand, Jotai, React Context API) if not already implicitly handled by Next.js/React Query patterns.
    *   **Review Note:** This remains a relevant consideration as UI complexity grows. No explicit solution has been implemented to deprecate this.
2.  **Robust Error Handling & Logging:** Review error boundaries (`src/app/error.tsx`, `src/app/global-error.tsx`, `src/components/ErrorBoundary.tsx`) and ensure comprehensive logging (e.g., Sentry, LogRocket) is in place for production.
    *   **Review Note:** While error boundaries exist, comprehensive production logging and monitoring (e.g., integration with a service like Sentry) is an ongoing effort and remains a high priority.
3.  **Performance Optimization:**
    *   **Image Optimization:** Ensure Next.js `Image` component is used effectively with proper `priority` and `sizes` for LCP.
    *   **Data Fetching:** Optimize Supabase queries, consider server-side caching strategies (Next.js `revalidate` options, SWR/React Query).
    *   **Bundle Size:** Analyze and reduce JavaScript bundle size.
    *   **Review Note:** Performance is an evergreen concern. Specific optimizations might have been made, but continuous monitoring and improvement are always necessary. This remains a high priority.
4.  **Scalability:**
    *   **API Rate Limiting:** Implement rate limiting for public API routes to prevent abuse.
    *   **Database Indexing:** Ensure appropriate database indexes are in place for frequently queried columns in Supabase.
    *   **Review Note:** Rate limiting is critical for public APIs and may not be fully implemented. Database indexing is an ongoing task as new queries and data patterns emerge. Both remain high priority.
5.  **Developer Experience (DX):**
    *   **Code Generation:** Explore tools like `supabase gen types` for generating TypeScript types from the database schema to improve type safety and reduce manual work.
    *   **Storybook:** Consider Storybook for isolated component development and documentation.
    *   **Review Note:** `supabase gen types` is a valuable tool that should be integrated into the workflow if not already. Storybook is a significant DX improvement but might be a lower priority compared to core features or critical performance/security.
6.  **Testing Coverage:** While E2E and some unit tests exist, ensure critical business logic and UI interactions have sufficient test coverage.
    *   **Review Note:** Testing coverage is an ongoing process. This remains a high priority to ensure code quality and prevent regressions.
7.  **CI/CD Enhancements:** Review `github/workflows/` for opportunities to add more automated checks (e.g., performance audits, security scans).
    *   **Review Note:** CI/CD pipelines can always be improved. Adding more automated checks is a continuous effort and remains a high priority for release quality.
8.  **User Engagement Features:** As discussed, implementing game mechanics (trivia, prediction games) with a point system could significantly boost engagement. This would require:
    *   A `points` column in a user profile table (or a dedicated `user_points` table).
    *   New Supabase tables for game-specific data (e.g., `predictions`, `quiz_questions`, `quiz_answers`).
    *   Backend logic to calculate and award points.
    *   Frontend components for game interaction and displaying scores/leaderboards.
    *   **Review Note:** This is a feature-driven item. Its priority depends on product roadmap and user engagement goals. It's a potential expansion, not necessarily a current "improvement" of existing systems.
9.  **Internationalization (i18n):** If the audience is global, consider implementing i18n for content.
    *   **Review Note:** This is a strategic decision based on target audience. If the project is currently focused on a single language, this might be a lower priority.

### Plan for Reviewing Improvement Areas:

Regularly revisit this section (e.g., quarterly or before major releases) to:
1.  **Assess Progress:** For each item, determine if work has been done, if it's complete, or if it's still in progress.
2.  **Re-prioritize:** Adjust the priority of each item based on current project goals, new insights, and resource availability.
3.  **Update Notes:** Add specific notes under each item detailing current status, recent efforts, or changes in priority.
4.  **Remove Completed Items:** Once an area is deemed sufficiently improved or completed, it can be removed from this list or moved to a "Completed Improvements" section for historical context.

## How to Integrate New Features:
When integrating new features, consider the following:
- **Feature Flagging with Flagsmith:** For new features, especially those under development or requiring A/B testing, utilize Flagsmith. Integrate feature flags early in the development cycle to enable gradual rollouts, A/B testing, and easy toggling of features without code deployments. Refer to `docs/adr/004-flagsmith-feature-flags.md` and `src/lib/flags/` for implementation details.
- **Supabase for Data Persistence:** If the feature requires data storage, design the database schema and implement CRUD operations using Supabase. Ensure appropriate Row-Level Security (RLS) policies are defined.
- **Clerk for Authentication:** If the feature involves user-specific data or restricted access, leverage Clerk for authentication and user management. Use `getAuth(request)` in API routes to retrieve user IDs.
- **Existing Components and Utilities:** Before creating new components or utility functions, check `src/components/` and `src/lib/` for existing reusable assets.
- **Documentation:** Document new features, architectural decisions, and any significant changes in the `docs/` directory, preferably as an ADR if it's an architectural decision.

## Common Pitfalls and Solutions:
- **Asynchronous Feature Flag Rendering:** When conditionally rendering UI elements based on asynchronous feature flag checks (e.g., `isFeatureEnabledAsync`), ensure the asynchronous call is handled within a `useEffect` hook. Store the feature flag status in a component's state and use that state for conditional rendering. Directly calling asynchronous functions in the render method will lead to incorrect behavior as the Promise object itself is truthy, not its resolved value.
- **Supabase Row-Level Security (RLS) Policies:** Be mindful of RLS policies, especially when adding new columns or tables. An overly broad "deny all" policy can override more specific "allow" policies. Ensure explicit `INSERT`, `SELECT`, and `UPDATE` policies are in place for relevant roles (e.g., `anon`, `authenticated`) to prevent unexpected `42501` errors. **Crucially, after making RLS changes, you MUST refresh the Supabase schema cache by restarting your Supabase project (e.g., via the Supabase dashboard or `docker compose restart` for local setups).**
- **Clerk Authentication in Next.js API Routes:** When retrieving user information in Next.js API routes, use `getAuth(request)` from `@clerk/nextjs/server` to reliably get the `userId` for authenticated users, even if the route is publicly accessible. This ensures the `userId` is correctly populated in database submissions.

## Pointers for Future Interactions:
- **Always check `src/lib/supabase.ts`** for database interaction patterns.
- **Look for existing UI components in `src/components/`** before creating new ones.
- **Consult `docs/adr/`** for architectural decisions.
- **For authentication, assume Clerk** unless otherwise specified.
- **For feature flags, assume Flagsmith.**
- **When proposing new features, consider how they integrate with Supabase, Clerk, and Flagsmith.