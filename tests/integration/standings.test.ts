/* eslint-disable @typescript-eslint/no-explicit-any */
// Mock modules at the top before any imports
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
}));

jest.mock('@/services/footballDataService', () => ({
  FootballDataService: jest.fn(),
}));

import { GET } from '@/app/api/standings/route';
import { supabase } from '@/lib/supabase';
import { FootballDataService } from '@/services/footballDataService';

// Use jest.mocked for type safety
const mockSupabase = jest.mocked(supabase);
const MockFootballDataService = jest.mocked(FootballDataService);

describe('/api/standings', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  test('should return cached standings when cache is fresh', async () => {
    const mockCachedData = {
      data: { table: [{ position: 1, team: { name: 'Real Betis' } }] },
      last_updated: new Date().toISOString(),
    };

    // Mock the Supabase chain
    const mockSelect = jest.fn().mockReturnThis();
    const mockOrder = jest.fn().mockReturnThis();
    const mockLimit = jest.fn().mockResolvedValue({
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
    expect(mockSupabase.from).toHaveBeenCalledWith('classification_cache');
    expect(MockFootballDataService).not.toHaveBeenCalled();
  });

  test('should fetch fresh data when cache is empty', async () => {
    // Mock empty cache
    const mockSelect = jest.fn().mockReturnThis();
    const mockOrder = jest.fn().mockReturnThis();
    const mockLimit = jest.fn().mockResolvedValue({
      data: [],
      error: null,
    });
    const mockUpsert = jest.fn().mockResolvedValue({ error: null });

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
      getLaLigaStandings: jest.fn().mockResolvedValue(mockApiData),
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
});
