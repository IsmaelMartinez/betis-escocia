import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock must be hoisted
const { mockParseURL } = vi.hoisted(() => ({
  mockParseURL: vi.fn(),
}));

// Mock rss-parser
vi.mock('rss-parser', () => {
  return {
    default: class MockParser {
      parseURL = mockParseURL;
    },
  };
});

// Mock logger
vi.mock('@/lib/logger', () => ({
  log: {
    error: vi.fn(),
    business: vi.fn(),
  },
}));

import { fetchAllRumors, type RumorItem } from '@/services/rssFetcherService';

describe('rssFetcherService', () => {
  const mockFeedItem = (title: string, link: string, pubDate: string, contentSnippet?: string) => ({
    title,
    link,
    pubDate,
    contentSnippet,
    content: contentSnippet,
  });

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('fetchAllRumors', () => {
    it('should fetch and merge rumors from all RSS feeds', async () => {
      const googleFichajesFeed = {
        items: [
          mockFeedItem(
            'Betis interesado en Fichaje 1',
            'https://example.com/1',
            '2025-12-01T12:00:00Z',
            'Descripción del fichaje 1'
          ),
        ],
      };

      const googleGeneralFeed = {
        items: [
          mockFeedItem(
            'Betis gana partido',
            'https://example.com/2',
            '2025-12-01T11:00:00Z',
            'Resumen del partido'
          ),
        ],
      };

      const betisWebFeed = {
        items: [
          mockFeedItem(
            'Análisis táctico Betis',
            'https://example.com/3',
            '2025-12-01T13:00:00Z',
            'Análisis completo'
          ),
        ],
      };

      mockParseURL
        .mockResolvedValueOnce(googleFichajesFeed)
        .mockResolvedValueOnce(googleGeneralFeed)
        .mockResolvedValueOnce(betisWebFeed);

      const rumors = await fetchAllRumors();

      expect(mockParseURL).toHaveBeenCalledTimes(3);
      expect(rumors).toHaveLength(3);

      // Should be sorted by date (newest first)
      expect(rumors[0].title).toBe('Análisis táctico Betis');
      expect(rumors[1].title).toBe('Betis interesado en Fichaje 1');
      expect(rumors[2].title).toBe('Betis gana partido');
    });

    it('should assign correct source to each feed', async () => {
      const feed = { items: [mockFeedItem('Test', 'https://test.com', '2025-12-01T12:00:00Z')] };

      mockParseURL
        .mockResolvedValueOnce(feed)
        .mockResolvedValueOnce(feed)
        .mockResolvedValueOnce(feed);

      const rumors = await fetchAllRumors();

      const sources = rumors.map(r => r.source);
      expect(sources).toContain('Google News (Fichajes)');
      expect(sources).toContain('Google News (General)');
      expect(sources).toContain('BetisWeb');
    });

    it('should handle missing title with default value', async () => {
      const feed = {
        items: [
          {
            link: 'https://example.com/1',
            pubDate: '2025-12-01T12:00:00Z',
            contentSnippet: 'Description',
          },
        ],
      };

      mockParseURL
        .mockResolvedValueOnce(feed)
        .mockResolvedValueOnce({ items: [] })
        .mockResolvedValueOnce({ items: [] });

      const rumors = await fetchAllRumors();

      expect(rumors[0].title).toBe('Sin título');
    });

    it('should handle missing link with default value', async () => {
      const feed = {
        items: [
          {
            title: 'Test Title',
            pubDate: '2025-12-01T12:00:00Z',
            contentSnippet: 'Description',
          },
        ],
      };

      mockParseURL
        .mockResolvedValueOnce(feed)
        .mockResolvedValueOnce({ items: [] })
        .mockResolvedValueOnce({ items: [] });

      const rumors = await fetchAllRumors();

      expect(rumors[0].link).toBe('#');
    });

    it('should handle missing pubDate with current date', async () => {
      const beforeTest = new Date();

      const feed = {
        items: [
          {
            title: 'Test Title',
            link: 'https://example.com/1',
            contentSnippet: 'Description',
          },
        ],
      };

      mockParseURL
        .mockResolvedValueOnce(feed)
        .mockResolvedValueOnce({ items: [] })
        .mockResolvedValueOnce({ items: [] });

      const rumors = await fetchAllRumors();
      const afterTest = new Date();

      expect(rumors[0].pubDate.getTime()).toBeGreaterThanOrEqual(beforeTest.getTime());
      expect(rumors[0].pubDate.getTime()).toBeLessThanOrEqual(afterTest.getTime());
    });

    it('should prefer contentSnippet over content for description', async () => {
      const feed = {
        items: [
          {
            title: 'Test',
            link: 'https://example.com/1',
            pubDate: '2025-12-01T12:00:00Z',
            contentSnippet: 'Snippet',
            content: 'Full content',
          },
        ],
      };

      mockParseURL
        .mockResolvedValueOnce(feed)
        .mockResolvedValueOnce({ items: [] })
        .mockResolvedValueOnce({ items: [] });

      const rumors = await fetchAllRumors();

      expect(rumors[0].description).toBe('Snippet');
    });

    it('should fallback to content if contentSnippet is missing', async () => {
      const feed = {
        items: [
          {
            title: 'Test',
            link: 'https://example.com/1',
            pubDate: '2025-12-01T12:00:00Z',
            content: 'Full content',
          },
        ],
      };

      mockParseURL
        .mockResolvedValueOnce(feed)
        .mockResolvedValueOnce({ items: [] })
        .mockResolvedValueOnce({ items: [] });

      const rumors = await fetchAllRumors();

      expect(rumors[0].description).toBe('Full content');
    });

    it('should handle empty feeds gracefully', async () => {
      mockParseURL
        .mockResolvedValueOnce({ items: [] })
        .mockResolvedValueOnce({ items: [] })
        .mockResolvedValueOnce({ items: [] });

      const rumors = await fetchAllRumors();

      expect(rumors).toEqual([]);
    });

    it('should handle RSS feed errors gracefully', async () => {
      const validFeed = {
        items: [mockFeedItem('Valid item', 'https://example.com/1', '2025-12-01T12:00:00Z')],
      };

      mockParseURL
        .mockRejectedValueOnce(new Error('Network error'))
        .mockResolvedValueOnce(validFeed)
        .mockRejectedValueOnce(new Error('Timeout'));

      const rumors = await fetchAllRumors();

      // Should return items from successful feed only
      expect(rumors).toHaveLength(1);
      expect(rumors[0].title).toBe('Valid item');
    });

    it('should continue fetching even if one feed fails', async () => {
      const feed1 = {
        items: [mockFeedItem('Item 1', 'https://example.com/1', '2025-12-01T12:00:00Z')],
      };
      const feed2 = {
        items: [mockFeedItem('Item 2', 'https://example.com/2', '2025-12-01T11:00:00Z')],
      };

      mockParseURL
        .mockRejectedValueOnce(new Error('Feed 1 failed'))
        .mockResolvedValueOnce(feed1)
        .mockResolvedValueOnce(feed2);

      const rumors = await fetchAllRumors();

      expect(rumors).toHaveLength(2);
      expect(mockParseURL).toHaveBeenCalledTimes(3);
    });

    it('should return empty array if all feeds fail', async () => {
      mockParseURL
        .mockRejectedValueOnce(new Error('Network error'))
        .mockRejectedValueOnce(new Error('Timeout'))
        .mockRejectedValueOnce(new Error('Parse error'));

      const rumors = await fetchAllRumors();

      expect(rumors).toEqual([]);
    });

    it('should fetch feeds in parallel', async () => {
      const delayedFeed = (delay: number) =>
        new Promise(resolve =>
          setTimeout(
            () =>
              resolve({
                items: [mockFeedItem('Item', 'https://example.com/1', '2025-12-01T12:00:00Z')],
              }),
            delay
          )
        );

      mockParseURL
        .mockImplementationOnce(() => delayedFeed(100))
        .mockImplementationOnce(() => delayedFeed(100))
        .mockImplementationOnce(() => delayedFeed(100));

      const startTime = Date.now();
      await fetchAllRumors();
      const duration = Date.now() - startTime;

      // If running in parallel, total time should be ~100ms, not ~300ms
      expect(duration).toBeLessThan(200);
    });

    it('should sort rumors by pubDate in descending order', async () => {
      const feed = {
        items: [
          mockFeedItem('Oldest', 'https://example.com/1', '2025-12-01T10:00:00Z'),
          mockFeedItem('Middle', 'https://example.com/2', '2025-12-01T11:00:00Z'),
          mockFeedItem('Newest', 'https://example.com/3', '2025-12-01T12:00:00Z'),
        ],
      };

      mockParseURL
        .mockResolvedValueOnce(feed)
        .mockResolvedValueOnce({ items: [] })
        .mockResolvedValueOnce({ items: [] });

      const rumors = await fetchAllRumors();

      expect(rumors[0].title).toBe('Newest');
      expect(rumors[1].title).toBe('Middle');
      expect(rumors[2].title).toBe('Oldest');
    });

    it('should convert pubDate strings to Date objects', async () => {
      const feed = {
        items: [mockFeedItem('Test', 'https://example.com/1', '2025-12-01T12:00:00Z')],
      };

      mockParseURL
        .mockResolvedValueOnce(feed)
        .mockResolvedValueOnce({ items: [] })
        .mockResolvedValueOnce({ items: [] });

      const rumors = await fetchAllRumors();

      expect(rumors[0].pubDate).toBeInstanceOf(Date);
      expect(rumors[0].pubDate.toISOString()).toBe('2025-12-01T12:00:00.000Z');
    });
  });
});
