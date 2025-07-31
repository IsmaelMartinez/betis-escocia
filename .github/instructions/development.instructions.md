---
description: Guidelines and patterns for code development workflows.
globs:
  - "src/**/*.ts"
  - "src/**/*.tsx"
  - "src/**/*.js"
  - "src/**/*.jsx"
alwaysApply: false
---
# Development Workflow Instructions

## Description
This document outlines the guidelines and patterns for the code development workflow, covering architectural decisions, integration patterns, and component development.

## Relevant Files
- `src/app/`: Next.js App Router structure for pages and API routes.
- `src/components/`: Reusable React components.
- `src/lib/`: Utility functions, API clients (Supabase, Flagsmith), and authentication helpers.
- `docs/adr/`: Architecture Decision Records.
- `src/lib/flagsmith/`: Feature flag management system.
- `src/lib/supabase.ts`: Database client and type definitions.
- `src/lib/adminApiProtection.ts`: API security utilities.
- `.storybook/`: Storybook configuration files.
- `src/components/**/*.stories.tsx`: Storybook stories for components.

## Guidelines

### Critical Architecture Patterns

#### Feature Flag System (Flagsmith)
- **All features disabled by default** - requires explicit activation in Flagsmith dashboard.
- **Never use environment variables for new flags** - migrate to Flagsmith API.
- **Pattern**: Check flags with `await hasFeature('flag-name')` or `await getValue('flag-name')`.
- **Debugging**: Enable with `NEXT_PUBLIC_FLAGSMITH_DEBUG=true`.
- **Config required**: `NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID` (starts with `ser_` in production).
- **Reference**: For more details, consult `docs/adr/004-flagsmith-feature-flags.md`.

#### Authentication Flow (Clerk + Supabase)
- **Dual pattern**: Anonymous submissions + authenticated user management.
- **Server-side**: Always use `getAuth()` and `currentUser()` for metadata access.
- **API protection**: Import `checkAdminRole()` from `@/lib/adminApiProtection`.
- **Role hierarchy**: `admin` > `moderator` > `user` (stored in `publicMetadata.role`).
- **Token passing**: Use `getAuthenticatedSupabaseClient(clerkToken)` for Row Level Security (RLS).
- **Reference**: For more details, consult `docs/adr/001-clerk-authentication.md` and `docs/adr/006-clerk-supabase-jwt-integration.md`.

#### API Route Patterns
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

#### Database Integration (Supabase)
- **RLS enabled** on all user tables - always use authenticated client for user data.
- **User linking**: Automatic email-based association via Clerk webhooks.
- **Cache strategy**: Use `classification_cache` table pattern for external API data.
- **Cleanup**: Implement TTL patterns (see `cleanup_old_rsvps()` function).
- **Reference**: For more details, consult `docs/adr/003-supabase-database.md` and `docs/adr/007-clerk-webhooks-for-data-sync.md`.

### Component & Page Patterns

#### Storybook for Component Development and Testing
- **Purpose**: Storybook is used for developing, documenting, and testing UI components in isolation.
- **Component Development**: Create stories (`.stories.tsx`) for each component to showcase its different states and variations.
- **UI Testing**: Leverage Storybook's integration with Vitest (`@storybook/addon-vitest`) for comprehensive component testing, including visual regression testing and interaction testing.
- **Usage**: Run `npm run storybook` to start the Storybook development server.
- **Reference**: For more details on Storybook v9 migration and usage, consult `docs/adr/010-storybook-v9-migration.md` and `docs/storybook-guide.md`.

#### Secure Component Pattern
```tsx
import { hasFeature } from "@/lib/flagsmith";

export default async function MyComponent() {
  const isEnabled = await hasFeature("my-feature-flag");
  if (!isEnabled) return null;

  return <div>Feature content</div>;
}
```

#### Mobile-First Styling
- **Always start with mobile** breakpoints, scale up.
- **Betis branding**: `bg-gradient-to-r from-green-600 to-green-700` (#00A651).
- **Gold accents**: `text-yellow-400` for highlights.
- **Responsive navigation**: Hamburger menu pattern in `components/Layout.tsx`.