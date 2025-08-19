# PRD: Remove Flagsmith and Simplify Feature Flag System

## Introduction/Overview

The current Flagsmith integration adds unnecessary complexity to the Real Betis supporters club website. The project uses an external service for feature flags when simple environment variables would suffice. This PRD outlines the removal of Flagsmith and replacement with a lightweight, environment-variable-based feature flag system that maintains current functionality while reducing complexity and external dependencies.

**Problem**: Flagsmith adds network requests, external service dependency, complex configuration, and overhead for a project that doesn't require real-time feature toggling.

**Goal**: Simplify feature management by replacing Flagsmith with environment variables and static configuration, keeping only essential toggles for features that are currently hidden.

## Goals

1. Remove all Flagsmith infrastructure and dependencies
2. Replace with simple environment variable-based feature flags
3. Maintain current feature visibility behavior
4. Reduce complexity for developers working on the project
5. Eliminate external service dependency and potential points of failure
6. Keep deployment-time feature toggling for actively hidden features only

## User Stories

1. **As a developer**, I want to understand feature availability without checking external services, so I can develop more efficiently
2. **As a site administrator**, I want to control feature visibility through simple environment variables, so I don't need to manage external services
3. **As an end user**, I want the same feature availability as before, so my experience is unchanged
4. **As a maintainer**, I want fewer dependencies and simpler architecture, so the project is easier to maintain

## Functional Requirements

### Phase 1: Infrastructure Replacement

1. The system must create a new `src/lib/featureConfig.ts` file that reads from environment variables
2. The system must provide the same API interface (`hasFeature()`, `getValue()`) to minimize code changes
3. The system must default to current production behavior (enabled features stay enabled)
4. The system must only create environment variables for features that are currently hidden/disabled
5. The system must maintain TypeScript type safety for feature flag names

### Phase 2: Code Migration

6. The system must replace all `@/lib/flagsmith` imports with `@/lib/featureConfig` imports
7. The system must update all `hasFeature()` and `getValue()` calls to use the new system
8. The system must maintain the same return types (boolean for `hasFeature`, string/any for `getValue`)
9. The system must preserve all conditional rendering logic without changes

### Phase 3: Navigation Simplification

10. The system must keep current navigation hiding implementation but source from environment variables
11. The system must use sensible defaults (show navigation items unless explicitly hidden)
12. The system must allow easy toggling of navigation visibility through environment configuration

### Phase 4: Cleanup

13. The system must remove all Flagsmith-related packages from `package.json`
14. The system must remove all Flagsmith configuration files and environment variables
15. The system must remove Flagsmith provider components from the React tree
16. The system must update all tests to use the new feature flag system
17. The system must remove unused feature flags that are not actively being used

## Non-Goals (Out of Scope)

1. **Real-time feature toggling** - Features will only update on deployment
2. **User-specific feature flags** - All flags are global/environment-based
3. **Analytics integration** - No tracking of feature usage
4. **Gradual rollouts** - Features are either on or off for all users
5. **Complex feature dependencies** - No hierarchical or conditional feature relationships
6. **Admin UI for feature management** - Environment variables only

## Design Considerations

### New Feature Config Structure
```typescript
// src/lib/featureConfig.ts
interface FeatureConfig {
  // Only include actively managed features
  'show-trivia-game': boolean;
  'show-merchandise': boolean;
  // etc.
}

// Environment variables (only for hidden features)
NEXT_PUBLIC_FEATURE_TRIVIA_GAME=true
NEXT_PUBLIC_FEATURE_MERCHANDISE=false
```

### API Compatibility
Maintain the same interface:
```typescript
// Before: await hasFeature('feature-name')
// After:  hasFeature('feature-name') // synchronous
```

### Default Behavior
- Features currently enabled in production → Always enabled (no env var needed)
- Features currently hidden/disabled → Controlled by environment variable
- Unknown features → Default to `false` for safety

## Technical Considerations

1. **Environment Variable Naming**: Use `NEXT_PUBLIC_FEATURE_*` pattern for client-side access
2. **Build-time Resolution**: Environment variables are resolved at build time, not runtime
3. **Type Safety**: Maintain strict TypeScript typing for feature names
4. **Test Environment**: Provide test-specific feature configuration
5. **Documentation**: Update CLAUDE.md to reflect new feature flag approach
6. **ADR Update**: Update existing Flagsmith ADR to document the decision to remove it

### Dependencies to Remove
- `flagsmith-nodejs`
- Any Flagsmith-related packages

### Files to Modify/Remove
- Remove: `src/lib/flagsmith/` directory
- Remove: Flagsmith environment variables
- Create: `src/lib/featureConfig.ts`
- Update: All files importing from `@/lib/flagsmith`
- Update: `docs/adr/004-flagsmith-feature-flags.md`

## Success Metrics

1. **Complexity Reduction**: Remove ~500+ lines of Flagsmith-related code
2. **Performance**: Eliminate external API calls for feature flag resolution
3. **Developer Experience**: Reduce feature flag resolution from async to sync operations
4. **Dependency Count**: Remove 1-2 external npm dependencies
5. **Build Time**: Reduce build complexity by removing external service configuration
6. **Maintenance**: Zero external service dependencies for feature flags

## Open Questions

1. Should we keep a small subset of features behind environment flags for future experimentation?
2. Do we need any migration documentation for deployment configuration changes?
3. Should we implement a simple admin interface for viewing current feature state?
4. Are there any current Flagsmith features (like user segmentation) that we're utilizing?

## Implementation Notes

### Environment Variable Strategy
Only create environment variables for features that are:
- Currently disabled/hidden in production
- Actively being used for A/B testing
- Experimental features that might need quick disabling

### Default Philosophy
- If a feature is currently enabled and stable → No environment variable needed
- If a feature is hidden from navigation → Environment variable for navigation visibility
- If a feature doesn't exist/is unused → Remove entirely

This approach minimizes the number of environment variables while maintaining the necessary control for actively managed features.