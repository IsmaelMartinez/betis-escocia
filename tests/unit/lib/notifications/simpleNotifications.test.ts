import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { http, HttpResponse } from 'msw';
import { server } from '../../../msw/server';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  showNotification,
  showRSVPNotification,
  showContactNotification,
  areNotificationsEnabled,
  triggerAdminNotification,
  clearNotificationPreferenceCache
} from '@/lib/notifications/simpleNotifications';

// Mock Notification API state
const mockNotificationState = {
  permission: 'default' as NotificationPermission,
  requestPermission: vi.fn(),
  constructorCalls: [] as Array<{ title: string; options?: NotificationOptions }>,
  lastInstance: null as MockNotificationInstance | null,
};

// Mock notification instance type
interface MockNotificationInstance {
  close: ReturnType<typeof vi.fn>;
  onclick: ((this: Notification, ev: Event) => unknown) | null;
}

// Create a proper class for the Notification constructor
class MockNotificationClass {
  static get permission() {
    return mockNotificationState.permission;
  }
  static requestPermission = mockNotificationState.requestPermission;
  
  close = vi.fn();
  onclick: ((this: Notification, ev: Event) => unknown) | null = null;
  
  constructor(title: string, options?: NotificationOptions) {
    mockNotificationState.constructorCalls.push({ title, options });
    mockNotificationState.lastInstance = this;
  }
}

// Alias for backward compatibility in tests
const mockNotification = mockNotificationState;
const mockNotificationConstructor = MockNotificationClass;

describe('simpleNotifications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Clear notification preference cache before each test
    clearNotificationPreferenceCache();
    
    // Reset constructor calls tracking
    mockNotificationState.constructorCalls = [];
    mockNotificationState.lastInstance = null;

    // Mock window and Notification API
    Object.defineProperty(globalThis, 'window', {
      value: {
        Notification: mockNotificationConstructor,
        focus: vi.fn(),
      },
      writable: true,
      configurable: true,
    });

    Object.defineProperty(globalThis, 'Notification', {
      value: mockNotificationConstructor,
      writable: true,
      configurable: true,
    });

    // Reset default state
    mockNotification.permission = 'default';
    mockNotification.requestPermission.mockResolvedValue('granted');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    delete (globalThis as any).window;
    delete (globalThis as any).Notification;
  });

  describe('isNotificationSupported', () => {
    it('should return true when Notification API is available', () => {
      expect(isNotificationSupported()).toBe(true);
    });

    it('should return false when window is undefined (server-side)', () => {
      delete (globalThis as any).window;
      expect(isNotificationSupported()).toBe(false);
    });

    it('should return false when Notification is not available', () => {
      delete (globalThis as any).window.Notification;
      expect(isNotificationSupported()).toBe(false);
    });
  });

  describe('getNotificationPermission', () => {
    it('should return current permission state', () => {
      mockNotification.permission = 'granted';
      expect(getNotificationPermission()).toBe('granted');
    });

    it('should return denied when notifications not supported', () => {
      delete (globalThis as any).window;
      expect(getNotificationPermission()).toBe('denied');
    });
  });

  describe('requestNotificationPermission', () => {
    it('should request and return permission', async () => {
      mockNotification.requestPermission.mockResolvedValue('granted');
      
      const permission = await requestNotificationPermission();
      
      expect(mockNotification.requestPermission).toHaveBeenCalled();
      expect(permission).toBe('granted');
    });

    it('should throw error when notifications not supported', async () => {
      delete (globalThis as any).window;
      
      await expect(requestNotificationPermission()).rejects.toThrow('Notifications not supported');
    });

    it('should handle permission request failure', async () => {
      mockNotification.requestPermission.mockRejectedValue(new Error('Permission denied'));
      
      await expect(requestNotificationPermission()).rejects.toThrow('Permission denied');
    });
  });

  describe('showNotification', () => {
    it('should create and show notification when permission granted', () => {
      mockNotification.permission = 'granted';
      
      const notification = showNotification({
        title: 'Test Title',
        body: 'Test Body',
        tag: 'test'
      });

      expect(mockNotificationState.constructorCalls).toHaveLength(1);
      expect(mockNotificationState.constructorCalls[0]).toEqual({
        title: 'Test Title',
        options: {
          body: 'Test Body',
          icon: '/images/logo_no_texto.jpg',
          tag: 'test',
          requireInteraction: true,
        }
      });
      expect(notification).toBe(mockNotificationState.lastInstance);
    });

    it('should return null when permission not granted', () => {
      mockNotification.permission = 'denied';
      
      const notification = showNotification({
        title: 'Test Title',
        body: 'Test Body'
      });

      expect(mockNotificationState.constructorCalls).toHaveLength(0);
      expect(notification).toBeNull();
    });

    it('should handle click callback', () => {
      mockNotification.permission = 'granted';
      const onClick = vi.fn();
      
      const notification = showNotification({
        title: 'Test Title',
        body: 'Test Body',
        onClick
      });

      expect(notification?.onclick).toBe(onClick);
    });
  });

  describe('showRSVPNotification', () => {
    it('should create RSVP notification with date', () => {
      mockNotification.permission = 'granted';
      
      showRSVPNotification('John Doe', '2024-01-15');

      expect(mockNotificationState.constructorCalls).toHaveLength(1);
      expect(mockNotificationState.constructorCalls[0].title).toBe('🎉 Nuevo RSVP - Peña Bética');
      expect(mockNotificationState.constructorCalls[0].options?.body).toContain('John Doe confirmó asistencia');
      expect(mockNotificationState.constructorCalls[0].options?.tag).toBe('rsvp');
    });

    it('should handle missing date', () => {
      mockNotification.permission = 'granted';
      
      showRSVPNotification('John Doe');

      expect(mockNotificationState.constructorCalls).toHaveLength(1);
      expect(mockNotificationState.constructorCalls[0].title).toBe('🎉 Nuevo RSVP - Peña Bética');
      expect(mockNotificationState.constructorCalls[0].options?.body).toContain('fecha pendiente');
    });
  });

  describe('showContactNotification', () => {
    it('should create contact notification', () => {
      mockNotification.permission = 'granted';
      
      showContactNotification('Jane Doe', 'general');

      expect(mockNotificationState.constructorCalls).toHaveLength(1);
      expect(mockNotificationState.constructorCalls[0].title).toBe('📬 Nuevo Mensaje - Peña Bética');
      expect(mockNotificationState.constructorCalls[0].options?.body).toBe('Jane Doe envió un mensaje (general)');
      expect(mockNotificationState.constructorCalls[0].options?.tag).toBe('contact');
    });
  });

  describe('areNotificationsEnabled', () => {
    it('should return true when user has notifications enabled', async () => {
      server.use(
        http.get('/api/notifications/preferences', () =>
          HttpResponse.json({ enabled: true })
        )
      );

      const enabled = await areNotificationsEnabled();
      expect(enabled).toBe(true);
    });

    it('should return false when user has notifications disabled', async () => {
      server.use(
        http.get('/api/notifications/preferences', () =>
          HttpResponse.json({ enabled: false })
        )
      );

      const enabled = await areNotificationsEnabled();
      expect(enabled).toBe(false);
    });

    it('should return false on API error', async () => {
      server.use(
        http.get('/api/notifications/preferences', () =>
          HttpResponse.json({ error: 'Not found' }, { status: 404 })
        )
      );

      const enabled = await areNotificationsEnabled();
      expect(enabled).toBe(false);
    });
  });

  describe('triggerAdminNotification', () => {
    it('should trigger RSVP notification when conditions are met', async () => {
      mockNotification.permission = 'granted';
      server.use(
        http.get('/api/notifications/preferences', () =>
          HttpResponse.json({ enabled: true })
        )
      );

      await triggerAdminNotification('rsvp', {
        userName: 'Test User',
        matchDate: '2024-01-15'
      });

      expect(mockNotificationState.constructorCalls).toHaveLength(1);
      expect(mockNotificationState.constructorCalls[0].title).toBe('🎉 Nuevo RSVP - Peña Bética');
      expect(mockNotificationState.constructorCalls[0].options?.body).toContain('Test User confirmó asistencia');
    });

    it('should trigger contact notification when conditions are met', async () => {
      mockNotification.permission = 'granted';
      server.use(
        http.get('/api/notifications/preferences', () =>
          HttpResponse.json({ enabled: true })
        )
      );

      await triggerAdminNotification('contact', {
        userName: 'Test User',
        contactType: 'general'
      });

      expect(mockNotificationState.constructorCalls).toHaveLength(1);
      expect(mockNotificationState.constructorCalls[0].title).toBe('📬 Nuevo Mensaje - Peña Bética');
      expect(mockNotificationState.constructorCalls[0].options?.body).toBe('Test User envió un mensaje (general)');
    });

    it('should not trigger notification when permission denied', async () => {
      mockNotification.permission = 'denied';

      await triggerAdminNotification('rsvp', {
        userName: 'Test User'
      });

      expect(mockNotificationState.constructorCalls).toHaveLength(0);
    });

    it('should not trigger notification when user preferences disabled', async () => {
      mockNotification.permission = 'granted';
      server.use(
        http.get('/api/notifications/preferences', () =>
          HttpResponse.json({ enabled: false })
        )
      );

      await triggerAdminNotification('rsvp', {
        userName: 'Test User'
      });

      expect(mockNotificationState.constructorCalls).toHaveLength(0);
    });
  });
});