# ADR-004: Feature Flags (Environment Variables)

## Status
Accepted

## Decision
**Environment variable-based feature flags** for simple feature control.

## Why Environment Variables
After evaluating Flagsmith (too complex for our needs), we settled on simple environment variables:
- **Simplicity**: Synchronous resolution, no external dependencies
- **Performance**: Build-time resolution, no API calls
- **Cost**: Free, no external service
- **Sufficient**: Our scale doesn't need real-time flag updates

## Implementation
```typescript
// src/lib/featureConfig.ts
import { hasFeature } from '@/lib/featureFlags';

// Synchronous check
if (hasFeature('show-galeria')) {
  // Feature enabled
}
```

## Environment Variables (set only for disabled features)
```bash
NEXT_PUBLIC_FEATURE_GALERIA=false
NEXT_PUBLIC_FEATURE_SOCIAL_MEDIA=false
NEXT_PUBLIC_FEATURE_DEBUG_INFO=false
```

## Always-On Features (no env vars needed)
- RSVP, Únete, Contacto - core functionality
- Clasificación, Partidos, Nosotros - production ready
- Clerk Auth - production ready

## References
- `src/lib/featureConfig.ts`
- `docs/feature-flags-deployment.md`

