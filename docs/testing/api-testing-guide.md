# API Testing Guide

This guide provides comprehensive patterns and best practices for testing API routes, including specific considerations for Clerk webhooks and security function mocking.

## API Route Testing Strategy
For Next.js API routes with complex dependencies:

### Mock Structure Hierarchy
1. **External Services First**: Mock Clerk, Supabase, external services before imports.
2. **Security Functions**: Mock all security utilities to avoid conflicts.
3. **Test-Specific Overrides**: Use `jest.spyOn()` for test-specific behavior.

### Supabase Query Chain Mocking
The Supabase client uses method chaining that must be properly mocked:
```typescript
(supabase.from as jest.Mock).mockReturnValue({
  select: jest.fn(() => ({
    order: jest.fn(() => ({
      eq: jest.fn(() => Promise.resolve({ data: [], error: null }))
    }))
  }))
});
```

### Security Function Mocking Best Practices
- **Avoid `jest.requireActual()`**: This can cause conflicts with test-specific spies.
- **Default to Valid**: Mock security functions to return valid by default, override in specific tests.
- **Complete Mock Objects**: Include all required properties (e.g., rate limit responses need `allowed`, `remaining`, `resetTime`).
```typescript
jest.mock("@/lib/security", () => ({
  __esModule: true,
  sanitizeObject: jest.fn((obj) => obj),
  validateEmail: jest.fn(() => ({ isValid: true })),
  checkRateLimit: jest.fn(() => ({
    allowed: true,
    remaining: 2,
    resetTime: Date.now() + 100000,
  })),
}));
```

### NextResponse Mocking Pattern
**Established Pattern**: Consistent NextResponse mocking across all API tests:
```typescript
jest.mock("next/server", () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({ data, ...options })),
  },
}));
```

## API Route Test Coverage by Endpoint
Each endpoint should test: success cases, validation failures, rate limiting, database errors, edge cases (not found, empty data).

### GET Endpoints
- Successful data retrieval
- Query parameter handling
- Database error scenarios
- Empty data sets

### POST Endpoints
- Successful submission
- Validation failures (each validation rule)
- Rate limiting
- Database insertion errors
- Update vs. create scenarios

### DELETE Endpoints
- Successful deletion by ID
- Successful deletion by identifier (email, etc.)
- Not found scenarios
- Database deletion errors

### Webhook Endpoints (Clerk Pattern)
- Valid webhook processing (user.created, user.updated, user.deleted)
- Header validation and signature verification
- Data linking/unlinking operations
- Missing data edge cases
- Database error handling
- Invalid webhook types

## Implementation Examples
- **RSVP API Tests**: `tests/integration/api/rsvp.test.ts`
- **Contact API Tests**: `tests/integration/api/contact.test.ts`
- **Admin Roles API Tests**: `tests/integration/api/admin/roles.test.ts`
- **Admin Users API Tests**: `tests/integration/api/admin/users.test.ts`
- **Clerk Webhook API Tests**: `tests/integration/api/webhooks/clerk.test.ts`
- **Trivia API Tests**: `tests/integration/api/trivia.test.ts`
