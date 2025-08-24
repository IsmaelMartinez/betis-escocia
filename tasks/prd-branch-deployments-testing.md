# PRD: Branch Deployments & Testing

## Problem
Currently pushing directly to main with production database. Need safe testing environment for team collaboration.

## Goals
1. Stop direct pushes to main (protect production)
2. Enable team collaboration with feature branches  
3. Create staging environment for testing
4. Run automated tests before merging

## Solution
Simple workflow: `feature branch → staging → production`

### Environments
- **Staging**: `staging.betis-escocia.vercel.app` (auto-deploy from main)
- **Production**: `betis-escocia.vercel.app` (auto-deploy if tests pass)

### Database
- **Staging**: New Supabase project with test data
- **Production**: Keep current Supabase project

## Requirements

### Branch Protection
1. Protect main branch from direct pushes
2. Require pull requests with code review
3. Run all tests before allowing merge

### Testing Pipeline
4. Run unit tests, integration tests, linting and type checking on every PR
5. Block merge if unit/integration tests or linting fail
6. Run E2E and Lighthouse tests in parallel (non-blocking)

### Deployment
7. Auto-deploy to staging when PR merges to main
8. Auto-deploy to production if unit and integration tests pass
9. Use existing Vercel setup

### Database & Services
10. Create separate Supabase staging project
11. Use separate Clerk test environment for staging
12. Add database seeding for consistent test data

## Non-Goals
- Complex GitFlow branches
- Manual deployment steps  
- Per-branch databases
- Direct production deployments

## Success Metrics
- Zero production incidents from untested code
- All changes go through staging first
- Team can work on features simultaneously

**Estimated Effort**: 1-2 weeks