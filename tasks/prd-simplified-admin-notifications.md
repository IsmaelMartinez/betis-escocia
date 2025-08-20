# PRD: Simplified Admin Notification System

## Introduction/Overview

The current admin notification system is overly complex with multiple layers (Service Worker + SSE + Simple notifications + deduplication logic), causing reliability issues, test failures, and maintenance difficulties. This PRD outlines a simplified approach that focuses on delivering mobile push notifications to admin users when new RSVP or contact submissions occur, even when the admin dashboard is closed.

**Goal:** Create a reliable, simple admin notification system that sends mobile push notifications for new submissions with minimal complexity and acceptable (not perfect) reliability.

**Decision (Original vs Final):** Original intent (ADR-019) was a minimal in‑house Web Push build (`web-push` + VAPID). After deeper evaluation we pivoted to adopt **OneSignal** (ADR-020) for fastest production readiness, reduced maintenance, built‑in service worker handling, and analytics/segmentation at no extra operational cost. Custom build deferred; may revisit if provider drawbacks emerge.

## Goals

1. **Simplify Architecture**: Replace the current multi-layered system with a single, straightforward notification approach
2. **Enable Mobile Push**: Ensure notifications work on mobile devices when the browser/dashboard is closed
3. **Improve Reliability**: Eliminate duplicate notifications and connection issues
4. **Fix Test Suite**: Ensure all E2E tests pass consistently
5. **Reduce Maintenance**: Create a system that's easy to debug and maintain

## User Stories

1. **As an admin**, I want to receive push notifications on my mobile device when someone submits an RSVP, so I can respond quickly even when I'm not at my computer.

2. **As an admin**, I want to receive push notifications when someone submits a contact form, so I don't miss important communications.

3. **As an admin**, I want a simple on/off toggle to enable or disable all notifications, so I can easily control when I receive them.

4. **As an admin**, I want notifications to work reliably without duplicates, so I'm not overwhelmed by repeated alerts.

5. **As a developer**, I want the notification system to be simple to maintain and debug, so I can focus on other features.

## Functional Requirements

1. **Single Toggle Control**: The admin dashboard must display one checkbox to enable/disable all notifications
2. **Mobile Push Support**: The system must send push notifications that work on mobile devices when the browser is closed
3. **RSVP Notifications**: When a new RSVP is submitted, send a push notification with the person's name and attendee count
4. **Contact Notifications**: When a new contact form is submitted, send a push notification with the person's name and subject
5. **OneSignal REST Integration**: Server wrapper performs authenticated REST POST (no VAPID keys)
6. **Service Worker Registration**: Automatically register and manage the service worker for push notifications
7. **Permission Handling**: Request notification permissions and handle denied/granted states gracefully
8. **Background Operation**: Notifications must work when the admin dashboard is closed or not in focus
9. **Single Database Table**: Use one simple table to store notification preferences (user_id, enabled boolean)
10. **No Deduplication Logic Initially**: Accept potential occasional duplicates (low volume) – revisit only if admins report noise
11. **Stateless Send**: RSVP/contact handlers call a single OneSignal wrapper (`sendAdminNotification`) – no queues, SSE streams, or reconnection logic
12. **Graceful Failure**: Notification failures must never fail the originating RSVP/contact request
13. **No Subscription Pruning**: OneSignal manages device lifecycle; we only manage enable/disable preference

## Non-Goals (Out of Scope)

1. **Multiple Notification Types**: No separate toggles for different notification types
2. **Scheduling/Timing**: No time-based notification controls
3. **Browser Notification Fallbacks**: Focus only on push notifications, not in-browser alerts
4. **Server-Sent Events (SSE)**: Remove the current SSE implementation
5. **Complex Status Indicators**: No multiple status panels showing different system states
6. **Email Notifications**: Only push notifications, no email alerts
7. **Notification History**: No need to store or display past notifications

## Design Considerations

### UI Components
- **Single Panel**: One simple card in the admin dashboard
- **One Toggle**: Checkbox labeled "Enable Admin Notifications"
- **Status Indicator**: Simple green/red indicator showing if notifications are active
- **Test Button**: "Send Test Notification" button when enabled

### User Experience
- **Progressive Enhancement**: System works without notifications if user denies permission
- **Clear Messaging**: Simple success/error messages for all actions
- **Mobile-First**: Design for mobile notification experience

## Technical Considerations

### Architecture Simplification
- **Remove Legacy**: Delete NotificationManager, SSE endpoint, in-memory queue, localStorage dedupe
- **Provider Delivery**: RSVP/contact handlers immediately invoke OneSignal wrapper
- **No Retry Layer (Yet)**: Simplicity first – retries/backoff can be added later behind same utility
- **Service Worker Trim**: Keep only push + click handlers; remove unused logic
- **Test Mode Switch**: Allow dependency injection/mocking of the send function for Vitest & Playwright

### Required Components
1. **OneSignal SDK (Lazy)**: Loaded only on admin dashboard
2. **Tag Application**: Apply `user_type=admin` tag after successful init
3. **Preference Management**: Single table storing enabled flag
4. **API Endpoints**:
   - `PUT /api/admin/notifications/preferences` (enable/disable + init tagging)
   - `POST /api/admin/notifications/test` (admin-only test trigger)
5. **Server Wrapper**: `sendAdminNotification(payload)` performs REST POST (filters by tag)
6. **Testing Harness**: Env flag `MOCK_PUSH=1` to bypass external call
7. **Privacy Note**: Document minimal payload + provider policy link

### Dependencies
- **OneSignal Web SDK** – push handling & service worker
- **OneSignal REST API** – sending notifications
- **Supabase** – preference storage
- **Global fetch** – outbound REST call

## Success Metrics

1. **Test Suite Success**: All E2E tests pass consistently (target: 100% pass rate)
2. **Notification Delivery**: Push notifications successfully delivered to mobile devices (target: 95% success rate)
3. **Admin Adoption**: Admin user actively uses the notification system (target: daily usage)
4. **Code Simplicity**: Reduce notification-related files from ~7 to ≤3 core files
5. **Bug Reports**: Zero notification-related bug reports after implementation

## Third-Party Solution Evaluation (Outcome)
Research complete (see dedicated research doc). Result: third‑party options add complexity with no current ROI. Custom build chosen; revisit when multi‑channel or >100/day threshold reached. Criteria applied: integration speed, maintenance cost, mockability. All satisfied best by in‑house approach.

## Open Questions (Refined)
1. **Privacy Review**: Confirm minimal payload + update privacy notice (pending).  
2. **Safari Handling**: Document OneSignal support nuances or fallback banner? (Pending decision)  
3. **Notification Content**: Finalise exact RSVP/contact wording (draft below).  
4. **SDK Load Performance**: Measure admin dashboard impact; consider code splitting (pending).  
5. **Legacy Cleanup**: Remove old SSE code & related tests.  

### Draft Notification Formats
- RSVP: `RSVP: {name} (+{guests})` body: `New RSVP for {matchShort}`
- Contact: `Contacto: {name}` body: `{subject}`
- Test: `Notificación de prueba` body: `Funcionando correctamente`

## Implementation Priority

1. **Phase 1**: Remove legacy SSE/queue/dedupe code & related tests
2. **Phase 2**: Add preference endpoint + toggle UI (lazy SDK load)
3. **Phase 3**: Implement server wrapper + integrate RSVP/contact handlers
4. **Phase 4**: Add test endpoint + admin UI button
5. **Phase 5**: Add/update Vitest + Playwright tests with `MOCK_PUSH`
6. **Phase 6**: Manual mobile verification & finalize docs

## Risks & Mitigations
| Risk | Impact | Mitigation |
|------|--------|-----------|
| Provider SDK size impact | Medium | Lazy load only on admin route; monitor bundle stats |
| Privacy / data sharing | Medium | Minimal payload; document provider policy; review in 6 months |
| Vendor lock‑in | Medium | Single wrapper abstraction eases switching if needed |
| Test flakiness (network) | Medium | `MOCK_PUSH` env bypasses network; isolate one real smoke test if desired |
| Tagging mis-scope (non-admin tagged) | High | Role check before SDK init & tag assignment |
| Safari user confusion | Low | Dashboard note about support differences |

---

*This PRD focuses on simplicity and reliability over feature complexity, addressing all identified pain points while providing a maintainable solution for admin notifications.*