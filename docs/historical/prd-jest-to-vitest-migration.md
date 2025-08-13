# PRD: Jest to Vitest Migration

## Introduction/Overview

This PRD outlines the migration of our testing infrastructure from Jest to Vitest for unit and integration tests, while maintaining Playwright for end-to-end testing. The goal is to modernize our testing stack to leverage Vite's ecosystem benefits including faster test execution, better TypeScript support, and improved developer experience, while keeping our proven E2E testing setup intact.

The migration will be conducted in phases to minimize risk and maintain development velocity throughout the transition.

## Goals

1. **Modernize Testing Infrastructure**: Transition to Vitest for improved performance and developer experience
2. **Maintain Test Coverage**: Ensure no reduction in test coverage during migration (currently 329 tests across 24 suites)
3. **Improve Test Performance**: Achieve faster test execution through Vite's optimizations
4. **Enhance Developer Experience**: Provide better TypeScript integration, HMR for tests, and modern tooling
5. **Reduce Configuration Complexity**: Eliminate need for ts-jest and Jest-specific configurations
6. **Future-proof Testing Stack**: Align with modern Vite-based development workflow

## User Stories

**As a developer, I want to:**
- Run tests faster so I can iterate more quickly during development
- Have better TypeScript support in tests so I spend less time dealing with configuration issues
- Use native ESM modules in tests so I don't need complex transform configurations
- See test results update instantly when I change test files (HMR)
- Have unified tooling between development and testing environments

**As a team lead, I want to:**
- Maintain existing test coverage during migration so we don't lose quality assurance
- Have a gradual migration path so development work isn't blocked
- Ensure the new setup is maintainable and well-documented for the team

**As a CI/CD pipeline, I want to:**
- Continue generating accurate coverage reports for all test types
- Have reliable test execution with proper error reporting
- Maintain integration with existing quality gates and workflows

## Functional Requirements

### Phase 1: Unit Tests Migration
1. The system must migrate all unit tests from Jest to Vitest syntax
2. The system must convert Jest mocks (`jest.mock`, `jest.fn()`) to Vitest equivalents (`vi.mock`, `vi.fn()`)
3. The system must maintain identical test coverage for migrated unit tests
4. The system must preserve existing test file organization and naming conventions
5. The system must configure Vitest to work with existing TypeScript and path mapping setup
6. The system must integrate with existing Storybook test setup

### Phase 2: Integration Tests Migration  
7. The system must migrate integration API tests while maintaining MSW (Mock Service Worker) compatibility
8. The system must convert Supabase and Clerk mocking patterns to Vitest syntax
9. The system must preserve existing test database setup and cleanup procedures
10. The system must maintain NextRequest/NextResponse mocking for API route testing

### Phase 3: Configuration & Tooling
11. The system must configure Vitest with native coverage reporting using c8
12. The system must integrate Vitest with existing CI/CD pipeline (GitHub Actions)
13. The system must provide npm scripts for different test execution modes (watch, coverage, etc.)
14. The system must configure Vitest to exclude Playwright E2E tests from its scope
15. The system must maintain compatibility with existing package.json test scripts

### Phase 4: Documentation & Cleanup
16. The system must update all test-related documentation to reflect Vitest usage
17. The system must remove Jest dependencies and configuration files
18. The system must update CLAUDE.md with new testing commands and patterns
19. The system must provide migration guide for future test writing

## Non-Goals (Out of Scope)

- **E2E Test Migration**: Playwright will remain for E2E tests due to superior browser automation capabilities
- **Test Architecture Overhaul**: Will maintain existing test structure and organization (marked as future improvement)
- **Performance Benchmarking**: Will not conduct detailed performance analysis (qualitative improvements expected)
- **Storybook Migration**: Will keep existing Storybook v9 setup with Vitest addon
- **Test Data Management**: Will not modify existing test data patterns or mock factories

## Design Considerations

**Configuration Approach:**
- Use minimal configuration changes to maintain existing patterns
- Leverage Vitest's defaults where possible to reduce configuration complexity
- Maintain existing path mappings (`@/` alias) and TypeScript setup

**Migration Strategy:**
- Phase-by-phase approach to minimize risk
- Maintain both Jest and Vitest configurations during transition
- Use feature flags or npm scripts to control which test runner is active during migration

## Technical Considerations

**Dependencies to Add:**
- `vitest` - Core test runner
- `@vitest/ui` - Optional test UI for development
- Remove: `jest`, `ts-jest`, `@swc/jest`, `@types/jest`

**Configuration Files:**
- Update existing `vitest.config.ts` to handle all test types
- Maintain `tests/setup.ts` with Vitest-compatible setup
- Keep `playwright.config.ts` unchanged for E2E tests

**Mock Conversions:**
- `jest.mock()` → `vi.mock()`
- `jest.fn()` → `vi.fn()`
- `jest.spyOn()` → `vi.spyOn()`
- `beforeEach`/`afterEach` remain the same

**Coverage Integration:**
- Configure c8 for coverage reporting
- Exclude Playwright test files from coverage calculation
- Maintain existing coverage thresholds and reporting formats

## Success Metrics

1. **Coverage Maintenance**: All 329 existing tests pass with identical coverage percentages
2. **Performance Improvement**: Test execution time reduces by 20-40% (typical Vitest vs Jest improvement)
3. **Developer Experience**: Subjective improvement in test development speed and debugging experience
4. **CI/CD Integration**: All GitHub Actions workflows continue to pass with new test runner
5. **Zero Regression**: No existing functionality breaks during or after migration
6. **Documentation Quality**: All team members can write new tests using Vitest patterns

## Open Questions

1. **Coverage Reporting**: Should we maintain separate coverage reports for unit/integration vs E2E, or unify them?
2. **Migration Timeline**: What's the preferred timeline for each phase? (Suggested: 1 week per phase)
3. **Rollback Strategy**: If issues arise, should we prepare a quick rollback plan to Jest?
4. **Team Training**: Do we need dedicated training sessions for Vitest-specific patterns?
5. **Performance Monitoring**: Should we establish baseline performance metrics before migration?
6. **Future Improvements**: Priority order for marked improvements (test architecture, better organization)?

## Implementation Phases

**Phase 1 (Week 1): Unit Tests**
- Migrate `tests/unit/` (excluding app components already using Vitest)
- Configure basic Vitest setup
- Ensure coverage reporting works

**Phase 2 (Week 2): Integration Tests** 
- Migrate `tests/integration/` 
- Handle complex mocking scenarios (Clerk, Supabase, MSW)
- Verify API route testing patterns

**Phase 3 (Week 3): Configuration & CI**
- Finalize Vitest configuration
- Update CI/CD pipelines  
- Remove Jest dependencies

**Phase 4 (Week 4): Documentation & Cleanup**
- Update documentation
- Team training/handoff
- Clean up old configuration files