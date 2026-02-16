# Testing Guide

Comprehensive testing strategy for the Peña Bética Escocesa website.

## Overview

The project uses a multi-layered testing approach:

- **Unit Tests**: Component and utility testing with Vitest
- **Integration Tests**: API and database integration with Vitest
- **E2E Tests**: Complete user workflows with Playwright
- **Component Tests**: Isolated development with Storybook
- **Visual Tests**: UI consistency (when Chromatic is configured)

## Unit & Integration Testing (Vitest)

### Configuration

- **Config**: `vitest.config.ts`
- **Environment**: jsdom for React components
- **Coverage**: v8 provider with 80% threshold
- **Setup**: `tests/setup.ts` with DOM testing library

### File Organization

```
tests/
├── unit/          # Component and utility tests
├── integration/   # API route and database tests
└── helpers/       # Shared test utilities
```

### Running Tests

```bash
npm test                # Run all tests
npm run test:watch     # Watch mode
npm run test:coverage  # Coverage report
npm run test:silent    # Minimal JSON output
```

### Testing Patterns

#### Component Testing

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// Mock external dependencies - feature flags are now synchronous
vi.mock('@/lib/featureFlags', () => ({
  hasFeature: vi.fn(() => true),
  getFeatureFlags: vi.fn(() => ({ showClasificacion: true })),
}));

vi.mock('@clerk/nextjs/server', () => ({
  getAuth: vi.fn(() => ({ userId: 'user_123' })),
}));

describe('MyComponent', () => {
  it('renders correctly', () => {
    render(<MyComponent />);
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('handles user interaction', async () => {
    const user = userEvent.setup();
    render(<MyComponent />);

    await user.click(screen.getByRole('button'));
    expect(screen.getByText('Clicked')).toBeInTheDocument();
  });
});
```

#### API Route Testing

```typescript
import { describe, it, expect, vi } from "vitest";
import { POST } from "@/app/api/rsvp/route";

// Mock authentication
vi.mock("@/lib/adminApiProtection", () => ({
  checkAdminRole: vi.fn(() =>
    Promise.resolve({
      user: { id: "admin_123" },
      isAdmin: true,
      error: null,
    }),
  ),
}));

// Mock database
vi.mock("@/lib/supabase", () => ({
  getAuthenticatedSupabaseClient: vi.fn(() => ({
    from: vi.fn(() => ({
      insert: vi.fn(() => Promise.resolve({ data: {}, error: null })),
    })),
  })),
}));

describe("/api/rsvp", () => {
  it("creates RSVP successfully", async () => {
    const request = new Request("http://localhost:3000/api/rsvp", {
      method: "POST",
      body: JSON.stringify({ matchId: "123", attending: true }),
    });

    const response = await POST(request);
    expect(response.status).toBe(200);
  });
});
```

### Mocking Strategies

#### Feature Flag Mocking

```typescript
vi.mock("@/lib/featureFlags", () => ({
  hasFeature: vi.fn((flag: string) => {
    const enabledFlags = ["show-clasificacion", "show-partidos"];
    return enabledFlags.includes(flag);
  }),
  getFeatureFlags: vi.fn(() => ({
    showClasificacion: true,
    showPartidos: true,
  })),
}));
```

#### Clerk Authentication Mocking

```typescript
vi.mock("@clerk/nextjs/server", () => ({
  getAuth: vi.fn(() => ({
    userId: "user_123",
    sessionId: "sess_123",
  })),
  clerkClient: {
    users: {
      getUser: vi.fn(() =>
        Promise.resolve({
          id: "user_123",
          publicMetadata: { role: "admin" },
        }),
      ),
    },
  },
}));
```

#### Supabase Mocking

```typescript
vi.mock("@/lib/supabase", () => ({
  getAuthenticatedSupabaseClient: vi.fn(() => ({
    from: vi.fn((table: string) => ({
      select: vi.fn(() =>
        Promise.resolve({
          data: [],
          error: null,
        }),
      ),
      insert: vi.fn(() =>
        Promise.resolve({
          data: {},
          error: null,
        }),
      ),
      update: vi.fn(() =>
        Promise.resolve({
          data: {},
          error: null,
        }),
      ),
    })),
  })),
}));
```

## E2E Testing (Playwright)

### Configuration

- **Config**: `playwright.config.ts`
- **Browsers**: Chromium, Firefox, WebKit
- **Auth**: Pre-configured in `playwright/global.setup.ts`
- **Base URL**: `http://localhost:3000` (configurable)

### Running Tests

```bash
npm run test:e2e        # Headless mode
npm run test:e2e:headed # Headed mode (debugging)
npx playwright show-report  # View results
```

### Test Organization

```
e2e/
├── admin-notifications.spec.ts  # Admin notification workflows
├── home.spec.ts                # Public page functionality
├── trivia.spec.ts              # Trivia game interactions
├── fixtures.ts                 # Shared test fixtures
└── helpers/
    └── feature-flag-mock.ts    # Feature flag mocking utilities
```

### Testing Patterns

#### Public User Workflow

```typescript
import { test, expect } from "@playwright/test";

test("user can submit RSVP", async ({ page }) => {
  await page.goto("/");

  // Fill RSVP form
  await page.fill('[data-testid="name-input"]', "John Doe");
  await page.selectOption('[data-testid="match-select"]', "match_123");
  await page.check('[data-testid="attending-yes"]');

  // Submit and verify
  await page.click('[data-testid="submit-rsvp"]');
  await expect(page.getByText("RSVP submitted successfully")).toBeVisible();
});
```

#### Admin Workflow

```typescript
import { test, expect } from "@playwright/test";

test("admin can view dashboard", async ({ page }) => {
  // Uses pre-configured admin auth from global.setup.ts
  await page.goto("/admin", {
    storageState: "playwright/.clerk/user.json",
  });

  await expect(
    page.getByRole("heading", {
      name: "Admin Dashboard",
    }),
  ).toBeVisible();

  // Test admin-specific functionality
  await page.click('[data-testid="notifications-panel"]');
  await expect(page.getByText("Notification Preferences")).toBeVisible();
});
```

#### Permission Testing

```typescript
test("requires notification permission for admin alerts", async ({
  page,
  context,
}) => {
  // Grant notification permission
  await context.grantPermissions(["notifications"]);

  await page.goto("/admin");
  await page.click('[data-testid="enable-notifications"]');

  await expect(page.getByText("Notifications enabled")).toBeVisible();
});
```

#### Feature Flag Mocking in E2E

```typescript
// Feature flags are environment variables, so mock via env setup
test.beforeEach(async ({ page }) => {
  // Set feature flags via environment (handled in global setup)
  // Feature flags are resolved at build time
    'show-rsvp': true,
    'show-trivia-game': false
  });
});
```

## Component Testing (Storybook)

### Configuration

- **Version**: Storybook v10 with Vitest addon
- **Framework**: `@storybook/nextjs-vite`
- **Location**: Stories alongside components as `*.stories.tsx`

### Running Storybook

```bash
npm run storybook        # Development server
npm run build-storybook  # Static build
```

### Story Patterns

#### Basic Component Story

```typescript
import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./Button";

const meta: Meta<typeof Button> = {
  title: "UI/Button",
  component: Button,
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
  argTypes: {
    variant: {
      control: "select",
      options: ["primary", "secondary", "outline"],
    },
  },
};

export default meta;
type Story = StoryObj<typeof Button>;

export const Primary: Story = {
  args: {
    variant: "primary",
    children: "Primary Button",
  },
};

export const Secondary: Story = {
  args: {
    variant: "secondary",
    children: "Secondary Button",
  },
};
```

#### Feature Flag Testing

```typescript
// Feature flags are mocked at the module level
export const FeatureEnabled: Story = {
  parameters: {
    mockFeatureFlags: {
      'show-rsvp': true,
    },
  },
  render: (args) => <MyComponent {...args} />,
};

export const FeatureDisabled: Story = {
  parameters: {
    mockFeatureFlags: {
      'show-rsvp': false,
    },
  },
  render: (args) => <MyComponent {...args} />,
};
```

#### Authentication State Testing

```typescript
import { withClerk, SignedIn, SignedOut } from '@clerk/nextjs/testing';

const meta: Meta<typeof UserProfile> = {
  title: 'Components/UserProfile',
  component: UserProfile,
  decorators: [withClerk()],
};

export const LoggedIn: Story = {
  render: (args) => (
    <SignedIn>
      <UserProfile {...args} />
    </SignedIn>
  ),
};

export const LoggedOut: Story = {
  render: () => (
    <SignedOut>
      <div>Please log in</div>
    </SignedOut>
  ),
};

export const AdminUser: Story = {
  render: (args) => (
    <SignedIn user={{ unsafeMetadata: { role: 'admin' } }}>
      <UserProfile {...args} />
    </SignedIn>
  ),
};
```

## CI/CD Integration

### GitHub Actions Workflow

All tests run automatically on push and pull requests:

1. **Lint & Type Check**: ESLint and TypeScript validation
2. **Unit Tests**: Vitest with coverage reporting
3. **Storybook Build**: Component documentation build
4. **E2E Tests**: Playwright across multiple browsers
5. **Build**: Production build verification

### Quality Gates

- **Coverage Threshold**: 80% for lines, functions, branches, statements
- **Lint**: Must pass ESLint rules
- **Type Safety**: Must pass TypeScript strict mode
- **Build**: Must compile successfully for production
- **E2E**: Core user workflows must pass

## Test Data Management

### Database Testing

- Use Supabase test project for integration tests
- Mock database responses in unit tests
- Clean up test data after E2E runs

### Environment Variables

Test-specific environment variables in `vitest.config.ts`:

```typescript
export default defineConfig({
  test: {
    environment: "jsdom",
    setupFiles: ["./tests/setup.ts"],
    env: {
      NEXT_PUBLIC_SUPABASE_URL: "http://localhost:54321",
      NEXT_PUBLIC_FEATURE_DEBUG_INFO: "true",
    },
  },
});
```

## Best Practices

### Test Organization

- **One test file per component/utility**
- **Group related tests with `describe` blocks**
- **Use descriptive test names** that explain behavior
- **Mock external dependencies** at the top level

### Assertions

- **Use semantic queries**: `getByRole`, `getByLabelText` over `getByTestId`
- **Test user behavior**: Click, type, navigate as users would
- **Verify outcomes**: Check for visible changes, not implementation details

### Performance

- **Mock heavy dependencies**: External APIs, large libraries
- **Parallelize when possible**: Run tests concurrently
- **Clean up properly**: Reset mocks, clear state between tests

### Maintenance

- **Keep tests simple**: One concept per test
- **Update tests with code changes**: Tests should evolve with features
- **Document complex test setup**: Explain why specific mocks are needed

## Troubleshooting

### Common Issues

#### Tests Not Finding Elements

```typescript
// Bad: Generic selector
await page.click(".button");

// Good: Semantic selector
await page.click("button", { name: "Submit RSVP" });

// Better: Test ID for complex cases
await page.click('[data-testid="submit-rsvp"]');
```

#### Mock Not Working

```typescript
// Ensure mocks are hoisted
vi.mock("@/lib/featureFlags", () => ({
  hasFeature: vi.fn(),
}));

// Reset mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
});
```

#### Async Test Issues

```typescript
// Always await async operations
await expect(page.getByText("Loading...")).toBeVisible();
await expect(page.getByText("Loaded!")).toBeVisible();

// Use waitFor for complex conditions
await waitFor(() => {
  expect(screen.getByText("Data loaded")).toBeInTheDocument();
});
```

#### E2E Flaky Tests

- **Add explicit waits**: `page.waitForSelector()` instead of `sleep()`
- **Use data attributes**: More reliable than CSS selectors
- **Check for element state**: Visible, enabled before interacting
- **Mock external services**: Prevent network-dependent failures

## Coverage Requirements

### Minimum Coverage Targets

- **Lines**: 80%
- **Functions**: 80%
- **Branches**: 80%
- **Statements**: 80%

### Focus Areas

- **Critical paths**: Authentication, RSVP submission, admin actions
- **Error handling**: API failures, validation errors, network issues
- **Edge cases**: Empty states, permission boundaries, feature flag variations
- **Accessibility**: Screen reader compatibility, keyboard navigation

---

This testing strategy ensures reliable, maintainable code that serves the Betis community effectively. **¡Viva er Betis manque pierda!** 🟢⚪
