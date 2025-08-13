import { describe, it, expect } from 'vitest';
import type {
  NotificationPayload,
  NotificationSubscription,
  NotificationPermissionState,
  NotificationPreferences,
  PushNotificationError,
  NotificationTriggerData
} from '@/lib/notifications/types';

describe('Notification Types', () => {
  describe('NotificationPayload', () => {
    it('should accept valid notification payload structure', () => {
      const payload: NotificationPayload = {
        title: 'Test Notification',
        body: 'This is a test message',
        icon: '/images/icon.png',
        badge: '/images/badge.png',
        tag: 'test-tag',
        data: {
          type: 'rsvp',
          id: 123,
          url: '/admin',
          matchDate: '2024-01-15',
          userName: 'John Doe'
        }
      };

      expect(payload.title).toBe('Test Notification');
      expect(payload.data?.type).toBe('rsvp');
      expect(payload.data?.id).toBe(123);
    });

    it('should work with minimal required fields', () => {
      const minimalPayload: NotificationPayload = {
        title: 'Minimal Notification',
        body: 'Basic message'
      };

      expect(minimalPayload.title).toBe('Minimal Notification');
      expect(minimalPayload.icon).toBeUndefined();
      expect(minimalPayload.data).toBeUndefined();
    });

    it('should support contact notification data', () => {
      const contactPayload: NotificationPayload = {
        title: 'New Contact Message',
        body: 'Someone sent a message',
        data: {
          type: 'contact',
          id: 456,
          url: '/admin',
          userName: 'Jane Smith',
          contactType: 'general'
        }
      };

      expect(contactPayload.data?.type).toBe('contact');
      expect(contactPayload.data?.contactType).toBe('general');
    });
  });

  describe('NotificationSubscription', () => {
    it('should define subscription structure correctly', () => {
      const subscription: NotificationSubscription = {
        endpoint: 'https://fcm.googleapis.com/fcm/send/test-endpoint',
        keys: {
          p256dh: 'test-p256dh-key',
          auth: 'test-auth-key'
        }
      };

      expect(subscription.endpoint).toContain('fcm.googleapis.com');
      expect(subscription.keys.p256dh).toBeDefined();
      expect(subscription.keys.auth).toBeDefined();
    });
  });

  describe('NotificationPermissionState', () => {
    it('should define permission states correctly', () => {
      const states: NotificationPermissionState[] = [
        {
          permission: 'default',
          supported: true,
          subscribed: false
        },
        {
          permission: 'granted',
          supported: true,
          subscribed: true
        },
        {
          permission: 'denied',
          supported: true,
          subscribed: false
        }
      ];

      expect(states[0].permission).toBe('default');
      expect(states[1].subscribed).toBe(true);
      expect(states[2].permission).toBe('denied');
    });

    it('should handle unsupported browsers', () => {
      const unsupportedState: NotificationPermissionState = {
        permission: 'denied',
        supported: false,
        subscribed: false
      };

      expect(unsupportedState.supported).toBe(false);
      expect(unsupportedState.subscribed).toBe(false);
    });
  });

  describe('NotificationPreferences', () => {
    it('should define user preferences structure', () => {
      const preferences: NotificationPreferences = {
        enabled: true,
        rsvpNotifications: true,
        contactNotifications: true,
        userId: 'user_123'
      };

      expect(preferences.enabled).toBe(true);
      expect(preferences.rsvpNotifications).toBe(true);
      expect(preferences.contactNotifications).toBe(true);
      expect(preferences.userId).toBe('user_123');
    });

    it('should allow selective notification types', () => {
      const selectivePrefs: NotificationPreferences = {
        enabled: true,
        rsvpNotifications: true,
        contactNotifications: false,
        userId: 'user_456'
      };

      expect(selectivePrefs.rsvpNotifications).toBe(true);
      expect(selectivePrefs.contactNotifications).toBe(false);
    });
  });

  describe('PushNotificationError', () => {
    it('should define error types correctly', () => {
      const errors: PushNotificationError[] = [
        {
          type: 'PERMISSION_DENIED',
          message: 'User denied notification permission'
        },
        {
          type: 'SUBSCRIPTION_FAILED',
          message: 'Failed to subscribe to push notifications',
          details: 'Service worker registration failed'
        },
        {
          type: 'SEND_FAILED',
          message: 'Failed to send notification'
        },
        {
          type: 'UNSUPPORTED',
          message: 'Push notifications not supported in this browser'
        }
      ];

      expect(errors[0].type).toBe('PERMISSION_DENIED');
      expect(errors[1].details).toBeDefined();
      expect(errors[2].type).toBe('SEND_FAILED');
      expect(errors[3].type).toBe('UNSUPPORTED');
    });
  });

  describe('NotificationTriggerData', () => {
    it('should define RSVP trigger data correctly', () => {
      const rsvpTrigger: NotificationTriggerData = {
        type: 'rsvp',
        id: 123,
        data: {
          userName: 'John Doe',
          userEmail: 'john@example.com',
          matchDate: '2024-01-15',
          attendees: 2
        }
      };

      expect(rsvpTrigger.type).toBe('rsvp');
      expect(rsvpTrigger.data.userName).toBe('John Doe');
      expect(rsvpTrigger.data.attendees).toBe(2);
    });

    it('should define contact trigger data correctly', () => {
      const contactTrigger: NotificationTriggerData = {
        type: 'contact',
        id: 456,
        data: {
          userName: 'Jane Smith',
          userEmail: 'jane@example.com',
          contactType: 'general',
          subject: 'Question about membership'
        }
      };

      expect(contactTrigger.type).toBe('contact');
      expect(contactTrigger.data.contactType).toBe('general');
      expect(contactTrigger.data.subject).toBe('Question about membership');
    });

    it('should handle optional fields in trigger data', () => {
      const minimalRsvp: NotificationTriggerData = {
        type: 'rsvp',
        id: 789,
        data: {
          userName: 'Bob Wilson',
          userEmail: 'bob@example.com'
          // matchDate and attendees are optional
        }
      };

      expect(minimalRsvp.data.matchDate).toBeUndefined();
      expect(minimalRsvp.data.attendees).toBeUndefined();
    });
  });

  describe('Type compatibility and integration', () => {
    it('should work together in real-world scenarios', () => {
      // Create a complete notification flow scenario
      const triggerData: NotificationTriggerData = {
        type: 'rsvp',
        id: 100,
        data: {
          userName: 'Test User',
          userEmail: 'test@example.com',
          matchDate: '2024-02-20',
          attendees: 1
        }
      };

      const payload: NotificationPayload = {
        title: `🎉 New RSVP - ${triggerData.data.userName}`,
        body: `${triggerData.data.userName} confirmed attendance for ${triggerData.data.matchDate}`,
        icon: '/images/logo_no_texto.jpg',
        tag: `rsvp-${triggerData.id}`,
        data: {
          type: triggerData.type,
          id: triggerData.id,
          url: '/admin',
          userName: triggerData.data.userName
        }
      };

      const subscription: NotificationSubscription = {
        endpoint: 'https://fcm.googleapis.com/fcm/send/test',
        keys: {
          p256dh: 'test-key-p256dh',
          auth: 'test-key-auth'
        }
      };

      const permissionState: NotificationPermissionState = {
        permission: 'granted',
        supported: true,
        subscribed: true
      };

      // Verify all types work together
      expect(payload.title).toContain(triggerData.data.userName);
      expect(payload.data?.type).toBe(triggerData.type);
      expect(subscription.endpoint).toBeTruthy();
      expect(permissionState.permission).toBe('granted');
    });
  });
});