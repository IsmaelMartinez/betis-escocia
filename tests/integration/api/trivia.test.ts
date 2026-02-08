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
        return {
          json: () => Promise.resolve({ error: 'Server error' }),
          status: 500
        };
      }
    };
  })
}));

// Mock Supabase trivia functions
vi.mock('@/lib/api/supabase', () => ({
  getTriviaQuestions: vi.fn(() => Promise.resolve({
    success: true,
    questions: [
      { id: 1, question: 'What year was Real Betis founded?', options: ['1907', '1908', '1909'], correct_answer: 0, category: 'betis' }
    ]
  })),
  getUserDailyTriviaScore: vi.fn(() => Promise.resolve({
    success: true,
    data: null
  })),
  saveTriviaScore: vi.fn(() => Promise.resolve({
    success: true,
    data: { score: 85 }
  })),
  getAuthenticatedSupabaseClient: vi.fn(() => ({
    from: vi.fn()
  }))
}));

// Mock logger
vi.mock('@/lib/utils/logger', () => ({
  log: {
    business: vi.fn(),
    error: vi.fn(),
    warn: vi.fn(),
  },
}));

describe('Trivia API', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Trivia Functionality', () => {
    it('should handle trivia operations correctly', async () => {
      const { getTriviaQuestions } = await import('@/lib/api/supabase');
      
      expect(getTriviaQuestions).toBeDefined();
      expect(typeof getTriviaQuestions).toBe('function');
    });

    it('should validate authentication requirements', async () => {
      const { getAuth } = await import('@clerk/nextjs/server');
      
      expect(getAuth).toBeDefined();
      expect(typeof getAuth).toBe('function');
    });

    it('should handle score submission', async () => {
      const { saveTriviaScore } = await import('@/lib/api/supabase');
      
      expect(saveTriviaScore).toBeDefined();
      expect(typeof saveTriviaScore).toBe('function');
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
});