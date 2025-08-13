## Relevant Files

- `package.json` - To add Zod dependency.
- `next.config.js` - To configure CSP and other security headers.
- `src/middleware.ts` - To implement rate limiting and simplify IP extraction.
- `src/lib/security.ts` - To reduce custom security code, keeping only business-specific validations.
- `src/lib/schemas/` - New directory to store Zod validation schemas.
- `src/app/api/**/*.ts` - All API routes will need to be updated to use Zod schemas for validation.
- `tests/unit/**/*.test.ts` or `tests/integration/**/*.test.ts` (depending on existing structure) - To update security tests for new patterns.
- `docs/DEVELOPER_GUIDE.md` or similar documentation files - To update security patterns for developers.
- `docs/adr/018-simplify-security-layer.md` - To mark as accepted.

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx vitest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Vitest configuration.

## Tasks

- [ ] 1.0 Set up Core Framework Security Features
  - [x] 1.1 Add Zod dependency to `package.json`.
  - [x] 1.2 Configure Content Security Policy (CSP) and other security headers in `next.config.js`.
  - [x] 1.3 Implement rate limiting logic within `src/middleware.ts` using Next.js middleware.
  - [x] 1.4 Simplify IP extraction logic in `src/middleware.ts`, removing complex header parsing.
  - [x] 1.5 Ensure custom CSRF token generation is removed, relying on Next.js framework patterns.
  - [x] 1.6 Remove custom HTML sanitization, relying on React's built-in XSS protection.
- [ ] 2.0 Migrate API Routes to Zod Schema Validation
  - [ ] 2.1 Create `src/lib/schemas/` directory for Zod validation schemas.
  - [ ] 2.2 Define Zod schemas for all API route inputs within `src/lib/schemas/`.
  - [ ] 2.3 Update all API routes (`src/app/api/**/*.ts`) to use Zod schema validation for input.
  - [ ] 2.4 Implement consistent error handling patterns for Zod validation failures across API routes.
  - [ ] 2.5 Ensure TypeScript type safety is maintained or improved with Zod integration.
- [ ] 3.0 Clean Up Legacy Security Implementations
  - [ ] 3.1 Refactor `src/lib/security.ts` to reduce custom security code, keeping only Spanish-specific email validation and business-specific input length requirements.
  - [ ] 3.2 Remove any remaining complex HTML/XSS sanitization logic from `src/lib/security.ts` or other files.
  - [ ] 3.3 Verify that all custom security implementations are replaced in one comprehensive update, avoiding dual systems.
  - [ ] 3.4 Remove any unnecessary security-related dependencies from `package.json`.
- [ ] 4.0 Implement and Verify Security Tests
  - [ ] 4.1 Update existing security tests to cover the new Next.js framework-based security patterns.
  - [ ] 4.2 Create new tests as needed to ensure comprehensive coverage of rate limiting, CSP, and Zod validation.
  - [ ] 4.3 Run all security tests to ensure they pass and validate the new implementations.
  - [ ] 4.4 Verify that the middleware changes do not significantly impact application performance.
  - [ ] 4.5 Conduct a preliminary security audit or penetration testing to validate the simplified security layer.
- [ ] 5.0 Finalize Documentation and Project Management Tasks
  - [ ] 5.1 Update developer documentation (e.g., `docs/DEVELOPER_GUIDE.md`) with the new security patterns and best practices.
  - [ ] 5.2 Mark ADR-018 (Simplify Security Layer) as "Accepted" in `docs/adr/018-simplify-security-layer.md`.
  - [ ] 5.3 Monitor application performance post-deployment to ensure no regressions due to security changes.