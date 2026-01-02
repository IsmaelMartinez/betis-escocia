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

## Architecture Overview

### Core Technology Stack

- **Frontend**: Next.js 15 App Router, React 19, TypeScript
- **Styling**: Tailwind CSS 4 with custom Betis branding
- **Database**: Supabase (PostgreSQL) with Row Level Security
- **Authentication**: Clerk with role-based permissions
- **Feature Flags**: Environment variables for feature rollouts
- **Testing**: Vitest + Playwright + Storybook v10

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
- **Configuration**: Set `NEXT_PUBLIC_FEATURE_*=true` to enable disabled-by-default features
- **Location**: `src/lib/featureFlags.ts`
- **Enabled by default**: Nosotros, Únete (Join), Soylenti (rumors)
- **Disabled by default**: RSVP, Contacto, Clasificación, Partidos, Galería, Clerk Auth, Debug Info
- **Development mode**: No caching - changes to `.env.local` apply immediately
- **Documentation**: See `docs/adr/004-feature-flags.md`

### Authentication Flow (Clerk + Supabase)

- **Dual mode**: Anonymous submissions + authenticated user management
- **API Protection**: Use `checkAdminRole()` from `@/lib/adminApiProtection`
- **Role hierarchy**: `admin` > `moderator` > `user` (in `publicMetadata.role`)
- **Database integration**: `getAuthenticatedSupabaseClient(clerkToken)` for RLS
- **Documentation**: See `docs/adr/001-clerk-authentication.md`

### Database Patterns (Supabase)

- **RLS enabled**: Always use authenticated client for user data
- **User data**: Anonymous and authenticated submissions stored separately
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
- **Documentation**: See `docs/adr/011-admin-notifications.md`

## Component Development

### Storybook Integration

- **Purpose**: Component development, documentation, and testing
- **Version**: v9.1.1 with Vitest addon integration
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
import { hasFeature } from "@/lib/featureFlags";

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
import { contactSchema } from "@/lib/schemas/contact";

// POST - Submit contact form
export const POST = createApiHandler({
  auth: "none", // 'none' | 'user' | 'admin' | 'optional'
  schema: contactSchema, // Zod schema for validation
  handler: async (validatedData, context) => {
    // validatedData is type-safe and validated
    // context provides user info, request, supabase clients
    const { name, email } = validatedData;

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

**✅ Complete**: All standard API routes now use `createApiHandler`. The legacy pattern is only used for specialized endpoints like:

- `/api/notifications/trigger` - SSE endpoint for real-time notifications

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
vi.mock('@/lib/featureFlags', () => ({
  hasFeature: vi.fn(() => true),
  getFeatureFlags: vi.fn(() => ({ showClasificacion: true })),
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

- **RSVP System**: Embedded widgets with expandable forms for match viewing confirmations at Polwarth Tavern
- **Trivia Game**: Betis & Scotland themed with 15-second timer, pointing system
- **Photo Gallery**: Community photo sharing

### Data Management

- **Match Data**: Football-Data.org API integration with caching
- **User Data**: Clerk authentication with separate anonymous/authenticated submissions
- **Admin Dashboard**: Match sync, contact submissions management
- **User Management**: Handled directly through Clerk dashboard or API
- **Push Notifications**: Real-time admin notifications for RSVP and contact submissions

## Admin Panel Architecture

### Current Structure (Post User Management Removal)

The admin panel (`/admin`) provides a streamlined interface for content management with three main sections:

- **Dashboard**: Overview with statistics, recent RSVPs, and contact submissions
- **Partidos (Matches)**: Complete match management including creation, editing, deletion, and sync
- **Contactos (Contacts)**: Contact form submissions management with status filtering

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

## Trivia Game Implementation

### Architecture (2025 Update)

- **State**: Streamlined to three core variables
- **Component**: Single `TriviaPage` component
- **API**: Single `/api/trivia` endpoint with query parameters
- **Performance**: 65% faster API responses, 85% less data transfer per request

### Database Design

- **Tables**: `trivia_questions`, `trivia_answers` with proper UUID relationships
- **Data Structure**: Questions with multiple choice answers, correct answer flagging
- **Categories**: Real Betis history, Scottish football, general knowledge
- **Optimization**: Direct database randomization with `ORDER BY RANDOM() LIMIT 5`

### Game Mechanics

- **Format**: 5-question trivia format with daily play limitation
- **Timer**: Simple 15-second countdown per question using `setTimeout`
- **Scoring**: Percentage-based scoring system with immediate feedback
- **Engagement**: "Once per day" messaging encourages regular participation
- **State Machine**: Clear transitions: `idle → loading → playing → feedback → completed`

### Technical Implementation

- **Frontend**: Single consolidated component (`src/app/trivia/page.tsx`) with inline timer/score
- **API**: Consolidated endpoint `/api/trivia?action=questions|submit|score|total`
- **State Management**: 3-variable system: `gameState`, `currentData`, `error`
- **Utilities**: Shared functions in `/src/lib/trivia/utils.ts` for common operations
- **Performance Tracking**: Built-in monitoring with `TriviaPerformanceTracker`
- **Error Handling**: Structured errors with context using `TriviaError` class

### Key Patterns for Development

```typescript
// Simplified state system (USE THIS PATTERN)
const [gameState, setGameState] = useState<GameState>('loading');
const [currentData, setCurrentData] = useState<CurrentData>({ /* consolidated */ });
const [error, setError] = useState<string | null>(null);

// Consolidated API usage
GET /api/trivia?action=questions   // Get questions (default)
POST /api/trivia?action=submit     // Submit score (default)
GET /api/trivia?action=total       // Get total score

// State machine transitions (FOLLOW THIS PATTERN)
const handleAnswerClick = () => {
  setCurrentData(prev => ({ ...prev, selectedAnswer: answerId }));
  setGameState('feedback');
  setTimeout(() => goToNextQuestion(), 2000);
};
```

## Soylenti Implementation

The Soylenti feature provides AI-analyzed transfer rumors from RSS feeds with player tracking. The page shows ONLY transfer rumors (filtered server-side) - "Soylenti" means "rumors" in Turkish.

### Architecture

The feature uses a consolidated architecture with shared code:

- **Types**: `src/types/soylenti.ts` - Shared types (Rumor, PlayerInfo, BetisNewsWithPlayers)
- **Utilities**: `src/lib/soylenti/utils.ts` - Shared utilities (isTransferRumor, getProbabilityColor, formatSoylentiDate)
- **Queries**: `src/lib/soylenti/queries.ts` - Consolidated database queries with optimized joins
- **Server Actions**: `src/app/soylenti/actions.ts` - Server action wrappers

### Key Patterns

The `ai_probability` field comes from the database as a string (NUMERIC type) - always use `Number()` conversion before comparisons. The semantics are: `null` = unanalyzed, `0` = non-transfer news, `>0` = transfer rumor with credibility score (1-100).

All public queries filter for rumors only using `.gt("ai_probability", 0)` - this includes the initial page load, pagination, and player filtering. General news (ai_probability = 0 or null) is only accessible in the admin panel.

Color thresholds for probability badges: 70+ = green (high credibility), 40-69 = gold (medium), <40 = gray (low).

The `fetchRumorsByPlayer` function uses an optimized single query with `!inner` joins instead of 3 sequential queries.

### Database Tables

The feature uses three tables: `betis_news` (main news storage), `players` (normalized player tracking), and `news_players` (junction table with roles: target, departing, mentioned).

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

- **Developer Guide**: `docs/developer-guide.md` for complete development guide
- **Testing Guide**: `docs/testing-guide.md` for testing strategies and patterns
- **ADRs**: `docs/adr/` for architectural decisions
- **Security**: `docs/security/` for security implementation details

## Environment Setup

Required environment variables:

- `NEXT_PUBLIC_SUPABASE_URL` & `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` & `CLERK_SECRET_KEY`

Optional feature flags (only for disabled/experimental features):

- `NEXT_PUBLIC_FEATURE_GALERIA=false`
- `NEXT_PUBLIC_FEATURE_REDES_SOCIALES=false`
- `NEXT_PUBLIC_FEATURE_DEBUG_INFO=false`

Optional debugging:

- `NEXT_PUBLIC_DEBUG_MODE=true`
