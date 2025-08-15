import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/gdpr/route';

// Mock Clerk auth
vi.mock('@clerk/nextjs/server', () => ({
  auth: vi.fn(),
}));

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('/api/gdpr', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  describe('POST /api/gdpr', () => {
    it('should return 401 when user is not authenticated', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      vi.mocked(auth).mockResolvedValue({ userId: null } as any);

      const mockRequest = {
        json: () => Promise.resolve({ requestType: 'access' }),
      } as unknown as NextRequest;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data).toEqual({
        success: false,
        error: 'Unauthorized',
      });
    });

    it('should return 400 when requestType is missing', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      vi.mocked(auth).mockResolvedValue({ userId: 'user_123' } as any);

      const mockRequest = {
        json: () => Promise.resolve({}),
      } as unknown as NextRequest;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        success: false,
        error: 'Request type is required',
      });
    });

    it('should return 400 for invalid request type', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      vi.mocked(auth).mockResolvedValue({ userId: 'user_123' } as any);

      const mockRequest = {
        json: () => Promise.resolve({ requestType: 'invalid' }),
      } as unknown as NextRequest;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        success: false,
        error: 'Invalid request type',
      });
    });

    it('should successfully process data access request', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      const { supabase } = await import('@/lib/supabase');

      vi.mocked(auth).mockResolvedValue({ userId: 'user_123' } as any);

      const mockRSVPs = [
        { id: 1, name: 'Test User', email: 'test@example.com', attendees: 2, match_id: 1 },
        { id: 2, name: 'Test User', email: 'test@example.com', attendees: 1, match_id: 2 }
      ];

      const mockContacts = [
        { id: 1, name: 'Test User', email: 'test@example.com', subject: 'Question', message: 'Test message' }
      ];

      vi.mocked(supabase.from).mockImplementation((table) => {
        if (table === 'rsvps') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: mockRSVPs, error: null })
            })
          } as any;
        }
        if (table === 'contact_submissions') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: mockContacts, error: null })
            })
          } as any;
        }
        return {};
      });

      const mockRequest = {
        json: () => Promise.resolve({ requestType: 'access' }),
      } as unknown as NextRequest;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        data: {
          rsvps: mockRSVPs,
          contacts: mockContacts,
        },
      });
    });

    it('should handle empty data for access request', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      const { supabase } = await import('@/lib/supabase');

      vi.mocked(auth).mockResolvedValue({ userId: 'user_123' } as any);

      vi.mocked(supabase.from).mockImplementation(() => ({
        select: vi.fn().mockReturnValue({
          eq: vi.fn().mockResolvedValue({ data: null, error: null })
        })
      } as any));

      const mockRequest = {
        json: () => Promise.resolve({ requestType: 'access' }),
      } as unknown as NextRequest;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        data: {
          rsvps: [],
          contacts: [],
        },
      });
    });

    it('should return 500 when database query fails for access request', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      const { supabase } = await import('@/lib/supabase');

      vi.mocked(auth).mockResolvedValue({ userId: 'user_123' } as any);

      vi.mocked(supabase.from).mockImplementation((table) => {
        if (table === 'rsvps') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: null, error: { message: 'Database error' } })
            })
          } as any;
        }
        return {
          select: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ data: [], error: null })
          })
        } as any;
      });

      const mockRequest = {
        json: () => Promise.resolve({ requestType: 'access' }),
      } as unknown as NextRequest;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        success: false,
        error: 'Error checking records',
      });
    });

    it('should return 500 when contact submissions query fails for access request', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      const { supabase } = await import('@/lib/supabase');

      vi.mocked(auth).mockResolvedValue({ userId: 'user_123' } as any);

      vi.mocked(supabase.from).mockImplementation((table) => {
        if (table === 'rsvps') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: [], error: null })
            })
          } as any;
        }
        if (table === 'contact_submissions') {
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: null, error: { message: 'Contact query failed' } })
            })
          } as any;
        }
        return {};
      });

      const mockRequest = {
        json: () => Promise.resolve({ requestType: 'access' }),
      } as unknown as NextRequest;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        success: false,
        error: 'Error checking records',
      });
    });

    it('should successfully process data deletion request', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      const { supabase } = await import('@/lib/supabase');

      vi.mocked(auth).mockResolvedValue({ userId: 'user_123' } as any);

      let callCount = 0;
      vi.mocked(supabase.from).mockImplementation((table) => {
        callCount++;
        if (callCount <= 2) {
          // First two calls are for data retrieval (access check)
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: [], error: null })
            })
          } as any;
        }
        // Subsequent calls are for deletion
        return {
          delete: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null })
          })
        } as any;
      });

      const mockRequest = {
        json: () => Promise.resolve({ requestType: 'deletion' }),
      } as unknown as NextRequest;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        message: 'Data deleted successfully',
        deletedCounts: {
          rsvps: 0,
          contacts: 0
        }
      });
    });

    it('should return 500 when RSVP deletion fails', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      const { supabase } = await import('@/lib/supabase');

      vi.mocked(auth).mockResolvedValue({ userId: 'user_123' } as any);

      let callCount = 0;
      vi.mocked(supabase.from).mockImplementation((table) => {
        callCount++;
        if (callCount <= 2) {
          // First two calls are for data retrieval (access check)
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: [], error: null })
            })
          } as any;
        }
        // Deletion calls
        if (table === 'rsvps') {
          return {
            delete: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: { message: 'RSVP deletion failed' } })
            })
          } as any;
        }
        return {
          delete: vi.fn().mockReturnValue({
            eq: vi.fn().mockResolvedValue({ error: null })
          })
        } as any;
      });

      const mockRequest = {
        json: () => Promise.resolve({ requestType: 'deletion' }),
      } as unknown as NextRequest;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        success: false,
        error: 'Error deleting records',
        details: {
          rsvpError: 'RSVP deletion failed',
        }
      });
    });

    it('should return 500 when contact submission deletion fails', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      const { supabase } = await import('@/lib/supabase');

      vi.mocked(auth).mockResolvedValue({ userId: 'user_123' } as any);

      let callCount = 0;
      vi.mocked(supabase.from).mockImplementation((table) => {
        callCount++;
        if (callCount <= 2) {
          // First two calls are for data retrieval (access check)
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: [], error: null })
            })
          } as any;
        }
        // Deletion calls
        if (table === 'rsvps') {
          return {
            delete: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: null })
            })
          } as any;
        }
        if (table === 'contact_submissions') {
          return {
            delete: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ error: { message: 'Contact deletion failed' } })
            })
          } as any;
        }
        return {};
      });

      const mockRequest = {
        json: () => Promise.resolve({ requestType: 'deletion' }),
      } as unknown as NextRequest;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        success: false,
        error: 'Error deleting records',
        details: {
          contactError: 'Contact deletion failed',
        }
      });
    });

    it('should handle JSON parsing errors', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      vi.mocked(auth).mockResolvedValue({ userId: 'user_123' } as any);

      const mockRequest = {
        json: () => Promise.reject(new SyntaxError('Unexpected token in JSON')),
      } as unknown as NextRequest;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        success: false,
        error: 'An error occurred while processing the request',
      });
      // Error is now logged through structured logging system
    });

    it('should handle authentication errors', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      vi.mocked(auth).mockRejectedValue(new Error('Authentication failed'));

      const mockRequest = {
        json: () => Promise.resolve({ requestType: 'access' }),
      } as unknown as NextRequest;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        success: false,
        error: 'An error occurred while processing the request',
      });
      // Error is now logged through structured logging system
    });

    it('should handle database connection errors during access request', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      const { supabase } = await import('@/lib/supabase');

      vi.mocked(auth).mockResolvedValue({ userId: 'user_123' } as any);

      vi.mocked(supabase.from).mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      const mockRequest = {
        json: () => Promise.resolve({ requestType: 'access' }),
      } as unknown as NextRequest;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        success: false,
        error: 'An error occurred while processing the request',
      });
      // Error is now logged through structured logging system
    });

    it('should handle database connection errors during deletion request', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      const { supabase } = await import('@/lib/supabase');

      vi.mocked(auth).mockResolvedValue({ userId: 'user_123' } as any);

      let callCount = 0;
      vi.mocked(supabase.from).mockImplementation(() => {
        callCount++;
        if (callCount <= 2) {
          // First two calls succeed for access check
          return {
            select: vi.fn().mockReturnValue({
              eq: vi.fn().mockResolvedValue({ data: [], error: null })
            })
          } as any;
        }
        // Third call (deletion) throws error
        throw new Error('Database connection failed during deletion');
      });

      const mockRequest = {
        json: () => Promise.resolve({ requestType: 'deletion' }),
      } as unknown as NextRequest;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        success: false,
        error: 'An error occurred while processing the request',
      });
      // Error is now logged through structured logging system
    });

    it('should properly filter by user_id for both tables', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      const { supabase } = await import('@/lib/supabase');

      const userId = 'user_456';
      vi.mocked(auth).mockResolvedValue({ userId } as any);

      const mockSelect = vi.fn().mockReturnValue({
        eq: vi.fn().mockResolvedValue({ data: [], error: null })
      });

      vi.mocked(supabase.from).mockImplementation(() => ({
        select: mockSelect
      } as any));

      const mockRequest = {
        json: () => Promise.resolve({ requestType: 'access' }),
      } as unknown as NextRequest;

      await POST(mockRequest);

      expect(supabase.from).toHaveBeenCalledWith('rsvps');
      expect(supabase.from).toHaveBeenCalledWith('contact_submissions');
      expect(mockSelect).toHaveBeenCalledWith('*');
      
      // Verify eq was called with the correct user_id
      const eqCalls = mockSelect.mock.results.map(result => result.value.eq.mock.calls[0]);
      expect(eqCalls).toContainEqual(['user_id', userId]);
    });

    it('should handle null requestType gracefully', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      vi.mocked(auth).mockResolvedValue({ userId: 'user_123' } as any);

      const mockRequest = {
        json: () => Promise.resolve({ requestType: null }),
      } as unknown as NextRequest;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        success: false,
        error: 'Request type is required',
      });
    });

    it('should handle undefined requestType gracefully', async () => {
      const { auth } = await import('@clerk/nextjs/server');
      vi.mocked(auth).mockResolvedValue({ userId: 'user_123' } as any);

      const mockRequest = {
        json: () => Promise.resolve({ requestType: undefined }),
      } as unknown as NextRequest;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data).toEqual({
        success: false,
        error: 'Request type is required',
      });
    });
  });
});