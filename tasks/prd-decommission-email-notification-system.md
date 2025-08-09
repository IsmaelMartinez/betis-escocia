**Title:** Decommission Email Notification System

**1. Introduction/Overview:**
This PRD outlines the plan to completely remove the existing email notification system from the Peña Bética Escocesa website. The primary goal is to eliminate the dependency on an external email service and the associated requirement for domain management, which falls outside the current operational scope and capabilities of La Peña. This change will simplify the codebase, reduce maintenance overhead, and potentially lower operational costs.

**2. Goals:**
*   Eliminate the need for a dedicated email domain and API key for notifications.
*   Reduce the complexity and size of the codebase by removing email-related modules.
*   Decrease ongoing maintenance efforts associated with email service integration and troubleshooting.
*   Streamline the application's architecture by removing an external dependency.

**3. User Stories:**
*   As a system administrator, I no longer want the burden of managing email service configurations and domain requirements.
*   As a developer, I want a simpler codebase without the complexities of an external email notification system.

**4. Functional Requirements:**
*   The system **must** remove all code related to sending email notifications (e.g., `EmailService` class and its methods).
*   The system **must** remove all associated email template formatting logic.
*   The system **must** ensure that no part of the application attempts to send email notifications after this change.
*   The system **must** retain any generic utility functions or data structures that are not specific to email sending but might be reusable for future notification mechanisms (e.g., general message formatting, data interfaces).

**5. Non-Goals (Out of Scope):**
*   Implementing an alternative notification system (e.g., in-app notifications, push notifications) is explicitly out of scope for this PRD. This will be addressed in a separate, future PRD.
*   Informing existing administrators about the cessation of email notifications is not a functional requirement of this PRD.

**6. Design Considerations (Optional):**
*   N/A (This is a removal PRD, not a feature addition with UI/UX implications).

**7. Technical Considerations (Optional):
*   Identify and remove all imports and references to `src/lib/emailService.ts`.
*   Ensure that environment variables related to email (e.g., `ADMIN_EMAIL`, `FROM_EMAIL`, `EMAIL_API_KEY`) are no longer referenced in the codebase.
*   Review and update any API routes or backend logic that previously triggered email notifications (e.g., contact form submission, RSVP creation) to remove the email sending calls.

**8. Success Metrics:**
*   Successful removal of all email-related code without introducing new errors or breaking existing functionality.
*   Absence of any runtime errors related to missing email service dependencies.
*   Confirmation that no email notifications are being attempted by the application.

**9. Open Questions:**
*   Are there any external services or integrations that implicitly rely on the application sending emails (e.g., third-party analytics expecting email confirmations)? (Unlikely, but worth a final check during implementation).

---