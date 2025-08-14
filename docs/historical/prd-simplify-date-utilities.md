# PRD: Simplify Date Utilities

## Introduction/Overview
This feature simplifies the date handling in the codebase by removing custom date utility wrappers and using the well-maintained `date-fns` library directly. The goal is to reduce code complexity, eliminate maintenance overhead of custom utilities, and improve developer experience by using standard library patterns.

Currently, we have ~50 lines of custom date utilities that simply wrap `date-fns` functions, creating unnecessary abstraction layers that need testing and maintenance.

## Goals
1. **Reduce complexity**: Remove ~50 lines of custom date utility code
2. **Improve maintainability**: Use battle-tested `date-fns` library directly
3. **Standardize formats**: Establish consistent Spanish date formatting throughout the app
4. **Enhance developer experience**: Make date operations more transparent and predictable
5. **Update documentation**: Ensure all date patterns are documented for future developers

## User Stories
- **As a developer**, I want to use `date-fns` directly so that I can leverage its full API without custom wrappers
- **As a developer**, I want clear date format constants so that I can maintain consistency across components
- **As a user**, I want to see dates in Spanish format (dd/MM/yyyy) consistently throughout the application
- **As a maintainer**, I want fewer custom utilities to test and maintain

## Functional Requirements

### Core Functionality
1. **Remove custom utilities**: Delete `src/lib/dateUtils.ts` entirely
2. **Direct imports**: Replace all `formatLocalizedDate()` calls with `format()` from `date-fns`
3. **Direct imports**: Replace all `timeAgo()` calls with `formatDistanceToNow()` from `date-fns`
4. **Spanish formatting**: Use Spanish locale (`es`) for all date formatting operations
5. **Error handling**: Maintain current behavior - show original string when date parsing fails
6. **Format constants**: Create `src/lib/constants/dateFormats.ts` with standard formats:
   ```typescript
   export const DATE_FORMAT = 'dd/MM/yyyy';
   export const DATETIME_FORMAT = 'dd/MM/yyyy HH:mm';
   export const TIME_FORMAT = 'HH:mm';
   ```

### Migration Requirements
7. **Update all components**: Replace custom utility calls in all React components
8. **Update API routes**: Replace custom utility calls in all API route handlers
9. **Update tests**: Remove tests for custom utilities, update component tests as needed
10. **Clean imports**: Remove all imports of custom date utilities
11. **Bundle optimization**: Ensure proper tree-shaking of date-fns imports

### Documentation Requirements
12. **Developer guide**: Add section documenting common date patterns and usage
13. **ADR update**: Mark ADR-017 as "Accepted" after implementation
14. **Component examples**: Include examples of proper date-fns usage in developer docs

## Non-Goals (Out of Scope)
- Changing the user-facing date formats (keep Spanish dd/MM/yyyy)
- Adding user-configurable date format preferences
- Implementing advanced date manipulation features
- Changing timezone handling (keep current UTC/local behavior)
- Migrating away from date-fns library itself

## Design Considerations
- **Import pattern**: Use named imports for better tree-shaking: `import { format, formatDistanceToNow } from 'date-fns'`
- **Locale usage**: Always import Spanish locale: `import { es } from 'date-fns/locale'`
- **Error boundaries**: Maintain current error handling patterns without breaking user experience
- **Performance**: Ensure bundle size doesn't increase due to improper imports

## Technical Considerations

### Dependencies
- Keep existing `date-fns` dependency (already in package.json)
- Ensure `date-fns/locale` is available for Spanish locale

### Migration Strategy
- **Single PR approach**: Update all files in one comprehensive pull request
- **Testing strategy**: Run full test suite to ensure no regressions
- **Rollback plan**: Git revert if any critical issues discovered

### File Changes Required
- Remove: `src/lib/dateUtils.ts`
- Create: `src/lib/constants/dateFormats.ts`
- Update: All components using date utilities (~15-20 files estimated)
- Update: API routes with date formatting (~5-8 files estimated)
- Update: Test files referencing date utilities
- Update: `docs/DEVELOPER_GUIDE.md` with date patterns section

## Success Metrics
1. **Code reduction**: Remove ~50 lines from `dateUtils.ts`
2. **Test reduction**: Remove custom date utility tests (save ~30-50 lines of test code)
3. **Bundle size**: Maintain or improve bundle size through better tree-shaking
4. **Zero regressions**: All existing date formatting works identically
5. **Documentation completeness**: Developer guide includes date patterns section

## Open Questions
1. Should we create a single date constants file or multiple files by domain?
2. Are there any edge cases in current date formatting that need special attention?
3. Should we add TypeScript strict mode checking for date handling during this migration?

## Implementation Checklist
- [ ] Create `src/lib/constants/dateFormats.ts`
- [ ] Update all React components using `formatLocalizedDate()`
- [ ] Update all React components using `timeAgo()`
- [ ] Update all API routes with date formatting
- [ ] Remove `src/lib/dateUtils.ts`
- [ ] Update test files
- [ ] Update developer documentation
- [ ] Run full test suite
- [ ] Verify bundle size impact
- [ ] Mark ADR-017 as "Accepted"