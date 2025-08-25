# ADR-004: Feature Flag Implementation (Flagsmith → Environment Variables)

## Status
- **Status**: **SUPERSEDED** → Migrated to Environment Variables
- **Date**: 2025-07-17
- **Updated**: 2025-08-19 (Migration Complete)
- **Authors**: Development Team
- **Decision Maker**: Technical Lead

## Summary
**This ADR documents the complete migration from Flagsmith to environment variable-based feature flags completed on 2025-08-19.**

**Original Decision**: Implement Flagsmith for real-time feature flag management
**Final Decision**: Remove Flagsmith and simplify to environment variable-based feature flags
**Reason**: The complexity and external dependencies of Flagsmith were not justified for this project's simple feature toggling needs.

## Context
The Peña Bética Escocesa website currently uses environment variable-based feature flags for controlling feature visibility. While this approach works, it has several limitations:

- **No real-time updates**: Requires deployment to change flags
- **Limited targeting**: Cannot enable features for specific users or groups
- **No A/B testing**: Cannot run experiments or gradual rollouts
- **Manual management**: Requires developer intervention for all changes
- **No analytics**: Cannot track feature usage or adoption

We need to migrate to a third-party feature flag provider that offers:
- Free tier suitable for small projects
- Real-time flag updates without deployment
- A/B testing capabilities for future use
- Easy migration from current environment variable setup
- Preferably integrates well with Vercel deployment

## Decision
We chose **Flagsmith** as our feature flag provider for the following reasons:

### Primary Reasons
1. **Generous Free Tier**: 50,000 requests/month vs competitors' 1,000-1,500 limits
2. **Real-time Updates**: Instant flag changes without deployment
3. **A/B Testing**: Built-in experimentation capabilities
4. **Open Source**: Full transparency and self-hosting option if needed
5. **Good SDKs**: Quality JavaScript/TypeScript SDK for Next.js integration
6. **Easy Migration**: Straightforward migration from environment variables

### Cost Comparison
- **Flagsmith**: 50,000 requests/month free
- **LaunchDarkly**: 1,000 contexts/month free, $10/month minimum
- **ConfigCat**: 1,000 evaluations/month free
- **Vercel Flags**: Free but basic features only

## Consequences
### Positive
- **Real-time flag management**: No more deployments for flag changes
- **Better collaboration**: Non-technical team members can manage flags
- **A/B testing capability**: Future experimentation possibilities
- **Analytics**: Track feature usage and adoption
- **Audit trail**: See who changed what and when
- **Cost-effective**: Free tier covers current and projected usage
- **Scalability**: Can handle growth without immediate cost impact

### Negative
- **External dependency**: Adds reliance on third-party service
- **Learning curve**: Team needs to learn new tool and concepts
- **Migration effort**: Requires development work to migrate existing flags
- **Potential latency**: Additional API calls for flag evaluation
- **Vendor lock-in**: Some degree of dependency on Flagsmith

### Neutral
- **Feature parity**: Will maintain all current feature flag functionality
- **Gradual migration**: Can migrate flags incrementally

## Alternatives Considered
### Option 1: LaunchDarkly (Industry Standard)
- **Pros**: Most mature platform, excellent features, great support
- **Cons**: Expensive ($10/month minimum), limited free tier (1,000 contexts)
- **Reason for rejection**: Cost too high for small project, free tier too restrictive

### Option 2: Vercel Feature Flags (Native Integration)
- **Pros**: Native Vercel integration, zero setup, completely free
- **Cons**: Very basic features, no A/B testing, limited targeting
- **Reason for rejection**: Too basic for future needs, no experimentation capability

### Option 3: ConfigCat (Developer-Friendly)
- **Pros**: Developer-focused, easy setup, good documentation
- **Cons**: Limited free tier (1,000 evaluations), expensive scaling ($99/month)
- **Reason for rejection**: Free tier too restrictive, pricing not competitive

### Option 4: Unleash (Open Source)
- **Pros**: Open source, enterprise features, flexible deployment
- **Cons**: Requires self-hosting, complex setup, infrastructure overhead
- **Reason for rejection**: Too complex for current needs, requires DevOps expertise

## Implementation Notes
- **Migration Strategy**: Complete migration to Flagsmith implemented with environment variable fallback.
- **Performance Optimization**: Implemented batch operations reducing API calls by 60-80%
- **Singleton Pattern**: Thread-safe singleton manager prevents multiple SDK initializations
- **Cache Strategy**: Dual-cache system with coordinated expiration (60s TTL)
- **Integration**: Flagsmith JavaScript SDK with Next.js using optimized withManager pattern
- **Configuration**: Environment-based configuration (dev/staging/prod)

## Current Implementation Status (Updated 2025-08-13)

### Active Feature Flags
The following feature flags are currently active in the system:

- `show-clasificacion` - League standings display (default: enabled)
- `show-galeria` - Photo gallery (default: disabled)
- `show-partidos` - Match listings (default: enabled)
- `show-social-media` - Social media integrations (default: disabled)
- `show-history` - Club history section (default: disabled)
- `show-nosotros` - About page (default: enabled)
- `show-redes-sociales` - Social media links (default: disabled)
- `show-clerk-auth` - Authentication system (default: enabled)
- `show-debug-info` - Development debugging (default: disabled)
- `admin-push-notifications` - Admin notification system (default: disabled)

### Performance Optimizations Implemented
- **Batch Operations**: `getMultipleValues()` uses single `flagsmith.getFlags()` call
- **Singleton Manager**: Global instance prevents duplicate SDK initialization
- **Eliminated Duplicates**: Removed redundant `await this.initialize()` calls
- **Cache Coordination**: Aligned feature flags cache with Flagsmith's internal cache
- **Code Reduction**: Simplified environment variable parsing with helper functions

### Architecture Improvements
- **withManager Pattern**: Eliminated repetitive manager access across 6 public functions
- **Type Safety**: Enhanced TypeScript types (unknown[] instead of any[])
- **Error Handling**: Graceful degradation with stale cache fallback
- **Environment Fallback**: Comprehensive fallback to environment variables

### Always-On Features
The following features are always available (not feature-flagged):
- **RSVP functionality** - Core match viewing party system, always enabled
- **Join (Únete) functionality** - Community membership, always enabled  
- **Contact functionality** - Communication system, always enabled
- **Admin access** - Controlled by Clerk roles, not feature flags

### Removed Flags
The following unused flags were removed during optimization:
- `trivia-game` - Unused trivia functionality
- `admin-dashboard` - Unused admin dashboard
- `show-admin` - Simplified admin access control

---

## 2025-08-19 Update: Migration to Environment Variables Complete

### New Implementation
The project has migrated to a **simplified environment variable-based feature flag system**:

**File**: `src/lib/featureConfig.ts`
- **API Compatibility**: Maintains same `hasFeature()` and `getValue()` interface
- **Performance**: Synchronous resolution (no async/await needed)
- **Simplicity**: Environment variables resolved at build time
- **Types**: Full TypeScript support with proper types
- **Fallbacks**: Environment-specific defaults (dev/prod/test)

### Environment Variables (Only for Hidden Features)
```bash
# Only set these for features currently disabled/experimental
NEXT_PUBLIC_FEATURE_GALERIA=false  
NEXT_PUBLIC_FEATURE_SOCIAL_MEDIA=false
NEXT_PUBLIC_FEATURE_HISTORY=false
NEXT_PUBLIC_FEATURE_REDES_SOCIALES=false
NEXT_PUBLIC_FEATURE_DEBUG_INFO=false
NEXT_PUBLIC_FEATURE_ADMIN_PUSH_NOTIFICATIONS=false
```

### Always-On Features (No Environment Variables Needed)
- `RSVP` - Core functionality
- `Únete` (Join) - Core functionality  
- `Contacto` (Contact) - Core functionality
- `Clasificación` - Production ready
- `Partidos` - Production ready
- `Nosotros` - Production ready
- `Clerk Auth` - Production ready

### Migration Benefits Achieved
- ✅ **Reduced Complexity**: ~800+ lines of Flagsmith code removed
- ✅ **No External Dependencies**: Removed flagsmith package
- ✅ **Better Performance**: Synchronous flag resolution
- ✅ **Simplified Deployment**: No external service configuration needed
- ✅ **Same Functionality**: All existing features work identically

### Migration Summary
- **Removed**: Flagsmith SDK, configuration, components, tests (~15 files)
- **Added**: Simple environment variable system (1 file + tests)
- **Updated**: All components now use synchronous feature flag calls
- **Result**: Significantly simpler architecture with identical user experience

## References
- **Original Flagsmith Documentation**: [docs.flagsmith.com](https://docs.flagsmith.com/) (no longer used)
- **Migration PRD**: `tasks/prd-remove-flagsmith-simplify-feature-flags.md`
- **New Implementation**: `src/lib/featureConfig.ts`

## Final Status
- **Migration Complete**: 2025-08-19
- **Status**: Environment variables successfully replace all Flagsmith functionality
- **Recommendation**: Continue with environment variable approach for this project's needs
