# ADR-004: Feature Flags (Environment Variables)

## Status

Accepted

## Decision

**Environment variable-based feature flags** for simple feature control.

## Why Environment Variables

After evaluating Flagsmith (too complex for our needs), we settled on simple environment variables:

- **Simplicity**: Synchronous resolution, no external dependencies
- **Performance**: Cached in production, no caching in development for hot reload support
- **Cost**: Free, no external service
- **Sufficient**: Our scale doesn't need real-time flag updates

## Implementation

```typescript
// src/lib/featureFlags.ts
import { hasFeature } from "@/lib/featureFlags";

// Synchronous check
if (hasFeature("show-rsvp")) {
  // Feature enabled
}
```

## Default Feature States

### Enabled by Default (Core Features)

- `show-nosotros` - About page
- `show-unete` - Join functionality

### Disabled by Default (Set `=true` to Enable)

- `show-rsvp` - RSVP functionality
- `show-contacto` - Contact form
- `show-clasificacion` - League standings
- `show-partidos` - Match information
- `show-clerk-auth` - Authentication UI
- `show-debug-info` - Debug panel

## Environment Variable Examples

```bash
# Enable Phase 2 features
NEXT_PUBLIC_FEATURE_RSVP=true
NEXT_PUBLIC_FEATURE_CONTACTO=true
NEXT_PUBLIC_FEATURE_CLERK_AUTH=true
NEXT_PUBLIC_FEATURE_DEBUG_INFO=true
```

## References

- `src/lib/featureFlags.ts`
- `docs/feature-flags-deployment.md`
