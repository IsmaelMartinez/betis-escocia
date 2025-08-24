# Tasks: Branch Deployments & Testing Implementation

Based on PRD: `prd-branch-deployments-testing.md`

## Relevant Files

- `.github/workflows/ci.yml` - GitHub Actions workflow for testing and deployment pipeline
- `.github/workflows/deploy.yml` - Deployment workflow for staging and production
- `vercel.json` - Vercel configuration for multiple environments
- `.env.production` - Production environment variables  
- `.env.staging` - Staging environment variables (current production becomes staging)
- `scripts/db-consolidate.js` - Script to analyze and consolidate database migrations
- `scripts/seed-staging.js` - Database seeding script for staging environment
- `supabase/migrations/` - Consolidated database migration files
- `docs/deployment-guide.md` - Documentation for new deployment process
- `package.json` - Updated scripts for environment-specific commands

### Notes

- Current production environment will become staging/testing environment
- New environments will become the production setup
- Database migration consolidation may require significant effort to analyze existing schema
- Use `npm run test` for unit/integration tests, `npm run test:e2e` for E2E tests
- Use `npm run lighthouse` for performance testing

## Tasks

- [ ] 1.0 Create New Production Environment Infrastructure (Vercel)
  - [ ] 1.1 Create new Vercel project for production deployment
  - [ ] 1.2 Configure custom domain `betis-escocia.vercel.app` for new production
  - [ ] 1.3 Set up staging domain using current production setup
  - [ ] 1.4 Configure Vercel environment variables for production
  - [ ] 1.5 Test deployment to new production environment
  - [ ] 1.6 Update `vercel.json` to support multiple environments

- [ ] 2.0 Set up New Production Database and Services (Supabase + Clerk)
  - [ ] 2.1 Create new Supabase project for production database
  - [ ] 2.2 Set up new Clerk application for production authentication
  - [ ] 2.3 Configure RLS policies in new production Supabase project
  - [ ] 2.4 Set up Clerk webhook endpoints for new production environment
  - [ ] 2.5 Test authentication flow with new production services
  - [ ] 2.6 Configure API keys and connection strings for new production

- [ ] 3.0 Consolidate and Migrate Database Schema
  - [ ] 3.1 Analyze current database schema and identify all tables/relationships
  - [ ] 3.2 Review existing migration history and manual schema changes
  - [ ] 3.3 Create consolidated migration script with complete schema
  - [ ] 3.4 Test migration script against staging database
  - [ ] 3.5 Migrate data from current production to new production database
  - [ ] 3.6 Verify data integrity and functionality after migration
  - [ ] 3.7 Create database seeding script for staging environment

- [ ] 4.0 Configure GitHub Actions CI/CD Pipeline
  - [ ] 4.1 Create CI workflow for pull request testing (unit, integration, linting)
  - [ ] 4.2 Configure E2E and Lighthouse tests to run in parallel (non-blocking)
  - [ ] 4.3 Set up auto-deployment to staging on main branch merge
  - [ ] 4.4 Configure auto-deployment to production when tests pass
  - [ ] 4.5 Add environment variable injection for different environments
  - [ ] 4.6 Set up deployment status notifications
  - [ ] 4.7 Test complete CI/CD pipeline with feature branch

- [ ] 5.0 Set up GitHub Branch Protection and Repository Configuration
  - [ ] 5.1 Enable branch protection rules for main branch
  - [ ] 5.2 Require pull request reviews before merging
  - [ ] 5.3 Require status checks to pass before merging
  - [ ] 5.4 Enable automatic deletion of feature branches after merge
  - [ ] 5.5 Configure team access and review assignment rules
  - [ ] 5.6 Update repository settings for collaboration workflow
  - [ ] 5.7 Create documentation for team on new branching workflow