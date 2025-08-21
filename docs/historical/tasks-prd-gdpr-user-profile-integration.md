## Relevant Files

- `src/app/gdpr/page.tsx` - Existing GDPR page (will be adapted/migrated).
- `src/app/api/gdpr/route.ts` - Existing GDPR API endpoint (will be modified).
- `src/components/user/GDPRTabContent.tsx` - New component for GDPR tab content.
- `src/components/user/GDPRTabContent.test.tsx` - Unit tests for the new GDPR tab content component.
- `src/components/layout/Footer.tsx` - Footer component (for GDPR link).
- `src/components/layout/Footer.test.tsx` - Unit tests for the Footer component.
- `src/app/dashboard/page.tsx` - User profile dashboard component (where the new tab will be integrated).
- `src/app/api/gdpr/route.test.ts` - Unit tests for the GDPR API endpoint.
- `docs/historical/documentation-reorganization.md` - Documentation of file moves.
- `tasks/prd-gdpr-user-profile-integration.md` - The PRD itself.
- `tasks/tasks-prd-gdpr-user-profile-integration.md` - This task list.

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx vitest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Vitest configuration.
- Remember to generate Storybook components when needed for reusability.

## Tasks

- [x] 1.0 Plan and Design User Interface for GDPR Integration
  - [x] 1.1 Research user profile dashboard component structure for tab integration.
  - [x] 1.2 Define UI/UX for the new GDPR tab/section within the user profile.
  - [x] 1.3 Define UI/UX for the unauthenticated user GDPR message in the footer.
  - [x] 1.4 Determine the exact label for the GDPR link in the footer.
- [x] 2.0 Implement Frontend GDPR Tab Functionality
  - [x] 2.1 Create a new component for the GDPR tab content (`src/components/user/GDPRTabContent.tsx`).
  - [x] 2.2 Migrate relevant UI logic and components from `src/app/gdpr/page.tsx` to `src/components/user/GDPRTabContent.tsx`.
  - [x] 2.3 Integrate `GDPRTabContent.tsx` into the user profile dashboard component as a new tab/section.
  - [x] 2.4 Ensure data display (RSVPs, contact submissions) works correctly within the new tab.
  - [x] 2.5 Implement data download functionality (JSON export) within the new tab.
  - [x] 2.6 Implement data deletion functionality within the new tab.
  - [x] 2.7 Create Storybook component for `GDPRTabContent.tsx`.
- [x] 3.0 Adapt Backend GDPR API for Authentication
  - [x] 3.1 Modify `src/app/api/gdpr/route.ts` to enforce user authentication (e.g., using Clerk's `auth()` helper).
  - [x] 3.2 Ensure the API only allows authenticated users to access/delete their own data.
  - [x] 3.3 Update API request handling to use authenticated user ID instead of email for data retrieval/deletion.
  - [x] 3.4 Add unit tests for authentication and authorization in `src/app/api/gdpr/route.ts`.
- [x] 4.0 Implement Unauthenticated User Experience
  - [x] 4.1 Locate and modify the footer component to include the new GDPR link.
  - [x] 4.2 Implement logic to detect if a user is authenticated when the GDPR link is clicked.
  - [x] 4.3 If unauthenticated, display the specified message: "Para poder consultar y borrar tus datos necesitas estar logeado. Ponte en contact con nosotros utilizando el formulario si no tienes session de usuario pero tienes datos en nuestro systema."
  - [x] 4.4 Ensure the message includes data retention information: "RSVPs are stored for 1 month, and contact information for 1 year."
  - [x] 4.5 Provide a clear link or instruction to the contact form within the unauthenticated message.
- [x] 5.0 Verify Data Retention Policies
