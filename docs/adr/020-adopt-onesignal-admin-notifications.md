# ADR-020: Adopt OneSignal for Simplified Admin Push Notifications

## Status

- **Status**: Accepted
- **Date**: 2025-08-20
- **Authors**: AI Assistant (GitHub Copilot) & Development Team
- **Supersedes**: ADR-019 (custom minimal `web-push` plan – superseded before implementation)
- **Superseded by**: _N/A_

## Context

The original notification system (ADR-016) implemented a complex Service Worker + SSE stream + in‑memory queue with multi‑layer deduplication. It produced intermittent E2E test flakiness and carried maintenance overhead disproportionate to our very low event volume (a few RSVP / contact submissions per match day, < 5 admin recipients).

ADR-019 proposed a drastically simplified in‑house rebuild using raw Web Push (`web-push` library) with a direct iteration over stored subscriptions. While minimal, it still required us to:

1. Manage VAPID key generation & secure storage.
2. Store & prune browser push subscription endpoints.
3. Implement subscription CRUD logic & schema.
4. Handle occasional delivery failures & cleanup.

Research (see `../research/2025-08-admin-notification-providers.md`) re‑evaluated third‑party providers through the lens of: speed to production, maintenance burden, deterministic testing, and future extensibility (basic analytics / segmentation). OneSignal emerged as the smallest _operational_ surface even if the raw code footprint (SDK) is slightly larger.

Key forcing functions:

- We want to eliminate flaky timing logic quickly to stabilise tests.
- Admin notification volume is tiny; advanced reliability logic is unnecessary.
- We can defer any multi‑channel ambitions and still keep an escape hatch (wrapper abstraction) to revert to custom Web Push if needed.

## Decision

Adopt **OneSignal** for admin push notifications via a thin server wrapper and lazy‑loaded client SDK only on admin pages. All sending flows funnel through a single `sendAdminNotification(payload)` function that calls OneSignal's REST API with a tag filter (`user_type=admin`).

## Architecture (Minimal)

### Client (Admin Dashboard Only)

- Dynamically import OneSignal Web SDK after confirming Clerk role = admin.
- Initialize with `appId` (from `NEXT_PUBLIC_ONESIGNAL_APP_ID`).
- Set user tag: `user_type=admin`.
- Provide a single toggle UI that flips a boolean preference (stored in Supabase) and, if disabling, optionally calls OneSignal to delete player id (future enhancement; not required initially).

### Server

- Wrapper module `oneSignalClient.ts` exporting `sendAdminNotification({ type, title, body, url? })`.
- If `process.env.MOCK_PUSH === '1'` return a resolved mock result (used in Vitest & Playwright).
- Otherwise POST to `https://onesignal.com/api/v1/notifications` with filters `{ field: 'tag', key: 'user_type', relation: '=', value: 'admin' }`.
- Never expose REST API key to the client; keep it only server-side (`ONESIGNAL_REST_API_KEY`).

### Data

- Preference table (existing or new) storing `{ user_id, notifications_enabled boolean }` for local UI state (OneSignal tagging remains the primary targeting mechanism).
- No storage of subscription endpoints; OneSignal manages device/player records.

### Flow

- RSVP/contact API handlers call `sendAdminNotification` with minimal payload.
- Payload intentionally excludes PII beyond first name + minimal context.

### Testing

- Unit: mock module to assert payload translation.
- Integration: confirm wrapper short‑circuits under `MOCK_PUSH` env.
- E2E: Single smoke test path with toggle enabled (can still run under mock to avoid external network).

## Example Wrapper (Sketch)

```ts
// src/lib/notifications/oneSignalClient.ts
export interface AdminNotificationPayload {
  type: 'rsvp' | 'contact' | 'test';
  title: string;
  body: string;
  url?: string;
}

export async function sendAdminNotification(payload: AdminNotificationPayload) {
  if (process.env.MOCK_PUSH === '1') {
    return { mocked: true, payload };
  }
  const apiKey = process.env.ONESIGNAL_REST_API_KEY;
  const appId = process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID;
  if (!apiKey || !appId) {
    console.warn('OneSignal env vars missing; skipping notification');
    return { skipped: true };
  }
  const res = await fetch('https://onesignal.com/api/v1/notifications', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      Authorization: `Basic ${apiKey}`,
    },
    body: JSON.stringify({
      app_id: appId,
      headings: { en: payload.title },
      contents: { en: payload.body },
      url: payload.url,
      filters: [
        { field: 'tag', key: 'user_type', relation: '=', value: 'admin' },
      ],
      data: { type: payload.type },
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    console.error('OneSignal send failed', res.status, text);
    return { error: true, status: res.status };
  }
  return { success: true };
}
```

## Security & Privacy

- REST API key stays server-side only.
- Minimal payload (no emails, no full message bodies beyond short context).
- Tagging only after confirming admin role via Clerk middleware.
- Data retained by OneSignal limited to what their SDK collects; document in privacy notice and link to provider policy.

## Alternatives Considered

| Alternative | Reason Rejected Now |
|-------------|---------------------|
| Custom Web Push (ADR-019) | Slightly more code & ops (VAPID, subscription pruning) for minimal benefit; slower to get analytics/segmentation. |
| Novu | Overkill concept surface (workflows, templates) vs single notification need. |
| FCM Direct | Requires Firebase project + SDK overhead; adds ecosystem shift. |
| Pusher Beams / SNS / Twilio | Solve scale/reliability tiers we do not need; introduce extra account and potential cost. |

Detailed scoring retained in research document.

## Consequences

Positive:

- Removes our responsibility for subscription lifecycle & delivery retries.
- Faster time-to-stable compared to even minimal custom build.
- Deterministic testing via env‑gated mock.

Negative:

- Adds external SDK weight (mitigated by route‑scoped lazy load).
- Introduces vendor dependency & privacy considerations.

Neutral / Trade-offs:

- Loss of fine-grained endpoint control (acceptable at current scale).

## Migration / Implementation Steps

1. Remove legacy SSE / queue / dedupe code paths (retain service worker only for potential future use or remove if obsolete after provider testing).
2. Add environment variables (`NEXT_PUBLIC_ONESIGNAL_APP_ID`, `ONESIGNAL_REST_API_KEY`, optional `MOCK_PUSH`).
3. Implement wrapper module + unit tests (mock fetch).
4. Add admin dashboard toggle (writes preference + initialises SDK + sets tag).
5. Wire RSVP/contact handlers to call `sendAdminNotification`.
6. Add Playwright smoke test with mock enabled.
7. Update documentation & privacy notice.
8. Schedule review trigger note (see below).

## Review Triggers

Revisit decision if any of:

- SDK size/performance regression complaints.
- Privacy / compliance concern raised by members.
- Cost emerges (pricing model change) or usage growth > free tier.
- Need for multi‑channel or advanced workflows.

## References

- ADR-016 (original complex system)
- ADR-019 (superseded custom minimal plan)
- Research: `../research/2025-08-admin-notification-providers.md`
- OneSignal Docs: https://documentation.onesignal.com/

## Status Rationale

Chosen as fastest path to a stable, maintainable, low‑volume admin notification capability while preserving future optionality via abstraction.
