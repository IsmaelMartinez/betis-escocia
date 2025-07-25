# Gemini CLI Project Summary - Betis

This document provides a quick overview of the Betis project's key technologies and patterns, intended for the Gemini CLI agent's future reference.

## Core Technologies:
- **Frontend:** Next.js (React), Storybook
- **Styling:** Tailwind CSS (implied by `postcss.config.mjs` and `globals.css`)
- **Storybook:** Component development and documentation (`.storybook/` directory, `src/components/**/*.stories.tsx`, `docs/storybook-guide.md`).
- **Database:** Supabase (PostgreSQL backend, used for matches, RSVPs, contact submissions).
  - **Client:** `@supabase/supabase-js` (`src/lib/supabase.ts`)
- **Authentication:** Clerk (implied by `.clerk/` directory and historical docs like `docs/historical/clerk-evaluation-results.md`)
- **Feature Flags:** Flagsmith (implied by `docs/adr/004-flagsmith-feature-flags.md` and implemented in `src/lib/flagsmith/`).
  - **Storybook Integration:** Flagsmith is mocked in Storybook using `src/lib/flagsmith/__mocks__/index.ts` and aliased via Vite configuration in `.storybook/vite.config.ts` to allow for controlled testing of feature-flag-dependent components.
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

## Trivia Game Implementation

The Betis & Scotland Trivia Challenge is a key engagement feature designed to encourage daily user interaction. Here are the architectural decisions and implementation details:

### Game Design Decisions
- **3-Question Format**: Reduced from initial 8-question concept to maintain user engagement and prevent fatigue
- **15-Second Timer**: Per-question time limit to maintain pace and excitement
- **Daily Gameplay Model**: "Once per day" messaging encourages regular engagement without strict enforcement
- **Immediate Feedback**: Users see correct answers immediately after each question for educational value
- **Percentage Scoring**: Simple scoring system showing percentage of correct answers

### Database Architecture
- **trivia_questions Table**: Stores questions with UUID primary keys and metadata
- **trivia_answers Table**: Stores multiple choice answers linked to questions via foreign keys
- **Data Population**: Manual SQL scripts ensure proper UUID relationships between questions and answers

### Frontend Implementation
- **Main Game Page**: `src/app/trivia/page.tsx` - Controls game flow and state management
- **Timer Component**: `src/components/GameTimer.tsx` - Reusable countdown timer with reset functionality
- **Results Section**: Integrated results display with percentage scoring and completion messaging
- **Feature Flag Protection**: Controlled by `show-trivia-game` flag for safe rollouts

### API Design
- **RESTful Endpoints**: Clean separation between question fetching and answer retrieval
- **Error Handling**: Comprehensive error responses for database and network issues
- **Type Safety**: Full TypeScript integration with Supabase generated types

### Technical Considerations
- **Performance**: Client-side state management for responsive gameplay
- **Accessibility**: Proper keyboard navigation and screen reader support
- **Mobile-First**: Optimized for smartphone usage (primary user base)
- **Real-Time Updates**: Feature flags allow instant enable/disable without deployments

### Future Enhancement Opportunities
- User progress tracking and history
- Leaderboards and social features
- Expanded question database with categories
- Advanced scoring mechanisms (streak bonuses, time-based scoring)
- Multi-language support for international users

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
8.  **User Engagement Features:** A "Betis & Scotland Trivia Challenge" game has been implemented to boost engagement. This involved:
    *   **Database Design:** New Supabase tables (`trivia_questions`, `trivia_answers`) for game-specific data with proper UUID relationships.
    *   **Game Mechanics:** 3-question trivia format with 15-second timer per question, immediate feedback, and percentage scoring.
    *   **Daily Gameplay Model:** "Once per day" messaging encourages regular engagement without enforcing strict limitations.
    *   **Frontend Components:** Game timer (`GameTimer.tsx`), trivia page (`src/app/trivia/page.tsx`) with results section.
    *   **Feature Flag Integration:** Controlled by `show-trivia-game` flag for safe rollout and testing.
    *   **API Endpoints:** RESTful endpoints for fetching questions and answers with proper error handling.
    *   **Review Note:** This feature is fully implemented and tested. Future enhancements could include user progress tracking, leaderboards, and expanded question database.
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
- **Latest Library Versions**: Always use the latest stable versions of libraries and frameworks to ensure security, performance, and access to newest features. Research current versions before implementation.
- **Feature Flagging with Flagsmith:** For new features, especially those under development or requiring A/B testing, utilize Flagsmith. Integrate feature flags early in the development cycle to enable gradual rollouts, A/B testing, and easy toggling of features without code deployments. Refer to `docs/adr/004-flagsmith-feature-flags.md` and `src/lib/flags/` for implementation details.
- **Supabase for Data Persistence:** If the feature requires data storage, design the database schema and implement CRUD operations using Supabase. Ensure appropriate Row-Level Security (RLS) policies are defined.
- **Clerk for Authentication:** If the feature involves user-specific data or restricted access, leverage Clerk for authentication and user management. Use `getAuth(request)` in API routes to retrieve user IDs.
- **Existing Components and Utilities:** Before creating new components or utility functions, check `src/components/` and `src/lib/` for existing reusable assets.
- **Documentation:** Document new features, architectural decisions, and any significant changes in the `docs/` directory, preferably as an ADR if it's an architectural decision.

## Common Pitfalls and Solutions:
- **Asynchronous Feature Flag Rendering:** When conditionally rendering UI elements based on asynchronous feature flag checks (e.g., `isFeatureEnabledAsync`), ensure the asynchronous call is handled within a `useEffect` hook. Store the feature flag status in a component's state and use that state for conditional rendering. Directly calling asynchronous functions in the render method will lead to incorrect behavior as the Promise object itself is truthy, not its resolved value.
- **Supabase Row-Level Security (RLS) Policies:** Be mindful of RLS policies, especially when adding new columns or tables. An overly broad "deny all" policy can override more specific "allow" policies. Ensure explicit `INSERT`, `SELECT`, and `UPDATE` policies are in place for relevant roles (e.g., `anon`, `authenticated`) to prevent unexpected `42501` errors. **Crucially, after making RLS changes, you MUST refresh the Supabase schema cache by restarting your Supabase project (e.g., via the Supabase dashboard or `docker compose restart` for local setups).**
- **Clerk Authentication in Next.js API Routes:** When retrieving user information in Next.js API routes, use `getAuth(request)` from `@clerk/nextjs/server` to reliably get the `userId` for authenticated users, even if the route is publicly accessible. This ensures the `userId` is correctly populated in database submissions.
- **Trivia Game Database Relationships:** When populating trivia answers, ensure proper UUID relationships between `trivia_questions` and `trivia_answers` tables. Empty answer arrays typically indicate missing or incorrect foreign key relationships. Always verify question UUIDs exist before inserting corresponding answers.
- **Timer Component Type Safety:** When using reusable timer components like `GameTimer`, ensure proper TypeScript types for props. Use specific types like `number` instead of `any` for properties like `resetTrigger` to maintain type safety and prevent runtime errors.

## Pointers for Future Interactions:
- **Always check `src/lib/supabase.ts`** for database interaction patterns.
- **Look for existing UI components in `src/components/`** before creating new ones.
- **Consult `docs/adr/`** for architectural decisions.
- **For authentication, assume Clerk** unless otherwise specified.
- **For feature flags, assume Flagsmith.**
- **When proposing new features, consider how they integrate with Supabase, Clerk, and Flagsmith.