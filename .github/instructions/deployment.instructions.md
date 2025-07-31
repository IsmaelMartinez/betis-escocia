---
description: Guidelines and patterns for CI/CD and deployment workflows.
globs:
  - ".github/workflows/*.yml"
  - "next.config.js"
alwaysApply: false
---
# Deployment Workflow Instructions

## Description
This document outlines the guidelines and patterns for CI/CD and deployment workflows, covering GitHub Actions, Vercel deployment, and environment setup.

## Relevant Files
- `.github/workflows/`: Contains GitHub Actions workflow definitions (e.g., `enhanced-deploy.yml`).
- `next.config.js`: Next.js configuration, potentially including deployment-related settings.
- `.env.local`, `.env.development`, `.env.production`: Environment variable files.

## Guidelines

### CI/CD Pipeline Structure (GitHub Actions)
- The GitHub Actions workflow (`enhanced-deploy.yml`) runs comprehensive quality checks:
  ```
  Pipeline Jobs (run in parallel):
  ├── lint (ESLint)
  ├── type-check (TypeScript)
  ├── storybook-build (Component Documentation)
  ├── jest-tests (Unit/Integration)
  ├── e2e-tests (Playwright)
  └── build-and-lighthouse (Final build + Lighthouse audit)
  ```
- All quality gate jobs must pass before the final build and deployment step.
- Storybook build artifacts are uploaded for 30 days retention.
- **Reference**: For more details, consult the specific workflow files in `.github/workflows/`.

### Vercel Deployment Patterns
- This project is designed for deployment on Vercel, leveraging Next.js capabilities.
- Ensure `next.config.js` is configured appropriately for Vercel deployment if custom settings are required.

### Environment Setup Requirements
- Ensure the following environment variables are set for different environments (development, production):
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

## Notes
- This document focuses on organizing existing content rather than creating new documentation.
- All workflow instruction files should reference existing `/docs` and `/tasks` content instead of duplicating it.
- Maintain version control during migration by keeping old files until restructure is validated.
