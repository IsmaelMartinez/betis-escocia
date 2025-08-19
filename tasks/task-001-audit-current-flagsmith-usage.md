# Task 001: Audit Current Flagsmith Usage

## Overview
Before removing Flagsmith, we need to understand exactly how it's currently being used throughout the codebase to ensure we don't break any functionality.

## Acceptance Criteria
- [ ] Complete inventory of all feature flags currently in use
- [ ] List of all files that import from `@/lib/flagsmith`
- [ ] Documentation of current flag states (enabled/disabled)
- [ ] Identification of unused/obsolete flags for removal

## Technical Tasks

### 1. Search and Catalog Flagsmith Usage
```bash
# Find all flagsmith imports
grep -r "from.*flagsmith" src/
grep -r "import.*flagsmith" src/

# Find all hasFeature/getValue calls
grep -r "hasFeature\|getValue" src/

# Find all feature flag strings
grep -r "show-\|enable-\|disable-" src/
```

### 2. Document Current Flags
Create a table in this task with:
- Flag name
- Current default value
- Where it's used
- Purpose/description
- Should keep as env var? (Y/N)

### 3. Check Environment Configuration
- [ ] Review current Flagsmith environment variables
- [ ] Document current flag states in production
- [ ] Identify which flags are actively toggled vs always-on

### 4. Analyze Dependencies
- [ ] Check `package.json` for Flagsmith packages
- [ ] Find Flagsmith configuration files
- [ ] Identify Flagsmith provider setup in React tree

## Deliverables
- [ ] `flagsmith-audit-report.md` with complete usage analysis
- [ ] List of flags to convert to env vars
- [ ] List of flags to remove entirely
- [ ] Estimated scope of code changes needed

## Time Estimate
2-3 hours

## Dependencies
None - this is the first task

## Notes
This audit will inform all subsequent tasks. Be thorough to avoid missing any usage.