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

# Feature Flags
NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID=your_flagsmith_env_id
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
- **Flagsmith** for secure-by-default feature flags
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
- **Feature flags control all functionality** - disabled by default
- **Dual authentication mode** - anonymous + authenticated users
- **Mobile-first responsive design** with Betis colors (#00A651)
- **Secure-by-default** architecture with RLS and role-based access

## Feature Flags

The project uses **Flagsmith** for dynamic feature control:

```typescript
import { hasFeature } from '@/lib/flagsmith';

// Check if feature is enabled
const isEnabled = await hasFeature('show-admin');
if (!isEnabled) return null;

// Get feature value
const maxItems = await getValue('max-gallery-items', 10);
```

### Key Flags
- `show-admin` - Admin dashboard access
- `show-rsvp` - RSVP system  
- `show-trivia-game` - Trivia functionality
- `show-galeria` - Photo gallery
- `show-clerk-auth` - Authentication features

### Setup
1. Create account at [flagsmith.com](https://flagsmith.com)
2. Get environment ID from dashboard
3. Add to `.env.local`: `NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID=your_id`

### Debugging
```bash
# Enable debug mode
NEXT_PUBLIC_DEBUG_MODE=true
NEXT_PUBLIC_FLAGSMITH_DEBUG=true
```

## Authentication & Roles

### Admin Setup
1. Access Clerk dashboard at dashboard.clerk.com
2. Navigate to Users → select user → Metadata tab
3. Add metadata: `role: admin`
4. User gains admin access on next login

### User Types
- **Admin**: Full dashboard access, user management, push notifications
- **Regular**: Personal dashboard with RSVP/contact history
- **Anonymous**: Can submit RSVPs and contact forms

### Implementation Pattern
```typescript
import { checkAdminRole } from '@/lib/adminApiProtection';

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
import { test, expect } from '@playwright/test';

test('admin can access dashboard', async ({ page }) => {
  // Pre-configured admin auth in playwright/global.setup.ts
  await page.goto('/admin');
  await expect(page.getByRole('heading', { name: 'Admin Dashboard' })).toBeVisible();
});
```

#### Component Development (Storybook)
- **Location**: Alongside components as `*.stories.tsx`
- **Version**: Storybook v9 with Vitest integration
- **Pattern**: Isolated component development and documentation

```typescript
import type { Meta, StoryObj } from '@storybook/react';
import { MyComponent } from './MyComponent';

const meta: Meta<typeof MyComponent> = {
  title: 'UI/MyComponent',
  component: MyComponent,
  tags: ['autodocs'],
};

export default meta;
type Story = StoryObj<typeof MyComponent>;

export const Default: Story = {
  args: {
    variant: 'primary',
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
import { hasFeature } from '@/lib/flagsmith';

export default async function FeatureComponent() {
  const isEnabled = await hasFeature('my-feature');
  if (!isEnabled) return null;
  
  return <div>Feature content</div>;
}
```

#### Date Handling Patterns

The project uses **date-fns** directly for all date operations with **Spanish locale**. No custom date utilities are used.

##### Basic Date Formatting
```typescript
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { DATE_FORMAT, DATETIME_FORMAT, TIME_FORMAT } from '@/lib/constants/dateFormats';

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
import { isAfter, isBefore, compareAsc, compareDesc, getYear, formatISO } from 'date-fns';

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
import { formatISO, parseISO, format } from 'date-fns';

// Convert ISO string to datetime-local input format
const dateTimeLocalValue = format(parseISO(match.date_time), "yyyy-MM-dd'T'HH:mm");

// Convert form input back to ISO string for database
const submitData = {
  date_time: formatISO(parseISO(formData.date_time))
};
```

##### Available Format Constants
```typescript
// From @/lib/constants/dateFormats
export const DATE_FORMAT = 'd MMM yyyy';        // "13 ene 2025"
export const DATETIME_FORMAT = 'd MMM yyyy, HH:mm'; // "13 ene 2025, 15:30"
export const TIME_FORMAT = 'HH:mm';             // "15:30"
```

##### Spanish Locale Notes
- Always import and use Spanish locale: `import { es } from 'date-fns/locale'`
- Month names are localized: "enero", "febrero", etc.
- Abbreviated months: "ene", "feb", etc.
- Format patterns use Spanish conventions

#### Secure API Pattern
```typescript
import { checkAdminRole } from '@/lib/adminApiProtection';
import { getAuthenticatedSupabaseClient } from '@/lib/supabase';
import { z } from 'zod';

// Define validation schema
const requestSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
});

export async function POST(request: NextRequest) {
  const { user, isAdmin, error } = await checkAdminRole();
  if (!isAdmin) return NextResponse.json({ error }, { status: 401 });
  
  // Validate input with Zod
  const body = await request.json();
  const validation = requestSchema.safeParse(body);
  if (!validation.success) {
    const errorMessages = validation.error.issues.map(issue => issue.message);
    return NextResponse.json({ error: errorMessages.join(', ') }, { status: 400 });
  }
  
  const { getToken } = getAuth(request);
  const token = await getToken({ template: 'supabase' });
  const supabase = getAuthenticatedSupabaseClient(token);
  
  // Implementation with validated data: validation.data
}
```

#### Input Validation Pattern
```typescript
// Create reusable schemas in src/lib/schemas/
import { z } from 'zod';

export const contactFormSchema = z.object({
  name: z.string().min(2, 'Mínimo 2 caracteres').max(50),
  email: z.string().email('Email inválido'),
  message: z.string().min(5).max(500),
});

// Use in API routes for consistent validation
const validation = contactFormSchema.safeParse(requestData);
if (!validation.success) {
  return NextResponse.json({
    error: validation.error.issues.map(issue => issue.message).join(', ')
  }, { status: 400 });
}
```

## Push Notifications

Admin users receive real-time notifications for RSVP submissions and contact forms.

### Architecture
- **Web Push API** with service worker
- **Database preferences** in `notification_preferences` table
- **Admin-only access** via role verification
- **Non-blocking integration** - failures don't impact core functionality

### Setup
Notifications require HTTPS (localhost exception applies). Users must grant browser permission.

## Key Features

### RSVP System
"¿Vienes al Polwarth?" - Match viewing party confirmations at Polwarth Tavern

### Trivia Game
- Dual-themed: Real Betis + Scotland questions
- 15-second timer with real-time scoring
- Mobile-optimized for pub gameplay

### Admin Dashboard
- User management with push notifications
- RSVP and contact form oversight
- Real-time community activity monitoring

### Merchandise Showcase
Official peña gear with integrated photo gallery

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
- Check Flagsmith environment ID
- Enable debug mode: `NEXT_PUBLIC_FLAGSMITH_DEBUG=true`
- Verify network connectivity to Flagsmith API

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
- [ADR-004: Flagsmith Feature Flags](adr/004-flagsmith-feature-flags.md) - Feature flag provider selection
- [ADR-016: Admin Push Notifications](adr/016-admin-push-notifications.md) - Real-time notification system

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