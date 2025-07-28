# AI Coding Agent Instructions - Peña Bética Escocesa

## Project Overview

Real Betis supporters club website in Edinburgh with mobile-first design, serving match viewing parties at Polwarth Tavern. Built on Next.js 15 with TypeScript, featuring secure-by-default architecture using feature flags.

**📖 For comprehensive project details, architecture decisions, and implementation guides, see GEMINI.md - it contains up-to-date information about technologies, patterns, trivia game implementation, MCP server configuration, and areas for improvement.**

## Storybook 9 Integration Notes

This project uses Storybook v9.0.18. Key changes and considerations for AI assistants:

- **Package Consolidation**: Many Storybook packages (e.g., `@storybook/test`, `@storybook/addon-actions`, `@storybook/addon-controls`, `@storybook/addon-interactions`, `@storybook/addon-viewport`) are now consolidated into the main `storybook` package. When importing utilities like `within` and `userEvent` for `play` functions, use the `storybook/test` path (e.g., `import { within, userEvent } from 'storybook/test';`).
- **Vitest Addon**: `@storybook/addon-vitest` is integrated for component testing and is the recommended approach over the older test runner. This enables the full Storybook Test experience.
- **Breaking Changes**: Be aware of other breaking changes in Storybook 9, such as Node.js 20+, Next.js 14+, and Vite 5+ requirements. Refer to the official Storybook migration guide for a complete list.

## Critical Architecture Patterns

### Feature Flag System (Flagsmith)

- **All features disabled by default** - requires explicit activation in Flagsmith dashboard
- **Never use environment variables for new flags** - migrate to Flagsmith API
- **Pattern**: Check flags with `await hasFeature('flag-name')` or `await getValue('flag-name')`
- **Debugging**: Enable with `NEXT_PUBLIC_FLAGSMITH_DEBUG=true`
- **Config required**: `NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID` (starts with `ser_` in production)

### Authentication Flow (Clerk + Supabase)

- **Dual pattern**: Anonymous submissions + authenticated user management
- **Server-side**: Always use `getAuth()` and `currentUser()` for metadata access
- **API protection**: Import `checkAdminRole()` from `@/lib/adminApiProtection`
- **Role hierarchy**: `admin` > `moderator` > `user` (stored in `publicMetadata.role`)
- **Token passing**: Use `getAuthenticatedSupabaseClient(clerkToken)` for RLS

### API Route Patterns

```typescript
// Standard protected API route structure
import { getAuth, currentUser } from "@clerk/nextjs/server";
import { checkAdminRole } from "@/lib/adminApiProtection";

export async function POST(request: NextRequest) {
  const { user, isAdmin, error } = await checkAdminRole();
  if (!isAdmin) return NextResponse.json({ error }, { status: 401 });

  // For user-specific data, use authenticated Supabase client
  const { getToken } = getAuth(request);
  const token = await getToken({ template: "supabase" });
  const supabase = getAuthenticatedSupabaseClient(token);
}
```

### Database Integration (Supabase)

- **RLS enabled** on all user tables - always use authenticated client for user data
- **User linking**: Automatic email-based association via Clerk webhooks
- **Cache strategy**: Use `classification_cache` table pattern for external API data
- **Cleanup**: Implement TTL patterns (see `cleanup_old_rsvps()` function)

## Development Workflows

### Testing Strategy

- **Unit tests**: Jest with `@swc/jest`, placed in `tests/unit/`
- **Integration tests**: API routes in `tests/integration/`
- **E2E tests**: Playwright with Clerk authentication pre-setup
- **Component tests**: Storybook v9 with Vitest addon integration
- **CI/CD Pipeline**: GitHub Actions with comprehensive checks (ESLint, TypeScript, Storybook build, Jest, Playwright, Lighthouse)
- **Mocking pattern**: Always mock at module level before imports

```typescript
jest.mock("@/lib/supabase", () => ({ supabase: { from: jest.fn() } }));
```

#### Critical Testing Patterns (Learned from Contact/RSVP API tests)

**ES Module Import Issues**: Jest fails with Clerk's ES modules. **SOLUTION**: Mock Clerk before ANY imports:

```typescript
// Mock Clerk before any other imports
jest.mock("@clerk/nextjs/server", () => ({
  getAuth: jest.fn(() => ({
    userId: null,
    getToken: jest.fn(() => Promise.resolve(null)),
  })),
}));
```

**Supabase Query Builder Mocking**: Must match actual API chain structure:

```typescript
// Correct pattern - supports .from().select().eq() chaining
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

**Security Function Mocking**: Avoid `jest.requireActual()` - causes conflicts with test spies:

```typescript
// GOOD - Simple mocks without requireActual
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

**Complete Mock Objects**: Rate limit mocks need ALL required properties (`allowed`, `remaining`, `resetTime`)

**API Route Test Coverage**: For each endpoint, test: success cases, validation failures, rate limiting, database errors, edge cases (not found, empty data)

### Environment Setup Requirements

```bash
# Core services
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
CLERK_SECRET_KEY=

# Feature flags (required)
NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID=

# Development helpers
NEXT_PUBLIC_DEBUG_MODE=true
NEXT_PUBLIC_FLAGSMITH_DEBUG=true
```

### Local Development Commands

- `npm run dev` - Starts with Turbopack
- `npm run storybook` - Starts Storybook development server
- `npm run build-storybook` - Builds static Storybook for deployment
- `npm run test:e2e` - Playwright tests (requires dev server)
- `npm test` - Jest unit/integration tests
- `npm run lint` - ESLint with Next.js config

### CI/CD Pipeline Structure

The GitHub Actions workflow (`enhanced-deploy.yml`) runs comprehensive quality checks:

```
Pipeline Jobs (run in parallel):
├── lint (ESLint)
├── type-check (TypeScript)
├── storybook-build (Component Documentation)
├── jest-tests (Unit/Integration)
├── e2e-tests (Playwright)
└── build-and-lighthouse (Final build + Lighthouse audit)
```

All quality gate jobs must pass before the final build and deployment step. Storybook build artifacts are uploaded for 30 days retention.

### Structured Feature Development Workflow

For systematic feature development with AI assistance, use the structured workflow instructions:

- **`.github/instructions/create-prd.instructions.md`** - Generate Product Requirements Documents (PRDs) with guided clarifying questions
- **`.github/instructions/generate-tasks.instructions.md`** - Create detailed task lists from PRDs with parent/sub-task breakdown
- **`.github/instructions/process-tasks-list.instructions.md`** - Implement tasks systematically with completion tracking and git integration

**Usage**: Reference these instructions (e.g., `@create-prd.instructions.md`) to follow the structured development process from idea to implementation.

## Documentation & Task Management Workflow

When completing PRDs and their associated tasks:

1. **Task Completion**: Mark all sub-tasks as `[x]` completed in the task list
2. **Quality Assurance**: Run full test suite, resolve all lint/type-check errors
3. **Code Commit**: Stage and commit changes with descriptive commit messages
4. **Documentation Updates**: Update relevant ADRs, README.md, and technical docs
5. **Feature Documentation**: Update feature flags, API docs, or user guides as needed
6. **Historical Organization**: Move completed work to historical documentation:
   - Move `tasks-prd-[feature].md` to `docs/historical/completed-tasks/`
   - Move `prd-[feature].md` to `docs/historical/implemented-features/`
   - Update `docs/historical/documentation-reorganization.md` with the move
7. **README Updates**: Update main README.md if the feature affects user-facing functionality
8. **Merge Documentation**: Merge any research/comparison docs into existing documentation (e.g., feature flag comparisons into main feature flag docs)

This workflow ensures completed work is properly archived while keeping active planning documents in the `/tasks` folder.

## Component & Page Patterns

### Secure Component Pattern

```tsx
import { hasFeature } from "@/lib/flagsmith";

export default async function MyComponent() {
  const isEnabled = await hasFeature("my-feature-flag");
  if (!isEnabled) return null;

  return <div>Feature content</div>;
}
```

### Mobile-First Styling

- **Always start with mobile** breakpoints, scale up
- **Betis branding**: `bg-gradient-to-r from-green-600 to-green-700` (#00A651)
- **Gold accents**: `text-yellow-400` for highlights
- **Responsive navigation**: Hamburger menu pattern in `components/Layout.tsx`

## Critical File Locations

### Core Architecture

- `src/middleware.ts` - Route protection and security headers
- `src/lib/flagsmith/` - Feature flag management system
- `src/lib/supabase.ts` - Database client and type definitions
- `src/lib/adminApiProtection.ts` - API security utilities

### Testing Infrastructure

- `tests/setup.ts` - Jest configuration
- `playwright/global.setup.ts` - E2E auth setup with Clerk
- `e2e/*.spec.ts` - End-to-end test patterns

### Configuration

- `jest.config.js` - Test runner configuration
- `playwright.config.ts` - E2E test configuration with auth state

## Data Flow Patterns

### User Submission Flow

1. Anonymous form submission → Supabase
2. Webhook associates with user by email
3. User dashboard shows historical data via authenticated queries

### External API Integration

1. Check cache table first (`classification_cache`)
2. If stale, fetch from external API
3. Update cache with TTL
4. Return cached data with source indicator

## Common Pitfalls to Avoid

- **Never bypass feature flags** - always check before rendering features
- **Don't mock Clerk incorrectly** - use `getAuth()` and `currentUser()` consistently
- **Avoid hardcoded role checks** - use `checkAdminRole()` utility
- **Don't forget RLS** - user data requires authenticated Supabase client
- **Test environment isolation** - use separate Flagsmith environments
- **Always use latest stable versions** - research current library versions before implementation to ensure security, performance, and access to newest features

## Additional Resources

### Comprehensive Project Documentation

- **GEMINI.md**: Contains detailed project overview, technologies, patterns, and improvement areas - **keep this updated as it serves as the primary reference for other AI agents**
  - **Note**: Some references in GEMINI.md may need verification (e.g., `src/lib/flags/` should be `src/lib/flagsmith/`)
- **Database schema**: See `sql/` directory for migrations
- **Documentation**: Comprehensive ADRs in `docs/adr/`
- **Feature flags**: Complete guide in `docs/feature-flags.md`

### Model Context Protocol (MCP) Servers

This project utilizes Model Context Protocol (MCP) servers to extend the Gemini CLI's capabilities. Specifically, we are integrating with:

- **GitHub MCP Server**: For interacting with GitHub repositories and workflows.
- **Supabase MCP Server**: For direct database interactions and schema management.

## Quick Reference

- **Admin dashboard**: `/admin` (requires admin role)
- **API endpoints**: Follow RESTful patterns in `src/app/api/`
- **Feature flag implementation**: `src/lib/flagsmith/` (not `src/lib/flags/`)
- **Trivia game**: Full implementation details in GEMINI.md
