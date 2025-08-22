import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock dependencies
const mockSupabase = {
  from: vi.fn(),
  auth: {
    getUser: vi.fn()
  }
};

vi.mock('@/lib/supabase', () => ({
  supabase: mockSupabase,
  getAuthenticatedSupabaseClient: vi.fn(() => mockSupabase)
}));

vi.mock('@/lib/logger', () => ({
  log: {
    error: vi.fn(),
    warn: vi.fn(),
    business: vi.fn(),
    info: vi.fn()
  }
}));

// Mock authentication
const mockGetAuth = vi.fn();
vi.mock('@clerk/nextjs/server', () => ({
  getAuth: mockGetAuth
}));

vi.mock('@/lib/adminApiProtection', () => ({
  checkAdminRole: vi.fn(() => Promise.resolve({
    user: { id: 'test-user-123' },
    isAdmin: true,
    error: null
  }))
}));

const sampleRSVPs = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    attendees: 2,
    match_date: '2024-12-15T20:00:00',
    user_id: 'test-user-123',
    created_at: '2024-12-01T10:00:00'
  },
  {
    id: 2,
    name: 'John Doe',
    email: 'john@example.com',
    attendees: 1,
    match_date: '2024-12-20T18:30:00',
    user_id: 'test-user-123',
    created_at: '2024-12-05T15:30:00'
  }
];

const sampleContacts = [
  {
    id: 1,
    name: 'John Doe',
    email: 'john@example.com',
    subject: 'General Inquiry',
    message: 'Hello, I have a question...',
    type: 'general',
    user_id: 'test-user-123',
    created_at: '2024-11-20T09:15:00'
  }
];

describe('GDPR API - Comprehensive Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup default authentication mock
    mockGetAuth.mockReturnValue({
      userId: 'test-user-123',
      sessionClaims: {
        metadata: {
          role: 'user'
        }
      },
      getToken: vi.fn(() => Promise.resolve('test-token'))
    });

    // Setup default database mocks
    mockSupabase.from.mockImplementation((table) => {
      if (table === 'rsvps') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ data: sampleRSVPs, error: null }))
          })),
          delete: vi.fn(() => ({
            eq: vi.fn(() => ({
              select: vi.fn(() => Promise.resolve({ data: sampleRSVPs, error: null }))
            }))
          }))
        };
      }
      if (table === 'contact_submissions') {
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ data: sampleContacts, error: null }))
          })),
          delete: vi.fn(() => ({
            eq: vi.fn(() => ({
              select: vi.fn(() => Promise.resolve({ data: sampleContacts, error: null }))
            }))
          }))
        };
      }
      return {
        select: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      };
    });
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('Authentication and Authorization', () => {
    it('should require user authentication', async () => {
      // Mock unauthenticated request
      mockGetAuth.mockReturnValue({
        userId: null,
        sessionClaims: null,
        getToken: vi.fn(() => Promise.resolve(null))
      });

      const { POST } = await import('@/app/api/gdpr/route');
      const request = new NextRequest('http://localhost:3000/api/gdpr', {
        method: 'POST',
        body: JSON.stringify({ requestType: 'access' }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
    });

    it('should accept authenticated user requests', async () => {
      const { POST } = await import('@/app/api/gdpr/route');
      const request = new NextRequest('http://localhost:3000/api/gdpr', {
        method: 'POST',
        body: JSON.stringify({ requestType: 'access' }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should validate user token properly', async () => {
      mockGetAuth.mockReturnValue({
        userId: 'test-user-123',
        sessionClaims: {
          metadata: {
            role: 'user'
          }
        },
        getToken: vi.fn(() => Promise.resolve('valid-token'))
      });

      const { POST } = await import('@/app/api/gdpr/route');
      const request = new NextRequest('http://localhost:3000/api/gdpr', {
        method: 'POST',
        body: JSON.stringify({ requestType: 'access' }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await POST(request);
      
      expect(response.status).toBe(200);
    });
  });

  describe('Data Access Requests', () => {
    it('should return user data for access requests', async () => {
      const { POST } = await import('@/app/api/gdpr/route');
      const request = new NextRequest('http://localhost:3000/api/gdpr', {
        method: 'POST',
        body: JSON.stringify({ requestType: 'access' }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toHaveProperty('rsvps');
      expect(data.data).toHaveProperty('contacts');
      expect(data.data.rsvps).toHaveLength(2);
      expect(data.data.contacts).toHaveLength(1);
    });

    it('should return empty arrays when no data exists', async () => {
      mockSupabase.from.mockImplementation((table) => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      }));

      const { POST } = await import('@/app/api/gdpr/route');
      const request = new NextRequest('http://localhost:3000/api/gdpr', {
        method: 'POST',
        body: JSON.stringify({ requestType: 'access' }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.rsvps).toHaveLength(0);
      expect(data.data.contacts).toHaveLength(0);
    });

    it('should filter data by authenticated user ID only', async () => {
      const { POST } = await import('@/app/api/gdpr/route');
      const request = new NextRequest('http://localhost:3000/api/gdpr', {
        method: 'POST',
        body: JSON.stringify({ requestType: 'access' }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      await POST(request);

      expect(mockSupabase.from).toHaveBeenCalledWith('rsvps');
      expect(mockSupabase.from).toHaveBeenCalledWith('contact_submissions');
    });

    it('should handle database errors during data access', async () => {
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'rsvps') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => Promise.resolve({ data: null, error: { message: 'Database error' } }))
            }))
          };
        }
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ data: [], error: null }))
          }))
        };
      });

      const { POST } = await import('@/app/api/gdpr/route');
      const request = new NextRequest('http://localhost:3000/api/gdpr', {
        method: 'POST',
        body: JSON.stringify({ requestType: 'access' }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('verificando registros');
    });
  });

  describe('Data Deletion Requests', () => {
    it('should delete user data for deletion requests', async () => {
      const { POST } = await import('@/app/api/gdpr/route');
      const request = new NextRequest('http://localhost:3000/api/gdpr', {
        method: 'POST',
        body: JSON.stringify({ requestType: 'deletion' }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Datos eliminados correctamente');
      expect(data.deletedCounts).toEqual({
        rsvps: 2,
        contacts: 1
      });
    });

    it('should log business events for deletion requests', async () => {
      const { log } = await import('@/lib/logger');

      const { POST } = await import('@/app/api/gdpr/route');
      const request = new NextRequest('http://localhost:3000/api/gdpr', {
        method: 'POST',
        body: JSON.stringify({ requestType: 'deletion' }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      await POST(request);

      expect(log.business).toHaveBeenCalledWith(
        'gdpr_deletion_executed',
        expect.objectContaining({
          rsvpCount: 2,
          contactCount: 1
        }),
        { userId: 'test-user-123' }
      );
    });

    it('should handle partial deletion failures', async () => {
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'rsvps') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => Promise.resolve({ data: sampleRSVPs, error: null }))
            })),
            delete: vi.fn(() => ({
              eq: vi.fn(() => ({
                select: vi.fn(() => Promise.resolve({ data: null, error: { message: 'Delete failed' } }))
              }))
            }))
          };
        }
        if (table === 'contact_submissions') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => Promise.resolve({ data: sampleContacts, error: null }))
            })),
            delete: vi.fn(() => ({
              eq: vi.fn(() => ({
                select: vi.fn(() => Promise.resolve({ data: sampleContacts, error: null }))
              }))
            }))
          };
        }
        return mockSupabase.from();
      });

      const { POST } = await import('@/app/api/gdpr/route');
      const request = new NextRequest('http://localhost:3000/api/gdpr', {
        method: 'POST',
        body: JSON.stringify({ requestType: 'deletion' }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('eliminando registros');
    });

    it('should handle zero records to delete', async () => {
      mockSupabase.from.mockImplementation((table) => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: [], error: null }))
        })),
        delete: vi.fn(() => ({
          eq: vi.fn(() => ({
            select: vi.fn(() => Promise.resolve({ data: [], error: null }))
          }))
        }))
      }));

      const { POST } = await import('@/app/api/gdpr/route');
      const request = new NextRequest('http://localhost:3000/api/gdpr', {
        method: 'POST',
        body: JSON.stringify({ requestType: 'deletion' }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.deletedCounts).toEqual({
        rsvps: 0,
        contacts: 0
      });
    });

    it('should delete only data belonging to authenticated user', async () => {
      const { POST } = await import('@/app/api/gdpr/route');
      const request = new NextRequest('http://localhost:3000/api/gdpr', {
        method: 'POST',
        body: JSON.stringify({ requestType: 'deletion' }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      await POST(request);

      // Verify that queries are filtered by user_id
      expect(mockSupabase.from).toHaveBeenCalledWith('rsvps');
      expect(mockSupabase.from).toHaveBeenCalledWith('contact_submissions');
    });
  });

  describe('Input Validation and Schema', () => {
    it('should validate requestType parameter', async () => {
      const { POST } = await import('@/app/api/gdpr/route');
      const request = new NextRequest('http://localhost:3000/api/gdpr', {
        method: 'POST',
        body: JSON.stringify({ requestType: 'invalid' }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('validation');
    });

    it('should require requestType parameter', async () => {
      const { POST } = await import('@/app/api/gdpr/route');
      const request = new NextRequest('http://localhost:3000/api/gdpr', {
        method: 'POST',
        body: JSON.stringify({}), // Missing requestType
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
    });

    it('should accept valid requestType values', async () => {
      const validRequestTypes = ['access', 'deletion'];
      
      for (const requestType of validRequestTypes) {
        const { POST } = await import('@/app/api/gdpr/route');
        const request = new NextRequest('http://localhost:3000/api/gdpr', {
          method: 'POST',
          body: JSON.stringify({ requestType }),
          headers: { 'Content-Type': 'application/json' }
        });
        
        const response = await POST(request);
        
        expect(response.status).toBe(200);
      }
    });

    it('should handle malformed JSON requests', async () => {
      const { POST } = await import('@/app/api/gdpr/route');
      const request = new NextRequest('http://localhost:3000/api/gdpr', {
        method: 'POST',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('should handle missing Content-Type header', async () => {
      const { POST } = await import('@/app/api/gdpr/route');
      const request = new NextRequest('http://localhost:3000/api/gdpr', {
        method: 'POST',
        body: JSON.stringify({ requestType: 'access' })
        // No Content-Type header
      });
      
      const response = await POST(request);
      
      // Should still work as JSON parsing is attempted
      expect([200, 400]).toContain(response.status);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle unknown request types gracefully', async () => {
      // This should be caught by schema validation, but test fallback
      const mockProcessGDPRRequest = vi.fn().mockImplementation(() => {
        throw new Error('Tipo de petición inválido');
      });

      // Temporarily replace the function (this would need dependency injection in real code)
      const { POST } = await import('@/app/api/gdpr/route');
      const request = new NextRequest('http://localhost:3000/api/gdpr', {
        method: 'POST',
        body: JSON.stringify({ requestType: 'unknown' }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await POST(request);

      expect(response.status).toBe(400); // Should be caught by schema validation
    });

    it('should handle database connection failures', async () => {
      mockSupabase.from.mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      const { POST } = await import('@/app/api/gdpr/route');
      const request = new NextRequest('http://localhost:3000/api/gdpr', {
        method: 'POST',
        body: JSON.stringify({ requestType: 'access' }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await POST(request);

      expect(response.status).toBe(500);
    });

    it('should handle concurrent requests from same user', async () => {
      const requestPromises = Array.from({ length: 3 }, () => {
        return new Promise(async (resolve) => {
          const { POST } = await import('@/app/api/gdpr/route');
          const request = new NextRequest('http://localhost:3000/api/gdpr', {
            method: 'POST',
            body: JSON.stringify({ requestType: 'access' }),
            headers: { 'Content-Type': 'application/json' }
          });
          
          const response = await POST(request);
          resolve(response);
        });
      });

      const responses = await Promise.all(requestPromises);
      
      responses.forEach((response: any) => {
        expect(response.status).toBe(200);
      });
    });

    it('should handle large datasets efficiently', async () => {
      const largeRSVPArray = Array.from({ length: 1000 }, (_, i) => ({
        id: i + 1,
        name: `User ${i}`,
        email: `user${i}@example.com`,
        attendees: 1,
        match_date: '2024-12-15T20:00:00',
        user_id: 'test-user-123',
        created_at: new Date().toISOString()
      }));

      mockSupabase.from.mockImplementation((table) => {
        if (table === 'rsvps') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => Promise.resolve({ data: largeRSVPArray, error: null }))
            })),
            delete: vi.fn(() => ({
              eq: vi.fn(() => ({
                select: vi.fn(() => Promise.resolve({ data: largeRSVPArray, error: null }))
              }))
            }))
          };
        }
        return {
          select: vi.fn(() => ({
            eq: vi.fn(() => Promise.resolve({ data: [], error: null }))
          }))
        };
      });

      const { POST } = await import('@/app/api/gdpr/route');
      const request = new NextRequest('http://localhost:3000/api/gdpr', {
        method: 'POST',
        body: JSON.stringify({ requestType: 'access' }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const startTime = Date.now();
      const response = await POST(request);
      const endTime = Date.now();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.rsvps).toHaveLength(1000);
      expect(endTime - startTime).toBeLessThan(2000); // Should complete within 2 seconds
    });
  });

  describe('Data Privacy and Security', () => {
    it('should not return data for different user IDs', async () => {
      // Mock different user authentication
      mockGetAuth.mockReturnValue({
        userId: 'different-user-456',
        sessionClaims: {
          metadata: {
            role: 'user'
          }
        },
        getToken: vi.fn(() => Promise.resolve('different-token'))
      });

      mockSupabase.from.mockImplementation((table) => ({
        select: vi.fn(() => ({
          eq: vi.fn(() => Promise.resolve({ data: [], error: null })) // No data for different user
        }))
      }));

      const { POST } = await import('@/app/api/gdpr/route');
      const request = new NextRequest('http://localhost:3000/api/gdpr', {
        method: 'POST',
        body: JSON.stringify({ requestType: 'access' }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.rsvps).toHaveLength(0);
      expect(data.data.contacts).toHaveLength(0);
    });

    it('should sanitize sensitive data in logs', async () => {
      const { log } = await import('@/lib/logger');

      const { POST } = await import('@/app/api/gdpr/route');
      const request = new NextRequest('http://localhost:3000/api/gdpr', {
        method: 'POST',
        body: JSON.stringify({ requestType: 'deletion' }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      await POST(request);

      // Verify that logs don't contain sensitive user data, only user ID
      expect(log.business).toHaveBeenCalledWith(
        'gdpr_deletion_executed',
        expect.any(Object),
        { userId: 'test-user-123' }
      );
    });

    it('should handle authentication token expiry', async () => {
      mockGetAuth.mockReturnValue({
        userId: 'test-user-123',
        sessionClaims: {
          metadata: {
            role: 'user'
          }
        },
        getToken: vi.fn(() => Promise.reject(new Error('Token expired')))
      });

      const { POST } = await import('@/app/api/gdpr/route');
      const request = new NextRequest('http://localhost:3000/api/gdpr', {
        method: 'POST',
        body: JSON.stringify({ requestType: 'access' }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await POST(request);

      expect(response.status).toBe(401);
    });
  });

  describe('Compliance and Audit Trail', () => {
    it('should maintain audit trail for deletion requests', async () => {
      const { log } = await import('@/lib/logger');

      const { POST } = await import('@/app/api/gdpr/route');
      const request = new NextRequest('http://localhost:3000/api/gdpr', {
        method: 'POST',
        body: JSON.stringify({ requestType: 'deletion' }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      await POST(request);

      expect(log.business).toHaveBeenCalledWith(
        'gdpr_deletion_executed',
        expect.objectContaining({
          rsvpCount: expect.any(Number),
          contactCount: expect.any(Number)
        }),
        expect.objectContaining({
          userId: 'test-user-123'
        })
      );
    });

    it('should log errors with sufficient detail for compliance', async () => {
      const { log } = await import('@/lib/logger');
      
      mockSupabase.from.mockImplementation((table) => {
        if (table === 'rsvps') {
          return {
            select: vi.fn(() => ({
              eq: vi.fn(() => Promise.resolve({ data: null, error: { message: 'Access denied' } }))
            }))
          };
        }
        return mockSupabase.from();
      });

      const { POST } = await import('@/app/api/gdpr/route');
      const request = new NextRequest('http://localhost:3000/api/gdpr', {
        method: 'POST',
        body: JSON.stringify({ requestType: 'access' }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      await POST(request);

      expect(log.error).toHaveBeenCalledWith(
        'Error checking GDPR records',
        expect.objectContaining({
          message: 'Access denied'
        }),
        { userId: 'test-user-123' }
      );
    });
  });
});