# ADR-006: Clerk-Supabase JWT Integration

## Status
Accepted

## Decision
**Supabase's native JWT verification** with Clerk-issued tokens for Row Level Security.

## How It Works
1. Clerk issues JWTs with `sub` (user ID) and `publicMetadata` (roles)
2. Supabase verifies via Clerk's JWKS URL
3. RLS policies use `auth.jwt()->>'sub'` for user-specific access

## Configuration
1. **Supabase Dashboard**: Set JWKS URL to `https://<CLERK_DOMAIN>/.well-known/jwks.json`
2. **Clerk Dashboard**: Configure JWT template to include `publicMetadata`

## Usage
```typescript
// Get authenticated Supabase client
const token = await getAuth(request).getToken();
const supabase = getAuthenticatedSupabaseClient(token);

// RLS policy example
CREATE POLICY "Users can view their own data" ON rsvps
FOR SELECT USING (auth.jwt()->>'sub' = user_id);
```

## Benefits
- Secure user-specific data access
- No custom JWT handling needed
- Consistent user identity across systems

