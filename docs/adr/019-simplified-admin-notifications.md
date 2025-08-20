# ADR-019: Simplified Admin Notifications (Replace Complex SSE System)

## Status
- **Status**: Superseded
- **Date**: 2025-08-20
- **Authors**: AI Assistant (GitHub Copilot) & Development Team
- **Supersedes**: ADR-016 (complex SSE + queue + dedup system)

## Context
The existing notification system (ADR-016) built a layered architecture: Service Worker + SSE stream + in-memory queue + multi‑layer deduplication + preference APIs. While feature rich, it introduced:
- Intermittent E2E test flakiness (timing, permissions, reconnection)
- Higher maintenance surface (queue cleanup, reconnection logic, localStorage dedupe)
- Complexity not justified by current volume (< a handful notifications per match day)

We re-evaluated (see Research: `docs/research/2025-08-admin-notification-providers.md`) build vs buy vs simplify. Third‑party services add integration & conceptual overhead with minimal immediate benefit.

## Decision (Superseded)
Original proposal to implement custom `web-push` based minimal system was not executed. Superseded by ADR-020 choosing OneSignal for faster delivery and reduced maintenance.

### Core Principles
1. **Smallest Viable**: Only what is needed to deliver a push when RSVP/contact occurs.
2. **Stateless Send**: Each event triggers direct sends to stored subscriptions.
3. **Graceful Degradation**: If push fails, user action (RSVP/contact) still succeeds silently.
4. **Easy to Test**: A single `notifyAdmins(payload)` function mocked in tests.
5. **Security Simplicity**: Server holds VAPID private key; client never sees it.

### Simplified Architecture
- Table: `admin_notification_subscriptions` (user_id PK/FK, endpoint, p256dh, auth, enabled boolean, updated_at)
- API Endpoints:
  - `PUT /api/admin/notifications/preferences` (enable/disable; create/remove subscription)
  - `POST /api/admin/notifications/test` (admin-only test trigger)
- Service Worker: only `self.addEventListener('push', ...)` & click handler.
- Server Utility: `notifyAdmins({ type, title, body, meta })`.
- Sending: Load all rows WHERE enabled = true; iterate with `web-push.sendNotification`; prune 404/410 responses.

### Data Model (Proposed)
```sql
create table if not exists admin_notification_subscriptions (
  user_id text primary key references users(id) on delete cascade,
  endpoint text not null,
  p256dh text not null,
  auth text not null,
  enabled boolean not null default true,
  updated_at timestamptz not null default now()
);
```

### API Contract (Sketch)
```
PUT /api/admin/notifications/preferences
Request: { enable: boolean, subscription?: PushSubscriptionJSON }
Response: { enabled: boolean }

POST /api/admin/notifications/test
Response: { success: true }
```

### Notification Payload (Internal)
```ts
type AdminNotification = {
  type: 'rsvp' | 'contact' | 'test';
  title: string; // Short (< 40 chars)
  body: string;  // Context line
  url?: string;  // Optional deep link
};
```

### Failure Modes & Handling
| Failure | Handling | Escalation |
|---------|----------|------------|
| Invalid / expired subscription | Remove row, continue | None |
| Library throws (network) | Log (server console) & continue | None |
| All sends fail | Still return 200 to RSVP/contact; optional future metric | Future improvement |
| Duplicate submissions | Two notifications acceptable (low volume) | Future dedupe if needed |

### Testing Strategy
- Unit: Mock `web-push` and assert `notifyAdmins` builds correct payload.
- Integration: API endpoints (preferences/test) using Supabase test client.
- E2E: Grant permission, toggle on, perform RSVP -> expect service worker notification (can fallback to DOM observable stub in CI if headless limitations).
- Mocking: Provide `__mocks__/web-push.ts` returning resolved promises; for Playwright, intercept network if needed.

### Consequences
Positive:
- Drastically reduced code surface & cognitive load
- Deterministic tests (no SSE timing)
- Less state to corrupt
- Easier future refactors (single utility)

Negative:
- No retry / delivery analytics
- Possible occasional lost notification (accepted risk)
- No batching (N sends per event)

Neutral:
- Safari limitations remain (documented)

### Alternatives Rejected (At Time)
- Rebuild SSE queue: Complexity not justified
- Third‑party providers (including OneSignal) – later reversed after deeper evaluation (see ADR-020)

### Migration Plan
1. Remove legacy SSE endpoints & notification manager code (keep service worker file, trim logic)
2. Add new table + endpoints + utility
3. Update RSVP & Contact handlers to call utility
4. Adjust tests (remove SSE flows)
5. Manual verification (RSVP + mobile device)

### Review Triggers
- > 100 notifications/day
- Need for multi-channel or reliability guarantees
- Admin complaints about missed notifications

## References
- ADR-016 (superseded)
- Research: `../research/2025-08-admin-notification-providers.md`
- Web Push Docs (MDN)

## Status Rationale
Superseded before implementation; retained for historical context of architectural simplification direction.
