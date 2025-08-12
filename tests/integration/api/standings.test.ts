import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GET } from '@/app/api/standings/route';

// Mock all dependencies
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        order: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({ data: [], error: null }))
        }))
      })),
      upsert: vi.fn(() => Promise.resolve({ error: null }))
    })),
  }
}));

vi.mock('@/services/footballDataService', () => ({
  FootballDataService: vi.fn().mockImplementation(() => ({
    getLaLigaStandings: vi.fn()
  })),
  StandingEntry: {} // Mock type
}));

vi.mock('axios', () => ({
  default: {
    create: vi.fn(() => ({}))
  }
}));

describe('/api/standings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('GET /api/standings', () => {
    it('should return cached standings when cache is fresh', async () => {
      const { supabase } = await import('@/lib/supabase');
      const mockSupabase = vi.mocked(supabase);

      const mockCachedData = {
        data: {
          table: [
            { position: 1, team: { name: 'Real Madrid' }, points: 45 },
            { position: 5, team: { name: 'Real Betis' }, points: 25 }
          ]
        },
        last_updated: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
      };

      // Mock cache retrieval
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({ 
              data: [mockCachedData], 
              error: null 
            }))
          }))
        }))
      } as any);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.standings).toEqual(mockCachedData.data);
      expect(data.source).toBe('cache');
      expect(data.lastUpdated).toBe(mockCachedData.last_updated);
    });

    it('should fetch fresh data when cache is stale', async () => {
      const { supabase } = await import('@/lib/supabase');
      const { FootballDataService } = await import('@/services/footballDataService');
      const mockSupabase = vi.mocked(supabase);
      const mockService = vi.mocked(FootballDataService);

      const mockStaleData = {
        data: { table: [] },
        last_updated: new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString() // 25 hours ago
      };

      const mockFreshStandings = {
        table: [
          { position: 1, team: { name: 'Barcelona' }, points: 50 },
          { position: 4, team: { name: 'Real Betis' }, points: 30 }
        ]
      };

      // Mock stale cache retrieval
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({ 
              data: [mockStaleData], 
              error: null 
            }))
          }))
        }))
      } as any);

      // Mock fresh API call
      const mockServiceInstance = {
        getLaLigaStandings: vi.fn().mockResolvedValue(mockFreshStandings)
      };
      mockService.mockImplementation(() => mockServiceInstance as any);

      // Mock cache update
      mockSupabase.from.mockReturnValueOnce({
        upsert: vi.fn(() => Promise.resolve({ error: null }))
      } as any);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.standings).toEqual(mockFreshStandings);
      expect(data.source).toBe('api');
      expect(mockServiceInstance.getLaLigaStandings).toHaveBeenCalled();
    });

    it('should fetch fresh data when no cache exists', async () => {
      const { supabase } = await import('@/lib/supabase');
      const { FootballDataService } = await import('@/services/footballDataService');
      const mockSupabase = vi.mocked(supabase);
      const mockService = vi.mocked(FootballDataService);

      const mockStandings = {
        table: [
          { position: 1, team: { name: 'Atletico Madrid' }, points: 40 },
          { position: 6, team: { name: 'Real Betis' }, points: 22 }
        ]
      };

      // Mock no cache found
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({ 
              data: [], 
              error: null 
            }))
          }))
        }))
      } as any);

      // Mock API call
      const mockServiceInstance = {
        getLaLigaStandings: vi.fn().mockResolvedValue(mockStandings)
      };
      mockService.mockImplementation(() => mockServiceInstance as any);

      // Mock cache save
      mockSupabase.from.mockReturnValueOnce({
        upsert: vi.fn(() => Promise.resolve({ error: null }))
      } as any);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.standings).toEqual(mockStandings);
      expect(data.source).toBe('api');
      expect(mockServiceInstance.getLaLigaStandings).toHaveBeenCalled();
    });

    it('should handle cache retrieval error gracefully', async () => {
      const { supabase } = await import('@/lib/supabase');
      const { FootballDataService } = await import('@/services/footballDataService');
      const mockSupabase = vi.mocked(supabase);
      const mockService = vi.mocked(FootballDataService);

      const mockStandings = {
        table: [
          { position: 1, team: { name: 'Valencia' }, points: 35 }
        ]
      };

      // Mock cache error
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({ 
              data: null, 
              error: { message: 'Database error' } 
            }))
          }))
        }))
      } as any);

      // Mock API call
      const mockServiceInstance = {
        getLaLigaStandings: vi.fn().mockResolvedValue(mockStandings)
      };
      mockService.mockImplementation(() => mockServiceInstance as any);

      // Mock cache save
      mockSupabase.from.mockReturnValueOnce({
        upsert: vi.fn(() => Promise.resolve({ error: null }))
      } as any);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.standings).toEqual(mockStandings);
      expect(data.source).toBe('api');
      expect(mockServiceInstance.getLaLigaStandings).toHaveBeenCalled();
    });

    it('should return 404 when no standings are available', async () => {
      const { supabase } = await import('@/lib/supabase');
      const { FootballDataService } = await import('@/services/footballDataService');
      const mockSupabase = vi.mocked(supabase);
      const mockService = vi.mocked(FootballDataService);

      // Mock no cache
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({ 
              data: [], 
              error: null 
            }))
          }))
        }))
      } as any);

      // Mock API returning null
      const mockServiceInstance = {
        getLaLigaStandings: vi.fn().mockResolvedValue(null)
      };
      mockService.mockImplementation(() => mockServiceInstance as any);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(404);
      expect(data.error).toBe('No se pudieron obtener las clasificaciones');
    });

    it('should handle cache save error silently', async () => {
      const { supabase } = await import('@/lib/supabase');
      const { FootballDataService } = await import('@/services/footballDataService');
      const mockSupabase = vi.mocked(supabase);
      const mockService = vi.mocked(FootballDataService);

      const mockStandings = {
        table: [
          { position: 1, team: { name: 'Sevilla' }, points: 38 }
        ]
      };

      // Mock no cache
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({ 
              data: [], 
              error: null 
            }))
          }))
        }))
      } as any);

      // Mock API call
      const mockServiceInstance = {
        getLaLigaStandings: vi.fn().mockResolvedValue(mockStandings)
      };
      mockService.mockImplementation(() => mockServiceInstance as any);

      // Mock cache save error
      mockSupabase.from.mockReturnValueOnce({
        upsert: vi.fn(() => Promise.resolve({ error: { message: 'Save failed' } }))
      } as any);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.standings).toEqual(mockStandings);
      expect(data.source).toBe('api');
      expect(console.error).toHaveBeenCalledWith('Error saving standings to cache:', { message: 'Save failed' });
    });

    it('should handle network errors with specific message', async () => {
      const { supabase } = await import('@/lib/supabase');
      const { FootballDataService } = await import('@/services/footballDataService');
      const mockSupabase = vi.mocked(supabase);
      const mockService = vi.mocked(FootballDataService);

      // Mock no cache
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({ 
              data: [], 
              error: null 
            }))
          }))
        }))
      } as any);

      // Mock API network error
      const mockServiceInstance = {
        getLaLigaStandings: vi.fn().mockRejectedValue(new Error('network connection failed'))
      };
      mockService.mockImplementation(() => mockServiceInstance as any);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Error de conexión al obtener las clasificaciones. Verifica tu conexión a internet.');
    });

    it('should handle API rate limit errors with specific message', async () => {
      const { supabase } = await import('@/lib/supabase');
      const { FootballDataService } = await import('@/services/footballDataService');
      const mockSupabase = vi.mocked(supabase);
      const mockService = vi.mocked(FootballDataService);

      // Mock no cache
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({ 
              data: [], 
              error: null 
            }))
          }))
        }))
      } as any);

      // Mock API rate limit error
      const mockServiceInstance = {
        getLaLigaStandings: vi.fn().mockRejectedValue(new Error('API rate limit exceeded - 429'))
      };
      mockService.mockImplementation(() => mockServiceInstance as any);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Servicio temporalmente no disponible. Inténtalo más tarde.');
    });

    it('should handle timeout errors with specific message', async () => {
      const { supabase } = await import('@/lib/supabase');
      const { FootballDataService } = await import('@/services/footballDataService');
      const mockSupabase = vi.mocked(supabase);
      const mockService = vi.mocked(FootballDataService);

      // Mock no cache
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({ 
              data: [], 
              error: null 
            }))
          }))
        }))
      } as any);

      // Mock timeout error
      const mockServiceInstance = {
        getLaLigaStandings: vi.fn().mockRejectedValue(new Error('timeout occurred'))
      };
      mockService.mockImplementation(() => mockServiceInstance as any);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Tiempo de espera agotado. Por favor, inténtalo de nuevo.');
    });

    it('should handle generic errors with default message', async () => {
      const { supabase } = await import('@/lib/supabase');
      const { FootballDataService } = await import('@/services/footballDataService');
      const mockSupabase = vi.mocked(supabase);
      const mockService = vi.mocked(FootballDataService);

      // Mock no cache
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({ 
              data: [], 
              error: null 
            }))
          }))
        }))
      } as any);

      // Mock generic error
      const mockServiceInstance = {
        getLaLigaStandings: vi.fn().mockRejectedValue(new Error('Something went wrong'))
      };
      mockService.mockImplementation(() => mockServiceInstance as any);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Error interno al cargar las clasificaciones');
    });

    it('should handle non-Error exceptions', async () => {
      const { supabase } = await import('@/lib/supabase');
      const { FootballDataService } = await import('@/services/footballDataService');
      const mockSupabase = vi.mocked(supabase);
      const mockService = vi.mocked(FootballDataService);

      // Mock no cache
      mockSupabase.from.mockReturnValue({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({ 
              data: [], 
              error: null 
            }))
          }))
        }))
      } as any);

      // Mock non-Error exception
      const mockServiceInstance = {
        getLaLigaStandings: vi.fn().mockRejectedValue('String error')
      };
      mockService.mockImplementation(() => mockServiceInstance as any);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.success).toBe(false);
      expect(data.error).toBe('Error interno al cargar las clasificaciones');
    });

    it('should correctly calculate cache age and determine freshness', async () => {
      const { supabase } = await import('@/lib/supabase');
      const { FootballDataService } = await import('@/services/footballDataService');
      const mockSupabase = vi.mocked(supabase);
      const mockService = vi.mocked(FootballDataService);

      // Set current time to a specific date
      const now = new Date('2025-01-15T12:00:00.000Z');
      vi.setSystemTime(now);

      // Create cache that is exactly at the 24-hour boundary (should be stale)
      const exactlyStaleTime = new Date(now.getTime() - 24 * 60 * 60 * 1000);
      
      const mockStaleData = {
        data: { table: [{ position: 1, team: { name: 'Test' }, points: 10 }] },
        last_updated: exactlyStaleTime.toISOString()
      };

      const mockFreshStandings = {
        table: [{ position: 1, team: { name: 'Fresh Data' }, points: 20 }]
      };

      // Mock cache retrieval
      mockSupabase.from.mockReturnValueOnce({
        select: vi.fn(() => ({
          order: vi.fn(() => ({
            limit: vi.fn(() => Promise.resolve({ 
              data: [mockStaleData], 
              error: null 
            }))
          }))
        }))
      } as any);

      // Mock API call  
      const mockServiceInstance = {
        getLaLigaStandings: vi.fn().mockResolvedValue(mockFreshStandings)
      };
      mockService.mockImplementation(() => mockServiceInstance as any);

      // Mock cache save
      mockSupabase.from.mockReturnValueOnce({
        upsert: vi.fn(() => Promise.resolve({ error: null }))
      } as any);

      const response = await GET();
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.source).toBe('api'); // Should fetch fresh data, not use cache
      expect(data.standings).toEqual(mockFreshStandings);
      expect(mockServiceInstance.getLaLigaStandings).toHaveBeenCalled();
    });
  });
});