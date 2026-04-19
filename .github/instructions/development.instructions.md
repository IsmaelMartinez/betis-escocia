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

- `src/lib/features/featureFlags.ts`: Environment variable feature flag system
- `src/lib/auth/adminApiProtection.ts`: API security utilities
- `src/lib/api/supabase.ts`: Database client and type definitions

## Guidelines

### Critical Architecture Patterns

#### Feature Flag System (Environment Variables)

> See [CLAUDE.md](../../CLAUDE.md) for complete implementation details

- **Pattern**: `hasFeature('flag-name')` (synchronous)
- **Location**: `src/lib/features/featureFlags.ts`
- **Core features enabled by default**: Nosotros, Únete (Join), Clasificación, Partidos, Jugadores Históricos, Efemérides

#### Authentication Flow (Clerk + Supabase)

> See [CLAUDE.md](../../CLAUDE.md) for complete authentication patterns

- **API protection**: Use `checkAdminRole()` from `@/lib/auth/adminApiProtection`
- **Role hierarchy**: `admin` > `moderator` > `user`
- **Database**: Use `getAuthenticatedSupabaseClient(clerkToken)` for RLS

#### API Route Patterns

```typescript
// Standard protected API route structure
import { getAuth, currentUser } from "@clerk/nextjs/server";
import { checkAdminRole } from "@/lib/auth/adminApiProtection";

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
- **Client location**: `src/lib/api/supabase.ts`

### Component & Page Patterns

#### Storybook for Component Development and Testing

- **Purpose**: Storybook is used for developing, documenting, and testing UI components in isolation.
- **Component Development**: Create stories (`.stories.tsx`) for each component to showcase its different states and variations.
- **UI Testing**: Leverage Storybook's integration with Vitest (`@storybook/addon-vitest`) for comprehensive component testing, including visual regression testing and interaction testing.
- **Usage**: Run `npm run storybook` to start the Storybook development server.
- **Reference**: See ADR `docs/adr/009-storybook.md` and the Storybook workflow notes in `docs/storybook/`.

#### Secure Component Pattern

```tsx
import { hasFeature } from "@/lib/features/featureFlags";

export default function MyComponent() {
  const isEnabled = hasFeature("my-feature-flag");
  if (!isEnabled) return null;

  return <div>Feature content</div>;
}
```

#### Mobile-First Styling

- **Always start with mobile** breakpoints, scale up.
- **Betis branding**: Use branded classes like `bg-betis-verde` / `bg-betis-verde-dark` (never generic Tailwind greens). See `docs/design-system.md` for the full palette.
- **Gold accents**: `text-betis-oro` for highlights on dark backgrounds.
- **Responsive navigation**: Hamburger menu pattern in `src/components/layout/Layout.tsx`.
