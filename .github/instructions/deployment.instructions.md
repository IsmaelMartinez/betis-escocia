# Deployment Workflow Instructions

## Description

This document outlines the guidelines and patterns for CI/CD and deployment workflows, specifically focusing on the project's integration with GitHub Actions and Vercel.

## Relevant Files

- `.github/workflows/enhanced-deploy.yml`: The primary GitHub Actions workflow definition.
- `next.config.js`: Next.js configuration.
- `.env.local`, `.env.development`, `.env.production`: Environment variable files.

## Guidelines

### CI/CD Pipeline Structure (GitHub Actions)

- The project utilizes a single, comprehensive GitHub Actions workflow: `enhanced-deploy.yml`.
- This workflow runs a series of quality checks in parallel:
  ```
  Pipeline Jobs (run in parallel):
  ├── lint (ESLint)
  ├── type-check (TypeScript)
  ├── storybook-build (Component Documentation)
  ├── vitest (Unit/Integration)
  ├── e2e-tests (Playwright)
  └── build-and-lighthouse (Final build + Lighthouse audit)
  ```
- All quality gate jobs must pass before the final build and deployment step.
- Storybook build artifacts are uploaded for 30 days retention.
- **Reference**: For detailed job configurations, consult `.github/workflows/enhanced-deploy.yml`.

### Vercel Deployment

- The project is deployed to Vercel via its native Git integration.
- Upon a push to the `main` branch (or a pull request merge), Vercel automatically triggers a build using `npm run build`.
- There are no separate Vercel-specific deployment scripts or patterns beyond the standard Next.js build process.

### Environment Setup Requirements

- Ensure the following environment variables are set for both local development and Vercel deployments:

  ```bash
  # Core services
  NEXT_PUBLIC_SUPABASE_URL=
  NEXT_PUBLIC_SUPABASE_ANON_KEY=
  NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=
  CLERK_SECRET_KEY=

  # Feature flags (required)
  NEXT_PUBLIC_FLAGSMITH_ENVIRONMENT_ID=

  # Development helpers (for local development)
  NEXT_PUBLIC_DEBUG_MODE=true
  NEXT_PUBLIC_FLAGSMITH_DEBUG=true
  ```

- **Validation Steps**: Verify that all necessary environment variables are correctly configured in the deployment environment to prevent runtime errors.
