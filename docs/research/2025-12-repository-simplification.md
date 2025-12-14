# Repository Simplification Research

**Date**: December 2025  
**Author**: Development Team  
**Status**: Proposed

## Executive Summary

This document outlines a comprehensive plan to simplify the Peña Bética Escocesa repository by removing unnecessary tooling and documentation overhead. As a solo developer project, several enterprise-grade tools and extensive documentation archives add maintenance burden without proportional benefit.

## Current State Analysis

### Repository Statistics
| Category | Count | Notes |
|----------|-------|-------|
| Storybook stories | 41 files | `*.stories.tsx` across components |
| Documentation files | 111 `.md` files | Many historical/archived |
| Test files | 140 files | Unit, integration, security |
| Historical docs | 59 files | Completed tasks archive |
| ADR documents | 24 files | Some superseded |

### Identified Overhead
1. **Storybook**: Enterprise-grade component documentation tool
2. **Historical documentation**: Completed PRDs, task lists, and migration guides
3. **Superseded ADRs**: Architectural decisions that have been replaced
4. **CI/CD complexity**: Non-blocking quality checks that may not provide value

---

## Simplification Recommendations

### 1. Remove Storybook (HIGH PRIORITY)

#### Rationale
- Solo developer project doesn't benefit from visual component documentation
- Adds ~12 packages to `devDependencies`
- Requires maintenance for version upgrades (e.g., v8 → v9 migration)
- Consumes CI time on every build
- 41 story files require updates when components change

#### Files to Remove
```
.storybook/                          # 4 files
├── main.ts
├── preview.ts
├── setup.ts
└── vitest.setup.ts

src/stories/                         # 26 files (Storybook defaults)
├── assets/                          # 16 image assets
├── Button.stories.ts
├── Button.tsx
├── Configure.mdx
├── Header.stories.ts
├── Header.tsx
├── Page.stories.ts
├── Page.tsx
├── button.css
├── header.css
└── page.css

src/components/**/*.stories.tsx      # 41 story files
storybook-static/                    # ~11MB build output
```

#### Packages to Remove from `package.json`
```json
{
  "devDependencies": {
    "@storybook/addon-docs": "remove",
    "@storybook/addon-onboarding": "remove",
    "@storybook/addon-vitest": "remove",
    "@storybook/nextjs": "remove",
    "storybook": "remove",
    "eslint-plugin-storybook": "remove",
    "msw-storybook-addon": "remove"
  }
}
```

#### Scripts to Remove
```json
{
  "scripts": {
    "storybook": "remove",
    "build-storybook": "remove"
  }
}
```

#### CI/CD Updates
Remove from `.github/workflows/ci.yml`:
```yaml
# Remove these lines from quality job
- name: Build Storybook
  run: npm run build-storybook
```

#### Documentation Updates
- Archive `docs/adr/010-storybook-v9-migration.md` to historical
- Update `CLAUDE.md` to remove Storybook references
- Update `README.md` to remove Storybook from tech stack

---

### 2. Archive Historical Documentation (MEDIUM PRIORITY)

#### Rationale
- 59 files in `docs/historical/` are completed tasks
- Git history preserves all content if ever needed
- Clutters navigation and search results

#### Action
Delete entire `docs/historical/` folder:
```
docs/historical/                     # 59 files to delete
├── completed-tasks/                 # 4 files
├── implemented-features/            # 3 files
├── admin-role-testing-plan.md
├── auth-constraints.md
├── auth-providers-research.md
├── ... (52 more files)
```

#### Alternative (if deletion feels too aggressive)
Create a single `docs/ARCHIVE.md` with a brief summary and git commit references.

---

### 3. Consolidate Superseded ADRs (LOW PRIORITY)

#### ADRs to Archive/Remove
| ADR | Reason |
|-----|--------|
| `004-flagsmith-feature-flags.md` | Replaced by env-based flags |
| `007-clerk-webhooks-for-data-sync.md` | Deprecated per ADR-023 |
| `010-storybook-v9-migration.md` | No longer relevant if removing Storybook |
| `019-simplified-admin-notifications.md` | Superseded by ADR-020 |

#### Action
Move to `docs/historical/` (or delete if historical is removed).

---

### 4. Simplify CI/CD Pipeline (LOW PRIORITY)

#### Current Structure (4 jobs)
1. `test` - Required checks (lint, type-check, tests, build)
2. `quality` - Non-blocking (Storybook, coverage, Codecov)
3. `e2e` - Non-blocking E2E tests
4. `deploy` - Production deployment

#### Proposed Structure (3 jobs)
1. `test` - Keep as-is (required)
2. `e2e` - Keep as-is (valuable for regression)
3. `deploy` - Keep as-is

#### Changes
- Remove `quality` job entirely (or merge coverage into `test`)
- Storybook build removal already eliminates main purpose of quality job
- Consider keeping coverage locally only

---

## Implementation Plan

### Phase 1: Remove Storybook (Day 1)

```bash
# Step 1: Create feature branch
git checkout -b chore/remove-storybook

# Step 2: Remove Storybook directories
rm -rf .storybook/
rm -rf src/stories/
rm -rf storybook-static/

# Step 3: Remove story files from components
find src/components -name "*.stories.tsx" -delete

# Step 4: Update package.json (remove packages & scripts)
# Manual edit required

# Step 5: Update CI/CD
# Remove Storybook build from .github/workflows/ci.yml

# Step 6: Update documentation
# - CLAUDE.md
# - README.md
# - Move ADR-010 to historical

# Step 7: Run npm install to update lockfile
npm install

# Step 8: Verify build works
npm run build
npm test

# Step 9: Commit and push
git add .
git commit -m "chore: remove Storybook and related files"
git push origin chore/remove-storybook
```

### Phase 2: Archive Historical Docs (Day 1)

```bash
# Step 1: Remove historical folder
rm -rf docs/historical/

# Step 2: Commit
git add .
git commit -m "chore: remove historical documentation archive"
```

### Phase 3: Archive Superseded ADRs (Day 2)

```bash
# Step 1: Remove superseded ADRs
rm docs/adr/004-flagsmith-feature-flags.md
rm docs/adr/007-clerk-webhooks-for-data-sync.md
rm docs/adr/010-storybook-v9-migration.md
rm docs/adr/019-simplified-admin-notifications.md

# Step 2: Update ADR README if needed

# Step 3: Commit
git add .
git commit -m "chore: archive superseded ADRs"
```

### Phase 4: Simplify CI/CD (Day 2)

```bash
# Step 1: Edit .github/workflows/ci.yml
# Remove quality job or merge into test

# Step 2: Test locally if possible

# Step 3: Commit
git add .
git commit -m "chore: simplify CI/CD pipeline"
```

---

## Expected Impact

### Metrics Before vs After

| Metric | Before | After | Reduction |
|--------|--------|-------|-----------|
| Dev dependencies | ~25 packages | ~18 packages | ~28% |
| Story files | 41 | 0 | 100% |
| Documentation files | 111 | ~50 | ~55% |
| CI build time | ~X min | ~Y min | TBD |
| `node_modules` size | TBD | TBD | ~5-10% |

### Benefits
1. **Faster CI builds** - No Storybook compilation
2. **Reduced cognitive load** - Fewer files to navigate
3. **Lower maintenance** - No Storybook version upgrades
4. **Cleaner repository** - Focus on production code
5. **Smaller dependency footprint** - Fewer security vulnerabilities to track

### Risks
| Risk | Mitigation |
|------|------------|
| Losing component documentation | Components are simple enough to understand from code |
| Losing historical context | Git history preserves everything |
| Breaking changes | Run full test suite before merging |

---

## What NOT to Simplify

These provide real value and should be kept:

- ✅ **Vitest + Playwright testing** - Core quality assurance
- ✅ **Core documentation** - `CLAUDE.md`, `README.md`, `developer-guide.md`
- ✅ **Feature flag system** - Already simplified to env vars
- ✅ **Active ADRs** - Architectural memory for active features
- ✅ **TypeScript strict mode** - Catches bugs early
- ✅ **Sentry integration** - Production error monitoring
- ✅ **E2E tests** - Real user flow validation

---

## Decision

**Recommendation**: Proceed with all phases of simplification.

**Approval Required**: Developer review and approval before implementation.

---

## References

- [Storybook v9 Migration ADR](../adr/010-storybook-v9-migration.md)
- [Feature Flags ADR](../adr/004-flagsmith-feature-flags.md)
- [Project README](../../README.md)

