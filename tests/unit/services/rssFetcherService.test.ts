import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock must be hoisted
const { mockParseURL } = vi.hoisted(() => ({
  mockParseURL: vi.fn(),
}));

// Mock rss-parser
vi.mock("rss-parser", () => {
  return {
    default: class MockParser {
      parseURL = mockParseURL;
    },
  };
});

// Mock logger
vi.mock("@/lib/logger", () => ({
  log: {
    error: vi.fn(),
    business: vi.fn(),
  },
}));

import {
  fetchAllRumors,
  type RumorItem,
  _testExports,
} from "@/services/rssFetcherService";

const TOTAL_FEEDS = _testExports.FEED_CONFIGS.length; // 5 feeds (3 RSS + 2 Telegram)

// Helper to create mock responses for all feeds
const mockAllFeedsEmpty = () => {
  for (let i = 0; i < TOTAL_FEEDS; i++) {
    mockParseURL.mockResolvedValueOnce({ items: [] });
  }
};

const mockAllFeedsWithSingleItem = (feed: { items: unknown[] }) => {
  for (let i = 0; i < TOTAL_FEEDS; i++) {
    mockParseURL.mockResolvedValueOnce(feed);
  }
};

describe("rssFetcherService", () => {
  // Use dynamic dates relative to today to avoid flaky tests when dates become older than 1 month
  const getRecentDate = (daysAgo: number, hoursOffset = 0) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    date.setHours(12 + hoursOffset, 0, 0, 0);
    return date.toISOString();
  };

  const mockFeedItem = (
    title: string,
    link: string,
    pubDate: string,
    contentSnippet?: string,
  ) => ({
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

  describe("fetchAllRumors", () => {
    it("should fetch and merge rumors from all feeds", async () => {
      // Create feeds with different timestamps to verify sorting
      const feeds = [
        {
          items: [
            mockFeedItem(
              "Betis interesado en Fichaje 1",
              "https://example.com/1",
              getRecentDate(1, 0),
              "Descripción del fichaje 1",
            ),
          ],
        },
        {
          items: [
            mockFeedItem(
              "Betis gana partido",
              "https://example.com/2",
              getRecentDate(1, -1),
              "Resumen del partido",
            ),
          ],
        },
        {
          items: [
            mockFeedItem(
              "Análisis táctico Betis",
              "https://example.com/3",
              getRecentDate(1, 1),
              "Análisis completo",
            ),
          ],
        },
        // Telegram feeds
        {
          items: [
            mockFeedItem(
              "Fabrizio Romano: Here we go!",
              "https://t.me/FabrizioRomanoTG/123",
              getRecentDate(1, 2),
              "Transfer confirmed",
            ),
          ],
        },
        {
          items: [
            mockFeedItem(
              "Ficherío Betis: Nuevo fichaje",
              "https://t.me/ficherioRealBetis/456",
              getRecentDate(1, -2),
              "Betis transfer news",
            ),
          ],
        },
      ];

      feeds.forEach((feed) => mockParseURL.mockResolvedValueOnce(feed));

      const rumors = await fetchAllRumors();

      expect(mockParseURL).toHaveBeenCalledTimes(TOTAL_FEEDS);
      expect(rumors).toHaveLength(5);

      // Should be sorted by date (newest first)
      expect(rumors[0].title).toBe("Fabrizio Romano: Here we go!");
      expect(rumors[1].title).toBe("Análisis táctico Betis");
      expect(rumors[2].title).toBe("Betis interesado en Fichaje 1");
    });

    it("should assign correct source to each feed", async () => {
      const feed = {
        items: [mockFeedItem("Test", "https://test.com", getRecentDate(1))],
      };

      mockAllFeedsWithSingleItem(feed);

      const rumors = await fetchAllRumors();

      const sources = rumors.map((r) => r.source);
      // RSS sources
      expect(sources).toContain("Google News (Fichajes)");
      expect(sources).toContain("Google News (General)");
      expect(sources).toContain("BetisWeb");
      // Telegram sources (replaces broken Twitter/RSSHub feeds)
      expect(sources).toContain("Telegram: @FabrizioRomanoTG");
      expect(sources).toContain("Telegram: @ficherioRealBetis");
      expect(sources).toHaveLength(5);
    });

    it("should handle missing title with default value", async () => {
      const feed = {
        items: [
          {
            link: "https://example.com/1",
            pubDate: getRecentDate(1),
            contentSnippet: "Description",
          },
        ],
      };

      mockParseURL.mockResolvedValueOnce(feed);
      // Rest of feeds return empty
      for (let i = 1; i < TOTAL_FEEDS; i++) {
        mockParseURL.mockResolvedValueOnce({ items: [] });
      }

      const rumors = await fetchAllRumors();

      expect(rumors[0].title).toBe("Sin título");
    });

    it("should handle missing link with default value", async () => {
      const feed = {
        items: [
          {
            title: "Test Title",
            pubDate: getRecentDate(1),
            contentSnippet: "Description",
          },
        ],
      };

      mockParseURL.mockResolvedValueOnce(feed);
      for (let i = 1; i < TOTAL_FEEDS; i++) {
        mockParseURL.mockResolvedValueOnce({ items: [] });
      }

      const rumors = await fetchAllRumors();

      expect(rumors[0].link).toBe("#");
    });

    it("should handle missing pubDate with current date", async () => {
      const beforeTest = new Date();

      const feed = {
        items: [
          {
            title: "Test Title",
            link: "https://example.com/1",
            contentSnippet: "Description",
          },
        ],
      };

      mockParseURL.mockResolvedValueOnce(feed);
      for (let i = 1; i < TOTAL_FEEDS; i++) {
        mockParseURL.mockResolvedValueOnce({ items: [] });
      }

      const rumors = await fetchAllRumors();
      const afterTest = new Date();

      expect(rumors[0].pubDate.getTime()).toBeGreaterThanOrEqual(
        beforeTest.getTime(),
      );
      expect(rumors[0].pubDate.getTime()).toBeLessThanOrEqual(
        afterTest.getTime(),
      );
    });

    it("should prefer contentSnippet over content for description", async () => {
      const feed = {
        items: [
          {
            title: "Test",
            link: "https://example.com/1",
            pubDate: getRecentDate(1),
            contentSnippet: "Snippet",
            content: "Full content",
          },
        ],
      };

      mockParseURL.mockResolvedValueOnce(feed);
      for (let i = 1; i < TOTAL_FEEDS; i++) {
        mockParseURL.mockResolvedValueOnce({ items: [] });
      }

      const rumors = await fetchAllRumors();

      expect(rumors[0].description).toBe("Snippet");
    });

    it("should fallback to content if contentSnippet is missing", async () => {
      const feed = {
        items: [
          {
            title: "Test",
            link: "https://example.com/1",
            pubDate: getRecentDate(1),
            content: "Full content",
          },
        ],
      };

      mockParseURL.mockResolvedValueOnce(feed);
      for (let i = 1; i < TOTAL_FEEDS; i++) {
        mockParseURL.mockResolvedValueOnce({ items: [] });
      }

      const rumors = await fetchAllRumors();

      expect(rumors[0].description).toBe("Full content");
    });

    it("should handle empty feeds gracefully", async () => {
      mockAllFeedsEmpty();

      const rumors = await fetchAllRumors();

      expect(rumors).toEqual([]);
    });

    it("should handle RSS feed errors gracefully", async () => {
      const validFeed = {
        items: [
          mockFeedItem("Valid item", "https://example.com/1", getRecentDate(1)),
        ],
      };

      // First feed fails, second succeeds, rest empty
      mockParseURL.mockRejectedValueOnce(new Error("Network error"));
      mockParseURL.mockResolvedValueOnce(validFeed);
      for (let i = 2; i < TOTAL_FEEDS; i++) {
        mockParseURL.mockResolvedValueOnce({ items: [] });
      }

      const rumors = await fetchAllRumors();

      // Should return items from successful feed only
      expect(rumors).toHaveLength(1);
      expect(rumors[0].title).toBe("Valid item");
    });

    it("should continue fetching even if one feed fails", async () => {
      const feed1 = {
        items: [
          mockFeedItem("Item 1", "https://example.com/1", getRecentDate(1, 0)),
        ],
      };
      const feed2 = {
        items: [
          mockFeedItem("Item 2", "https://example.com/2", getRecentDate(1, -1)),
        ],
      };

      mockParseURL.mockRejectedValueOnce(new Error("Feed 1 failed"));
      mockParseURL.mockResolvedValueOnce(feed1);
      mockParseURL.mockResolvedValueOnce(feed2);
      for (let i = 3; i < TOTAL_FEEDS; i++) {
        mockParseURL.mockResolvedValueOnce({ items: [] });
      }

      const rumors = await fetchAllRumors();

      expect(rumors).toHaveLength(2);
      expect(mockParseURL).toHaveBeenCalledTimes(TOTAL_FEEDS);
    });

    it("should return empty array if all feeds fail", async () => {
      for (let i = 0; i < TOTAL_FEEDS; i++) {
        mockParseURL.mockRejectedValueOnce(new Error(`Error ${i}`));
      }

      const rumors = await fetchAllRumors();

      expect(rumors).toEqual([]);
    });

    it("should fetch feeds in parallel", async () => {
      const recentDate = getRecentDate(1);
      const delayedFeed = (delay: number) =>
        new Promise((resolve) =>
          setTimeout(
            () =>
              resolve({
                items: [
                  mockFeedItem("Item", "https://example.com/1", recentDate),
                ],
              }),
            delay,
          ),
        );

      // All feeds take 50ms each
      for (let i = 0; i < TOTAL_FEEDS; i++) {
        mockParseURL.mockImplementationOnce(() => delayedFeed(50));
      }

      const startTime = Date.now();
      await fetchAllRumors();
      const duration = Date.now() - startTime;

      // If running in parallel, total time should be ~50ms, not ~250ms (5 * 50ms)
      expect(duration).toBeLessThan(150);
    });

    it("should sort rumors by pubDate in descending order", async () => {
      const feed = {
        items: [
          mockFeedItem("Oldest", "https://example.com/1", getRecentDate(1, -2)),
          mockFeedItem("Middle", "https://example.com/2", getRecentDate(1, -1)),
          mockFeedItem("Newest", "https://example.com/3", getRecentDate(1, 0)),
        ],
      };

      mockParseURL.mockResolvedValueOnce(feed);
      for (let i = 1; i < TOTAL_FEEDS; i++) {
        mockParseURL.mockResolvedValueOnce({ items: [] });
      }

      const rumors = await fetchAllRumors();

      expect(rumors[0].title).toBe("Newest");
      expect(rumors[1].title).toBe("Middle");
      expect(rumors[2].title).toBe("Oldest");
    });

    it("should convert pubDate strings to Date objects", async () => {
      const testDate = getRecentDate(1);
      const feed = {
        items: [mockFeedItem("Test", "https://example.com/1", testDate)],
      };

      mockParseURL.mockResolvedValueOnce(feed);
      for (let i = 1; i < TOTAL_FEEDS; i++) {
        mockParseURL.mockResolvedValueOnce({ items: [] });
      }

      const rumors = await fetchAllRumors();

      expect(rumors[0].pubDate).toBeInstanceOf(Date);
      // Verify the date was parsed correctly (matches input)
      expect(rumors[0].pubDate.toISOString()).toBe(testDate);
    });

    it("should have correct feed configuration", () => {
      const configs = _testExports.FEED_CONFIGS;

      // 5 feeds: 3 RSS + 2 Telegram
      expect(configs).toHaveLength(5);

      // Verify RSS feeds
      const rssFeeds = configs.filter((c) => c.type === "rss");
      expect(rssFeeds).toHaveLength(3);

      // Verify Telegram feeds (replaced broken Twitter/RSSHub feeds)
      const telegramFeeds = configs.filter((c) => c.type === "telegram");
      expect(telegramFeeds).toHaveLength(2);
      expect(telegramFeeds.every((f) => f.url.includes("tg.i-c-a.su"))).toBe(
        true,
      );
    });
  });
});
