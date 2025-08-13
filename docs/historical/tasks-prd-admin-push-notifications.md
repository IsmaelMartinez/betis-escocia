# Tasks: Admin Push Notifications

Based on PRD: `prd-admin-push-notifications.md`

## Relevant Files

- `src/lib/flagsmith/` - Feature flag management system (existing)
- `src/lib/notifications/pushNotifications.ts` - Core push notification utility functions
- `src/lib/notifications/pushNotifications.test.ts` - Unit tests for push notification utilities
- `public/sw.js` - Service worker for handling background push notifications (existing PWA service worker, needs modification)
- `src/components/admin/NotificationPanel.tsx` - Admin dashboard notification control panel
- `src/components/admin/NotificationPanel.test.tsx` - Unit tests for notification panel component
- `src/components/admin/NotificationPanel.stories.tsx` - Storybook stories for notification panel component
- `src/app/admin/page.tsx` - Admin dashboard page (existing, needs modification)
- `src/app/api/rsvp/route.ts` - RSVP API route (existing, needs notification integration)
- `src/app/api/contact/route.ts` - Contact form API route (existing, needs notification integration)
- `src/app/api/notifications/subscribe/route.ts` - API endpoint for notification subscription management
- `src/app/api/notifications/subscribe/route.test.ts` - Unit tests for subscription API
- `tests/integration/notifications.test.ts` - Integration tests for notification system
- `e2e/admin-notifications.spec.ts` - End-to-end tests for admin notification workflows

### Notes

- Unit tests should typically be placed alongside the code files they are testing (e.g., `MyComponent.tsx` and `MyComponent.test.tsx` in the same directory).
- Use `npx vitest [optional/path/to/test/file]` to run tests. Running without a path executes all tests found by the Vitest configuration.

## Tasks

- [ ] 1.0 Setup Feature Flag and Core Infrastructure
  - [ ] 1.1 Create `admin-push-notifications` feature flag in Flagsmith dashboard
  - [x] 1.2 Add feature flag check to admin dashboard to show/hide notification controls
  - [x] 1.3 Create `src/lib/notifications/` directory structure for notification utilities
  - [x] 1.4 Install and configure required dependencies (if any additional packages needed)

- [ ] 2.0 Implement Browser Push Notification System
  - [x] 2.1 Modify existing PWA service worker (`public/sw.js`) to handle push notifications
  - [x] 2.2 Implement push notification utility functions in `src/lib/notifications/pushNotifications.ts`
  - [x] 2.3 Add notification permission request functionality
  - [x] 2.4 Implement notification sending logic with proper error handling
  - [x] 2.5 Add notification click handling to open relevant admin pages

- [x] 3.0 Create Admin Dashboard Notification Controls
  - [x] 3.1 Create `NotificationPanel` component with enable/disable toggle
  - [x] 3.2 Add browser permission status indicator to the panel
  - [x] 3.3 Create Storybook stories for `NotificationPanel` component with different states
  - [x] 3.4 Integrate notification panel into existing admin dashboard layout
  - [x] 3.5 Style notification panel to match existing admin dashboard design
  - [x] 3.6 Add user preference persistence for notification settings

- [x] 4.0 Integrate Notifications with RSVP and Contact Form APIs
  - [x] 4.1 Add notification trigger to RSVP API route (`src/app/api/rsvp/route.ts`)
  - [x] 4.2 Add notification trigger to contact form API route (`src/app/api/contact/route.ts`)
  - [x] 4.3 Create subscription management API endpoint (`src/app/api/notifications/subscribe/route.ts`)
  - [x] 4.4 Implement admin role verification for all notification endpoints
  - [x] 4.5 Add proper error handling and logging for notification failures

- [ ] 5.0 Add Comprehensive Testing and Documentation
  - [ ] 5.1 Write unit tests for push notification utility functions
  - [ ] 5.2 Write unit tests for NotificationPanel component
  - [ ] 5.3 Test Storybook stories for NotificationPanel component
  - [ ] 5.4 Write unit tests for subscription API endpoint
  - [ ] 5.5 Create integration tests for the complete notification flow
  - [ ] 5.6 Write end-to-end tests for admin notification workflows
  - [ ] 5.7 Update project documentation with notification setup instructions
  - [ ] 5.8 Run full test suite and fix any failing tests
  - [ ] 5.9 Run lint and type-check commands to ensure code quality