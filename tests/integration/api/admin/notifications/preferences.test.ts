import { describe, it, expect, beforeEach, vi } from 'vitest';
import { testApiHandler } from 'next-test-api-route-handler';
import * as appHandler from '@/app/api/admin/notifications/preferences/route';

// Mock Clerk authentication
vi.mock('@/lib/adminApiProtection', () => ({
  checkAdminRole: vi.fn()
}));

// Mock preferences database functions
vi.mock('@/lib/notifications/preferencesDb', () => ({
  getUserNotificationPreferenceDb: vi.fn(),
  setUserNotificationPreferenceDb: vi.fn()
}));

import { checkAdminRole } from '@/lib/adminApiProtection';
import { 
  getUserNotificationPreferenceDb, 
  setUserNotificationPreferenceDb 
} from '@/lib/notifications/preferencesDb';

const mockCheckAdminRole = vi.mocked(checkAdminRole);
const mockGetUserNotificationPreference = vi.mocked(getUserNotificationPreferenceDb);
const mockSetUserNotificationPreference = vi.mocked(setUserNotificationPreferenceDb);

describe('/api/admin/notifications/preferences', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default: user is admin
    mockCheckAdminRole.mockResolvedValue({
      user: { id: 'user_123' },
      isAdmin: true,
      error: null
    });
  });

  describe('GET', () => {
    it('should return current notification preference for admin', async () => {
      mockGetUserNotificationPreference.mockResolvedValue(true);

      await testApiHandler({
        appHandler,
        test: async ({ fetch }) => {
          const response = await fetch({
            method: 'GET'
          });

          const data = await response.json();
          
          expect(response.status).toBe(200);
          expect(data.success).toBe(true);
          expect(data.data.enabled).toBe(true);
        }
      });

      expect(mockGetUserNotificationPreference).toHaveBeenCalledWith('user_123', undefined);
    });

    it('should return false when preference not set', async () => {
      mockGetUserNotificationPreference.mockResolvedValue(false);

      await testApiHandler({
        appHandler,
        test: async ({ fetch }) => {
          const response = await fetch({
            method: 'GET'
          });

          const data = await response.json();
          
          expect(response.status).toBe(200);
          expect(data.success).toBe(true);
          expect(data.data.enabled).toBe(false);
        }
      });
    });

    it('should require admin role', async () => {
      mockCheckAdminRole.mockResolvedValue({
        user: null,
        isAdmin: false,
        error: 'Access denied'
      });

      await testApiHandler({
        appHandler,
        test: async ({ fetch }) => {
          const response = await fetch({
            method: 'GET'
          });

          const data = await response.json();
          
          expect(response.status).toBe(401);
          expect(data.success).toBe(false);
          expect(data.error).toBe('Access denied');
        }
      });

      expect(mockGetUserNotificationPreference).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      mockGetUserNotificationPreference.mockRejectedValue(new Error('Database error'));

      await testApiHandler({
        appHandler,
        test: async ({ fetch }) => {
          const response = await fetch({
            method: 'GET'
          });

          const data = await response.json();
          
          expect(response.status).toBe(500);
          expect(data.success).toBe(false);
          expect(data.error).toContain('Error loading notification preference');
        }
      });
    });
  });

  describe('PUT', () => {
    it('should update notification preference to enabled', async () => {
      mockSetUserNotificationPreference.mockResolvedValue(true);

      await testApiHandler({
        appHandler,
        test: async ({ fetch }) => {
          const response = await fetch({
            method: 'PUT',
            body: JSON.stringify({ enabled: true }),
            headers: {
              'Content-Type': 'application/json'
            }
          });

          const data = await response.json();
          
          expect(response.status).toBe(200);
          expect(data.success).toBe(true);
          expect(data.data.enabled).toBe(true);
          expect(data.message).toBe('Notification preference updated successfully');
        }
      });

      expect(mockSetUserNotificationPreference).toHaveBeenCalledWith('user_123', true, undefined);
    });

    it('should update notification preference to disabled', async () => {
      mockSetUserNotificationPreference.mockResolvedValue(true);

      await testApiHandler({
        appHandler,
        test: async ({ fetch }) => {
          const response = await fetch({
            method: 'PUT',
            body: JSON.stringify({ enabled: false }),
            headers: {
              'Content-Type': 'application/json'
            }
          });

          const data = await response.json();
          
          expect(response.status).toBe(200);
          expect(data.success).toBe(true);
          expect(data.data.enabled).toBe(false);
        }
      });

      expect(mockSetUserNotificationPreference).toHaveBeenCalledWith('user_123', false, undefined);
    });

    it('should validate enabled field is boolean', async () => {
      await testApiHandler({
        appHandler,
        test: async ({ fetch }) => {
          const response = await fetch({
            method: 'PUT',
            body: JSON.stringify({ enabled: 'true' }), // String instead of boolean
            headers: {
              'Content-Type': 'application/json'
            }
          });

          const data = await response.json();
          
          expect(response.status).toBe(400);
          expect(data.success).toBe(false);
          expect(data.error).toContain('Expected boolean');
        }
      });

      expect(mockSetUserNotificationPreference).not.toHaveBeenCalled();
    });

    it('should require admin role', async () => {
      mockCheckAdminRole.mockResolvedValue({
        user: null,
        isAdmin: false,
        error: 'Access denied'
      });

      await testApiHandler({
        appHandler,
        test: async ({ fetch }) => {
          const response = await fetch({
            method: 'PUT',
            body: JSON.stringify({ enabled: true }),
            headers: {
              'Content-Type': 'application/json'
            }
          });

          const data = await response.json();
          
          expect(response.status).toBe(401);
          expect(data.success).toBe(false);
          expect(data.error).toBe('Access denied');
        }
      });

      expect(mockSetUserNotificationPreference).not.toHaveBeenCalled();
    });

    it('should handle database update errors', async () => {
      mockSetUserNotificationPreference.mockRejectedValue(new Error('Database update failed'));

      await testApiHandler({
        appHandler,
        test: async ({ fetch }) => {
          const response = await fetch({
            method: 'PUT',
            body: JSON.stringify({ enabled: true }),
            headers: {
              'Content-Type': 'application/json'
            }
          });

          const data = await response.json();
          
          expect(response.status).toBe(500);
          expect(data.success).toBe(false);
          expect(data.error).toContain('Error updating notification preference');
        }
      });
    });

    it('should handle invalid JSON', async () => {
      await testApiHandler({
        appHandler,
        test: async ({ fetch }) => {
          const response = await fetch({
            method: 'PUT',
            body: 'invalid json',
            headers: {
              'Content-Type': 'application/json'
            }
          });

          const data = await response.json();
          
          expect(response.status).toBe(400);
          expect(data.success).toBe(false);
          expect(data.error).toContain('Invalid JSON');
        }
      });
    });
  });

  describe('DELETE', () => {
    it('should return method not allowed for DELETE requests', async () => {
      await testApiHandler({
        appHandler,
        test: async ({ fetch }) => {
          const response = await fetch({
            method: 'DELETE'
          });

          expect(response.status).toBe(405);
        }
      });
    });
  });
});