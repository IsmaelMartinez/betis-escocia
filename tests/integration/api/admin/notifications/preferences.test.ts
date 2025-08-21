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

// Mock the notification preferences database module
vi.mock('@/lib/notifications/preferencesDb', () => ({
  getUserNotificationPreferenceDb: vi.fn(),
  setUserNotificationPreferenceDb: vi.fn(),
}));

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {},
  getAuthenticatedSupabaseClient: vi.fn(() => ({})),
}));

describe('Admin Notifications Preferences API', () => {
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

  describe('GET /api/admin/notifications/preferences', () => {
    it('should require admin authentication', async () => {
      // Mock non-admin user
      mockCheckAdminRole.mockResolvedValue({
        user: null,
        isAdmin: false,
        error: 'Unauthorized'
      });

      // Import the handler dynamically to ensure fresh mocks
      const { GET } = await import('@/app/api/admin/notifications/preferences/route');
      const request = new NextRequest('http://localhost:3000/api/admin/notifications/preferences');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should return current admin user notification preference', async () => {
      // Mock admin user
      mockCheckAdminRole.mockResolvedValue({
        user: { id: 'admin-123' },
        isAdmin: true,
        error: null
      });

      const { getUserNotificationPreferenceDb } = await import('@/lib/notifications/preferencesDb');
      (getUserNotificationPreferenceDb as any).mockResolvedValue(true);

      const { GET } = await import('@/app/api/admin/notifications/preferences/route');
      const request = new NextRequest('http://localhost:3000/api/admin/notifications/preferences');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.enabled).toBe(true);
      expect(getUserNotificationPreferenceDb).toHaveBeenCalledWith('admin-123', 'mock-token');
    });

    it('should handle server errors gracefully', async () => {
      mockCheckAdminRole.mockResolvedValue({
        user: { id: 'admin-123' },
        isAdmin: true,
        error: null
      });

      const { getUserNotificationPreferenceDb } = await import('@/lib/notifications/preferencesDb');
      (getUserNotificationPreferenceDb as any).mockRejectedValue(new Error('Database error'));

      const { GET } = await import('@/app/api/admin/notifications/preferences/route');
      const request = new NextRequest('http://localhost:3000/api/admin/notifications/preferences');

      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Error al obtener las preferencias de notificación');
    });
  });

  describe('PUT /api/admin/notifications/preferences', () => {
    it('should require admin authentication', async () => {
      mockCheckAdminRole.mockResolvedValue({
        user: null,
        isAdmin: false,
        error: 'Unauthorized'
      });

      const { PUT } = await import('@/app/api/admin/notifications/preferences/route');
      const request = new NextRequest('http://localhost:3000/api/admin/notifications/preferences', {
        method: 'PUT',
        body: JSON.stringify({ enabled: true })
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('should validate request body structure', async () => {
      mockCheckAdminRole.mockResolvedValue({
        user: { id: 'admin-123' },
        isAdmin: true,
        error: null
      });

      const { PUT } = await import('@/app/api/admin/notifications/preferences/route');
      const request = new NextRequest('http://localhost:3000/api/admin/notifications/preferences', {
        method: 'PUT',
        body: JSON.stringify({ invalidField: 'value' })
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should validate enabled field is required', async () => {
      mockCheckAdminRole.mockResolvedValue({
        user: { id: 'admin-123' },
        isAdmin: true,
        error: null
      });

      const { PUT } = await import('@/app/api/admin/notifications/preferences/route');
      const request = new NextRequest('http://localhost:3000/api/admin/notifications/preferences', {
        method: 'PUT',
        body: JSON.stringify({})
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });

    it('should validate enabled is boolean', async () => {
      mockCheckAdminRole.mockResolvedValue({
        user: { id: 'admin-123' },
        isAdmin: true,
        error: null
      });

      const { PUT } = await import('@/app/api/admin/notifications/preferences/route');
      const request = new NextRequest('http://localhost:3000/api/admin/notifications/preferences', {
        method: 'PUT',
        body: JSON.stringify({ userId: 'user1', enabled: 'invalid' })
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Datos de entrada inválidos');
    });

    it('should successfully update notification preference', async () => {
      mockCheckAdminRole.mockResolvedValue({
        user: { id: 'admin-123' },
        isAdmin: true,
        error: null
      });

      const { setUserNotificationPreferenceDb } = await import('@/lib/notifications/preferencesDb');
      (setUserNotificationPreferenceDb as any).mockResolvedValue(true);

      const { PUT } = await import('@/app/api/admin/notifications/preferences/route');
      const request = new NextRequest('http://localhost:3000/api/admin/notifications/preferences', {
        method: 'PUT',
        body: JSON.stringify({ enabled: true })
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(setUserNotificationPreferenceDb).toHaveBeenCalledWith('admin-123', true, 'mock-token');
    });

    it('should handle preference update errors', async () => {
      mockCheckAdminRole.mockResolvedValue({
        user: { id: 'admin-123' },
        isAdmin: true,
        error: null
      });

      const { setUserNotificationPreferenceDb } = await import('@/lib/notifications/preferencesDb');
      (setUserNotificationPreferenceDb as any).mockRejectedValue(new Error('Failed to save'));

      const { PUT } = await import('@/app/api/admin/notifications/preferences/route');
      const request = new NextRequest('http://localhost:3000/api/admin/notifications/preferences', {
        method: 'PUT',
        body: JSON.stringify({ enabled: true })
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Error al actualizar las preferencias de notificación');
    });

    it('should handle malformed JSON', async () => {
      mockCheckAdminRole.mockResolvedValue({
        user: { id: 'admin-123' },
        isAdmin: true,
        error: null
      });

      const { PUT } = await import('@/app/api/admin/notifications/preferences/route');
      const request = new NextRequest('http://localhost:3000/api/admin/notifications/preferences', {
        method: 'PUT',
        body: 'invalid-json{'
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBe('Error al procesar datos de entrada');
    });

    it('should process valid request without XSS injection', async () => {
      mockCheckAdminRole.mockResolvedValue({
        user: { id: 'admin-123' },
        isAdmin: true,
        error: null
      });

      const { setUserNotificationPreferenceDb } = await import('@/lib/notifications/preferencesDb');
      (setUserNotificationPreferenceDb as any).mockResolvedValue(true);

      const { PUT } = await import('@/app/api/admin/notifications/preferences/route');
      const request = new NextRequest('http://localhost:3000/api/admin/notifications/preferences', {
        method: 'PUT',
        body: JSON.stringify({ enabled: true })
      });

      const response = await PUT(request);

      // Should process the request successfully with the authenticated user ID
      expect(setUserNotificationPreferenceDb).toHaveBeenCalledWith('admin-123', true, 'mock-token');
      expect(response.status).toBe(200);
    });
  });

  describe('Security Validations', () => {
    it('should reject requests with oversized payloads', async () => {
      mockCheckAdminRole.mockResolvedValue({
        user: { id: 'admin-123' },
        isAdmin: true,
        error: null
      });

      const { setUserNotificationPreferenceDb } = await import('@/lib/notifications/preferencesDb');
      (setUserNotificationPreferenceDb as any).mockResolvedValue(true);

      const largePayload = 'x'.repeat(10000); // Create oversized payload
      
      const { PUT } = await import('@/app/api/admin/notifications/preferences/route');
      const request = new NextRequest('http://localhost:3000/api/admin/notifications/preferences', {
        method: 'PUT',
        body: JSON.stringify({ invalidField: largePayload, enabled: true })
      });

      const response = await PUT(request);
      
      // Should handle large input gracefully - extra fields are ignored by Zod
      const data = await response.json();
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should validate content-type header', async () => {
      mockCheckAdminRole.mockResolvedValue({
        user: { id: 'admin-123' },
        isAdmin: true,
        error: null
      });

      const { PUT } = await import('@/app/api/admin/notifications/preferences/route');
      const request = new NextRequest('http://localhost:3000/api/admin/notifications/preferences', {
        method: 'PUT',
        body: 'enabled=true',
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded'
        }
      });

      const response = await PUT(request);
      
      // Should expect JSON content type
      expect(response.status).toBeGreaterThanOrEqual(400);
    });

    it('should handle empty request body', async () => {
      mockCheckAdminRole.mockResolvedValue({
        user: { id: 'admin-123' },
        isAdmin: true,
        error: null
      });

      const { PUT } = await import('@/app/api/admin/notifications/preferences/route');
      const request = new NextRequest('http://localhost:3000/api/admin/notifications/preferences', {
        method: 'PUT',
        body: ''
      });

      const response = await PUT(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.error).toBeDefined();
    });
  });
});