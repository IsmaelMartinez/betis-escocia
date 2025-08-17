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
- **Hybrid approach**: Core features (RSVP, Join, Contact) always available; optional features controlled by flags
- **Usage**: `await hasFeature('flag-name')` or `await getValue('flag-name')`
- **Environment**: `NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID` required
- **Location**: `src/lib/flagsmith/` - NOT `src/lib/flags/`
- **Always-on features**: RSVP, Únete (Join), Contacto (Contact) - no flags needed
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

### Push Notifications System
- **Admin-only**: Real-time background notifications for RSVP and contact form submissions
- **Service Worker**: Complete PWA service worker (`public/sw.js`) with background notification handling
- **SSE Integration**: Server-Sent Events for real-time notification delivery via `/api/notifications/trigger`
- **Notification Manager**: Client-side coordinator (`src/lib/notifications/notificationManager.ts`) with automatic reconnection
- **Deduplication**: Multi-layered approach (server timestamp + client localStorage) prevents duplicate notifications
- **Database preferences**: `notification_preferences` table with user control and RLS policies
- **Background operation**: Works even when admin dashboard is closed - notifications persist in system tray
- **Browser compatibility**: Full support in Chrome/Firefox/Edge, limited in Safari (HTTPS required)
- **Non-blocking**: Notification failures don't impact core RSVP/contact functionality
- **Auto-cleanup**: Server removes old notifications after 10 minutes, client after 1 hour
- **Location**: `src/lib/notifications/` for utilities, `public/sw.js` for Service Worker
- **Documentation**: See `docs/adr/016-admin-push-notifications.md`

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

### Abstracted Route Pattern (Recommended)
**Most business routes use the `createApiHandler` pattern for consistency:**

```typescript
import { createApiHandler } from '@/lib/apiUtils';
import { contactSchema } from '@/lib/schemas/contact';

// POST - Submit contact form  
export const POST = createApiHandler({
  auth: 'none', // 'none' | 'user' | 'admin' | 'optional'
  schema: contactSchema, // Zod schema for validation
  handler: async (validatedData, context) => {
    // validatedData is type-safe and validated
    // context provides user info, request, supabase clients
    const { name, email } = validatedData;
    
    return {
      success: true,
      message: 'Success message'
    };
  }
});
```

**When to use `createApiHandler`:**
- Simple CRUD operations with standard validation
- New API routes being developed  
- Routes requiring consistent error handling
- APIs with straightforward authentication needs

**When to use Legacy Pattern:**
- Complex business logic requiring specific HTTP status codes
- Multi-step validation with conditional requirements
- Routes with unique error handling needs (e.g., `/api/camiseta-voting`)
- File-based operations or external API integrations

**Note**: The `/api/camiseta-voting` endpoint should be re-implemented to use `createApiHandler` in the future. Since this feature is not yet live, we can simplify the business logic to work with the standardized pattern. This would involve breaking down the complex voting/pre-order state machine into simpler, more focused endpoints.

### Legacy Protected Route Pattern
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
**Important**: Tests need updating to work with the new `createApiHandler` pattern:

**Old Pattern (Deprecated)**:
```typescript
// ❌ Old tests mock validation functions that are no longer used
vi.spyOn(security, 'validateInputLength').mockReturnValue({ isValid: true });
vi.spyOn(security, 'validateEmail').mockReturnValue({ isValid: true });
```

**New Pattern (Required)**:
```typescript
// ✅ New tests work with Zod validation by providing valid data
const validData = {
  name: 'Test User',
  email: 'test@example.com', // Valid email format
  subject: 'Test Subject',   // Meets min length requirements
  message: 'Test message'    // Meets min length requirements
};

// Mock successful Supabase operations
(supabase.from as any).mockReturnValue({
  insert: vi.fn(() => ({
    select: vi.fn(() => ({
      single: vi.fn(() => Promise.resolve({ data: { id: 1 }, error: null }))
    }))
  }))
});
```

**Key Changes Needed**:
1. Remove mocks for `validateInputLength`, `validateEmail` 
2. Provide data that passes Zod schema validation
3. Test validation by providing invalid data that Zod will reject
4. Update expected error messages to match new abstracted responses

### Example Test
```typescript
import { describe, it, expect, vi } from 'vitest';
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

### Community Features
- **RSVP System**: Match viewing party confirmations at Polwarth Tavern
- **Trivia Game**: Betis & Scotland themed with 15-second timer, pointing system
- **Merchandise**: Official peña gear showcase with order system
- **Photo Gallery**: Community photo sharing with merchandise

### Data Management
- **Match Data**: Football-Data.org API integration with caching
- **User Data**: Clerk webhooks sync user profiles to Supabase
- **Admin Dashboard**: User management, match sync, contact submissions
- **Push Notifications**: Real-time admin notifications for RSVP and contact submissions

## Trivia Game Implementation

### Database Design
- **Tables**: `trivia_questions`, `trivia_answers` with proper UUID relationships
- **Data Structure**: Questions with multiple choice answers, correct answer flagging
- **Categories**: Real Betis history, Scottish football, general knowledge

### Game Mechanics
- **Format**: 3-question trivia format
- **Timer**: 15-second countdown per question
- **Scoring**: Percentage-based scoring system with immediate feedback
- **Engagement**: "Once per day" messaging encourages regular participation

### Technical Implementation
- **Frontend**: Game timer component (`GameTimer.tsx`), trivia page with results
- **API**: RESTful endpoints for questions/answers with error handling
- **Feature Flag**: Controlled by `show-trivia-game` flag
- **Database**: Proper indexing for question randomization and performance

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
- **Trivia Enhancements**: Leaderboards, expanded question database
- **Social Features**: Enhanced photo sharing, match predictions
- **Internationalization**: Multi-language support if needed

## Documentation References

For comprehensive details, always check:
- **Developer Guide**: `docs/DEVELOPER_GUIDE.md` for complete development guide
- **Testing Guide**: `docs/TESTING_GUIDE.md` for testing strategies and patterns  
- **ADRs**: `docs/adr/` for architectural decisions
- **Security**: `docs/security/` for security implementation details

## Environment Setup

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` & `CLERK_SECRET_KEY` 
- `NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID`

Optional debugging:
- `NEXT_PUBLIC_DEBUG_MODE=true`
- `NEXT_PUBLIC_FLAGSMITH_DEBUG=true`