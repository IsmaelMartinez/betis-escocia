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
> For complete architecture overview, see [CLAUDE.md](../../CLAUDE.md)

Key development files:
- `src/lib/flagsmith/`: Feature flag management system
- `src/lib/adminApiProtection.ts`: API security utilities  
- `src/lib/supabase.ts`: Database client and type definitions

## Guidelines

### Critical Architecture Patterns

#### Feature Flag System (Flagsmith)
> See [CLAUDE.md](../../CLAUDE.md) for complete implementation details

- **Pattern**: `await hasFeature('flag-name')` or `await getValue('flag-name')`
- **Location**: `src/lib/flagsmith/` directory
- **Core features always enabled**: RSVP, Join, Contact (no flags needed)

#### Authentication Flow (Clerk + Supabase)
> See [CLAUDE.md](../../CLAUDE.md) for complete authentication patterns

- **API protection**: Use `checkAdminRole()` from `@/lib/adminApiProtection`
- **Role hierarchy**: `admin` > `moderator` > `user` 
- **Database**: Use `getAuthenticatedSupabaseClient(clerkToken)` for RLS

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
> See [CLAUDE.md](../../CLAUDE.md) for complete database patterns

- **RLS enabled**: Always use authenticated client for user data
- **Cache strategy**: Use `classification_cache` table for external API data
- **Client location**: `src/lib/supabase.ts`

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
- **Responsive navigation**: Hamburger menu pattern in `src/components/layout/Layout.tsx`.