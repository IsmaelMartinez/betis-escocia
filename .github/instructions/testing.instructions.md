---
description: Guidelines and patterns for testing workflows.
globs:
  - "tests/**/*.ts"
  - "tests/**/*.tsx"
  - "e2e/**/*.ts"
alwaysApply: false
---
# Testing Workflow Instructions

## Description
This document outlines the guidelines and patterns for the testing workflow, covering unit, integration, E2E, and component testing strategies.

## Relevant Files
- `tests/unit/`: Jest unit tests.
- `tests/integration/`: Jest integration tests for API routes.
- `e2e/`: Playwright end-to-end tests.
- `tests/setup.ts`: Jest configuration.
- `playwright/global.setup.ts`: Playwright E2E authentication setup with Clerk.
- `jest.config.js`: Jest test runner configuration.
- `playwright.config.ts`: Playwright E2E test configuration with auth state.

## Guidelines

### Testing Strategy Overview
- **Unit tests**: Jest with `@swc/jest`, placed in `tests/unit/`.
- **Integration tests**: API routes in `tests/integration/`.
- **E2E tests**: Playwright with Clerk authentication pre-setup.
- **Component tests**: Storybook v9 with Vitest addon integration.
- **CI/CD Pipeline**: GitHub Actions with comprehensive checks (ESLint, TypeScript, Storybook build, Jest, Playwright, Lighthouse).

### Jest Configuration and ES Module Handling
- **Problem**: Jest encounters `SyntaxError: Unexpected token 'export'` when importing Clerk packages.
- **Solution**: Mock Clerk modules at the top of test files before any imports:
```typescript
// Mock Clerk before any other imports
jest.mock("@clerk/nextjs/server", () => ({
  getAuth: jest.fn(() => ({
    userId: null,
    getToken: jest.fn(() => Promise.resolve(null)),
  })),
}));
```
- **Supabase Query Builder Mocking**: Properly mocking Supabase's chainable query builder requires understanding the actual API structure:
```typescript
// Correct pattern for mocking Supabase
jest.mock("@/lib/supabase", () => {
  const mockFrom = jest.fn();
  return {
    supabase: {
      from: mockFrom,
    },
  };
});

// In tests, mock the full chain:
(supabase.from as jest.Mock).mockReturnValue({
  select: jest.fn(() => ({
    eq: jest.fn(() => Promise.resolve({ data: [], error: null })),
  })),
});
```

### API Route Testing Strategy
For Next.js API routes with complex dependencies:

#### Mock Structure Hierarchy
1. **External Services First**: Mock Clerk, Supabase, email services before imports.
2. **Security Functions**: Mock all security utilities to avoid conflicts.
3. **Test-Specific Overrides**: Use `jest.spyOn()` for test-specific behavior.

#### Security Function Mocking Best Practices
- **Avoid `jest.requireActual()`**: This can cause conflicts with test-specific spies.
- **Default to Valid**: Mock security functions to return valid by default, override in specific tests.
- **Complete Mock Objects**: Include all required properties (e.g., rate limit responses need `allowed`, `remaining`, `resetTime`).
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

#### NextResponse Mocking Pattern
- **Established Pattern**: Consistent NextResponse mocking across all API tests:
```typescript
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({ data, ...options })),
  },
}));
```

#### API Route Test Coverage by Endpoint
Each endpoint should test: success cases, validation failures, rate limiting, database errors, edge cases (not found, empty data).

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

### Form Validation Testing Patterns

#### Validation Rule Precedence Understanding
- **Critical Discovery**: Form validation follows a specific precedence order that must be understood for accurate testing:
  1. **Required validation** - checked first, stops further validation if field is empty.
  2. **Length validation** (minLength/maxLength) - checked before pattern validation.
  3. **Pattern validation** - checked after length requirements are met.
  4. **Custom validation** - applied last.

#### Spanish Error Message Validation
- **Implementation**: All form validation supports Spanish localization with proper error messages.

#### Security Function Integration Testing
- **Pattern**: Form validation integrates with security utilities that must be properly mocked.

#### Complex Validation Rules Testing
- **Comprehensive Coverage**: Testing covers various validation rule combinations.

#### Edge Case Handling
- **Thorough Testing**: Form validation handles edge cases properly.

#### Test Structure Best Practices
- **Organization**: Tests are structured for maintainability and clarity.

#### Realistic Security Function Simulation
- **Best Practice**: Security functions should be mocked realistically to match production behavior.

### Playwright E2E Testing Guidance
- Playwright tests are located in the `e2e/` directory.
- Clerk authentication is pre-setup in `playwright/global.setup.ts`.
- Run E2E tests with `npm run test:e2e`.


