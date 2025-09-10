# Deployment Guide: Branch Deployments & Testing

## Overview

This guide documents the branch deployment and testing workflow for the Betis Escocia project. The system uses a production-first approach with GitHub Actions CI/CD pipeline.

## Current Status ✅

### Completed Infrastructure
- ✅ **Vercel Configuration**: `vercel.json` configured for optimal deployment
- ✅ **CI/CD Pipeline**: Complete GitHub Actions workflow (`.github/workflows/ci.yml`)
- ✅ **Production Deployment**: Auto-deploy to production when tests pass
- ✅ **Environment Variables**: Configured for production environment
- ✅ **Testing Pipeline**: Unit, integration, E2E tests configured

### Current Workflow
```
feature branch → pull request → main (after tests) → production deployment
```

## Branch Protection Setup (MANUAL REQUIRED)

The following branch protection rules need to be configured manually in GitHub repository settings:

### Main Branch Protection Rules
1. **Navigate to**: Repository Settings → Branches → Add Rule
2. **Branch name pattern**: `main`
3. **Configure the following rules**:

#### Core Protection Rules
- ✅ **Require a pull request before merging**
  - Required approving reviews: 0 (small project - PRs required but approvals optional)
  - Dismiss stale PR reviews when new commits are pushed
  - Require review from code owners (if CODEOWNERS file exists)

- ✅ **Require status checks to pass**
  - Choose which status checks must pass before the ref is updated
  - Required status checks:
    - `Tests (Required)` (from CI/CD Pipeline workflow)
    - `Snyk` (security vulnerability scanning)
    - `CodeQL` (code security analysis)

#### Recommended Additional Rules
- ✅ **Block force pushes** - Prevent users with push access from force pushing
- ✅ **Restrict deletions** - Only allow users with bypass permissions to delete refs
- ✅ **Require linear history** - Prevent merge commits from being pushed
- ✅ **Require signed commits** - Commits must have verified signatures (optional but recommended)

#### Optional Advanced Rules
- ⚠️ **Restrict creations** - Only allow users with bypass permission to create refs
- ⚠️ **Restrict updates** - Only allow users with bypass permission to update refs  
- ⚠️ **Require deployments to succeed** - Choose environments that must deploy successfully first
- ⚠️ **Require code scanning results** - Choose which code scanning tools must provide results

### Repository Settings
1. **Navigate to**: Repository Settings → General
2. **Configure merge options**:
   - ✅ Allow merge commits
   - ✅ Allow squash merging (recommended as default)
   - ✅ Allow rebase merging
   - ✅ Automatically delete head branches (after PR merge)

## Deployment Environments

### Production Environment
- **URL**: `https://betis-escocia.vercel.app`
- **Branch**: `main`
- **Deployment**: Automatic on successful tests
- **Database**: Current production Supabase project
- **Authentication**: Current production Clerk instance

### Testing Strategy
- **Unit & Integration Tests**: Block merge if failing (Required)
- **E2E Tests**: Non-blocking, run in parallel
- **Linting & Type Checking**: Block merge if failing (Required)
- **Build**: Block merge if build fails (Required)

## CI/CD Pipeline Details

### Workflow Triggers
```yaml
on:
  push:
    branches: [main, staging]
  pull_request:
    branches: [main]
```

### Pipeline Stages

#### 1. Required Checks (Block merge on failure)
- **Linting**: ESLint code quality checks
- **Type Checking**: TypeScript validation
- **Unit & Integration Tests**: Vitest test suite
- **Build**: Next.js production build

#### 2. Quality Checks (Non-blocking)
- **Storybook Build**: Component documentation
- **Test Coverage**: Coverage report generation
- **Codecov Upload**: Coverage tracking

#### 3. E2E Tests (Non-blocking)
- **Playwright Tests**: Full user workflow testing
- **Artifact Upload**: Test results and reports

#### 4. Production Deployment
- **Trigger**: Push to main branch + all required tests pass
- **Platform**: Vercel
- **Environment**: Production

## Development Workflow

### For Team Members
1. **Create Feature Branch**:
   ```bash
   git checkout -b feature/your-feature-name
   git push -u origin feature/your-feature-name
   ```

2. **Create Pull Request**:
   - Open PR against `main` branch
   - CI/CD pipeline runs automatically
   - Required checks must pass
   - Request review from team member

3. **Merge Process**:
   - Once approved and all checks pass
   - Use "Squash and merge" (recommended)
   - Automatic deployment to production

### For Solo Development (Current)
1. **Direct Push Protection**: Prevented by branch protection
2. **Required Workflow**: Feature branch → PR → Merge (no approvals required)
3. **Quality Gates**: All status checks must pass before merge allowed

## Troubleshooting

### Common Issues

#### Build Failures
- **Environment Variables**: Ensure all required env vars are set in Vercel
- **Dependencies**: Check `package.json` for version conflicts
- **TypeScript Errors**: Run `npm run type-check` locally first

#### Test Failures
- **Unit Tests**: Run `npm test` locally to debug
- **E2E Tests**: Check Playwright configuration and browser setup
- **Environment Setup**: Ensure test environment variables are configured

#### Deployment Issues
- **Vercel Limits**: Check function timeout and memory limits
- **Database Connections**: Verify Supabase connection strings
- **Authentication**: Validate Clerk configuration

### Support Commands
```bash
# Run full test suite locally
npm run lint && npm run type-check && npm test

# Build production locally
npm run build

# Run E2E tests locally
npm run test:e2e

# Check deployment status
curl -s https://betis-escocia.vercel.app/api/health
```

## Security Considerations

### Environment Variables
- All secrets stored in Vercel environment variables
- No sensitive data in repository
- Separate configurations for different environments (when implemented)

### Access Control
- Branch protection prevents direct main pushes
- Pull request reviews required
- Status checks ensure code quality

### Database Security
- Row Level Security (RLS) enabled on all tables
- Authenticated Supabase clients for sensitive operations
- Admin API protection with role-based access

## Next Steps

### Immediate (Manual Setup Required)
1. ⚠️ **Configure Branch Protection Rules** (see section above)
2. ⚠️ **Test PR Workflow** with a sample feature branch
3. ⚠️ **Verify Deployment Process** works end-to-end

### Future Enhancements
1. **Staging Environment**: Separate staging database and environment
2. **Preview Deployments**: Per-PR preview deployments
3. **Database Migrations**: Automated schema migration workflow
4. **Monitoring**: Enhanced deployment monitoring and alerting

## Verification Checklist

- [ ] Branch protection rules configured on main branch
- [ ] Pull request created and merged successfully  
- [ ] All CI/CD pipeline stages execute correctly
- [ ] Production deployment completes automatically
- [ ] Website functionality verified post-deployment
- [ ] Team members have appropriate repository access

---

**Last Updated**: September 8, 2025  
**Status**: Production Ready - Manual Branch Protection Setup Required