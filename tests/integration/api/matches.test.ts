import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET } from '@/app/api/matches/route';

// Mock FootballDataService
vi.mock('@/services/footballDataService', () => ({
  FootballDataService: vi.fn().mockImplementation(() => ({
    getUpcomingBetisMatchesForCards: vi.fn(),
    getRecentBetisResultsForCards: vi.fn(),
  })),
}));

// Mock axios
vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({}))
  }
}));

describe('/api/matches', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('GET /api/matches', () => {
    it('should return empty matches when not using live API', async () => {
      const mockRequest = new Request('http://localhost:3000/api/matches');

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        matches: [],
        count: 0,
        timestamp: expect.any(String),
        source: 'local-data',
      });
    });

    it('should return empty matches when not using live API with type parameter', async () => {
      const mockRequest = new Request('http://localhost:3000/api/matches?type=upcoming');

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        matches: [],
        count: 0,
        timestamp: expect.any(String),
        source: 'local-data',
      });
    });

    it('should fetch upcoming matches when live=true and type=upcoming', async () => {
      const { FootballDataService } = await import('@/services/footballDataService');
      const mockService = vi.mocked(FootballDataService);

      const mockUpcomingMatches = [
        { id: 1, opponent: 'Real Madrid', date: '2025-02-15T20:00:00', competition: 'LaLiga' },
        { id: 2, opponent: 'Barcelona', date: '2025-02-22T21:00:00', competition: 'LaLiga' }
      ];

      const mockServiceInstance = {
        getUpcomingBetisMatchesForCards: vi.fn().mockResolvedValue(mockUpcomingMatches),
        getRecentBetisResultsForCards: vi.fn()
      };
      mockService.mockImplementation(() => mockServiceInstance as any);

      const mockRequest = new Request('http://localhost:3000/api/matches?live=true&type=upcoming');

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        matches: mockUpcomingMatches,
        count: 2,
        timestamp: expect.any(String),
        source: 'live-api',
      });
      expect(mockServiceInstance.getUpcomingBetisMatchesForCards).toHaveBeenCalledWith(10);
      expect(mockServiceInstance.getRecentBetisResultsForCards).not.toHaveBeenCalled();
    });

    it('should fetch recent matches when live=true and type=recent', async () => {
      const { FootballDataService } = await import('@/services/footballDataService');
      const mockService = vi.mocked(FootballDataService);

      const mockRecentMatches = [
        { id: 3, opponent: 'Sevilla', date: '2025-01-20T19:30:00', competition: 'LaLiga', score: '2-1' },
        { id: 4, opponent: 'Villarreal', date: '2025-01-13T21:00:00', competition: 'LaLiga', score: '1-0' }
      ];

      const mockServiceInstance = {
        getUpcomingBetisMatchesForCards: vi.fn(),
        getRecentBetisResultsForCards: vi.fn().mockResolvedValue(mockRecentMatches)
      };
      mockService.mockImplementation(() => mockServiceInstance as any);

      const mockRequest = new Request('http://localhost:3000/api/matches?live=true&type=recent');

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        matches: mockRecentMatches,
        count: 2,
        timestamp: expect.any(String),
        source: 'live-api',
      });
      expect(mockServiceInstance.getRecentBetisResultsForCards).toHaveBeenCalledWith(10);
      expect(mockServiceInstance.getUpcomingBetisMatchesForCards).not.toHaveBeenCalled();
    });

    it('should fetch both upcoming and recent matches when live=true and type=all', async () => {
      const { FootballDataService } = await import('@/services/footballDataService');
      const mockService = vi.mocked(FootballDataService);

      const mockUpcomingMatches = [
        { id: 1, opponent: 'Real Madrid', date: '2025-02-15T20:00:00', competition: 'LaLiga' },
        { id: 2, opponent: 'Barcelona', date: '2025-02-22T21:00:00', competition: 'LaLiga' }
      ];
      const mockRecentMatches = [
        { id: 3, opponent: 'Sevilla', date: '2025-01-20T19:30:00', competition: 'LaLiga', score: '2-1' }
      ];

      const mockServiceInstance = {
        getUpcomingBetisMatchesForCards: vi.fn().mockResolvedValue(mockUpcomingMatches),
        getRecentBetisResultsForCards: vi.fn().mockResolvedValue(mockRecentMatches)
      };
      mockService.mockImplementation(() => mockServiceInstance as any);

      const mockRequest = new Request('http://localhost:3000/api/matches?live=true&type=all');

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        matches: [...mockUpcomingMatches, ...mockRecentMatches],
        count: 3,
        timestamp: expect.any(String),
        source: 'live-api',
      });
      expect(mockServiceInstance.getUpcomingBetisMatchesForCards).toHaveBeenCalledWith(5);
      expect(mockServiceInstance.getRecentBetisResultsForCards).toHaveBeenCalledWith(5);
    });

    it('should return empty matches for unknown match type when using live API', async () => {
      const { FootballDataService } = await import('@/services/footballDataService');
      const mockService = vi.mocked(FootballDataService);

      const mockServiceInstance = {
        getUpcomingBetisMatchesForCards: vi.fn(),
        getRecentBetisResultsForCards: vi.fn()
      };
      mockService.mockImplementation(() => mockServiceInstance as any);

      const mockRequest = new Request('http://localhost:3000/api/matches?live=true&type=unknown');

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        matches: [],
        count: 0,
        timestamp: expect.any(String),
        source: 'live-api',
      });
      expect(mockServiceInstance.getUpcomingBetisMatchesForCards).not.toHaveBeenCalled();
      expect(mockServiceInstance.getRecentBetisResultsForCards).not.toHaveBeenCalled();
    });

    it('should handle API errors gracefully and return empty matches', async () => {
      const { FootballDataService } = await import('@/services/footballDataService');
      const mockService = vi.mocked(FootballDataService);

      const mockServiceInstance = {
        getUpcomingBetisMatchesForCards: vi.fn().mockRejectedValue(new Error('API Error')),
        getRecentBetisResultsForCards: vi.fn()
      };
      mockService.mockImplementation(() => mockServiceInstance as any);

      const mockRequest = new Request('http://localhost:3000/api/matches?live=true&type=upcoming');

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        matches: [],
        count: 0,
        timestamp: expect.any(String),
        source: 'live-api',
      });
      expect(console.error).toHaveBeenCalledWith('Live API error:', expect.any(Error));
    });

    it('should handle API errors gracefully for recent matches', async () => {
      const { FootballDataService } = await import('@/services/footballDataService');
      const mockService = vi.mocked(FootballDataService);

      const mockServiceInstance = {
        getUpcomingBetisMatchesForCards: vi.fn(),
        getRecentBetisResultsForCards: vi.fn().mockRejectedValue(new Error('Network timeout'))
      };
      mockService.mockImplementation(() => mockServiceInstance as any);

      const mockRequest = new Request('http://localhost:3000/api/matches?live=true&type=recent');

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        matches: [],
        count: 0,
        timestamp: expect.any(String),
        source: 'live-api',
      });
      expect(console.error).toHaveBeenCalledWith('Live API error:', expect.any(Error));
    });

    it('should handle API errors gracefully for all matches type', async () => {
      const { FootballDataService } = await import('@/services/footballDataService');
      const mockService = vi.mocked(FootballDataService);

      const mockServiceInstance = {
        getUpcomingBetisMatchesForCards: vi.fn().mockRejectedValue(new Error('Service unavailable')),
        getRecentBetisResultsForCards: vi.fn().mockResolvedValue([])
      };
      mockService.mockImplementation(() => mockServiceInstance as any);

      const mockRequest = new Request('http://localhost:3000/api/matches?live=true&type=all');

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        matches: [],
        count: 0,
        timestamp: expect.any(String),
        source: 'live-api',
      });
      expect(console.error).toHaveBeenCalledWith('Live API error:', expect.any(Error));
    });

    it('should handle request URL parsing errors', async () => {
      // Mock a request that will throw an error during URL parsing
      const mockRequest = {
        url: 'invalid-url'
      } as Request;

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        success: false,
        error: 'Error interno al cargar los partidos',
        matches: [],
        count: 0,
      });
      expect(console.error).toHaveBeenCalledWith('Error fetching matches:', expect.any(Error));
    });

    it('should handle unexpected errors during match processing', async () => {
      // Mock a request that will throw an error during URL parsing
      const mockRequest = {
        url: 'invalid-url',
      } as Request;

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data).toEqual({
        success: false,
        error: 'Error interno al cargar los partidos',
        matches: [],
        count: 0,
      });
      expect(console.error).toHaveBeenCalledWith('Error fetching matches:', expect.any(TypeError));
    });

    it('should handle partial failures in all matches type', async () => {
      const { FootballDataService } = await import('@/services/footballDataService');
      const mockService = vi.mocked(FootballDataService);

      const mockUpcomingMatches = [
        { id: 1, opponent: 'Real Madrid', date: '2025-02-15T20:00:00', competition: 'LaLiga' }
      ];

      const mockServiceInstance = {
        getUpcomingBetisMatchesForCards: vi.fn().mockResolvedValue(mockUpcomingMatches),
        getRecentBetisResultsForCards: vi.fn().mockRejectedValue(new Error('Recent matches failed'))
      };
      mockService.mockImplementation(() => mockServiceInstance as any);

      const mockRequest = new Request('http://localhost:3000/api/matches?live=true&type=all');

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        matches: [],
        count: 0,
        timestamp: expect.any(String),
        source: 'live-api',
      });
      expect(console.error).toHaveBeenCalledWith('Live API error:', expect.any(Error));
    });

    it('should return current timestamp in response', async () => {
      const beforeTest = new Date();
      const mockRequest = new Request('http://localhost:3000/api/matches');

      const response = await GET(mockRequest);
      const data = await response.json();
      
      const afterTest = new Date();
      const responseTime = new Date(data.timestamp);

      expect(responseTime.getTime()).toBeGreaterThanOrEqual(beforeTest.getTime());
      expect(responseTime.getTime()).toBeLessThanOrEqual(afterTest.getTime());
    });

    it('should handle empty response from external API', async () => {
      const { FootballDataService } = await import('@/services/footballDataService');
      const mockService = vi.mocked(FootballDataService);

      const mockServiceInstance = {
        getUpcomingBetisMatchesForCards: vi.fn().mockResolvedValue([]),
        getRecentBetisResultsForCards: vi.fn()
      };
      mockService.mockImplementation(() => mockServiceInstance as any);

      const mockRequest = new Request('http://localhost:3000/api/matches?live=true&type=upcoming');

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        matches: [],
        count: 0,
        timestamp: expect.any(String),
        source: 'live-api',
      });
      expect(mockServiceInstance.getUpcomingBetisMatchesForCards).toHaveBeenCalledWith(10);
    });

    it('should handle null response from external API', async () => {
      const { FootballDataService } = await import('@/services/footballDataService');
      const mockService = vi.mocked(FootballDataService);

      const mockServiceInstance = {
        getUpcomingBetisMatchesForCards: vi.fn(),
        getRecentBetisResultsForCards: vi.fn().mockResolvedValue(null)
      };
      mockService.mockImplementation(() => mockServiceInstance as any);

      const mockRequest = new Request('http://localhost:3000/api/matches?live=true&type=recent');

      const response = await GET(mockRequest);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data).toEqual({
        success: true,
        matches: [],
        count: 0,
        timestamp: expect.any(String),
        source: 'live-api',
      });
    });
  });
});