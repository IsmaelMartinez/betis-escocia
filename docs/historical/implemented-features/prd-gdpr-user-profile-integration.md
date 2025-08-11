# PRD: GDPR Option Integration into User Profile

## 1. Introduction/Overview

This Product Requirements Document outlines the integration of GDPR data access and deletion functionalities directly into the user's profile dashboard. Currently, users manage their GDPR requests through a standalone `/gdpr` page. This feature aims to streamline the user experience by centralizing data management within the authenticated user dashboard, while providing clear guidance for unauthenticated users.

**Goal:** To enhance user control over personal data by moving GDPR options into the user profile, improving accessibility and user experience.

## 2. Goals

*   Provide authenticated users with a dedicated section within their user profile to access and delete their personal data.
*   Ensure unauthenticated users are clearly informed about the need to log in for GDPR actions, offering an alternative contact method.
*   Maintain the existing GDPR data access and deletion functionality via the `/api/gdpr` endpoint, adapting its usage as necessary for authenticated contexts.
*   Improve the overall user experience for GDPR compliance.

## 3. User Stories

*   **As an authenticated user**, I want to access my personal data (RSVPs, contact submissions) from my user profile dashboard so that I can review what information the club holds about me.
*   **As an authenticated user**, I want to request the deletion of my personal data directly from my user profile dashboard so that I can exercise my "right to be forgotten" easily.
*   **As an unauthenticated user**, when I click on the GDPR link in the footer, I want to be informed that I need to log in to manage my data, and be provided with clear instructions on how to contact the club if I cannot log in but wish to manage my data.
*   **As an administrator**, I want the GDPR functionality to be secure and only accessible to authenticated users for data management within the dashboard.

## 4. Functional Requirements

*   **FR1:** The system MUST display a new "GDPR" tab/section within the authenticated user profile dashboard.
*   **FR2:** The GDPR tab MUST allow authenticated users to view their RSVP data.
*   **FR3:** The GDPR tab MUST allow authenticated users to view their contact submission data.
*   **FR4:** The GDPR tab MUST provide an option for authenticated users to request deletion of their RSVP and contact submission data.
*   **FR5:** The system MUST provide a mechanism to download personal data (RSVPs and contact submissions) in JSON format from the GDPR tab.
*   **FR6:** When an unauthenticated user clicks the GDPR link in the footer, the system MUST display the following message: "Para poder consultar y borrar tus datos necesitas estar logeado. Ponte en contact con nosotros utilizando el formulario si no tienes session de usuario pero tienes datos en nuestro systema."
*   **FR7:** The message for unauthenticated users (FR6) MUST include information about data retention periods: "RSVPs are stored for 1 month, and contact information for 1 year."
*   **FR8:** The message for unauthenticated users (FR6) MUST provide a clear link or instruction to use the existing contact form for GDPR requests if they cannot log in.

## 5. Non-Goals (Out of Scope)

*   Development of new GDPR-related functionalities beyond viewing, downloading, and deleting existing RSVP and contact submission data.
*   Changes to the core authentication system (Clerk) beyond integrating with the user profile dashboard.
*   Implementing a full-fledged GDPR consent management platform.

## 6. Design Considerations

*   The new GDPR tab/section within the user profile should align with the existing design system and user interface of the dashboard.
*   The footer link should be clearly labeled, e.g., "Opciones GDPR" or "Tus Datos GDPR".
*   The message for unauthenticated users (FR6) should be presented in a user-friendly and prominent manner, potentially using a dedicated page or a modal.

## 7. Technical Considerations

*   **Frontend:**
    *   Identify the appropriate location within the user profile dashboard component (`src/app/user-dashboard/page.tsx` or similar) to add the new GDPR tab/section.
    *   Adapt the existing `src/app/gdpr/page.tsx` component to be integrated as a tab/section within the user profile, ensuring it can receive authenticated user context.
    *   Ensure secure handling of user data on the client-side, especially during data display and download.
*   **Backend:**
    *   The existing `src/app/api/gdpr/route.ts` endpoint currently relies on email for identification and does not enforce authentication. This endpoint needs to be updated to verify the authenticated user's identity (e.g., via Clerk's `auth()` helper) and ensure that only the logged-in user can access/delete their own data.
    *   Consider if a new, authenticated-only API endpoint is preferable for GDPR actions within the dashboard, leaving the existing `/api/gdpr` for unauthenticated, email-based requests (if still needed). For this PRD, we assume the existing endpoint will be adapted.
*   **Data Retention:**
    *   Verify the accuracy of the stated data retention periods (1 month for RSVPs, 1 year for contact information) with the data storage policies.
    *   Ensure that the backend data deletion logic aligns with these retention policies.
*   **Authentication/Authorization:**
    *   Leverage Clerk's authentication for securing the new GDPR tab and its associated API calls.
    *   Ensure that only the authenticated user can access/delete their own data.


## 8. Success Metrics

*   **User Engagement:** Increase in the number of authenticated users accessing their GDPR data through the new profile tab.
*   **Support Tickets:** Reduction in support tickets related to GDPR data access and deletion requests.
*   **Compliance:** Successful implementation of GDPR data management within the user profile, meeting relevant compliance requirements.

## 9. Open Questions

*   What is the exact name of the user profile dashboard component and its internal structure for adding new tabs/sections?
*   Are the stated data retention periods (1 month for RSVPs, 1 year for contact information) definitively correct and legally compliant?
*   Should the existing `/api/gdpr` endpoint be modified to require authentication, or should a new, authenticated-only endpoint be created for the dashboard integration? (Assuming modification for this PRD).
*   Are there any specific logging or auditing requirements for GDPR data access and deletion actions?
*   What is the desired behavior if an authenticated user tries to access GDPR data for an email address different from their authenticated email?
