# ADR-018: Simplify Security Layer Using Next.js Built-ins

## Status
**Accepted** ✅ - Implementation completed

## Implementation Results (August 2025)
- ✅ Reduced `security.ts` from 205 to 50 lines (75% reduction)
- ✅ Migrated CSP to `next.config.js` with Next.js framework patterns
- ✅ Implemented rate limiting in middleware using Next.js request processing
- ✅ Removed custom sanitization - now using React's built-in XSS protection
- ✅ Migrated to Zod schema validation for all API routes
- ✅ All security tests passing with new framework-based patterns
- ✅ Improved performance through simplified middleware
- ✅ Maintained security posture while reducing code complexity

## Context
The current security implementation in `src/lib/security.ts` (205 lines) contains custom implementations that may be over-engineered:

### Current Custom Security Features:
1. **Custom input sanitization** - HTML encoding, XSS prevention
2. **Custom rate limiting** - In-memory store with cleanup intervals  
3. **Custom email validation** - Beyond basic regex
4. **Custom CSRF token generation** - Not integrated with framework
5. **Custom Content Security Policy** - Complex CSP header construction
6. **Custom IP extraction** - Multiple header checking

### Issues with Current Approach:
- **Complexity**: 205 lines of custom security code to test and maintain
- **Reinventing wheels**: Next.js and modern browsers handle many of these
- **Memory leaks**: In-memory rate limiting with setInterval cleanup
- **Not framework-integrated**: Custom solutions don't leverage Next.js security
- **Over-engineering**: Some protections may be unnecessary for this app's threat model

### Alternative: Modern Next.js Security
Next.js 15+ provides built-in security features:
- Built-in CSP headers via `next.config.js`
- Middleware for rate limiting and request processing
- Automatic XSS protection via React
- Built-in sanitization for user inputs
- CSRF protection via same-site cookies and framework patterns

## Decision
We will **simplify the security layer** by:

1. **Leverage Next.js built-in security** features
2. **Remove custom implementations** where framework provides alternatives
3. **Keep only domain-specific security** (Spanish email validation, etc.)
4. **Use middleware** for cross-cutting concerns like rate limiting

## Implementation Plan

### Phase 1: Framework Migration
- Move CSP configuration to `next.config.js`
- Implement rate limiting in Next.js middleware
- Remove custom CSRF implementation
- Use React's built-in XSS protection

### Phase 2: Simplify Validation
- Keep basic email/input validation
- Remove over-engineered sanitization
- Use Zod or similar for schema validation
- Focus on business logic validation

### Phase 3: Clean Up
- Remove unused security utilities
- Update API routes to use simpler patterns
- Reduce security-related test complexity
- Document security approach in developer guide

## Benefits
- **Reduced complexity**: ~150+ lines of custom security code removed
- **Better security**: Use framework-tested implementations
- **Easier maintenance**: Less custom code to test and debug
- **Better performance**: Framework-optimized implementations
- **Standards compliance**: Follow Next.js security best practices

## Risks
- **Reduced customization**: Less control over specific security behaviors
- **Migration complexity**: Need to verify framework alternatives work
- **Security gaps**: Might miss some edge cases during transition

## Mitigation
- Thorough security testing during migration
- Keep critical domain-specific validations
- Document security decisions clearly
- Gradual migration with fallbacks

## What to Keep
- Basic email format validation (Spanish market specific)
- Input length validation (business requirement)
- Domain-specific security requirements

## What to Remove/Replace
- Custom HTML sanitization → React built-in XSS protection
- Custom rate limiting → Next.js middleware
- Custom CSP generation → next.config.js CSP headers
- Custom CSRF tokens → Framework CSRF protection
- Complex IP extraction → Middleware request processing

## Success Metrics
- Reduce `security.ts` from 205 to ~50 lines
- Remove security-related setInterval memory usage
- Maintain same security posture
- Simplify API route security checks
- Reduce security test complexity

## References
- [Next.js Security](https://nextjs.org/docs/app/building-your-application/configuring/content-security-policy)
- [Next.js Middleware](https://nextjs.org/docs/app/building-your-application/routing/middleware)
- [React XSS Protection](https://reactjs.org/docs/introducing-jsx.html#jsx-prevents-injection-attacks)