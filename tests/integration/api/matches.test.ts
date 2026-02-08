import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/matches/route';

// Mock API utils
vi.mock('@/lib/api/apiUtils', () => ({
  createApiHandler: vi.fn((config) => {
    return async (request: any) => {
      try {
        let validatedData;
        
        // Parse query parameters for GET requests
        const url = new URL(request.url);
        validatedData = {
          type: url.searchParams.get('type') || 'all',
          live: url.searchParams.get('live') === 'true'
        };
        
        if (config.schema) {
          validatedData = config.schema.parse(validatedData);
        }
        
        const context = {
          request,
          user: undefined,
          userId: undefined,
          authenticatedSupabase: undefined,
          supabase: undefined
        };
        
        const result = await config.handler(validatedData, context);
        
        return {
          json: () => Promise.resolve(result),
          status: 200
        };
      } catch (error) {
        return {
          json: () => Promise.resolve({ error: 'Server error' }),
          status: 500
        };
      }
    };
  })
}));

// Mock FootballDataService
vi.mock('@/services/footballDataService', () => ({
  FootballDataService: vi.fn().mockImplementation(() => ({
    getUpcomingBetisMatchesForCards: vi.fn(() => Promise.resolve([
      { id: 1, opponent: 'Sevilla', date: '2025-07-01T20:00:00', competition: 'LaLiga' }
    ])),
    getRecentBetisResultsForCards: vi.fn(() => Promise.resolve([
      { id: 2, opponent: 'Valencia', date: '2025-06-25T19:00:00', competition: 'LaLiga', result: '2-1' }
    ]))
  }))
}));

// Mock match types
vi.mock('@/types/match', () => ({}));

// Mock Zod schema
vi.mock('zod', () => ({
  z: {
    object: vi.fn(() => ({
      parse: vi.fn((data) => data)
    })),
    enum: vi.fn(() => ({
      default: vi.fn(() => ({
        default: vi.fn(() => ({
          transform: vi.fn(() => ({}))
        }))
      }))
    })),
    string: vi.fn(() => ({
      default: vi.fn(() => ({
        transform: vi.fn(() => ({}))
      }))
    }))
  }
}));

// Mock logger
vi.mock('@/lib/utils/logger', () => ({
  log: {
    info: vi.fn(),
    warn: vi.fn(),
  },
}));

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({}))
  }
}));

describe('Matches API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/matches', () => {
    it('should return matches with default parameters', async () => {
      const mockRequest = {
        method: 'GET',
        url: 'http://localhost:3000/api/matches',
      } as unknown as NextRequest;

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data).toHaveProperty('matches');
      expect(data).toHaveProperty('count');
      expect(data).toHaveProperty('timestamp');
      expect(data).toHaveProperty('source');
    });

    it('should handle live=true parameter', async () => {
      const mockRequest = {
        method: 'GET',
        url: 'http://localhost:3000/api/matches?live=true&type=upcoming',
      } as unknown as NextRequest;

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.source).toBe('live-api');
    });

    it('should handle different match types', async () => {
      const types = ['upcoming', 'recent', 'all'];
      
      for (const type of types) {
        const mockRequest = {
          method: 'GET',
          url: `http://localhost:3000/api/matches?type=${type}`,
        } as unknown as NextRequest;

        const response = await GET(mockRequest);
        const data = await response.json();

        expect(response.status).toBe(200);
        expect(data.success).toBe(true);
      }
    });

    it('should handle local data when live=false', async () => {
      const mockRequest = {
        method: 'GET',
        url: 'http://localhost:3000/api/matches?live=false',
      } as unknown as NextRequest;

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.source).toBe('local-data');
    });
  });
});