import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/gdpr/route';

// Mock Clerk with authenticated user
vi.mock('@clerk/nextjs/server', () => ({
  getAuth: vi.fn(() => ({
    userId: 'test-user-id',
    getToken: vi.fn(() => Promise.resolve('test-token')),
  })),
}));

// Mock API utils
vi.mock('@/lib/apiUtils', () => ({
  createApiHandler: vi.fn((config) => {
    return async (request: any) => {
      try {
        // Handle authentication
        if (config.auth === 'user') {
          const { getAuth } = await import('@clerk/nextjs/server');
          const authResult = getAuth(request);
          if (!authResult.userId) {
            return {
              json: () => Promise.resolve({ success: false, error: 'Unauthorized' }),
              status: 401
            };
          }
        }

        let validatedData;
        
        if (config.schema && request.method === 'POST') {
          const body = await request.json();
          validatedData = config.schema.parse(body);
        } else {
          validatedData = {};
        }
        
        const context = {
          request,
          user: { id: 'test-user-id' },
          userId: 'test-user-id',
          authenticatedSupabase: { from: vi.fn() },
          supabase: { from: vi.fn() }
        };
        
        const result = await config.handler(validatedData, context);
        
        return {
          json: () => Promise.resolve(result),
          status: 200
        };
      } catch (error) {
        const errorResult: any = {
          success: false,
          error: 'Error interno del servidor'
        };
        
        if (error && typeof error === 'object' && 'issues' in error) {
          errorResult.error = 'Datos de entrada inválidos';
          errorResult.details = (error as any).issues.map((issue: any) => `${issue.path.join('.')}: ${issue.message}`);
        }
        
        return {
          json: () => Promise.resolve(errorResult),
          status: (error && typeof error === 'object' && 'issues' in error) ? 400 : 500
        };
      }
    };
  })
}));

// Mock Supabase
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => Promise.resolve({ data: [], error: null }))
      })),
      delete: vi.fn(() => ({
        eq: vi.fn(() => ({
          select: vi.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      }))
    }))
  },
}));

// Mock GDPR schema
vi.mock('@/lib/schemas/rsvp', () => ({
  gdprSchema: {
    parse: vi.fn((data) => {
      if (!data.requestType) {
        const error = new Error('Validation failed') as any;
        error.issues = [{ path: ['requestType'], message: 'Request type is required' }];
        throw error;
      }
      if (!['access', 'deletion'].includes(data.requestType)) {
        const error = new Error('Validation failed') as any;
        error.issues = [{ path: ['requestType'], message: 'Invalid request type' }];
        throw error;
      }
      return data;
    })
  }
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  log: {
    business: vi.fn(),
    error: vi.fn(),
  },
}));

describe('GDPR API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('POST /api/gdpr', () => {
    it('should process access request successfully', async () => {
      const mockRequest = {
        method: 'POST',
        url: 'http://localhost:3000/api/gdpr',
        json: () => Promise.resolve({
          requestType: 'access'
        }),
      } as unknown as NextRequest;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data).toBeDefined();
      expect(data.data.rsvps).toBeDefined();
      expect(data.data.contacts).toBeDefined();
    });

    it('should process deletion request successfully', async () => {
      const mockRequest = {
        method: 'POST',
        url: 'http://localhost:3000/api/gdpr',
        json: () => Promise.resolve({
          requestType: 'deletion'
        }),
      } as unknown as NextRequest;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.message).toBe('Datos eliminados correctamente');
      expect(data.deletedCounts).toBeDefined();
      expect(data.deletedCounts.rsvps).toBeDefined();
      expect(data.deletedCounts.contacts).toBeDefined();
    });

    it('should validate request type', async () => {
      const mockRequest = {
        method: 'POST',
        url: 'http://localhost:3000/api/gdpr',
        json: () => Promise.resolve({
          requestType: 'invalid'
        }),
      } as unknown as NextRequest;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Datos de entrada inválidos');
    });

    it('should require authentication', async () => {
      // Mock unauthenticated user
      vi.mocked(vi.mocked(await import('@clerk/nextjs/server')).getAuth).mockReturnValue({
        userId: null,
        getToken: vi.fn(() => Promise.resolve(null)),
      } as any);

      const mockRequest = {
        method: 'POST',
        url: 'http://localhost:3000/api/gdpr',
        json: () => Promise.resolve({
          requestType: 'access'
        }),
      } as unknown as NextRequest;

      const response = await POST(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Unauthorized');
    });
  });
});