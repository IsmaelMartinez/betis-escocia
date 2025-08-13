import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../../msw/server';
import {
  getNotificationPermissionState,
  requestNotificationPermission,
  subscribeToPushNotifications,
  unsubscribeFromPushNotifications,
  isSubscribedToPushNotifications,
  sendTestNotification,
  sendNotificationToAdmins
} from '@/lib/notifications/pushNotifications';

// Mock global objects
const mockServiceWorkerRegistration = {
  pushManager: {
    subscribe: vi.fn(),
    getSubscription: vi.fn(),
  },
  addEventListener: vi.fn(),
  showNotification: vi.fn(),
};

const mockPushSubscription = {
  endpoint: 'https://fcm.googleapis.com/fcm/send/test',
  getKey: vi.fn((keyName: string) => {
    if (keyName === 'p256dh') return new Uint8Array([116, 101, 115, 116, 45, 112, 50, 53, 54, 100, 104, 45, 107, 101, 121]).buffer;
    if (keyName === 'auth') return new Uint8Array([116, 101, 115, 116, 45, 97, 117, 116, 104, 45, 107, 101, 121]).buffer;
    return null;
  }),
  unsubscribe: vi.fn(),
  toJSON: vi.fn(() => ({
    endpoint: 'https://fcm.googleapis.com/fcm/send/test',
    keys: {
      p256dh: 'test-p256dh-key',
      auth: 'test-auth-key'
    }
  }))
};

// Mock fetch is handled by MSW in tests/setup.ts

// Mock console methods
const consoleSpy = {
  log: vi.spyOn(console, 'log').mockImplementation(() => {}),
  error: vi.spyOn(console, 'error').mockImplementation(() => {}),
  warn: vi.spyOn(console, 'warn').mockImplementation(() => {}),
};

describe('pushNotifications', () => {
  // Mock Notification API
  const mockNotification = {
    permission: 'default' as NotificationPermission,
    requestPermission: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Mock window and secure context for browser environment
    Object.defineProperty(globalThis, 'window', {
      value: {
        isSecureContext: true,
        location: {
          protocol: 'https:',
          hostname: 'localhost'
        },
        PushManager: vi.fn(),
        Notification: mockNotification
      },
      writable: true,
      configurable: true,
    });
    
    // Reset global mocks
    Object.defineProperty(globalThis, 'Notification', {
      value: mockNotification,
      writable: true,
      configurable: true,
    });

    Object.defineProperty(globalThis, 'navigator', {
      value: {
        serviceWorker: {
          register: vi.fn(() => Promise.resolve(mockServiceWorkerRegistration)),
          ready: Promise.resolve(mockServiceWorkerRegistration),
          getRegistration: vi.fn(() => Promise.resolve(mockServiceWorkerRegistration)),
        },
        userAgent: 'Mozilla/5.0 (Test Browser)'
      },
      writable: true,
      configurable: true,
    });

    // Mock PushManager
    Object.defineProperty(globalThis, 'PushManager', {
      value: vi.fn(),
      writable: true,
      configurable: true,
    });

    // Reset default states
    mockNotification.permission = 'default';
    mockServiceWorkerRegistration.pushManager.getSubscription.mockResolvedValue(null);
    mockServiceWorkerRegistration.pushManager.subscribe.mockResolvedValue(mockPushSubscription);
    mockPushSubscription.unsubscribe.mockResolvedValue(true);
    
    // Fetch is handled by MSW handlers in tests/msw/handlers.ts
  });

  afterEach(() => {
    vi.restoreAllMocks();
    // Clean up global mocks
    delete (globalThis as any).window;
    delete (globalThis as any).navigator;
    delete (globalThis as any).Notification;
    delete (globalThis as any).PushManager;
  });

  describe('getNotificationPermissionState', () => {
    it('should return supported: false when Notification is not available', () => {
      delete (globalThis as any).Notification;
      delete (globalThis as any).window.Notification;
      
      const state = getNotificationPermissionState();

      expect(state).toEqual({
        permission: 'denied',
        supported: false,
        subscribed: false
      });
    });

    it('should return correct state when Notification is supported', () => {
      mockNotification.permission = 'granted';

      const state = getNotificationPermissionState();

      expect(state).toEqual({
        permission: 'granted',
        supported: true,
        subscribed: false
      });
    });

    it('should handle different permission states', () => {
      const permissions: NotificationPermission[] = ['default', 'granted', 'denied'];

      permissions.forEach(permission => {
        mockNotification.permission = permission;
        const state = getNotificationPermissionState();
        expect(state.permission).toBe(permission);
      });
    });
  });

  describe('requestNotificationPermission', () => {
    it('should request permission when supported', async () => {
      mockNotification.requestPermission.mockResolvedValue('granted');

      const permission = await requestNotificationPermission();

      expect(mockNotification.requestPermission).toHaveBeenCalled();
      expect(permission).toBe('granted');
    });

    it('should throw error when Notification is not supported', async () => {
      Object.defineProperty(global, 'Notification', {
        value: undefined,
        writable: true,
      });

      await expect(requestNotificationPermission()).rejects.toThrow(
        'Push notifications are not supported'
      );
    });

    it('should handle permission request failure', async () => {
      mockNotification.requestPermission.mockRejectedValue(new Error('Permission denied'));

      await expect(requestNotificationPermission()).rejects.toThrow('Permission denied');
    });

    it('should handle legacy callback-based requestPermission', async () => {
      // Mock legacy API that returns undefined but calls callback
      mockNotification.requestPermission = vi.fn((callback) => {
        if (callback) {
          callback('granted');
        }
        return undefined; // Legacy API doesn't return a promise
      });

      const permission = await requestNotificationPermission();

      expect(permission).toBe('granted');
    });
  });

  describe('subscribeToPushNotifications', () => {
    it('should subscribe to push notifications successfully', async () => {
      mockNotification.permission = 'granted';
      
      const result = await subscribeToPushNotifications();

      expect(mockServiceWorkerRegistration.pushManager.subscribe).toHaveBeenCalledWith({
        userVisibleOnly: true
      });
      
      expect(result).toEqual({
        endpoint: 'https://fcm.googleapis.com/fcm/send/test',
        keys: {
          p256dh: 'test-p256dh-key',
          auth: 'test-auth-key'
        }
      });
    });

    it('should throw error when service worker is not available', async () => {
      Object.defineProperty(global, 'navigator', {
        value: {},
        writable: true,
      });

      await expect(subscribeToPushNotifications()).rejects.toThrow(
        'Push notifications are not supported'
      );
    });

    it('should throw error when push manager is not available', async () => {
      // Ensure permission is granted for this test
      mockNotification.permission = 'granted';
      
      Object.defineProperty(global, 'navigator', {
        value: {
          serviceWorker: {
            ready: Promise.resolve({}),
          },
        },
        writable: true,
      });

      await expect(subscribeToPushNotifications()).rejects.toThrow(
        'Push notifications are not supported'
      );
    });

    it('should handle subscription API error', async () => {
      // Ensure permission is granted for this test
      mockNotification.permission = 'granted';
      
      // This error handling is for the subscription process itself, not the API call
      // The actual API error handling is tested in the sendNotificationToAdmins tests
      mockServiceWorkerRegistration.pushManager.subscribe.mockRejectedValue(
        new Error('Failed to subscribe to push notifications')
      );

      await expect(subscribeToPushNotifications()).rejects.toThrow(
        'Failed to subscribe to push notifications'
      );
    });

    it('should handle push subscription failure', async () => {
      // Ensure permission is granted for this test
      mockNotification.permission = 'granted';
      
      mockServiceWorkerRegistration.pushManager.subscribe.mockRejectedValue(
        new Error('Subscription failed')
      );

      await expect(subscribeToPushNotifications()).rejects.toThrow('Subscription failed');
    });
  });

  describe('unsubscribeFromPushNotifications', () => {
    it('should unsubscribe successfully when subscription exists', async () => {
      mockServiceWorkerRegistration.pushManager.getSubscription.mockResolvedValue(mockPushSubscription);

      const result = await unsubscribeFromPushNotifications();

      expect(mockPushSubscription.unsubscribe).toHaveBeenCalled();
      expect(result).toBe(true);
    });

    it('should return true when no subscription exists', async () => {
      mockServiceWorkerRegistration.pushManager.getSubscription.mockResolvedValue(null);

      const result = await unsubscribeFromPushNotifications();

      expect(result).toBe(true);
      expect(mockPushSubscription.unsubscribe).not.toHaveBeenCalled();
    });

    it('should handle unsubscribe failure', async () => {
      mockServiceWorkerRegistration.pushManager.getSubscription.mockResolvedValue(mockPushSubscription);
      mockPushSubscription.unsubscribe.mockResolvedValue(false);

      const result = await unsubscribeFromPushNotifications();

      expect(result).toBe(false);
    });

    it('should handle unsubscribe API failure', async () => {
      mockServiceWorkerRegistration.pushManager.getSubscription.mockResolvedValue(mockPushSubscription);
      mockPushSubscription.unsubscribe.mockResolvedValue(true);

      const result = await unsubscribeFromPushNotifications();
      expect(result).toBe(true);
    });
  });

  describe('isSubscribedToPushNotifications', () => {
    it('should return true when subscription exists', async () => {
      mockServiceWorkerRegistration.pushManager.getSubscription.mockResolvedValue(mockPushSubscription);

      const result = await isSubscribedToPushNotifications();

      expect(result).toBe(true);
    });

    it('should return false when no subscription exists', async () => {
      mockServiceWorkerRegistration.pushManager.getSubscription.mockResolvedValue(null);

      const result = await isSubscribedToPushNotifications();

      expect(result).toBe(false);
    });

    it('should return false when service worker is not available', async () => {
      Object.defineProperty(global, 'navigator', {
        value: {},
        writable: true,
      });

      const result = await isSubscribedToPushNotifications();

      expect(result).toBe(false);
    });

    it('should handle errors gracefully', async () => {
      mockServiceWorkerRegistration.pushManager.getSubscription.mockRejectedValue(
        new Error('Permission denied')
      );

      const result = await isSubscribedToPushNotifications();

      expect(result).toBe(false);
      expect(consoleSpy.error).toHaveBeenCalledWith(
        '[PushNotifications] Check subscription failed:',
        expect.any(Error)
      );
    });
  });

  describe('sendTestNotification', () => {
    let mockNotificationConstructor: any;
    let mockNotificationInstance: any;
    
    beforeEach(() => {
      mockNotificationInstance = {
        close: vi.fn()
      };
      
      mockNotificationConstructor = vi.fn(() => mockNotificationInstance);
      
      Object.defineProperty(global, 'Notification', {
        value: mockNotificationConstructor,
        writable: true,
      });
      
      Object.defineProperty(mockNotificationConstructor, 'permission', {
        value: 'granted',
        writable: true,
      });
    });

    it('should send test notification successfully', async () => {
      const notificationData = {
        title: 'Test Notification',
        body: 'This is a test',
        tag: 'test'
      };

      await sendTestNotification(notificationData);

      expect(mockNotificationConstructor).toHaveBeenCalledWith(
        'Test Notification',
        {
          body: 'This is a test',
          icon: '/images/logo_no_texto.jpg',
          tag: 'test',
          data: {
            type: 'rsvp',
            id: 0,
            url: '/admin'
          }
        }
      );
    });

    it('should use default values for missing properties', async () => {
      // sendTestNotification uses the Notification constructor, not service worker
      const mockNotificationConstructor = vi.fn();
      Object.defineProperty(mockNotificationConstructor, 'permission', {
        value: 'granted',
        writable: true,
      });
      
      Object.defineProperty(global, 'Notification', {
        value: mockNotificationConstructor,
        writable: true,
      });
      
      await sendTestNotification({ title: 'Test' });

      expect(mockNotificationConstructor).toHaveBeenCalledWith(
        'Test',
        expect.objectContaining({
          body: 'Notificación de prueba',
          icon: '/images/logo_no_texto.jpg',
          tag: 'test'
        })
      );
    });

    it('should throw error when service worker is not available', async () => {
      Object.defineProperty(global, 'navigator', {
        value: {},
        writable: true,
      });

      await expect(sendTestNotification({ title: 'Test' })).rejects.toThrow(
        'Push notifications are not supported'
      );
    });

    it('should handle notification permission denied', async () => {
      Object.defineProperty(mockNotificationConstructor, 'permission', {
        value: 'denied',
        writable: true,
      });

      await expect(sendTestNotification({ title: 'Test' })).rejects.toThrow(
        'Notification permission not granted'
      );
    });
  });

  describe('sendNotificationToAdmins', () => {
    const notificationData = {
      type: 'rsvp' as const,
      id: 123,
      data: {
        userName: 'Test User',
        userEmail: 'test@example.com',
        matchDate: '2024-01-15',
        attendees: 2
      }
    };

    it('should send notification to admins successfully', async () => {
      const result = await sendNotificationToAdmins(notificationData);

      expect(result).toEqual({
        success: true
      });
    });

    it('should handle API errors gracefully', async () => {
      // Mock API error response using MSW
      server.use(
        http.post('/api/notifications/send', () =>
          HttpResponse.json({ error: 'Internal server error' }, { status: 500 })
        )
      );

      // Should not throw but return error result
      const result = await sendNotificationToAdmins(notificationData);
      
      expect(result).toEqual({
        success: false,
        error: 'Internal server error'
      });
      
      expect(consoleSpy.error).toHaveBeenCalledWith(
        '[PushNotifications] Failed to send notification:',
        expect.any(Error)
      );
    });

    it('should handle fetch failures gracefully', async () => {
      // Mock network error using MSW
      server.use(
        http.post('/api/notifications/send', () => {
          return HttpResponse.error();
        })
      );

      // Should not throw but return error result
      const result = await sendNotificationToAdmins(notificationData);
      
      expect(result).toEqual({
        success: false,
        error: 'Failed to send notification'
      });
      
      expect(consoleSpy.error).toHaveBeenCalledWith(
        '[PushNotifications] Failed to send notification:',
        expect.any(Error)
      );
    });

    it('should validate required notification data', async () => {
      const invalidData = {
        type: 'contact' as const,
        id: 456,
        data: { 
          userName: 'Test',
          userEmail: 'test@example.com'
        }
      };

      const result = await sendNotificationToAdmins(invalidData);

      // Should still send successfully with the data provided
      expect(result).toEqual({
        success: true
      });
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle missing environment variables gracefully', async () => {
      // Ensure permission is granted for this test
      mockNotification.permission = 'granted';
      
      // Mock missing VAPID key
      delete process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;

      await subscribeToPushNotifications();

      expect(mockServiceWorkerRegistration.pushManager.subscribe).toHaveBeenCalledWith({
        userVisibleOnly: true
      });
    });

    it('should handle service worker registration failures', async () => {
      // Ensure permission is granted for this test
      mockNotification.permission = 'granted';
      
      Object.defineProperty(global, 'navigator', {
        value: {
          serviceWorker: {
            ready: Promise.reject(new Error('Service Worker registration failed')),
          },
        },
        writable: true,
      });

      await expect(subscribeToPushNotifications()).rejects.toThrow(
        'Service Worker registration failed'
      );
    });

    it('should handle invalid subscription objects', async () => {
      const invalidSubscription = {
        endpoint: null,
        keys: null
      };

      mockServiceWorkerRegistration.pushManager.subscribe.mockResolvedValue(invalidSubscription);

      await expect(subscribeToPushNotifications()).rejects.toThrow();
    });
  });

  describe('Browser Compatibility', () => {
    it('should handle browsers without push notification support', () => {
      Object.defineProperty(global, 'Notification', {
        value: undefined,
        writable: true,
      });

      Object.defineProperty(global, 'navigator', {
        value: {},
        writable: true,
      });

      const state = getNotificationPermissionState();
      expect(state.supported).toBe(false);
    });

    it('should handle browsers with partial support', async () => {
      Object.defineProperty(global, 'navigator', {
        value: {
          serviceWorker: {
            // Missing ready property
          },
        },
        writable: true,
      });

      const result = await isSubscribedToPushNotifications();
      expect(result).toBe(false);
    });
  });
});