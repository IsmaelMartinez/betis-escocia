## Relevant Files

-   `sql/create_trivia_tables.sql` - SQL script to create `trivia_questions` and `trivia_answers` tables.
-   `sql/populate_trivia_data.sql` - SQL script for populating initial trivia questions and answers.
-   `src/lib/supabase.ts` - Contains Supabase client, type definitions for `TriviaQuestion` and `TriviaAnswer`, and CRUD operations for these tables.
-   `src/app/api/trivia/route.ts` - Next.js API route to fetch trivia questions for the game.
-   `src/app/trivia/page.tsx` - Main page component for the trivia game, handling game logic and UI.
-   `src/components/GameTimer.tsx` - React component for the question timer.
-   `src/lib/flagsmith/types.ts` - Defines Flagsmith feature names and default values.
-   `tests/unit/trivia.test.tsx` - Unit tests for `GameTimer` and potentially other trivia-related components.
-   `e2e/trivia.spec.ts` - Playwright E2E tests for the trivia game flow.
-   `docs/adr/008-trivia-game-implementation.md` - Architecture Decision Record for the trivia game.
-   `docs/external_trivia_apis.md` - Documentation for external trivia APIs.

### Notes

-   Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
-   Use `npm test [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Tasks

-   [x] 1.0 Database & API Setup
    -   [x] 1.1 Define Supabase Schema for Questions
        -   [x] 1.1.1 Create `trivia_questions` table with `id`, `question_text`, `category`, `difficulty`, `created_at`.
        -   [x] 1.1.2 Create `trivia_answers` table with `id`, `question_id` (FK), `answer_text`, `is_correct`, `created_at`.
        -   [x] 1.1.3 Add `TriviaQuestion` and `TriviaAnswer` interfaces to `src/lib/supabase.ts`.
    -   [x] 1.2 Implement Supabase CRUD for Questions (Admin)
        -   [x] 1.2.1 Add `getTriviaQuestions`, `getTriviaQuestion`, `createTriviaQuestion`, `updateTriviaQuestion`, `deleteTriviaQuestion` functions to `src/lib/supabase.ts`.
        -   [x] 1.2.2 Add `getTriviaAnswersForQuestion`, `getTriviaAnswer`, `createTriviaAnswer`, `updateTriviaAnswer`, `deleteTriviaAnswer` functions to `src/lib/supabase.ts`.
    -   [x] 1.3 Create API Endpoint to Fetch Questions
        -   [x] 1.3.1 Create `src/app/api/trivia/route.ts` to serve random trivia questions.
        -   [x] 1.3.2 Implement logic to fetch questions and their answers from Supabase.
-   [x] 2.0 Frontend Development
    -   [x] 2.1 Create Trivia Game Page
        -   [x] 2.1.1 Create `src/app/trivia/page.tsx` as the main game component.
    -   [x] 2.2 Develop Trivia Question Component (Integrated into page.tsx)
        -   [x] 2.2.1 Display question text and answer options.
        -   [x] 2.2.2 Handle user selection and provide visual feedback.
    -   [x] 2.3 Implement Game Timer Component
        -   [x] 2.3.1 Create `src/components/GameTimer.tsx` for countdown.
        -   [x] 2.3.2 Integrate `GameTimer` into `src/app/trivia/page.tsx`.
    -   [x] 2.4 Develop Score Display Component (Integrated into page.tsx)
        -   [x] 2.4.1 Display current and final score.
-   [x] 3.0 Game Logic & Integration
    -   [x] 3.1 Implement Core Game Logic (within page.tsx)
        -   [x] 3.1.1 Manage game state (current question, score, timer).
        -   [x] 3.1.2 Handle question progression and game over conditions.
    -   [x] 3.2 Integrate API with Frontend
        -   [x] 3.2.1 Fetch questions from `/api/trivia` on game start.
    -   [x] 3.3 Implement User Interaction
        -   [x] 3.3.1 Process answer clicks and update score.
-   [x] 4.0 Styling & Polish
    -   [x] 4.1 Apply Tailwind CSS Styling
        -   [x] 4.1.1 Ensure all new components and pages are styled consistently.
-   [x] 5.0 Testing & Deployment Preparation
    -   [x] 5.1 Write Unit Tests
        -   [x] 5.1.1 Create `tests/unit/trivia.test.tsx` for `GameTimer` component.
        -   [x] 5.1.2 Configure Jest for React and TypeScript (`jest.config.js`).
    -   [x] 5.2 Write E2E Tests
        -   [x] 5.2.1 Create `e2e/trivia.spec.ts` for end-to-end game flow.
    -   [x] 5.3 Implement Feature Flag
        -   [x] 5.3.1 Add `triviaGame` to `FlagsmithFeatureName` and `DEFAULT_FLAG_VALUES` in `src/lib/flagsmith/types.ts`.
        -   [x] 5.3.2 Use `hasFeature('triviaGame')` in `src/app/trivia/page.tsx` to control visibility.
-   [x] 6.0 Content & Data Population
    -   [x] 6.1 Populate Initial Trivia Questions
        -   [x] 6.1.1 Create `sql/populate_trivia_data.sql` with sample questions and answers.
