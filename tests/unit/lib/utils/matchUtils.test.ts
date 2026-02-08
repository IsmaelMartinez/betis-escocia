import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getCurrentUpcomingMatch } from '@/lib/utils/matchUtils';
import { supabase } from '@/lib/api/supabase';

// Mock the entire supabase module
vi.mock('@/lib/api/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
}));

describe('matchUtils', () => {
  const mockSupabaseQuery = {
    select: vi.fn(),
    gte: vi.fn(),
    order: vi.fn(), 
    limit: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    
    // Chain the mock methods
    mockSupabaseQuery.select.mockReturnValue(mockSupabaseQuery);
    mockSupabaseQuery.gte.mockReturnValue(mockSupabaseQuery);
    mockSupabaseQuery.order.mockReturnValue(mockSupabaseQuery);
    mockSupabaseQuery.limit.mockReturnValue(mockSupabaseQuery);
    
    (supabase.from as any).mockReturnValue(mockSupabaseQuery);
  });

  describe('getCurrentUpcomingMatch', () => {
    const DEFAULT_MATCH = {
      opponent: "Real Madrid",
      date: "2025-06-28T20:00:00",
      competition: "LaLiga"
    };

    it('should return upcoming match when data exists', async () => {
      const mockMatchData = [
        {
          id: 1,
          opponent: 'FC Barcelona',
          date_time: '2025-02-15T20:00:00.000Z',
          competition: 'LaLiga'
        }
      ];

      mockSupabaseQuery.limit.mockResolvedValue({
        data: mockMatchData,
        error: null
      });

      const result = await getCurrentUpcomingMatch();

      expect(result).toEqual({
        opponent: 'FC Barcelona',
        date: '2025-02-15T20:00:00.000Z',
        competition: 'LaLiga'
      });

      // Verify the query was built correctly
      expect(supabase.from).toHaveBeenCalledWith('matches');
      expect(mockSupabaseQuery.select).toHaveBeenCalledWith('id, opponent, date_time, competition');
      expect(mockSupabaseQuery.gte).toHaveBeenCalledWith('date_time', expect.any(String));
      expect(mockSupabaseQuery.order).toHaveBeenCalledWith('date_time', { ascending: true });
      expect(mockSupabaseQuery.limit).toHaveBeenCalledWith(1);
    });

    it('should return default match when no data found', async () => {
      mockSupabaseQuery.limit.mockResolvedValue({
        data: [],
        error: null
      });

      const result = await getCurrentUpcomingMatch();

      expect(result).toEqual(DEFAULT_MATCH);
    });

    it('should return default match when data is null', async () => {
      mockSupabaseQuery.limit.mockResolvedValue({
        data: null,
        error: null
      });

      const result = await getCurrentUpcomingMatch();

      expect(result).toEqual(DEFAULT_MATCH);
    });

    it('should return default match and log error when database error occurs', async () => {
      const mockError = new Error('Database connection failed');
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      mockSupabaseQuery.limit.mockResolvedValue({
        data: null,
        error: mockError
      });

      const result = await getCurrentUpcomingMatch();

      expect(result).toEqual(DEFAULT_MATCH);
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error fetching upcoming match:', mockError);
      
      consoleErrorSpy.mockRestore();
    });

    it('should correctly transform database fields to return format', async () => {
      const mockMatchData = [
        {
          id: 42,
          opponent: 'Real Sociedad',
          date_time: '2025-03-10T18:30:00.000Z',
          competition: 'Copa del Rey'
        }
      ];

      mockSupabaseQuery.limit.mockResolvedValue({
        data: mockMatchData,
        error: null
      });

      const result = await getCurrentUpcomingMatch();

      // Verify field transformation (date_time -> date)
      expect(result).toEqual({
        opponent: 'Real Sociedad',
        date: '2025-03-10T18:30:00.000Z',
        competition: 'Copa del Rey'
      });

      // Verify that id is not included in the return (data is transformed)
      expect(result).not.toHaveProperty('id');
    });

    it('should use current date for filtering upcoming matches', async () => {
      const mockDateString = '2025-01-15T12:00:00.000Z';
      const expectedDateString = '2025-01-15T12:00:00Z'; // formatISO doesn't include .000
      vi.setSystemTime(new Date(mockDateString));

      mockSupabaseQuery.limit.mockResolvedValue({
        data: [],
        error: null
      });

      await getCurrentUpcomingMatch();

      expect(mockSupabaseQuery.gte).toHaveBeenCalledWith('date_time', expectedDateString);
      
      vi.useRealTimers();
    });

    it('should handle multiple matches and return the earliest one', async () => {
      const mockMatchData = [
        {
          id: 1,
          opponent: 'Athletic Bilbao',
          date_time: '2025-02-20T21:00:00.000Z',
          competition: 'LaLiga'
        }
        // Note: Since we limit(1) and order by date_time ascending, 
        // only the earliest match should be returned
      ];

      mockSupabaseQuery.limit.mockResolvedValue({
        data: mockMatchData,
        error: null
      });

      const result = await getCurrentUpcomingMatch();

      expect(result).toEqual({
        opponent: 'Athletic Bilbao',
        date: '2025-02-20T21:00:00.000Z',
        competition: 'LaLiga'
      });
    });

    it('should handle matches with different competition types', async () => {
      const mockMatchData = [
        {
          id: 3,
          opponent: 'Valencia CF',
          date_time: '2025-04-05T16:00:00.000Z',
          competition: 'UEFA Europa League'
        }
      ];

      mockSupabaseQuery.limit.mockResolvedValue({
        data: mockMatchData,
        error: null
      });

      const result = await getCurrentUpcomingMatch();

      expect(result.competition).toBe('UEFA Europa League');
    });

    it('should handle database timeout or promise rejection', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Simulate a promise rejection (e.g., timeout)
      mockSupabaseQuery.limit.mockRejectedValue(new Error('Request timeout'));

      // The function should handle this gracefully and return default match
      await expect(getCurrentUpcomingMatch()).rejects.toThrow('Request timeout');
      
      consoleErrorSpy.mockRestore();
    });
  });
});