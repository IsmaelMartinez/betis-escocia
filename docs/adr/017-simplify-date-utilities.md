# ADR-017: Simplify Date Utilities by Consolidating to date-fns

## Status
Proposed

## Context
The current codebase has multiple date utility files with minimal functionality:
- `src/lib/dateUtils.ts` - 47 lines with basic date-fns wrappers
- `src/lib/matchUtils.ts` - Contains date logic mixed with business logic
- Various date formatting scattered throughout components

Current issues:
1. **Over-abstraction**: Simple date-fns functions wrapped unnecessarily
2. **Mixed concerns**: Date logic mixed with business logic in matchUtils
3. **Maintenance overhead**: Custom utilities need testing and maintenance
4. **Developer confusion**: Multiple ways to format dates

We already use `date-fns` library which is well-maintained and provides:
- Comprehensive date manipulation
- Localization support (Spanish)
- Tree-shaking friendly
- TypeScript support
- Extensive testing

## Decision
We will **simplify date handling** by:

1. **Remove custom date utilities** (`dateUtils.ts`)
2. **Use date-fns directly** in components
3. **Extract date logic** from `matchUtils.ts` 
4. **Standardize on common patterns** without over-abstraction

## Implementation Plan

### Phase 1: Direct Usage
- Replace `formatLocalizedDate()` calls with `format()` from date-fns
- Replace `timeAgo()` calls with `formatDistanceToNow()` from date-fns  
- Update imports throughout codebase

### Phase 2: Clean Business Logic
- Move match date logic out of `matchUtils.ts`
- Keep only business logic (match queries)
- Use date-fns directly where needed

### Phase 3: Establish Patterns
- Document common date patterns in developer guide
- Create simple constants for formats if needed
- Remove custom date utility files

## Benefits
- **Reduced complexity**: ~50 lines of custom code removed
- **Better maintainability**: Use battle-tested library directly
- **Clearer code**: Obvious what date operations are happening
- **Fewer tests needed**: Don't test well-tested library wrappers
- **Better tree-shaking**: Import only needed date-fns functions

## Risks
- **Repetition**: Some date format strings may be repeated
- **Learning curve**: Developers need to learn date-fns API
- **Migration effort**: Need to update existing usage

## Mitigation
- Document common patterns in developer guide
- Create constants for frequently used formats
- Gradual migration to minimize disruption

## Success Metrics
- Remove `dateUtils.ts` file entirely
- Reduce date-related test files
- Maintain same user-facing functionality
- Improve bundle size (better tree-shaking)

## References
- [date-fns documentation](https://date-fns.org/)
- [date-fns Spanish locale](https://date-fns.org/v2.29.3/docs/Locale)