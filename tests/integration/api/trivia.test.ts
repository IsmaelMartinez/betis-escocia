/* eslint-disable @typescript-eslint/no-explicit-any */
/**
 * Comprehensive integration tests for Trivia API endpoints
 * Tests both GET and POST endpoints with authentication, scoring, and error scenarios
 * Target: 90% coverage for API routes
 */

// Mock Next.js server utilities first
jest.mock('next/server', () => ({
  NextResponse: {
    json: jest.fn((data, options) => ({
      json: async () => data,
      status: options?.status || 200,
      ...options
    })),
  },
}));

// Mock Clerk server utilities
jest.mock('@clerk/nextjs/server', () => ({
  getAuth: jest.fn(),
}));

// Mock Supabase functions
jest.mock('@/lib/supabase', () => ({
  supabase: {
    from: jest.fn(),
  },
  createUserTriviaScore: jest.fn(),
  getUserDailyTriviaScore: jest.fn(),
  getAuthenticatedSupabaseClient: jest.fn(),
}));

import { GET as getTriviaQuestions, POST as postTriviaScore } from '@/app/api/trivia/route';
import { supabase, createUserTriviaScore, getUserDailyTriviaScore, getAuthenticatedSupabaseClient } from '@/lib/supabase';
import { getAuth } from '@clerk/nextjs/server';
import { NextRequest } from 'next/server';

const mockSupabase = jest.mocked(supabase);
const mockCreateUserTriviaScore = jest.mocked(createUserTriviaScore);
const mockGetUserDailyTriviaScore = jest.mocked(getUserDailyTriviaScore);
const mockGetAuthenticatedSupabaseClient = jest.mocked(getAuthenticatedSupabaseClient);
const mockGetAuth = jest.mocked(getAuth);

// Mock data
const mockTriviaQuestions = [
  {
    id: 'q1',
    question_text: 'What is the capital of Real Betis home city?',
    category: 'Geography',
    difficulty: 'easy',
    trivia_answers: [
      { id: 'a1', answer_text: 'Seville', is_correct: true },
      { id: 'a2', answer_text: 'Madrid', is_correct: false },
      { id: 'a3', answer_text: 'Barcelona', is_correct: false },
      { id: 'a4', answer_text: 'Valencia', is_correct: false }
    ]
  },
  {
    id: 'q2',
    question_text: 'In what year was Real Betis founded?',
    category: 'Sports',
    difficulty: 'medium',
    trivia_answers: [
      { id: 'a5', answer_text: '1907', is_correct: true },
      { id: 'a6', answer_text: '1905', is_correct: false },
      { id: 'a7', answer_text: '1910', is_correct: false },
      { id: 'a8', answer_text: '1912', is_correct: false }
    ]
  }
];

const mockUserTriviaScore = {
  id: 'score1',
  user_id: 'user1',
  daily_score: 5,
  timestamp: '2025-07-25T10:00:00Z'
};

describe('/api/trivia - Comprehensive Integration Tests', () => {
  let mockRequest: Partial<NextRequest>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockRequest = {
      json: jest.fn(),
    };
    
    // Setup default mock implementations
    mockGetAuthenticatedSupabaseClient.mockReturnValue({
      from: jest.fn(),
    } as any);
  });

  describe('GET /api/trivia - Fetch Questions', () => {
    describe('Unauthenticated User Scenarios', () => {
      test('should return shuffled questions for unauthenticated user', async () => {
        mockGetAuth.mockReturnValueOnce({ userId: null, getToken: jest.fn() } as any);
        mockSupabase.from.mockReturnValue({
          select: jest.fn().mockReturnThis(),
          limit: jest.fn().mockResolvedValue({ data: mockTriviaQuestions, error: null }),
        } as any);

        const response = await getTriviaQuestions(mockRequest as NextRequest);
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json).toHaveLength(2);
        expect(json[0]).toHaveProperty('question_text');
        expect(json[0]).toHaveProperty('trivia_answers');
        expect(mockSupabase.from).toHaveBeenCalledWith('trivia_questions');
      });

      test('should handle database error for unauthenticated user', async () => {
        mockGetAuth.mockReturnValueOnce({ userId: null, getToken: jest.fn() } as any);
        mockSupabase.from.mockReturnValue({
          select: jest.fn().mockReturnThis(),
          limit: jest.fn().mockResolvedValue({ data: null, error: { message: 'Database connection failed' } }),
        } as any);

        const response = await getTriviaQuestions(mockRequest as NextRequest);
        const json = await response.json();

        expect(response.status).toBe(500);
        expect(json).toEqual({ error: 'Database connection failed' });
      });

      test('should handle unexpected errors for unauthenticated user', async () => {
        mockGetAuth.mockReturnValueOnce({ userId: null, getToken: jest.fn() } as any);
        mockSupabase.from.mockImplementation(() => {
          throw new Error('Unexpected database error');
        });

        const response = await getTriviaQuestions(mockRequest as NextRequest);
        const json = await response.json();

        expect(response.status).toBe(500);
        expect(json).toEqual({ error: 'Internal Server Error' });
      });
    });

    describe('Authenticated User Scenarios', () => {
      test('should return questions for authenticated user who has not played today', async () => {
        const mockGetToken = jest.fn().mockResolvedValue('valid-clerk-token');
        mockGetAuth.mockReturnValueOnce({ userId: 'user1', getToken: mockGetToken } as any);
        mockGetUserDailyTriviaScore.mockResolvedValueOnce({ success: true, data: null });
        mockSupabase.from.mockReturnValue({
          select: jest.fn().mockReturnThis(),
          limit: jest.fn().mockResolvedValue({ data: mockTriviaQuestions, error: null }),
        } as any);

        const response = await getTriviaQuestions(mockRequest as NextRequest);
        const json = await response.json();

        expect(response.status).toBe(200);
        expect(json).toHaveLength(2);
        expect(mockGetUserDailyTriviaScore).toHaveBeenCalledWith('user1', expect.any(Object));
        expect(mockGetToken).toHaveBeenCalled();
      });

      test('should return 403 for authenticated user who has already played today', async () => {
        const mockGetToken = jest.fn().mockResolvedValue('valid-clerk-token');
        mockGetAuth.mockReturnValueOnce({ userId: 'user1', getToken: mockGetToken } as any);
        mockGetUserDailyTriviaScore.mockResolvedValueOnce({ 
          success: true, 
          data: mockUserTriviaScore 
        });

        const response = await getTriviaQuestions(mockRequest as NextRequest);
        const json = await response.json();

        expect(response.status).toBe(403);
        expect(json).toEqual({ 
          message: 'You have already played today.', 
          score: mockUserTriviaScore.daily_score 
        });
      });

      test('should return 401 when Clerk token is null', async () => {
        const mockGetToken = jest.fn().mockResolvedValue(null);
        mockGetAuth.mockReturnValueOnce({ userId: 'user1', getToken: mockGetToken } as any);

        const response = await getTriviaQuestions(mockRequest as NextRequest);
        const json = await response.json();

        expect(response.status).toBe(401);
        expect(json).toEqual({ error: 'Unauthorized: No Clerk token found' });
      });

      test('should handle error when checking daily score fails', async () => {
        const mockGetToken = jest.fn().mockResolvedValue('valid-clerk-token');
        mockGetAuth.mockReturnValueOnce({ userId: 'user1', getToken: mockGetToken } as any);
        mockGetUserDailyTriviaScore.mockResolvedValueOnce({ 
          success: false, 
          error: 'Database error checking score' 
        });

        const response = await getTriviaQuestions(mockRequest as NextRequest);
        const json = await response.json();

        expect(response.status).toBe(500);
        expect(json).toEqual({ error: 'Failed to check daily score' });
      });

      test('should handle database error for authenticated user', async () => {
        const mockGetToken = jest.fn().mockResolvedValue('valid-clerk-token');
        mockGetAuth.mockReturnValueOnce({ userId: 'user1', getToken: mockGetToken } as any);
        mockGetUserDailyTriviaScore.mockResolvedValueOnce({ success: true, data: null });
        mockSupabase.from.mockReturnValue({
          select: jest.fn().mockReturnThis(),
          limit: jest.fn().mockResolvedValue({ data: null, error: { message: 'DB connection lost' } }),
        } as any);

        const response = await getTriviaQuestions(mockRequest as NextRequest);
        const json = await response.json();

        expect(response.status).toBe(500);
        expect(json).toEqual({ error: 'DB connection lost' });
      });

      test('should handle unexpected errors for authenticated user', async () => {
        const mockGetToken = jest.fn().mockResolvedValue('valid-clerk-token');
        mockGetAuth.mockReturnValueOnce({ userId: 'user1', getToken: mockGetToken } as any);
        mockGetUserDailyTriviaScore.mockResolvedValueOnce({ success: true, data: null });
        mockSupabase.from.mockImplementation(() => {
          throw new Error('Unexpected error');
        });

        const response = await getTriviaQuestions(mockRequest as NextRequest);
        const json = await response.json();

        expect(response.status).toBe(500);
        expect(json).toEqual({ error: 'Internal Server Error' });
      });
    });
  });

  describe('POST /api/trivia - Submit Score', () => {
    describe('Authentication Scenarios', () => {
      test('should return 401 for unauthenticated user', async () => {
        mockGetAuth.mockReturnValueOnce({ userId: null, getToken: jest.fn() } as any);
        mockRequest.json = jest.fn().mockResolvedValue({ score: 5 });

        const response = await postTriviaScore(mockRequest as NextRequest);
        const json = await response.json();

        expect(response.status).toBe(401);
        expect(json).toEqual({ error: 'Unauthorized' });
      });

      test('should return 401 when Clerk token is null', async () => {
        const mockGetToken = jest.fn().mockResolvedValue(null);
        mockGetAuth.mockReturnValueOnce({ userId: 'user1', getToken: mockGetToken } as any);
        mockRequest.json = jest.fn().mockResolvedValue({ score: 5 });

        const response = await postTriviaScore(mockRequest as NextRequest);
        const json = await response.json();

        expect(response.status).toBe(401);
        expect(json).toEqual({ error: 'Unauthorized: No Clerk token found' });
      });
    });

    describe('Score Validation Scenarios', () => {
      test('should return 400 for invalid score type (string)', async () => {
        const mockGetToken = jest.fn().mockResolvedValue('valid-clerk-token');
        mockGetAuth.mockReturnValueOnce({ userId: 'user1', getToken: mockGetToken } as any);
        mockRequest.json = jest.fn().mockResolvedValue({ score: 'invalid' });

        const response = await postTriviaScore(mockRequest as NextRequest);
        const json = await response.json();

        expect(response.status).toBe(400);
        expect(json).toEqual({ error: 'Invalid score provided' });
      });

      test('should return 400 for missing score', async () => {
        const mockGetToken = jest.fn().mockResolvedValue('valid-clerk-token');
        mockGetAuth.mockReturnValueOnce({ userId: 'user1', getToken: mockGetToken } as any);
        mockRequest.json = jest.fn().mockResolvedValue({});

        const response = await postTriviaScore(mockRequest as NextRequest);
        const json = await response.json();

        expect(response.status).toBe(400);
        expect(json).toEqual({ error: 'Invalid score provided' });
      });

      test('should return 400 for null score', async () => {
        const mockGetToken = jest.fn().mockResolvedValue('valid-clerk-token');
        mockGetAuth.mockReturnValueOnce({ userId: 'user1', getToken: mockGetToken } as any);
        mockRequest.json = jest.fn().mockResolvedValue({ score: null });

        const response = await postTriviaScore(mockRequest as NextRequest);
        const json = await response.json();

        expect(response.status).toBe(400);
        expect(json).toEqual({ error: 'Invalid score provided' });
      });
    });

    describe('Score Submission Scenarios', () => {
      test('should successfully save score for authenticated user who has not played today', async () => {
        const mockGetToken = jest.fn().mockResolvedValue('valid-clerk-token');
        mockGetAuth.mockReturnValueOnce({ userId: 'user1', getToken: mockGetToken } as any);
        mockRequest.json = jest.fn().mockResolvedValue({ score: 8 });
        mockGetUserDailyTriviaScore.mockResolvedValueOnce({ success: true, data: null });
        mockCreateUserTriviaScore.mockResolvedValueOnce({ success: true, data: mockUserTriviaScore });

        const response = await postTriviaScore(mockRequest as NextRequest);
        const json = await response.json();

        expect(response.status).toBe(201);
        expect(json).toEqual({ message: 'Score saved successfully!' });
        expect(mockCreateUserTriviaScore).toHaveBeenCalledWith(
          { user_id: 'user1', daily_score: 8 },
          expect.any(Object)
        );
      });

      test('should return 409 if user has already submitted score today', async () => {
        const mockGetToken = jest.fn().mockResolvedValue('valid-clerk-token');
        mockGetAuth.mockReturnValueOnce({ userId: 'user1', getToken: mockGetToken } as any);
        mockRequest.json = jest.fn().mockResolvedValue({ score: 8 });
        mockGetUserDailyTriviaScore.mockResolvedValueOnce({ 
          success: true, 
          data: mockUserTriviaScore 
        });

        const response = await postTriviaScore(mockRequest as NextRequest);
        const json = await response.json();

        expect(response.status).toBe(409);
        expect(json).toEqual({ error: 'You have already submitted a score today.' });
        expect(mockCreateUserTriviaScore).not.toHaveBeenCalled();
      });

      test('should handle error when checking existing score fails', async () => {
        const mockGetToken = jest.fn().mockResolvedValue('valid-clerk-token');
        mockGetAuth.mockReturnValueOnce({ userId: 'user1', getToken: mockGetToken } as any);
        mockRequest.json = jest.fn().mockResolvedValue({ score: 8 });
        mockGetUserDailyTriviaScore.mockResolvedValueOnce({ 
          success: false, 
          error: 'Database error checking existing score' 
        });

        const response = await postTriviaScore(mockRequest as NextRequest);
        const json = await response.json();

        expect(response.status).toBe(500);
        expect(json).toEqual({ error: 'Failed to check existing score' });
      });

      test('should handle error when saving score fails', async () => {
        const mockGetToken = jest.fn().mockResolvedValue('valid-clerk-token');
        mockGetAuth.mockReturnValueOnce({ userId: 'user1', getToken: mockGetToken } as any);
        mockRequest.json = jest.fn().mockResolvedValue({ score: 8 });
        mockGetUserDailyTriviaScore.mockResolvedValueOnce({ success: true, data: null });
        mockCreateUserTriviaScore.mockResolvedValueOnce({ 
          success: false, 
          error: 'Database insert failed' 
        });

        const response = await postTriviaScore(mockRequest as NextRequest);
        const json = await response.json();

        expect(response.status).toBe(500);
        expect(json).toEqual({ error: 'Failed to save score' });
      });
    });

    describe('Edge Cases and Boundary Values', () => {
      test('should handle score of 0', async () => {
        const mockGetToken = jest.fn().mockResolvedValue('valid-clerk-token');
        mockGetAuth.mockReturnValueOnce({ userId: 'user1', getToken: mockGetToken } as any);
        mockRequest.json = jest.fn().mockResolvedValue({ score: 0 });
        mockGetUserDailyTriviaScore.mockResolvedValueOnce({ success: true, data: null });
        mockCreateUserTriviaScore.mockResolvedValueOnce({ success: true, data: mockUserTriviaScore });

        const response = await postTriviaScore(mockRequest as NextRequest);
        const json = await response.json();

        expect(response.status).toBe(201);
        expect(json).toEqual({ message: 'Score saved successfully!' });
        expect(mockCreateUserTriviaScore).toHaveBeenCalledWith(
          { user_id: 'user1', daily_score: 0 },
          expect.any(Object)
        );
      });

      test('should handle maximum possible score (10)', async () => {
        const mockGetToken = jest.fn().mockResolvedValue('valid-clerk-token');
        mockGetAuth.mockReturnValueOnce({ userId: 'user1', getToken: mockGetToken } as any);
        mockRequest.json = jest.fn().mockResolvedValue({ score: 10 });
        mockGetUserDailyTriviaScore.mockResolvedValueOnce({ success: true, data: null });
        mockCreateUserTriviaScore.mockResolvedValueOnce({ success: true, data: mockUserTriviaScore });

        const response = await postTriviaScore(mockRequest as NextRequest);
        const json = await response.json();

        expect(response.status).toBe(201);
        expect(json).toEqual({ message: 'Score saved successfully!' });
        expect(mockCreateUserTriviaScore).toHaveBeenCalledWith(
          { user_id: 'user1', daily_score: 10 },
          expect.any(Object)
        );
      });

      test('should handle negative score (edge case)', async () => {
        const mockGetToken = jest.fn().mockResolvedValue('valid-clerk-token');
        mockGetAuth.mockReturnValueOnce({ userId: 'user1', getToken: mockGetToken } as any);
        mockRequest.json = jest.fn().mockResolvedValue({ score: -1 });
        mockGetUserDailyTriviaScore.mockResolvedValueOnce({ success: true, data: null });
        mockCreateUserTriviaScore.mockResolvedValueOnce({ success: true, data: mockUserTriviaScore });

        const response = await postTriviaScore(mockRequest as NextRequest);
        const json = await response.json();

        expect(response.status).toBe(201);
        expect(json).toEqual({ message: 'Score saved successfully!' });
        expect(mockCreateUserTriviaScore).toHaveBeenCalledWith(
          { user_id: 'user1', daily_score: -1 },
          expect.any(Object)
        );
      });

      test('should handle very large score (edge case)', async () => {
        const mockGetToken = jest.fn().mockResolvedValue('valid-clerk-token');
        mockGetAuth.mockReturnValueOnce({ userId: 'user1', getToken: mockGetToken } as any);
        mockRequest.json = jest.fn().mockResolvedValue({ score: 999 });
        mockGetUserDailyTriviaScore.mockResolvedValueOnce({ success: true, data: null });
        mockCreateUserTriviaScore.mockResolvedValueOnce({ success: true, data: mockUserTriviaScore });

        const response = await postTriviaScore(mockRequest as NextRequest);
        const json = await response.json();

        expect(response.status).toBe(201);
        expect(json).toEqual({ message: 'Score saved successfully!' });
        expect(mockCreateUserTriviaScore).toHaveBeenCalledWith(
          { user_id: 'user1', daily_score: 999 },
          expect.any(Object)
        );
      });
    });
  });
});
