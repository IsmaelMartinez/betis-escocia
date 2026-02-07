import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import axios from 'axios';

// Mock next/server with a proper NextRequest class - must define inside factory function
vi.mock('next/server', () => {
  class MockNextRequest {
    url: string;
    nextUrl: URL;
    method: string;
    headers: Headers;
    
    constructor(url: string, init?: RequestInit) {
      this.url = url;
      this.nextUrl = new URL(url);
      this.method = init?.method || 'GET';
      this.headers = new Headers(init?.headers);
    }
  }

  return {
    NextRequest: MockNextRequest,
    NextResponse: {
      json: (data: unknown, init?: { status?: number }) => ({
        json: () => Promise.resolve(data),
        status: init?.status || 200,
      }),
    },
  };
});

// Import the mocked NextRequest
import { NextRequest } from 'next/server';

// Mock dependencies before imports
vi.mock('axios');
vi.mock('@/lib/api/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ data: null, error: null }))
        }))
      })),
      upsert: vi.fn(() => Promise.resolve({ error: null }))
    }))
  }
}));

vi.mock('@/services/footballDataService', () => ({
  FootballDataService: vi.fn(() => ({
    getLaLigaStandings: vi.fn(() => Promise.resolve({
      table: [
        {
          position: 1,
          team: { id: 90, name: 'Real Betis', crest: 'betis.png' },
          playedGames: 10,
          won: 7,
          draw: 2,
          lost: 1,
          points: 23,
          goalsFor: 20,
          goalsAgainst: 8,
          goalDifference: 12
        },
        {
          position: 2,
          team: { id: 81, name: 'Barcelona', crest: 'barca.png' },
          playedGames: 10,
          won: 6,
          draw: 3,
          lost: 1,
          points: 21,
          goalsFor: 18,
          goalsAgainst: 6,
          goalDifference: 12
        }
      ]
    }))
  }))
}));

vi.mock('@/lib/utils/logger', () => ({
  log: {
    info: vi.fn(),
    error: vi.fn(),
    warn: vi.fn()
  }
}));

describe('Standings API', () => {
  let mockSupabase: any;
  const mockAxios = vi.mocked(axios);
  let mockAxiosCreate: any;

  beforeEach(async () => {
    vi.clearAllMocks();
    
    // Initialize mockSupabase
    mockSupabase = (await import('@/lib/api/supabase')).supabase;
    
    // Mock axios.create
    mockAxiosCreate = vi.fn(() => ({}));
    mockAxios.create = mockAxiosCreate;
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe('GET /api/standings', () => {
    it('should return cached standings when cache is fresh', async () => {
      // Mock fresh cache data (within 24 hours)
      const recentTime = new Date(Date.now() - 1000 * 60 * 60 * 12); // 12 hours ago
      (mockSupabase.from as any).mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({
              data: [{
                data: {
                  table: [
                    {
                      position: 1,
                      team: { id: 90, name: 'Real Betis', crest: 'betis.png' },
                      playedGames: 10,
                      won: 7,
                      draw: 2,
                      lost: 1,
                      points: 23
                    }
                  ]
                },
                last_updated: recentTime.toISOString()
              }],
              error: null
            }))
          }))
        }))
      });

      const { GET } = await import('@/app/api/standings/route');
      const request = new NextRequest('http://localhost:3000/api/standings');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.source).toBe('cache');
      expect(data.data.standings.table).toHaveLength(1);
      expect(data.data.standings.table[0].team.name).toBe('Real Betis');
    });

    it.skip('should fetch fresh data when cache is stale', async () => {
      // Mock stale cache data (older than 24 hours)
      const staleTime = new Date(Date.now() - 1000 * 60 * 60 * 25); // 25 hours ago
      (mockSupabase.from as any).mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({
              data: [{
                data: { table: [] },
                last_updated: staleTime.toISOString()
              }],
              error: null
            }))
          }))
        })),
        upsert: vi.fn(() => Promise.resolve({ error: null }))
      });

      const { GET } = await import('@/app/api/standings/route');
      const request = new NextRequest('http://localhost:3000/api/standings');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.source).toBe('api');
      expect(data.data.standings.table).toHaveLength(2);
    });

    it.skip('should fetch fresh data when no cache exists', async () => {
      // Mock empty cache
      (mockSupabase.from as any).mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({
              data: null,
              error: null
            }))
          }))
        })),
        upsert: vi.fn(() => Promise.resolve({ error: null }))
      });

      const { GET } = await import('@/app/api/standings/route');
      const request = new NextRequest('http://localhost:3000/api/standings');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.source).toBe('api');
      expect(data.data.standings.table).toHaveLength(2);
      expect(data.data.standings.table[0].team.name).toBe('Real Betis');
    });

    it.skip('should handle database cache read errors gracefully', async () => {
      // Mock database error
      (mockSupabase.from as any).mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({
              data: null,
              error: { message: 'Database connection failed' }
            }))
          }))
        })),
        upsert: vi.fn(() => Promise.resolve({ error: null }))
      });

      const { GET } = await import('@/app/api/standings/route');
      const request = new NextRequest('http://localhost:3000/api/standings');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.source).toBe('api');
      expect(data.data.standings.table).toHaveLength(2);
    });

    it('should handle external API failures', async () => {
      // Mock empty cache
      (mockSupabase.from as any).mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({
              data: null,
              error: null
            }))
          }))
        }))
      });

      // Mock external API failure
      const { FootballDataService } = await import('@/services/footballDataService');
      (FootballDataService as any).mockImplementation(() => ({
        getLaLigaStandings: vi.fn(() => Promise.resolve(null))
      }));

      const { GET } = await import('@/app/api/standings/route');
      const request = new NextRequest('http://localhost:3000/api/standings');
      
      const response = await GET(request);
      
      expect(response.status).toBe(400);
    });

    it.skip('should handle cache write failures gracefully', async () => {
      // Mock empty cache for read
      (mockSupabase.from as any).mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({
              data: null,
              error: null
            }))
          }))
        })),
        // Mock cache write failure
        upsert: vi.fn(() => Promise.resolve({ 
          error: { message: 'Cache write failed' }
        }))
      });

      const { GET } = await import('@/app/api/standings/route');
      const request = new NextRequest('http://localhost:3000/api/standings');
      
      const response = await GET(request);
      const data = await response.json();

      // Should still succeed even if cache write fails
      expect(response.status).toBe(200);
      expect(data.data.source).toBe('api');
      expect(data.data.standings.table).toHaveLength(2);
    });

    it.skip('should return proper response structure', async () => {
      // Mock empty cache
      (mockSupabase.from as any).mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({
              data: null,
              error: null
            }))
          }))
        })),
        upsert: vi.fn(() => Promise.resolve({ error: null }))
      });

      const { GET } = await import('@/app/api/standings/route');
      const request = new NextRequest('http://localhost:3000/api/standings');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(response.headers.get('Content-Type')).toBe('application/json');
      
      // Verify response structure
      expect(data.data).toHaveProperty('standings');
      expect(data.data).toHaveProperty('lastUpdated');
      expect(data.data).toHaveProperty('source');
      expect(data.data.standings).toHaveProperty('table');
      expect(Array.isArray(data.data.standings.table)).toBe(true);
    });

    it.skip('should validate team data structure', async () => {
      // Mock empty cache
      (mockSupabase.from as any).mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({
              data: null,
              error: null
            }))
          }))
        })),
        upsert: vi.fn(() => Promise.resolve({ error: null }))
      });

      const { GET } = await import('@/app/api/standings/route');
      const request = new NextRequest('http://localhost:3000/api/standings');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      
      const team = data.data.standings.table[0];
      expect(team).toHaveProperty('position');
      expect(team).toHaveProperty('team');
      expect(team).toHaveProperty('playedGames');
      expect(team).toHaveProperty('won');
      expect(team).toHaveProperty('draw');
      expect(team).toHaveProperty('lost');
      expect(team).toHaveProperty('points');
      expect(team).toHaveProperty('goalsFor');
      expect(team).toHaveProperty('goalsAgainst');
      expect(team).toHaveProperty('goalDifference');
      
      expect(team.team).toHaveProperty('id');
      expect(team.team).toHaveProperty('name');
      expect(team.team).toHaveProperty('crest');
    });
  });

  describe('Cache Logic Edge Cases', () => {
    it.skip('should handle malformed cache data', async () => {
      // Mock malformed cache data
      (mockSupabase.from as any).mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({
              data: [{
                data: null, // Malformed data
                last_updated: new Date().toISOString()
              }],
              error: null
            }))
          }))
        })),
        upsert: vi.fn(() => Promise.resolve({ error: null }))
      });

      const { GET } = await import('@/app/api/standings/route');
      const request = new NextRequest('http://localhost:3000/api/standings');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.source).toBe('api'); // Should fall back to API
    });

    it.skip('should handle invalid date formats in cache', async () => {
      // Mock invalid date
      (mockSupabase.from as any).mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({
              data: [{
                data: { table: [] },
                last_updated: 'invalid-date'
              }],
              error: null
            }))
          }))
        })),
        upsert: vi.fn(() => Promise.resolve({ error: null }))
      });

      const { GET } = await import('@/app/api/standings/route');
      const request = new NextRequest('http://localhost:3000/api/standings');
      
      const response = await GET(request);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.data.source).toBe('api'); // Should fall back to API due to invalid date
    });
  });

  describe('Performance and Concurrency', () => {
    it.skip('should handle multiple concurrent requests', async () => {
      // Mock empty cache
      (mockSupabase.from as any).mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({
              data: null,
              error: null
            }))
          }))
        })),
        upsert: vi.fn(() => Promise.resolve({ error: null }))
      });

      const { GET } = await import('@/app/api/standings/route');
      
      // Make multiple concurrent requests
      const requests = Array(5).fill(0).map(() => {
        const request = new NextRequest('http://localhost:3000/api/standings');
        return GET(request);
      });

      const responses = await Promise.all(requests);
      
      responses.forEach(async (response) => {
        expect(response.status).toBe(200);
        const data = await response.json();
        expect(data.data.standings.table).toHaveLength(2);
      });
    });

    it('should complete requests within reasonable time', async () => {
      // Mock empty cache
      (mockSupabase.from as any).mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({
              data: null,
              error: null
            }))
          }))
        })),
        upsert: vi.fn(() => Promise.resolve({ error: null }))
      });

      const startTime = Date.now();
      
      const { GET } = await import('@/app/api/standings/route');
      const request = new NextRequest('http://localhost:3000/api/standings');
      
      await GET(request);
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete within 5 seconds (generous for mocked services)
      expect(duration).toBeLessThan(5000);
    });
  });
});