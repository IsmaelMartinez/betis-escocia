import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock FootballDataService
const mockGetUpcomingBetisMatchesForCards = vi.fn();
const mockGetRecentBetisResultsForCards = vi.fn();

class MockFootballDataService {
  constructor(axios: any) {}
  
  getUpcomingBetisMatchesForCards = mockGetUpcomingBetisMatchesForCards;
  getRecentBetisResultsForCards = mockGetRecentBetisResultsForCards;
}

vi.mock('@/services/footballDataService', () => ({
  FootballDataService: MockFootballDataService
}));

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({}))
  }
}));

vi.mock('@/lib/logger', () => ({
  log: {
    info: vi.fn(),
    warn: vi.fn(),
    error: vi.fn()
  }
}));

const sampleUpcomingMatches = [
  {
    id: 1,
    opponent: 'Real Madrid',
    date: '2024-12-20T21:00:00Z',
    competition: 'LaLiga',
    venue: 'Santiago Bernabéu',
    matchweek: 18,
    isHome: false
  },
  {
    id: 2,
    opponent: 'Barcelona',
    date: '2024-12-25T16:15:00Z',
    competition: 'LaLiga',
    venue: 'Estadio Benito Villamarín',
    matchweek: 19,
    isHome: true
  }
];

const sampleRecentMatches = [
  {
    id: 3,
    opponent: 'Atlético Madrid',
    date: '2024-12-10T20:00:00Z',
    competition: 'LaLiga',
    venue: 'Estadio Benito Villamarín',
    matchweek: 16,
    isHome: true,
    result: {
      homeGoals: 2,
      awayGoals: 1,
      winner: 'home'
    }
  },
  {
    id: 4,
    opponent: 'Valencia',
    date: '2024-12-05T18:30:00Z',
    competition: 'LaLiga',
    venue: 'Mestalla',
    matchweek: 15,
    isHome: false,
    result: {
      homeGoals: 0,
      awayGoals: 3,
      winner: 'away'
    }
  }
];

describe('Matches API - Comprehensive Tests', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Setup default successful mocks
    mockGetUpcomingBetisMatchesForCards.mockResolvedValue(sampleUpcomingMatches);
    mockGetRecentBetisResultsForCards.mockResolvedValue(sampleRecentMatches);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('GET /api/matches - Default Parameters', () => {
    it('should return empty matches with default parameters (live=false)', async () => {
      const { GET } = await import('@/app/api/matches/route');
      const request = new NextRequest('http://localhost:3000/api/matches');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.success).toBe(true);
      expect(data.data.matches).toHaveLength(0);
      expect(data.data.count).toBe(0);
      expect(data.data.source).toBe('local-data');
      expect(data.data.timestamp).toBeDefined();
    });

    it('should validate request structure and response format', async () => {
      const { GET } = await import('@/app/api/matches/route');
      const request = new NextRequest('http://localhost:3000/api/matches?live=true');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toHaveProperty('success');
      expect(data).toHaveProperty('data');
      expect(data.data).toHaveProperty('matches');
      expect(data.data).toHaveProperty('count');
      expect(data.data).toHaveProperty('timestamp');
      expect(data.data).toHaveProperty('source');
    });
  });

  describe('GET /api/matches - Live Mode with Different Types', () => {
    it('should fetch upcoming matches when type=upcoming and live=true', async () => {
      const { GET } = await import('@/app/api/matches/route');
      const request = new NextRequest('http://localhost:3000/api/matches?type=upcoming&live=true');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.matches).toHaveLength(2);
      expect(data.data.count).toBe(2);
      expect(data.data.source).toBe('live-api');
      expect(mockGetUpcomingBetisMatchesForCards).toHaveBeenCalledWith(10);
      expect(mockGetRecentBetisResultsForCards).not.toHaveBeenCalled();
    });

    it('should fetch recent matches when type=recent and live=true', async () => {
      const { GET } = await import('@/app/api/matches/route');
      const request = new NextRequest('http://localhost:3000/api/matches?type=recent&live=true');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.matches).toHaveLength(2);
      expect(data.data.count).toBe(2);
      expect(data.data.source).toBe('live-api');
      expect(mockGetRecentBetisResultsForCards).toHaveBeenCalledWith(10);
      expect(mockGetUpcomingBetisMatchesForCards).not.toHaveBeenCalled();
    });

    it('should fetch both upcoming and recent matches when type=all and live=true', async () => {
      const { GET } = await import('@/app/api/matches/route');
      const request = new NextRequest('http://localhost:3000/api/matches?type=all&live=true');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.matches).toHaveLength(4); // 2 upcoming + 2 recent
      expect(data.data.count).toBe(4);
      expect(data.data.source).toBe('live-api');
      expect(mockGetUpcomingBetisMatchesForCards).toHaveBeenCalledWith(5);
      expect(mockGetRecentBetisResultsForCards).toHaveBeenCalledWith(5);
    });

    it('should return empty matches for unsupported types (conference, friendlies)', async () => {
      const { GET } = await import('@/app/api/matches/route');
      const request = new NextRequest('http://localhost:3000/api/matches?type=conference&live=true');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.matches).toHaveLength(0);
      expect(data.data.count).toBe(0);
      expect(data.data.source).toBe('live-api');
      expect(mockGetUpcomingBetisMatchesForCards).not.toHaveBeenCalled();
      expect(mockGetRecentBetisResultsForCards).not.toHaveBeenCalled();
    });
  });

  describe('Query Parameter Validation', () => {
    it('should validate and accept valid type parameters', async () => {
      const validTypes = ['all', 'upcoming', 'recent', 'conference', 'friendlies'];
      
      for (const type of validTypes) {
        const { GET } = await import('@/app/api/matches/route');
        const request = new NextRequest(`http://localhost:3000/api/matches?type=${type}`);
        
        const response = await GET(request);
        
        expect(response.status).toBe(200);
      }
    });

    it('should reject invalid type parameters', async () => {
      const { GET } = await import('@/app/api/matches/route');
      const request = new NextRequest('http://localhost:3000/api/matches?type=invalid');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(400);
      expect(data.success).toBe(false);
      expect(data.error).toContain('validation');
    });

    it('should handle live parameter as string boolean', async () => {
      const testCases = [
        { live: 'true', expected: true },
        { live: 'false', expected: false },
        { live: '1', expected: false },
        { live: 'yes', expected: false }
      ];

      for (const testCase of testCases) {
        const { GET } = await import('@/app/api/matches/route');
        const request = new NextRequest(`http://localhost:3000/api/matches?live=${testCase.live}&type=upcoming`);
        
        const response = await GET(request);
        const data = await response.json();

        expect(response.status).toBe(200);
        
        if (testCase.expected) {
          expect(data.data.source).toBe('live-api');
        } else {
          expect(data.data.source).toBe('local-data');
        }
      }
    });

    it('should use default values when parameters are missing', async () => {
      const { GET } = await import('@/app/api/matches/route');
      const request = new NextRequest('http://localhost:3000/api/matches'); // No parameters
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.source).toBe('local-data'); // Default live=false
      expect(data.data.matches).toHaveLength(0); // Default type=all with local data
    });
  });

  describe('External API Error Handling', () => {
    it('should handle upcoming matches API failure gracefully', async () => {
      mockGetUpcomingBetisMatchesForCards.mockRejectedValue(new Error('API rate limit exceeded'));

      const { GET } = await import('@/app/api/matches/route');
      const request = new NextRequest('http://localhost:3000/api/matches?type=upcoming&live=true');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.matches).toHaveLength(0);
      expect(data.data.source).toBe('live-api');
      expect(data.success).toBe(true);
    });

    it('should handle recent matches API failure gracefully', async () => {
      mockGetRecentBetisResultsForCards.mockRejectedValue(new Error('Network timeout'));

      const { GET } = await import('@/app/api/matches/route');
      const request = new NextRequest('http://localhost:3000/api/matches?type=recent&live=true');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.matches).toHaveLength(0);
      expect(data.data.source).toBe('live-api');
      expect(data.success).toBe(true);
    });

    it('should handle partial API failures in type=all mode', async () => {
      mockGetUpcomingBetisMatchesForCards.mockResolvedValue(sampleUpcomingMatches);
      mockGetRecentBetisResultsForCards.mockRejectedValue(new Error('Recent matches API failed'));

      const { GET } = await import('@/app/api/matches/route');
      const request = new NextRequest('http://localhost:3000/api/matches?type=all&live=true');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.matches).toHaveLength(0); // All or nothing due to error in any service
      expect(data.data.source).toBe('live-api');
    });

    it('should handle API returning null values', async () => {
      mockGetUpcomingBetisMatchesForCards.mockResolvedValue(null);
      mockGetRecentBetisResultsForCards.mockResolvedValue(null);

      const { GET } = await import('@/app/api/matches/route');
      const request = new NextRequest('http://localhost:3000/api/matches?type=all&live=true');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.matches).toHaveLength(0);
      expect(data.data.count).toBe(0);
    });

    it('should handle API returning undefined values', async () => {
      mockGetUpcomingBetisMatchesForCards.mockResolvedValue(undefined);

      const { GET } = await import('@/app/api/matches/route');
      const request = new NextRequest('http://localhost:3000/api/matches?type=upcoming&live=true');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.matches).toHaveLength(0);
    });
  });

  describe('Data Format and Content Validation', () => {
    it('should return matches with expected data structure', async () => {
      const { GET } = await import('@/app/api/matches/route');
      const request = new NextRequest('http://localhost:3000/api/matches?type=upcoming&live=true');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.matches[0]).toHaveProperty('id');
      expect(data.data.matches[0]).toHaveProperty('opponent');
      expect(data.data.matches[0]).toHaveProperty('date');
      expect(data.data.matches[0]).toHaveProperty('competition');
      expect(data.data.matches[0]).toHaveProperty('venue');
    });

    it('should include result data for recent matches', async () => {
      const { GET } = await import('@/app/api/matches/route');
      const request = new NextRequest('http://localhost:3000/api/matches?type=recent&live=true');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.matches[0]).toHaveProperty('result');
      expect(data.data.matches[0].result).toHaveProperty('homeGoals');
      expect(data.data.matches[0].result).toHaveProperty('awayGoals');
      expect(data.data.matches[0].result).toHaveProperty('winner');
    });

    it('should validate timestamp format', async () => {
      const { GET } = await import('@/app/api/matches/route');
      const request = new NextRequest('http://localhost:3000/api/matches');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.timestamp).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}.\d{3}Z$/);
      expect(new Date(data.data.timestamp)).toBeInstanceOf(Date);
    });

    it('should maintain count consistency with matches array', async () => {
      const { GET } = await import('@/app/api/matches/route');
      const request = new NextRequest('http://localhost:3000/api/matches?type=all&live=true');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.count).toBe(data.data.matches.length);
    });
  });

  describe('Performance and Edge Cases', () => {
    it('should handle large datasets efficiently', async () => {
      const largeMatchArray = Array.from({ length: 50 }, (_, i) => ({
        id: i + 1,
        opponent: `Team ${i + 1}`,
        date: new Date(Date.now() + i * 86400000).toISOString(),
        competition: 'LaLiga',
        venue: `Stadium ${i + 1}`,
        matchweek: i + 1,
        isHome: i % 2 === 0
      }));

      mockGetUpcomingBetisMatchesForCards.mockResolvedValue(largeMatchArray);

      const { GET } = await import('@/app/api/matches/route');
      const request = new NextRequest('http://localhost:3000/api/matches?type=upcoming&live=true');
      
      const startTime = Date.now();
      const response = await GET(request);
      const endTime = Date.now();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.matches).toHaveLength(50);
      expect(data.data.count).toBe(50);
      expect(endTime - startTime).toBeLessThan(1000); // Should complete within 1 second
    });

    it('should handle empty API responses', async () => {
      mockGetUpcomingBetisMatchesForCards.mockResolvedValue([]);
      mockGetRecentBetisResultsForCards.mockResolvedValue([]);

      const { GET } = await import('@/app/api/matches/route');
      const request = new NextRequest('http://localhost:3000/api/matches?type=all&live=true');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.matches).toHaveLength(0);
      expect(data.data.count).toBe(0);
      expect(data.success).toBe(true);
    });

    it('should handle concurrent requests efficiently', async () => {
      const requestPromises = Array.from({ length: 5 }, () => {
        return new Promise(async (resolve) => {
          const { GET } = await import('@/app/api/matches/route');
          const request = new NextRequest('http://localhost:3000/api/matches?type=upcoming&live=true');
          
          const response = await GET(request);
          resolve(response);
        });
      });

      const responses = await Promise.all(requestPromises);
      
      responses.forEach((response: any) => {
        expect(response.status).toBe(200);
      });
    });

    it('should handle malformed query parameters gracefully', async () => {
      const malformedUrls = [
        'http://localhost:3000/api/matches?type=',
        'http://localhost:3000/api/matches?live=',
        'http://localhost:3000/api/matches?type=upcoming&live=maybe',
        'http://localhost:3000/api/matches?invalid=parameter'
      ];

      for (const url of malformedUrls) {
        const { GET } = await import('@/app/api/matches/route');
        const request = new NextRequest(url);
        
        const response = await GET(request);
        
        // Should either succeed with defaults or return validation error
        expect([200, 400]).toContain(response.status);
      }
    });
  });

  describe('API Integration Scenarios', () => {
    it('should handle Football Data API rate limiting', async () => {
      const rateLimitError = new Error('Rate limit exceeded');
      rateLimitError.name = 'RateLimitError';
      
      mockGetUpcomingBetisMatchesForCards.mockRejectedValue(rateLimitError);

      const { GET } = await import('@/app/api/matches/route');
      const request = new NextRequest('http://localhost:3000/api/matches?type=upcoming&live=true');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.matches).toHaveLength(0);
      expect(data.success).toBe(true);
    });

    it('should handle network timeout errors', async () => {
      const timeoutError = new Error('ETIMEDOUT');
      timeoutError.name = 'TimeoutError';
      
      mockGetRecentBetisResultsForCards.mockRejectedValue(timeoutError);

      const { GET } = await import('@/app/api/matches/route');
      const request = new NextRequest('http://localhost:3000/api/matches?type=recent&live=true');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.matches).toHaveLength(0);
      expect(data.success).toBe(true);
    });

    it('should handle API authentication errors', async () => {
      const authError = new Error('Unauthorized');
      authError.name = 'UnauthorizedError';
      
      mockGetUpcomingBetisMatchesForCards.mockRejectedValue(authError);
      mockGetRecentBetisResultsForCards.mockRejectedValue(authError);

      const { GET } = await import('@/app/api/matches/route');
      const request = new NextRequest('http://localhost:3000/api/matches?type=all&live=true');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.matches).toHaveLength(0);
      expect(data.success).toBe(true);
    });
  });

  describe('Logging and Monitoring', () => {
    it('should log successful API calls', async () => {
      const { log } = await import('@/lib/logger');

      const { GET } = await import('@/app/api/matches/route');
      const request = new NextRequest('http://localhost:3000/api/matches?type=upcoming&live=true');
      
      await GET(request);

      expect(log.info).toHaveBeenCalledWith(
        'Successfully fetched live match data',
        undefined,
        expect.objectContaining({
          type: 'upcoming',
          matchCount: 2,
          source: 'football-data-api'
        })
      );
    });

    it('should log API failures with appropriate warnings', async () => {
      const { log } = await import('@/lib/logger');
      const apiError = new Error('API service unavailable');
      
      mockGetUpcomingBetisMatchesForCards.mockRejectedValue(apiError);

      const { GET } = await import('@/app/api/matches/route');
      const request = new NextRequest('http://localhost:3000/api/matches?type=upcoming&live=true');
      
      await GET(request);

      expect(log.warn).toHaveBeenCalledWith(
        'Live API error, falling back to empty results',
        undefined,
        expect.objectContaining({
          error: 'API service unavailable',
          type: 'upcoming'
        })
      );
    });
  });
});