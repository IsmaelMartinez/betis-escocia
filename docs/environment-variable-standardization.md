# Environment Variable Standardization Plan

## Next.js Environment Variable Behavior

### `NEXT_PUBLIC_` Prefix

- **Exposed to client-side**: Variables are available in browser JavaScript
- **Build-time replacement**: Values are embedded in the bundle at build time
- **Use for**: Public API keys, feature flags, public URLs, client configuration

### No Prefix (Server-only)

- **Server-side only**: Never exposed to the client
- **Runtime access**: Available only in server-side code (API routes, middleware, SSR)
- **Use for**: Secret keys, database credentials, webhook secrets

## Current Issues and Standardization

### 1. Clerk Configuration

**Issue**: Mixed usage of `CLERK_PUBLISHABLE_KEY` vs `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`

**Decision**: Use `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY` everywhere

- Clerk's publishable key is meant to be public (client-side)
- Follows Next.js conventions
- Matches Clerk's official documentation

**Changes needed**:

- GitHub Actions workflow
- Any server-side code incorrectly using the unprefixed version

### 2. Flagsmith Configuration

**Current**: All properly use `NEXT_PUBLIC_` prefix ✅

- Client-side feature flag evaluation requires public access

### 3. Supabase Configuration

**Current**: All properly use `NEXT_PUBLIC_` prefix ✅

- Anon key and URL are meant to be public

### 4. Site Configuration

**Current**: Properly uses `NEXT_PUBLIC_SITE_URL` ✅

## Standardized Environment Variable List

### Client-side (NEXT_PUBLIC_ prefix)

```bash
# Authentication - Public keys only
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...

# Database - Public configuration only
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Feature Flags - Client-side evaluation
NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID=ser_...
NEXT_PUBLIC_FLAGSMITH_API_URL=https://edge.api.flagsmith.com/api/v1/
NEXT_PUBLIC_FLAGSMITH_TIMEOUT=2000
NEXT_PUBLIC_FLAGSMITH_CACHE_TTL=60000
NEXT_PUBLIC_FLAGSMITH_SKIP_API=false
NEXT_PUBLIC_FLAGSMITH_OFFLINE=false
NEXT_PUBLIC_FLAGSMITH_DEBUG=true

# Site Configuration
NEXT_PUBLIC_SITE_URL=https://betis-escocia.vercel.app
NEXT_PUBLIC_VERCEL_URL=betis-escocia.vercel.app

# Feature Toggles
NEXT_PUBLIC_FEATURE_CLERK_AUTH=true
NEXT_PUBLIC_DEBUG_MODE=true

# External Services
NEXT_PUBLIC_SENTRY_DSN=https://...
NEXT_PUBLIC_SENTRY_RELEASE=betis-escocia@0.1.0
```

### Server-side Only (No prefix)

```bash
# Authentication - Secret keys
CLERK_SECRET_KEY=sk_test_...
CLERK_WEBHOOK_SECRET=whsec_...

# Database - Service role (admin access)
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# External APIs - Secret keys
FOOTBALL_DATA_API_KEY=...
API_FOOTBALL_KEY=...

# Testing - Credentials
CLERK_TEST_EMAIL=test_user@...
CLERK_TEST_PASSWORD=...
CLERK_TEST_USER_ID=user_...

# Monitoring
SENTRY_DSN=https://...
SENTRY_AUTH_TOKEN=...
SENTRY_ORG=...
SENTRY_PROJECT=...

# Development
NODE_ENV=development
```

## Security Guidelines

1. **Never put secrets in NEXT_PUBLIC_ variables** - they will be exposed to all users
2. **Use NEXT_PUBLIC_ only when client-side access is required**
3. **Publishable keys vs Secret keys**: Publishable keys can be public, secret keys must be server-only
4. **Feature flags**: Use NEXT_PUBLIC_ for client-side evaluation, server-only for sensitive features

## Implementation Priority

1. **High Priority**: Fix GitHub Actions workflow (security risk)
2. **Medium Priority**: Update documentation and examples
3. **Low Priority**: Verify all code uses correct conventions
