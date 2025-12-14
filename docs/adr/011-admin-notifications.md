# ADR-011: Admin Push Notifications (OneSignal)

## Status
Accepted

## Decision
**OneSignal** for admin push notifications when RSVPs or contact forms are submitted.

## Why OneSignal
After iterating through custom SSE solutions (too complex) and considering raw Web Push (still requires subscription management), OneSignal provides:
- **Managed delivery**: No subscription lifecycle to handle
- **Reliable**: Professional notification service
- **Simple integration**: Tag-based admin targeting
- **Free tier**: Sufficient for our low volume

## Architecture
```typescript
// Server: src/lib/notifications/oneSignalClient.ts
export async function sendAdminNotification(payload: {
  type: 'rsvp' | 'contact' | 'test';
  title: string;
  body: string;
  url?: string;
}) {
  // POST to OneSignal API with admin tag filter
}
```

## Client Setup (Admin Dashboard)
1. Load OneSignal SDK (lazy, admin pages only)
2. Set tag: `user_type=admin`
3. Toggle preference stored in Supabase

## Environment Variables
```bash
NEXT_PUBLIC_ONESIGNAL_APP_ID=your_app_id
ONESIGNAL_REST_API_KEY=your_rest_api_key
MOCK_PUSH=1  # For testing
```

## Testing
- Unit: Mock `sendAdminNotification`
- E2E: Use `MOCK_PUSH=1` to skip external calls

