# ADR-0022: Deprecate Clerk Webhooks for Data Synchronization

## Status
- **Status**: Accepted
- **Date**: 2025-09-08
- **Authors**: Development Team
- **Decision Maker**: Technical Lead
- **Supersedes**: [ADR-007: Clerk Webhooks for Data Sync](./007-clerk-webhooks-for-data-sync.md)

## Context

The project currently implements Clerk webhooks (ADR-007) to automatically link historical anonymous submissions (RSVPs and contact forms) to user accounts when users sign up. While this feature provides automatic data linking, it introduces additional complexity and maintenance overhead that may not be justified for the current use case.

**Current webhook implementation:**
- Listens for `user.created`, `user.updated`, and `user.deleted` events
- Automatically links existing anonymous submissions by email
- Requires `CLERK_WEBHOOK_SECRET` environment variable
- Uses Supabase service role key for elevated permissions
- Implemented in `/api/webhooks/clerk/route.ts`

**Reasons for deprecation:**
1. **Simplified architecture**: Reducing external dependencies and system complexity
2. **Maintenance overhead**: Webhook endpoints require ongoing monitoring and error handling
3. **Alternative solutions available**: Manual linking or eventual data cleanup approaches
4. **Low user impact**: Anonymous submissions can exist independently without significant UX degradation

## Decision

We will **deprecate the Clerk webhook functionality** and remove it from the codebase. This includes:

1. **Remove webhook endpoint**: Delete `/api/webhooks/clerk/route.ts`
2. **Remove environment variable**: No longer require `CLERK_WEBHOOK_SECRET`
3. **Update documentation**: Remove webhook references from setup guides
4. **Simplify onboarding**: Reduce required environment variables for new developers
5. **Maintain data integrity**: Existing linked data remains unchanged

## Consequences

### Positive
- **Reduced complexity**: Fewer moving parts and external dependencies
- **Simpler setup**: New developers need fewer environment variables
- **Lower maintenance**: No webhook monitoring or error handling required
- **Cleaner architecture**: More straightforward user data flow
- **Security reduction**: One less secret to manage and secure

### Negative
- **No automatic linking**: New users won't automatically see their historical anonymous submissions
- **Data fragmentation**: Anonymous and authenticated submissions remain separate
- **Manual processes**: Any data linking would require manual intervention or batch processing

### Neutral
- **Existing data unaffected**: Previously linked submissions remain linked
- **Core functionality intact**: RSVP and contact forms continue to work for both anonymous and authenticated users
- **Future flexibility**: Can be re-implemented if business requirements change

## Alternatives Considered

### Option 1: Keep webhooks but simplify
- **Pros**: Maintains automatic linking functionality
- **Cons**: Still adds complexity and maintenance overhead
- **Reason for rejection**: Doesn't address the core complexity concerns

### Option 2: Manual linking in user dashboard
- **Pros**: User-controlled, simple implementation
- **Cons**: Requires user action, may be confusing
- **Reason for rejection**: Poor UX, unlikely to be used by users

### Option 3: Batch processing job
- **Pros**: Automatic linking without webhooks
- **Cons**: Adds scheduled job complexity, eventual consistency issues
- **Reason for rejection**: Introduces different but similar complexity

### Option 4: Accept data separation
- **Pros**: Simplest approach, clear separation of concerns
- **Cons**: Users don't see historical data in dashboard
- **Reason chosen**: Benefits outweigh costs for current use case

## Implementation Plan

### Phase 1: Prepare for Removal
1. ✅ Remove `CLERK_WEBHOOK_SECRET` from environment documentation
2. ✅ Update developer setup guide
3. ✅ Create this ADR documenting the decision

### Phase 2: Code Removal (Future)
1. **Remove webhook endpoint**:
   ```bash
   rm -rf src/app/api/webhooks/clerk/
   rm -rf src/app/api/clerk/webhook/  # if duplicate exists
   ```

2. **Remove webhook-related functions** (if not used elsewhere):
   - `linkExistingSubmissionsToUser` in `src/lib/supabase.ts`
   - `unlinkUserSubmissions` in `src/lib/supabase.ts`

3. **Update dependencies**: Remove `svix` if not used elsewhere

### Phase 3: Documentation Update
1. **Update core documentation**:
   - Remove webhook references from `CLAUDE.md`
   - Update `.github/copilot-instructions.md`
   - Update API documentation

2. **Mark ADR-007 as superseded**:
   ```markdown
   ## Status
   Superseded by [ADR-0022: Deprecate Clerk Webhooks](./0022-deprecate-clerk-webhooks.md)
   ```

3. **Update architectural diagrams** and data flow descriptions

## Migration Guide

### For Existing Deployments
1. **Remove environment variable**: `CLERK_WEBHOOK_SECRET` can be safely removed
2. **Webhook endpoint**: Will return 404 after code removal (acceptable)
3. **No data loss**: Existing linked submissions remain intact
4. **Graceful degradation**: New user signups simply won't trigger automatic linking

### For New Deployments
1. **Simplified setup**: Fewer environment variables required
2. **No webhook configuration**: Skip webhook setup in Clerk dashboard
3. **Standard functionality**: All core features work without webhooks

## Success Metrics

- ✅ Reduced onboarding time for new developers
- ✅ Fewer support requests about webhook configuration
- ✅ Simplified deployment and environment management
- ✅ No impact on core RSVP/contact functionality
- ✅ Reduced codebase complexity metrics

## Rollback Plan

If automatic data linking becomes a business requirement:

1. **Re-implement webhook endpoint** using the existing code as reference
2. **Add back environment variable** and documentation
3. **Update Clerk configuration** to re-enable webhook delivery
4. **Test with historical data** to ensure proper functionality

The decision can be reversed without data loss or significant technical debt.

## References

- [ADR-007: Clerk Webhooks for Data Sync](./007-clerk-webhooks-for-data-sync.md) - Original implementation decision
- [ADR-001: Clerk Authentication](./001-clerk-authentication.md) - Core authentication system
- [ADR-006: Clerk + Supabase JWT Integration](./006-clerk-supabase-jwt-integration.md) - Authentication patterns

## Review

- **Next review date**: 2026-03-08 (6 months)
- **Review criteria**: If user feedback indicates strong need for automatic data linking, or if business requirements change