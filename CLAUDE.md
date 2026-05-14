# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Real Betis supporters club website in Edinburgh with mobile-first design, serving match viewing parties at Polwarth Tavern. Built on Next.js 16 with TypeScript, featuring secure-by-default architecture using feature flags.

## Essential Commands

### Development

```bash
npm run dev              # Start dev server with Turbopack
npm run build           # Production build
npm run start          # Start production server
npm run lint           # Run ESLint
npm run type-check     # TypeScript type checking
```

### Testing

```bash
npm test                # Run Vitest unit & integration tests
npm run test:watch     # Vitest watch mode
npm run test:coverage  # Vitest coverage report with v8 provider
npm run test:silent    # Vitest with minimal JSON output
npm run test:e2e       # Playwright E2E tests (headless)
npm run test:e2e:headed # Playwright E2E tests (headed)
npm run storybook      # Storybook dev server
npm run build-storybook # Build Storybook
```

### Utilities

```bash
npm run lighthouse:accessibility # Run Lighthouse audit
```

### Pre-commit Hooks (Lefthook)

Pre-commit hooks automatically run before each commit to catch issues early:

- **ESLint**: Auto-fixes linting errors
- **Prettier**: Auto-formats code
- **TypeScript**: Type checking

**Skip hooks** (if needed):

```bash
LEFTHOOK=0 git commit -m "message"
```

Hooks are configured in `lefthook.yml` and install automatically via the `prepare` script.

### Branch Protection & Deployment

- **Branch protection**: `main` requires PRs — never push directly
- **Deployment**: Vercel's GitHub integration auto-deploys on merge to main (CI deploy job commented out pending secret configuration, see issue #329)
- **Dependabot**: Configured in `.github/dependabot.yml` with grouped minor/patch updates; `next`, `react`, `react-dom` excluded from grouping for isolated review

### npm Gotchas

- **Lockfile corruption**: If dependency installs go wrong (e.g., installing then reverting a major version), reset both `package.json` and `package-lock.json` from main and reinstall cleanly rather than trying to fix incrementally
- **`--legacy-peer-deps`**: Avoid — causes missing transitive dependencies. Use `overrides` in `package.json` for peer dep conflicts instead
- **Peer dep overrides**: The `overrides` field in `package.json` resolves peer dependency mismatches (e.g., `"eslint": "^10.0.0"` for typescript-eslint compatibility)

## Architecture Overview

### Core Technology Stack

- **Frontend**: Next.js 16 App Router, React 19, TypeScript
- **Styling**: Tailwind CSS 4 with custom Betis branding
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: Clerk with role-based permissions
- **Feature Flags**: Environment variables for feature rollouts
- **Testing**: Vitest 4 + Playwright + Storybook v10

### Key Directories

```
src/
├── app/                 # Next.js App Router (pages & API routes)
├── components/          # Reusable React components
├── lib/                 # Utilities, API clients, auth helpers
├── middleware.ts        # Route protection & security headers
└── types/              # TypeScript type definitions

tests/
├── unit/               # Vitest unit tests
├── integration/        # Vitest integration tests
└── helpers/            # Test utilities

e2e/                    # Playwright E2E tests
sql/                    # Database migrations & scripts
```

## Critical Architectural Patterns

### Feature Flag System (Environment Variables)

- **Simple approach**: Environment variable-based flags, cached in production only
- **Usage**: `hasFeature('flag-name')` (synchronous)
- **Configuration**: Set `NEXT_PUBLIC_FEATURE_*=true` to enable disabled-by-default features, or `=false` to disable core features
- **Location**: `src/lib/features/featureFlags.ts`
- **Enabled by default**: Nosotros, Únete (Join), Clasificación (standings), Partidos (matches), Jugadores Históricos (legends), Efemérides
- **Disabled by default**: Clerk Auth, Debug Info
- **Development mode**: No caching - changes to `.env.local` apply immediately
- **Documentation**: See `docs/adr/004-feature-flags.md`
- **Auto-sync**: Partidos feature includes automatic background sync that updates past matches with missing data when users visit the site

### Authentication Flow (Clerk + Supabase)

- **Dual mode**: Anonymous submissions + authenticated user management
- **API Protection**: Use `checkAdminRole()` from `@/lib/auth/adminApiProtection`
- **Role hierarchy**: `admin` > `moderator` > `user` (in `publicMetadata.role`)
- **Database integration**: `getAuthenticatedSupabaseClient(clerkToken)` for RLS
- **Documentation**: See `docs/adr/001-clerk-authentication.md`

### Database Patterns (Supabase)

- **RLS enabled**: Always use authenticated client for user data
- **User data**: Anonymous and authenticated submissions stored separately
- **Cache strategy**: Use `classification_cache` table for external API data
- **Location**: `src/lib/api/supabase.ts` for client and types

## Component Development

### Storybook Integration

- **Purpose**: Component development, documentation, and testing
- **Version**: v10 with Vitest addon integration
- **Pattern**: Create `.stories.tsx` files alongside components
- **Import updates**: Use `import { within, userEvent } from 'storybook/test'`

### Mobile-First Design

- **Always start mobile**, scale up with responsive breakpoints
- **Follow the Design System**: See `docs/design-system.md` for complete guidelines

### Design System (CRITICAL FOR AI AGENTS)

**⚠️ NEVER use generic Tailwind greens.** Always use branded color classes.

#### Brand Colors

- **Primary Green**: `bg-betis-verde` (not `bg-green-600`)
- **Dark Green**: `bg-betis-verde-dark` (not `bg-green-700`)
- **Light Green**: `bg-betis-verde-light` (not `bg-green-100`)
- **Pale Green**: `bg-betis-verde-pale` (not `bg-green-50`)
- **Gold Accent**: `bg-betis-oro` (not `bg-yellow-400`)
- **Scottish Navy**: `bg-scotland-navy` (for footer/dark sections)

#### Color Migration Reference

| DON'T USE ❌                  | USE INSTEAD ✅                                  |
| ----------------------------- | ----------------------------------------------- |
| `bg-green-50/100`             | `bg-betis-verde-pale/light`                     |
| `bg-green-500/600`            | `bg-betis-verde`                                |
| `bg-green-700`                | `bg-betis-verde-dark`                           |
| `text-green-*`                | `text-betis-verde` or `text-betis-verde-dark`   |
| `text-green-400` (on dark bg) | `text-betis-oro`                                |
| `hover:bg-green-700`          | `hover:bg-betis-verde-dark`                     |
| `border-green-*`              | `border-betis-verde` or `border-betis-verde/20` |

#### CSS Variables (defined in `globals.css`)

```css
--betis-verde: #048d47 /* Authentic Betis green */ --betis-verde-dark: #036b38
  /* Hover states, headers */ --betis-verde-light: #e8f5ed
  /* Light backgrounds */ --betis-oro: #d4af37 /* Gold highlights, CTAs */
  --scotland-navy: #0b1426 /* Footer, dark sections */;
```

#### Component Patterns

```jsx
// ✅ Correct - uses branded classes
<button className="bg-betis-verde hover:bg-betis-verde-dark text-white">

// ❌ Wrong - generic Tailwind
<button className="bg-green-600 hover:bg-green-700 text-white">

// ✅ Footer (Scottish Navy)
<footer className="bg-scotland-navy text-white">
  <h3 className="text-betis-oro">Heading</h3>
</footer>
```

#### Full Documentation

See `docs/design-system.md` for:

- Complete color palette with hex values
- Typography guidelines
- Component examples
- Accessibility requirements
- Migration reference table

### Secure Component Pattern

```typescript
import { hasFeature } from "@/lib/features/featureFlags";

export default function MyComponent() {
  const isEnabled = hasFeature("my-feature-flag");
  if (!isEnabled) return null;

  return <div>Feature content</div>;
}
```

## API Route Patterns

### Abstracted Route Pattern (Recommended)

**Most business routes use the `createApiHandler` pattern for consistency:**

```typescript
import { createApiHandler } from "@/lib/apiUtils";
import { mySchema } from "@/lib/schemas";

export const POST = createApiHandler({
  auth: "user", // 'none' | 'user' | 'admin' | 'optional'
  schema: mySchema, // Zod schema for validation
  handler: async (validatedData, context) => {
    // validatedData is type-safe and validated
    // context provides user info, request, supabase clients
    return {
      success: true,
      message: "Success message",
    };
  },
});
```

**When to use `createApiHandler`:**

- Simple CRUD operations with standard validation
- New API routes being developed
- Routes requiring consistent error handling
- APIs with straightforward authentication needs

**When to use Legacy Pattern (Rarely):**

- Server-Sent Events (SSE) endpoints that return streaming responses
- External integrations with very specific protocol requirements

**✅ Complete**: All standard API routes now use `createApiHandler`.

### Legacy Protected Route Pattern

```typescript
import { checkAdminRole } from "@/lib/auth/adminApiProtection";
import { getAuth } from "@clerk/nextjs/server";

export async function POST(request: NextRequest) {
  const { user, isAdmin, error } = await checkAdminRole();
  if (!isAdmin) return NextResponse.json({ error }, { status: 401 });

  const { getToken } = getAuth(request);
  const token = await getToken({ template: "supabase" });
  const supabase = getAuthenticatedSupabaseClient(token);

  // Implementation here
}
```

## Testing Patterns

### Vitest Configuration

- **Test runner**: Vitest with jsdom environment for React components
- **Coverage**: v8 provider with 80% threshold for lines, functions, branches, statements
- **Setup**: Global setup in `tests/setup.ts` with DOM testing library matchers
- **Config**: `vitest.config.ts` with path aliases and environment variables

### Mocking Patterns

- **Clerk mocking**: Mock `@clerk/nextjs/server` for authentication tests
- **Supabase mocking**: Mock database operations with controlled responses
- **MSW integration**: Service worker for external API mocking
- **Environment variables**: Test-specific values in `vitest.config.ts`

### Test Compatibility with Abstracted Routes

**✅ Complete**: All API route tests have been updated to work with the `createApiHandler` pattern.

**Current Pattern (All Tests Use This)**:

```typescript
// ✅ Tests work with Zod validation by providing valid data
const validData = {
  name: "Test User",
  email: "test@example.com", // Valid email format
  subject: "Test Subject", // Meets min length requirements
  message: "Test message", // Meets min length requirements
};

// Mock successful Supabase operations
(supabase.from as any).mockReturnValue({
  insert: vi.fn(() => ({
    select: vi.fn(() => ({
      single: vi.fn(() => Promise.resolve({ data: { id: 1 }, error: null })),
    })),
  })),
});
```

**Legacy Pattern (No Longer Used)**:

```typescript
// ❌ Old tests mocked validation functions that are no longer used
vi.spyOn(security, "validateInputLength").mockReturnValue({ isValid: true });
vi.spyOn(security, "validateEmail").mockReturnValue({ isValid: true });
```

**When Writing New Tests**:

1. Provide valid data that passes Zod schema validation
2. Test validation by providing invalid data that Zod will reject
3. Mock Supabase operations rather than validation functions
4. Expect error messages from Zod validation failures

### Example Test

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mocking with Vitest
vi.mock('@/lib/features/featureFlags', () => ({
  hasFeature: vi.fn(() => true),
}));

// Component testing
test('renders component correctly', () => {
  render(<MyComponent />);
  expect(screen.getByRole('button')).toBeInTheDocument();
});
```

### API Route Testing

- Mock external services first (Clerk, Supabase)
- Mock security functions to return valid by default
- Test success cases, validation failures, rate limiting, database errors
- Use established NextResponse mocking pattern

### E2E Testing (Playwright)

- **Auth setup**: Pre-configured in `playwright/global.setup.ts`
- **Base URL**: Defaults to `http://localhost:3000`
- **Pattern**: Test user workflows end-to-end with real authentication

## Key Features

### Data Management

- **Match Data**: Football-Data.org API integration with caching
- **Admin Dashboard**: Match sync and management
- **User Management**: Handled directly through Clerk dashboard or API

## Admin Panel Architecture

### Current Structure

The admin panel (`/admin`) provides a streamlined interface for match management:

- **Dashboard**: Overview with match count
- **Partidos (Matches)**: Complete match management including creation, editing, deletion, and sync

### User Management Migration

User management functionality has been removed from the admin panel to:

- Reduce complexity and maintenance burden
- Leverage Clerk's robust user management capabilities
- Focus admin panel on core content management

**User operations now handled via:**

- Clerk Dashboard: Web-based user management interface
- Clerk Management API: Programmatic user operations
- Clerk Webhooks: User lifecycle event handling

### Admin Authentication & Authorization

- **Authentication**: Clerk-based with admin role requirement
- **Route Protection**: `withAdminRole` HOC ensures admin access
- **API Security**: All admin API routes use `createApiHandler` with `auth: 'admin'`

## Areas for Future Enhancement

### Performance & Scalability

- **API Rate Limiting**: Implement for public routes
- **Database Indexing**: Optimize for frequent queries
- **Bundle Size**: Analyze and reduce JavaScript bundles
- **Image Optimization**: Ensure proper Next.js Image usage

### Developer Experience

- **Type Generation**: Consider `supabase gen types` for schema sync
- **CI/CD Enhancement**: Add performance audits, security scans
- **Documentation**: Expand component documentation in Storybook

### User Engagement

- **Social Features**: Enhanced photo sharing, match predictions
- **Internationalization**: Multi-language support if needed

## Documentation References

For comprehensive details, always check:

- **Developer Guide**: `docs/developer-guide.md` for complete development guide
- **Testing Guide**: `docs/testing-guide.md` for testing strategies and patterns
- **ADRs**: `docs/adr/` for architectural decisions
- **Security**: `docs/security/` for security implementation details

## Environment Setup

Required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` & `CLERK_SECRET_KEY`

Optional feature flags (only for disabled/experimental features):

- `NEXT_PUBLIC_FEATURE_CLERK_AUTH=true` (enables authenticated user flows)
- `NEXT_PUBLIC_FEATURE_DEBUG_INFO=true` (shows the feature flag debug panel)

Optional debugging:

- `NEXT_PUBLIC_DEBUG_MODE=true`

## Repo Butler

This repo is monitored by [Repo Butler](https://github.com/IsmaelMartinez/repo-butler), a portfolio health agent that observes repo health daily and generates dashboards, governance proposals, and tier classifications.

**Your report:** https://ismaelmartinez.github.io/repo-butler/betis-escocia.html
**Portfolio dashboard:** https://ismaelmartinez.github.io/repo-butler/
**Consumer guide:** https://github.com/IsmaelMartinez/repo-butler/blob/main/docs/consumer-guide.md

### Querying Reginald (the butler MCP server)

To query your repo's health tier, governance findings, and portfolio data from any Claude Code session, add the MCP server once (adjust the path to your local repo-butler checkout):

```bash
claude mcp add repo-butler node /path/to/repo-butler/src/mcp.js
```

Available tools: `get_health_tier`, `get_campaign_status`, `query_portfolio`, `get_snapshot_diff`, `get_governance_findings`.

When working on health improvements, check the per-repo report for the current tier checklist and use the consumer guide for fix instructions.

If this repo deploys a page, set its GitHub repository Homepage URL (the Website field in the repo's About section — not `package.json`'s `homepage`) to the canonical URL. That's how repo-butler surfaces the deployed link in dashboards and agent cards.
