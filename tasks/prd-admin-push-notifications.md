# PRD: Admin Push Notifications

## Introduction/Overview

This feature adds browser push notifications for admin users to receive immediate alerts about new user activity on the Peña Bética Escocesa website. The system will notify admins instantly when new RSVPs are submitted for match viewing parties and when new contact form submissions are received, enabling faster response times and better community engagement.

The goal is to keep admin users informed of important user activity without requiring them to constantly monitor the admin dashboard, improving administrative efficiency and user experience.

## Goals

1. **Immediate Awareness**: Notify admins instantly when new RSVPs or contact submissions occur
2. **Improved Response Time**: Enable faster admin responses to user inquiries and event management
3. **Reduced Manual Monitoring**: Eliminate the need for admins to regularly check the dashboard for new activity
4. **Secure Admin-Only Access**: Ensure notifications are only available to users with admin role permissions
5. **Feature Flag Control**: Allow easy enable/disable of the notification system through Flagsmith

## User Stories

1. **As an admin user**, I want to receive browser notifications when someone RSVPs for a match viewing party, so that I can quickly see attendance numbers and plan accordingly.

2. **As an admin user**, I want to be notified immediately when someone submits a contact form, so that I can respond promptly to user inquiries and maintain good community relations.

3. **As an admin user**, I want to see a summary of the notification with a link to view full details, so that I can quickly assess if immediate action is needed.

4. **As an admin user**, I want to be able to enable or disable all notifications with a single toggle, so that I can control when I receive alerts based on my availability.

## Functional Requirements

1. **Permission Verification**: The system must verify that only users with admin role can access push notification features.

2. **Browser Notification Setup**: The system must request browser notification permissions from admin users on first visit to the admin dashboard.

3. **RSVP Notifications**: The system must send a browser push notification immediately when a new RSVP is submitted, including match name and user identifier in the notification summary.

4. **Contact Form Notifications**: The system must send a browser push notification immediately when a new contact form is submitted, including contact type and user identifier in the notification summary.

5. **Notification Content**: Each notification must display a summary message with enough context to understand the event, plus a clickable link to view full details in the admin dashboard.

6. **Feature Flag Integration**: The entire notification system must be controlled by a Flagsmith feature flag (`admin-push-notifications`) that can enable/disable the feature.

7. **Global Toggle Control**: Admins must have a toggle switch in the admin dashboard to enable/disable their personal notifications.

8. **Service Worker Registration**: The system must register a service worker to handle background push notifications when the browser tab is not active.

9. **Notification Persistence**: Push notifications must remain visible until manually dismissed by the admin user.

10. **Database Event Integration**: The system must integrate with existing RSVP and contact form submission flows without disrupting current functionality.

## Non-Goals (Out of Scope)

1. **Email Notifications**: This PRD covers only browser push notifications, not email alerts.
2. **Mobile App Notifications**: Native mobile app push notifications are not included.
3. **User-Level Notifications**: Regular users will not receive any notifications - this is admin-only.
4. **Notification Scheduling**: All notifications are immediate - no batching or delayed delivery.
5. **Priority Levels**: All notifications have equal priority - no high/medium/low categorization.
6. **Individual Event Type Toggles**: Only global on/off control - no granular per-event-type settings.
7. **Multi-Admin Assignment**: All admins receive all notifications - no selective routing.
8. **Notification History**: No persistent log of past notifications is maintained.

## Design Considerations

1. **Admin Dashboard Integration**: Add a new "Notifications" panel to the existing admin dashboard with:
   - Toggle switch for enabling/disabling notifications
   - Browser permission status indicator
   - Recent notifications counter

2. **Notification Appearance**: Follow browser standard notification format with:
   - Peña Bética Escocesa branding (icon)
   - Clear, concise summary text
   - Click-to-action behavior (opens relevant admin page)

3. **UI Components**: Reuse existing admin dashboard styling and Tailwind classes for consistency.

## Technical Considerations

1. **Web Push API Integration**: Implement using the standard Web Push API with service worker support for cross-browser compatibility.

2. **Flagsmith Feature Flag**: Create `admin-push-notifications` feature flag in Flagsmith with boolean value for enable/disable control.

3. **Clerk Role Verification**: Integrate with existing `checkAdminRole()` function from `@/lib/adminApiProtection` to ensure proper access control.

4. **Database Hooks**: Add notification triggers to existing RSVP and contact form API routes without modifying core submission logic.

5. **Service Worker Location**: Place service worker file in `/public/sw.js` following Next.js static file conventions.

6. **Browser Compatibility**: Support modern browsers with Web Push API capability (Chrome, Firefox, Safari, Edge).

7. **HTTPS Requirement**: Web Push API requires HTTPS, which is already available in production environment.

## Success Metrics

1. **Admin Engagement**: Measure admin dashboard visit frequency before and after implementation (target: 20% reduction in manual dashboard checks).

2. **Response Time**: Track time between user submissions and admin responses (target: 30% improvement in average response time).

3. **Feature Adoption**: Monitor percentage of admin users who enable notifications (target: 80% adoption rate within 2 weeks).

4. **Notification Delivery Success**: Track successful push notification delivery rate (target: 95% delivery success).

## Open Questions

1. **Browser Permission Handling**: How should the system handle cases where users deny browser notification permissions?

2. **Offline Behavior**: What happens to notifications when admin users are offline or have closed their browsers?

3. **Rate Limiting**: Should there be any rate limiting if many RSVPs/contacts are submitted rapidly?

4. **Testing Strategy**: How can we test push notifications in development environment without disrupting production admin workflows?

5. **Data Retention**: Should we store any metadata about notification delivery for debugging purposes?