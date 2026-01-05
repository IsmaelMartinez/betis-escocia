# ADR-011: Admin Push Notifications

## Status

Deferred

## Context

Admin push notifications for RSVP and contact form submissions were needed to improve admin response times. We explored several approaches including custom SSE solutions and OneSignal integration.

## Decision

**Defer implementation** until the application is deployed to a live domain with HTTPS.

## Rationale

Push notifications (both native Web Push API and third-party services like OneSignal) require:

- **HTTPS**: Push notifications are only available over secure connections
- **Service Workers**: Must be served from the same origin as the application
- **Valid domain**: `localhost` workarounds are unreliable and not production-ready

Since the application is currently in development without a production domain, implementing push notifications would require significant workarounds that won't be usable in production.

## Previous Implementation

A partial OneSignal implementation was attempted (see commit `23ad66b` for reference). The implementation included:

- Client-side OneSignal SDK integration
- Server-side notification sending via OneSignal REST API
- Admin preferences management
- Integration with RSVP and contact form submissions

This implementation was removed due to the domain requirements mentioned above.

## Future Implementation

When a live domain is available, consider:

1. **Native Web Push API**: Direct browser implementation without third-party dependencies
2. **OneSignal**: Managed service with tag-based targeting (free tier available)
3. **Firebase Cloud Messaging**: Alternative managed service

The implementation should include:

- HTTPS-enabled production domain
- Service worker registration
- User permission management
- Supabase-backed notification preferences
- Admin-only targeting system

## Testing Strategy (Future)

- Unit tests: Mock notification clients
- E2E tests: Use feature flags to skip in non-production environments
- Local development: Use polling or webhooks as fallback
