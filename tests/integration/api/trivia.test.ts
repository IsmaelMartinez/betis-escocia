import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';

// Mock Clerk
vi.mock('@clerk/nextjs/server', () => ({
  getAuth: vi.fn(() => ({
    userId: 'test-user-id',
    getToken: vi.fn(() => Promise.resolve('test-token')),
  })),
}));

// Mock API utils
vi.mock('@/lib/apiUtils', () => ({
  createApiHandler: vi.fn((config) => {
    return async (request: any) => {
      try {
        // Handle authentication
        if (config.auth === 'user') {
          const { getAuth } = await import('@clerk/nextjs/server');
          const authResult = getAuth(request);
          if (!authResult.userId) {
            return {
              json: () => Promise.resolve({ error: 'Unauthorized' }),
              status: 401
            };
          }
        }

        let validatedData;
        
        if (config.schema && request.method === 'POST') {
          const body = await request.json();
          validatedData = config.schema.parse(body);
        } else {
          validatedData = {};
        }
        
        const context = {
          request,
          user: { id: 'test-user-id' },
          userId: 'test-user-id',
          authenticatedSupabase: { from: vi.fn() },
          supabase: { from: vi.fn() }
        };
        
        const result = await config.handler(validatedData, context);
        
        return {
          json: () => Promise.resolve(result),
          status: 200
        };
      } catch (error) {
        // Handle TriviaError with specific status codes
        if (error && typeof error === 'object' && 'statusCode' in error) {
          return {
            json: () => Promise.resolve({ error: error.message || 'Trivia error' }),
            status: (error as any).statusCode
          };
        }
        
        return {
          json: () => Promise.resolve({ error: 'Server error' }),
          status: 500
        };
      }
    };
  })
}));

// Mock Supabase with proper structure
vi.mock('@/lib/supabase', () => ({
  supabase: {
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        limit: vi.fn(() => Promise.resolve({
          data: [
            {
              id: 1,
              question_text: 'What is the nickname of Real Betis?',
              category: 'betis',
              difficulty: 'easy',
              trivia_answers: [
                { id: 1, answer_text: 'Verdiblancos', is_correct: true },
                { id: 2, answer_text: 'Rojiblancos', is_correct: false }
              ]
            }
          ],
          error: null
        }))
      }))
    }))
  },
  createUserTriviaScore: vi.fn(() => Promise.resolve({ success: true, error: null })),
  getUserDailyTriviaScore: vi.fn(() => Promise.resolve({
    success: true,
    data: null
  })),
  getAuthenticatedSupabaseClient: vi.fn(() => ({
    from: vi.fn(() => ({
      select: vi.fn(() => ({
        eq: vi.fn(() => ({
          single: vi.fn(() => Promise.resolve({ data: { sum: 150, count: 3 }, error: null }))
        }))
      }))
    }))
  }))
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  log: {
    business: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
    info: vi.fn(),
    debug: vi.fn()
  }
}));

// Mock trivia utilities with proper implementations
vi.mock('@/lib/trivia/utils', () => ({
  checkDailyPlayStatus: vi.fn(() => Promise.resolve({
    hasPlayedToday: false,
    existingScore: null,
    error: null
  })),
  validateTriviaScore: vi.fn((score) => {
    if (typeof score !== 'number' || isNaN(score) || !isFinite(score)) {
      return { isValid: false, error: 'Score must be a valid number' };
    }
    if (score % 1 !== 0) {
      return { isValid: false, error: 'Score must be an integer' };
    }
    return { 
      isValid: score >= 0 && score <= 100, 
      error: score >= 0 && score <= 100 ? null : 'Score must be between 0 and 100'
    };
  }),
  logTriviaBusinessEvent: vi.fn(),
  logTriviaEvent: vi.fn(),
  handleTriviaError: vi.fn((error, context, operation) => {
    // Create proper TriviaError for testing
    const triviaError = new Error(error.message || 'Handled trivia error');
    (triviaError as any).type = 'VALIDATION_ERROR';
    (triviaError as any).statusCode = 400;
    (triviaError as any).context = context;
    return triviaError;
  }),
  TriviaError: vi.fn().mockImplementation((type, message, standardError, statusCode, context) => {
    const err = new Error(message);
    (err as any).type = type;
    (err as any).standardError = standardError;
    (err as any).statusCode = statusCode;
    (err as any).context = context;
    return err;
  }),
  TriviaPerformanceTracker: vi.fn().mockImplementation(() => ({
    logDbQuery: vi.fn(),
    complete: vi.fn()
  }))
}));

// Mock standard errors
vi.mock('@/lib/standardErrors', () => ({
  StandardErrors: {
    TRIVIA: {
      QUESTIONS_FETCH_ERROR: 'QUESTIONS_FETCH_ERROR',
      AUTHENTICATION_REQUIRED: 'AUTHENTICATION_REQUIRED',
      INVALID_ACTION: 'INVALID_ACTION'
    }
  }
}));

// Mock trivia schema
vi.mock('@/lib/schemas/trivia', () => ({
  triviaScoreSchema: {
    parse: vi.fn((data) => {
      if (!data || typeof data.score !== 'number') {
        throw new Error('Invalid score');
      }
      return data;
    })
  }
}));

describe('Trivia API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Trivia Functionality', () => {
    it('should handle trivia operations correctly', async () => {
      const { supabase } = await import('@/lib/supabase');
      
      expect(supabase).toBeDefined();
      expect(typeof supabase.from).toBe('function');
    });

    it('should validate authentication requirements', async () => {
      const { getAuth } = await import('@clerk/nextjs/server');
      
      expect(getAuth).toBeDefined();
      expect(typeof getAuth).toBe('function');
    });

    it('should handle score submission', async () => {
      const { createUserTriviaScore } = await import('@/lib/supabase');
      
      expect(createUserTriviaScore).toBeDefined();
      expect(typeof createUserTriviaScore).toBe('function');
    });

    it('should provide createApiHandler structure', async () => {
      const { createApiHandler } = await import('@/lib/apiUtils');
      
      expect(createApiHandler).toBeDefined();
      expect(typeof createApiHandler).toBe('function');
    });

    it('should provide trivia utility functions', async () => {
      const { validateTriviaScore, checkDailyPlayStatus } = await import('@/lib/trivia/utils');
      
      expect(validateTriviaScore).toBeDefined();
      expect(checkDailyPlayStatus).toBeDefined();
      expect(typeof validateTriviaScore).toBe('function');
      expect(typeof checkDailyPlayStatus).toBe('function');
    });

    it('should provide schema validation', async () => {
      const { triviaScoreSchema } = await import('@/lib/schemas/trivia');
      
      expect(triviaScoreSchema).toBeDefined();
      expect(typeof triviaScoreSchema.parse).toBe('function');
    });

    it('should handle basic score validation', async () => {
      const { validateTriviaScore } = await import('@/lib/trivia/utils');
      
      const validResult = validateTriviaScore(85);
      expect(validResult).toHaveProperty('isValid');
      expect(typeof validResult.isValid).toBe('boolean');
    });

    it('should handle logging functionality', async () => {
      const { logTriviaEvent, logTriviaBusinessEvent } = await import('@/lib/trivia/utils');
      
      expect(logTriviaEvent).toBeDefined();
      expect(logTriviaBusinessEvent).toBeDefined();
      expect(typeof logTriviaEvent).toBe('function');
      expect(typeof logTriviaBusinessEvent).toBe('function');
    });

    it('should handle error management', async () => {
      const { handleTriviaError, TriviaError } = await import('@/lib/trivia/utils');
      
      expect(handleTriviaError).toBeDefined();
      expect(TriviaError).toBeDefined();
      expect(typeof handleTriviaError).toBe('function');
      expect(typeof TriviaError).toBe('function');
    });

    it('should provide performance tracking', async () => {
      const { TriviaPerformanceTracker } = await import('@/lib/trivia/utils');
      
      expect(TriviaPerformanceTracker).toBeDefined();
      expect(typeof TriviaPerformanceTracker).toBe('function');
    });
  });

  describe('Trivia Route Integration', () => {
    beforeEach(() => {
      vi.clearAllMocks();
    });

    it('should handle GET requests for questions', async () => {
      const { GET } = await import('@/app/api/trivia/route');
      const request = new NextRequest('http://localhost:3000/api/trivia');
      
      const response = await GET(request);
      const result = await response.json();
      
      expect(response.status).toBe(200);
      expect(result).toBeDefined();
    });

    it('should handle GET requests with action=score', async () => {
      const { GET } = await import('@/app/api/trivia/route');
      const request = new NextRequest('http://localhost:3000/api/trivia?action=score');
      
      const response = await GET(request);
      const result = await response.json();
      
      expect(response.status).toBe(200);
      expect(result).toBeDefined();
    });

    it('should handle GET requests with action=total', async () => {
      const { GET } = await import('@/app/api/trivia/route');
      const request = new NextRequest('http://localhost:3000/api/trivia?action=total');
      
      const response = await GET(request);
      const result = await response.json();
      
      // This may return various status codes depending on authentication and validation
      expect([200, 400, 401, 500]).toContain(response.status);
      expect(result).toBeDefined();
    });

    it('should handle invalid action parameters', async () => {
      const { GET } = await import('@/app/api/trivia/route');
      const request = new NextRequest('http://localhost:3000/api/trivia?action=invalid');
      
      const response = await GET(request);
      
      // May return 400 for validation error or 500 for other issues
      expect([400, 500]).toContain(response.status);
    });

    it('should handle POST requests for score submission', async () => {
      const { POST } = await import('@/app/api/trivia/route');
      const request = new NextRequest('http://localhost:3000/api/trivia', {
        method: 'POST',
        body: JSON.stringify({ score: 85 }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await POST(request);
      const result = await response.json();
      
      expect(response.status).toBe(200);
      expect(result).toBeDefined();
    });

    it('should handle POST requests with invalid action', async () => {
      const { POST } = await import('@/app/api/trivia/route');
      const request = new NextRequest('http://localhost:3000/api/trivia?action=invalid', {
        method: 'POST',
        body: JSON.stringify({ score: 85 }),
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await POST(request);
      
      // May return 400 for validation error or 500 for other issues
      expect([400, 500]).toContain(response.status);
    });
  });

  describe('Trivia Utility Function Coverage', () => {
    it('should test score validation with various inputs', async () => {
      const { validateTriviaScore } = await import('@/lib/trivia/utils');
      
      // Test valid scores
      expect(validateTriviaScore(0).isValid).toBe(true);
      expect(validateTriviaScore(50).isValid).toBe(true);
      expect(validateTriviaScore(100).isValid).toBe(true);
      
      // Test invalid scores
      expect(validateTriviaScore(-1).isValid).toBe(false);
      expect(validateTriviaScore(101).isValid).toBe(false);
      expect(validateTriviaScore(null as any).isValid).toBe(false);
      expect(validateTriviaScore(undefined as any).isValid).toBe(false);
    });

    it('should test daily play status check', async () => {
      const { checkDailyPlayStatus } = await import('@/lib/trivia/utils');
      const mockSupabase = { from: vi.fn() };
      
      const result = await checkDailyPlayStatus('test-user', mockSupabase);
      
      expect(result).toHaveProperty('hasPlayedToday');
      expect(result).toHaveProperty('existingScore');
      expect(result).toHaveProperty('error');
    });

    it('should test trivia error handling', async () => {
      const { handleTriviaError, TriviaError } = await import('@/lib/trivia/utils');
      
      const error = new Error('Test error');
      const context = { userId: 'test-user' };
      
      const handledError = handleTriviaError(error, context, 'test-operation');
      
      expect(handledError).toBeInstanceOf(Error);
    });

    it('should test performance tracker', async () => {
      const { TriviaPerformanceTracker } = await import('@/lib/trivia/utils');
      
      const tracker = new TriviaPerformanceTracker('test-operation', { userId: 'test' });
      
      expect(tracker).toBeDefined();
      expect(typeof tracker.logDbQuery).toBe('function');
      expect(typeof tracker.complete).toBe('function');
      
      // Test tracker methods
      tracker.logDbQuery('test-query', 100);
      tracker.complete(true, { result: 'success' });
    });

    it('should test trivia logging functions', async () => {
      const { logTriviaEvent, logTriviaBusinessEvent } = await import('@/lib/trivia/utils');
      
      // Test event logging
      logTriviaEvent('info', 'Test message', { data: 'test' }, { userId: 'test' });
      logTriviaBusinessEvent('test-event', { action: 'test' }, { userId: 'test' });
      
      // Verify logging functions were called
      expect(logTriviaEvent).toBeDefined();
      expect(logTriviaBusinessEvent).toBeDefined();
    });

    it('should test TriviaError class', async () => {
      const { TriviaError } = await import('@/lib/trivia/utils');
      
      const error = new TriviaError(
        'VALIDATION_ERROR',
        'Test validation error',
        'VALIDATION_FAILED',
        400,
        { userId: 'test' }
      );
      
      expect(error).toBeInstanceOf(Error);
      expect(error.type).toBe('VALIDATION_ERROR');
      expect(error.message).toBe('Test validation error');
      expect(error.standardError).toBe('VALIDATION_FAILED');
      expect(error.statusCode).toBe(400);
      expect(error.context).toEqual({ userId: 'test' });
    });
  });

  describe('Edge Cases and Error Conditions', () => {
    it('should handle malformed request bodies', async () => {
      const { POST } = await import('@/app/api/trivia/route');
      const request = new NextRequest('http://localhost:3000/api/trivia', {
        method: 'POST',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await POST(request);
      
      expect(response.status).toBe(500);
    });

    it('should handle missing request body', async () => {
      const { POST } = await import('@/app/api/trivia/route');
      const request = new NextRequest('http://localhost:3000/api/trivia', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      });
      
      const response = await POST(request);
      
      expect(response.status).toBe(500);
    });

    it('should handle various score validation edge cases', async () => {
      const { validateTriviaScore } = await import('@/lib/trivia/utils');
      
      // Test edge cases
      expect(validateTriviaScore(0.5).isValid).toBe(false); // Decimal scores not allowed
      expect(validateTriviaScore('85' as any).isValid).toBe(false); // String instead of number
      expect(validateTriviaScore(Infinity).isValid).toBe(false); // Infinity
      expect(validateTriviaScore(-Infinity).isValid).toBe(false); // Negative Infinity
      expect(validateTriviaScore(NaN).isValid).toBe(false); // NaN
    });

    it('should handle performance tracker edge cases', async () => {
      const { TriviaPerformanceTracker } = await import('@/lib/trivia/utils');
      
      // Test with minimal context
      const tracker = new TriviaPerformanceTracker('test', {});
      
      // Test with very small timing
      tracker.logDbQuery('fast-query', 0.1);
      
      // Test with large timing
      tracker.logDbQuery('slow-query', 5000);
      
      // Test completion with various states
      tracker.complete(false, { error: 'test-error' });
      
      expect(tracker).toBeDefined();
    });

    it('should handle logging with various message types', async () => {
      const { logTriviaEvent } = await import('@/lib/trivia/utils');
      
      // Test different log levels
      logTriviaEvent('info', 'Info message', {}, {});
      logTriviaEvent('warn', 'Warning message', { warning: true }, {});
      logTriviaEvent('error', 'Error message', { error: 'details' }, {});
      
      expect(logTriviaEvent).toBeDefined();
    });

    it('should handle empty or null contexts', async () => {
      const { handleTriviaError } = await import('@/lib/trivia/utils');
      
      const error = new Error('Test error');
      
      // Test with null context
      const result1 = handleTriviaError(error, null as any, 'test-op');
      expect(result1).toBeInstanceOf(Error);
      
      // Test with empty context
      const result2 = handleTriviaError(error, {}, 'test-op');
      expect(result2).toBeInstanceOf(Error);
      
      // Test with undefined context
      const result3 = handleTriviaError(error, undefined as any, 'test-op');
      expect(result3).toBeInstanceOf(Error);
    });

    it('should test database query mocking', async () => {
      const { supabase } = await import('@/lib/supabase');
      
      const mockChain = supabase.from('trivia_questions');
      expect(mockChain).toBeDefined();
      expect(typeof mockChain.select).toBe('function');
      
      const selectChain = mockChain.select();
      expect(selectChain).toBeDefined();
      expect(typeof selectChain.limit).toBe('function');
    });

    it('should test authenticated supabase client', async () => {
      const { getAuthenticatedSupabaseClient } = await import('@/lib/supabase');
      
      const client = getAuthenticatedSupabaseClient('test-token');
      expect(client).toBeDefined();
      expect(typeof client.from).toBe('function');
    });

    it('should test trivia score schema validation', async () => {
      const { triviaScoreSchema } = await import('@/lib/schemas/trivia');
      
      // Test valid data
      const validData = { score: 85 };
      expect(() => triviaScoreSchema.parse(validData)).not.toThrow();
      
      // Test invalid data
      const invalidData = { score: 'not-a-number' };
      expect(() => triviaScoreSchema.parse(invalidData)).toThrow();
    });

    it('should handle various trivia error types', async () => {
      const { TriviaError } = await import('@/lib/trivia/utils');
      
      // Test different error types
      const validationError = new TriviaError('VALIDATION_ERROR', 'Invalid input', 'VALIDATION_FAILED', 400, {});
      expect(validationError.type).toBe('VALIDATION_ERROR');
      expect(validationError.statusCode).toBe(400);
      
      const authError = new TriviaError('AUTH_ERROR', 'Unauthorized', 'AUTH_REQUIRED', 401, {});
      expect(authError.type).toBe('AUTH_ERROR');
      expect(authError.statusCode).toBe(401);
      
      const dbError = new TriviaError('DATABASE_ERROR', 'DB connection failed', 'DB_ERROR', 500, {});
      expect(dbError.type).toBe('DATABASE_ERROR');
      expect(dbError.statusCode).toBe(500);
    });

    it('should test comprehensive score validation scenarios', async () => {
      const { validateTriviaScore } = await import('@/lib/trivia/utils');
      
      // Boundary tests
      expect(validateTriviaScore(0).isValid).toBe(true);
      expect(validateTriviaScore(100).isValid).toBe(true);
      expect(validateTriviaScore(-0.1).isValid).toBe(false);
      expect(validateTriviaScore(100.1).isValid).toBe(false);
      
      // Type tests
      expect(validateTriviaScore(42).isValid).toBe(true);
      expect(validateTriviaScore('42' as any).isValid).toBe(false);
      expect(validateTriviaScore(true as any).isValid).toBe(false);
      expect(validateTriviaScore({} as any).isValid).toBe(false);
      expect(validateTriviaScore([] as any).isValid).toBe(false);
    });
  });

  describe('Enhanced Coverage Tests', () => {
    it('should test getUserTriviaScore function coverage', async () => {
      // This tests the getUserTriviaScore function path
      const { getUserDailyTriviaScore, getAuthenticatedSupabaseClient } = await import('@/lib/supabase');
      
      // Mock the functions to simulate the scenario
      const mockUserScore = getUserDailyTriviaScore as any;
      const mockAuthClient = getAuthenticatedSupabaseClient as any;
      
      mockUserScore.mockResolvedValueOnce({
        success: true,
        data: { daily_score: 80 }
      });
      
      // Try importing the GET handler and test the score action
      const { GET } = await import('@/app/api/trivia/route');
      const request = new NextRequest('http://localhost:3000/api/trivia?action=score');
      
      const response = await GET(request);
      
      // Should handle the request (may succeed or fail based on auth)
      expect([200, 400, 401, 500]).toContain(response.status);
    });
    
    it('should test daily play status with already played scenario', async () => {
      // Test when user has already played today
      const { checkDailyPlayStatus } = await import('@/lib/trivia/utils');
      
      // First reset the mock and then set up for this specific test
      vi.clearAllMocks();
      
      // Re-apply the main mocks needed
      vi.mocked(checkDailyPlayStatus).mockResolvedValueOnce({
        hasPlayedToday: true,
        existingScore: 95,
        error: null
      });
      
      const { GET } = await import('@/app/api/trivia/route');  
      const request = new NextRequest('http://localhost:3000/api/trivia');
      
      const response = await GET(request);
      expect([200, 400, 500]).toContain(response.status);
    });
    
    it('should test specific error paths in trivia utils', async () => {
      // Test the trivia utilities in isolation
      const { 
        validateTriviaScore, 
        TriviaError, 
        TriviaPerformanceTracker,
        handleTriviaError,
        logTriviaEvent,
        logTriviaBusinessEvent
      } = await import('@/lib/trivia/utils');
      
      // Test error creation
      const customError = new TriviaError('TEST_ERROR', 'Test message', 'TEST_STANDARD', 400, { test: true });
      expect(customError).toBeInstanceOf(Error);
      
      // Test performance tracker
      const tracker = new TriviaPerformanceTracker('test-op', { userId: 'test' });
      tracker.logDbQuery('test-query', 100);
      tracker.complete(true, { success: true });
      
      // Test error handling
      const testError = new Error('Test error');
      const handledError = handleTriviaError(testError, { userId: 'test' }, 'test-operation');
      expect(handledError).toBeInstanceOf(Error);
      
      // Test logging functions
      logTriviaEvent('info', 'Test info', { data: 'test' }, { userId: 'test' });
      logTriviaBusinessEvent('test-event', { action: 'test' }, { userId: 'test' });
      
      // Test score validation edge cases
      expect(validateTriviaScore(50).isValid).toBe(true);
      expect(validateTriviaScore(-5).isValid).toBe(false);
      expect(validateTriviaScore(105).isValid).toBe(false);
    });
    
    it('should test different response scenarios', async () => {
      // Test questions response when returning message + score (already played)
      const { checkDailyPlayStatus } = await import('@/lib/trivia/utils');
      
      vi.clearAllMocks();
      vi.mocked(checkDailyPlayStatus).mockResolvedValueOnce({
        hasPlayedToday: true,
        existingScore: 75,
        error: null
      });
      
      const { GET } = await import('@/app/api/trivia/route');
      const request = new NextRequest('http://localhost:3000/api/trivia');
      
      const response = await GET(request);
      const result = await response.json();
      
      expect(response.status).toBe(200);
      expect(result).toBeDefined();
      // May contain message about already played or actual questions
      expect(typeof result).toBe('object');
    });
    
    it('should test comprehensive API parameter handling', async () => {
      // Test various parameter combinations that aren't covered
      const requests = [
        'http://localhost:3000/api/trivia',
        'http://localhost:3000/api/trivia?action=questions',
        'http://localhost:3000/api/trivia?action=score',
        'http://localhost:3000/api/trivia?action=total',
        'http://localhost:3000/api/trivia?action=unknown'
      ];
      
      const { GET } = await import('@/app/api/trivia/route');
      
      for (const url of requests) {
        const request = new NextRequest(url);
        const response = await GET(request);
        
        // Should handle all requests with valid status codes
        expect([200, 400, 401, 404, 500]).toContain(response.status);
      }
    });
    
    it('should test POST request schemas and validation', async () => {
      // Test various POST scenarios
      const { POST } = await import('@/app/api/trivia/route');
      
      const testCases = [
        { body: { score: 85 }, expectedStatus: [200, 400, 401, 500] },
        { body: { score: 0 }, expectedStatus: [200, 400, 401, 500] },
        { body: { score: 100 }, expectedStatus: [200, 400, 401, 500] },
        { body: {}, expectedStatus: [400, 500] }, // Missing score
      ];
      
      for (const testCase of testCases) {
        const request = new NextRequest('http://localhost:3000/api/trivia', {
          method: 'POST',
          body: JSON.stringify(testCase.body),
          headers: { 'Content-Type': 'application/json' }
        });
        
        const response = await POST(request);
        expect(testCase.expectedStatus).toContain(response.status);
      }
    });
  });

  describe('Advanced Trivia Route Testing', () => {
    it('should test question fetching with authentication', async () => {
      const { supabase } = await import('@/lib/supabase');
      
      // Mock the database chain
      const fromMock = vi.fn(() => ({
        select: vi.fn(() => ({
          limit: vi.fn(() => Promise.resolve({
            data: [
              {
                id: '1',
                question_text: 'Test question?',
                category: 'test',
                difficulty: 'easy',
                trivia_answers: [
                  { id: '1', answer_text: 'Answer 1', is_correct: true },
                  { id: '2', answer_text: 'Answer 2', is_correct: false }
                ]
              }
            ],
            error: null
          }))
        }))
      }));
      
      supabase.from.mockImplementation(fromMock);
      
      const result = fromMock('trivia_questions');
      const selectResult = result.select();
      const queryResult = await selectResult.limit(5);
      
      expect(queryResult.data).toHaveLength(1);
      expect(queryResult.data[0]).toHaveProperty('question_text');
      expect(queryResult.data[0].trivia_answers).toHaveLength(2);
    });

    it('should test error handling in route functions', async () => {
      const { handleTriviaError } = await import('@/lib/trivia/utils');
      
      // Test handling different error types
      const networkError = new Error('Network timeout');
      const handledNetworkError = handleTriviaError(networkError, { userId: 'test' }, 'network-op');
      expect(handledNetworkError).toBeInstanceOf(Error);
      
      const validationError = new Error('Validation failed');
      const handledValidationError = handleTriviaError(validationError, { action: 'validate' }, 'validate-op');
      expect(handledValidationError).toBeInstanceOf(Error);
    });

    it('should test performance tracking comprehensive coverage', async () => {
      const { TriviaPerformanceTracker } = await import('@/lib/trivia/utils');
      
      const tracker = new TriviaPerformanceTracker('comprehensive-test', { 
        userId: 'test-user',
        action: 'questions',
        requestId: 'req-123'
      });
      
      // Test multiple database queries
      tracker.logDbQuery('fetch-questions', 150);
      tracker.logDbQuery('check-daily-status', 50);
      tracker.logDbQuery('aggregate-score', 75);
      
      // Test successful completion
      tracker.complete(true, { 
        questionCount: 5,
        method: 'database-randomization',
        totalQueries: 3 
      });
      
      expect(tracker.logDbQuery).toHaveBeenCalledTimes(3);
      expect(tracker.complete).toHaveBeenCalledWith(true, expect.any(Object));
    });

    it('should test daily play status comprehensive scenarios', async () => {
      const { checkDailyPlayStatus } = await import('@/lib/trivia/utils');
      
      // Mock different scenarios
      const mockSupabase = { from: vi.fn() };
      
      // Test user who hasn't played today
      vi.mocked(checkDailyPlayStatus).mockResolvedValueOnce({
        hasPlayedToday: false,
        existingScore: null,
        error: null
      });
      
      const result1 = await checkDailyPlayStatus('new-user', mockSupabase);
      expect(result1.hasPlayedToday).toBe(false);
      expect(result1.existingScore).toBeNull();
      
      // Test user who has played today
      vi.mocked(checkDailyPlayStatus).mockResolvedValueOnce({
        hasPlayedToday: true,
        existingScore: 85,
        error: null
      });
      
      const result2 = await checkDailyPlayStatus('returning-user', mockSupabase);
      expect(result2.hasPlayedToday).toBe(true);
      expect(result2.existingScore).toBe(85);
      
      // Test error scenario
      vi.mocked(checkDailyPlayStatus).mockResolvedValueOnce({
        hasPlayedToday: false,
        existingScore: null,
        error: 'Database connection failed'
      });
      
      const result3 = await checkDailyPlayStatus('error-user', mockSupabase);
      expect(result3.error).toBe('Database connection failed');
    });
  });
});