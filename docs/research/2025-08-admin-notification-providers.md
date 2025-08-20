# Research: Admin Notification Provider Options (August 2025)

## Purpose
Summarise third‑party (and build‑yourself) options for sending low‑volume (< 1K / month) admin push notifications (RSVP + Contact submissions) for a tiny community site with < 5 admin users, prioritising: zero/near‑zero cost, minimal integration & maintenance, GDPR suitability, and ability to test deterministically in CI.

## Summary Outcome (Initial vs Final)
Initial conclusion favoured a custom `web-push` build for smallest surface. After deeper comparative review ("deepsearch" recommendation) prioritising fastest production readiness, built‑in dashboards, delivery analytics, automatic service worker handling, and minimal custom code, we have pivoted to adopt **OneSignal** for the first simplified iteration. The marginal extra SDK weight is accepted in exchange for:
1. Eliminating our need to manage VAPID keys & subscription cleanup logic.
2. Built‑in segmentation/tagging for admin‑only scope.
3. A single REST API call for sends (no iteration over stored endpoints).
4. Reduced custom code to a thin wrapper (easy to mock in tests).

We will still keep the door open to reverting to a custom implementation if OneSignal proves problematic (privacy/performance/regional delivery). A review trigger is defined in ADR-020.

## Evaluation Criteria
| Criterion | Weight | Rationale |
|-----------|--------|-----------|
| Initial Integration Effort | High | We want this working quickly to unblock test failures |
| Ongoing Maintenance | High | Tiny team; must be near-zero |
| Cost / Free Tier | High | Project is community, no budget |
| Mobile / Background Push | High | Core requirement |
| Testing & Mockability | High | Need deterministic CI without flaky external calls |
| Privacy / GDPR | Medium | Data is low sensitivity but still EU users |
| Future Extensibility | Medium | Nice-to-have, not required now |

## Option Matrix

| Option | Pros | Cons | Net (Score 1–5) | Notes |
|-------|------|------|-----------------|-------|
| Build w/ `web-push` (custom) | Very small code surface; no external infra; easy to mock; zero cost; direct control | Need to manage VAPID keys; limited analytics; manual retries | 5 | Smallest viable solution |
| Novu (Cloud) | Multi‑channel; workflows; retries; inbox component | Overkill; setup & concepts (workflows, templates); external data processing | 3 | Useful only if we later add email/in-app | 
| Novu (Self-host) | Full control; extensible | Infra burden (DB + service); upgrades | 2 | Disproportionate complexity |
| Firebase Cloud Messaging (FCM) | Mature infra; good delivery | Requires Firebase project; Google dependency; extra SDK; testing stubs | 3 | Adds ecosystem shift |
| OneSignal | Simple dashboard; segmentation; analytics; built service worker; removes VAPID handling | SDK payload size; external data processing; need GDPR review | 4 | Chosen provider (see ADR-020) |
| Pusher Beams | Straightforward API; managed delivery | Paid beyond small limits; extra account; SDK | 3 | Not needed for tiny volume |
| PagerDuty | Robust escalation; mobile apps | Incident focus; complex domain; free limited to 5 users; overkill | 1 | Domain mismatch |
| Twilio Notify | Multi‑channel API | Paid; setup of APNs/FCM anyway; complexity | 1 | Adds steps with no benefit now |
| Amazon SNS | Scales; pay-per-use | AWS account overhead; IAM + infra complexity | 2 | Overhead not justified |
| Slack / Discord Webhook | Instant & trivial setup | Not actual push to device notification tray (unless user enables) | 2 | Could be fallback channel only |

Scoring basis: Fit to immediate goals minus overhead risk.

## Detailed Notes (Excerpted & Refined)
- Novu: Great if we later want templates + multi‑channel; currently adds mental model (workflows, triggers). CI mocking requires extra abstraction.
- FCM: Reliable but forces us into Firebase project management + SDK weight; for pure web push `web-push` is simpler.
- OneSignal: Historically larger SDK footprint + data telemetry; we don't need segmentation/analytics.
- Pusher Beams / SNS / Twilio: All solve scale/reliability problems we do not have.
- PagerDuty: Problem domain mismatch (incidents vs simple content submissions).
- Slack/Discord: Good supplemental alerting; not a replacement for background push.

## Risks & Mitigations (OneSignal Adoption)
| Risk | Mitigation |
|------|------------|
| SDK size impact | Load SDK only on admin dashboard route; dynamic import; defer init until toggle enabled |
| Privacy / data sharing | Limit payload to minimal strings (no PII beyond first name + counts); document in privacy notes |
| Vendor lock‑in | Abstract calls via `oneSignalClient.ts`; single send function wrapper |
| Test flakiness (network) | In tests set `process.env.MOCK_PUSH=1` and mock REST call returning success |
| Admin scoping leak | Apply OneSignal tag only after verifying Clerk admin role; never expose REST API key client side |
| Notification spam (duplicates) | Rely on business logic; keep idempotency option for future (hash payload) |

## Proposed Minimal Architecture (OneSignal Version)
1. Load OneSignal Web SDK only on admin dashboard (dynamic import) after role check.
2. Initialize with `appId` and set admin tag (`user_type=admin`).
3. Local DB table simplified to a boolean preference (`admin_notification_preferences`) – or reuse existing if present.
4. When RSVP/contact created server-side, call OneSignal REST API (`/notifications`) with filter targeting tag `user_type=admin`.
5. Provide `sendAdminNotification(payload)` wrapper to format and POST request.
6. Testing: mock wrapper; no network; assert payload shape.

## Decision Snapshot
Adopt OneSignal now for speed + reduced custom maintenance. Reconsider if:
 (a) SDK perf issues emerge, (b) privacy concerns raised, (c) cost changes, (d) need to self-host.

## Follow-up Hooks
- Create ADR (see ADR-020) documenting OneSignal adoption (ADR-019 superseded before implementation).
- Add review reminder: 6 months or threshold trigger.

## References
- Raw research notes: `docs/Evaluation-notification-SaaS.md`
- Previous implementation ADR: `docs/adr/016-admin-push-notifications.md`
