# Fix: E2E Test Authentication Error Resolution

## ✅ Problem Identified and Resolved

### Error Description

```
Error: page.evaluate: Error: Clerk: Failed to sign in: `identifier` is required when `strategy` is `password`.
```

### Root Cause

The Playwright E2E tests use Clerk's `@clerk/testing` library for authentication setup in `playwright/global.setup.ts`. The authentication process requires:

1. `CLERK_TEST_EMAIL` - Test user email address
2. `CLERK_TEST_PASSWORD` - Test user password

These environment variables were present in `.env.local` for local testing but **missing from the GitHub Actions workflow**, causing the CI/CD E2E tests to fail.

### Authentication Flow

```typescript
// playwright/global.setup.ts
await clerk.signIn({
  page,
  signInParams: {
    strategy: 'password',
    identifier: process.env.CLERK_TEST_EMAIL!,    // ❌ Missing in CI
    password: process.env.CLERK_TEST_PASSWORD!,   // ❌ Missing in CI
  },
});
```

## ✅ Solution Implemented

### GitHub Actions Workflow Updates

**File**: `.github/workflows/enhanced-deploy.yml`

#### 1. Added to `e2e-tests` job

```yaml
env:
  CLERK_TEST_EMAIL: ${{ secrets.CLERK_TEST_EMAIL }}
  CLERK_TEST_PASSWORD: ${{ secrets.CLERK_TEST_PASSWORD }}
```

#### 2. Added to `build-and-lighthouse` job

```yaml
env:
  CLERK_TEST_EMAIL: ${{ secrets.CLERK_TEST_EMAIL }}
  CLERK_TEST_PASSWORD: ${{ secrets.CLERK_TEST_PASSWORD }}
```

#### 3. Added to manual environment setup

```yaml
run: |
  CLERK_TEST_EMAIL=${{ secrets.CLERK_TEST_EMAIL }} \
  CLERK_TEST_PASSWORD=${{ secrets.CLERK_TEST_PASSWORD }} \
```

### Local Environment (Already Correct)

**File**: `.env.local`

```bash
CLERK_TEST_EMAIL="test_user@email.app"
CLERK_TEST_PASSWORD="yourSecretValue"
```

## 🚨 Manual Action Required

### GitHub Repository Secrets Setup

You need to add the test credentials as GitHub repository secrets:

1. **Go to**: GitHub repository → Settings → Secrets and variables → Actions
2. **Add new secrets**:
   - Name: `CLERK_TEST_EMAIL`
   - Value: `test_user@email.app`
   - Name: `CLERK_TEST_PASSWORD`  
   - Value: `yourSecretValue`

### Complete Environment Variables Needed

Based on the updated workflow, ensure these secrets exist in GitHub:

```bash
# Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLERK_TEST_EMAIL=test_user@email.app
CLERK_TEST_PASSWORD=yourSecretValue

# Database
NEXT_PUBLIC_SUPABASE_URL=https://...
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# External APIs
FOOTBALL_DATA_API_KEY=...
FOOTBALL_DATA_API_URL=https://api.football-data.org/v4

# Feature Flags
NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID=ser...

# Optional
GOOGLE_SITE_VERIFICATION=...
NEXT_PUBLIC_FEATURE_CLERK_AUTH=true
```

## ✅ Verification Steps

### Local Testing (Already Working)

```bash
npm run test:e2e  # Uses .env.local credentials
```

### CI/CD Testing (After GitHub Secrets Setup)

1. Push changes trigger GitHub Actions
2. E2E tests should authenticate successfully
3. Playwright global setup creates authenticated session
4. All E2E tests run with proper authentication context

## 🔒 Security Considerations

### Test User Credentials

- **Purpose**: Dedicated test user for E2E testing only
- **Scope**: Limited to test environment/staging
- **Permissions**: Minimal required permissions for testing flows
- **Isolation**: Separate from production user accounts

### Environment Variable Security

- **GitHub Secrets**: Encrypted and only accessible to authorized workflows
- **Local `.env.local`**: Never committed to repository (in `.gitignore`)
- **Test Credentials**: Different from production credentials

## 📋 Testing Checklist

- ✅ **Local E2E Tests**: Working with `.env.local` credentials
- ✅ **Build Process**: Successful with updated workflow
- ✅ **GitHub Actions**: Workflow updated with required environment variables
- ⏳ **CI/CD E2E Tests**: Will work after GitHub secrets are added
- ⏳ **Full Pipeline**: Will complete successfully after secrets configuration

## 🎯 Expected Outcome

After adding the GitHub repository secrets:

1. **E2E Tests**: Will authenticate successfully in CI/CD
2. **Playwright Setup**: Will create authenticated session state
3. **Test Coverage**: All protected routes will be testable
4. **CI/CD Pipeline**: Will pass all quality gates including E2E tests

## 📝 Summary

**Problem**: Missing `CLERK_TEST_EMAIL` and `CLERK_TEST_PASSWORD` in GitHub Actions workflow  
**Solution**: Added environment variables to all relevant workflow jobs  
**Action Required**: Add corresponding GitHub repository secrets  
**Result**: E2E tests will authenticate properly in CI/CD environment
