# Task List: Remove Flagsmith and Simplify Feature Flag System

Based on PRD: `prd-remove-flagsmith-simplify-feature-flags.md`

## Relevant Files

- `src/lib/featureConfig.ts` - New simplified feature flag configuration to replace Flagsmith
- `tests/unit/lib/featureConfig.test.ts` - Unit tests for the new feature configuration system
- `src/lib/featureFlags.ts` - Main feature flags interface that needs to be updated to use new system
- `tests/unit/lib/featureFlags.test.ts` - Unit tests for updated feature flags system
- `src/lib/flagsmith/` (entire directory) - Flagsmith implementation to be removed
- `tests/unit/lib/flagsmith/` (entire directory) - Flagsmith tests to be removed
- `src/components/FlagsmithRefresher.tsx` - Flagsmith-specific component to be removed
- `src/components/Layout.tsx` - Navigation component using feature flags
- `docs/adr/004-flagsmith-feature-flags.md` - ADR document needs update to reflect removal decision
- `CLAUDE.md` - Project documentation needs feature flag section update
- `package.json` - Remove Flagsmith dependencies
- `.env.example` - Remove Flagsmith environment variables, add new ones for hidden features only
- `vitest.config.ts` - Update test environment variables if needed
- `README.md` - Update documentation references

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx vitest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Vitest configuration.

## Tasks

- [x] 1.0 Create New Environment Variable-Based Feature Configuration System
  - [x] 1.1 Analyze current feature flags in use to determine which need environment variables
  - [x] 1.2 Create `src/lib/featureConfig.ts` with environment variable-based configuration
  - [x] 1.3 Implement `hasFeature()` and `getValue()` functions with same API as Flagsmith
  - [x] 1.4 Add TypeScript types for feature flag names and configuration
  - [x] 1.5 Implement fallback defaults for production-enabled features
  - [x] 1.6 Create unit tests for `featureConfig.ts`
- [x] 2.0 Migrate Feature Flag Usage from Flagsmith to New System
  - [x] 2.1 Update `src/lib/featureFlags.ts` to import from `@/lib/featureConfig` instead of `@/lib/flagsmith`
  - [x] 2.2 Replace all async feature flag calls with synchronous calls where possible
  - [x] 2.3 Update `getEnabledNavigationItems()` function to use new system
  - [x] 2.4 Update Layout component to use new feature flag system
  - [x] 2.5 Search for and update any other components using `hasFeature` or `getValue`
  - [x] 2.6 Test that navigation and feature visibility works correctly
- [ ] 3.0 Remove Flagsmith Infrastructure and Dependencies
  - [ ] 3.1 Remove `src/lib/flagsmith/` directory and all its contents
  - [ ] 3.2 Remove `src/components/FlagsmithRefresher.tsx` component
  - [ ] 3.3 Remove Flagsmith packages from `package.json`
  - [ ] 3.4 Remove Flagsmith environment variables from `.env.example`
  - [ ] 3.5 Add environment variables for currently hidden features only
  - [ ] 3.6 Remove Flagsmith initialization calls from app startup
- [ ] 4.0 Update Tests and Documentation
  - [ ] 4.1 Remove `tests/unit/lib/flagsmith/` directory and all flagsmith tests
  - [ ] 4.2 Update `tests/unit/lib/featureFlags.test.ts` to work with new system
  - [ ] 4.3 Update any components tests that mock Flagsmith to use new system
  - [ ] 4.4 Update `docs/adr/004-flagsmith-feature-flags.md` to document removal decision
  - [ ] 4.5 Update `CLAUDE.md` feature flags section to reflect new environment variable approach
  - [ ] 4.6 Update `README.md` to remove Flagsmith setup instructions
- [ ] 5.0 Cleanup and Verification
  - [ ] 5.1 Run full test suite to ensure no regressions
  - [ ] 5.2 Run lint and type-check to ensure code quality
  - [ ] 5.3 Test application locally to verify feature visibility works correctly
  - [ ] 5.4 Create environment variable documentation for deployment
  - [ ] 5.5 Verify no remaining references to Flagsmith in codebase