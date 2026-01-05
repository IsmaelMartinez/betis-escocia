# Developer Guide

Complete guide for developing the Peña Bética Escocesa website.

## Quick Start

### Prerequisites

- Node.js 22+
- npm or yarn
- Git

### Setup

```bash
# Clone and install
git clone https://github.com/yourusername/pena-betica-escocesa.git
cd pena-betica-escocesa
npm install

# Environment setup
cp .env.example .env.local
```

Required environment variables:

```bash
# Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key

# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret

# Feature Flags (optional - only for experimental features)
# NEXT_PUBLIC_FEATURE_DEBUG_INFO=true
```

### Start Development

```bash
npm run dev  # Open http://localhost:3000
```

## Architecture Overview

### Core Stack

- **Next.js 15** with App Router and TypeScript
- **Supabase** for database with Row Level Security
- **Clerk** for authentication with role-based permissions
- **Environment Variables** for secure rollout feature flags
- **Tailwind CSS 4** with Betis branding
- **Vitest + Playwright + Storybook** for testing
- **Framework-based security** with Zod validation

### Security Architecture

The application uses a **framework-first security approach**:

- **Next.js middleware** handles rate limiting and route protection
- **Content Security Policy (CSP)** configured in `next.config.js`
- **Zod schema validation** for all API input validation
- **React's built-in XSS protection** instead of custom sanitization
- **Clerk authentication** with JWT tokens for Supabase RLS

### Project Structure

```
src/
├── app/                 # Next.js App Router
│   ├── api/            # API routes
│   ├── admin/          # Admin dashboard
│   └── [pages]/        # Public pages
├── components/         # Reusable UI components
├── lib/               # Utilities and configurations
├── types/             # TypeScript definitions
└── middleware.ts      # Route protection
```

### Key Patterns

- **Feature flags control most functionality** - disabled by default
- **Dual authentication mode** - anonymous + authenticated users
- **Mobile-first responsive design** with Betis colors (#00A651)
- **Secure-by-default** architecture with RLS and role-based access

## Feature Flags

The project uses **environment variables** for simple, build-time feature control:

```typescript
import { hasFeature } from "@/lib/featureFlags";

// Check if feature is enabled (synchronous)
const isEnabled = hasFeature("show-rsvp");
if (!isEnabled) return null;
```

### Implementation

- **Simple 2-option system**: Environment variable takes precedence, otherwise use default
- **Synchronous resolution**: No async/await needed
- **Build-time configuration**: Features resolved at build time for performance

### Key Flags

- `show-rsvp` - RSVP functionality (default: disabled)
- `show-contacto` - Contact form (default: disabled)
- `show-clasificacion` - League standings (default: disabled)
- `show-partidos` - Match information (default: disabled)
- `show-clerk-auth` - Authentication features (default: disabled)
- `show-debug-info` - Debug information (default: disabled)

### Always-On Features (No Flags Needed)

- `nosotros` - About page
- `unete` - Join/membership functionality
- `soylenti` - Transfer rumors/news

### Setup

Add environment variables for experimental features only:

```bash
# Only set these to override defaults for experimental features
NEXT_PUBLIC_FEATURE_DEBUG_INFO=true
```

### Debugging

```bash
# Enable debug mode to see feature flag status
NEXT_PUBLIC_FEATURE_DEBUG_INFO=true
```

## Authentication & Roles

### Admin Setup

1. Access Clerk dashboard at dashboard.clerk.com
2. Navigate to Users → select user → Metadata tab
3. Add metadata: `role: admin`
4. User gains admin access on next login

### User Types

- **Admin**: Full dashboard access, user management
- **Regular**: Personal dashboard with RSVP/contact history
- **Anonymous**: Can submit RSVPs and contact forms

### Implementation Pattern

```typescript
import { checkAdminRole } from "@/lib/adminApiProtection";

export async function POST(request: NextRequest) {
  const { user, isAdmin, error } = await checkAdminRole();
  if (!isAdmin) return NextResponse.json({ error }, { status: 401 });

  // Admin-only logic here
}
```

## Development Workflow

### Available Scripts

```bash
npm run dev              # Start dev server with Turbopack
npm run build           # Production build
npm test                # Vitest unit/integration tests
npm run test:e2e        # Playwright E2E tests
npm run test:coverage   # Coverage report
npm run lint            # ESLint checking
npm run type-check      # TypeScript validation
npm run storybook       # Component development
npm run update-trivia   # Update trivia questions
```

### Testing Strategy

#### Unit & Integration (Vitest)

- **Location**: `tests/unit/`, `tests/integration/`
- **Config**: `vitest.config.ts` with 80% coverage threshold
- **Pattern**: Mock external services, test core logic

```typescript
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Mock external dependencies
vi.mock('@/lib/flagsmith', () => ({
  hasFeature: vi.fn(() => Promise.resolve(false)),
}));

test('renders component correctly', () => {
  render(<MyComponent />);
  expect(screen.getByRole('button')).toBeInTheDocument();
});
```

#### E2E Testing (Playwright)

- **Location**: `e2e/`
- **Config**: `playwright.config.ts`
- **Pattern**: Test complete user workflows

```typescript
import { test, expect } from "@playwright/test";

test("admin can access dashboard", async ({ page }) => {
  // Pre-configured admin auth in playwright/global.setup.ts
  await page.goto("/admin");
  await expect(
    page.getByRole("heading", { name: "Admin Dashboard" }),
  ).toBeVisible();
});
```

#### Component Development (Storybook)

- **Location**: Alongside components as `*.stories.tsx`
- **Version**: Storybook v9 with Vitest integration
- **Pattern**: Isolated component development and documentation

```typescript
import type { Meta, StoryObj } from "@storybook/react";
import { MyComponent } from "./MyComponent";

const meta: Meta<typeof MyComponent> = {
  title: "UI/MyComponent",
  component: MyComponent,
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof MyComponent>;

export const Default: Story = {
  args: {
    variant: "primary",
  },
};
```

### Database Management

#### Setup

- Run `sql/initial_setup.sql` in Supabase SQL Editor
- Creates tables, RLS policies, and cleanup functions

#### Trivia Management

```bash
npm run update-trivia  # Updates all trivia questions safely
```

### Component Development

#### Mobile-First Pattern

```typescript
// Always start mobile, scale up
<div className="p-4 md:p-6 lg:p-8">
  <h1 className="text-xl md:text-2xl lg:text-3xl text-green-600">
    Betis Content
  </h1>
</div>
```

#### Feature Flag Pattern

```typescript
import { hasFeature } from '@/lib/featureFlags';

export default function FeatureComponent() {
  const isEnabled = hasFeature('show-rsvp');
  if (!isEnabled) return null;

  return <div>Feature content</div>;
}
```

#### Date Handling Patterns

The project uses **date-fns** directly for all date operations with **Spanish locale**. No custom date utilities are used.

##### Basic Date Formatting

```typescript
import { format } from "date-fns";
import { es } from "date-fns/locale";
import {
  DATE_FORMAT,
  DATETIME_FORMAT,
  TIME_FORMAT,
} from "@/lib/constants/dateFormats";

// Using predefined format constants
const formattedDate = format(new Date(), DATETIME_FORMAT, { locale: es });
// Result: "13 ene 2025, 15:30"

const dateOnly = format(new Date(), DATE_FORMAT, { locale: es });
// Result: "13 ene 2025"

const timeOnly = format(new Date(), TIME_FORMAT, { locale: es });
// Result: "15:30"
```

##### Date Comparisons and Manipulations

```typescript
import {
  isAfter,
  isBefore,
  compareAsc,
  compareDesc,
  getYear,
  formatISO,
} from "date-fns";

// Date comparisons
const isUpcoming = isAfter(new Date(match.date), new Date());
const isPast = isBefore(new Date(match.date), new Date());

// Sorting by date
matches.sort((a, b) => compareAsc(new Date(a.date), new Date(b.date))); // ascending
matches.sort((a, b) => compareDesc(new Date(a.date), new Date(b.date))); // descending

// Get year from date
const currentYear = getYear(new Date());

// ISO formatting for API calls
const isoDate = formatISO(new Date()); // "2025-01-13T15:30:00Z"
```

##### Form Date Handling

```typescript
import { formatISO, parseISO, format } from "date-fns";

// Convert ISO string to datetime-local input format
const dateTimeLocalValue = format(
  parseISO(match.date_time),
  "yyyy-MM-dd'T'HH:mm",
);

// Convert form input back to ISO string for database
const submitData = {
  date_time: formatISO(parseISO(formData.date_time)),
};
```

##### Available Format Constants

```typescript
// From @/lib/constants/dateFormats
export const DATE_FORMAT = "d MMM yyyy"; // "13 ene 2025"
export const DATETIME_FORMAT = "d MMM yyyy, HH:mm"; // "13 ene 2025, 15:30"
export const TIME_FORMAT = "HH:mm"; // "15:30"
```

##### Spanish Locale Notes

- Always import and use Spanish locale: `import { es } from 'date-fns/locale'`
- Month names are localized: "enero", "febrero", etc.
- Abbreviated months: "ene", "feb", etc.
- Format patterns use Spanish conventions

## API Route Patterns

### Modern Abstracted API Pattern (Recommended)

Use the `createApiHandler` utility for consistent, type-safe API development:

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
    const { name, email, message } = validatedData;

    // Use context.supabase for database operations
    const { data, error } = await context.supabase
      .from("contact_submissions")
      .insert([{ name, email, message }])
      .select()
      .single();

    if (error) throw new Error("Failed to save contact submission");

    return {
      success: true,
      message: "Contacto enviado correctamente",
      id: data.id,
    };
  },
});

// GET with query parameters
export const GET = createApiHandler({
  auth: "admin",
  handler: async (_, context) => {
    const { searchParams } = new URL(context.request.url);
    const category = searchParams.get("category");

    const { data, error } = await context.supabase
      .from("items")
      .select("*")
      .eq(category ? "category" : "", category || "");

    if (error) throw new Error("Failed to fetch items");

    return data;
  },
});
```

#### Benefits of `createApiHandler`

- **Automatic authentication** handling based on requirements
- **Built-in Zod validation** with Spanish error messages
- **Consistent error handling** and response formatting
- **Type-safe context** with authenticated Supabase clients
- **Standardized responses** - all success responses wrapped in `{ success: true, data: ... }`

#### Authentication Types

- `'none'` - No authentication required (anonymous access)
- `'optional'` - Include user info if authenticated, allow anonymous
- `'user'` - Require authenticated user
- `'admin'` - Require admin role

#### Context Object

The handler receives a rich context object:

```typescript
interface ApiContext {
  request: NextRequest;
  user?: { id: string; isAdmin: boolean };
  userId?: string;
  clerkToken?: string;
  authenticatedSupabase?: SupabaseClient; // Only if authenticated
  supabase: SupabaseClient; // Authenticated or anonymous client
}
```

### Legacy Protected API Pattern

**Note**: This pattern is deprecated for new development. Use `createApiHandler` instead.

```typescript
import { checkAdminRole } from "@/lib/adminApiProtection";
import { getAuthenticatedSupabaseClient } from "@/lib/supabase";
import { z } from "zod";

// Define validation schema
const requestSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  const { user, isAdmin, error } = await checkAdminRole();
  if (!isAdmin) return NextResponse.json({ error }, { status: 401 });

  // Manual validation with Zod
  const body = await request.json();
  const validation = requestSchema.safeParse(body);
  if (!validation.success) {
    const errorMessages = validation.error.issues.map((issue) => issue.message);
    return NextResponse.json(
      { error: errorMessages.join(", ") },
      { status: 400 },
    );
  }

  const { getToken } = getAuth(request);
  const token = await getToken({ template: "supabase" });
  const supabase = getAuthenticatedSupabaseClient(token);

  // Implementation with validated data: validation.data
}
```

### When to Use Each Pattern

#### Use `createApiHandler` for:

- **Simple CRUD operations** with standard validation
- **New API routes** being developed
- **Routes requiring consistent error handling**
- **APIs with straightforward authentication needs**

#### Use Legacy Pattern ONLY for:

- **Server-Sent Events (SSE)** endpoints that return streaming responses
- **Webhook endpoints** requiring custom signature validation
- **External integrations** with very specific protocol requirements

#### Examples of Remaining Legacy Routes:

- `/api/clerk/webhook` - Webhook with Svix signature verification
- Routes requiring Response streaming or non-JSON responses

⚠️ **Important**: All standard API routes should use `createApiHandler`. The legacy pattern is only for specialized endpoints that cannot work with the standardized response format.

### Schema Development

Create reusable validation schemas in `src/lib/schemas/`:

```typescript
import { z } from "zod";

export const contactFormSchema = z.object({
  name: z.string().min(2, "Mínimo 2 caracteres").max(50),
  email: z.string().email("Email inválido"),
  message: z.string().min(5).max(500),
});

// Query parameter schemas
export const queryParamsSchema = z.object({
  category: z.string().optional(),
  featured: z.string().optional(),
  limit: z.coerce.number().min(1).max(100).optional(),
});
```

### Testing API Routes

#### Testing `createApiHandler` Routes

When testing routes that use `createApiHandler`, remember the standardized response format:

```typescript
import { describe, it, expect, vi } from "vitest";

// Mock external dependencies
vi.mock("@/lib/supabase", () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() =>
            Promise.resolve({ data: { id: 1 }, error: null }),
          ),
        })),
      })),
    })),
  },
}));

test("POST contact form with createApiHandler", async () => {
  const validData = {
    name: "Test User",
    email: "test@example.com",
    message: "Test message that meets minimum length",
  };

  const response = await POST(mockRequest);
  const data = await response.json();

  expect(response.status).toBe(200);
  expect(data.success).toBe(true);
  expect(data.data).toBeDefined(); // Data wrapped in success response
});

// Test validation errors
test("returns validation error for invalid data", async () => {
  const invalidData = {
    name: "T", // Too short
    email: "invalid-email",
    message: "Hi", // Too short
  };

  const response = await POST(mockRequest);
  const data = await response.json();

  expect(response.status).toBe(400);
  expect(data.success).toBe(false);
  expect(data.error).toBe("Datos de entrada inválidos");
  expect(data.details).toBeInstanceOf(Array);
});
```

#### Key Testing Changes

- **Response format**: All successful responses are wrapped in `{ success: true, data: ... }`
- **Error messages**: Validation errors return "Datos de entrada inválidos" instead of specific field messages
- **Status codes**: Standardized error responses
- **Mock data**: Provide data that passes Zod validation for successful tests

## Key Features

### RSVP System

"¿Vienes al Polwarth?" - Match viewing party confirmations at Polwarth Tavern

### Trivia Game

- Dual-themed: Real Betis + Scotland questions
- 15-second timer with real-time scoring
- Mobile-optimized for pub gameplay

### Admin Dashboard

- **Player & Squad Management**: Manage current Real Betis squad, sync from Football-Data.org API
- **Formation Builder**: Create and save starting eleven formations with visual pitch
- **Player Operations**: Alias management, display names, merge duplicate players
- **User management**: Role assignment via Clerk
- **RSVP and contact form oversight**: Community engagement tracking
- **Real-time monitoring**: Community activity

See [Player Management API Documentation](api/player-management-api.md) for complete API reference.

## Troubleshooting

### Common Issues

#### Environment Variables

- Restart dev server after `.env.local` changes
- Verify all required variables are set

#### Authentication Issues

- Check Clerk dashboard configuration
- Verify API keys and middleware setup
- Ensure user has correct role metadata

#### Feature Flags Not Working

- Check environment variable names: `NEXT_PUBLIC_FEATURE_*`
- Enable debug mode: `NEXT_PUBLIC_FEATURE_DEBUG_INFO=true`
- Verify environment variables are properly loaded
- Clear Next.js cache and restart dev server

#### Database Connection

- Verify Supabase URL and keys
- Check project status in Supabase dashboard
- Review RLS policies for data access

#### Storybook Issues

- Clear cache: `rm -rf ./.storybook/cache`
- Verify Tailwind import in `.storybook/preview.ts`
- Check `main.ts` configuration for addons

## Architecture Decisions

Key technical decisions are documented in [ADRs](adr/):

- [ADR-001: Clerk Authentication](adr/001-clerk-authentication.md) - Why Clerk over alternatives
- [ADR-003: Supabase Database](adr/003-supabase-database.md) - Database choice and patterns
- [ADR-004: Environment Variable Feature Flags](adr/004-flagsmith-feature-flags.md) - Feature flag system migration
- [ADR-011: Admin Push Notifications](adr/011-admin-notifications.md) - Deferred until live domain
- [ADR-018: Player & Squad Management](adr/018-player-squad-management.md) - Squad tracking, formations, and sync

## Contributing

### Workflow

1. Create feature branch from `main`
2. Develop with feature flags (disabled by default)
3. Write tests (unit, integration, E2E)
4. Update documentation if needed
5. Ensure all checks pass:
   ```bash
   npm run lint
   npm run type-check
   npm test
   npm run test:e2e
   npm run build
   ```
6. Submit pull request

### Code Standards

- TypeScript for type safety
- Mobile-first responsive design
- Feature flags for all new functionality
- Comprehensive testing coverage
- Framework-based security patterns
- Zod schema validation for all user input
- React XSS protection (no custom sanitization)
- Middleware-based rate limiting and authentication

---

**¡Viva er Betis manque pierda!** 🟢⚪
