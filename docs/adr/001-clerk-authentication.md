# ADR-001: Clerk Authentication

## Status
Accepted

## Decision
**Clerk.com** is our authentication provider for admin functionality.

## Why Clerk
- **Cost**: Free tier supports 10,000+ MAU
- **Security**: SOC 2 Type II, CCPA, GDPR compliant
- **Integration**: Excellent Next.js SDK with TypeScript support
- **Features**: MFA, SSO, organizations available if needed later

## Implementation
- Auth via Clerk Next.js SDK (`@clerk/nextjs`)
- Admin roles in `publicMetadata.role`
- Middleware protects admin routes and API endpoints
- JWT integration with Supabase RLS (see ADR-006)

## Key Patterns
```typescript
// Check admin role in API routes
const { user, isAdmin, error } = await checkAdminRole();
if (!isAdmin) return NextResponse.json({ error }, { status: 401 });

// Get Supabase client with Clerk token for RLS
const token = await getToken({ template: "supabase" });
const supabase = getAuthenticatedSupabaseClient(token);
```

## References
- [Clerk Documentation](https://clerk.com/docs)
- ADR-006: Clerk-Supabase JWT Integration
