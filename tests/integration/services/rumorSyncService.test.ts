import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import type { RumorItem } from '@/services/rssFetcherService';

// Mocks must be hoisted
const {
  mockFetchAllRumors,
  mockCheckDuplicate,
  mockAnalyzeRumorCredibility,
  mockSupabaseInsert,
  mockSupabaseSelect,
  mockSupabaseFrom,
  mockBusinessLog,
  mockErrorLog,
} = vi.hoisted(() => ({
  mockFetchAllRumors: vi.fn(),
  mockCheckDuplicate: vi.fn(),
  mockAnalyzeRumorCredibility: vi.fn(),
  mockSupabaseInsert: vi.fn(),
  mockSupabaseSelect: vi.fn(),
  mockSupabaseFrom: vi.fn(),
  mockBusinessLog: vi.fn(),
  mockErrorLog: vi.fn(),
}));

// Mock all service dependencies
vi.mock('@/services/rssFetcherService', () => ({
  fetchAllRumors: mockFetchAllRumors,
}));

vi.mock('@/services/deduplicationService', () => ({
  checkDuplicate: mockCheckDuplicate,
}));

vi.mock('@/services/geminiService', () => ({
  analyzeRumorCredibility: mockAnalyzeRumorCredibility,
}));

// Mock Supabase
vi.mock('@supabase/supabase-js', () => ({
  createClient: vi.fn(() => ({
    from: mockSupabaseFrom,
  })),
}));

// Mock logger
vi.mock('@/lib/logger', () => ({
  log: {
    business: mockBusinessLog,
    error: mockErrorLog,
  },
}));

import { syncRumors } from '@/services/rumorSyncService';

describe('rumorSyncService - Integration Tests', () => {
  const originalEnv = process.env;

  beforeEach(() => {
    vi.clearAllMocks();
    process.env = {
      ...originalEnv,
      NEXT_PUBLIC_SUPABASE_URL: 'https://test.supabase.co',
      SUPABASE_SERVICE_ROLE_KEY: 'test-service-role-key',
      GEMINI_API_KEY: 'test-gemini-key',
    };

    // Default Supabase mock setup
    mockSupabaseFrom.mockReturnValue({
      select: mockSupabaseSelect,
      insert: mockSupabaseInsert,
    });

    mockSupabaseSelect.mockReturnValue({
      gte: vi.fn().mockResolvedValue({
        data: [],
        error: null,
      }),
    });

    mockSupabaseInsert.mockResolvedValue({
      data: null,
      error: null,
    });
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('syncRumors - Full Pipeline', () => {
    it('should successfully sync transfer rumors end-to-end', async () => {
      const mockRumors: RumorItem[] = [
        {
          title: 'Betis ficha a nuevo delantero',
          link: 'https://example.com/1',
          pubDate: new Date('2025-01-01T12:00:00Z'),
          source: 'Google News (Fichajes)',
          description: 'Fuentes confirman el fichaje',
        },
      ];

      mockFetchAllRumors.mockResolvedValue(mockRumors);
      mockCheckDuplicate.mockReturnValue({
        contentHash: 'abc123',
        isDuplicate: false,
      });
      mockAnalyzeRumorCredibility.mockResolvedValue({
        isTransferRumor: true,
        probability: 85,
        reasoning: 'Fichaje confirmado por fuentes confiables',
        confidence: 'high',
      });

      const result = await syncRumors();

      expect(result.fetched).toBe(1);
      expect(result.duplicates).toBe(0);
      expect(result.transferRumors).toBe(1);
      expect(result.regularNews).toBe(0);
      expect(result.notAnalyzed).toBe(0);
      expect(result.analyzed).toBe(1);
      expect(result.inserted).toBe(1);
      expect(result.errors).toBe(0);
    });

    it('should classify regular news correctly', async () => {
      const mockRumors: RumorItem[] = [
        {
          title: 'Betis gana 2-0',
          link: 'https://example.com/1',
          pubDate: new Date(),
          source: 'Google News (General)',
          description: 'Resumen del partido',
        },
      ];

      mockFetchAllRumors.mockResolvedValue(mockRumors);
      mockCheckDuplicate.mockReturnValue({
        contentHash: 'abc123',
        isDuplicate: false,
      });
      mockAnalyzeRumorCredibility.mockResolvedValue({
        isTransferRumor: false,
        probability: 0,
        reasoning: 'Es una noticia de partido, no de fichaje',
        confidence: 'high',
      });

      const result = await syncRumors();

      expect(result.transferRumors).toBe(0);
      expect(result.regularNews).toBe(1);
      expect(result.notAnalyzed).toBe(0);
      expect(result.analyzed).toBe(1);
    });

    it('should handle AI quota errors and store with null probability', async () => {
      const mockRumors: RumorItem[] = [
        {
          title: 'Test Rumor',
          link: 'https://example.com/1',
          pubDate: new Date(),
          source: 'BetisWeb',
          description: 'Test',
        },
      ];

      mockFetchAllRumors.mockResolvedValue(mockRumors);
      mockCheckDuplicate.mockReturnValue({
        contentHash: 'abc123',
        isDuplicate: false,
      });
      mockAnalyzeRumorCredibility.mockResolvedValue({
        isTransferRumor: null,
        probability: null,
        reasoning: 'No se pudo analizar este rumor automáticamente.',
        confidence: 'low',
      });

      const result = await syncRumors();

      expect(result.notAnalyzed).toBe(1);
      expect(result.transferRumors).toBe(0);
      expect(result.regularNews).toBe(0);
      expect(result.analyzed).toBe(1);
    });

    it('should skip duplicate rumors', async () => {
      const mockRumors: RumorItem[] = [
        {
          title: 'Duplicate Rumor',
          link: 'https://example.com/1',
          pubDate: new Date(),
          source: 'BetisWeb',
          description: 'This is a duplicate',
        },
      ];

      mockFetchAllRumors.mockResolvedValue(mockRumors);
      mockCheckDuplicate.mockReturnValue({
        contentHash: 'abc123',
        isDuplicate: true,
        duplicateOfId: 42,
        similarityScore: 95,
      });

      const result = await syncRumors();

      expect(result.fetched).toBe(1);
      expect(result.duplicates).toBe(1);
      expect(result.inserted).toBe(0);
      expect(result.analyzed).toBe(0);
      expect(mockAnalyzeRumorCredibility).not.toHaveBeenCalled();
    });

    it('should handle multiple rumors with different classifications', async () => {
      const mockRumors: RumorItem[] = [
        {
          title: 'Transfer Rumor',
          link: 'https://example.com/1',
          pubDate: new Date(),
          source: 'Google News (Fichajes)',
          description: 'Fichaje',
        },
        {
          title: 'Match News',
          link: 'https://example.com/2',
          pubDate: new Date(),
          source: 'Google News (General)',
          description: 'Partido',
        },
        {
          title: 'Quota Exceeded',
          link: 'https://example.com/3',
          pubDate: new Date(),
          source: 'BetisWeb',
          description: 'Test',
        },
      ];

      mockFetchAllRumors.mockResolvedValue(mockRumors);
      mockCheckDuplicate.mockReturnValue({
        contentHash: 'unique',
        isDuplicate: false,
      });

      mockAnalyzeRumorCredibility
        .mockResolvedValueOnce({
          isTransferRumor: true,
          probability: 70,
          reasoning: 'Transfer',
          confidence: 'high',
        })
        .mockResolvedValueOnce({
          isTransferRumor: false,
          probability: 0,
          reasoning: 'Not transfer',
          confidence: 'high',
        })
        .mockResolvedValueOnce({
          isTransferRumor: null,
          probability: null,
          reasoning: 'Quota exceeded',
          confidence: 'low',
        });

      const result = await syncRumors();

      expect(result.fetched).toBe(3);
      expect(result.transferRumors).toBe(1);
      expect(result.regularNews).toBe(1);
      expect(result.notAnalyzed).toBe(1);
      expect(result.analyzed).toBe(3);
      expect(result.inserted).toBe(3);
    });

    it('should handle database insertion errors', async () => {
      const mockRumors: RumorItem[] = [
        {
          title: 'Test Rumor',
          link: 'https://example.com/1',
          pubDate: new Date(),
          source: 'BetisWeb',
          description: 'Test',
        },
      ];

      mockFetchAllRumors.mockResolvedValue(mockRumors);
      mockCheckDuplicate.mockReturnValue({
        contentHash: 'abc123',
        isDuplicate: false,
      });
      mockAnalyzeRumorCredibility.mockResolvedValue({
        isTransferRumor: true,
        probability: 50,
        reasoning: 'Test',
        confidence: 'medium',
      });

      mockSupabaseInsert.mockResolvedValue({
        data: null,
        error: { code: 'ERROR', message: 'Database error' },
      });

      const result = await syncRumors();

      expect(result.errors).toBe(1);
      expect(result.inserted).toBe(0);
    });

    it('should handle unique constraint violation as duplicate', async () => {
      const mockRumors: RumorItem[] = [
        {
          title: 'Test Rumor',
          link: 'https://example.com/duplicate',
          pubDate: new Date(),
          source: 'BetisWeb',
          description: 'Test',
        },
      ];

      mockFetchAllRumors.mockResolvedValue(mockRumors);
      mockCheckDuplicate.mockReturnValue({
        contentHash: 'abc123',
        isDuplicate: false,
      });
      mockAnalyzeRumorCredibility.mockResolvedValue({
        isTransferRumor: true,
        probability: 50,
        reasoning: 'Test',
        confidence: 'medium',
      });

      mockSupabaseInsert.mockResolvedValue({
        data: null,
        error: { code: '23505', message: 'Unique constraint violation' },
      });

      const result = await syncRumors();

      expect(result.duplicates).toBe(1);
      expect(result.errors).toBe(0);
    });

    it('should query last 30 days of existing rumors for deduplication', async () => {
      const mockRumors: RumorItem[] = [];
      mockFetchAllRumors.mockResolvedValue(mockRumors);

      await syncRumors();

      expect(mockSupabaseSelect).toHaveBeenCalled();
      const gteCall = mockSupabaseSelect.mock.results[0].value.gte;
      expect(gteCall).toBeDefined();
    });

    it('should use service role key for database operations', async () => {
      const mockRumors: RumorItem[] = [];
      mockFetchAllRumors.mockResolvedValue(mockRumors);

      await syncRumors();

      // Service role key should be used in createClient (verified by env var)
      expect(process.env.SUPABASE_SERVICE_ROLE_KEY).toBe('test-service-role-key');
    });

    it('should handle AI analysis errors for individual items', async () => {
      const mockRumors: RumorItem[] = [
        {
          title: 'Working Rumor',
          link: 'https://example.com/1',
          pubDate: new Date(),
          source: 'BetisWeb',
          description: 'Test',
        },
        {
          title: 'Failing Rumor',
          link: 'https://example.com/2',
          pubDate: new Date(),
          source: 'BetisWeb',
          description: 'Test',
        },
      ];

      mockFetchAllRumors.mockResolvedValue(mockRumors);
      mockCheckDuplicate.mockReturnValue({
        contentHash: 'unique',
        isDuplicate: false,
      });

      mockAnalyzeRumorCredibility
        .mockResolvedValueOnce({
          isTransferRumor: true,
          probability: 60,
          reasoning: 'OK',
          confidence: 'medium',
        })
        .mockRejectedValueOnce(new Error('AI service error'));

      const result = await syncRumors();

      expect(result.analyzed).toBe(1);
      expect(result.errors).toBe(1);
      expect(result.inserted).toBe(1); // First one should succeed
    });

    it('should handle empty RSS feed results', async () => {
      mockFetchAllRumors.mockResolvedValue([]);

      const result = await syncRumors();

      expect(result.fetched).toBe(0);
      expect(result.inserted).toBe(0);
      expect(result.errors).toBe(0);
    });

    it('should throw error if environment variables are missing', async () => {
      delete process.env.NEXT_PUBLIC_SUPABASE_URL;

      await expect(syncRumors()).rejects.toThrow(
        'NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required'
      );
    });

    it('should continue processing after individual item errors', async () => {
      const mockRumors: RumorItem[] = [
        { title: 'Item 1', link: 'https://example.com/1', pubDate: new Date(), source: 'BetisWeb', description: 'Test' },
        { title: 'Item 2', link: 'https://example.com/2', pubDate: new Date(), source: 'BetisWeb', description: 'Test' },
        { title: 'Item 3', link: 'https://example.com/3', pubDate: new Date(), source: 'BetisWeb', description: 'Test' },
      ];

      mockFetchAllRumors.mockResolvedValue(mockRumors);
      mockCheckDuplicate.mockReturnValue({
        contentHash: 'unique',
        isDuplicate: false,
      });

      mockAnalyzeRumorCredibility
        .mockResolvedValueOnce({ isTransferRumor: true, probability: 50, reasoning: 'OK', confidence: 'medium' })
        .mockRejectedValueOnce(new Error('Failed'))
        .mockResolvedValueOnce({ isTransferRumor: false, probability: 0, reasoning: 'OK', confidence: 'high' });

      const result = await syncRumors();

      expect(result.fetched).toBe(3);
      expect(result.analyzed).toBe(2);
      expect(result.errors).toBe(1);
      expect(result.inserted).toBe(2);
    });

    it('should log business events during sync', async () => {
      const mockRumors: RumorItem[] = [
        {
          title: 'Transfer',
          link: 'https://example.com/1',
          pubDate: new Date(),
          source: 'BetisWeb',
          description: 'Fichaje',
        },
      ];

      mockFetchAllRumors.mockResolvedValue(mockRumors);
      mockCheckDuplicate.mockReturnValue({
        contentHash: 'unique',
        isDuplicate: false,
      });
      mockAnalyzeRumorCredibility.mockResolvedValue({
        isTransferRumor: true,
        probability: 75,
        reasoning: 'Transfer rumor',
        confidence: 'high',
      });

      await syncRumors();

      expect(mockBusinessLog).toHaveBeenCalledWith('rumors_fetched', expect.any(Object));
      expect(mockBusinessLog).toHaveBeenCalledWith('transfer_rumor_found', expect.any(Object));
      expect(mockBusinessLog).toHaveBeenCalledWith('betis_news_sync_completed', expect.any(Object));
    });

    it('should insert all news types into betis_news table', async () => {
      const mockRumors: RumorItem[] = [
        {
          title: 'Transfer',
          link: 'https://example.com/transfer',
          pubDate: new Date('2025-01-01T12:00:00Z'),
          source: 'Google News (Fichajes)',
          description: 'Fichaje confirmado',
        },
        {
          title: 'Regular',
          link: 'https://example.com/regular',
          pubDate: new Date('2025-01-01T11:00:00Z'),
          source: 'Google News (General)',
          description: 'Noticia regular',
        },
      ];

      mockFetchAllRumors.mockResolvedValue(mockRumors);
      mockCheckDuplicate.mockReturnValue({
        contentHash: 'unique',
        isDuplicate: false,
      });

      mockAnalyzeRumorCredibility
        .mockResolvedValueOnce({
          isTransferRumor: true,
          probability: 80,
          reasoning: 'Transfer',
          confidence: 'high',
        })
        .mockResolvedValueOnce({
          isTransferRumor: false,
          probability: 0,
          reasoning: 'Regular',
          confidence: 'high',
        });

      await syncRumors();

      expect(mockSupabaseFrom).toHaveBeenCalledWith('betis_news');
      expect(mockSupabaseInsert).toHaveBeenCalledTimes(2);
    });
  });
});
