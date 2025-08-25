import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock admin API protection
vi.mock('@/lib/adminApiProtection', () => ({
  checkAdminRole: vi.fn(),
}));

// Mock notification queue manager
vi.mock('@/lib/notifications/queueManager', () => ({
  getNotificationQueueStats: vi.fn(),
  getPendingNotifications: vi.fn(),
}));

// Mock console.error to avoid noise in tests
const originalConsoleError = console.error;
beforeEach(() => {
  console.error = vi.fn();
});

afterEach(() => {
  console.error = originalConsoleError;
});

// Import after mocking
import { GET } from '@/app/api/notifications/debug/route';

describe('Notifications Debug API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Clear global state
    delete (global as any).pendingNotifications;
  });

  describe('GET /api/notifications/debug', () => {
    it('should return debug info for admin users', async () => {
      const { checkAdminRole } = await import('@/lib/adminApiProtection');
      const { getNotificationQueueStats, getPendingNotifications } = await import('@/lib/notifications/queueManager');
      
      // Mock admin user
      vi.mocked(checkAdminRole).mockResolvedValue({
        user: { id: 'admin-123', role: 'admin' },
        isAdmin: true,
        error: null,
      } as any);

      // Mock queue stats
      vi.mocked(getNotificationQueueStats).mockReturnValue({
        totalNotifications: 5,
        pendingCount: 3,
        deliveredCount: 2,
        queueSize: 3,
        oldestNotificationAge: 120000, // 2 minutes
      });

      // Mock pending notifications
      const mockNotifications = [
        {
          id: 'notif-1',
          type: 'rsvp',
          timestamp: Date.now() - 60000, // 1 minute ago
          data: { title: 'New RSVP', body: 'John confirmed attendance' },
          deliveredToUsers: ['user-1', 'user-2']
        },
        {
          id: 'notif-2',
          type: 'contact',
          timestamp: Date.now() - 30000, // 30 seconds ago
          data: { title: 'New Contact', body: 'Jane sent a message' },
          deliveredToUsers: ['user-1']
        }
      ];
      vi.mocked(getPendingNotifications).mockReturnValue(mockNotifications);

      // Set global queue for testing
      (global as any).pendingNotifications = mockNotifications;

      const request = new NextRequest('http://localhost:3000/api/notifications/debug');
      const response = await GET();
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data).toHaveProperty('stats');
      expect(json.data).toHaveProperty('notifications');
      expect(json.data.stats.totalNotifications).toBe(5);
      expect(json.data.notifications).toHaveLength(2);
      expect(json.data.globalQueueExists).toBe(true);
      expect(json.data.globalQueueLength).toBe(2);
    });

    it('should require admin authentication', async () => {
      const { checkAdminRole } = await import('@/lib/adminApiProtection');
      
      // Mock non-admin user
      vi.mocked(checkAdminRole).mockResolvedValue({
        user: null,
        isAdmin: false,
        error: 'Insufficient permissions',
      } as any);

      const response = await GET();
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.error).toBe('Insufficient permissions');
    });

    it('should handle unauthorized user without error message', async () => {
      const { checkAdminRole } = await import('@/lib/adminApiProtection');
      
      // Mock unauthorized user
      vi.mocked(checkAdminRole).mockResolvedValue({
        user: null,
        isAdmin: false,
        error: null,
      } as any);

      const response = await GET();
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.error).toBe('Unauthorized');
    });

    it('should handle missing user', async () => {
      const { checkAdminRole } = await import('@/lib/adminApiProtection');
      
      // Mock missing user
      vi.mocked(checkAdminRole).mockResolvedValue({
        user: { id: 'user-123' },
        isAdmin: false,
        error: null,
      } as any);

      const response = await GET();
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json.error).toBe('Unauthorized');
    });

    it('should handle empty notification queue', async () => {
      const { checkAdminRole } = await import('@/lib/adminApiProtection');
      const { getNotificationQueueStats, getPendingNotifications } = await import('@/lib/notifications/queueManager');
      
      vi.mocked(checkAdminRole).mockResolvedValue({
        user: { id: 'admin-123', role: 'admin' },
        isAdmin: true,
        error: null,
      } as any);

      // Mock empty queue
      vi.mocked(getNotificationQueueStats).mockReturnValue({
        totalNotifications: 0,
        pendingCount: 0,
        deliveredCount: 0,
        queueSize: 0,
        oldestNotificationAge: 0,
      });

      vi.mocked(getPendingNotifications).mockReturnValue([]);

      const response = await GET();
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.data.stats.totalNotifications).toBe(0);
      expect(json.data.notifications).toHaveLength(0);
      expect(json.data.globalQueueExists).toBe(false);
      expect(json.data.globalQueueLength).toBe(0);
    });

    it('should handle notifications without deliveredToUsers', async () => {
      const { checkAdminRole } = await import('@/lib/adminApiProtection');
      const { getNotificationQueueStats, getPendingNotifications } = await import('@/lib/notifications/queueManager');
      
      vi.mocked(checkAdminRole).mockResolvedValue({
        user: { id: 'admin-123', role: 'admin' },
        isAdmin: true,
        error: null,
      } as any);

      vi.mocked(getNotificationQueueStats).mockReturnValue({
        totalNotifications: 1,
        pendingCount: 1,
        deliveredCount: 0,
        queueSize: 1,
        oldestNotificationAge: 30000,
      });

      // Notification without deliveredToUsers property
      const notificationWithoutDelivered = {
        id: 'notif-1',
        type: 'rsvp',
        timestamp: Date.now(),
        data: { title: 'Test Notification', body: 'Test body' },
        // deliveredToUsers is missing
      };
      vi.mocked(getPendingNotifications).mockReturnValue([notificationWithoutDelivered]);

      const response = await GET();
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.data.notifications[0].deliveredToUsers).toEqual([]);
    });

    it('should map notification data correctly', async () => {
      const { checkAdminRole } = await import('@/lib/adminApiProtection');
      const { getNotificationQueueStats, getPendingNotifications } = await import('@/lib/notifications/queueManager');
      
      vi.mocked(checkAdminRole).mockResolvedValue({
        user: { id: 'admin-123', role: 'admin' },
        isAdmin: true,
        error: null,
      } as any);

      vi.mocked(getNotificationQueueStats).mockReturnValue({
        totalNotifications: 1,
        pendingCount: 1,
        deliveredCount: 0,
        queueSize: 1,
        oldestNotificationAge: 45000,
      });

      const testTimestamp = Date.now();
      const mockNotification = {
        id: 'test-notif-123',
        type: 'contact',
        timestamp: testTimestamp,
        data: { 
          title: 'Test Contact Form', 
          body: 'Someone sent a contact form',
          extra: 'This should not appear in output'
        },
        deliveredToUsers: ['user-1', 'user-2', 'user-3'],
        internalData: 'This should not appear'
      };
      vi.mocked(getPendingNotifications).mockReturnValue([mockNotification]);

      const response = await GET();
      const json = await response.json();

      expect(response.status).toBe(200);
      const notif = json.data.notifications[0];
      expect(notif.id).toBe('test-notif-123');
      expect(notif.type).toBe('contact');
      expect(notif.timestamp).toBe(testTimestamp);
      expect(notif.title).toBe('Test Contact Form');
      expect(notif.deliveredToUsers).toEqual(['user-1', 'user-2', 'user-3']);
      
      // Should not include internal data
      expect(notif).not.toHaveProperty('internalData');
      expect(notif).not.toHaveProperty('extra');
    });

    it('should handle queue manager errors', async () => {
      const { checkAdminRole } = await import('@/lib/adminApiProtection');
      const { getNotificationQueueStats } = await import('@/lib/notifications/queueManager');
      
      vi.mocked(checkAdminRole).mockResolvedValue({
        user: { id: 'admin-123', role: 'admin' },
        isAdmin: true,
        error: null,
      } as any);

      // Mock queue manager error
      vi.mocked(getNotificationQueueStats).mockImplementation(() => {
        throw new Error('Queue manager unavailable');
      });

      const response = await GET();
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.success).toBe(false);
      expect(json.error).toBe('Failed to get notification debug info');
      expect(json.details).toBe('Queue manager unavailable');
    });

    it('should handle non-Error exceptions', async () => {
      const { checkAdminRole } = await import('@/lib/adminApiProtection');
      const { getNotificationQueueStats } = await import('@/lib/notifications/queueManager');
      
      vi.mocked(checkAdminRole).mockResolvedValue({
        user: { id: 'admin-123', role: 'admin' },
        isAdmin: true,
        error: null,
      } as any);

      // Mock non-Error exception
      vi.mocked(getNotificationQueueStats).mockImplementation(() => {
        throw 'String error';
      });

      const response = await GET();
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.success).toBe(false);
      expect(json.error).toBe('Failed to get notification debug info');
      expect(json.details).toBe('String error');
    });

    it('should log errors to console', async () => {
      const { checkAdminRole } = await import('@/lib/adminApiProtection');
      const { getNotificationQueueStats } = await import('@/lib/notifications/queueManager');
      
      vi.mocked(checkAdminRole).mockResolvedValue({
        user: { id: 'admin-123', role: 'admin' },
        isAdmin: true,
        error: null,
      } as any);

      const testError = new Error('Test error for logging');
      vi.mocked(getNotificationQueueStats).mockImplementation(() => {
        throw testError;
      });

      await GET();

      expect(console.error).toHaveBeenCalledWith('Error getting notification debug info:', testError);
    });

    it('should handle global queue edge cases', async () => {
      const { checkAdminRole } = await import('@/lib/adminApiProtection');
      const { getNotificationQueueStats, getPendingNotifications } = await import('@/lib/notifications/queueManager');
      
      vi.mocked(checkAdminRole).mockResolvedValue({
        user: { id: 'admin-123', role: 'admin' },
        isAdmin: true,
        error: null,
      } as any);

      vi.mocked(getNotificationQueueStats).mockReturnValue({
        totalNotifications: 0,
        pendingCount: 0,
        deliveredCount: 0,
        queueSize: 0,
        oldestNotificationAge: 0,
      });

      vi.mocked(getPendingNotifications).mockReturnValue([]);

      // Test with undefined global queue
      delete (global as any).pendingNotifications;

      const response1 = await GET();
      const json1 = await response1.json();

      expect(json1.data.globalQueueExists).toBe(false);
      expect(json1.data.globalQueueLength).toBe(0);

      // Test with empty global queue
      (global as any).pendingNotifications = [];

      const response2 = await GET();
      const json2 = await response2.json();

      expect(json2.data.globalQueueExists).toBe(true);
      expect(json2.data.globalQueueLength).toBe(0);
    });

    it('should include complete response structure', async () => {
      const { checkAdminRole } = await import('@/lib/adminApiProtection');
      const { getNotificationQueueStats, getPendingNotifications } = await import('@/lib/notifications/queueManager');
      
      vi.mocked(checkAdminRole).mockResolvedValue({
        user: { id: 'admin-123', role: 'admin' },
        isAdmin: true,
        error: null,
      } as any);

      vi.mocked(getNotificationQueueStats).mockReturnValue({
        totalNotifications: 2,
        pendingCount: 1,
        deliveredCount: 1,
        queueSize: 1,
        oldestNotificationAge: 60000,
      });

      vi.mocked(getPendingNotifications).mockReturnValue([
        {
          id: 'notif-1',
          type: 'rsvp',
          timestamp: Date.now(),
          data: { title: 'Test', body: 'Test body' },
          deliveredToUsers: ['user-1']
        }
      ]);

      (global as any).pendingNotifications = [{ id: 'global-1' }];

      const response = await GET();
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json).toEqual({
        success: true,
        data: {
          stats: {
            totalNotifications: 2,
            pendingCount: 1,
            deliveredCount: 1,
            queueSize: 1,
            oldestNotificationAge: 60000,
          },
          notifications: [
            {
              id: 'notif-1',
              type: 'rsvp',
              timestamp: expect.any(Number),
              title: 'Test',
              deliveredToUsers: ['user-1']
            }
          ],
          globalQueueExists: true,
          globalQueueLength: 1
        }
      });
    });
  });
});