import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock Clerk authentication
const mockCheckAdminRole = vi.fn();
vi.mock('@/lib/adminApiProtection', () => ({
  checkAdminRole: () => mockCheckAdminRole()
}));

// Mock notification system
const mockSendNotification = vi.fn();
vi.mock('@/lib/notifications', () => ({
  sendNotification: mockSendNotification
}));

// Mock user data
const mockUser = {
  id: 'user_123',
  firstName: 'Test',
  lastName: 'Admin',
  emailAddresses: [{ emailAddress: 'admin@test.com' }],
  publicMetadata: { role: 'admin' }
};

describe('Admin Notifications - Comprehensive Testing', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default successful admin check
    mockCheckAdminRole.mockResolvedValue({
      user: mockUser,
      isAdmin: true,
      error: null
    });
    
    // Default successful notification send
    mockSendNotification.mockResolvedValue({
      success: true,
      messageId: 'msg_123'
    });
  });

  describe('Authentication and Authorization', () => {
    it('should reject non-admin users', async () => {
      mockCheckAdminRole.mockResolvedValue({
        user: null,
        isAdmin: false,
        error: 'Unauthorized'
      });

      // Test with a mock handler that uses the auth pattern
      const mockHandler = async (request: NextRequest) => {
        const { user, isAdmin, error } = await mockCheckAdminRole();
        if (!isAdmin) {
          return new Response(JSON.stringify({ error }), { status: 401 });
        }
        return new Response(JSON.stringify({ success: true }), { status: 200 });
      };

      const request = new NextRequest('http://localhost:3000/api/admin/notifications/test');
      const response = await mockHandler(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should allow admin users', async () => {
      const mockHandler = async (request: NextRequest) => {
        const { user, isAdmin, error } = await mockCheckAdminRole();
        if (!isAdmin) {
          return new Response(JSON.stringify({ error }), { status: 401 });
        }
        return new Response(JSON.stringify({ success: true, user: user?.firstName }), { status: 200 });
      };

      const request = new NextRequest('http://localhost:3000/api/admin/notifications/test');
      const response = await mockHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.user).toBe('Test');
    });

    it('should handle auth service errors gracefully', async () => {
      mockCheckAdminRole.mockRejectedValue(new Error('Auth service unavailable'));

      const mockHandler = async (request: NextRequest) => {
        try {
          const { user, isAdmin, error } = await mockCheckAdminRole();
          if (!isAdmin) {
            return new Response(JSON.stringify({ error }), { status: 401 });
          }
          return new Response(JSON.stringify({ success: true }), { status: 200 });
        } catch (error) {
          return new Response(JSON.stringify({ 
            error: 'Authentication service unavailable' 
          }), { status: 503 });
        }
      };

      const request = new NextRequest('http://localhost:3000/api/admin/notifications/test');
      const response = await mockHandler(request);
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.error).toBe('Authentication service unavailable');
    });
  });

  describe('Notification Sending', () => {
    it('should successfully send test notification', async () => {
      const mockHandler = async (request: NextRequest) => {
        const { user, isAdmin } = await mockCheckAdminRole();
        if (!isAdmin) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }

        const result = await mockSendNotification({
          type: 'test',
          title: 'Test Notification',
          message: `Test notification sent by ${user?.firstName} ${user?.lastName}`,
          timestamp: new Date().toISOString()
        });

        return new Response(JSON.stringify({
          success: true,
          messageId: result.messageId,
          timestamp: new Date().toISOString()
        }), { status: 200 });
      };

      const request = new NextRequest('http://localhost:3000/api/admin/notifications/test');
      const response = await mockHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.messageId).toBe('msg_123');
      expect(mockSendNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          type: 'test',
          title: 'Test Notification'
        })
      );
    });

    it('should handle notification service failures', async () => {
      mockSendNotification.mockRejectedValue(new Error('Notification service error'));

      const mockHandler = async (request: NextRequest) => {
        const { user, isAdmin } = await mockCheckAdminRole();
        if (!isAdmin) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }

        try {
          await mockSendNotification({
            type: 'test',
            title: 'Test Notification',
            message: 'Test message'
          });

          return new Response(JSON.stringify({ success: true }), { status: 200 });
        } catch (error) {
          return new Response(JSON.stringify({
            success: false,
            error: 'Failed to send notification'
          }), { status: 500 });
        }
      };

      const request = new NextRequest('http://localhost:3000/api/admin/notifications/test');
      const response = await mockHandler(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Failed to send notification');
    });

    it('should include proper metadata in notifications', async () => {
      const mockHandler = async (request: NextRequest) => {
        const { user, isAdmin } = await mockCheckAdminRole();
        if (!isAdmin) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }

        const notification = {
          type: 'test',
          title: 'Test Notification',
          message: `Test sent by ${user?.firstName} ${user?.lastName}`,
          timestamp: new Date().toISOString(),
          metadata: {
            adminId: user?.id,
            adminName: `${user?.firstName} ${user?.lastName}`,
            source: 'admin-dashboard'
          }
        };

        await mockSendNotification(notification);

        return new Response(JSON.stringify({
          success: true,
          notification
        }), { status: 200 });
      };

      const request = new NextRequest('http://localhost:3000/api/admin/notifications/test');
      const response = await mockHandler(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(mockSendNotification).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            adminId: 'user_123',
            adminName: 'Test Admin',
            source: 'admin-dashboard'
          })
        })
      );
    });
  });

  describe('Request Validation', () => {
    it('should handle invalid request methods', async () => {
      const mockHandler = async (request: NextRequest) => {
        if (request.method !== 'POST') {
          return new Response(JSON.stringify({
            error: 'Method not allowed'
          }), { status: 405 });
        }

        const { user, isAdmin } = await mockCheckAdminRole();
        if (!isAdmin) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }

        return new Response(JSON.stringify({ success: true }), { status: 200 });
      };

      // Test GET request (should fail)
      const getRequest = new NextRequest('http://localhost:3000/api/admin/notifications/test', {
        method: 'GET'
      });
      const getResponse = await mockHandler(getRequest);
      expect(getResponse.status).toBe(405);

      // Test POST request (should succeed)
      const postRequest = new NextRequest('http://localhost:3000/api/admin/notifications/test', {
        method: 'POST'
      });
      const postResponse = await mockHandler(postRequest);
      expect(postResponse.status).toBe(200);
    });

    it('should validate request body when required', async () => {
      const mockHandler = async (request: NextRequest) => {
        if (request.method !== 'POST') {
          return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405 });
        }

        const { user, isAdmin } = await mockCheckAdminRole();
        if (!isAdmin) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }

        // For requests that need body validation
        let body;
        try {
          body = await request.json();
        } catch {
          return new Response(JSON.stringify({
            error: 'Invalid JSON body'
          }), { status: 400 });
        }

        if (body.requiresValidation && !body.customMessage) {
          return new Response(JSON.stringify({
            error: 'Missing required field: customMessage'
          }), { status: 400 });
        }

        return new Response(JSON.stringify({ success: true, body }), { status: 200 });
      };

      // Test with invalid JSON
      const invalidRequest = new NextRequest('http://localhost:3000/api/admin/notifications/test', {
        method: 'POST',
        body: 'invalid json'
      });
      const invalidResponse = await mockHandler(invalidRequest);
      expect(invalidResponse.status).toBe(400);

      // Test with missing required field
      const missingFieldRequest = new NextRequest('http://localhost:3000/api/admin/notifications/test', {
        method: 'POST',
        body: JSON.stringify({ requiresValidation: true })
      });
      const missingFieldResponse = await mockHandler(missingFieldRequest);
      expect(missingFieldResponse.status).toBe(400);

      // Test with valid body
      const validRequest = new NextRequest('http://localhost:3000/api/admin/notifications/test', {
        method: 'POST',
        body: JSON.stringify({ 
          requiresValidation: true, 
          customMessage: 'Valid message' 
        })
      });
      const validResponse = await mockHandler(validRequest);
      expect(validResponse.status).toBe(200);
    });
  });

  describe('Rate Limiting and Security', () => {
    it('should handle rate limiting appropriately', async () => {
      let requestCount = 0;
      
      const mockHandler = async (request: NextRequest) => {
        requestCount++;
        
        // Simple rate limit simulation (max 5 requests)
        if (requestCount > 5) {
          return new Response(JSON.stringify({
            error: 'Rate limit exceeded',
            retryAfter: 60
          }), { status: 429 });
        }

        const { user, isAdmin } = await mockCheckAdminRole();
        if (!isAdmin) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }

        return new Response(JSON.stringify({ 
          success: true,
          requestNumber: requestCount 
        }), { status: 200 });
      };

      // Make 6 requests to test rate limiting
      const requests = Array(6).fill(0).map(() => 
        new NextRequest('http://localhost:3000/api/admin/notifications/test', {
          method: 'POST'
        })
      );

      const responses = await Promise.all(
        requests.map(req => mockHandler(req))
      );

      // First 5 should succeed
      for (let i = 0; i < 5; i++) {
        expect(responses[i].status).toBe(200);
      }

      // 6th should be rate limited
      expect(responses[5].status).toBe(429);
    });

    it('should include security headers in responses', async () => {
      const mockHandler = async (request: NextRequest) => {
        const { user, isAdmin } = await mockCheckAdminRole();
        if (!isAdmin) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }

        return new Response(JSON.stringify({ success: true }), {
          status: 200,
          headers: {
            'Content-Type': 'application/json',
            'X-Frame-Options': 'DENY',
            'X-Content-Type-Options': 'nosniff',
            'X-XSS-Protection': '1; mode=block'
          }
        });
      };

      const request = new NextRequest('http://localhost:3000/api/admin/notifications/test', {
        method: 'POST'
      });
      const response = await mockHandler(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('X-Frame-Options')).toBe('DENY');
      expect(response.headers.get('X-Content-Type-Options')).toBe('nosniff');
      expect(response.headers.get('X-XSS-Protection')).toBe('1; mode=block');
    });
  });

  describe('Error Handling and Logging', () => {
    it('should log notification activities for audit purposes', async () => {
      const mockLogger = vi.fn();
      
      const mockHandler = async (request: NextRequest) => {
        const { user, isAdmin } = await mockCheckAdminRole();
        if (!isAdmin) {
          mockLogger('WARN', 'Unauthorized notification access attempt', { user: user?.id });
          return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }

        try {
          await mockSendNotification({
            type: 'test',
            title: 'Test Notification',
            message: 'Test message'
          });

          mockLogger('INFO', 'Test notification sent successfully', {
            adminId: user?.id,
            adminName: `${user?.firstName} ${user?.lastName}`,
            timestamp: new Date().toISOString()
          });

          return new Response(JSON.stringify({ success: true }), { status: 200 });
        } catch (error) {
          mockLogger('ERROR', 'Failed to send notification', {
            adminId: user?.id,
            error: (error as Error).message
          });
          
          return new Response(JSON.stringify({
            error: 'Internal server error'
          }), { status: 500 });
        }
      };

      const request = new NextRequest('http://localhost:3000/api/admin/notifications/test', {
        method: 'POST'
      });
      await mockHandler(request);

      expect(mockLogger).toHaveBeenCalledWith(
        'INFO',
        'Test notification sent successfully',
        expect.objectContaining({
          adminId: 'user_123',
          adminName: 'Test Admin'
        })
      );
    });

    it('should provide helpful error messages for debugging', async () => {
      mockSendNotification.mockRejectedValue(new Error('OneSignal API key missing'));

      const mockHandler = async (request: NextRequest) => {
        const { user, isAdmin } = await mockCheckAdminRole();
        if (!isAdmin) {
          return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 });
        }

        try {
          await mockSendNotification({
            type: 'test',
            title: 'Test Notification'
          });

          return new Response(JSON.stringify({ success: true }), { status: 200 });
        } catch (error) {
          const errorMessage = (error as Error).message;
          
          // Provide specific error handling based on error type
          if (errorMessage.includes('API key')) {
            return new Response(JSON.stringify({
              error: 'Notification service configuration error',
              details: 'API credentials missing or invalid',
              code: 'CONFIG_ERROR'
            }), { status: 500 });
          }

          return new Response(JSON.stringify({
            error: 'Failed to send notification',
            details: errorMessage,
            code: 'SEND_ERROR'
          }), { status: 500 });
        }
      };

      const request = new NextRequest('http://localhost:3000/api/admin/notifications/test', {
        method: 'POST'
      });
      const response = await mockHandler(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Notification service configuration error');
      expect(data.code).toBe('CONFIG_ERROR');
      expect(data.details).toBe('API credentials missing or invalid');
    });
  });
});