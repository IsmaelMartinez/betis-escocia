# Tasks for Comprehensive Test Coverage Implementation

## Overall Test Coverage: 13.62%

## Relevant Files

### API Routes (Primary Focus)
- `src/app/api/trivia/route.ts` - Trivia API endpoints with authentication and scoring logic
- `tests/integration/api/trivia.test.ts` - Integration tests for trivia API endpoints
- `src/app/api/rsvp/route.ts` - RSVP management API with user authentication
- `tests/integration/api/rsvp.test.ts` - Integration tests for RSVP functionality
- `src/app/api/contact/route.ts` - Contact form submission API
- `tests/integration/api/contact.test.ts` - Integration tests for contact submissions
- `src/app/api/admin/roles/route.ts` - Admin role management API
- `tests/integration/api/admin/roles.test.ts` - Integration tests for admin role management
- `src/app/api/admin/users/route.ts` - User management API for admins
- `tests/integration/api/admin/users.test.ts` - Integration tests for user management
- `src/app/api/webhooks/clerk/route.ts` - Clerk webhook handler for user sync
- `tests/integration/api/webhooks/clerk.test.ts` - Integration tests for webhook processing
- `src/app/api/standings/route.ts` - Football standings API with caching
- `tests/integration/api/standings.test.ts` - Integration tests for standings (already exists)

### Core Business Logic
- `src/lib/supabase.ts` - Database interaction functions and RLS operations
- `tests/unit/lib/supabase.test.ts` - Unit tests for database functions (expand existing)
- `src/lib/adminApiProtection.ts` - Admin authentication and authorization utilities
- `tests/unit/lib/adminApiProtection.test.ts` - Unit tests for admin protection logic
- `src/lib/security.ts` - Security utilities and validation functions
- `tests/unit/lib/security.test.ts` - Unit tests for security functions
- `src/lib/formValidation.ts` - Form validation utilities
- `tests/unit/lib/formValidation.test.ts` - Unit tests for form validation

### Feature Flags and Services
- `src/lib/flagsmith/index.ts` - Flagsmith integration and feature flag utilities
- `tests/unit/lib/flagsmith/index.test.ts` - Unit tests for feature flag functions (expand existing)
- `src/lib/emailService.ts` - Email service integration
- `tests/unit/lib/emailService.test.ts` - Unit tests for email service
- `src/lib/roleUtils.ts` - Role management utilities
- `tests/unit/lib/roleUtils.test.ts` - Unit tests for role utilities

### Test Infrastructure
- `tests/helpers/mockFactories.ts` - Test data factories and mock utilities
- `tests/helpers/testHelpers.ts` - Shared test utilities and setup functions
- `tests/setup.ts` - Global test configuration (enhance existing)
- `jest.config.js` - Jest configuration with coverage thresholds (enhance existing)

### Middleware and Integration
- `src/middleware.ts` - Next.js middleware for authentication and security
- `tests/unit/middleware.test.ts` - Unit tests for middleware functionality
- `tests/integration/external/footballApi.test.ts` - Integration tests for external Football API
- `tests/integration/auth/clerkIntegration.test.ts` - Integration tests for Clerk authentication flows

### Notes

- Unit tests should be placed in `tests/unit/` with directory structure mirroring `src/`
- Integration tests should be placed in `tests/integration/` organized by feature area
- Use `npm test` to run all tests or `npm test -- --testPathPattern=specific/test/file` for specific tests
- Target 90% coverage for API routes and core business logic, 80% for utilities
- Mock external dependencies (Clerk, Supabase, external APIs) in unit tests
- Use real test database for integration tests where appropriate

## Tasks

- [ ] 1.0 API Route Testing Implementation (Target: 90% Coverage)
  - [x] 1.1 Create comprehensive tests for trivia API routes (`/api/trivia/*`) including authentication, scoring, and error scenarios
  - [x] 1.2 Create tests for RSVP API route (`/api/rsvp`) covering user authentication, event management, and validation - **COMPLETED: Applied same pattern as contact tests with proper Clerk/Supabase mocking, covers all 3 HTTP methods (GET/POST/DELETE) with 16 comprehensive test scenarios**
  - [x] 1.3 Create tests for contact API route (`/api/contact`) including form submission, validation, and admin notifications - **COMPLETED: Fixed ES module import issues with Clerk, properly mocked Supabase query builders, resolved security function mocking conflicts**
  - [x] 1.4 Create tests for admin role management API (`/api/admin/roles`) covering role assignment and permission validation - **COMPLETED: Added comprehensive integration tests for GET, POST, PUT, and DELETE endpoints, including authentication, validation, and error handling. Resolved Jest configuration issues with Clerk and Next.js server components.**
  - [x] 1.5 Create tests for admin user management API (`/api/admin/users`) including user lookup and role management - **COMPLETED: Refactored API to use serverRoleUtils abstraction layer, updated all tests to mock serverRoleUtils instead of direct Clerk client, fixed NextResponse mocking issues, and ensured proper error handling. All 16 test scenarios now pass covering GET, PATCH, and DELETE endpoints with authentication, validation, and error cases.**
  - [x] 1.6 Create tests for Clerk webhook handler (`/api/webhooks/clerk`) covering user sync and data consistency - **COMPLETED: Created comprehensive integration tests for webhook processing including user.created, user.updated, and user.deleted events. Tests cover webhook verification, header validation, data linking/unlinking operations, and error scenarios. Properly mocked svix library, Next.js headers, and Supabase functions. All 11 test scenarios pass covering successful processing, missing data edge cases, and database error handling.**
  - [x] 1.7 Enhance existing standings API tests (`/api/standings`) to cover caching scenarios and error handling - **COMPLETED: Enhanced existing standings tests with comprehensive caching scenarios (fresh cache, stale cache, empty cache, cache retrieval failures, cache save failures) and extensive error handling (network errors, API rate limiting, timeouts, generic errors, non-Error exceptions). Added 11 comprehensive test scenarios covering all cache states and error conditions with proper NextResponse and external service mocking. All tests pass successfully.**
  - [x] 1.8 Create tests for admin contact submissions API (`/api/admin/contact-submissions`) - **COMPLETED: Created comprehensive integration tests with 15 test scenarios covering authentication/authorization (3 tests), request validation (4 tests), database operations (3 tests), error handling (3 tests), token integration (1 test), and status tracking (1 test). Tests cover Clerk authentication integration, admin role validation, status management, database operations, and error handling. All tests pass successfully with proper mocking patterns established.**
  - [x] 1.9 Create tests for admin sync matches API (`/api/admin/sync-matches`) covering match synchronization, data processing, and external API integration
  - [x] 1.9.1 Implement authentication and authorization tests
  - [x] 1.9.2 Implement rate limiting tests
  - [x] 1.9.3 Implement successful match synchronization tests (new and updated matches)
  - [x] 1.9.4 Implement error handling tests for FootballDataService and Supabase operations
  - [x] 1.9.5 Implement edge case tests (e.g., null scores, unfinished matches, no matches returned)

- [ ] 2.0 Core Business Logic Testing (Supabase Functions) (Target: 90% Coverage)
  - [ ] 2.1 Expand existing Supabase function tests to cover all CRUD operations for users, RSVPs, and trivia scores
  - [ ] 2.2 Create tests for RLS (Row Level Security) scenarios ensuring proper data access control
  - [ ] 2.3 Create tests for data transformation functions and business logic calculations
  - [ ] 2.4 Create tests for error handling and validation in database operations
  - [ ] 2.5 Create tests for caching mechanisms and data consistency checks
  - [ ] 2.6 Create tests for user authentication and authorization flows with Supabase
  - [ ] 2.7 Create tests for trivia scoring and leaderboard calculation functions

- [ ] 3.0 Utility Functions and Services Testing (Target: 80% Coverage)
  - [ ] 3.1 Expand existing Flagsmith tests to cover all feature flag scenarios and error handling
  - [ ] 3.2 Create comprehensive tests for admin API protection utilities including role validation and error scenarios
  - [ ] 3.3 Create tests for security utilities covering input validation, sanitization, and CORS handling
  - [ ] 3.4 Create tests for form validation utilities covering all validation rules and error messages
  - [ ] 3.5 Create tests for email service integration including success and failure scenarios
  - [ ] 3.6 Create tests for role management utilities covering role assignment and permission checks
  - [ ] 3.7 Create tests for date/time utilities and formatting functions used across the application

- [ ] 4.0 Integration Testing Infrastructure (Target: 80% Coverage)
  - [ ] 4.1 Create integration tests for external Football API service including rate limiting and error handling
  - [ ] 4.2 Create integration tests for Clerk authentication flows including login, logout, and user management
  - [ ] 4.3 Create integration tests for Supabase database operations with real test database
  - [ ] 4.4 Create integration tests for Flagsmith feature flag responses and configuration changes
  - [ ] 4.5 Create tests for middleware functionality including route protection and security headers
  - [ ] 4.6 Create integration tests for email service delivery and template rendering
  - [ ] 4.7 Create end-to-end API workflow tests combining multiple services and authentication

- [ ] 5.0 Mock Strategy and Test Foundation Setup
  - [ ] 5.1 Create comprehensive mock factories for test data generation (users, events, scores, etc.)
  - [ ] 5.2 Implement Mock Service Worker (MSW) setup for external API mocking in integration tests
  - [ ] 5.3 Create shared test utilities and helper functions for common testing patterns
  - [ ] 5.4 Configure test database setup and cleanup procedures for integration tests
  - [ ] 5.5 Enhance Jest configuration with coverage thresholds and reporting improvements
  - [ ] 5.6 Create testing documentation and guidelines for writing effective tests
  - [ ] 5.7 Set up automated coverage reporting and CI integration for coverage enforcement
