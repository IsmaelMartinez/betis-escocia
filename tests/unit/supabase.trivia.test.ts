import { describe, it, expect, beforeEach, vi, type Mock } from 'vitest';
import { createUserTriviaScore, getUserDailyTriviaScore, supabase } from '../../src/lib/supabase';

// Mock the Supabase client
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => {
    const mockSingle = vi.fn();
    const mockLt = vi.fn(() => ({
      single: mockSingle,
    }));
    const mockGte = vi.fn(() => ({
      lt: mockLt,
    }));
    const mockEq = vi.fn(() => ({
      gte: mockGte,
    }));
    const mockSelect = vi.fn(() => ({
      eq: mockEq,
      single: mockSingle, // For cases where select().single() is called directly
    }));
    const mockInsert = vi.fn(() => ({
      select: mockSelect,
    }));
    const mockFrom = vi.fn(() => ({
      insert: mockInsert,
      select: mockSelect,
    }));

    return {
      from: mockFrom,
      // Expose mockSingle for individual test case control
      _mockSingle: mockSingle,
    };
  }),
}));

describe('Trivia Score Supabase Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('createUserTriviaScore', () => {
    it('should successfully create a user trivia score', async () => {
      const mockData = { id: '123', user_id: 'user1', daily_score: 5, timestamp: '2025-07-25T10:00:00Z' };
      (supabase as unknown as { _mockSingle: Mock })._mockSingle.mockResolvedValueOnce({ data: mockData, error: null });

      const result = await createUserTriviaScore({ user_id: 'user1', daily_score: 5 }, supabase as Parameters<typeof createUserTriviaScore>[1]);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
      expect(supabase.from).toHaveBeenCalledWith('user_trivia_scores');
      expect((supabase.from as Mock)().insert).toHaveBeenCalledWith([{ user_id: 'user1', daily_score: 5 }]);
    });

    it('should return an error if score creation fails', async () => {
      const mockError = { message: 'Failed to insert', code: '500' };
      (supabase as unknown as { _mockSingle: Mock })._mockSingle.mockResolvedValueOnce({ data: null, error: mockError });

      const result = await createUserTriviaScore({ user_id: 'user1', daily_score: 5 }, supabase as Parameters<typeof createUserTriviaScore>[1]);

      expect(result.success).toBe(false);
      expect(result.error).toBe(mockError.message);
    });
  });

  describe('getUserDailyTriviaScore', () => {
    it(`should successfully retrieve a user's daily trivia score`, async () => {
      const mockData = { id: '124', user_id: 'user1', daily_score: 3, timestamp: '2025-07-25T10:00:00Z' };
      (supabase as unknown as { _mockSingle: Mock })._mockSingle.mockResolvedValueOnce({ data: mockData, error: null });

      const result = await getUserDailyTriviaScore('user1', supabase as Parameters<typeof getUserDailyTriviaScore>[1]);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
      expect(supabase.from).toHaveBeenCalledWith('user_trivia_scores');
      expect((supabase.from as Mock)().select).toHaveBeenCalledWith('id, daily_score, timestamp');
      expect((supabase.from as Mock)().select().eq).toHaveBeenCalledWith('user_id', 'user1');
    });

    it('should return null data if no score is found (PGRST116)', async () => {
      const mockError = { message: 'No rows found', code: 'PGRST116' };
      (supabase as unknown as { _mockSingle: Mock })._mockSingle.mockResolvedValueOnce({ data: null, error: mockError });

      const result = await getUserDailyTriviaScore('user1', supabase as Parameters<typeof getUserDailyTriviaScore>[1]);

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });

    it('should return an error if score retrieval fails for other reasons', async () => {
      const mockError = { message: 'Database error', code: '500' };
      (supabase as unknown as { _mockSingle: Mock })._mockSingle.mockResolvedValueOnce({ data: null, error: mockError });

      const result = await getUserDailyTriviaScore('user1', supabase as Parameters<typeof getUserDailyTriviaScore>[1]);

      expect(result.success).toBe(false);
      expect(result.error).toBe(mockError.message);
    });
  });
});
