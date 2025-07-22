# 006-Clerk-Supabase-JWT-Integration

## Status
Accepted (Revised)

## Context
The Betis application currently uses Clerk for user authentication and Supabase as its database. While user IDs from Clerk are being stored in Supabase tables (e.g., `rsvps`, `contact_submissions`), the direct integration between Clerk's authentication and Supabase's Row Level Security (RLS) has not been fully established. This led to issues where Supabase operations, particularly those from API routes or server-side components, were not properly authenticated against the Clerk user, resulting in unauthorized access errors.

Initially, we attempted to manually pass the Clerk JWT to the Supabase client. However, further research revealed that Supabase offers native, first-class support for third-party authentication providers like Clerk. This native integration simplifies the process significantly by allowing Supabase to directly verify asymmetrically signed JWTs issued by Clerk.

## Decision
We will leverage Supabase's native integration with Clerk to authenticate users and enforce Row Level Security (RLS). This means Supabase will directly verify Clerk-issued JSON Web Tokens (JWTs) without requiring manual client-side JWT passing or custom Supabase client initialization for authentication.

### Technical Details:

1.  **Clerk JWT Configuration (Clerk Dashboard):**
    *   Ensure your Clerk application is configured to issue JWTs that include necessary claims, such as `publicMetadata` (for roles) and the `sub` claim (for the user ID).

2.  **Supabase JWT Settings (Supabase Dashboard):**
    *   **Enable JWT verification** in your Supabase project (Authentication -> Settings -> JWT Settings).
    *   Set the **"JWKS URL"** to your Clerk JWKS URL (e.g., `https://<YOUR_CLERK_DOMAIN>/.well-known/jwks.json`). This allows Supabase to fetch Clerk's public keys and verify the signature of Clerk-issued JWTs.
    *   The "JWT Secret" can be a dummy value as it's not used when a JWKS URL is provided.

3.  **Supabase RLS Configuration:**
    *   Supabase's RLS policies will leverage the `auth.jwt()` function. The Clerk user ID is available in the `sub` claim of the JWT (`auth.jwt()->>'sub'`).
    *   User roles (e.g., 'admin') can be accessed via `auth.jwt()->>'publicMetadata'->>'role'` (assuming `publicMetadata` is included in the JWT as per Clerk configuration).
    *   Example RLS policy for `contact_submissions`:
        ```sql
        CREATE POLICY "Allow authenticated users to update their own submissions" ON public.contact_submissions
        FOR UPDATE USING (auth.jwt()->>'sub' = user_id);

        CREATE POLICY "Admins can update all submissions" ON public.contact_submissions
        FOR UPDATE TO authenticated USING (auth.jwt()->>'publicMetadata'->>'role' = 'admin');
        ```
    *   The `user_id` column in relevant Supabase tables (e.g., `contact_submissions`, `rsvps`, `public.users`) must store the Clerk user ID (which corresponds to the `sub` claim in the JWT) and should be of type `VARCHAR(255)`.

4.  **Usage in API Routes/Server Components:**
    *   API routes and server components will use the standard `supabase` client initialized with the anonymous key (`createClient(supabaseUrl, supabaseAnonKey)`).
    *   Supabase will automatically handle the JWT verification when a Clerk-issued JWT is present in the `Authorization` header of the incoming request.
    *   The `sessionClaims` object from `getAuth(request)` will contain the necessary `publicMetadata` for server-side authorization checks (after Clerk JWT template configuration).

## Consequences
*   **Simplified Integration:** Eliminates the need for custom Supabase client initialization with JWTs, making the codebase cleaner and less prone to JWT-related errors.
*   **Enhanced Security:** Relies on Supabase's robust, built-in JWT verification, ensuring secure authentication and authorization.
*   **Consistent User Identity:** The `user_id` stored in Supabase tables will consistently map to the Clerk user ID, simplifying data management and user-specific queries.
*   **Effective RLS:** Supabase RLS policies can now effectively control data access based on the authenticated Clerk user and their roles.
*   **Supabase Schema Refresh:** After any changes to RLS policies in Supabase, it is crucial to refresh the Supabase schema cache for the changes to take effect.

## Alternatives Considered
*   **Manually passing Clerk JWT to Supabase client:** This was initially attempted but proved unnecessary and led to `JWSError` due to misconfiguration and redundancy with Supabase's native support.
*   **Using Supabase's built-in authentication:** Not feasible as Clerk is the primary authentication provider.
*   **Passing Clerk user ID directly without JWT:** Bypasses Supabase's native JWT validation and RLS capabilities, compromising security.