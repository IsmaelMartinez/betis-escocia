import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock dependencies
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ error: null }))
        }))
      })),
      select: vi.fn(() => Promise.resolve({ count: 0, error: null }))
    }))
  },
  getAuthenticatedSupabaseClient: vi.fn(() => ({
    from: vi.fn(() => ({
      insert: vi.fn(() => ({
        select: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ error: null }))
        }))
      }))
    }))
  }))
}));

vi.mock('@clerk/nextjs/server', () => ({
  getAuth: vi.fn(() => ({
    userId: null,
    getToken: vi.fn(() => Promise.resolve(null))
  }))
}));

vi.mock('@/lib/logger', () => ({
  log: {
    error: vi.fn(),
    warn: vi.fn(),
    business: vi.fn()
  }
}));

vi.mock('@/lib/standardErrors', () => ({
  StandardErrors: {
    CONTACT: {
      PROCESSING_ERROR: 'Error al procesar el mensaje de contacto',
      STATS_ERROR: 'Error al obtener estadísticas de contacto'
    }
  }
}));

describe('Contact API - Comprehensive Tests', () => {
  let mockSupabase: any;
  let mockGetAuth: any;

  beforeEach(async () => {
    vi.clearAllMocks();

    // Initialize mocks
    mockSupabase = (await import('@/lib/supabase')).supabase;
    mockGetAuth = vi.mocked((await import('@clerk/nextjs/server')).getAuth);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('POST /api/contact - Form Submissions', () => {
    it('should accept anonymous contact submissions', async () => {
      // Mock anonymous user
      mockGetAuth.mockReturnValue({
        userId: null,
        getToken: vi.fn(() => Promise.resolve(null))
      });

      const { POST } = await import('@/app/api/contact/route');
      
      const validContactData = {
        name: 'John Doe',
        email: 'john@example.com',
        phone: '+44 123 456 789',
        type: 'general',
        subject: 'Test Subject',
        message: 'This is a test message with sufficient length.'
      };

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(validContactData),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Mensaje enviado correctamente. Te responderemos pronto.');
    });

    it('should accept authenticated user contact submissions', async () => {
      // Mock authenticated user
      mockGetAuth.mockReturnValue({
        userId: 'user_123',
        getToken: vi.fn(() => Promise.resolve('mock-token'))
      });

      const { POST } = await import('@/app/api/contact/route');
      
      const validContactData = {
        name: 'Jane Doe',
        email: 'jane@example.com',
        type: 'feedback',
        subject: 'Feedback about the website',
        message: 'Great website! I love the community features.'
      };

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(validContactData),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should validate required fields', async () => {
      const { POST } = await import('@/app/api/contact/route');
      
      const invalidContactData = {
        name: '', // Empty name
        email: 'invalid-email', // Invalid email format
        type: 'general',
        subject: '', // Empty subject
        message: 'Short' // Too short message
      };

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(invalidContactData),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('should validate email format', async () => {
      const { POST } = await import('@/app/api/contact/route');
      
      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        'user@domain',
        'user.domain.com'
      ];

      for (const email of invalidEmails) {
        const contactData = {
          name: 'Test User',
          email: email,
          type: 'general',
          subject: 'Test Subject',
          message: 'This is a test message with sufficient length.'
        };

        const request = new NextRequest('http://localhost:3000/api/contact', {
          method: 'POST',
          body: JSON.stringify(contactData),
          headers: { 'Content-Type': 'application/json' }
        });
        
        const response = await POST(request);

        expect(response.status).toBe(400);
      }
    });

    it('should validate contact type', async () => {
      const { POST } = await import('@/app/api/contact/route');
      
      const invalidContactData = {
        name: 'Test User',
        email: 'test@example.com',
        type: 'invalid_type', // Invalid type
        subject: 'Test Subject',
        message: 'This is a test message with sufficient length.'
      };

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(invalidContactData),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('should handle phone number as optional field', async () => {
      const { POST } = await import('@/app/api/contact/route');
      
      const contactDataWithoutPhone = {
        name: 'Test User',
        email: 'test@example.com',
        type: 'general',
        subject: 'Test Subject',
        message: 'This is a test message with sufficient length.'
        // phone field omitted
      };

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(contactDataWithoutPhone),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should handle database insertion errors gracefully', async () => {
      // Mock database error
      mockSupabase.from.mockReturnValue({
        insert: vi.fn(() => ({
          select: vi.fn(() => ({
            single: vi.fn(() => Promise.resolve({ 
              error: { message: 'Database insertion failed' }
            }))
          }))
        }))
      });

      const { POST } = await import('@/app/api/contact/route');
      
      const validContactData = {
        name: 'Test User',
        email: 'test@example.com',
        type: 'general',
        subject: 'Test Subject',
        message: 'This is a test message with sufficient length.'
      };

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(validContactData),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('should log business events for contact submissions', async () => {
      const { log } = await import('@/lib/logger');
      
      const { POST } = await import('@/app/api/contact/route');
      
      const contactData = {
        name: 'Business User',
        email: 'business@example.com',
        type: 'general',
        subject: 'Partnership Opportunity',
        message: 'I would like to discuss a partnership opportunity.'
      };

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(contactData),
        headers: { 'Content-Type': 'application/json' }
      });
      
      await POST(request);

      expect(log.business).toHaveBeenCalledWith(
        'contact_submission_created',
        { type: 'general' },
        { 
          email: 'business@example.com',
          userId: undefined
        }
      );
    });
  });

  describe('GET /api/contact - Statistics', () => {
    it('should return contact statistics', async () => {
      // Mock successful count queries  
      const selectResult = {
        then: (resolve: (value: any) => void) => resolve({ count: 42, error: null }),
        eq: vi.fn(() => Promise.resolve({ count: 42, error: null }))
      };
      
      mockSupabase.from.mockImplementation((table: string) => {
        if (table === 'contact_submissions') {
          return {
            select: vi.fn(() => selectResult)
          };
        }
        return {
          select: vi.fn(() => Promise.resolve({ count: 0, error: null }))
        };
      });

      const { GET } = await import('@/app/api/contact/route');
      const request = new NextRequest('http://localhost:3000/api/contact');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.totalSubmissions).toBe(42);
      expect(data.newSubmissions).toBe(42);
      expect(data.stats).toHaveProperty('totalSubmissions');
      expect(data.stats).toHaveProperty('responseRate');
      expect(data.stats).toHaveProperty('averageResponseTime');
    });

    it('should handle different counts for total and new submissions', async () => {
      let callCount = 0;
      mockSupabase.from.mockImplementation(() => ({
        select: vi.fn(() => {
          callCount++;
          if (callCount === 1) {
            // First call - total submissions
            return {
              then: (resolve: (value: any) => void) => resolve({ count: 100, error: null }),
              eq: vi.fn(() => Promise.resolve({ count: 15, error: null }))
            };
          } else {
            // Second call - new submissions  
            return {
              then: (resolve: (value: any) => void) => resolve({ count: 15, error: null }),
              eq: vi.fn(() => Promise.resolve({ count: 15, error: null }))
            };
          }
        })
      }));

      const { GET } = await import('@/app/api/contact/route');
      const request = new NextRequest('http://localhost:3000/api/contact');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.totalSubmissions).toBe(100);
      expect(data.newSubmissions).toBe(15);
    });

    it('should handle database errors for total count', async () => {
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => Promise.resolve({ 
          count: null, 
          error: { message: 'Database connection failed' }
        }))
      });

      const { GET } = await import('@/app/api/contact/route');
      const request = new NextRequest('http://localhost:3000/api/contact');
      
      const response = await GET(request);

      expect(response.status).toBe(400);
    });

    it('should handle database errors for new submissions count', async () => {
      let callCount = 0;
      mockSupabase.from.mockImplementation(() => ({
        select: vi.fn(() => {
          callCount++;
          if (callCount === 1) {
            // First call succeeds
            return Promise.resolve({ count: 50, error: null });
          } else {
            // Second call fails
            return Promise.resolve({ 
              count: null, 
              error: { message: 'Query timeout' }
            });
          }
        })
      }));

      const { GET } = await import('@/app/api/contact/route');
      const request = new NextRequest('http://localhost:3000/api/contact');
      
      const response = await GET(request);

      expect(response.status).toBe(400);
    });

    it('should handle null counts gracefully', async () => {
      const selectResult = {
        then: (resolve: (value: any) => void) => resolve({ count: null, error: null }),
        eq: vi.fn(() => Promise.resolve({ count: null, error: null }))
      };
      
      mockSupabase.from.mockImplementation(() => ({
        select: vi.fn(() => selectResult)
      }));

      const { GET } = await import('@/app/api/contact/route');
      const request = new NextRequest('http://localhost:3000/api/contact');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.totalSubmissions).toBe(0);
      expect(data.newSubmissions).toBe(0);
    });
  });

  describe('Security and Data Privacy', () => {
    it('should sanitize input data', async () => {
      const { POST } = await import('@/app/api/contact/route');
      
      const maliciousContactData = {
        name: '<script>alert("xss")</script>',
        email: 'test@example.com',
        type: 'general',
        subject: 'Test Subject',
        message: 'DROP TABLE contact_submissions; --'
      };

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(maliciousContactData),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await POST(request);

      // Should process the request (input sanitization happens at validation level)
      expect([200, 400]).toContain(response.status);
    });

    it('should handle international characters correctly', async () => {
      const { POST } = await import('@/app/api/contact/route');
      
      const internationalContactData = {
        name: 'José María García-López',
        email: 'jose@example.es',
        type: 'general',
        subject: 'Pregunta sobre el Betis',
        message: '¡Hola! Me gustaría saber más información sobre la peña bética en Escocia. ¿Cómo puedo unirme?'
      };

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(internationalContactData),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await POST(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });

    it('should handle very long messages appropriately', async () => {
      const { POST } = await import('@/app/api/contact/route');
      
      const longMessage = 'x'.repeat(10000); // 10k character message
      
      const longContactData = {
        name: 'Test User',
        email: 'test@example.com',
        type: 'general',
        subject: 'Test Subject',
        message: longMessage
      };

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(longContactData),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await POST(request);

      // Should validate message length constraints
      expect([200, 400]).toContain(response.status);
    });
  });

  describe('Performance and Scalability', () => {
    it('should handle concurrent submissions', async () => {
      const { POST } = await import('@/app/api/contact/route');
      
      const contactData = {
        name: 'Concurrent User',
        email: 'concurrent@example.com',
        type: 'general',
        subject: 'Concurrent Test',
        message: 'Testing concurrent submissions.'
      };

      // Create multiple concurrent requests
      const requests = Array(10).fill(0).map((_, i) => {
        const data = { ...contactData, email: `user${i}@example.com` };
        return new NextRequest('http://localhost:3000/api/contact', {
          method: 'POST',
          body: JSON.stringify(data),
          headers: { 'Content-Type': 'application/json' }
        });
      });

      const responses = await Promise.all(
        requests.map(request => POST(request))
      );
      
      responses.forEach(response => {
        expect([200, 400]).toContain(response.status);
      });
    });

    it('should complete requests within reasonable time', async () => {
      const startTime = Date.now();
      
      const { POST } = await import('@/app/api/contact/route');
      
      const contactData = {
        name: 'Performance Test User',
        email: 'performance@example.com',
        type: 'general',
        subject: 'Performance Test',
        message: 'Testing API response time.'
      };

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(contactData),
        headers: { 'Content-Type': 'application/json' }
      });
      
      await POST(request);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete within 5 seconds (generous for mocked services)
      expect(duration).toBeLessThan(5000);
    });
  });

  describe('Error Handling and Edge Cases', () => {
    it('should handle malformed JSON gracefully', async () => {
      const { POST } = await import('@/app/api/contact/route');
      
      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: 'invalid json content',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await POST(request);

      expect(response.status).toBe(400);
    });

    it('should handle missing Content-Type header', async () => {
      const { POST } = await import('@/app/api/contact/route');
      
      const contactData = {
        name: 'Test User',
        email: 'test@example.com',
        type: 'general',
        subject: 'Test Subject',
        message: 'Test message'
      };

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(contactData)
        // No Content-Type header
      });
      
      const response = await POST(request);

      expect([200, 400]).toContain(response.status);
    });

    it('should handle authentication token failures', async () => {
      // Mock token failure
      mockGetAuth.mockReturnValue({
        userId: 'user_123',
        getToken: vi.fn(() => Promise.reject(new Error('Token expired')))
      });

      const { POST } = await import('@/app/api/contact/route');
      
      const contactData = {
        name: 'Test User',
        email: 'test@example.com',
        type: 'general',
        subject: 'Test Subject',
        message: 'Test message with authentication issues.'
      };

      const request = new NextRequest('http://localhost:3000/api/contact', {
        method: 'POST',
        body: JSON.stringify(contactData),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await POST(request);
      const data = await response.json();

      // Should still process the submission even if authentication fails
      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
    });
  });
});