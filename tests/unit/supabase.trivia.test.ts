import { createUserTriviaScore, getUserDailyTriviaScore, supabase } from '../../src/lib/supabase';

// Mock the Supabase client
jest.mock('@supabase/supabase-js', () => ({
  createClient: jest.fn(() => {
    const mockSingle = jest.fn();
    const mockLt = jest.fn(() => ({
      single: mockSingle,
    }));
    const mockGte = jest.fn(() => ({
      lt: mockLt,
    }));
    const mockEq = jest.fn(() => ({
      gte: mockGte,
    }));
    const mockSelect = jest.fn(() => ({
      eq: mockEq,
      single: mockSingle, // For cases where select().single() is called directly
    }));
    const mockInsert = jest.fn(() => ({
      select: mockSelect,
    }));
    const mockFrom = jest.fn(() => ({
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
    jest.clearAllMocks();
  });

  describe('createUserTriviaScore', () => {
    it('should successfully create a user trivia score', async () => {
      const mockData = { id: '123', user_id: 'user1', daily_score: 5, timestamp: '2025-07-25T10:00:00Z' };
      (supabase as any)._mockSingle.mockResolvedValueOnce({ data: mockData, error: null });

      const result = await createUserTriviaScore({ user_id: 'user1', daily_score: 5 }, supabase as any);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
      expect(supabase.from).toHaveBeenCalledWith('user_trivia_scores');
      expect((supabase.from as jest.Mock)().insert).toHaveBeenCalledWith([{ user_id: 'user1', daily_score: 5 }]);
    });

    it('should return an error if score creation fails', async () => {
      const mockError = { message: 'Failed to insert', code: '500' };
      (supabase as any)._mockSingle.mockResolvedValueOnce({ data: null, error: mockError });

      const result = await createUserTriviaScore({ user_id: 'user1', daily_score: 5 }, supabase as any);

      expect(result.success).toBe(false);
      expect(result.error).toBe(mockError.message);
    });
  });

  describe('getUserDailyTriviaScore', () => {
    it(`should successfully retrieve a user's daily trivia score`, async () => {
      const mockData = { id: '124', user_id: 'user1', daily_score: 3, timestamp: '2025-07-25T10:00:00Z' };
      (supabase as any)._mockSingle.mockResolvedValueOnce({ data: mockData, error: null });

      const result = await getUserDailyTriviaScore('user1', supabase as any);

      expect(result.success).toBe(true);
      expect(result.data).toEqual(mockData);
      expect(supabase.from).toHaveBeenCalledWith('user_trivia_scores');
      expect((supabase.from as jest.Mock)().select).toHaveBeenCalledWith('*');
      expect((supabase.from as jest.Mock)().select().eq).toHaveBeenCalledWith('user_id', 'user1');
    });

    it('should return null data if no score is found (PGRST116)', async () => {
      const mockError = { message: 'No rows found', code: 'PGRST116' };
      (supabase as any)._mockSingle.mockResolvedValueOnce({ data: null, error: mockError });

      const result = await getUserDailyTriviaScore('user1', supabase as any);

      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });

    it('should return an error if score retrieval fails for other reasons', async () => {
      const mockError = { message: 'Database error', code: '500' };
      (supabase as any)._mockSingle.mockResolvedValueOnce({ data: null, error: mockError });

      const result = await getUserDailyTriviaScore('user1', supabase as any);

      expect(result.success).toBe(false);
      expect(result.error).toBe(mockError.message);
    });
  });
});
