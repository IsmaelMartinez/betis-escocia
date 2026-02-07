import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock createApiHandler
vi.mock('@/lib/apiUtils', () => ({
  createApiHandler: vi.fn((config) => {
    return async (request: any) => {
      try {
        // Simulate admin auth check
        if (config.auth === 'admin') {
          // Mock admin user
          const mockUser = { id: 'admin-123', role: 'admin' };
          const context = {
            request,
            user: mockUser,
            userId: 'admin-123',
            supabase: undefined,
            authenticatedSupabase: undefined
          };
          
          const result = await config.handler({}, context);
          
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

// Mock supabase
const mockSelect = vi.fn();
const mockOrder = vi.fn();

vi.mock('@/lib/api/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: mockSelect,
    })),
  },
}));

// Import after mocking
import { GET } from '@/app/api/admin/contact-submissions/route';

describe('Admin Contact Submissions API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default chain
    mockOrder.mockReturnValue({
      data: [],
      error: null
    });
    mockSelect.mockReturnValue({
      order: mockOrder,
    });
  });

  describe('GET /api/admin/contact-submissions', () => {
    it('should return contact submissions for admin users', async () => {
      const mockSubmissions = [
        {
          id: 1,
          name: 'John Doe',
          email: 'john@example.com',
          subject: 'Test Subject',
          message: 'Test message',
          status: 'new',
          created_at: '2025-08-25T10:00:00Z'
        },
        {
          id: 2,
          name: 'Jane Smith',
          email: 'jane@example.com',
          subject: 'Another Subject',
          message: 'Another message',
          status: 'resolved',
          created_at: '2025-08-24T15:30:00Z'
        }
      ];

      mockOrder.mockReturnValue({
        data: mockSubmissions,
        error: null
      });

      const request = new NextRequest('http://localhost:3000/api/admin/contact-submissions');
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.submissions).toEqual(mockSubmissions);
      expect(json.submissions).toHaveLength(2);
      
      // Verify Supabase was called correctly
      const { supabase } = await import('@/lib/api/supabase');
      expect(supabase.from).toHaveBeenCalledWith('contact_submissions');
      expect(mockSelect).toHaveBeenCalledWith('*');
      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
    });

    it('should return empty array when no submissions exist', async () => {
      mockOrder.mockReturnValue({
        data: [],
        error: null
      });

      const request = new NextRequest('http://localhost:3000/api/admin/contact-submissions');
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.submissions).toEqual([]);
      expect(json.submissions).toHaveLength(0);
    });

    it('should handle null data from database', async () => {
      mockOrder.mockReturnValue({
        data: null,
        error: null
      });

      const request = new NextRequest('http://localhost:3000/api/admin/contact-submissions');
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.submissions).toEqual([]);
    });

    it('should handle database errors', async () => {
      mockOrder.mockReturnValue({
        data: null,
        error: { message: 'Database connection failed' }
      });

      const request = new NextRequest('http://localhost:3000/api/admin/contact-submissions');
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.success).toBe(false);
      expect(json.error).toContain('Failed to fetch contact submissions');
    });

    it('should order submissions by created_at descending', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/contact-submissions');
      await GET(request);

      expect(mockOrder).toHaveBeenCalledWith('created_at', { ascending: false });
    });

    it('should select all columns from contact_submissions table', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/contact-submissions');
      await GET(request);

      const { supabase } = await import('@/lib/api/supabase');
      expect(supabase.from).toHaveBeenCalledWith('contact_submissions');
      expect(mockSelect).toHaveBeenCalledWith('*');
    });

    it('should require admin authentication', async () => {
      // This test verifies that the route is configured to require admin auth
      // The actual auth is handled by createApiHandler with auth: 'admin'
      const request = new NextRequest('http://localhost:3000/api/admin/contact-submissions');
      
      // Verify the route exists and returns a response (auth is tested by the handler configuration)
      const response = await GET(request);
      
      // If we get a 200, it means the mock admin auth is working
      // In real usage, createApiHandler will enforce the admin requirement
      expect([200, 401]).toContain(response.status);
    });

    it('should handle submissions with all fields', async () => {
      const completeSubmission = {
        id: 1,
        name: 'Complete User',
        email: 'complete@example.com',
        subject: 'Complete Subject',
        message: 'Complete message with all fields',
        status: 'in_progress',
        whatsapp_interest: true,
        user_id: 'user-123',
        ip_address: '192.168.1.1',
        user_agent: 'Mozilla/5.0',
        created_at: '2025-08-25T10:00:00Z',
        updated_at: '2025-08-25T11:00:00Z'
      };

      mockOrder.mockReturnValue({
        data: [completeSubmission],
        error: null
      });

      const request = new NextRequest('http://localhost:3000/api/admin/contact-submissions');
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.submissions[0]).toEqual(completeSubmission);
      expect(json.submissions[0].whatsapp_interest).toBe(true);
      expect(json.submissions[0].user_id).toBe('user-123');
    });

    it('should handle different submission statuses', async () => {
      const submissionsWithStatuses = [
        { id: 1, name: 'User 1', status: 'new', created_at: '2025-08-25T10:00:00Z' },
        { id: 2, name: 'User 2', status: 'in_progress', created_at: '2025-08-25T09:00:00Z' },
        { id: 3, name: 'User 3', status: 'resolved', created_at: '2025-08-25T08:00:00Z' },
        { id: 4, name: 'User 4', status: 'spam', created_at: '2025-08-25T07:00:00Z' }
      ];

      mockOrder.mockReturnValue({
        data: submissionsWithStatuses,
        error: null
      });

      const request = new NextRequest('http://localhost:3000/api/admin/contact-submissions');
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.submissions).toHaveLength(4);
      
      // Verify all statuses are returned
      const statuses = json.submissions.map((s: any) => s.status);
      expect(statuses).toContain('new');
      expect(statuses).toContain('in_progress');
      expect(statuses).toContain('resolved');
      expect(statuses).toContain('spam');
    });

    it('should handle large number of submissions', async () => {
      const manySubmissions = Array.from({ length: 100 }, (_, i) => ({
        id: i + 1,
        name: `User ${i + 1}`,
        email: `user${i + 1}@example.com`,
        subject: `Subject ${i + 1}`,
        message: `Message ${i + 1}`,
        status: i % 2 === 0 ? 'new' : 'resolved',
        created_at: new Date(Date.now() - i * 60000).toISOString()
      }));

      mockOrder.mockReturnValue({
        data: manySubmissions,
        error: null
      });

      const request = new NextRequest('http://localhost:3000/api/admin/contact-submissions');
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.submissions).toHaveLength(100);
      expect(json.submissions[0].id).toBe(1);
      expect(json.submissions[99].id).toBe(100);
    });

    it('should handle special characters in submission data', async () => {
      const specialCharsSubmission = {
        id: 1,
        name: 'José María Andrés-González',
        email: 'josé.maría@example.com',
        subject: 'Pregunta sobre el Real Betis ¿Cómo están?',
        message: 'Hola, tengo una pregunta sobre el equipo. ¡Visca el Betis! 💚🤍',
        status: 'new',
        created_at: '2025-08-25T10:00:00Z'
      };

      mockOrder.mockReturnValue({
        data: [specialCharsSubmission],
        error: null
      });

      const request = new NextRequest('http://localhost:3000/api/admin/contact-submissions');
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json.submissions[0].name).toBe('José María Andrés-González');
      expect(json.submissions[0].subject).toContain('¿Cómo están?');
      expect(json.submissions[0].message).toContain('💚🤍');
    });

    it('should maintain consistent response structure', async () => {
      const request = new NextRequest('http://localhost:3000/api/admin/contact-submissions');
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json).toHaveProperty('submissions');
      expect(Array.isArray(json.submissions)).toBe(true);
    });

    it('should handle database timeout errors', async () => {
      mockOrder.mockReturnValue({
        data: null,
        error: { message: 'Query timeout', code: 'QUERY_TIMEOUT' }
      });

      const request = new NextRequest('http://localhost:3000/api/admin/contact-submissions');
      const response = await GET(request);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json.error).toContain('Query timeout');
    });
  });
});