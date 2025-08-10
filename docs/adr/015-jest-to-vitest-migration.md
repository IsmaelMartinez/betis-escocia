# ADR-015: Migrate from Jest to Vitest for Unit and Integration Testing

## Status

Accepted

## Date

2025-08-10

## Context

Our current testing setup uses Jest for unit and integration tests, and Playwright for E2E tests. While Jest has served us well, we're encountering some challenges:

1. **Configuration Complexity**: We need ts-jest, @swc/jest, and complex transform configurations to handle TypeScript and modern JavaScript features
2. **Performance**: Jest can be slow, especially with our growing test suite (329 tests across 24 suites)
3. **Coverage Overlaps**: We have both Jest and Vitest running different test sets, leading to confusing coverage reports where files tested by Vitest appear uncovered in Jest reports
4. **Ecosystem Alignment**: Our development stack uses Vite, but our testing uses a different ecosystem
5. **Developer Experience**: Slower feedback loops and more configuration overhead

## Decision

We will migrate from Jest to Vitest for unit and integration testing while maintaining Playwright for E2E tests.

**What we're migrating:**
- Unit tests (`tests/unit/` - excluding app components already using Vitest)
- Integration tests (`tests/integration/`)
- Test configuration and tooling

**What we're keeping:**
- Playwright for E2E tests (superior browser automation, multi-browser support, visual testing)
- Existing test file organization and patterns
- Current coverage thresholds and quality gates

## Rationale

### Benefits of Vitest

1. **Performance**: 20-40% faster test execution through Vite's optimizations
2. **Native TypeScript Support**: No need for ts-jest or complex transform configurations
3. **ESM First**: Native ESM support without additional configuration
4. **Hot Module Replacement**: Instant test re-runs on file changes
5. **Unified Tooling**: Same build tool (Vite) for development and testing
6. **Built-in Coverage**: Native c8 coverage without additional setup
7. **Jest Compatibility**: Similar API reduces migration effort
8. **Modern Ecosystem**: Active development and growing community

### Why Keep Playwright

1. **Real Browser Testing**: Actual browser automation vs simulated DOM
2. **Multi-browser Support**: Chrome, Firefox, Safari testing
3. **Visual Testing**: Screenshots, video recording, trace viewing
4. **Network Interception**: Real network requests, not just mocks
5. **Authentication Integration**: Already configured with Clerk
6. **Rich Debugging**: Headless/headed modes, step-by-step debugging

### Migration Strategy

**Gradual Migration Approach:**
- Phase 1: Unit tests
- Phase 2: Integration tests  
- Phase 3: Configuration & CI
- Phase 4: Documentation & cleanup

This minimizes risk and maintains development velocity throughout the transition.

## Consequences

### Positive

1. **Improved Developer Experience**: Faster tests, better TypeScript support, HMR for tests
2. **Simplified Configuration**: Fewer dependencies and simpler setup
3. **Unified Coverage Reports**: Single testing framework eliminates coverage gaps
4. **Future-proofing**: Alignment with modern Vite-based development workflow
5. **Performance Gains**: Expected 20-40% improvement in test execution time

### Negative

1. **Migration Effort**: Time investment to convert 329 tests across 24 suites
2. **Temporary Complexity**: During migration, we'll have both Jest and Vitest configurations
3. **Learning Curve**: Team needs to learn Vitest-specific patterns and debugging
4. **Risk**: Potential for introducing bugs during mock/syntax conversions

### Neutral

1. **Test Count Unchanged**: Maintaining all 329 existing tests
2. **Coverage Requirements**: Same coverage thresholds and reporting
3. **CI/CD Integration**: GitHub Actions will need updates but functionality remains the same

## Implementation

The migration will follow the phases outlined in `prd-jest-to-vitest-migration.md`:

1. **Week 1**: Unit tests migration and basic Vitest configuration
2. **Week 2**: Integration tests with complex mocking scenarios
3. **Week 3**: CI/CD integration and final configuration
4. **Week 4**: Documentation, cleanup, and team training

**Rollback Plan**: Jest configuration will be preserved during migration phases, allowing quick rollback if critical issues arise.

**Success Criteria**:
- All 329 tests pass with identical coverage
- Test execution time improves by 20-40%
- CI/CD pipelines continue to work without regression
- Team can write new tests using Vitest patterns

## Links

- [PRD: Jest to Vitest Migration](../../tasks/prd-jest-to-vitest-migration.md)
- [Vitest Documentation](https://vitest.dev/)
- [Jest to Vitest Migration Guide](https://vitest.dev/guide/migration.html)
- [Current Jest Configuration](../../jest.config.js)
- [Current Vitest Configuration](../../vitest.config.ts)