# 009-clerk-e2e-testing

## Title: Clerk E2E Testing Strategy

## Status: Proposed

## Context

Our End-to-End (E2E) tests, particularly for routes protected by Clerk authentication (e.g., `/trivia`), are currently failing due to unauthenticated access. When Playwright runs these tests, the application redirects to the `/sign-in` page, preventing the tests from interacting with the intended elements on the protected routes. This necessitates a robust and efficient strategy for handling user authentication within our Playwright E2E test suite.

The current approach of running tests without explicit authentication setup leads to:
- Test failures on protected routes.
- Inability to properly test user-specific features.
- Inefficient test execution if manual login were to be implemented in each test.

## Decision

We will adopt `@clerk/testing` in conjunction with Playwright's `globalSetup` feature to manage authenticated sessions for E2E tests.

This approach involves:
1.  **Installation**: Installing the `@clerk/testing` package as a development dependency.
2.  **Test User**: Utilizing a dedicated test user in Clerk with known credentials.
3.  **Environment Variables**: Storing Clerk API keys and test user credentials as environment variables for the test runner.
4.  **`global.setup.ts`**: Creating a Playwright `global.setup.ts` file that will:
    *   Use `@clerk/testing/playwright` to sign in the dedicated test user.
    *   Save the authenticated session state to a file (e.g., `playwright/.clerk/user.json`).
5.  **`playwright.config.ts`**: Configuring Playwright projects to load this saved authentication state, ensuring that tests within these projects start with an already authenticated session.

## Consequences

### Positive
-   **Enables Testing of Protected Routes**: Allows comprehensive E2E testing of all application features, including those behind Clerk authentication.
-   **Improved Test Reliability**: Reduces flakiness by ensuring a consistent authenticated state for tests.
-   **Faster Test Execution**: Eliminates the need for each test to perform a login operation, significantly speeding up the test suite.
-   **Realistic User Flows**: Tests can simulate actual user journeys through authenticated parts of the application.

### Negative
-   **Setup Overhead**: Requires initial setup of `@clerk/testing`, environment variables, and a dedicated test user.
-   **Dependency Management**: Adds `@clerk/testing` as a new development dependency.
-   **Credential Management**: Requires careful management of test user credentials and Clerk API keys in the CI/CD environment.

## Alternatives Considered

### 1. Manual Login in Each Test
-   **Description**: Each E2E test would navigate to the login page, fill in credentials, and submit the form.
-   **Pros**: Simple to understand.
-   **Cons**: Extremely slow and inefficient. Highly brittle due to reliance on UI elements for login. Not scalable for a large test suite.

### 2. Bypassing Authentication in Tests
-   **Description**: Modifying the application code to bypass Clerk authentication specifically for the test environment (e.g., using feature flags or environment variables).
-   **Pros**: Simplifies test setup.
-   **Cons**: Does not accurately test the real user experience. Introduces test-specific code that could lead to discrepancies between tested and deployed behavior. Compromises the integrity of E2E tests, which are meant to simulate real user interactions.
