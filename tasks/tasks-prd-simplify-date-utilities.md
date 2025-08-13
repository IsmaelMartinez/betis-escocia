# Tasks: Simplify Date Utilities

## Relevant Files

- `src/lib/constants/dateFormats.ts` - New file containing standardized date format constants for Spanish locale
- `src/lib/dateUtils.ts` - Current custom date utilities file to be removed
- `tests/unit/lib/dateUtils.test.ts` - Test file for custom date utilities to be removed
- `src/app/partidos/[matchId]/page.tsx` - Match details page with date operations to migrate
- `src/app/coleccionables/page.tsx` - Collectibles page with date operations to migrate
- `src/app/admin/page.tsx` - Admin dashboard with date operations to migrate
- `src/app/dashboard/contact-submissions/page.tsx` - Contact submissions with date operations to migrate
- `src/app/sitemap.ts` - Sitemap generation with date operations to migrate
- `docs/DEVELOPER_GUIDE.md` - Developer documentation to be updated with date patterns
- `docs/adr/017-simplify-date-utilities.md` - ADR to be marked as "Accepted"
- `package.json` - Verify date-fns dependency is present

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx vitest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Vitest configuration.

## Tasks

- [x] 1.0 Create date format constants and prepare foundation
  - [x] 1.1 Create `src/lib/constants/dateFormats.ts` with Spanish date format constants (DATE_FORMAT, DATETIME_FORMAT, TIME_FORMAT)
  - [x] 1.2 Verify `date-fns` dependency exists in package.json
  - [x] 1.3 Test that Spanish locale import works: `import { es } from 'date-fns/locale'`
- [ ] 2.0 Identify and migrate existing date operations to use date-fns directly
  - [x] 2.1 Audit `src/app/partidos/[matchId]/page.tsx` for date operations and migrate to date-fns with Spanish locale
  - [x] 2.2 Audit `src/app/coleccionables/page.tsx` for date operations and migrate to date-fns with Spanish locale
  - [x] 2.3 Audit `src/app/admin/page.tsx` for date operations and migrate to date-fns with Spanish locale
  - [x] 2.4 Audit `src/app/dashboard/contact-submissions/page.tsx` for date operations and migrate to date-fns with Spanish locale
  - [x] 2.5 Audit `src/app/sitemap.ts` for date operations and migrate to date-fns with Spanish locale
  - [x] 2.6 Search for any other files using `toLocaleDateString`, `new Date()`, or similar patterns and migrate them
- [ ] 3.0 Remove custom date utilities and clean up imports
  - [ ] 3.1 Remove `src/lib/dateUtils.ts` file entirely
  - [ ] 3.2 Remove `tests/unit/lib/dateUtils.test.ts` file entirely
  - [ ] 3.3 Search for and remove any remaining imports of `@/lib/dateUtils`
  - [ ] 3.4 Verify no TypeScript errors exist after removal
- [ ] 4.0 Update tests and ensure no regressions
  - [ ] 4.1 Run full test suite with `npm test` to ensure no regressions
  - [ ] 4.2 Update any component tests that may have been affected by date formatting changes
  - [ ] 4.3 Verify bundle size hasn't increased with `npm run build` and check output
  - [ ] 4.4 Test date formatting manually in development environment
- [ ] 5.0 Update documentation and finalize implementation
  - [ ] 5.1 Add date patterns section to `docs/DEVELOPER_GUIDE.md` with examples of date-fns usage
  - [ ] 5.2 Include Spanish locale usage examples in developer documentation
  - [ ] 5.3 Document the date format constants and their usage
  - [ ] 5.4 Mark `docs/adr/017-simplify-date-utilities.md` status as "Accepted"
  - [ ] 5.5 Run final verification of all functionality before marking complete