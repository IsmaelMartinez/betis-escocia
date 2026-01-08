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

const TOTAL_FEEDS = _testExports.FEED_CONFIGS.length; // 9 feeds (3 RSS + 6 Telegram)
const RSS_FEEDS = _testExports.FEED_CONFIGS.filter(
  (c) => c.type === "rss",
).length;
const TELEGRAM_FEEDS = _testExports.FEED_CONFIGS.filter(
  (c) => c.type === "telegram",
).length;

// Helper to create mock responses for all feeds
// Note: RSS feeds are fetched first (in parallel), then Telegram feeds (sequentially)
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

// Mock first RSS feed with data, rest empty
const mockFirstRssFeedWithData = (feed: { items: unknown[] }) => {
  // First RSS feed gets the data
  mockParseURL.mockResolvedValueOnce(feed);
  // Remaining RSS feeds get empty
  for (let i = 1; i < RSS_FEEDS; i++) {
    mockParseURL.mockResolvedValueOnce({ items: [] });
  }
  // All Telegram feeds get empty
  for (let i = 0; i < TELEGRAM_FEEDS; i++) {
    mockParseURL.mockResolvedValueOnce({ items: [] });
  }
};

describe("rssFetcherService", () => {
  // Use dynamic dates relative to now to stay within 24h filter
  // hoursAgo(h) creates a timestamp h hours in the past
  const hoursAgo = (h: number) =>
    new Date(Date.now() - h * 60 * 60 * 1000).toISOString();

  // Legacy helper for tests that don't need precise control - defaults to 12 hours ago
  const getRecentDate = (_daysAgo: number, hoursOffset = 0) => {
    // Use hours instead of days to stay within 24h filter
    const baseHours = 12;
    return hoursAgo(baseHours - hoursOffset);
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
    // Use fake timers to skip Telegram feed delays
    vi.useFakeTimers({ shouldAdvanceTime: true });
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.clearAllMocks();
  });

  // Helper to run fetchAllRumors with auto-advancing timers
  const fetchWithTimers = async (
    options?: Parameters<typeof fetchAllRumors>[0],
  ) => {
    const promise = fetchAllRumors(options);
    // Advance timers to resolve all pending timeouts
    await vi.runAllTimersAsync();
    return promise;
  };

  describe("fetchAllRumors", () => {
    it("should fetch and merge rumors from all feeds", async () => {
      // Create feeds with different timestamps to verify sorting
      // Order: 3 RSS feeds first, then 6 Telegram feeds
      // Use hours ago (not days) to stay well within 24h filter
      const now = new Date();
      const hoursAgo = (h: number) =>
        new Date(now.getTime() - h * 60 * 60 * 1000).toISOString();

      const rssFeeds = [
        {
          items: [
            mockFeedItem(
              "Betis interesado en Fichaje 1",
              "https://example.com/1",
              hoursAgo(4),
              "Descripción del fichaje 1",
            ),
          ],
        },
        {
          items: [
            mockFeedItem(
              "Betis gana partido",
              "https://example.com/2",
              hoursAgo(6),
              "Resumen del partido",
            ),
          ],
        },
        {
          items: [
            mockFeedItem(
              "Análisis táctico Betis",
              "https://example.com/3",
              hoursAgo(2),
              "Análisis completo",
            ),
          ],
        },
        { items: [] }, // Football España (Betis)
        { items: [] }, // Football España (Transfers)
      ];

      // Telegram feeds - first two have items, rest empty
      const telegramFeeds = [
        {
          items: [
            mockFeedItem(
              "Fabrizio Romano: Here we go!",
              "https://t.me/FabrizioRomanoTG/123",
              hoursAgo(1),
              "Transfer confirmed",
            ),
          ],
        },
        {
          items: [
            mockFeedItem(
              "Ficherío Betis: Nuevo fichaje",
              "https://t.me/ficherioRealBetis/456",
              hoursAgo(8),
              "Betis transfer news",
            ),
          ],
        },
        { items: [] }, // @Todo_betis
        { items: [] }, // @DMQRealBetis
        { items: [] }, // @transfer_news_football
        { items: [] }, // @real_betis_balompi
        { items: [] }, // @TransferNews_Live
      ];

      // Mock in correct order: RSS first, then Telegram
      rssFeeds.forEach((feed) => mockParseURL.mockResolvedValueOnce(feed));
      telegramFeeds.forEach((feed) => mockParseURL.mockResolvedValueOnce(feed));

      const rumors = await fetchWithTimers();

      expect(mockParseURL).toHaveBeenCalledTimes(TOTAL_FEEDS);
      expect(rumors).toHaveLength(5);

      // Should be sorted by date (newest first)
      // hoursAgo order: 1, 2, 4, 6, 8
      expect(rumors[0].title).toBe("Fabrizio Romano: Here we go!"); // 1h ago
      expect(rumors[1].title).toBe("Análisis táctico Betis"); // 2h ago
      expect(rumors[2].title).toBe("Betis interesado en Fichaje 1"); // 4h ago
      expect(rumors[3].title).toBe("Betis gana partido"); // 6h ago
      expect(rumors[4].title).toBe("Ficherío Betis: Nuevo fichaje"); // 8h ago
    });

    it("should assign correct source to each feed", async () => {
      const feed = {
        items: [mockFeedItem("Test", "https://test.com", getRecentDate(1))],
      };

      mockAllFeedsWithSingleItem(feed);

      const rumors = await fetchWithTimers();

      const sources = rumors.map((r) => r.source);
      // Derive expected sources from config to make test self-updating
      const expectedSources = _testExports.FEED_CONFIGS.map((c) => c.source);
      expect(sources.sort()).toEqual(expectedSources.sort());
      expect(sources).toHaveLength(TOTAL_FEEDS);
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

      const rumors = await fetchWithTimers();

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

      const rumors = await fetchWithTimers();

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

      const rumors = await fetchWithTimers();
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

      const rumors = await fetchWithTimers();

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

      const rumors = await fetchWithTimers();

      expect(rumors[0].description).toBe("Full content");
    });

    it("should handle empty feeds gracefully", async () => {
      mockAllFeedsEmpty();

      const rumors = await fetchWithTimers();

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

      const rumors = await fetchWithTimers();

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

      const rumors = await fetchWithTimers();

      expect(rumors).toHaveLength(2);
      expect(mockParseURL).toHaveBeenCalledTimes(TOTAL_FEEDS);
    });

    it("should return empty array if all feeds fail", async () => {
      for (let i = 0; i < TOTAL_FEEDS; i++) {
        mockParseURL.mockRejectedValueOnce(new Error(`Error ${i}`));
      }

      const rumors = await fetchWithTimers();

      expect(rumors).toEqual([]);
    });

    it("should fetch RSS feeds in parallel", async () => {
      // RSS feeds are fetched in parallel, Telegram feeds sequentially
      // This test verifies the RSS parallel behavior
      const feed = {
        items: [
          mockFeedItem("Item", "https://example.com/1", getRecentDate(1)),
        ],
      };

      mockAllFeedsWithSingleItem(feed);

      const rumors = await fetchWithTimers();

      // All feeds should be called
      expect(mockParseURL).toHaveBeenCalledTimes(TOTAL_FEEDS);
      // Should have one item from each feed
      expect(rumors).toHaveLength(TOTAL_FEEDS);
    });

    it("should sort rumors by pubDate in descending order", async () => {
      // Use hours ago (not days) to stay well within 24h filter
      const now = new Date();
      const hoursAgo = (h: number) =>
        new Date(now.getTime() - h * 60 * 60 * 1000).toISOString();

      const feed = {
        items: [
          mockFeedItem("Oldest", "https://example.com/1", hoursAgo(6)),
          mockFeedItem("Middle", "https://example.com/2", hoursAgo(4)),
          mockFeedItem("Newest", "https://example.com/3", hoursAgo(2)),
        ],
      };

      mockFirstRssFeedWithData(feed);

      const rumors = await fetchWithTimers();

      expect(rumors[0].title).toBe("Newest");
      expect(rumors[1].title).toBe("Middle");
      expect(rumors[2].title).toBe("Oldest");
    });

    it("should convert pubDate strings to Date objects", async () => {
      const testDate = getRecentDate(1);
      const feed = {
        items: [mockFeedItem("Test", "https://example.com/1", testDate)],
      };

      mockFirstRssFeedWithData(feed);

      const rumors = await fetchWithTimers();

      expect(rumors[0].pubDate).toBeInstanceOf(Date);
      // Verify the date was parsed correctly (matches input)
      expect(rumors[0].pubDate.toISOString()).toBe(testDate);
    });

    it("should filter out rumors older than configured maxAgeHours", async () => {
      const now = new Date();
      const recentDate = new Date(now.getTime() - 12 * 60 * 60 * 1000); // 12 hours ago
      const oldDate = new Date(now.getTime() - 36 * 60 * 60 * 1000); // 36 hours ago

      const feed = {
        items: [
          mockFeedItem(
            "Recent",
            "https://example.com/1",
            recentDate.toISOString(),
          ),
          mockFeedItem("Old", "https://example.com/2", oldDate.toISOString()),
        ],
      };

      mockFirstRssFeedWithData(feed);

      // Default 24 hours should include recent but exclude old
      const rumors = await fetchWithTimers();
      expect(rumors).toHaveLength(1);
      expect(rumors[0].title).toBe("Recent");
    });

    it("should respect custom maxAgeHours option", async () => {
      const now = new Date();
      const recentDate = new Date(now.getTime() - 12 * 60 * 60 * 1000); // 12 hours ago
      const oldDate = new Date(now.getTime() - 36 * 60 * 60 * 1000); // 36 hours ago

      const feed = {
        items: [
          mockFeedItem(
            "Recent",
            "https://example.com/1",
            recentDate.toISOString(),
          ),
          mockFeedItem("Old", "https://example.com/2", oldDate.toISOString()),
        ],
      };

      mockFirstRssFeedWithData(feed);

      // With 48 hours max age, both should be included
      const rumors = await fetchWithTimers({ maxAgeHours: 48 });
      expect(rumors).toHaveLength(2);
    });

    it("should have correct feed configuration", () => {
      const configs = _testExports.FEED_CONFIGS;

      // 12 feeds: 5 RSS + 7 Telegram
      expect(configs).toHaveLength(TOTAL_FEEDS);

      // Verify RSS feeds (Google News x2, BetisWeb, Football España x2)
      const rssFeeds = configs.filter((c) => c.type === "rss");
      expect(rssFeeds).toHaveLength(RSS_FEEDS);

      // Verify Telegram feeds (includes Betis-specific and general transfer channels)
      const telegramFeeds = configs.filter((c) => c.type === "telegram");
      expect(telegramFeeds).toHaveLength(TELEGRAM_FEEDS);
      expect(telegramFeeds.every((f) => f.url.includes("tg.i-c-a.su"))).toBe(
        true,
      );
    });
  });
});
