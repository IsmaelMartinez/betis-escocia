# Task Completion Status - Comprehensive Testing Implementation

## ✅ TASK 1.8 - COMPLETED
**Create tests for `/api/admin/contact-submissions` API**

### Completed Implementation:
**✅ `/api/admin/contact-submissions` Tests** - FULLY IMPLEMENTED
- **File**: `tests/integration/api/admin/contact-submissions.test.ts`
- **Test Count**: 15 comprehensive test scenarios
- **Coverage Areas**: 
  - Authentication and Authorization (3 tests)
  - Request Validation (4 tests)
  - Database Operations (3 tests)
  - Error Handling (3 tests)
  - Token and Authentication Integration (1 test)
  - Status Tracking (1 test)
- **Status**: All tests passing ✅

### Achievement Summary:
- **Admin API Test Suites**: 3 of 4 completed (roles, users, contact-submissions)
- **Total Passing Tests**: 47 admin tests (all passing)
- **Coverage Improvement**: Comprehensive testing patterns established
- **Methodology**: Demonstrated complete testing framework for admin APIs

---

## ✅ TASK 1.9 - COMPLETED
**Create tests for `/api/admin/sync-matches` API**

### Completed Implementation:
**✅ `/api/admin/sync-matches` Tests** - FULLY IMPLEMENTED
- **File**: `tests/integration/api/admin/sync-matches.test.ts`
- **Test Count**: 10 comprehensive test scenarios
- **Coverage Areas**:
  - Authentication and Authorization (3 tests)
  - Rate Limiting (1 test)
  - Successful Match Synchronization (1 test)
  - Error Handling (3 tests)
  - Edge Cases (2 tests)
- **Status**: All tests passing ✅

### Achievement Summary:
- **Admin API Test Suites**: 4 of 4 completed (roles, users, contact-submissions, sync-matches)
- **Total Passing Tests**: 57 admin tests (all passing)
- **Coverage Improvement**: Comprehensive testing patterns established for match synchronization
- **Methodology**: Demonstrated complete testing framework for admin APIs

---

## Operational Guidelines
- **Verify library version compatibility** - ensure that all libraries, especially those related to styling (e.g., Tailwind CSS, PostCSS) and build processes (e.g., Next.js, Storybook), are compatible with each other to avoid integration issues and unexpected behavior.

## Core Technologies:
- **Frontend:** Next.js 15 (React), Storybook v9.0.18
- **Styling:** Tailwind CSS v4 (configured in `postcss.config.mjs` and `globals.css`)
- **Storybook:** Component development and documentation (`.storybook/` directory, `src/components/**/*.stories.tsx`, `docs/storybook-guide.md`).
  - **Version**: Storybook v9.0.18 with Next.js-Vite integration
  - **Key Features**: Storybook Test (now part of core), Component testing, Accessibility testing, Test coverage, 48% lighter bundle, Tags-based story organization.
  - **Package Consolidation**: Many packages, including `@storybook/test`, `@storybook/addon-actions`, `@storybook/addon-controls`, `@storybook/addon-interactions`, and `@storybook/addon-viewport`, are now consolidated into the main `storybook` package. Imports should reflect this (e.g., `import { within, userEvent } from 'storybook/test';`).
  - **Essential Addons**: Controls, viewport, backgrounds, actions, and other essential features are now built into core (no separate packages needed).
  - **Additional Addons**: Docs, A11y, Vitest integration for component testing (recommended over test-runner).
  - **Performance**: 48% lighter bundle sizes and faster startup times compared to v8
- **Database:** Supabase (PostgreSQL backend, used for matches, RSVPs, contact submissions).
  - **Client:** `@supabase/supabase-js` (`src/lib/supabase.ts`)
- **Authentication:** Clerk (configured in `.clerk/` directory and documented in `docs/historical/clerk-evaluation-results.md`)
- **Feature Flags:** Flagsmith (documented in `docs/adr/004-flagsmith-feature-flags.md` and implemented in `src/lib/flagsmith/`).
  - **Storybook Integration:** Flagsmith is mocked in Storybook using `src/lib/flagsmith/__mocks__/index.ts` and aliased via Vite configuration in `.storybook/vite.config.ts` to allow for controlled testing of feature-flag-dependent components.
- **Testing:** 
  - **E2E**: Playwright (tests in `e2e/`, config in `playwright.config.ts`) with Clerk authentication setup
  - **Unit/Integration**: Jest with React Testing Library (`tests/unit/` and `tests/integration/`)
  - **Component Testing**: Vitest integration within Storybook v9
  - **CI/CD Pipeline**: GitHub Actions with comprehensive quality gates: ESLint, TypeScript checking, Storybook build validation, Jest tests, Playwright E2E tests, and Lighthouse accessibility audits
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
    - **Architecture Decision Records (ADRs:** Located in `docs/adr/`, these documents capture significant architectural decisions and their rationale (e.g., `001-clerk-authentication.md`, `003-supabase-database.md`, `004-flagsmith-feature-flags.md`, `007-clerk-webhooks-for-data-sync.md`).
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

## Model Context Protocol (MCP) Servers

The Gemini CLI can be extended using Model Context Protocol (MCP) servers, which expose tools and resources to the CLI. This allows for interaction with external systems, custom scripts, and specialized workflows beyond the CLI's built-in features.

### Integration with Gemini CLI

MCP servers are configured in the `.gemini/settings.json` file. The CLI discovers and executes tools exposed by these servers, handling connection management, tool filtering, and conflict resolution.

### Recommended MCP Servers for this Project

Given the project's technology stack (Next.js/TypeScript, Supabase), the following types of MCP servers are recommended for extending functionality:

-   **Official Supabase MCP Server:**
    -   **Use Case:** Directly interact with your Supabase database, manage schema, and execute SQL queries securely from the CLI.
    -   **Configuration:** Requires installing the Supabase CLI and configuring the official Supabase MCP server. Refer to the Supabase documentation for detailed setup instructions (e.g., `supabase.com/blog/mcp-server`).

-   **Node.js/TypeScript MCP Server (for Clerk and Flagsmith):**
    -   **Use Case:** Ideal for extending functionality using existing Node.js/TypeScript utilities, interacting with Clerk for user management, or Flagsmith for feature flag control.
    -   **Example:** A custom server that wraps Clerk's or Flagsmith's SDKs to expose their functionalities as tools to the Gemini CLI.

-   **HTTP-based MCP Server:**
    -   **Use Case:** A general solution for integrating with any external service that exposes an HTTP API. This is common for microservices, third-party APIs, or custom backend services.
    -   **Example:** A server that acts as a proxy or wrapper for external APIs (e.g., a football API for match data, a payment gateway), exposing their functionalities as tools to the Gemini CLI.

These recommendations provide flexibility to extend the Gemini CLI's capabilities in ways that align with the project's existing technologies and potential future needs.

    *   **Review Note:** This feature is fully implemented and tested. The trivia pointing system has also been implemented. Future enhancements could include user progress tracking, leaderboards, and expanded question database.

### Setting up MCP Servers for Gemini CLI

To enable the Gemini CLI to interact with Supabase, Clerk, and Flagsmith, you need to configure and run their respective MCP servers. This involves setting up environment variables, configuring `.gemini/settings.json`, and potentially creating VSCode tasks for easy management.

#### 1. Environment Variables

Ensure the following environment variables are set in your shell or `.env` file where you run the Gemini CLI:

-   **Clerk MCP Server:**
    -   `CLERK_SECRET_KEY`: Your Clerk Secret Key (e.g., `sk_test_...`). This is crucial for the Clerk MCP server to authenticate with Clerk's backend.

-   **Flagsmith MCP Server:**
    -   `FLAGSMITH_ENVIRONMENT_ID`: Your Flagsmith Environment ID (e.g., `YOUR_FLAGSMITH_ENVIRONMENT_ID`). This allows the Flagsmith MCP server to fetch feature flags from your Flagsmith project.

-   **Supabase MCP Server:**
    -   `SUPABASE_ACCESS_TOKEN`: A Supabase Personal Access Token (PAT) with appropriate permissions. This is used by the official Supabase MCP server to authenticate with your Supabase account.
    -   `SUPABASE_PROJECT_REF`: Your Supabase Project Reference ID. This scopes the Supabase MCP server to a specific project.

#### 2. Running the MCP Servers

##### a. Custom MCP Servers (Clerk and Flagsmith)

These servers are implemented within this project under the `mcp-servers/` directory. You need to compile and run them:

1.  **Compile:**
    ```bash
    cd mcp-servers/clerk-mcp && npm install && npx tsc
    cd mcp-servers/flagsmith-mcp && npm install && npx tsc
    ```
2.  **Run in Background:**
    ```bash
    npm run start-mcp-servers
    ```
    *Note: This command runs both custom MCP servers in the background. You can use `fg` to bring them to the foreground or `kill <PID>` to stop them.* The Clerk MCP server runs on port `3001` and the Flagsmith MCP server on port `3002` by default.

##### b. Official Supabase MCP Server

This server is run directly via `npx` by the Gemini CLI. You do not need to clone or run it separately. The configuration in `.gemini/settings.json` will handle its execution.

#### 3. `.gemini/settings.json` Configuration

Create or update the `.gemini/settings.json` file in your project's root directory (`.gemini/settings.json`) with the following content:

```json
{
  "mcpServers": {
    "clerkMcp": {
      "httpUrl": "http://localhost:3001/mcp",
      "timeout": 30000,
      "trust": false
    },
    "flagsmithMcp": {
      "httpUrl": "http://localhost:3002/mcp",
      "timeout": 30000,
      "trust": false
    },
    "supabaseMcp": {
      "command": "npx",
      "args": [
        "-y",
        "@supabase/mcp-server-supabase@latest",
        "--read-only",
        "--project-ref=${SUPABASE_PROJECT_REF}"
      ],
      "env": {
        "SUPABASE_ACCESS_TOKEN": "${SUPABASE_ACCESS_TOKEN}"
      },
      "timeout": 30000,
      "trust": false
    }
  }
}
```

*Note: The `${SUPABASE_PROJECT_REF}` and `${SUPABASE_ACCESS_TOKEN}` placeholders will be replaced by the Gemini CLI with the actual environment variable values.* You can also hardcode these values directly if preferred, but using environment variables is recommended for security.

#### 4. VSCode Configuration (Optional)

To easily manage the custom MCP servers within VSCode, you can add tasks to your `.vscode/tasks.json` file. This allows you to start and stop them directly from VSCode's terminal.

```json
{
  "version": "2.0.0",
  "tasks": [
    {
      "label": "Start Clerk MCP Server",
      "type": "shell",
      "command": "cd mcp-servers/clerk-mcp && npm start",
      "isBackground": true,
      "problemMatcher": [],
      "group": "build",
      "options": {
        "cwd": "${workspaceFolder}"
      }
    },
    {
      "label": "Start Flagsmith MCP Server",
      "type": "shell",
      "command": "cd mcp-servers/flagsmith-mcp && npm start",
      "isBackground": true,
      "problemMatcher": [],
      "group": "build",
      "options": {
        "cwd": "${workspaceFolder}"
      }
    }
  ]
}
```

To run these tasks, open the Command Palette (`Cmd+Shift+P` or `Ctrl+Shift+P`), type `Tasks: Run Task`, and select the desired server. You can also configure `tasks.json` to automatically terminate background tasks when VSCode closes.

With these steps, your Gemini CLI will be fully configured to leverage the Clerk, Flagsmith, and Supabase MCP servers, enhancing your development workflow.

## Potential Areas for Improvement/Expansion (as a Principal Software Developer would think):

This section outlines areas for future development and optimization. It's crucial to regularly review these points to assess progress and re-prioritize based on current project needs and completed work.

-   **Strategic Task Deferral:** When encountering unexpectedly complex or time-consuming tasks, consider deferring them to focus on more manageable tasks to maintain momentum and avoid getting stuck. This allows for a more agile approach to development.

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
    *   **Storybook v9 Migration**: **COMPLETED** - Successfully migrated to Storybook v9.0.18 with performance improvements, package consolidation, and enhanced testing integration. See ADR-010 for details. Related PRDs and tasks moved to `docs/historical/completed-tasks` and `docs/historical/implemented-features`.
    *   **Review Note**: Storybook v9 migration has been completed, providing better performance and development experience. Focus can now shift to expanding component documentation and visual testing capabilities.
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
    *   **Review Note:** This feature is fully implemented and tested. The trivia pointing system has also been implemented. Future enhancements could include user progress tracking, leaderboards, and expanded question database.
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

## Testing Implementation Patterns

### Jest Configuration and ES Module Handling
The project uses Jest with TypeScript and faces challenges with ES modules from dependencies like Clerk. Key learnings:

#### ES Module Import Issues
- **Problem**: Jest encounters `SyntaxError: Unexpected token 'export'` when importing Clerk packages
- **Root Cause**: Clerk's `@clerk/backend` package uses ES modules that Jest cannot parse by default
- **Solution**: Mock Clerk modules at the top of test files before any imports:
```typescript
// Mock Clerk before any other imports
jest.mock('@clerk/nextjs/server', () => ({
  getAuth: jest.fn(() => ({
    userId: null,
    getToken: jest.fn(() => Promise.resolve(null)),
  })),
}));
```
- **Alternative Attempted**: Adding `transformIgnorePatterns` to Jest config was not sufficient

#### Supabase Query Builder Mocking
Properly mocking Supabase's chainable query builder requires understanding the actual API structure:
```typescript
// Correct pattern for mocking Supabase
jest.mock('@/lib/supabase', () => {
  const mockFrom = jest.fn();
  return {
    supabase: {
      from: mockFrom,
    },
  };
});
```

### API Route Testing Strategy
For Next.js API routes with complex dependencies:

#### Mock Structure Hierarchy
1. **External Services First**: Mock Clerk, Supabase, email services before imports
2. **Security Functions**: Mock all security utilities to avoid conflicts
3. **Test-Specific Overrides**: Use `jest.spyOn()` for test-specific behavior

#### Supabase Query Chain Mocking
The Supabase client uses method chaining that must be properly mocked:
```typescript
(supabase.from as jest.Mock).mockReturnValue({
  select: jest.fn(() => ({
    order: jest.fn(() => ({
      eq: jest.fn(() => Promise.resolve({ data: [], error: null }))
    }))
  }))
});
```

#### Security Function Mocking Best Practices
- **Avoid `jest.requireActual()`**: This can cause conflicts with test-specific spies
- **Default to Valid**: Mock security functions to return valid by default, override in specific tests
- **Complete Mock Objects**: Include all required properties (e.g., rate limit responses need `allowed`, `remaining`, `resetTime`)

### Comprehensive Testing Implementation (Current Coverage: 13.26%)

#### Successfully Tested API Routes
- **Trivia API** (`/api/trivia`): 100% coverage with authentication, scoring, and error scenarios
- **RSVP API** (`/api/rsvp`): 79.54% coverage across GET/POST/DELETE methods with 16 test scenarios
- **Contact API** (`/api/contact`): 63.15% coverage with form submission, validation, and admin notifications
- **Admin Roles API** (`/api/admin/roles`): 86.88% coverage for role assignment and permission validation
- **Admin Users API** (`/api/admin/users`): 88% coverage with serverRoleUtils abstraction layer
- **Clerk Webhook API** (`/api/webhooks/clerk`): 100% coverage for user sync and data consistency

#### Critical Testing Patterns Learned

##### 1. ES Module Import Issues with Clerk
**Problem**: Jest fails with Clerk's ES modules during import
**Solution**: Always mock Clerk BEFORE any imports:
```typescript
// Mock Clerk before any other imports
jest.mock("@clerk/nextjs/server", () => ({
  getAuth: jest.fn(() => ({
    userId: null,
    getToken: jest.fn(() => Promise.resolve(null)),
  })),
}));
```

##### 2. Supabase Query Builder Mocking
**Problem**: Mocks must match actual API chain structure
**Solution**: Mock the full chain pattern:
```typescript
jest.mock("@/lib/supabase", () => {
  const mockFrom = jest.fn();
  return { supabase: { from: mockFrom } };
});

// In tests, mock the full chain:
(supabase.from as jest.Mock).mockReturnValue({
  select: jest.fn(() => ({
    eq: jest.fn(() => Promise.resolve({ data: [], error: null })),
  })),
});
```

##### 3. Security Function Mocking Best Practices
**Problem**: `jest.requireActual()` causes conflicts with test spies
**Solution**: Use simple mocks without requireActual:
```typescript
jest.mock("@/lib/security", () => ({
  __esModule: true,
  sanitizeObject: jest.fn((obj) => obj),
  validateEmail: jest.fn(() => ({ isValid: true })),
  checkRateLimit: jest.fn(() => ({
    allowed: true,
    remaining: 2,
    resetTime: Date.now() + 100000,
  })),
}));
```

##### 4. Complete Mock Objects
**Critical**: Rate limit mocks need ALL required properties (`allowed`, `remaining`, `resetTime`)

##### 5. NextResponse Mocking Pattern
**Established Pattern**: Consistent NextResponse mocking across all API tests:
```typescript
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({ data, ...options })),
  },
}));
```

#### Test Coverage Patterns
For comprehensive API route testing, cover:

##### GET Endpoints
- Successful data retrieval
- Query parameter handling
- Database error scenarios
- Empty data sets

##### POST Endpoints
- Successful submission
- Validation failures (each validation rule)
- Rate limiting
- Database insertion errors
- Update vs. create scenarios

##### DELETE Endpoints
- Successful deletion by ID
- Successful deletion by identifier (email, etc.)
- Not found scenarios
- Database deletion errors

##### Webhook Endpoints (Clerk Pattern)
- Valid webhook processing (user.created, user.updated, user.deleted)
- Header validation and signature verification
- Data linking/unlinking operations
- Missing data edge cases
- Database error handling
- Invalid webhook types

#### API Route Test Coverage by Endpoint
Each endpoint should test: success cases, validation failures, rate limiting, database errors, edge cases (not found, empty data)

#### Systematic Test Implementation Workflow
1. **Mock Setup**: Establish all mocks before imports (Clerk, Supabase, security, NextResponse)
2. **Test Structure**: Organize by HTTP method, then by scenario (success/error cases)
3. **Comprehensive Coverage**: Test authentication, validation, database operations, and error handling
4. **Consistent Patterns**: Apply learned mocking patterns across all API tests
5. **Verification**: Run `npm test -- --coverage` to verify actual coverage percentages

## Common Pitfalls and Solutions:
- **`react/no-unescaped-entities` in Storybook `Page.tsx`:** The `react/no-unescaped-entities` error in `src/stories/Page.tsx` (e.g., on lines 39:13 and 39:18) can be resolved by escaping double quotes within text content using `&quot;` (e.g., changing `"args"` to `&quot;args&quot;`). This is a lower concern as it primarily affects Storybook build/development time.
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