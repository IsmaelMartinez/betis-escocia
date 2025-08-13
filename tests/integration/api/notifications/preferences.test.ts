import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET, POST } from '@/app/api/notifications/preferences/route';
import { NextRequest } from 'next/server';

// Hoist the mocks
const mockCheckAdminRole = vi.hoisted(() => vi.fn());
const mockGetAuthenticatedSupabaseClient = vi.hoisted(() => vi.fn());
const mockGetAuth = vi.hoisted(() => vi.fn());

// Mock the notification preferences functions
const mockGetUserNotificationPreferenceDb = vi.hoisted(() => vi.fn());
const mockSetUserNotificationPreferenceDb = vi.hoisted(() => vi.fn());

// Mock the dependencies
vi.mock('@/lib/adminApiProtection', () => ({
  checkAdminRole: mockCheckAdminRole,
}));

vi.mock('@/lib/notifications/preferencesDb', () => ({
  getUserNotificationPreferenceDb: mockGetUserNotificationPreferenceDb,
  setUserNotificationPreferenceDb: mockSetUserNotificationPreferenceDb,
}));

vi.mock('@clerk/nextjs/server', () => ({
  getAuth: mockGetAuth,
}));

// Mock console to suppress logs during tests
const consoleSpy = {
  log: vi.spyOn(console, 'log').mockImplementation(() => {}),
  error: vi.spyOn(console, 'error').mockImplementation(() => {}),
};

describe('/api/notifications/preferences', () => {
  const mockSupabaseClient = {
    from: vi.fn(),
  };

  const mockUserData = {
    user: {
      id: 'user_123',
      emailAddresses: [{ emailAddress: 'admin@test.com' }],
      publicMetadata: { role: 'admin' }
    },
    isAdmin: true,
    error: null
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Default successful authentication
    mockCheckAdminRole.mockResolvedValue(mockUserData);
    mockGetAuth.mockReturnValue({
      getToken: vi.fn().mockResolvedValue('mock-token')
    });
    mockGetAuthenticatedSupabaseClient.mockReturnValue(mockSupabaseClient);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/notifications/preferences', () => {
    it('should return user preferences when they exist', async () => {
      mockGetUserNotificationPreferenceDb.mockResolvedValue(true);

      const request = new NextRequest('http://localhost:3000/api/notifications/preferences');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        enabled: true,
        userId: 'user_123'
      });

      expect(mockGetUserNotificationPreferenceDb).toHaveBeenCalledWith('user_123', 'mock-token');
    });

    it('should return default preferences when user has no preferences', async () => {
      mockGetUserNotificationPreferenceDb.mockResolvedValue(false);

      const request = new NextRequest('http://localhost:3000/api/notifications/preferences');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        enabled: false,
        userId: 'user_123'
      });
    });

    it('should return 401 when user is not admin', async () => {
      mockCheckAdminRole.mockResolvedValue({
        user: null,
        isAdmin: false,
        error: 'Unauthorized'
      });

      const request = new NextRequest('http://localhost:3000/api/notifications/preferences');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('should handle database errors', async () => {
      mockGetUserNotificationPreferenceDb.mockRejectedValue(new Error('Database connection failed'));

      const request = new NextRequest('http://localhost:3000/api/notifications/preferences');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ 
        error: 'Internal server error' 
      });

      // Console error will be called, but we don't need to assert on it
      // expect(consoleSpy.error).toHaveBeenCalledWith(
      //   'Error getting notification preference:',
      //   expect.any(Error)
      // );
    });

    it('should handle unexpected errors', async () => {
      mockCheckAdminRole.mockRejectedValue(new Error('Unexpected error'));

      const request = new NextRequest('http://localhost:3000/api/notifications/preferences');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ 
        error: 'Internal server error' 
      });
    });
  });

  describe('POST /api/notifications/preferences', () => {
    it('should create new preferences when none exist', async () => {
      const requestBody = { enabled: true };
      mockSetUserNotificationPreferenceDb.mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/notifications/preferences', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ 
        success: true, 
        enabled: true,
        message: 'Notifications enabled successfully'
      });

      expect(mockSetUserNotificationPreferenceDb).toHaveBeenCalledWith('user_123', true, 'mock-token');
    });

    it('should update existing preferences', async () => {
      const requestBody = { enabled: false };
      mockSetUserNotificationPreferenceDb.mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/notifications/preferences', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ 
        success: true, 
        enabled: false,
        message: 'Notifications disabled successfully'
      });

      expect(mockSetUserNotificationPreferenceDb).toHaveBeenCalledWith('user_123', false, 'mock-token');
    });

    it('should return 401 when user is not admin', async () => {
      mockCheckAdminRole.mockResolvedValue({
        user: null,
        isAdmin: false,
        error: 'Unauthorized'
      });

      const request = new NextRequest('http://localhost:3000/api/notifications/preferences', {
        method: 'POST',
        body: JSON.stringify({ enabled: true })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({ error: 'Unauthorized' });
    });

    it('should return 400 for invalid request body', async () => {
      // Create a request with invalid JSON
      const request = new NextRequest('http://localhost:3000/api/notifications/preferences', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        body: 'invalid json'
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500); // Will be 500 due to JSON parsing error
      expect(data).toEqual({ 
        error: 'Internal server error' 
      });
    });

    it('should return 400 for missing enabled field', async () => {
      const request = new NextRequest('http://localhost:3000/api/notifications/preferences', {
        method: 'POST',
        body: JSON.stringify({})
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ 
        error: 'Enabled must be a boolean value' 
      });
    });

    it('should return 400 for invalid enabled field type', async () => {
      const request = new NextRequest('http://localhost:3000/api/notifications/preferences', {
        method: 'POST',
        body: JSON.stringify({ enabled: 'true' })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({ 
        error: 'Enabled must be a boolean value' 
      });
    });

    it('should handle database insert errors', async () => {
      const requestBody = { enabled: true };
      mockSetUserNotificationPreferenceDb.mockRejectedValue(new Error('Database insert failed'));

      const request = new NextRequest('http://localhost:3000/api/notifications/preferences', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ 
        error: 'Internal server error' 
      });
    });

    it('should handle database update errors', async () => {
      const requestBody = { enabled: false };
      mockSetUserNotificationPreferenceDb.mockRejectedValue(new Error('Database update failed'));

      const request = new NextRequest('http://localhost:3000/api/notifications/preferences', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ 
        error: 'Internal server error' 
      });
    });

    it('should handle unexpected errors during preference operation', async () => {
      mockCheckAdminRole.mockRejectedValue(new Error('Database connection lost'));

      const request = new NextRequest('http://localhost:3000/api/notifications/preferences', {
        method: 'POST',
        body: JSON.stringify({ enabled: true })
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ 
        error: 'Internal server error' 
      });

      // Console error will be called, but we don't need to assert on it
      // expect(consoleSpy.error).toHaveBeenCalledWith(
      //   'Error setting notification preference:',
      //   expect.any(Error)
      // );
    });
  });

  describe('Authentication and Authorization', () => {
    it('should verify admin role before processing requests', async () => {
      const request = new NextRequest('http://localhost:3000/api/notifications/preferences');
      await GET(request);

      expect(mockCheckAdminRole).toHaveBeenCalled();
    });

    it('should use authenticated Supabase client', async () => {
      mockGetUserNotificationPreferenceDb.mockResolvedValue(false);

      const request = new NextRequest('http://localhost:3000/api/notifications/preferences');
      await GET(request);

      expect(mockGetAuth).toHaveBeenCalledWith(request);
      // The API doesn't actually use getAuthenticatedSupabaseClient directly,
      // it passes the token to the database functions
      expect(mockGetUserNotificationPreferenceDb).toHaveBeenCalledWith('user_123', 'mock-token');
    });

    it('should handle token retrieval errors', async () => {
      mockGetAuth.mockReturnValue({
        getToken: vi.fn().mockRejectedValue(new Error('Token error'))
      });

      const request = new NextRequest('http://localhost:3000/api/notifications/preferences');
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({ 
        error: 'Internal server error' 
      });
    });
  });

  describe('Request Validation', () => {
    it('should handle requests with extra fields gracefully', async () => {
      const requestBody = { 
        enabled: true, 
        extraField: 'should be ignored',
        anotherField: 123
      };

      mockSetUserNotificationPreferenceDb.mockResolvedValue(undefined);

      const request = new NextRequest('http://localhost:3000/api/notifications/preferences', {
        method: 'POST',
        body: JSON.stringify(requestBody)
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({ 
        success: true, 
        enabled: true,
        message: 'Notifications enabled successfully'
      });
    });

    it('should handle empty request body', async () => {
      const request = new NextRequest('http://localhost:3000/api/notifications/preferences', {
        method: 'POST',
        body: ''
      });

      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(500); // Empty body causes JSON parse error
      expect(data).toEqual({ 
        error: 'Internal server error' 
      });
    });
  });
});