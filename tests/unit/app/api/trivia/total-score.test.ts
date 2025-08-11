import { NextRequest } from 'next/server';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GET } from '@/app/api/trivia/total-score/route';
import { getAuth } from '@clerk/nextjs/server';
import { getUserDailyTriviaScore, getAuthenticatedSupabaseClient } from '@/lib/supabase';

// Mock the dependencies
vi.mock('@clerk/nextjs/server', () => ({
  getAuth: vi.fn()
}));

vi.mock('@/lib/supabase', () => ({
  getUserDailyTriviaScore: vi.fn(),
  getAuthenticatedSupabaseClient: vi.fn()
}));

describe('/api/trivia/total-score', () => {
  const mockGetAuth = vi.mocked(getAuth);
  const mockGetUserDailyTriviaScore = vi.mocked(getUserDailyTriviaScore);
  const mockGetAuthenticatedSupabaseClient = vi.mocked(getAuthenticatedSupabaseClient);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const createMockRequest = (url = 'http://localhost/api/trivia/total-score') => {
    return new NextRequest(url);
  };

  describe('Authentication', () => {
    it('returns 401 when user is not authenticated', async () => {
      mockGetAuth.mockReturnValue({
        userId: null,
        getToken: vi.fn()
      } as any);

      const req = createMockRequest();
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('returns 401 when Clerk token is not available', async () => {
      const mockGetToken = vi.fn().mockResolvedValue(null);
      mockGetAuth.mockReturnValue({
        userId: 'user-123',
        getToken: mockGetToken
      } as any);

      const req = createMockRequest();
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized: No Clerk token found');
    });
  });

  describe('Successful authentication', () => {
    const setupAuthenticatedUser = () => {
      const mockToken = 'mock-clerk-token';
      const mockGetToken = vi.fn().mockResolvedValue(mockToken);
      const mockSupabaseClient = { mock: 'supabase-client' };
      
      mockGetAuth.mockReturnValue({
        userId: 'user-123',
        getToken: mockGetToken
      } as any);
      
      mockGetAuthenticatedSupabaseClient.mockReturnValue(mockSupabaseClient as any);
      
      return { mockToken, mockSupabaseClient };
    };

    it('returns existing daily score when user has a score', async () => {
      setupAuthenticatedUser();
      
      mockGetUserDailyTriviaScore.mockResolvedValue({
        success: true,
        data: {
          id: 'score-1',
          user_id: 'user-123',
          daily_score: 85,
          timestamp: new Date().toISOString()
        }
      });

      const req = createMockRequest();
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.score).toBe(85);
    });

    it('returns score 0 when user has no score for today', async () => {
      setupAuthenticatedUser();
      
      mockGetUserDailyTriviaScore.mockResolvedValue({
        success: true,
        data: null
      });

      const req = createMockRequest();
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.score).toBe(0);
    });

    it('calls getUserDailyTriviaScore with correct parameters', async () => {
      const { mockSupabaseClient } = setupAuthenticatedUser();
      
      mockGetUserDailyTriviaScore.mockResolvedValue({
        success: true,
        data: null
      });

      const req = createMockRequest();
      await GET(req);

      expect(mockGetUserDailyTriviaScore).toHaveBeenCalledWith('user-123', mockSupabaseClient);
    });
  });

  describe('Error handling', () => {
    const setupAuthenticatedUser = () => {
      const mockToken = 'mock-clerk-token';
      const mockGetToken = vi.fn().mockResolvedValue(mockToken);
      const mockSupabaseClient = { mock: 'supabase-client' };
      
      mockGetAuth.mockReturnValue({
        userId: 'user-123',
        getToken: mockGetToken
      } as any);
      
      mockGetAuthenticatedSupabaseClient.mockReturnValue(mockSupabaseClient as any);
      
      return { mockToken, mockSupabaseClient };
    };

    it('returns 500 when getUserDailyTriviaScore fails', async () => {
      setupAuthenticatedUser();
      
      mockGetUserDailyTriviaScore.mockResolvedValue({
        success: false,
        error: 'Database connection error'
      });

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const req = createMockRequest();
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Failed to check daily score');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Error checking daily trivia score:', 'Database connection error');

      consoleErrorSpy.mockRestore();
    });

    it('handles unexpected errors gracefully', async () => {
      setupAuthenticatedUser();
      
      mockGetUserDailyTriviaScore.mockRejectedValue(new Error('Unexpected database error'));

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const req = createMockRequest();
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(500);
      expect(data.error).toBe('Internal Server Error');
      expect(consoleErrorSpy).toHaveBeenCalledWith('Unexpected error in total-score API:', expect.any(Error));

      consoleErrorSpy.mockRestore();
    });

    it('handles clerk token retrieval errors', async () => {
      const mockGetToken = vi.fn().mockRejectedValue(new Error('Token retrieval failed'));
      mockGetAuth.mockReturnValue({
        userId: 'user-123',
        getToken: mockGetToken
      } as any);

      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      const req = createMockRequest();
      
      // Catch the error since it's expected
      await expect(async () => {
        await GET(req);
      }).rejects.toThrow('Token retrieval failed');

      consoleErrorSpy.mockRestore();
    });
  });

  describe('Request method validation', () => {
    it('handles GET requests correctly', async () => {
      const mockGetToken = vi.fn().mockResolvedValue(null);
      mockGetAuth.mockReturnValue({
        userId: 'user-123',
        getToken: mockGetToken
      } as any);

      const req = createMockRequest();
      const response = await GET(req);

      expect(response).toBeDefined();
      expect(response.status).toBe(401); // Expected auth failure
    });
  });

  describe('Edge cases', () => {
    it('handles null userId correctly', async () => {
      mockGetAuth.mockReturnValue({
        userId: null,
        getToken: vi.fn()
      } as any);

      const req = createMockRequest();
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('handles undefined userId correctly', async () => {
      mockGetAuth.mockReturnValue({
        userId: undefined,
        getToken: vi.fn()
      } as any);

      const req = createMockRequest();
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });

    it('handles empty string userId correctly', async () => {
      mockGetAuth.mockReturnValue({
        userId: '',
        getToken: vi.fn()
      } as any);

      const req = createMockRequest();
      const response = await GET(req);
      const data = await response.json();

      expect(response.status).toBe(401);
      expect(data.error).toBe('Unauthorized');
    });
  });
});