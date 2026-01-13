import Parser from "rss-parser";
import { log } from "@/lib/logger";

// Default to 24 hours, configurable via environment variable
export const DEFAULT_MAX_AGE_HOURS = 24;

export interface RumorItem {
  title: string;
  link: string;
  pubDate: Date;
  source:
    | "Google News (Fichajes)"
    | "Google News (General)"
    | "BetisWeb"
    | "Football España (Betis)"
    | "Football España (Transfers)";
  description?: string;
}

export interface FetchOptions {
  maxAgeHours?: number;
}

interface FeedConfig {
  url: string;
  source: RumorItem["source"];
  type: "rss";
}

// Unified feed configuration - add new feeds here
const FEED_CONFIGS: FeedConfig[] = [
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
  {
    url: "https://www.football-espana.net/category/la-liga/real-betis/feed",
    source: "Football España (Betis)",
    type: "rss",
  },
  {
    url: "https://www.football-espana.net/category/transfer-news/feed",
    source: "Football España (Transfers)",
    type: "rss",
  },
];

const parser = new Parser({
  timeout: 30000,
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
    log.error("Failed to fetch RSS feed", error, {
      source: config.source,
      url: config.url,
    });
    return [];
  }
}


/**
 * Fetch and merge all RSS feeds
 * @param options - Optional configuration for fetching
 * @param options.maxAgeHours - Maximum age of news in hours (default: 24, env: NEWS_MAX_AGE_HOURS)
 */
export async function fetchAllRumors(
  options: FetchOptions = {},
): Promise<RumorItem[]> {
  // Fetch all RSS feeds in parallel
  const allRumors = (
    await Promise.all(FEED_CONFIGS.map((config) => fetchFeed(config)))
  ).flat();

  // Get max age from: options > env variable > default (24 hours)
  const envMaxAgeHours = parseInt(process.env.NEWS_MAX_AGE_HOURS || "", 10);
  const maxAgeHours =
    options.maxAgeHours ??
    (!isNaN(envMaxAgeHours) && envMaxAgeHours > 0
      ? envMaxAgeHours
      : DEFAULT_MAX_AGE_HOURS);

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
};
