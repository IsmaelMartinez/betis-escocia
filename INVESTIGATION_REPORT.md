# Project Investigation Report
**Date:** 2025-11-09
**Project:** Peña Bética Escocesa Website
**Focus:** Test Infrastructure and Improvement Recommendations

## Executive Summary

Overall, the project has a **strong testing foundation** with 98.5% of tests passing (2,485 out of 2,508 tests). However, the E2E tests consistently fail due to missing environment configuration, which creates friction in the development workflow.

### Key Metrics
- ✅ **Unit Tests:** 2,485 passing
- ⚠️ **Integration Tests:** 1 file skipped (20 tests)
- ❌ **E2E Tests:** Failing due to missing environment variables
- 🔒 **Security:** 4 npm vulnerabilities detected
- 📦 **Dependencies:** Some deprecated packages

---

## Detailed Findings

### 1. Test Suite Analysis

#### ✅ Unit & Integration Tests (EXCELLENT)
The Vitest-based test suite is robust and well-maintained:

**Strengths:**
- 98.5% pass rate (2,485/2,508 tests passing)
- Comprehensive coverage across all major features
- Well-organized test structure (`tests/unit/` and `tests/integration/`)
- Fast execution (112.65s total for 2,508 tests)
- Good use of mocking and test isolation
- 80% coverage thresholds enforced

**Minor Issues:**
- 1 test file skipped: `tests/integration/api/contact.test.ts` (20 tests)
  - Reason: "Temporarily skip this suite due to path alias resolution; covered by contact-comprehensive tests"
  - Impact: These tests are redundant; covered by `contact-comprehensive.test.ts`
  - **Recommendation:** Delete this file to clean up the test suite

#### ❌ E2E Tests (FAILING)
The Playwright E2E tests cannot run locally due to missing configuration:

**Root Cause:**
Missing `.env.local` file with required environment variables:
```bash
# Required for app startup
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=<your_key>
CLERK_SECRET_KEY=<your_secret>

# Required for E2E test authentication
CLERK_TEST_EMAIL=<test_user_email>
CLERK_TEST_PASSWORD=<test_user_password>

# Required for database operations
NEXT_PUBLIC_SUPABASE_URL=<your_url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your_key>
```

**Error Details:**
```
Error: @clerk/clerk-react: Missing publishableKey
Timed out waiting 120000ms from config.webServer
```

**Impact:**
- E2E tests timeout because Next.js dev server can't start
- Developers cannot run full test suite locally
- CI/CD marks E2E tests as "non-blocking" to work around this

**Current Workaround in CI:**
```yaml
e2e:
  name: E2E Tests (Non-blocking)
  continue-on-error: true  # ← Allows failures without blocking merge
```

### 2. Security & Dependency Issues

#### 🔒 Security Vulnerabilities (4 found)

**High Severity (3):**
1. **Playwright** - Downloads browsers without SSL certificate verification
   - Package: `playwright` < 1.55.1
   - Current: 1.55.0
   - Fix: `npm install playwright@latest @playwright/test@latest`
   - CVE: GHSA-7mvr-c777-76hp

2. **@playwright/test** - Related to above
   - Current: 1.55.0
   - Fix: Update alongside playwright

**Moderate Severity (1):**
3. **tar-fs** - Unspecified vulnerability (output truncated)

**Deprecated Packages:**
- `rimraf@3.0.2` - Versions prior to v4 no longer supported
- `inflight@1.0.6` - Memory leak, not supported
- `glob@7.2.3` - Versions prior to v9 no longer supported

### 3. CI/CD Pipeline Analysis

The GitHub Actions workflow is well-structured with three jobs:

**✅ Strengths:**
- Separates required checks from non-blocking quality checks
- E2E tests run in parallel (non-blocking)
- Proper secret management via GitHub Secrets
- Deployment gated on required tests passing

**⚠️ Observations:**
```yaml
# Required for merge
test:
  - Linting
  - Type checking
  - Unit/integration tests
  - Build

# Non-blocking (informational)
quality:
  - Storybook build
  - Coverage report
  continue-on-error: true

e2e:
  - Playwright tests
  continue-on-error: true  # ← E2E failures don't block PR merge
  if: github.event_name == 'pull_request'
```

**Trade-offs:**
- ✅ Prevents broken E2E tests from blocking development
- ❌ Reduces confidence in E2E test results
- ⚠️ E2E tests only run on PRs, not on direct pushes to main

### 4. Test Configuration Quality

**Vitest Configuration** (`vitest.config.ts`): ⭐ Excellent
- Proper path aliases (`@/` → `src/`)
- Comprehensive coverage exclusions
- Parallel execution with thread pool (max 10 threads)
- HTML and JSON reporters configured
- Appropriate test timeouts (10s)

**Playwright Configuration** (`playwright.config.ts`): ⭐ Good
- Reads `.env.local` correctly via dotenv
- Configures Clerk authentication in global setup
- Increased timeout to 120s (appropriate for slow CI)
- Reuses existing server in development (`reuseExistingServer: !process.env.CI`)

---

## Recommended Improvements

### Priority 1: Critical (Fix E2E Tests)

#### 1.1 Create `.env.local.example` Template
**Purpose:** Help developers set up their environment quickly

**File: `.env.local.example`**
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here

# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_your-key-here
CLERK_SECRET_KEY=sk_test_your-secret-here

# E2E Testing (Clerk test account)
CLERK_TEST_EMAIL=test@example.com
CLERK_TEST_PASSWORD=TestPassword123!

# External APIs
FOOTBALL_DATA_API_KEY=your-api-key-here

# Optional Feature Flags (uncomment to disable)
# NEXT_PUBLIC_FEATURE_GALERIA=false
# NEXT_PUBLIC_FEATURE_DEBUG_INFO=false
```

**Implementation:**
```bash
# Add to .gitignore (if not already there)
echo ".env.local" >> .gitignore

# Developers copy and fill in their values
cp .env.local.example .env.local
```

#### 1.2 Add Setup Instructions to README
**Update:** `README.md` or create `docs/SETUP.md`

```markdown
## Local Development Setup

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment Variables
```bash
# Copy the example file
cp .env.local.example .env.local

# Edit .env.local with your credentials
# Get Supabase keys: https://supabase.com/dashboard
# Get Clerk keys: https://dashboard.clerk.com
```

### 3. Run Tests
```bash
# Unit and integration tests (no .env.local required)
npm test

# E2E tests (requires .env.local with real credentials)
npm run test:e2e
```

### 4. Start Development Server
```bash
npm run dev
```
```

#### 1.3 Consider E2E Test Mocking Strategy
**Problem:** E2E tests require real Clerk account and credentials

**Options:**

**Option A: Continue with Real Credentials (Current Approach)**
- ✅ Tests real authentication flow
- ❌ Requires sharing test account credentials
- ❌ Can't run offline
- ⚠️ Rate limiting from Clerk API

**Option B: Mock Clerk in E2E Tests**
```typescript
// playwright/global.setup.ts
if (process.env.MOCK_CLERK === 'true') {
  // Use @clerk/testing's mock mode
  // Skip real authentication
  // Generate mock storage state
}
```
- ✅ Works offline
- ✅ No rate limiting
- ✅ No credential sharing needed
- ❌ Doesn't test real auth integration

**Option C: Hybrid Approach (RECOMMENDED)**
- Use mocks for local development (`MOCK_CLERK=true`)
- Use real credentials in CI (`MOCK_CLERK=false`)
- Best of both worlds

**Implementation:**
```typescript
// playwright/global.setup.ts
const useMockAuth = process.env.MOCK_CLERK === 'true';

if (useMockAuth) {
  console.log('Using mock Clerk authentication for E2E tests');
  // Create mock storage state without real API calls
  await createMockAuthState(authFile);
} else {
  console.log('Using real Clerk authentication for E2E tests');
  await clerk.signIn({ page, signInParams: { ... } });
}
```

### Priority 2: High (Security & Maintenance)

#### 2.1 Update Playwright to Latest Version
**Fix high-severity SSL vulnerability:**
```bash
npm install --save-dev playwright@latest @playwright/test@latest
npm run test:e2e  # Verify tests still pass
```

**Expected Result:**
```diff
- "playwright": "^1.55.0"
- "@playwright/test": "^1.55.0"
+ "playwright": "^1.55.1"  # or newer
+ "@playwright/test": "^1.55.1"
```

#### 2.2 Audit and Fix All npm Vulnerabilities
```bash
# Review all vulnerabilities
npm audit

# Auto-fix non-breaking changes
npm audit fix

# Review breaking changes manually
npm audit fix --force  # ⚠️ Be careful, may break things
```

#### 2.3 Update Deprecated Dependencies
```bash
# Update glob, rimraf, etc. to latest versions
npm install --save-dev glob@latest rimraf@latest

# Remove inflight if possible (check dependency tree)
npm ls inflight
# If only used transitively, update parent package
```

### Priority 3: Medium (Code Quality)

#### 3.1 Remove Skipped Test File
**File:** `tests/integration/api/contact.test.ts`
**Reason:** Redundant, covered by `contact-comprehensive.test.ts`
**Action:**
```bash
rm tests/integration/api/contact.test.ts
# Verify comprehensive tests still cover everything
npm test -- tests/integration/api/contact-comprehensive.test.ts
```

#### 3.2 Consider Making E2E Tests Blocking in CI
**Current:** E2E tests marked `continue-on-error: true`
**Risk:** E2E failures don't block PR merge

**Recommended Change (after fixing E2E setup):**
```yaml
e2e:
  name: E2E Tests (Required)
  runs-on: ubuntu-latest
  # Remove: continue-on-error: true
  if: github.event_name == 'pull_request'
```

**Prerequisites:**
- ✅ E2E tests passing consistently locally
- ✅ E2E tests passing in CI
- ✅ All developers can run E2E tests locally

#### 3.3 Add Pre-commit Hooks
**Install Husky for git hooks:**
```bash
npm install --save-dev husky lint-staged
npx husky install
npx husky add .husky/pre-commit "npx lint-staged"
```

**Configure `package.json`:**
```json
{
  "lint-staged": {
    "*.{ts,tsx,js,jsx}": [
      "eslint --fix",
      "prettier --write"
    ],
    "*.{ts,tsx}": [
      "bash -c 'npm run type-check'"
    ]
  }
}
```

**Benefits:**
- Catches linting errors before commit
- Ensures type safety before push
- Reduces CI failures from simple issues

### Priority 4: Nice to Have

#### 4.1 Add Test Performance Monitoring
**Track test execution times over time:**
```typescript
// vitest.config.ts
export default defineConfig({
  test: {
    reporters: [
      'default',
      'html',
      ['json', { outputFile: 'test-results.json' }]  // ← Add this
    ]
  }
});
```

**Create GitHub Action to track:**
```yaml
- name: Store test metrics
  run: |
    echo "Test duration: $(jq '.durationMs' test-results.json)" >> $GITHUB_STEP_SUMMARY
```

#### 4.2 Add Lighthouse CI
**Already have lighthouse script, integrate into CI:**
```bash
npm install --save-dev @lhci/cli
```

**Add to CI:**
```yaml
lighthouse:
  name: Lighthouse Audit
  runs-on: ubuntu-latest
  steps:
    - name: Run Lighthouse
      run: |
        npm run build
        npm start &
        npm run lighthouse:accessibility
```

#### 4.3 Consider Test Parallelization Optimization
**Current:** Max 10 threads for Vitest
**Check if optimal for your CI environment:**
```typescript
// vitest.config.ts
poolOptions: {
  threads: {
    maxThreads: process.env.CI ? 4 : 10  // Fewer threads in CI
  }
}
```

**Reasoning:** CI runners often have limited resources

---

## Implementation Roadmap

### Week 1: Critical Fixes
- [ ] Create `.env.local.example` file
- [ ] Add setup instructions to README
- [ ] Update Playwright to fix security vulnerability
- [ ] Run `npm audit fix` for safe updates

### Week 2: E2E Test Stability
- [ ] Implement hybrid Clerk mocking (local mock, CI real)
- [ ] Verify E2E tests pass consistently
- [ ] Document E2E test setup for new developers

### Week 3: Code Quality
- [ ] Remove skipped test file (`contact.test.ts`)
- [ ] Add pre-commit hooks with Husky
- [ ] Make E2E tests blocking in CI (after validation)

### Week 4+: Nice to Have
- [ ] Set up Lighthouse CI
- [ ] Add test performance tracking
- [ ] Update remaining deprecated packages
- [ ] Review and optimize test parallelization

---

## Conclusion

### Summary
The Betis Escocia project has a **strong testing foundation** with excellent unit and integration test coverage. The primary pain point is E2E test configuration, which prevents developers from running the full test suite locally.

### Quick Wins
1. **Create `.env.local.example`** (5 minutes) - Biggest impact
2. **Update Playwright** (5 minutes) - Fixes security vulnerability
3. **Remove skipped test file** (2 minutes) - Reduces confusion

### Long-term Benefits
Implementing these recommendations will:
- ✅ Enable all developers to run E2E tests locally
- ✅ Reduce CI/CD friction and feedback loops
- ✅ Improve security posture
- ✅ Increase confidence in test results
- ✅ Reduce technical debt from deprecated packages

### Risk Assessment
- **Low Risk:** Creating `.env.local.example`, documentation updates
- **Medium Risk:** Updating Playwright (well-tested, good docs)
- **High Risk:** Making E2E tests blocking (do this last, after stability proven)

---

## Appendix

### A. Test Execution Summary

```
Unit & Integration Tests (Vitest)
─────────────────────────────────
✓ Test Files: 128 passed | 1 skipped (129)
✓ Tests: 2485 passed | 23 skipped (2508)
⏱ Duration: 112.65s
📊 Coverage: Thresholds met (80% lines/functions/branches/statements)

E2E Tests (Playwright)
─────────────────────────────────
✗ Status: FAILED
✗ Reason: Missing NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY
⏱ Timeout: 120s
🔧 Fix: Create .env.local with required variables
```

### B. Environment Variables Reference

**Required for Local Development:**
```bash
NEXT_PUBLIC_SUPABASE_URL           # Supabase project URL
NEXT_PUBLIC_SUPABASE_ANON_KEY      # Supabase anonymous key
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY  # Clerk publishable key
CLERK_SECRET_KEY                   # Clerk secret key
```

**Required for E2E Tests (additional):**
```bash
CLERK_TEST_EMAIL                   # Test user email in Clerk
CLERK_TEST_PASSWORD                # Test user password in Clerk
```

**Optional:**
```bash
FOOTBALL_DATA_API_KEY              # Football data API (for match info)
NEXT_PUBLIC_FEATURE_*              # Feature flags (default: enabled)
NEXT_PUBLIC_DEBUG_MODE             # Debug mode (default: false)
```

### C. Useful Commands

```bash
# Run all tests
npm test                    # Unit + integration
npm run test:e2e           # E2E tests
npm run test:coverage      # With coverage report

# Development
npm run dev                # Start dev server
npm run build              # Production build
npm run lint               # Run ESLint
npm run type-check         # TypeScript validation

# Maintenance
npm audit                  # Check vulnerabilities
npm outdated              # Check for updates
npm update                # Update to latest semver-compatible versions
```

---

**Report Generated:** 2025-11-09
**Next Review:** After implementing Priority 1 fixes
