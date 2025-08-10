---
description: Guidelines and patterns for testing workflows.
globs:
  - "tests/**/*.ts"
  - "tests/**/*.tsx"
  - "e2e/**/*.ts"
alwaysApply: false
---

# Testing Workflow Instructions

## Description

This document outlines the guidelines and patterns for the testing workflow, covering unit, integration, E2E, and component testing strategies.

## Relevant Files

- `tests/component/`: Vitest component tests integrated with Storybook.
- `vitest.config.ts`: Vitest test runner configuration with path aliases and environment variables.
- `tests/unit/`: Vitest unit tests.
- `tests/integration/`: Vitest integration tests for API routes.
- `e2e/`: Playwright end-to-end tests.
- `tests/setup.ts`: Vitest configuration.
- `playwright/global.setup.ts`: Playwright E2E authentication setup with Clerk.
- `playwright.config.ts`: Playwright E2E test configuration with auth state.

## Guidelines

### Testing Strategy Overview

- **Unit tests**: Vitest, placed in `tests/unit/`.
- **Integration tests**: API routes in `tests/integration/`.
- **E2E tests**: Playwright with Clerk authentication pre-setup.
- **Component tests**: Storybook v9 with Vitest addon integration.
- **CI/CD Pipeline**: GitHub Actions with comprehensive checks (ESLint, TypeScript, Storybook build, Vitest, Playwright, Lighthouse).

### Vitest Configuration and ES Module Handling

- **Problem**: Vitest encounters `SyntaxError: Unexpected token 'export'` when importing Clerk packages.
- **Solution**: Mock Clerk modules at the top of test files before any imports:
