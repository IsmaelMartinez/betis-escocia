import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock createApiHandler
vi.mock('@/lib/apiUtils', () => ({
  createApiHandler: vi.fn((config) => {
    return async (request: any) => {
      try {
        // Simulate admin auth check
        if (config.auth === 'admin') {
          const mockUser = { id: 'admin-123', role: 'admin' };
          const context = {
            request,
            user: mockUser,
            userId: 'admin-123',
            supabase: undefined,
            authenticatedSupabase: undefined
          };
          
          // Validate with schema if provided
          let validatedData = {};
          if (config.schema && (request.method === 'POST' || request.method === 'PUT')) {
            const body = await request.json();
            validatedData = config.schema.parse(body);
          }
          
          const result = await config.handler(validatedData, context);
          
          return {
            json: () => Promise.resolve(result),
            status: 200
          };
        }
        
        return {
          json: () => Promise.resolve({ error: 'Unauthorized' }),
          status: 401
        };
      } catch (error) {
        return {
          json: () => Promise.resolve({ 
            success: false, 
            error: error instanceof Error ? error.message : 'Internal Server Error' 
          }),
          status: 500
        };
      }
    };
  }),
}));

// Mock admin API protection
vi.mock('@/lib/adminApiProtection', () => ({
  checkAdminRole: vi.fn(),
}));

// Mock preferences database functions
vi.mock('@/lib/notifications/preferencesDb', () => ({
  getUserNotificationPreferenceDb: vi.fn(),
  setUserNotificationPreferenceDb: vi.fn(),
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  log: {
    info: vi.fn(),
    business: vi.fn(),
  },
}));

// Mock Clerk server
vi.mock('@clerk/nextjs/server', () => ({
  getAuth: vi.fn(() => ({
    getToken: vi.fn(),
  })),
}));

// Mock notification preferences schema
vi.mock('@/lib/schemas/admin', () => ({
  notificationPreferencesSchema: {
    parse: vi.fn((data) => data),
  },
}));

// Import after mocking
import { GET, POST, PUT } from '@/app/api/notifications/preferences/route';

describe('Notifications Preferences API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/notifications/preferences', () => {
    it('should return user notification preferences', async () => {
      const { checkAdminRole } = await import('@/lib/adminApiProtection');
      const { getUserNotificationPreferenceDb } = await import('@/lib/notifications/preferencesDb');
      const { getAuth } = await import('@clerk/nextjs/server');
      
      // Mock admin user
      vi.mocked(checkAdminRole).mockResolvedValue({
        user: { id: 'admin-123', role: 'admin' },
        isAdmin: true,
        error: null,
      } as any);

      // Mock Clerk token
      const mockGetToken = vi.fn().mockResolvedValue('clerk-token-123');
      vi.mocked(getAuth).mockReturnValue({
        getToken: mockGetToken,
      } as any);

      // Mock user preference
      vi.mocked(getUserNotificationPreferenceDb).mockResolvedValue(true);

      const request = new NextRequest('http://localhost:3000/api/notifications/preferences');
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.enabled).toBe(true);
      expect(json.userId).toBe('admin-123');
      
      expect(getUserNotificationPreferenceDb).toHaveBeenCalledWith('admin-123', 'clerk-token-123');
    });

    it('should handle disabled preferences', async () => {
      const { checkAdminRole } = await import('@/lib/adminApiProtection');
      const { getUserNotificationPreferenceDb } = await import('@/lib/notifications/preferencesDb');
      const { getAuth } = await import('@clerk/nextjs/server');
      
      vi.mocked(checkAdminRole).mockResolvedValue({
        user: { id: 'admin-123', role: 'admin' },
        isAdmin: true,
        error: null,
      } as any);

      const mockGetToken = vi.fn().mockResolvedValue('clerk-token-123');
      vi.mocked(getAuth).mockReturnValue({
        getToken: mockGetToken,
      } as any);

      // Mock disabled preference
      vi.mocked(getUserNotificationPreferenceDb).mockResolvedValue(false);

      const request = new NextRequest('http://localhost:3000/api/notifications/preferences');
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.enabled).toBe(false);
      expect(json.userId).toBe('admin-123');
    });

    it('should handle missing Clerk token', async () => {
      const { checkAdminRole } = await import('@/lib/adminApiProtection');
      const { getUserNotificationPreferenceDb } = await import('@/lib/notifications/preferencesDb');
      const { getAuth } = await import('@clerk/nextjs/server');
      
      vi.mocked(checkAdminRole).mockResolvedValue({
        user: { id: 'admin-123', role: 'admin' },
        isAdmin: true,
        error: null,
      } as any);

      // Mock missing token
      const mockGetToken = vi.fn().mockResolvedValue(null);
      vi.mocked(getAuth).mockReturnValue({
        getToken: mockGetToken,
      } as any);

      vi.mocked(getUserNotificationPreferenceDb).mockResolvedValue(true);

      const request = new NextRequest('http://localhost:3000/api/notifications/preferences');
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(getUserNotificationPreferenceDb).toHaveBeenCalledWith('admin-123', undefined);
    });

    it('should require admin authentication for GET', async () => {
      const { checkAdminRole } = await import('@/lib/adminApiProtection');
      
      // Mock non-admin user
      vi.mocked(checkAdminRole).mockResolvedValue({
        user: null,
        isAdmin: false,
        error: 'Insufficient permissions',
      } as any);

      const request = new NextRequest('http://localhost:3000/api/notifications/preferences');
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toContain('Insufficient permissions');
    });

    it('should log preference retrieval', async () => {
      const { checkAdminRole } = await import('@/lib/adminApiProtection');
      const { getUserNotificationPreferenceDb } = await import('@/lib/notifications/preferencesDb');
      const { getAuth } = await import('@clerk/nextjs/server');
      const { log } = await import('@/lib/logger');
      
      vi.mocked(checkAdminRole).mockResolvedValue({
        user: { id: 'admin-123', role: 'admin' },
        isAdmin: true,
        error: null,
      } as any);

      const mockGetToken = vi.fn().mockResolvedValue('token');
      vi.mocked(getAuth).mockReturnValue({
        getToken: mockGetToken,
      } as any);

      vi.mocked(getUserNotificationPreferenceDb).mockResolvedValue(true);

      const request = new NextRequest('http://localhost:3000/api/notifications/preferences');
      await GET(request);

      expect(log.info).toHaveBeenCalledWith(
        'Retrieved notification preferences',
        { userId: 'admin-123' },
        { enabled: true }
      );
    });
  });

  describe('POST /api/notifications/preferences', () => {
    it('should enable notifications', async () => {
      const { checkAdminRole } = await import('@/lib/adminApiProtection');
      const { setUserNotificationPreferenceDb } = await import('@/lib/notifications/preferencesDb');
      const { getAuth } = await import('@clerk/nextjs/server');
      
      vi.mocked(checkAdminRole).mockResolvedValue({
        user: { id: 'admin-123', role: 'admin' },
        isAdmin: true,
        error: null,
      } as any);

      const mockGetToken = vi.fn().mockResolvedValue('clerk-token-123');
      vi.mocked(getAuth).mockReturnValue({
        getToken: mockGetToken,
      } as any);

      vi.mocked(setUserNotificationPreferenceDb).mockResolvedValue(undefined);

      const requestBody = { enabled: true };
      const request = new NextRequest('http://localhost:3000/api/notifications/preferences', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });
      
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.enabled).toBe(true);
      expect(json.userId).toBe('admin-123');
      expect(json.message).toBe('Notifications enabled successfully');
      
      expect(setUserNotificationPreferenceDb).toHaveBeenCalledWith('admin-123', true, 'clerk-token-123');
    });

    it('should disable notifications', async () => {
      const { checkAdminRole } = await import('@/lib/adminApiProtection');
      const { setUserNotificationPreferenceDb } = await import('@/lib/notifications/preferencesDb');
      const { getAuth } = await import('@clerk/nextjs/server');
      
      vi.mocked(checkAdminRole).mockResolvedValue({
        user: { id: 'admin-123', role: 'admin' },
        isAdmin: true,
        error: null,
      } as any);

      const mockGetToken = vi.fn().mockResolvedValue('clerk-token-123');
      vi.mocked(getAuth).mockReturnValue({
        getToken: mockGetToken,
      } as any);

      vi.mocked(setUserNotificationPreferenceDb).mockResolvedValue(undefined);

      const requestBody = { enabled: false };
      const request = new NextRequest('http://localhost:3000/api/notifications/preferences', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });
      
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.enabled).toBe(false);
      expect(json.userId).toBe('admin-123');
      expect(json.message).toBe('Notifications disabled successfully');
    });

    it('should log business event on preference update', async () => {
      const { checkAdminRole } = await import('@/lib/adminApiProtection');
      const { setUserNotificationPreferenceDb } = await import('@/lib/notifications/preferencesDb');
      const { getAuth } = await import('@clerk/nextjs/server');
      const { log } = await import('@/lib/logger');
      
      vi.mocked(checkAdminRole).mockResolvedValue({
        user: { id: 'admin-123', role: 'admin' },
        isAdmin: true,
        error: null,
      } as any);

      const mockGetToken = vi.fn().mockResolvedValue('token');
      vi.mocked(getAuth).mockReturnValue({
        getToken: mockGetToken,
      } as any);

      vi.mocked(setUserNotificationPreferenceDb).mockResolvedValue(undefined);

      const requestBody = { enabled: true };
      const request = new NextRequest('http://localhost:3000/api/notifications/preferences', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });
      
      await POST(request);

      expect(log.business).toHaveBeenCalledWith(
        'notification_preference_updated',
        { enabled: true },
        { userId: 'admin-123' }
      );
    });

    it('should validate request data with schema', async () => {
      const { notificationPreferencesSchema } = await import('@/lib/schemas/admin');
      
      const requestBody = { enabled: true };
      const request = new NextRequest('http://localhost:3000/api/notifications/preferences', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });
      
      await POST(request);

      expect(notificationPreferencesSchema.parse).toHaveBeenCalledWith(requestBody);
    });

    it('should require admin authentication for POST', async () => {
      const { checkAdminRole } = await import('@/lib/adminApiProtection');
      
      vi.mocked(checkAdminRole).mockResolvedValue({
        user: null,
        isAdmin: false,
        error: 'Access denied',
      } as any);

      const requestBody = { enabled: true };
      const request = new NextRequest('http://localhost:3000/api/notifications/preferences', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });
      
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toContain('Access denied');
    });
  });

  describe('PUT /api/notifications/preferences', () => {
    it('should work the same as POST', async () => {
      const { checkAdminRole } = await import('@/lib/adminApiProtection');
      const { setUserNotificationPreferenceDb } = await import('@/lib/notifications/preferencesDb');
      const { getAuth } = await import('@clerk/nextjs/server');
      
      vi.mocked(checkAdminRole).mockResolvedValue({
        user: { id: 'admin-123', role: 'admin' },
        isAdmin: true,
        error: null,
      } as any);

      const mockGetToken = vi.fn().mockResolvedValue('clerk-token-123');
      vi.mocked(getAuth).mockReturnValue({
        getToken: mockGetToken,
      } as any);

      vi.mocked(setUserNotificationPreferenceDb).mockResolvedValue(undefined);

      const requestBody = { enabled: true };
      const request = new NextRequest('http://localhost:3000/api/notifications/preferences', {
        method: 'PUT',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });
      
      const response = await PUT(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.enabled).toBe(true);
      expect(json.userId).toBe('admin-123');
      expect(json.message).toBe('Notifications enabled successfully');
    });

    it('should handle disable via PUT', async () => {
      const { checkAdminRole } = await import('@/lib/adminApiProtection');
      const { setUserNotificationPreferenceDb } = await import('@/lib/notifications/preferencesDb');
      const { getAuth } = await import('@clerk/nextjs/server');
      
      vi.mocked(checkAdminRole).mockResolvedValue({
        user: { id: 'admin-456', role: 'admin' },
        isAdmin: true,
        error: null,
      } as any);

      const mockGetToken = vi.fn().mockResolvedValue('token-456');
      vi.mocked(getAuth).mockReturnValue({
        getToken: mockGetToken,
      } as any);

      vi.mocked(setUserNotificationPreferenceDb).mockResolvedValue(undefined);

      const requestBody = { enabled: false };
      const request = new NextRequest('http://localhost:3000/api/notifications/preferences', {
        method: 'PUT',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });
      
      const response = await PUT(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.success).toBe(true);
      expect(json.enabled).toBe(false);
      expect(json.userId).toBe('admin-456');
      expect(json.message).toBe('Notifications disabled successfully');
    });
  });

  describe('Error Handling', () => {
    it('should handle database errors in getUserNotificationPreferenceDb', async () => {
      const { checkAdminRole } = await import('@/lib/adminApiProtection');
      const { getUserNotificationPreferenceDb } = await import('@/lib/notifications/preferencesDb');
      const { getAuth } = await import('@clerk/nextjs/server');
      
      vi.mocked(checkAdminRole).mockResolvedValue({
        user: { id: 'admin-123', role: 'admin' },
        isAdmin: true,
        error: null,
      } as any);

      const mockGetToken = vi.fn().mockResolvedValue('token');
      vi.mocked(getAuth).mockReturnValue({
        getToken: mockGetToken,
      } as any);

      vi.mocked(getUserNotificationPreferenceDb).mockRejectedValue(new Error('Database error'));

      const request = new NextRequest('http://localhost:3000/api/notifications/preferences');
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toContain('Database error');
    });

    it('should handle database errors in setUserNotificationPreferenceDb', async () => {
      const { checkAdminRole } = await import('@/lib/adminApiProtection');
      const { setUserNotificationPreferenceDb } = await import('@/lib/notifications/preferencesDb');
      const { getAuth } = await import('@clerk/nextjs/server');
      
      vi.mocked(checkAdminRole).mockResolvedValue({
        user: { id: 'admin-123', role: 'admin' },
        isAdmin: true,
        error: null,
      } as any);

      const mockGetToken = vi.fn().mockResolvedValue('token');
      vi.mocked(getAuth).mockReturnValue({
        getToken: mockGetToken,
      } as any);

      vi.mocked(setUserNotificationPreferenceDb).mockRejectedValue(new Error('Database update failed'));

      const requestBody = { enabled: true };
      const request = new NextRequest('http://localhost:3000/api/notifications/preferences', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });
      
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toContain('Database update failed');
    });

    it('should handle schema validation errors', async () => {
      const { notificationPreferencesSchema } = await import('@/lib/schemas/admin');
      
      // Mock schema validation error
      vi.mocked(notificationPreferencesSchema.parse).mockImplementation(() => {
        throw new Error('Invalid data format');
      });

      const requestBody = { invalid: 'data' };
      const request = new NextRequest('http://localhost:3000/api/notifications/preferences', {
        method: 'POST',
        body: JSON.stringify(requestBody),
        headers: { 'Content-Type': 'application/json' },
      });
      
      const response = await POST(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toContain('Invalid data format');
    });
  });
});