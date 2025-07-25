## Relevant Files

- `src/app/contacto/page.tsx` - Main component for the contact page, where all UI and form logic changes will be implemented.
- `src/lib/featureFlags.ts` - Contains the `isFeatureEnabled` function, crucial for conditionally rendering highlights based on feature flags.
- `src/lib/flagsmith/types.ts` - Defines `FlagsmithFeatureName`, which will be used for typing feature flags associated with highlights.
- `src/components/MessageComponent.tsx` - Used for displaying form submission status messages.
- `src/components/Field.tsx` - Provides the input fields for the contact form.
- `src/lib/formValidation.ts` - Handles the validation logic for the contact form.
- `src/app/api/contact/route.ts` - The backend API endpoint for contact form submissions. (No direct changes expected, but verify functionality).

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Tasks

- [ ] 1.0 Prepare Contact Page for Enhancements
  - [x] 1.1 Review `src/app/contacto/page.tsx` to understand its current structure and identify areas for modification.
  - [x] 1.2 Ensure necessary imports (`useState`, `useEffect`, `useRef`, `useUser` from `@clerk/nextjs`, `isFeatureEnabled` from `@/lib/featureFlags`, `FlagsmithFeatureName` from `@/lib/flagsmith/types`) are present.
  - [x] 1.3 Add `"use client";` directive at the top of `src/app/contacto/page.tsx` if not already present.
- [x] 2.0 Implement Contact Highlights Display
  - [x] 2.1 Define the structure for contact highlights within `src/app/contacto/page.tsx`, including `id`, `name`, `description`, `icon`, `color`, and a `feature` property (of type `FlagsmithFeatureName | null`).
  - [x] 2.2 Modify the rendering of highlights in `src/app/contacto/page.tsx` to conditionally display them based on `isFeatureEnabled(type.feature)` for highlights with an associated feature flag.
- [x] 3.0 Develop Scroll-to-Form Navigation
  - [x] 3.1 Add a `useRef` hook to the contact form section in `src/app/contacto/page.tsx` (e.g., `formRef = useRef<HTMLDivElement>(null)`).
  - [x] 3.2 Update the `handleTypeChange` function in `src/app/contacto/page.tsx` to smoothly scroll to the form section using `formRef.current?.scrollIntoView({ behavior: 'smooth' })` when a highlight is clicked.
  - [x] 3.3 Ensure the highlight buttons call `handleTypeChange` with the appropriate `type.id`.
- [x] 4.0 Integrate User Data Pre-population
  - [x] 4.1 Use the `useUser` hook from `@clerk/nextjs` in `src/app/contacto/page.tsx` to access authenticated user data.
  - [x] 4.2 Implement a `useEffect` hook in `src/app/contacto/page.tsx` to pre-populate the `name` and `email` fields of the form state (`formData`) with the authenticated user's `firstName`, `lastName`, and `emailAddresses[0]?.emailAddress`.
  - [x] 4.3 Ensure that the pre-populated `name` and `email` input fields remain editable by the user.
- [ ] 5.0 Conduct Testing and Refinement
  - [x] 5.1 Manually test the display of contact highlights, verifying that only enabled features are shown.
  - [x] 5.2 Manually test the scroll-to-form functionality for all highlights, ensuring smooth navigation.
  - [x] 5.3 Test user data pre-population for both authenticated and unauthenticated users.
  - [x] 5.4 Verify that the contact form submission functionality still works correctly after all changes.
  - [x] 5.5 Check the browser console for any new errors or warnings introduced by the changes.
  - [x] 5.6 Diagnose and resolve RLS policy caching issues for contact submissions.
  - [x] 5.7 Ensure `user_id` is populated for authenticated submissions.
- [ ] 6.0 Implement Admin UI for Contact Submissions
  - [x] 6.1 Create an admin page/component to display a list of contact submissions.
  - [x] 6.2 Implement functionality to mark submissions as 'in progress' or 'resolved'.
  - [x] 6.3 Ensure that users can view their own submissions on a dedicated page.
  - [x] 6.4 Verify that administrators can view all submissions.
- [x] 7.0 Authentication and Authorization for Contact Submissions
  - [x] 7.1 Investigate and implement the integration of Clerk authentication with Supabase, specifically focusing on passing the Clerk user's JWT to Supabase for authenticated operations. (ADR 006 created)
  - [x] 7.2 Ensure that the `user_id` from Clerk is correctly passed and stored in Supabase for new contact submissions and updates.
  - [x] 7.3 Implement robust authorization checks to ensure only authenticated users can update their own contact submissions, and administrators can update all submissions.
- [x] 8.0 Enhance Admin UI for Contact Submissions
  - [x] 8.1 Implement filtering functionality for contact submissions in the admin UI by status (e.g., 'new', 'in progress', 'resolved'), with 'new' as the default filter.
  - [x] 8.2 When a contact submission's status is changed in the admin UI, ensure the `user_id` of the authenticated administrator making the change is logged.
- [x] 9.0 Conduct Comprehensive End-to-End Testing (Manual)
  - [x] 9.1 Test contact form submission for authenticated and unauthenticated users, verifying correct `user_id` population.
  - [x] 9.2 Verify that submitted data appears correctly in the admin UI, including the `user_id`.
  - [x] 9.3 Test updating submission statuses in the admin UI, verifying the logging of the administrator's `user_id`.
  - [x] 9.4 Verify that users can see the updated status of their submissions.
  - [x] 9.5 Test the new filtering functionality for contact submissions by status in the admin UI.

- [x] 10.0 Implement Clerk-Supabase Webhook Integration
  - [x] 10.1 Configure Clerk webhooks to send user events (created, updated, deleted) to the Next.js API route (`/api/webhooks/clerk`).
  - [x] 10.2 Ensure `CLERK_WEBHOOK_SECRET` and `SUPABASE_SERVICE_ROLE_KEY` environment variables are correctly set.
  - [x] 10.3 Test the webhook integration by creating, updating, and deleting users in Clerk and verifying corresponding changes in the Supabase `public.users` table.
