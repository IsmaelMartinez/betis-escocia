# ADR-008: Testing Strategy

## Status
Accepted

## Decision
**Vitest** for unit/integration tests, **Playwright** for E2E tests.

## Why Vitest
- 20-40% faster than Jest
- Native TypeScript support
- Same build tool as development (Vite)
- Jest-compatible API for easy migration

## Why Playwright
- Real browser automation
- Multi-browser support (Chrome, Firefox, Safari)
- Excellent debugging tools
- Clerk authentication integration via `@clerk/testing`

## Test Structure
```
tests/
├── unit/           # Vitest unit tests
├── integration/    # Vitest integration tests (API routes)
└── helpers/        # Test utilities

e2e/                # Playwright E2E tests
```

## Commands
```bash
npm test              # Vitest unit & integration
npm run test:watch    # Vitest watch mode
npm run test:coverage # Coverage report (80% threshold)
npm run test:e2e      # Playwright E2E tests
```

## Coverage Thresholds
- Lines: 80%
- Functions: 80%
- Branches: 80%
- Statements: 80%

