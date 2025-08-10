/* eslint-disable @typescript-eslint/no-explicit-any */
// Mock Next.js server utilities first
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((data, options) => ({
      json: async () => data,
      status: options?.status || 200,
    })),
  },
}));

// Mock Clerk server utilities
vi.mock('@clerk/nextjs/server', () => ({
  getAuth: vi.fn(),
}));

// Mock Supabase functions
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(),
  },
  createUserTriviaScore: vi.fn(),
  getUserDailyTriviaScore: vi.fn(),
  getAuthenticatedSupabaseClient: vi.fn(() => ({
    from: vi.fn(),
  })),
}));

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { GET as getTriviaQuestions, POST as postTriviaScore } from '@/app/api/trivia/route';
import { GET as getTotalScoreDashboard } from '@/app/api/trivia/total-score-dashboard/route';
import { supabase, createUserTriviaScore, getUserDailyTriviaScore, getAuthenticatedSupabaseClient } from '@/lib/supabase';
import { getAuth } from '@clerk/nextjs/server';

const mockSupabase = vi.mocked(supabase);
const mockCreateUserTriviaScore = vi.mocked(createUserTriviaScore);
const mockGetUserDailyTriviaScore = vi.mocked(getUserDailyTriviaScore);
const mockGetAuthenticatedSupabaseClient = vi.mocked(getAuthenticatedSupabaseClient);
const mockGetAuth = vi.mocked(getAuth);

describe('/api/trivia', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('GET /api/trivia', () => {
    test('should return questions for unauthenticated user', async () => {
      mockGetAuth.mockReturnValueOnce({ userId: null, getToken: vi.fn() } as any);
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [{ id: 'q1', question_text: 'Q1', trivia_answers: [] }], error: null }),
      } as any);

      const response = await getTriviaQuestions({} as any);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'q1' })]));
      expect(mockSupabase.from).toHaveBeenCalledWith('trivia_questions');
    });

    test('should return questions for authenticated user who has not played today', async () => {
      mockGetAuth.mockReturnValueOnce({ userId: 'user1', getToken: vi.fn().mockResolvedValue('mock-token') } as any);
      mockGetUserDailyTriviaScore.mockResolvedValueOnce({ success: true, data: null });
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: [{ id: 'q1', question_text: 'Q1', trivia_answers: [] }], error: null }),
      } as any);

      const response = await getTriviaQuestions({} as any);
      const json = await response.json();

      expect(response.status).toBe(200);
      expect(json).toEqual(expect.arrayContaining([expect.objectContaining({ id: 'q1' })]));
      expect(mockGetUserDailyTriviaScore).toHaveBeenCalledWith('user1', expect.any(Object));
    });

    test('should return 403 for authenticated user who has already played today', async () => {
      mockGetAuth.mockReturnValueOnce({ userId: 'user1', getToken: vi.fn().mockResolvedValue('mock-token') } as any);
      mockGetUserDailyTriviaScore.mockResolvedValueOnce({ success: true, data: { id: 's1', user_id: 'user1', daily_score: 3, timestamp: new Date().toISOString() } });

      const response = await getTriviaQuestions({} as any);
      const json = await response.json();

      expect(response.status).toBe(403);
      expect(json).toEqual({ message: 'You have already played today.', score: 3 });
      expect(mockGetUserDailyTriviaScore).toHaveBeenCalledWith('user1', expect.any(Object));
    });

    test('should return 500 if fetching questions fails', async () => {
      mockGetAuth.mockReturnValueOnce({ userId: null, getToken: vi.fn() } as any);
      mockSupabase.from.mockReturnValue({
        select: vi.fn().mockReturnThis(),
        limit: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB Error' } }),
      } as any);

      const response = await getTriviaQuestions({} as any);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json).toEqual({ error: 'DB Error' });
    });
  });

  describe('POST /api/trivia', () => {
    test('should return 401 for unauthenticated user', async () => {
      mockGetAuth.mockReturnValueOnce({ userId: null, getToken: vi.fn() } as any);

      const response = await postTriviaScore({ json: () => Promise.resolve({ score: 5 }) } as any);
      const json = await response.json();

      expect(response.status).toBe(401);
      expect(json).toEqual({ error: 'Unauthorized' });
    });

    test('should return 400 for invalid score', async () => {
      mockGetAuth.mockReturnValueOnce({ userId: 'user1', getToken: vi.fn().mockResolvedValue('mock-token') } as any);

      const response = await postTriviaScore({ json: () => Promise.resolve({ score: 'invalid' }) } as any);
      const json = await response.json();

      expect(response.status).toBe(400);
      expect(json).toEqual({ error: 'Invalid score provided' });
    });

    test('should return 409 if user has already submitted score today', async () => {
      mockGetAuth.mockReturnValueOnce({ userId: 'user1', getToken: vi.fn().mockResolvedValue('mock-token') } as any);
      mockGetUserDailyTriviaScore.mockResolvedValueOnce({ success: true, data: { id: 's1', user_id: 'user1', daily_score: 2, timestamp: new Date().toISOString() } });

      const response = await postTriviaScore({ json: () => Promise.resolve({ score: 5 }) } as any);
      const json = await response.json();

      expect(response.status).toBe(409);
      expect(json).toEqual({ error: 'You have already submitted a score today.' });
    });

    test('should successfully save score for authenticated user who has not played today', async () => {
      mockGetAuth.mockReturnValueOnce({ userId: 'user1', getToken: vi.fn().mockResolvedValue('mock-token') } as any);
      mockGetUserDailyTriviaScore.mockResolvedValueOnce({ success: true, data: null });
      mockCreateUserTriviaScore.mockResolvedValueOnce({ success: true, data: { id: 's1', user_id: 'user1', daily_score: 5, timestamp: new Date().toISOString() } });

      const response = await postTriviaScore({ json: () => Promise.resolve({ score: 5 }) } as any);
      const json = await response.json();

      expect(response.status).toBe(201);
      expect(json).toEqual({ message: 'Score saved successfully!' });
      expect(mockCreateUserTriviaScore).toHaveBeenCalledWith({ user_id: 'user1', daily_score: 5 }, expect.any(Object));
    });

    test('should return 500 if saving score fails', async () => {
      mockGetAuth.mockReturnValueOnce({ userId: 'user1', getToken: vi.fn().mockResolvedValue('mock-token') } as any);
      mockGetUserDailyTriviaScore.mockResolvedValueOnce({ success: true, data: null });
      mockCreateUserTriviaScore.mockResolvedValueOnce({ success: false, error: 'Save Error' });

      const response = await postTriviaScore({ json: () => Promise.resolve({ score: 5 }) } as any);
      const json = await response.json();

      expect(response.status).toBe(500);
      expect(json).toEqual({ error: 'Failed to save score' });
    });
  });
});

describe('/api/trivia/total-score-dashboard', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  test('should return 401 for unauthenticated user', async () => {
    mockGetAuth.mockReturnValueOnce({ userId: null, getToken: vi.fn() } as any);

    const response = await getTotalScoreDashboard({} as any);
    const json = await response.json();

    expect(response.status).toBe(401);
    expect(json).toEqual({ error: 'Unauthorized' });
  });

  test('should return total score for authenticated user', async () => {
    mockGetAuth.mockReturnValueOnce({ userId: 'user1', getToken: vi.fn().mockResolvedValue('mock-token') } as any);
    mockGetAuthenticatedSupabaseClient.mockReturnValue({
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: [{ daily_score: 2 }, { daily_score: 3 }], error: null }),
      })),
    } as any);

    const response = await getTotalScoreDashboard({} as any);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({ totalScore: 5 });
    expect(mockGetAuthenticatedSupabaseClient).toHaveBeenCalledWith('mock-token');
  });

  test('should return 0 if no scores found for authenticated user', async () => {
    mockGetAuth.mockReturnValueOnce({ userId: 'user1', getToken: vi.fn().mockResolvedValue('mock-token') } as any);
    mockGetAuthenticatedSupabaseClient.mockReturnValue({
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: [], error: null }),
      })),
    } as any);

    const response = await getTotalScoreDashboard({} as any);
    const json = await response.json();

    expect(response.status).toBe(200);
    expect(json).toEqual({ totalScore: 0 });
  });

  test('should return 500 if fetching total score fails', async () => {
    mockGetAuth.mockReturnValueOnce({ userId: 'user1', getToken: vi.fn().mockResolvedValue('mock-token') } as any);
    mockGetAuthenticatedSupabaseClient.mockReturnValue({
      from: vi.fn(() => ({
        select: vi.fn().mockReturnThis(),
        eq: vi.fn().mockResolvedValue({ data: null, error: { message: 'DB Error' } }),
      })),
    } as any);

    const response = await getTotalScoreDashboard({} as any);
    const json = await response.json();

    expect(response.status).toBe(500);
    expect(json).toEqual({ error: 'Failed to fetch total score' });
  });
});
