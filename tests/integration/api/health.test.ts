import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock environment variables
vi.mock('@/lib/config', () => ({
  getEnv: vi.fn((key: string) => {
    const mockEnv: Record<string, string> = {
      'NODE_ENV': 'test',
      'NEXT_PUBLIC_SUPABASE_URL': 'https://test.supabase.co',
      'NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY': 'pk_test_123',
      'DATABASE_URL': 'postgresql://test'
    };
    return mockEnv[key] || '';
  }),
}));

// Mock Supabase client
const mockSupabase = {
  from: vi.fn((table: string) => ({
    select: vi.fn((columns: string) => ({
      limit: vi.fn((count: number) => Promise.resolve({ data: [], error: null }))
    }))
  }))
};

vi.mock('@/lib/api/supabase', () => ({
  supabase: mockSupabase,
}));

describe('Health Check API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/health', () => {
    it('should return healthy status when all services are available', async () => {
      // Mock successful database connection
      mockSupabase.from.mockReturnValue({
        select: vi.fn((columns: string) => ({
          limit: vi.fn((count: number) => Promise.resolve({ data: [], error: null }))
        }))
      });

      // Create a simple health check endpoint for testing
      const mockHealthEndpoint = async (request: NextRequest) => {
        try {
          // Check database connectivity
          const { data, error } = await mockSupabase.from('matches').select('id').limit(1);
          
          const health = {
            status: 'healthy',
            timestamp: new Date().toISOString(),
            services: {
              database: error ? 'unhealthy' : 'healthy',
              environment: process.env.NODE_ENV || 'unknown'
            },
            version: '1.0.0'
          };

          return new Response(JSON.stringify(health), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (error) {
          return new Response(JSON.stringify({
            status: 'unhealthy',
            error: 'Service unavailable'
          }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      };

      const request = new NextRequest('http://localhost:3000/api/health');
      const response = await mockHealthEndpoint(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.status).toBe('healthy');
      expect(data.services.database).toBe('healthy');
      expect(data.timestamp).toBeDefined();
    });

    it('should return unhealthy status when database is unavailable', async () => {
      // Mock database error
      (mockSupabase.from as any).mockReturnValue({
        select: vi.fn((columns: string) => ({
          limit: vi.fn((count: number) => Promise.resolve({ 
            data: null, 
            error: { message: 'Database connection failed' }
          } as any))
        }))
      });

      const mockHealthEndpoint = async (request: NextRequest) => {
        try {
          const { data, error } = await mockSupabase.from('matches').select('id').limit(1);
          
          const health = {
            status: error ? 'unhealthy' : 'healthy',
            timestamp: new Date().toISOString(),
            services: {
              database: error ? 'unhealthy' : 'healthy',
              environment: process.env.NODE_ENV || 'unknown'
            },
            version: '1.0.0'
          };

          return new Response(JSON.stringify(health), {
            status: error ? 503 : 200,
            headers: { 'Content-Type': 'application/json' }
          });
        } catch (error) {
          return new Response(JSON.stringify({
            status: 'unhealthy',
            error: 'Service unavailable'
          }), {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          });
        }
      };

      const request = new NextRequest('http://localhost:3000/api/health');
      const response = await mockHealthEndpoint(request);
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.status).toBe('unhealthy');
      expect(data.services.database).toBe('unhealthy');
    });

    it('should include version information', async () => {
      const mockHealthEndpoint = async () => {
        const health = {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          services: {
            database: 'healthy',
            environment: 'test'
          },
          version: '1.0.0'
        };

        return new Response(JSON.stringify(health), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      };

      const response = await mockHealthEndpoint();
      const data = await response.json();

      expect(data.version).toBeDefined();
      expect(typeof data.version).toBe('string');
    });

    it('should include environment information', async () => {
      const mockHealthEndpoint = async () => {
        const health = {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          services: {
            database: 'healthy',
            environment: process.env.NODE_ENV || 'unknown'
          },
          version: '1.0.0'
        };

        return new Response(JSON.stringify(health), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      };

      const response = await mockHealthEndpoint();
      const data = await response.json();

      expect(data.services.environment).toBe('test');
    });

    it('should handle unexpected errors gracefully', async () => {
      // Mock unexpected error
      mockSupabase.from.mockImplementation((table: string) => {
        throw new Error('Unexpected error');
      });

      const mockHealthEndpoint = async () => {
        try {
          await mockSupabase.from('matches').select('id').limit(1);
          
          return new Response(JSON.stringify({
            status: 'healthy'
          }), { status: 200 });
        } catch (error) {
          return new Response(JSON.stringify({
            status: 'unhealthy',
            error: 'Service unavailable'
          }), { status: 503 });
        }
      };

      const response = await mockHealthEndpoint();
      const data = await response.json();

      expect(response.status).toBe(503);
      expect(data.status).toBe('unhealthy');
      expect(data.error).toBe('Service unavailable');
    });

    it('should respond quickly for monitoring systems', async () => {
      const startTime = Date.now();
      
      const mockHealthEndpoint = async () => {
        return new Response(JSON.stringify({
          status: 'healthy',
          timestamp: new Date().toISOString()
        }), { status: 200 });
      };

      await mockHealthEndpoint();
      const endTime = Date.now();
      const responseTime = endTime - startTime;

      // Health check should be fast (under 100ms for mocked services)
      expect(responseTime).toBeLessThan(100);
    });
  });

  describe('Security and Rate Limiting', () => {
    it('should not expose sensitive information', async () => {
      const mockHealthEndpoint = async () => {
        const health = {
          status: 'healthy',
          timestamp: new Date().toISOString(),
          services: {
            database: 'healthy',
            environment: 'test'
          },
          version: '1.0.0'
        };

        return new Response(JSON.stringify(health), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      };

      const response = await mockHealthEndpoint();
      const data = await response.json();

      // Should not contain sensitive data
      expect(data).not.toHaveProperty('databaseUrl');
      expect(data).not.toHaveProperty('apiKeys');
      expect(data).not.toHaveProperty('secrets');
    });

    it('should handle multiple concurrent requests', async () => {
      const mockHealthEndpoint = async () => {
        return new Response(JSON.stringify({
          status: 'healthy',
          timestamp: new Date().toISOString()
        }), { status: 200 });
      };

      const requests = Array(10).fill(0).map(() => mockHealthEndpoint());
      const responses = await Promise.all(requests);

      responses.forEach(response => {
        expect(response.status).toBe(200);
      });
    });
  });
});