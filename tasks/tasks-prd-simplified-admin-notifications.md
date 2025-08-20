## Relevant Files

- `src/lib/notifications/notificationManager.ts` – Legacy SSE-based manager to remove.
- `public/sw.js` – Service worker; trim or confirm no longer required logic.
- `src/app/api/notifications/trigger` – SSE/legacy endpoint (if present) to remove.
- `src/lib/notifications/oneSignalClient.ts` – New OneSignal wrapper (to create).
- `src/app/api/admin/notifications/preferences/route.ts` – Preference endpoint (to create).
- `src/app/api/admin/notifications/test/route.ts` – Test send endpoint (to create).
- `src/app/admin/page.tsx` – Add toggle + lazy SDK loader.
- `src/lib/adminApiProtection.ts` – Reuse admin role guard for endpoints.
- `src/lib/featureConfig.ts` – Verify no obsolete notification flags remain.
- `docs/adr/020-adopt-onesignal-admin-notifications.md` – Decision reference.
- `docs/adr/019-simplified-admin-notifications.md` – Ensure marked superseded (already done).
- `tasks/prd-simplified-admin-notifications.md` – PRD source for scope alignment.
- `README.md` – Add new env vars.
- `docs/DEVELOPER_GUIDE.md` – Add implementation notes & testing instructions.
- `docs/security/` (add or update privacy note file) – Provider privacy mention.
- `tests/` (unit + integration) – Add wrapper tests.
- `e2e/*.spec.ts` – Update flows (RSVP/contact) to assert wrapper invoked (mock mode) / optional smoke real test.

### Notes

- Use `MOCK_PUSH=1` in test environment to avoid external calls.
- Keep wrapper isolated; no direct OneSignal calls elsewhere.
- Tag only after confirming admin role to avoid leakage.
- Avoid adding heavy SDK to main bundle (dynamic import on admin route only).

## Tasks

- [x] 1.0 Decommission Legacy Notification System (SSE / queue / dedupe / old service worker logic)
	- [x] 1.1 Inventory all notification-related legacy files (SSE endpoint, queue, dedupe logic, NotificationManager usage)
	- [x] 1.2 Remove `notificationManager.ts` and references in `admin/page.tsx`
	- [x] 1.3 Delete/disable SSE trigger endpoint (`/api/notifications/trigger`) if no longer required
	- [x] 1.4 Simplify `public/sw.js` (remove SSE-specific or legacy fallback code; retain only click handling if needed for OneSignal or note replacement by provider SW)
	- [x] 1.5 Remove obsolete localStorage dedupe keys / cleanup code
	- [x] 1.6 Run type-check & lint to ensure no dangling imports
	- [x] 1.7 Update ADR-016 references (pointing readers to ADR-020) if any remain in docs

- [ ] 2.0 Implement OneSignal Server Integration (env vars, wrapper module, config validation)
	- [ ] 2.1 Add env vars to `.env.example`: `NEXT_PUBLIC_ONESIGNAL_APP_ID`, `ONESIGNAL_REST_API_KEY`, `MOCK_PUSH`
	- [ ] 2.2 Create `src/lib/notifications/oneSignalClient.ts` with `sendAdminNotification` & payload type
	- [ ] 2.3 Implement mock short-circuit when `MOCK_PUSH=1`
	- [ ] 2.4 Add runtime validation/log warning if env vars missing (avoid crash)
	- [ ] 2.5 Add unit tests for wrapper: success path, missing env, mock mode, failure logging
	- [ ] 2.6 Ensure no REST API key exposure client-side (search for usage in client bundles)

- [ ] 3.0 Add Admin Dashboard Preference Toggle & Lazy SDK Load with Tagging
	- [ ] 3.1 Design minimal UI (toggle + status + test button) in `admin/page.tsx`
	- [ ] 3.2 Create preference endpoint (`PUT /api/admin/notifications/preferences`) using existing auth helper
	- [ ] 3.3 Define Supabase table (if not existing) `admin_notification_preferences` (user_id PK, enabled bool, updated_at)
	- [ ] 3.4 Update migration SQL file (new migration) for preference table
	- [ ] 3.5 Implement lazy dynamic import of OneSignal SDK only after toggle enabled & role confirmed
	- [ ] 3.6 After init, set tag `user_type=admin`
	- [ ] 3.7 Handle deny permission state (show message / keep toggle off)
	- [ ] 3.8 Store/reflect current preference on page load (server query or API fetch)
	- [ ] 3.9 Add loading & error states around toggle interactions
	- [ ] 3.10 Add unit/component tests for toggle behaviour (mock SDK module)

- [ ] 4.0 Wire RSVP & Contact Flows + Test Notification Endpoint to OneSignal Wrapper
	- [ ] 4.1 Identify RSVP submission handler (API route) and contact form handler files
	- [ ] 4.2 Import and call `sendAdminNotification` with minimal payload (type, title, body, optional URL)
	- [ ] 4.3 Ensure failures are caught & logged; do not affect primary operation response
	- [ ] 4.4 Implement `POST /api/admin/notifications/test` endpoint (admin-only)
	- [ ] 4.5 Add Playwright step in admin spec to trigger test notification (mock mode)
	- [ ] 4.6 Add integration tests for RSVP/contact handlers verifying wrapper call (mock fetch)

- [ ] 5.0 Testing & QA (unit, integration, e2e with MOCK_PUSH, bundle impact check)
	- [ ] 5.1 Update Vitest setup to set `MOCK_PUSH=1`
	- [ ] 5.2 Unit test wrapper (already in 2.5) – ensure coverage thresholds
	- [ ] 5.3 Integration test preference endpoint (enable/disable)
	- [ ] 5.4 Integration test test-notification endpoint (success + unauthorized)
	- [ ] 5.5 E2E test: Admin toggles notifications on, sends test notification (mock mode ensures determinism)
	- [ ] 5.6 Optional real push manual verification script/instructions
	- [ ] 5.7 Measure admin bundle after changes (ensure SDK only in admin chunk)
	- [ ] 5.8 Add snapshot or log to confirm no OneSignal code in public non-admin pages
	- [ ] 5.9 Update coverage report and ensure no regressions

- [ ] 6.0 Documentation, Privacy & Cleanup (ADR linkage, README/env docs, privacy notice, remove obsolete code)
	- [ ] 6.1 Update `README.md` with env vars & brief feature usage
	- [ ] 6.2 Update `DEVELOPER_GUIDE.md` with integration & testing notes
	- [ ] 6.3 Add/update privacy notice referencing OneSignal data collection & minimal payload policy
	- [ ] 6.4 Cross-link ADR-020 from PRD & tasks file (footnote)
	- [ ] 6.5 Remove any remaining comments referencing old SSE system
	- [ ] 6.6 Archive old notification-related docs into historical if needed
	- [ ] 6.7 Mark all tasks complete & move PRD + tasks to historical directories per workflow when done
	- [ ] 6.8 Create changelog / release note entry for feature

