import Parser from "rss-parser";
import { log } from "@/lib/logger";

// Default to 24 hours, configurable via environment variable
const DEFAULT_MAX_AGE_HOURS = 24;

export interface RumorItem {
  title: string;
  link: string;
  pubDate: Date;
  source:
    | "Google News (Fichajes)"
    | "Google News (General)"
    | "BetisWeb"
    | "Telegram: @FabrizioRomanoTG"
    | "Telegram: @ficherioRealBetis"
    | "Telegram: @Todo_betis"
    | "Telegram: @DMQRealBetis"
    | "Telegram: @transfer_news_football"
    | "Telegram: @real_betis_balompi";
  description?: string;
}

export interface FetchOptions {
  maxAgeHours?: number;
}

interface FeedConfig {
  url: string;
  source: RumorItem["source"];
  type: "rss" | "telegram";
}

// Unified feed configuration - add new feeds here
const FEED_CONFIGS: FeedConfig[] = [
  // Traditional RSS feeds
  {
    url: "https://news.google.com/rss/search?q=Real+Betis+fichajes+rumores&hl=es&gl=ES&ceid=ES:es",
    source: "Google News (Fichajes)",
    type: "rss",
  },
  {
    url: "https://news.google.com/rss/search?q=Real+Betis&hl=es&gl=ES&ceid=ES:es",
    source: "Google News (General)",
    type: "rss",
  },
  {
    url: "https://betisweb.com/feed/",
    source: "BetisWeb",
    type: "rss",
  },
  // Telegram feeds via tg.i-c-a.su (free, no auth required)
  // Replaces broken RSSHub Twitter feeds - see https://tg.i-c-a.su/
  {
    url: "https://tg.i-c-a.su/rss/FabrizioRomanoTG",
    source: "Telegram: @FabrizioRomanoTG",
    type: "telegram",
  },
  {
    url: "https://tg.i-c-a.su/rss/ficherioRealBetis",
    source: "Telegram: @ficherioRealBetis",
    type: "telegram",
  },
  // Betis-specific Telegram channels
  {
    url: "https://tg.i-c-a.su/rss/Todo_betis",
    source: "Telegram: @Todo_betis",
    type: "telegram",
  },
  {
    url: "https://tg.i-c-a.su/rss/DMQRealBetis",
    source: "Telegram: @DMQRealBetis",
    type: "telegram",
  },
  // General transfer news channels
  {
    url: "https://tg.i-c-a.su/rss/transfer_news_football",
    source: "Telegram: @transfer_news_football",
    type: "telegram",
  },
  {
    url: "https://tg.i-c-a.su/rss/real_betis_balompi",
    source: "Telegram: @real_betis_balompi",
    type: "telegram",
  },
];

const parser = new Parser({
  timeout: 30000, // 30 second timeout - tg.i-c-a.su can be slow
  headers: {
    "User-Agent": "Pena-Betica-Escocesa/1.0",
  },
});

/**
 * Fetch rumors from a single RSS feed
 */
async function fetchFeed(config: FeedConfig): Promise<RumorItem[]> {
  try {
    const feed = await parser.parseURL(config.url);
    return feed.items.map((item) => ({
      title: item.title || "Sin título",
      link: item.link || "#",
      pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
      source: config.source,
      description: item.contentSnippet || item.content,
    }));
  } catch (error) {
    // Distinguish feed types for monitoring
    if (config.type === "telegram") {
      log.error("Telegram feed bridge failed", error, {
        source: config.source,
        url: config.url,
        feedType: "telegram",
      });
    } else {
      log.error("Failed to fetch RSS feed", error, {
        source: config.source,
        url: config.url,
        feedType: "rss",
      });
    }
    return [];
  }
}

/**
 * Fetch a Telegram feed with retry logic for rate limiting
 */
async function fetchTelegramFeedWithRetry(
  config: FeedConfig,
  maxRetries = 3,
): Promise<RumorItem[]> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const feed = await parser.parseURL(config.url);
      return feed.items.map((item) => ({
        title: item.title || "Sin título",
        link: item.link || "#",
        pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
        source: config.source,
        description: item.contentSnippet || item.content,
      }));
    } catch (error) {
      const is420 =
        error instanceof Error && error.message.includes("Status code 420");
      const isTimeout =
        error instanceof Error && error.message.includes("timed out");

      if ((is420 || isTimeout) && attempt < maxRetries) {
        // Exponential backoff: 10s, 20s, 40s
        const backoffMs = 10000 * Math.pow(2, attempt - 1);
        log.business("telegram_feed_retry", {
          source: config.source,
          attempt,
          backoffMs,
          reason: is420 ? "rate_limit" : "timeout",
        });
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
        continue;
      }

      log.error("Telegram feed bridge failed", error, {
        source: config.source,
        url: config.url,
        feedType: "telegram",
        attempt,
        maxRetries,
      });
      return [];
    }
  }
  return [];
}

// Delay between Telegram feed requests to avoid rate limiting (tg.i-c-a.su)
// Default 5 seconds - can be overridden via environment variable
const getTelegramFeedDelay = () =>
  parseInt(process.env.TELEGRAM_FEED_DELAY_MS || "", 10) || 5000;

/**
 * Fetch and merge all RSS feeds
 * @param options - Optional configuration for fetching
 * @param options.maxAgeHours - Maximum age of news in hours (default: 24, env: NEWS_MAX_AGE_HOURS)
 */
export async function fetchAllRumors(
  options: FetchOptions = {},
): Promise<RumorItem[]> {
  // Separate RSS and Telegram feeds
  const rssFeeds = FEED_CONFIGS.filter((c) => c.type === "rss");
  const telegramFeeds = FEED_CONFIGS.filter((c) => c.type === "telegram");

  // Fetch RSS feeds in parallel (different servers, no rate limiting)
  const rssResults = await Promise.all(
    rssFeeds.map((config) => fetchFeed(config)),
  );

  // Fetch Telegram feeds sequentially with delay and retry logic to handle rate limiting
  const telegramResults: RumorItem[][] = [];
  const telegramDelay = getTelegramFeedDelay();
  for (const config of telegramFeeds) {
    if (telegramResults.length > 0 && telegramDelay > 0) {
      await new Promise((resolve) => setTimeout(resolve, telegramDelay));
    }
    telegramResults.push(await fetchTelegramFeedWithRetry(config));
  }

  const allRumors = [...rssResults, ...telegramResults].flat();

  // Get max age from: options > env variable > default (24 hours)
  const maxAgeHours =
    options.maxAgeHours ??
    (parseInt(process.env.NEWS_MAX_AGE_HOURS || "", 10) ||
      DEFAULT_MAX_AGE_HOURS);

  const cutoffDate = new Date();
  cutoffDate.setHours(cutoffDate.getHours() - maxAgeHours);

  const filtered = allRumors.filter((rumor) => rumor.pubDate >= cutoffDate);

  log.business("rumors_filtered_by_age", {
    total: allRumors.length,
    filtered: filtered.length,
    maxAgeHours,
    cutoffDate: cutoffDate.toISOString(),
  });

  return filtered.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
}

// Export for testing
export const _testExports = {
  FEED_CONFIGS,
  getTelegramFeedDelay,
};
