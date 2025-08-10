/* eslint-disable @typescript-eslint/no-explicit-any */
// Mock Next.js server utilities first
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, options) => ({
      json: async () => data,
      status: options?.status || 200,
      data,
      ...options,
    })),
  },
}));

// Mock modules at the top before any imports
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

vi.mock('@/services/footballDataService', () => ({
  FootballDataService: vi.fn(),
}));

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET } from '@/app/api/standings/route';
import { supabase } from '@/lib/supabase';
import { FootballDataService } from '@/services/footballDataService';
import { NextResponse } from 'next/server';

// Use vi.mocked for type safety
const mockSupabase = vi.mocked(supabase);
const MockFootballDataService = vi.mocked(FootballDataService);
const mockNextResponse = vi.mocked(NextResponse);

describe('/api/standings', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock implementation
    MockFootballDataService.mockClear();
  });

  describe('Cache scenarios', () => {
    test('should return cached standings when cache is fresh (within 24 hours)', async () => {
      const mockCachedData = {
        data: { table: [{ position: 1, team: { name: 'Real Betis' } }] },
        last_updated: new Date().toISOString(), // Fresh timestamp
      };

      // Mock the Supabase chain for cache retrieval
      const mockSelect = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue({
        data: [mockCachedData],
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
        order: mockOrder,
        limit: mockLimit,
      } as any);

      const response = await GET();
      const json = await response.json();

      expect(json.standings).toEqual(mockCachedData.data);
      expect(json.source).toBe('cache');
      expect(json.lastUpdated).toBe(mockCachedData.last_updated);
      expect(mockSupabase.from).toHaveBeenCalledWith('classification_cache');
      expect(MockFootballDataService).not.toHaveBeenCalled();
    });

    test('should fetch fresh data when cache is stale (older than 24 hours)', async () => {
      const staleTimestamp = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString(); // 25 hours ago
      const mockStaleData = {
        data: { table: [{ position: 1, team: { name: 'Real Betis' } }] },
        last_updated: staleTimestamp,
      };

      // Mock stale cache retrieval
      const mockSelect = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue({
        data: [mockStaleData],
        error: null,
      });
      const mockUpsert = vi.fn().mockResolvedValue({ error: null });

      mockSupabase.from
        .mockReturnValueOnce({
          select: mockSelect,
          order: mockOrder,
          limit: mockLimit,
        } as any)
        .mockReturnValueOnce({
          upsert: mockUpsert,
        } as any);

      const mockFreshApiData = { table: [{ position: 1, team: { name: 'Real Betis' }, points: 50 }] };
      MockFootballDataService.mockImplementation(() => ({
        getLaLigaStandings: vi.fn().mockResolvedValue(mockFreshApiData),
      }) as any);

      const response = await GET();
      const json = await response.json();

      expect(json.standings).toEqual(mockFreshApiData);
      expect(json.source).toBe('api');
      expect(mockSupabase.from).toHaveBeenCalledWith('classification_cache');
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({ id: 1, data: mockFreshApiData }),
        expect.objectContaining({ onConflict: 'id' })
      );
      expect(MockFootballDataService).toHaveBeenCalledTimes(1);
    });

    test('should fetch fresh data when cache is empty', async () => {
      // Mock empty cache
      const mockSelect = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue({
        data: [],
        error: null,
      });
      const mockUpsert = vi.fn().mockResolvedValue({ error: null });

      mockSupabase.from
        .mockReturnValueOnce({
          select: mockSelect,
          order: mockOrder,
          limit: mockLimit,
        } as any)
        .mockReturnValueOnce({
          upsert: mockUpsert,
        } as any);

      const mockApiData = { table: [{ position: 1, team: { name: 'Real Betis' } }] };
      MockFootballDataService.mockImplementation(() => ({
        getLaLigaStandings: vi.fn().mockResolvedValue(mockApiData),
      }) as any);

      const response = await GET();
      const json = await response.json();

      expect(json.standings).toEqual(mockApiData);
      expect(json.source).toBe('api');
      expect(mockSupabase.from).toHaveBeenCalledWith('classification_cache');
      expect(mockUpsert).toHaveBeenCalledWith(
        expect.objectContaining({ id: 1, data: mockApiData }),
        expect.objectContaining({ onConflict: 'id' })
      );
      expect(MockFootballDataService).toHaveBeenCalledTimes(1);
    });

    test('should proceed with API fetch when cache retrieval fails', async () => {
      // Mock cache retrieval error
      const mockSelect = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue({
        data: null,
        error: { message: 'Cache retrieval failed' },
      });
      const mockUpsert = vi.fn().mockResolvedValue({ error: null });

      mockSupabase.from
        .mockReturnValueOnce({
          select: mockSelect,
          order: mockOrder,
          limit: mockLimit,
        } as any)
        .mockReturnValueOnce({
          upsert: mockUpsert,
        } as any);

      const mockApiData = { table: [{ position: 1, team: { name: 'Real Betis' } }] };
      MockFootballDataService.mockImplementation(() => ({
        getLaLigaStandings: vi.fn().mockResolvedValue(mockApiData),
      }) as any);

      const response = await GET();
      const json = await response.json();

      expect(json.standings).toEqual(mockApiData);
      expect(json.source).toBe('api');
      expect(mockSupabase.from).toHaveBeenCalledWith('classification_cache');
      expect(MockFootballDataService).toHaveBeenCalledTimes(1);
    });

    test('should handle cache save failures gracefully', async () => {
      // Mock empty cache first, then cache save failure
      const mockSelect = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue({
        data: [],
        error: null,
      });
      const mockUpsert = vi.fn().mockResolvedValue({ 
        error: { message: 'Cache save failed' } 
      });

      mockSupabase.from
        .mockReturnValueOnce({
          select: mockSelect,
          order: mockOrder,
          limit: mockLimit,
        } as any)
        .mockReturnValueOnce({
          upsert: mockUpsert,
        } as any);

      const mockApiData = { table: [{ position: 1, team: { name: 'Real Betis' } }] };
      MockFootballDataService.mockImplementation(() => ({
        getLaLigaStandings: vi.fn().mockResolvedValue(mockApiData),
      }) as any);

      const response = await GET();
      const json = await response.json();

      // Should still return the API data even if cache save fails
      expect(json.standings).toEqual(mockApiData);
      expect(json.source).toBe('api');
      expect(MockFootballDataService).toHaveBeenCalledTimes(1);
    });
  });

  describe('Error handling', () => {
    test('should return 404 when API returns no standings', async () => {
      // Mock empty cache
      const mockSelect = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue({
        data: [],
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
        order: mockOrder,
        limit: mockLimit,
      } as any);

      // Mock API returning null/undefined
      MockFootballDataService.mockImplementation(() => ({
        getLaLigaStandings: vi.fn().mockResolvedValue(null),
      }) as any);

      const response = await GET();
      const json = await response.json();

      expect(json.error).toBe('No se pudieron obtener las clasificaciones');
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        { error: 'No se pudieron obtener las clasificaciones' },
        { status: 404 }
      );
    });

    test('should handle network errors with appropriate message', async () => {
      // Mock empty cache
      const mockSelect = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue({
        data: [],
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
        order: mockOrder,
        limit: mockLimit,
      } as any);

      // Mock network error
      MockFootballDataService.mockImplementation(() => ({
        getLaLigaStandings: vi.fn().mockRejectedValue(new Error('network connection failed')),
      }) as any);

      const response = await GET();
      const json = await response.json();

      expect(json.success).toBe(false);
      expect(json.error).toBe('Error de conexión al obtener las clasificaciones. Verifica tu conexión a internet.');
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false }),
        { status: 500 }
      );
    });

    test('should handle API rate limiting errors', async () => {
      // Mock empty cache
      const mockSelect = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue({
        data: [],
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
        order: mockOrder,
        limit: mockLimit,
      } as any);

      // Mock API rate limiting error
      MockFootballDataService.mockImplementation(() => ({
        getLaLigaStandings: vi.fn().mockRejectedValue(new Error('API rate limit exceeded 429')),
      }) as any);

      const response = await GET();
      const json = await response.json();

      expect(json.success).toBe(false);
      expect(json.error).toBe('Servicio temporalmente no disponible. Inténtalo más tarde.');
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false }),
        { status: 500 }
      );
    });

    test('should handle timeout errors', async () => {
      // Mock empty cache
      const mockSelect = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue({
        data: [],
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
        order: mockOrder,
        limit: mockLimit,
      } as any);

      // Mock timeout error
      MockFootballDataService.mockImplementation(() => ({
        getLaLigaStandings: vi.fn().mockRejectedValue(new Error('Request timeout exceeded')),
      }) as any);

      const response = await GET();
      const json = await response.json();

      expect(json.success).toBe(false);
      expect(json.error).toBe('Tiempo de espera agotado. Por favor, inténtalo de nuevo.');
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false }),
        { status: 500 }
      );
    });

    test('should handle generic errors with default message', async () => {
      // Mock empty cache
      const mockSelect = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue({
        data: [],
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
        order: mockOrder,
        limit: mockLimit,
      } as any);

      // Mock generic error
      MockFootballDataService.mockImplementation(() => ({
        getLaLigaStandings: vi.fn().mockRejectedValue(new Error('Unexpected error occurred')),
      }) as any);

      const response = await GET();
      const json = await response.json();

      expect(json.success).toBe(false);
      expect(json.error).toBe('Error interno al cargar las clasificaciones');
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false }),
        { status: 500 }
      );
    });

    test('should handle non-Error objects thrown as exceptions', async () => {
      // Mock empty cache
      const mockSelect = vi.fn().mockReturnThis();
      const mockOrder = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue({
        data: [],
        error: null,
      });

      mockSupabase.from.mockReturnValue({
        select: mockSelect,
        order: mockOrder,
        limit: mockLimit,
      } as any);

      // Mock non-Error object thrown
      MockFootballDataService.mockImplementation(() => ({
        getLaLigaStandings: vi.fn().mockRejectedValue('String error'),
      }) as any);

      const response = await GET();
      const json = await response.json();

      expect(json.success).toBe(false);
      expect(json.error).toBe('Error interno al cargar las clasificaciones');
      expect(mockNextResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false }),
        { status: 500 }
      );
    });
  });
});
