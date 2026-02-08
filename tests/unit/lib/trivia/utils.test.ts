import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  checkDailyPlayStatus,
  validateTriviaScore,
  calculateTriviaPoints,
  formatTriviaResponse,
  handleTriviaAuthError,
  logTriviaBusinessEvent,
  TriviaError,
  handleTriviaError,
  TriviaPerformanceTracker,
  logTriviaEvent,
  type TriviaQuestion,
  type DailyPlayCheckResult
} from '@/lib/trivia/utils';

// Mock dependencies
vi.mock('@/lib/api/supabase', () => ({
  getUserDailyTriviaScore: vi.fn(),
  SupabaseClient: {}
}));

vi.mock('@/lib/utils/logger', () => ({
  log: {
    error: vi.fn(),
    info: vi.fn(),
    warn: vi.fn(),
    business: vi.fn()
  }
}));

vi.mock('@/lib/standardErrors', () => ({
  StandardErrors: {
    TRIVIA: {
      AUTHENTICATION_REQUIRED: 'Authentication required for trivia',
      DATABASE_CONNECTION_FAILED: 'Database connection failed',
      RATE_LIMITED: 'Rate limit exceeded',
      SCORE_VALIDATION_ERROR: 'Score validation failed',
      ALREADY_PLAYED: 'You have already played today',
      UNEXPECTED_ERROR: 'An unexpected error occurred'
    }
  }
}));

import { getUserDailyTriviaScore } from '@/lib/api/supabase';
import { log } from '@/lib/utils/logger';

describe('Trivia Utils', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('checkDailyPlayStatus', () => {
    const mockUserId = 'user123';
    const mockSupabase = {} as any;

    it('should return hasPlayedToday false when user has not played', async () => {
      (getUserDailyTriviaScore as any).mockResolvedValue({
        success: true,
        data: null,
        error: null
      });

      const result = await checkDailyPlayStatus(mockUserId, mockSupabase);

      expect(result).toEqual({
        hasPlayedToday: false
      });
      expect(getUserDailyTriviaScore).toHaveBeenCalledWith(mockUserId, mockSupabase);
    });

    it('should return hasPlayedToday true with existing score when user has played', async () => {
      const mockScore = { daily_score: 80 };
      (getUserDailyTriviaScore as any).mockResolvedValue({
        success: true,
        data: mockScore,
        error: null
      });

      const result = await checkDailyPlayStatus(mockUserId, mockSupabase);

      expect(result).toEqual({
        hasPlayedToday: true,
        existingScore: 80
      });
      expect(log.info).toHaveBeenCalledWith(
        'User has already played trivia today',
        { userId: mockUserId },
        { score: 80 }
      );
    });

    it('should handle database error from getUserDailyTriviaScore', async () => {
      (getUserDailyTriviaScore as any).mockResolvedValue({
        success: false,
        data: null,
        error: 'Database error'
      });

      const result = await checkDailyPlayStatus(mockUserId, mockSupabase);

      expect(result).toEqual({
        hasPlayedToday: false,
        error: 'Failed to check daily play status'
      });
      expect(log.error).toHaveBeenCalledWith(
        'Failed to check daily trivia score in utility',
        { userId: mockUserId, error: 'Database error' }
      );
    });

    it('should handle unexpected exceptions', async () => {
      (getUserDailyTriviaScore as any).mockRejectedValue(new Error('Unexpected error'));

      const result = await checkDailyPlayStatus(mockUserId, mockSupabase);

      expect(result).toEqual({
        hasPlayedToday: false,
        error: 'Unexpected error during daily play check'
      });
      expect(log.error).toHaveBeenCalledWith(
        'Unexpected error checking daily play status',
        expect.any(Error),
        { userId: mockUserId }
      );
    });
  });

  describe('validateTriviaScore', () => {
    it('should validate correct scores', () => {
      expect(validateTriviaScore(0)).toEqual({ isValid: true });
      expect(validateTriviaScore(50)).toEqual({ isValid: true });
      expect(validateTriviaScore(100)).toEqual({ isValid: true });
    });

    it('should reject non-number scores', () => {
      expect(validateTriviaScore('80' as any)).toEqual({
        isValid: false,
        error: 'Score must be a number'
      });
      expect(validateTriviaScore(null as any)).toEqual({
        isValid: false,
        error: 'Score must be a number'
      });
      expect(validateTriviaScore(undefined as any)).toEqual({
        isValid: false,
        error: 'Score must be a number'
      });
    });

    it('should reject non-integer scores', () => {
      expect(validateTriviaScore(85.5)).toEqual({
        isValid: false,
        error: 'Score must be an integer'
      });
      expect(validateTriviaScore(99.9)).toEqual({
        isValid: false,
        error: 'Score must be an integer'
      });
    });

    it('should reject negative scores', () => {
      expect(validateTriviaScore(-1)).toEqual({
        isValid: false,
        error: 'Score cannot be negative'
      });
      expect(validateTriviaScore(-50)).toEqual({
        isValid: false,
        error: 'Score cannot be negative'
      });
    });

    it('should reject scores over 100', () => {
      expect(validateTriviaScore(101)).toEqual({
        isValid: false,
        error: 'Score cannot exceed 100%'
      });
      expect(validateTriviaScore(150)).toEqual({
        isValid: false,
        error: 'Score cannot exceed 100%'
      });
    });
  });

  describe('calculateTriviaPoints', () => {
    it('should calculate points for valid scores', () => {
      expect(calculateTriviaPoints(0)).toBe(0);
      expect(calculateTriviaPoints(50)).toBe(50);
      expect(calculateTriviaPoints(100)).toBe(100);
    });

    it('should throw error for invalid scores', () => {
      expect(() => calculateTriviaPoints(-1)).toThrow('Invalid score for points calculation: Score cannot be negative');
      expect(() => calculateTriviaPoints(101)).toThrow('Invalid score for points calculation: Score cannot exceed 100%');
      expect(() => calculateTriviaPoints(50.5)).toThrow('Invalid score for points calculation: Score must be an integer');
    });
  });

  describe('formatTriviaResponse', () => {
    it('should format successful responses', () => {
      const data = { score: 80 };
      const result = formatTriviaResponse(data);

      expect(result).toEqual({
        success: true,
        data: { score: 80 }
      });
    });

    it('should format successful responses with explicit success flag', () => {
      const data = { questions: [] };
      const result = formatTriviaResponse(data, true);

      expect(result).toEqual({
        success: true,
        data: { questions: [] }
      });
    });

    it('should format error responses', () => {
      const errorMessage = 'Something went wrong';
      const result = formatTriviaResponse(errorMessage, false);

      expect(result).toEqual({
        success: false,
        error: 'Something went wrong'
      });
    });
  });

  describe('handleTriviaAuthError', () => {
    it('should throw authentication error with user ID', () => {
      expect(() => handleTriviaAuthError('user123')).toThrow('Authentication required for trivia');
      expect(log.warn).toHaveBeenCalledWith('Trivia authentication required', { userId: 'user123' });
    });

    it('should throw authentication error without user ID', () => {
      expect(() => handleTriviaAuthError()).toThrow('Authentication required for trivia');
      expect(log.warn).toHaveBeenCalledWith('Trivia authentication required', { userId: 'none' });
    });
  });

  describe('logTriviaBusinessEvent', () => {
    it('should log business events correctly', () => {
      const data = { score: 80, questionCount: 5 };
      const context = { userId: 'user123' };

      logTriviaBusinessEvent('score_saved', data, context);

      expect(log.business).toHaveBeenCalledWith('trivia_score_saved', data, context);
    });

    it('should log questions retrieved event', () => {
      const data = { questionCount: 5 };
      const context = { userId: 'user456' };

      logTriviaBusinessEvent('questions_retrieved', data, context);

      expect(log.business).toHaveBeenCalledWith('trivia_questions_retrieved', data, context);
    });

    it('should log daily check performed event', () => {
      const data = { hasPlayed: false };
      const context = { userId: 'user789' };

      logTriviaBusinessEvent('daily_check_performed', data, context);

      expect(log.business).toHaveBeenCalledWith('trivia_daily_check_performed', data, context);
    });
  });

  describe('TriviaError', () => {
    it('should create TriviaError with all properties', () => {
      const context = { userId: 'user123', action: 'submit_score' };
      const error = new TriviaError(
        'VALIDATION_ERROR',
        'Score validation failed',
        'Invalid score provided',
        400,
        context
      );

      expect(error.name).toBe('TriviaError');
      expect(error.type).toBe('VALIDATION_ERROR');
      expect(error.message).toBe('Score validation failed');
      expect(error.userMessage).toBe('Invalid score provided');
      expect(error.statusCode).toBe(400);
      expect(error.context).toEqual({
        ...context,
        timestamp: expect.any(String)
      });
    });

    it('should create TriviaError with default values', () => {
      const error = new TriviaError(
        'DATABASE_ERROR',
        'Database connection failed',
        'Database temporarily unavailable'
      );

      expect(error.statusCode).toBe(500);
      expect(error.context).toEqual({
        timestamp: expect.any(String)
      });
    });

    it('should preserve existing timestamp in context', () => {
      const customTimestamp = '2023-12-01T10:00:00.000Z';
      const context = { userId: 'user123', timestamp: customTimestamp };
      
      const error = new TriviaError(
        'AUTHENTICATION_ERROR',
        'Auth failed',
        'Please log in',
        401,
        context
      );

      expect(error.context.timestamp).toBe(customTimestamp);
    });
  });

  describe('handleTriviaError', () => {
    const baseContext = { userId: 'user123', action: 'submit_score' };
    const operation = 'score_submission';

    it('should handle existing TriviaError instances', () => {
      const originalError = new TriviaError(
        'VALIDATION_ERROR',
        'Original message',
        'Original user message',
        400,
        { userId: 'original_user' }
      );

      const result = handleTriviaError(originalError, baseContext, operation);

      expect(result).toBeInstanceOf(TriviaError);
      expect(result.type).toBe('VALIDATION_ERROR');
      expect(result.message).toBe('Original message');
      expect(result.userMessage).toBe('Original user message');
      expect(result.statusCode).toBe(400);
      expect(result.context).toEqual({
        ...originalError.context,
        ...baseContext,
        operation,
        timestamp: expect.any(String)
      });
    });

    it('should handle database connection errors', () => {
      const dbError = new Error('Connection timeout occurred');
      
      const result = handleTriviaError(dbError, baseContext, operation);

      expect(result.type).toBe('DATABASE_ERROR');
      expect(result.statusCode).toBe(503);
      expect(result.userMessage).toBe('Database connection failed');
      expect(result.message).toContain('Database connection failed during score_submission');
    });

    it('should handle authentication errors', () => {
      const authError = new Error('Unauthorized access token');
      
      const result = handleTriviaError(authError, baseContext, operation);

      expect(result.type).toBe('AUTHENTICATION_ERROR');
      expect(result.statusCode).toBe(401);
      expect(result.userMessage).toBe('Authentication required for trivia');
    });

    it('should handle rate limiting errors', () => {
      const rateLimitError = new Error('Too many requests from this IP');
      
      const result = handleTriviaError(rateLimitError, baseContext, operation);

      expect(result.type).toBe('RATE_LIMIT_ERROR');
      expect(result.statusCode).toBe(429);
      expect(result.userMessage).toBe('Rate limit exceeded');
    });

    it('should handle validation errors', () => {
      const validationError = new Error('Invalid score format provided');
      
      const result = handleTriviaError(validationError, baseContext, operation);

      expect(result.type).toBe('VALIDATION_ERROR');
      expect(result.statusCode).toBe(400);
      expect(result.userMessage).toBe('Score validation failed');
    });

    it('should handle business logic errors', () => {
      const businessError = new Error('User has already played today');
      
      const result = handleTriviaError(businessError, baseContext, operation);

      expect(result.type).toBe('BUSINESS_LOGIC_ERROR');
      expect(result.statusCode).toBe(409);
      expect(result.userMessage).toBe('You have already played today');
    });

    it('should handle unexpected errors', () => {
      const unexpectedError = new Error('Some unknown error');
      
      const result = handleTriviaError(unexpectedError, baseContext, operation);

      expect(result.type).toBe('UNEXPECTED_ERROR');
      expect(result.statusCode).toBe(500);
      expect(result.userMessage).toBe('An unexpected error occurred');
    });

    it('should handle non-Error objects', () => {
      const stringError = 'Something went wrong';
      
      const result = handleTriviaError(stringError, baseContext, operation);

      expect(result.type).toBe('UNEXPECTED_ERROR');
      expect(result.message).toContain('Unexpected error during score_submission: Something went wrong');
    });
  });

  describe('TriviaPerformanceTracker', () => {
    beforeEach(() => {
      // Mock performance.now()
      vi.spyOn(performance, 'now')
        .mockReturnValueOnce(1000) // constructor
        .mockReturnValueOnce(1250); // complete()
    });

    it('should track operation performance', () => {
      const context = { userId: 'user123', action: 'submit_score' };
      const tracker = new TriviaPerformanceTracker('score_submission', context);

      const duration = tracker.complete(true, { score: 80 });

      expect(duration).toBe(250);
      expect(log.info).toHaveBeenCalledWith(
        'Trivia operation completed: score_submission',
        {
          operation: 'score_submission',
          duration: 250,
          success: true,
          userId: 'user123',
          action: 'submit_score',
          score: 80
        }
      );
    });

    it('should log database queries', () => {
      const context = { userId: 'user123' };
      const tracker = new TriviaPerformanceTracker('get_questions', context);

      tracker.logDbQuery('SELECT questions', 50);

      expect(log.info).toHaveBeenCalledWith(
        'Trivia DB Query: SELECT questions',
        {
          operation: 'get_questions',
          queryType: 'SELECT questions',
          duration: 50,
          userId: 'user123'
        }
      );
    });

    it('should log failed operations', () => {
      const context = { userId: 'user123' };
      const tracker = new TriviaPerformanceTracker('score_submission', context);

      tracker.complete(false);

      expect(log.error).toHaveBeenCalledWith(
        'Trivia operation failed: score_submission',
        expect.objectContaining({
          operation: 'score_submission',
          success: false,
          userId: 'user123'
        })
      );
    });

    it('should complete operations and return duration', () => {
      const tracker = new TriviaPerformanceTracker('test_operation');
      const duration = tracker.complete(true);
      
      expect(typeof duration).toBe('number');
      expect(duration).toBeGreaterThanOrEqual(0);
      expect(log.info).toHaveBeenCalled();
    });
  });

  describe('logTriviaEvent', () => {
    it('should log events with system context', () => {
      const data = { score: 80, questions: 5 };
      const context = { userId: 'user123', action: 'submit_score', requestId: 'req123' };

      logTriviaEvent('info', 'Score submitted successfully', data, context);

      expect(log.info).toHaveBeenCalledWith(
        'Score submitted successfully',
        {
          system: 'trivia',
          timestamp: expect.any(String),
          userId: 'user123',
          action: 'submit_score',
          requestId: 'req123',
          score: 80,
          questions: 5
        },
        { userId: 'user123' }
      );
    });

    it('should log error events', () => {
      const data = { error: 'Database connection failed' };
      const context = { userId: 'user456' };

      logTriviaEvent('error', 'Database error occurred', data, context);

      expect(log.error).toHaveBeenCalledWith(
        'Database error occurred',
        expect.objectContaining({
          system: 'trivia',
          error: 'Database connection failed'
        }),
        { userId: 'user456' }
      );
    });

    it('should log warning events', () => {
      logTriviaEvent('warn', 'Slow operation detected');

      expect(log.warn).toHaveBeenCalledWith(
        'Slow operation detected',
        expect.objectContaining({
          system: 'trivia'
        }),
        { userId: undefined }
      );
    });
  });

  describe('Type Definitions', () => {
    it('should properly type TriviaQuestion', () => {
      const question: TriviaQuestion = {
        id: 'q1',
        question_text: '¿Cuál es el estadio del Real Betis?',
        category: 'betis',
        difficulty: 'easy',
        trivia_answers: [
          {
            id: 'a1',
            answer_text: 'Benito Villamarín',
            is_correct: true
          }
        ]
      };

      expect(question.id).toBe('q1');
      expect(question.trivia_answers).toHaveLength(1);
      expect(question.trivia_answers[0].is_correct).toBe(true);
    });

    it('should properly type DailyPlayCheckResult', () => {
      const result: DailyPlayCheckResult = {
        hasPlayedToday: true,
        existingScore: 80,
        error: undefined
      };

      expect(result.hasPlayedToday).toBe(true);
      expect(result.existingScore).toBe(80);
    });
  });
});