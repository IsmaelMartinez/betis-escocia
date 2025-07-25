# ADR-010: Storybook v9 Migration and Package Consolidation

## Status
- **Status**: Accepted
- **Date**: 2025-07-25
- **Authors**: AI Assistant
- **Decision Maker**: Development Team

## Context

The project was using Storybook with a mix of v8 and v9 packages, causing significant compatibility issues and runtime errors. Specifically:

1. **Import Path Issues**: `@storybook/manager-api` and `@storybook/theming` packages were not found
2. **Deprecated Addon Packages**: Essential addons (`@storybook/addon-controls`, `@storybook/addon-viewport`, `@storybook/addon-backgrounds`) were causing console errors
3. **Package Structure Changes**: Storybook v9 consolidated many packages and moved essential addons to core
4. **MDX Template Errors**: Template files contained syntax that was incompatible with the new MDX parser

The console was showing multiple errors like:
```
Error: Your Storybook project is referring to package @storybook/addon-controls, which no longer exists in Storybook 9.0 and above
```

## Decision

We will fully migrate to Storybook v9 with the following changes:

1. **Package Import Updates**: Update import paths to use the new consolidated structure:
   - `@storybook/manager-api` → `storybook/internal/manager-api`
   - `@storybook/theming` → `storybook/internal/theming`

2. **Remove Deprecated Addon Packages**: Remove the following packages that have been moved to core:
   - `@storybook/addon-controls`
   - `@storybook/addon-viewport`
   - `@storybook/addon-backgrounds`
   - `@storybook/react`

3. **Configuration Updates**: Update `.storybook/main.ts` to remove deprecated addons from the addons array

4. **Use Official Migration Tools**: Use `npx storybook@latest upgrade` with automigrations to ensure proper configuration

5. **Fix MDX Template Syntax**: Remove problematic inline comments from JSX attributes in template files

## Consequences

### Positive
- **Eliminates Runtime Errors**: No more console errors about missing packages
- **Performance Improvements**: Storybook v9 provides 48% lighter bundle size
- **Better Testing Integration**: Enhanced integration with vitest for component testing
- **Future-Proof Architecture**: Aligns with Storybook's long-term direction
- **Essential Features Built-in**: Controls, viewport, and backgrounds are now part of core (no separate packages needed)
- **Improved Developer Experience**: Faster startup times and better debugging tools

### Negative
- **Migration Effort**: Required manual intervention and testing to complete migration
- **Breaking Changes**: Some import paths and configurations had to be updated
- **Documentation Updates**: Required updating guides and ADRs to reflect new structure

### Neutral
- **Functionality Maintained**: All existing Storybook features continue to work as expected
- **No User-Facing Changes**: The migration is internal and doesn't affect end-user experience

## Alternatives Considered

### Option 1: Stay with Storybook v8
- **Pros**: No migration effort required, existing setup works
- **Cons**: Missing performance improvements, security updates, and new features. Would eventually require migration anyway
- **Reason for rejection**: Technical debt would accumulate, and the migration would become more complex over time

### Option 2: Gradual Migration
- **Pros**: Lower risk, incremental changes
- **Cons**: Prolonged period of mixed versions and potential instability
- **Reason for rejection**: The package conflicts required a complete migration to resolve

### Option 3: Switch to Alternative Component Documentation Tool
- **Pros**: Could avoid migration complexity
- **Cons**: Would lose existing stories, team familiarity, and ecosystem benefits
- **Reason for rejection**: Storybook remains the industry standard with strong community support

## Implementation Notes

1. **Automated Migration**: Used `npx storybook@latest upgrade --yes` which automatically:
   - Updated package.json dependencies
   - Ran `renderer-to-framework` automigration
   - Ran `remove-essential-addons` automigration
   - Updated `.storybook/main.ts` configuration

2. **Manual Fixes Applied**:
   - Updated manager.ts and theme.ts import paths
   - Fixed ComponentTemplate.mdx syntax issues
   - Removed deprecated external package references from viteFinal function

3. **Verification Steps**:
   - Confirmed server starts without errors
   - Verified all tests pass (36 tests across 7 files)
   - Checked that essential features (controls, viewport, backgrounds) work correctly
   - Ensured no console errors in browser

## References
- [Storybook 9 Migration Guide](https://storybook.js.org/docs/migration-guide)
- [Package Structure Changes](https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#dropped-support-for-legacy-packages)
- [Essential Addons Moved to Core](https://github.com/storybookjs/storybook/blob/next/MIGRATION.md#essentials-addons-viewport-controls-interactions-and-actions-moved-to-core)
- Project commits: f3c59cc (initial fixes), bd51490 (completed migration)

## Review
- **Next review date**: 2026-01-25 (6 months)
- **Review criteria**: 
  - When Storybook v10 is released
  - If performance issues arise
  - If new essential features require configuration changes
  - Annual architecture review
