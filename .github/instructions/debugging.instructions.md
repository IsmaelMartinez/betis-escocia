---
description: Guidelines and patterns for debugging and problem-solving.
globs:
  - "**/*.ts"
  - "**/*.tsx"
  - "**/*.js"
  - "**/*.jsx"
alwaysApply: false
---
# Debugging Workflow Instructions

## Description
This document outlines the guidelines and patterns for debugging and problem-solving, covering common pitfalls and error resolution strategies for various parts of the system.

## Relevant Files
- `src/app/error.tsx`: Next.js error boundary for application-level errors.
- `src/app/global-error.tsx`: Next.js global error boundary.
- `src/components/ErrorBoundary.tsx`: Reusable React error boundary component.
- `docs/adr/`: Architecture Decision Records, which may contain context for specific issues.
- `docs/historical/clerk-error-handling-test.md`: Historical documentation on Clerk error handling.

## Guidelines

### Common Pitfalls to Avoid
- **Strategic Task Deferral**: When encountering unexpectedly complex or time-consuming tasks, consider deferring them to focus on more manageable tasks to maintain momentum and avoid getting stuck.
- **Don't mock Clerk incorrectly** - use `getAuth()` and `currentUser()` consistently.
- **Avoid hardcoded role checks** - use `checkAdminRole()` utility.
- **Don't forget RLS** - user data requires authenticated Supabase client.
- **Test environment isolation** - use separate Flagsmith environments.
- **Always use latest stable versions** - research current library versions before implementation to ensure security, performance, and access to newest features.
- **Verify library version compatibility** - ensure that all libraries, especially those related to styling (e.g., Tailwind CSS, PostCSS) and build processes (e.g., Next.js, Storybook), are compatible with each other to avoid integration issues and unexpected behavior.

### Error Resolution Patterns

#### Clerk Authentication Issues
- **Problem**: Incorrect Clerk authentication in Next.js API routes.
- **Solution**: When retrieving user information in Next.js API routes, use `getAuth(request)` from `@clerk/nextjs/server` to reliably get the `userId` for authenticated users, even if the route is publicly accessible. This ensures the `userId` is correctly populated in database submissions.

#### Supabase Row-Level Security (RLS) Policies
- **Problem**: Unexpected `42501` errors due to RLS policies.
- **Solution**: Be mindful of RLS policies, especially when adding new columns or tables. An overly broad "deny all" policy can override more specific "allow" policies. Ensure explicit `INSERT`, `SELECT`, and `UPDATE` policies are in place for relevant roles (e.g., `anon`, `authenticated`). **Crucially, after making RLS changes, you MUST refresh the Supabase schema cache by restarting your Supabase project (e.g., via the Supabase dashboard or `docker compose restart` for local setups).**

#### Asynchronous Feature Flag Rendering
- **Problem**: Incorrect conditional rendering of UI elements based on asynchronous feature flag checks (e.g., `isFeatureEnabledAsync`).
- **Solution**: Ensure the asynchronous call is handled within a `useEffect` hook. Store the feature flag status in a component's state and use that state for conditional rendering. Directly calling asynchronous functions in the render method will lead to incorrect behavior as the Promise object itself is truthy, not its resolved value.

#### Trivia Game Database Relationships
- **Problem**: Empty answer arrays in trivia game.
- **Solution**: When populating trivia answers, ensure proper UUID relationships between `trivia_questions` and `trivia_answers` tables. Empty answer arrays typically indicate missing or incorrect foreign key relationships. Always verify question UUIDs exist before inserting corresponding answers.

#### Timer Component Type Safety
- **Problem**: Type safety issues with reusable timer components like `GameTimer`.
- **Solution**: Ensure proper TypeScript types for props. Use specific types like `number` instead of `any` for properties like `resetTrigger` to maintain type safety and prevent runtime errors.

#### `react/no-unescaped-entities` in Storybook `Page.tsx`
- **Problem**: `react/no-unescaped-entities` error in `src/stories/Page.tsx`.
- **Solution**: The error can be resolved by escaping double quotes within text content using `&quot;` (e.g., changing `"args"` to `&quot;args&quot;`). This is a lower concern as it primarily affects Storybook build/development time.

### Troubleshooting Sections in Existing Documentation
- Refer to `docs/historical/clerk-error-handling-test.md` for specific Clerk error handling scenarios.
- Consult relevant ADRs in `docs/adr/` for architectural decisions that might impact debugging.


