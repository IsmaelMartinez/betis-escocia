# 007-Clerk-Webhooks-for-Data-Synchronization

## Status
Proposed

## Context
The Betis application utilizes Clerk for authentication and Supabase for its database. ADR 006 established the decision to use Supabase's native JWT integration with Clerk for Row Level Security (RLS) and real-time authentication. This handles the secure association of a Clerk user's `user_id` with new data submissions and enforces access policies.

However, a separate challenge exists: how to link historical or pre-authenticated data (e.g., RSVP or contact form submissions made by anonymous users, identified only by email) with a Clerk user's profile once they sign up or log in. Additionally, there's a need to keep Supabase user data synchronized with Clerk for events like user deletion.

## Decision
We will implement Clerk webhooks to handle data synchronization and historical data linking between Clerk and Supabase. This complements the JWT integration by addressing scenarios where user data needs to be updated or associated outside of a direct, authenticated request flow.

### Technical Details:

1.  **Clerk Webhook Configuration:**
    *   Configure Clerk webhooks to send `user.created`, `user.updated`, and `user.deleted` events to a dedicated Next.js API route (e.g., `/api/webhooks/clerk`).
    *   Ensure the `CLERK_WEBHOOK_SECRET` environment variable is securely set for webhook verification.

2.  **Next.js Webhook API Route (`src/app/api/webhooks/clerk/route.ts`):**
    *   This route will receive and verify incoming webhook events from Clerk using `svix`.
    *   **`user.created` / `user.updated` events:**
        *   Extract the Clerk `user_id` and primary email address from the event payload.
        *   Utilize existing functions (e.g., `linkExistingSubmissionsToUser` in `src/lib/supabase.ts`) to find and update historical `rsvps` and `contact_submissions` that match the user's email but lack a `user_id`. This associates past anonymous submissions with the authenticated Clerk user.
        *   Optionally, synchronize other relevant user metadata from Clerk to a `public.users` table in Supabase if needed for direct database queries or RLS policies that depend on more than just the `sub` claim.
    *   **`user.deleted` events:**
        *   Extract the Clerk `user_id` from the event payload.
        *   Utilize existing functions (e.g., `unlinkUserSubmissions` in `src/lib/supabase.ts`) to nullify the `user_id` in `rsvps` and `contact_submissions` associated with the deleted user, or to soft-delete/anonymize the data as per privacy requirements.

3.  **Supabase Service Role Key:**
    *   Operations performed by the webhook (e.g., updating `user_id` for historical submissions) will require elevated privileges. The Supabase client used within the webhook handler will be initialized with the `SUPABASE_SERVICE_ROLE_KEY` to bypass RLS and perform necessary administrative actions.

## Consequences
*   **Improved Data Consistency:** Ensures that historical data submitted anonymously can be correctly attributed to a Clerk user once they authenticate.
*   **Enhanced User Data Management:** Provides a mechanism to react to Clerk user lifecycle events (creation, updates, deletion) and keep Supabase data synchronized.
*   **Clear Separation of Concerns:** Distinguishes between real-time authentication/authorization (handled by JWT integration) and asynchronous data synchronization (handled by webhooks).
*   **Increased Complexity:** Introduces an additional component (webhook handler) and external dependency (Clerk webhooks) to the system.
*   **Security Considerations:** Requires careful handling of the `CLERK_WEBHOOK_SECRET` and `SUPABASE_SERVICE_ROLE_KEY` to prevent unauthorized access or data manipulation.

## Alternatives Considered
*   **Manual Data Linking:** Relying on users to manually link their past submissions, which is poor UX and prone to errors.
*   **Batch Processing:** Periodically running a script to link data, which would introduce latency and complexity in managing state.
*   **Not Linking Historical Data:** Accepting that anonymous submissions would remain unlinked, leading to fragmented user data and incomplete user profiles. This was deemed unacceptable for a comprehensive user experience.
