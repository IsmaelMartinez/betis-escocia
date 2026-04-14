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
// src/lib/features/featureFlags.ts
import { hasFeature } from "@/lib/features/featureFlags";

// Synchronous check
if (hasFeature("show-clerk-auth")) {
  // Feature enabled
}
```

## Default Feature States

Source of truth: `src/lib/features/featureFlags.ts`.

### Enabled by Default (Core Features)

- `show-nosotros` - About page
- `show-unete` - Join functionality
- `show-clasificacion` - League standings
- `show-partidos` - Match schedule and results
- `show-jugadores-historicos` - Legends page
- `show-efemerides` - Betis history efemérides

### Disabled by Default (Set `=true` to Enable)

- `show-clerk-auth` - Authentication UI
- `show-debug-info` - Debug panel

## Environment Variable Examples

```bash
# Enable authenticated flows + debug panel
NEXT_PUBLIC_FEATURE_CLERK_AUTH=true
NEXT_PUBLIC_FEATURE_DEBUG_INFO=true
```

## References

- `src/lib/features/featureFlags.ts`
- `docs/feature-flags-deployment.md`
