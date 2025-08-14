# PRD: Simplify Security Layer

## Introduction/Overview
This feature simplifies the security layer by replacing custom security implementations with Next.js built-in security features and modern web standards. The goal is to reduce complexity while maintaining comprehensive protection against web attacks, handling high-traffic scenarios, and ensuring regulatory compliance.

Currently, we have ~205 lines of custom security code that reimplements functionality available in Next.js framework and modern browsers, creating maintenance overhead and potential security gaps.

## Goals
1. **Reduce complexity**: Remove ~150+ lines of custom security code
2. **Improve security posture**: Use framework-tested security implementations
3. **Enhance performance**: Leverage Next.js optimized middleware and built-ins
4. **Maintain compliance**: Ensure all security requirements are met with simpler approach
5. **Standardize approach**: Follow Next.js security best practices
6. **Update documentation**: Document new security patterns for developers

## User Stories
- **As a user**, I want my data protected from web attacks (XSS, CSRF) through reliable framework security
- **As an API consumer**, I want reasonable rate limiting to prevent abuse while allowing legitimate usage
- **As a developer**, I want to use standard security patterns that are well-documented and maintained
- **As a security auditor**, I want to see framework-standard security implementations that are easier to review
- **As a site administrator**, I want comprehensive protection without complex custom implementations

## Functional Requirements

### Framework Migration
1. **CSP to config**: Move all Content Security Policy rules from `src/lib/security.ts` to `next.config.js`
2. **Middleware rate limiting**: Implement rate limiting in `src/middleware.ts` using Next.js middleware
3. **Remove custom CSRF**: Eliminate custom CSRF token generation (rely on framework patterns)
4. **Framework XSS protection**: Remove custom HTML sanitization, use React's built-in XSS protection

### Schema Validation Integration
5. **Zod integration**: Replace custom input validation with Zod schema validation
6. **API route schemas**: Create Zod schemas for all API route inputs
7. **Type safety**: Ensure schema validation provides TypeScript type safety
8. **Error handling**: Implement consistent validation error responses

### Simplified Security Utils
9. **Keep email validation**: Maintain Spanish-specific email validation patterns
10. **Keep input length validation**: Maintain business-specific input length requirements
11. **Remove complex sanitization**: Eliminate over-engineered HTML/XSS sanitization
12. **Simplify IP extraction**: Use middleware for IP extraction, remove complex header logic

### All-at-Once Replacement
13. **Single migration**: Replace all security implementations in one comprehensive update
14. **No dual systems**: Avoid maintaining both old and new security systems
15. **Complete cutover**: Ensure clean migration without legacy security code

## Non-Goals (Out of Scope)
- Changing existing API endpoints or their security requirements
- Adding new security features beyond current scope
- Implementing advanced security features like WAF or DDoS protection
- Changing authentication system (Clerk integration stays the same)
- Modifying database security policies

## Design Considerations

### Next.js Configuration
```javascript
// next.config.js security headers
const securityHeaders = [
  {
    key: 'Content-Security-Policy',
    value: cspHeader
  },
  {
    key: 'X-Frame-Options',
    value: 'DENY'
  }
  // ... other headers
];
```

### Middleware Pattern
```typescript
// src/middleware.ts
export function middleware(request: NextRequest) {
  // Rate limiting logic
  // IP extraction
  // Security header validation
}
```

### Zod Schema Pattern
```typescript
// API route validation
const contactSchema = z.object({
  name: z.string().min(2).max(50),
  email: z.string().email(),
  message: z.string().min(5).max(1000)
});
```

## Technical Considerations

### Dependencies
- **Add Zod**: Install `zod` for schema validation
- **Remove dependencies**: No need for additional security libraries
- **Framework reliance**: Leverage Next.js 15+ built-in security features

### Migration Strategy
- **Comprehensive replacement**: Update all security implementations simultaneously
- **Testing coverage**: Ensure security tests cover new implementations
- **Performance validation**: Verify middleware doesn't impact performance significantly

### File Changes Required
- **Update**: `next.config.js` - Add CSP and security headers
- **Create**: Enhanced `src/middleware.ts` - Rate limiting and security middleware
- **Reduce**: `src/lib/security.ts` - From 205 to ~50 lines (keep business-specific validation)
- **Update**: All API routes - Replace custom security with Zod validation
- **Update**: Security tests - Test new implementations
- **Create**: `src/lib/schemas/` - Directory with Zod validation schemas

### Security Requirements Mapping
| Current Feature | New Implementation |
|---|---|
| Custom CSP generation | `next.config.js` CSP headers |
| In-memory rate limiting | Next.js middleware with external store |
| Custom input sanitization | Zod schema validation + React XSS protection |
| Custom CSRF tokens | Next.js built-in CSRF protection |
| Complex IP extraction | Middleware request processing |
| Custom email validation | Zod + Spanish-specific patterns |

## Success Metrics
1. **Code reduction**: Reduce `security.ts` from 205 to ~50 lines
2. **Performance**: Eliminate setInterval memory usage from in-memory rate limiting
3. **Security posture**: Maintain or improve security test coverage
4. **Maintainability**: Reduce security-related custom test complexity
5. **Framework alignment**: Use standard Next.js security patterns
6. **Documentation**: Complete developer guide section on security patterns

## Implementation Phases

### Phase 1: Framework Setup
- Configure CSP in `next.config.js`
- Implement middleware for rate limiting
- Add Zod dependency and basic schemas

### Phase 2: API Migration
- Create Zod schemas for all API routes
- Replace custom validation with schema validation
- Update error handling patterns

### Phase 3: Cleanup
- Remove custom security implementations
- Update tests for new patterns
- Update documentation

## Open Questions
1. Should we use an external rate limiting service (Redis) immediately or start with improved in-memory?
2. Are there specific Spanish regulatory requirements that need custom validation?
3. Should we implement security monitoring/logging during this migration?
4. Do we need to maintain any custom security features for legacy API compatibility?

## Implementation Checklist
- [ ] Add Zod dependency to package.json
- [ ] Configure security headers in `next.config.js`
- [ ] Implement rate limiting middleware
- [ ] Create Zod schemas for all API routes
- [ ] Update API routes to use schema validation
- [ ] Remove custom security implementations
- [ ] Update security tests
- [ ] Update developer documentation with new security patterns
- [ ] Run security audit/penetration testing
- [ ] Mark ADR-018 as "Accepted"
- [ ] Monitor performance impact post-deployment