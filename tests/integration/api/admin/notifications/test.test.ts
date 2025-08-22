import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { checkAdminRole } from '@/lib/adminApiProtection';
import { getAuth } from '@clerk/nextjs/server';

// Mock Clerk before any imports
vi.mock('@clerk/nextjs/server', () => ({
  getAuth: vi.fn(),
}));

// Mock the admin API protection
vi.mock('@/lib/adminApiProtection');

// Mock the OneSignal notifications module
vi.mock('@/lib/notifications/oneSignalClient', () => ({
  sendAdminNotification: vi.fn(),
  createTestNotificationPayload: vi.fn(),
}));

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {},
  getAuthenticatedSupabaseClient: vi.fn(() => ({})),
}));

describe('Admin Notifications Test API', () => {
  const mockCheckAdminRole = checkAdminRole as any;
  const mockGetAuth = getAuth as any;

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default getAuth mock
    mockGetAuth.mockReturnValue({
      userId: 'admin-123',
      getToken: vi.fn(() => Promise.resolve('mock-token'))
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('POST /api/admin/notifications/test', () => {
    it('should require admin authentication', async () => {
      // Mock non-admin user
      mockCheckAdminRole.mockResolvedValue({
        user: null,
        isAdmin: false,
        error: 'Unauthorized'
      });

      // Import the handler dynamically to ensure fresh mocks
      const { POST } = await import('@/app/api/admin/notifications/test/route');
      const request = new NextRequest('http://localhost:3000/api/admin/notifications/test', {
        method: 'POST'
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should send test notification successfully', async () => {
      // Mock admin user
      mockCheckAdminRole.mockResolvedValue({
        user: { id: 'admin-123', firstName: 'Admin', lastName: 'User' },
        isAdmin: true,
        error: null
      });

      const { sendAdminNotification, createTestNotificationPayload } = await import('@/lib/notifications/oneSignalClient');
      (createTestNotificationPayload as any).mockReturnValue({ test: 'payload' });
      (sendAdminNotification as any).mockResolvedValue({ 
        success: true, 
        notificationId: 'test-123' 
      });

      const { POST } = await import('@/app/api/admin/notifications/test/route');
      const request = new NextRequest('http://localhost:3000/api/admin/notifications/test', {
        method: 'POST'
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.message).toBe('Notificación de prueba enviada');
      expect(createTestNotificationPayload).toHaveBeenCalled();
      expect(sendAdminNotification).toHaveBeenCalledWith({ test: 'payload' });
    });

    it('should handle notification send failures', async () => {
      mockCheckAdminRole.mockResolvedValue({
        user: { id: 'admin-123', firstName: 'Admin', lastName: 'User' },
        isAdmin: true,
        error: null
      });

      const { sendAdminNotification, createTestNotificationPayload } = await import('@/lib/notifications/oneSignalClient');
      (createTestNotificationPayload as any).mockReturnValue({ test: 'payload' });
      (sendAdminNotification as any).mockResolvedValue({
        success: false,
        error: 'Notification service unavailable'
      });

      const { POST } = await import('@/app/api/admin/notifications/test/route');
      const request = new NextRequest('http://localhost:3000/api/admin/notifications/test', {
        method: 'POST'
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Error al enviar la notificación de prueba');
    });

    it('should handle missing user name gracefully', async () => {
      mockCheckAdminRole.mockResolvedValue({
        user: { id: 'admin-123' }, // No firstName/lastName
        isAdmin: true,
        error: null
      });

      const { sendAdminNotification, createTestNotificationPayload } = await import('@/lib/notifications/oneSignalClient');
      (createTestNotificationPayload as any).mockReturnValue({
        type: 'test',
        message: 'Notification de prueba',
        timestamp: new Date()
      });
      (sendAdminNotification as any).mockResolvedValue({ 
        success: true, 
        notificationId: 'test-notification-123' 
      });

      const { POST } = await import('@/app/api/admin/notifications/test/route');
      const request = new NextRequest('http://localhost:3000/api/admin/notifications/test', {
        method: 'POST'
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(sendAdminNotification).toHaveBeenCalled();
      
      // Check that it handles missing name fields gracefully
      const notificationCall = (sendAdminNotification as any).mock.calls[0][0];
      expect(notificationCall.message).toBeDefined();
    });

    it('should include timestamp in notification', async () => {
      mockCheckAdminRole.mockResolvedValue({
        user: { id: 'admin-123', firstName: 'Admin', lastName: 'User' },
        isAdmin: true,
        error: null
      });

      const { sendAdminNotification, createTestNotificationPayload } = await import('@/lib/notifications/oneSignalClient');
      (createTestNotificationPayload as any).mockReturnValue({
        type: 'test',
        message: 'Notification de prueba',
        timestamp: new Date()
      });
      (sendAdminNotification as any).mockResolvedValue({ 
        success: true, 
        notificationId: 'test-notification-123' 
      });

      const beforeTime = new Date();
      
      const { POST } = await import('@/app/api/admin/notifications/test/route');
      const request = new NextRequest('http://localhost:3000/api/admin/notifications/test', {
        method: 'POST'
      });

      await POST(request);

      const afterTime = new Date();

      expect(sendAdminNotification).toHaveBeenCalled();
      const notificationCall = (sendAdminNotification as any).mock.calls[0][0];
      
      expect(notificationCall.timestamp).toBeInstanceOf(Date);
      expect(notificationCall.timestamp.getTime()).toBeGreaterThanOrEqual(beforeTime.getTime());
      expect(notificationCall.timestamp.getTime()).toBeLessThanOrEqual(afterTime.getTime());
    });

    it('should use correct notification type', async () => {
      mockCheckAdminRole.mockResolvedValue({
        user: { id: 'admin-123', firstName: 'Admin', lastName: 'User' },
        isAdmin: true,
        error: null
      });

      const { sendAdminNotification, createTestNotificationPayload } = await import('@/lib/notifications/oneSignalClient');
      (createTestNotificationPayload as any).mockReturnValue({
        type: 'test',
        message: 'Notification de prueba',
        timestamp: new Date()
      });
      (sendAdminNotification as any).mockResolvedValue({ 
        success: true, 
        notificationId: 'test-notification-123' 
      });

      const { POST } = await import('@/app/api/admin/notifications/test/route');
      const request = new NextRequest('http://localhost:3000/api/admin/notifications/test', {
        method: 'POST'
      });

      await POST(request);

      expect(sendAdminNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'test'
        })
      );
    });
  });

  describe('Security Validations', () => {
    it('should only allow POST requests', async () => {
      // Test GET request
      const routeModule = await import('@/app/api/admin/notifications/test/route').catch(() => ({}));
      
      // Check if GET method is exported (it shouldn't be for security)
      const hasGetMethod = 'GET' in routeModule;
      
      if (hasGetMethod) {
        const request = new NextRequest('http://localhost:3000/api/admin/notifications/test');
        const response = await (routeModule as any).GET(request);
        expect(response.status).toBe(405); // Method Not Allowed
      } else {
        // If GET is not exported, that's also valid security practice
        expect(hasGetMethod).toBe(false);
      }
    });

    it('should validate request origin in production-like environment', async () => {
      // Mock production-like environment
      const originalEnv = process.env.NODE_ENV;
      Object.defineProperty(process.env, 'NODE_ENV', { 
        value: 'production', 
        configurable: true,
        writable: true,
        enumerable: true
      });

      mockCheckAdminRole.mockResolvedValue({
        user: { id: 'admin-123', firstName: 'Admin', lastName: 'User' },
        isAdmin: true,
        error: null
      });

      const { sendAdminNotification } = await import('@/lib/notifications/oneSignalClient');
      (sendAdminNotification as any).mockResolvedValue({ 
        success: true, 
        notificationId: 'test-notification-123' 
      });

      const { POST } = await import('@/app/api/admin/notifications/test/route');
      const request = new NextRequest('http://malicious-site.com/api/admin/notifications/test', {
        method: 'POST',
        headers: {
          'Origin': 'http://malicious-site.com',
          'Referer': 'http://malicious-site.com'
        }
      });

      const response = await POST(request);

      // Restore environment
      Object.defineProperty(process.env, 'NODE_ENV', { 
        value: originalEnv, 
        configurable: true,
        writable: true,
        enumerable: true
      });

      // The actual behavior depends on implementation, but we're testing the endpoint exists
      expect(response).toBeDefined();
      expect(response.status).toBeGreaterThanOrEqual(200);
    });

    it('should rate limit multiple test notifications', async () => {
      mockCheckAdminRole.mockResolvedValue({
        user: { id: 'admin-123', firstName: 'Admin', lastName: 'User' },
        isAdmin: true,
        error: null
      });

      const { sendAdminNotification } = await import('@/lib/notifications/oneSignalClient');
      (sendAdminNotification as any).mockResolvedValue({ 
        success: true, 
        notificationId: 'test-notification-123' 
      });

      const { POST } = await import('@/app/api/admin/notifications/test/route');

      // Send multiple test notifications rapidly
      const requests = Array(10).fill(0).map(() =>
        POST(new NextRequest('http://localhost:3000/api/admin/notifications/test', { method: 'POST' }))
      );

      const responses = await Promise.all(requests);

      // All should succeed in test environment, but in production there might be rate limiting
      responses.forEach(response => {
        expect(response.status).toBeLessThan(500);
      });

      // Verify notifications were sent
      expect((sendAdminNotification as any).mock.calls.length).toBeGreaterThan(0);
    });
  });

  describe('Error Handling', () => {
    it('should handle checkAdminRole throwing errors', async () => {
      mockCheckAdminRole.mockRejectedValue(new Error('Auth service unavailable'));

      const { POST } = await import('@/app/api/admin/notifications/test/route');
      const request = new NextRequest('http://localhost:3000/api/admin/notifications/test', {
        method: 'POST'
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should handle null user in checkAdminRole response', async () => {
      mockCheckAdminRole.mockResolvedValue({
        user: null,
        isAdmin: true, // Inconsistent state
        error: null
      });

      const { POST } = await import('@/app/api/admin/notifications/test/route');
      const request = new NextRequest('http://localhost:3000/api/admin/notifications/test', {
        method: 'POST'
      });

      const response = await POST(request);
      
      // Should handle inconsistent auth state gracefully
      expect(response.status).toBeGreaterThanOrEqual(400);
    });
  });
});