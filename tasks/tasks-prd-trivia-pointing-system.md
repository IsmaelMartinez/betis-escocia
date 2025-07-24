## Relevant Files

- `sql/create_user_trivia_scores_table.sql` - New SQL script to create the table for storing user trivia scores.
- `src/lib/supabase.ts` - Supabase client configuration and potentially generated types for the new table.
- `src/app/api/trivia/route.ts` - API endpoint responsible for handling trivia game logic, will be modified to calculate and store points.
- `src/app/trivia/page.tsx` - Main trivia game page, will be modified to display points during gameplay and on the results screen.
- `src/app/dashboard/page.tsx` - Potential location for displaying the user's total accumulated score in a dedicated profile section.
- `e2e/trivia.spec.ts` - End-to-end tests for the trivia game, will need updates to cover the new pointing system.
- `tests/unit/` - Directory for new unit tests for any new utility functions or components related to point calculation/display.
- `tests/integration/` - Directory for new integration tests for the modified API endpoints.
- `src/components/Layout.tsx` or similar navigation component - To update the user dropdown menu.

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests.

## Tasks

- [x] 1.0 Database Schema Update
  - [x] 1.1 Design `user_trivia_scores` table to store `user_id`, `daily_score`, and `timestamp`.
  - [x] 1.2 Create SQL migration script (`sql/create_user_trivia_scores_table.sql`) for the new table.
  - [x] 1.3 Update Supabase types (if applicable, e.g., `src/lib/supabase.ts` or generated types) to include the new table structure.
- [x] 2.0 Navigation and Access Control
  - [x] 2.1 Move trivia page link into the authenticated user dropdown section/menu.
  - [x] 2.2 Ensure trivia page (`src/app/trivia/page.tsx`) is only accessible to authenticated users.
- [x] 3.0 API Endpoint Modification/Creation
  - [x] 3.1 Modify `src/app/api/trivia/route.ts` to calculate the daily score (1 point per correct answer).
  - [x] 3.2 (Removed: No bonus/completion points. Score is solely based on correct answers.)
  - [x] 3.3 Implement logic in `src/app/api/trivia/route.ts` to store the daily score in the database for the authenticated user.
  - [x] 3.4 Ensure Clerk authentication is used to retrieve `user_id` for score storage.
  - [x] 3.5 Add API endpoint (or extend existing) to retrieve user's daily scores, allowing for calculation of total accumulated score on the frontend.
- [x] 4.0 Frontend Integration (Gameplay)
  - [x] 4.1 Modify `src/app/trivia/page.tsx` to display a running total of points during gameplay.
- [x] 5.0 Frontend Integration (Results & Profile)
  - [x] 5.1 Modify `src/app/trivia/page.tsx` (results section) to display the user's daily score after game completion.
  - [x] 5.2 Modify `src/app/trivia/page.tsx` (results section) to display the user's total accumulated score by querying daily scores.
  - [x] 5.3 Create or modify a dedicated "My Points" or "Profile" section (e.g., `src/app/dashboard/page.tsx`) to display the user's total accumulated score by querying daily scores.
- [ ] 6.0 Testing
  - [ ] 6.1 Write unit tests for any new utility functions or components related to point calculation/display.
  - [ ] 6.2 Write integration tests for the modified/new API endpoints to ensure correct score calculation and storage.
  - [x] 6.3 Create ADR for Clerk E2E testing.
  - [x] 6.3.1 Implement Clerk testing setup for E2E tests.
    - [x] 6.3.1.1 Install `@clerk/testing` as a development dependency.
    - [x] 6.3.1.2 Configure dedicated test user and environment variables for Clerk API keys and test user credentials.
    - [x] 6.3.1.3 Create `playwright/global.setup.ts` file.
    - [x] 6.3.1.4 Implement session saving in `playwright/global.setup.ts` using `@clerk/testing/playwright` to sign in the test user and save session state.
    - [x] 6.3.1.5 Configure `playwright.config.ts` to load the saved authentication state for tests.
  - [ ] 6.4 Update `e2e/trivia.spec.ts` to include tests for the new pointing system display and functionality (depends on 6.3).