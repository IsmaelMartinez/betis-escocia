# Testing Patterns

This document consolidates various testing patterns and strategies used across the project, including unit, integration, and component testing.

## Jest Configuration and ES Module Handling

The project uses Jest with TypeScript and faces challenges with ES modules from dependencies like Clerk. Key learnings:

### ES Module Import Issues
- **Problem**: Jest encounters `SyntaxError: Unexpected token 'export'` when importing Clerk packages.
- **Root Cause**: Clerk's `@clerk/backend` package uses ES modules that Jest cannot parse by default.
- **Solution**: Mock Clerk modules at the top of test files before any imports:
```typescript
// Mock Clerk before any other imports
jest.mock("@clerk/nextjs/server", () => ({
  getAuth: jest.fn(() => ({
    userId: null,
    getToken: jest.fn(() => Promise.resolve(null)),
  })),
}));
```
- **Alternative Attempted**: Adding `transformIgnorePatterns` to Jest config was not sufficient.

### Supabase Query Builder Mocking
Properly mocking Supabase's chainable query builder requires understanding the actual API structure:
```typescript
// Correct pattern for mocking Supabase
jest.mock("@/lib/supabase", () => {
  const mockFrom = jest.fn();
  return {
    supabase: {
      from: mockFrom,
    },
  };
});

// In tests, mock the full chain:
(supabase.from as jest.Mock).mockReturnValue({
  select: jest.fn(() => ({
    eq: jest.fn(() => Promise.resolve({ data: [], error: null })),
  })),
});
```

## Form Validation Testing Patterns

### Validation Rule Precedence Understanding
**Critical Discovery**: Form validation follows a specific precedence order that must be understood for accurate testing:
1. **Required validation** - checked first, stops further validation if field is empty.
2. **Length validation** (minLength/maxLength) - checked before pattern validation.
3. **Pattern validation** - checked after length requirements are met.
4. **Custom validation** - applied last.

**Example Pattern**:
```typescript
// Phone number validation precedence test
// minLength (10) is checked BEFORE custom pattern validation
expect(validateField("123", rules.phone)).toEqual({
  isValid: false,
  error: "El teléfono debe tener al menos 10 caracteres"
});
```

### Spanish Error Message Validation
**Implementation**: All form validation supports Spanish localization with proper error messages:
```typescript
// Spanish error messages pattern
expect(validateField("", rules.required)).toEqual({
  isValid: false,
  error: "Este campo es obligatorio"
});

expect(validateField("ab", rules.minLength)).toEqual({
  isValid: false,
  error: "Debe tener al menos 3 caracteres"
});
```

### Security Function Integration Testing
**Pattern**: Form validation integrates with security utilities that must be properly mocked:
```typescript
// Security function mocking for form validation
jest.mock("@/lib/security", () => ({
  __esModule: true,
  sanitizeInput: jest.fn((value) => value?.trim() || ''),
  validateInputLength: jest.fn((value, max) => ({ 
    isValid: true, 
    sanitized: value 
  })),
  validateEmail: jest.fn((email) => ({ 
    isValid: email?.includes('@') 
  }))
}));
```

### Complex Validation Rules Testing
**Comprehensive Coverage**: Testing covers various validation rule combinations:
- **Required + Pattern**: Email validation with required field.
- **Length + Pattern**: Phone numbers with minimum length and numeric pattern.
- **Multiple Rules**: Text fields with minLength, maxLength, and pattern validation.
- **Custom Validation**: Special validation functions for complex business rules.

### Edge Case Handling
**Thorough Testing**: Form validation handles edge cases properly:
```typescript
// Edge cases covered in testing
- Empty strings and null values
- Whitespace-only input
- Unicode characters and special symbols
- Boundary length values (exact min/max)
- Invalid pattern formats
- Extremely long input values
```

### Test Structure Best Practices
**Organization**: Tests are structured for maintainability and clarity:
```typescript
describe('validateField', () => {
  // Basic validation tests (8 scenarios)
  // Required field validation
  // Pattern validation
  // Length validation
});

describe('validateForm', () => {
  // Form-level validation tests (3 scenarios)
  // Multiple field validation
  // Error aggregation
});

describe('commonValidationRules', () => {
  // Predefined rule tests (15 scenarios)
  // Email, phone, text, textarea validation
});

describe('Edge Cases', () => {
  // Boundary and exceptional scenarios (5 scenarios)
  // Null handling, empty objects, special characters
});
```

### Realistic Security Function Simulation
**Best Practice**: Security functions should be mocked realistically to match production behavior:
```typescript
// Realistic sanitization mock that actually trims whitespace
sanitizeInput: jest.fn((value) => value?.trim() || ''),

// Length validation that respects max limits
validateInputLength: jest.fn((value, max) => ({
  isValid: !value || value.length <= max,
  sanitized: value
})),

// Email validation with actual pattern checking
validateEmail: jest.fn((email) => ({
  isValid: email && email.includes('@') && email.includes('.')
}))
```

## Comprehensive Test Implementation Learnings

### Successfully Tested API Routes
- **Trivia API** (`/api/trivia`): 100% coverage with authentication, scoring, and error scenarios.
- **RSVP API** (`/api/rsvp`): 79.54% coverage across GET/POST/DELETE methods with 16 test scenarios.
- **Contact API** (`/api/contact`): 63.15% coverage with form submission, validation, and admin notifications.
- **Admin Roles API** (`/api/admin/roles`): 86.88% coverage for role assignment and permission validation.
- **Admin Users API** (`/api/admin/users`): 88% coverage with serverRoleUtils abstraction layer.
- **Clerk Webhook API** (`/api/webhooks/clerk`): 100% coverage for user sync and data consistency.

### Systematic Test Implementation Workflow
1. **Mock Setup**: Establish all mocks before imports (Clerk, Supabase, security, NextResponse).
2. **Test Structure**: Organize by HTTP method, then by scenario (success/error cases).
3. **Comprehensive Coverage**: Test authentication, validation, database operations, and error handling.
4. **Consistent Patterns**: Apply learned mocking patterns across all API tests.
5. **Verification**: Run `npm test -- --coverage` to verify actual coverage percentages.

## Reference Test Files
- Unit tests: `tests/unit/` (e.g., `tests/unit/lib/formValidation.test.ts`, `tests/unit/trivia.test.tsx`)
- Integration tests: `tests/integration/` (e.g., `tests/integration/api/admin/contact-submissions.test.ts`, `tests/integration/api/rsvp.test.ts`)
- E2E tests: `e2e/` (e.g., `e2e/trivia.spec.ts`)
