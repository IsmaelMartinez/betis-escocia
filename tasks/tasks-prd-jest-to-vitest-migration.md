## Relevant Files

- `vitest.config.ts` - Main Vitest configuration file (needs expansion for full test suite)
- `tests/setup.ts` - Test setup file (needs conversion from Jest to Vitest syntax)
- `package.json` - Dependencies and scripts (add Vitest dependencies, remove Jest)
- `jest.config.js` - Current Jest configuration (to be removed after migration)
- `tests/unit/**/*.test.{ts,tsx}` - Unit tests to migrate (excluding app/ directory already using Vitest)
- `tests/integration/**/*.test.{ts,tsx}` - Integration tests to migrate
- `tests/helpers/testHelpers.ts` - Test utility functions (Jest to Vitest mock conversions)
- `tests/helpers/mockFactories.ts` - Mock factory functions (Jest to Vitest syntax updates)
- `tests/msw/handlers.ts` - MSW handlers (ensure Vitest compatibility)
- `tests/msw/server.ts` - MSW server setup (ensure Vitest compatibility)
- `.github/workflows/*.yml` - CI/CD workflows (update test commands)
- `CLAUDE.md` - Documentation (update testing commands and patterns)
- `docs/adr/015-jest-to-vitest-migration.md` - Architecture decision record
- `README.md` - Project documentation (update testing section)

### Notes

- Tests should maintain their current file organization and naming conventions
- Use `npm run test` to run Vitest tests after migration
- Coverage reports will be generated using Vitest's built-in c8 coverage
- Playwright E2E tests remain unchanged and continue using `npm run test:e2e`

## Tasks

- [x] 1.0 Setup Vitest Configuration and Dependencies
  - [x] 1.1 Install Vitest dependencies (`vitest`, `@vitest/ui`, `c8` for coverage)
  - [x] 1.2 Remove Jest dependencies (`jest`, `ts-jest`, `@swc/jest`, `@types/jest`)
  - [x] 1.3 Expand `vitest.config.ts` to include all test types (unit and integration)
  - [x] 1.4 Configure Vitest to exclude Playwright E2E tests from its scope
  - [x] 1.5 Set up coverage reporting with c8 and proper file exclusions
  - [x] 1.6 Update npm scripts in package.json (test, test:watch, test:coverage)
  - [x] 1.7 Verify Vitest works with existing TypeScript and path mapping setup

- [ ] 2.0 Migrate Unit Tests from Jest to Vitest
  - [ ] 2.1 Convert `tests/setup.ts` from Jest to Vitest syntax
  - [ ] 2.2 Update `tests/helpers/testHelpers.ts` mock functions (jest.mock → vi.mock, jest.fn → vi.fn)
  - [ ] 2.3 Update `tests/helpers/mockFactories.ts` to use Vitest mock patterns
  - [ ] 2.4 Migrate `tests/unit/lib/` tests (dateUtils, security, roleUtils, etc.)
  - [ ] 2.5 Migrate `tests/unit/middleware.test.ts`
  - [ ] 2.6 Migrate `tests/unit/flagsmith.test.ts` and flagsmith subdirectory tests
  - [ ] 2.7 Migrate `tests/unit/supabase.trivia.test.ts`
  - [ ] 2.8 Migrate `tests/unit/trivia.test.tsx`
  - [ ] 2.9 Verify all migrated unit tests pass and maintain coverage

- [ ] 3.0 Migrate Integration Tests from Jest to Vitest
  - [ ] 3.1 Update MSW setup in `tests/msw/server.ts` for Vitest compatibility
  - [ ] 3.2 Migrate `tests/integration/api/` tests (contact, rsvp, trivia, etc.)
  - [ ] 3.3 Migrate `tests/integration/api/admin/` tests (roles, users, contact-submissions, sync-matches)
  - [ ] 3.4 Migrate `tests/integration/api/webhooks/clerk.test.ts`
  - [ ] 3.5 Migrate `tests/integration/auth/clerkIntegration.test.ts`
  - [ ] 3.6 Migrate `tests/integration/external/footballApi.test.ts`
  - [ ] 3.7 Migrate `tests/integration/standings.test.ts` and `tests/integration/trivia.test.ts`
  - [ ] 3.8 Update Supabase and Clerk mocking patterns to work with Vitest
  - [ ] 3.9 Verify all migrated integration tests pass with proper API route testing

- [ ] 4.0 Update CI/CD and Tooling Integration
  - [ ] 4.1 Update GitHub Actions workflows to use Vitest instead of Jest
  - [ ] 4.2 Configure Vitest coverage reporting in CI pipeline
  - [ ] 4.3 Update coverage thresholds and reporting formats in CI
  - [ ] 4.4 Ensure Storybook v9 continues to work with Vitest addon integration
  - [ ] 4.5 Test all npm scripts work correctly (test, test:watch, test:coverage, test:silent)
  - [ ] 4.6 Verify CI/CD pipeline passes with new test runner
  - [ ] 4.7 Set up proper error reporting and test result formatting for CI

- [ ] 5.0 Documentation and Cleanup
  - [ ] 5.1 Update `CLAUDE.md` with new testing commands and Vitest patterns
  - [ ] 5.2 Update `.github/copilot-instructions.md` testing infrastructure section
  - [ ] 5.3 Update `GEMINI.md` testing coverage section with Vitest information
  - [ ] 5.4 Update `README.md` testing section to reflect Vitest usage
  - [ ] 5.5 Remove `jest.config.js` and related Jest configuration files
  - [ ] 5.6 Create migration guide for writing new tests with Vitest patterns
  - [ ] 5.7 Update any remaining documentation references from Jest to Vitest
  - [ ] 5.8 Verify all 329 tests pass with identical coverage percentages
  - [ ] 5.9 Document rollback procedure in case of issues
  - [ ] 5.10 Clean up any temporary migration files or dual configurations