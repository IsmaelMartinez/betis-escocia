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

> For complete testing architecture, see [CLAUDE.md](../../CLAUDE.md)

Key testing files:

- `tests/`: Unit and integration tests (Vitest)
- `e2e/`: End-to-end tests (Playwright)
- `vitest.config.ts`: Test runner configuration

## Guidelines

### Testing Strategy Overview

> See [CLAUDE.md](../../CLAUDE.md) for complete testing patterns and examples

- **Unit tests**: Vitest in `tests/unit/` (component tests live under `tests/unit/components/`)
- **Integration tests**: API routes in `tests/integration/`
- **E2E tests**: Playwright (public routes only, no auth setup)

### Mocking external surfaces

The only external surface is football-data.org via `FootballDataService`. Mock the service at the top of API-route tests:
