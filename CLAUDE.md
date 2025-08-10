# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Real Betis supporters club website in Edinburgh with mobile-first design, serving match viewing parties at Polwarth Tavern. Built on Next.js 15 with TypeScript, featuring secure-by-default architecture using feature flags.

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
npm run update-trivia   # Update trivia questions in database
npm run lighthouse:accessibility # Run Lighthouse audit
```

## Architecture Overview

### Core Technology Stack
- **Frontend**: Next.js 15 App Router, React 19, TypeScript
- **Styling**: Tailwind CSS 4 with custom Betis branding
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: Clerk with role-based permissions
- **Feature Flags**: Flagsmith for secure feature rollouts
- **Testing**: Vitest + Playwright + Storybook v9

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

### Feature Flag System (Flagsmith)
- **Secure by default**: All features disabled until explicitly enabled
- **Usage**: `await hasFeature('flag-name')` or `await getValue('flag-name')`
- **Environment**: `NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID` required
- **Location**: `src/lib/flagsmith/` - NOT `src/lib/flags/`
- **Documentation**: See `docs/adr/004-flagsmith-feature-flags.md`

### Authentication Flow (Clerk + Supabase)
- **Dual mode**: Anonymous submissions + authenticated user management  
- **API Protection**: Use `checkAdminRole()` from `@/lib/adminApiProtection`
- **Role hierarchy**: `admin` > `moderator` > `user` (in `publicMetadata.role`)
- **Database integration**: `getAuthenticatedSupabaseClient(clerkToken)` for RLS
- **Documentation**: See `docs/adr/001-clerk-authentication.md`

### Database Patterns (Supabase)
- **RLS enabled**: Always use authenticated client for user data
- **User linking**: Automatic email-based association via Clerk webhooks
- **Cache strategy**: Use `classification_cache` table for external API data
- **Location**: `src/lib/supabase.ts` for client and types

## Component Development

### Storybook Integration
- **Purpose**: Component development, documentation, and testing
- **Version**: v9.1.1 with Vitest addon integration
- **Pattern**: Create `.stories.tsx` files alongside components
- **Import updates**: Use `import { within, userEvent } from 'storybook/test'`

### Mobile-First Design
- **Betis branding**: `bg-gradient-to-r from-green-600 to-green-700` (#00A651)
- **Gold accents**: `text-yellow-400` for highlights
- **Always start mobile**, scale up with responsive breakpoints

### Secure Component Pattern
```typescript
import { hasFeature } from "@/lib/flagsmith";

export default async function MyComponent() {
  const isEnabled = await hasFeature("my-feature-flag");
  if (!isEnabled) return null;
  
  return <div>Feature content</div>;
}
```

## API Route Patterns

### Standard Protected Route
```typescript
import { checkAdminRole } from "@/lib/adminApiProtection";
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

### Jest Configuration
- **ES Module handling**: Mock Clerk/Supabase before imports to avoid syntax errors
- **Location**: `tests/setup.ts` for global configuration
- **Pattern**: Use `__mocks__/` directory for consistent mocking

### API Route Testing
- Mock external services first (Clerk, Supabase)
- Mock security functions to return valid by default
- Test success cases, validation failures, rate limiting, database errors
- Use established NextResponse mocking pattern

### E2E Testing (Playwright)
- **Auth setup**: Pre-configured in `playwright/global.setup.ts`
- **Base URL**: Defaults to `http://localhost:3000`
- **Pattern**: Test user workflows end-to-end with real authentication

## Testing Patterns

### Vitest Configuration
- **Test runner**: Vitest with jsdom environment for React components
- **Coverage**: v8 provider with 80% threshold for lines, functions, branches, statements
- **Setup**: Global setup in `tests/setup.ts` with DOM testing library matchers
- **Config**: `vitest.config.ts` with path aliases and environment variables

### Test Organization
- **Unit tests**: `tests/unit/` - Component and utility function testing
- **Integration tests**: `tests/integration/` - API route and database integration testing
- **E2E tests**: `e2e/` - Full user journey testing with Playwright
- **Helpers**: `tests/helpers/` - Shared test utilities and mock factories

### Vitest API Patterns
```typescript
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mocking with Vitest
vi.mock('@/lib/flagsmith', () => ({
  hasFeature: vi.fn(() => Promise.resolve(false)),
  getValue: vi.fn(() => Promise.resolve('default')),
}));

// Component testing
test('renders component correctly', () => {
  render(<MyComponent />);
  expect(screen.getByRole('button')).toBeInTheDocument();
});
```

### API Testing Patterns
- **Clerk mocking**: Mock `@clerk/nextjs/server` for authentication tests
- **Supabase mocking**: Mock database operations with controlled responses  
- **MSW integration**: Service worker for external API mocking
- **Environment variables**: Test-specific values in `vitest.config.ts`

## Key Features

### Community Features
- **RSVP System**: Match viewing party confirmations at Polwarth Tavern
- **Trivia Game**: Betis & Scotland themed with 15-second timer, pointing system
- **Merchandise**: Official peña gear showcase with order system
- **Photo Gallery**: Community photo sharing with merchandise

### Data Management
- **Match Data**: Football-Data.org API integration with caching
- **User Data**: Clerk webhooks sync user profiles to Supabase
- **Admin Dashboard**: User management, match sync, contact submissions

## Documentation References

For comprehensive details, always check:
- **GEMINI.md**: Detailed project overview and improvement areas
- **Workflow Instructions**: `.github/instructions/*.md` for specific workflows
- **ADRs**: `docs/adr/` for architectural decisions
- **Feature Flags**: `docs/feature-flags.md` for complete flag documentation

## Environment Setup

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` & `CLERK_SECRET_KEY` 
- `NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID`

Optional debugging:
- `NEXT_PUBLIC_DEBUG_MODE=true`
- `NEXT_PUBLIC_FLAGSMITH_DEBUG=true`