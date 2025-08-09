## Relevant Files

- `src/lib/emailService.ts` - Main email service implementation file to be removed.
- `tests/unit/lib/emailService.test.ts` - Unit tests for the email service, to be removed.
- `src/app/api/rsvp/route.ts` - RSVP API route, likely calls email service.
- `src/app/api/contact/route.ts` - Contact API route, likely calls email service.
- `src/app/api/admin/contact-submissions/[id]/route.ts` - Admin contact submissions API, might call email service for status updates.
- `src/lib/supabase.ts` - Might contain calls to email service for notifications.
- `package.json` - To remove `resend` and `dotenv` (if not used elsewhere) dependencies.
- `docs/adr/012-email-service-provider-analysis.md` - ADR related to email service, to be updated/decommissioned.
- `docs/historical/completed-tasks/` - Potential location for moving related tasks.
- `docs/historical/implemented-features/` - Potential location for moving related PRDs.
- `GEMINI.md` - Project overview, might mention email service.
- `README.md` - Main project README, might mention email service.
- `.env.local` (and other .env files) - To remove email-related environment variables.

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx jest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Jest configuration.

## Tasks

- [ ] 1.0 Remove Email Service Implementation
  - [ ] 1.1 Delete `src/lib/emailService.ts`.
  - [ ] 1.2 Delete `tests/unit/lib/emailService.test.ts`.
  - [ ] 1.3 Remove `resend` dependency from `package.json`.
  - [ ] 1.4 Review `package.json` for any other email-related dependencies that can be removed.
- [ ] 2.0 Update API Routes and Backend Logic
  - [ ] 2.1 Remove calls to `emailService.sendRSVPNotification` from `src/app/api/rsvp/route.ts`.
  - [ ] 2.2 Remove calls to `emailService.sendContactNotification` from `src/app/api/contact/route.ts`.
  - [ ] 2.3 Review `src/app/api/admin/contact-submissions/[id]/route.ts` for any email service calls and remove them.
  - [ ] 2.4 Review `src/lib/supabase.ts` for any email service calls and remove them.
  - [ ] 2.5 Remove any unused imports related to the email service from affected files.
- [ ] 3.0 Clean Up Environment Variables
  - [ ] 3.1 Remove `ADMIN_EMAIL`, `FROM_EMAIL`, `EMAIL_API_KEY` from `.env.local` and any other relevant `.env` files.
  - [ ] 3.2 Ensure no code references these environment variables after removal.
- [ ] 4.0 Update Documentation
  - [ ] 4.1 Update `docs/adr/012-email-service-provider-analysis.md` to mark it as decommissioned/removed.
  - [ ] 4.2 Review `GEMINI.md` and remove any references to the email service.
  - [ ] 4.3 Review `README.md` and remove any references to the email service.
  - [ ] 4.4 Review `docs/historical/completed-tasks/` and `docs/historical/implemented-features/` for any related entries and update/move them as necessary.
- [ ] 5.0 Verify Decommissioning
  - [ ] 5.1 Run `npm test` to ensure no regressions are introduced.
  - [ ] 5.2 Run `npm run type-check` to ensure no TypeScript errors.
  - [ ] 5.3 Manually verify that no email notifications are sent from the application (e.g., by submitting contact/RSVP forms locally).