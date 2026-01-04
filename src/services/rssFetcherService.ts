import Parser from "rss-parser";
import { log } from "@/lib/logger";

export interface RumorItem {
  title: string;
  link: string;
  pubDate: Date;
  source:
    | "Google News (Fichajes)"
    | "Google News (General)"
    | "BetisWeb"
    | "X: @RealBetis"
    | "X: @FabrizioRomano"
    | "X: @MatteMoretto";
  description?: string;
}

interface FeedConfig {
  url: string;
  source: RumorItem["source"];
  type: "rss" | "rsshub";
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
  // X/Twitter feeds via RSSHub bridge (https://docs.rsshub.app/routes/social-media#twitter)
  {
    url: "https://rsshub.app/twitter/user/RealBetis",
    source: "X: @RealBetis",
    type: "rsshub",
  },
  {
    url: "https://rsshub.app/twitter/user/FabrizioRomano",
    source: "X: @FabrizioRomano",
    type: "rsshub",
  },
  {
    url: "https://rsshub.app/twitter/user/MatteMoretto",
    source: "X: @MatteMoretto",
    type: "rsshub",
  },
];

const parser = new Parser({
  timeout: 10000, // 10 second timeout
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
    // Distinguish RSSHub failures for monitoring
    if (config.type === "rsshub") {
      log.error("RSSHub bridge failed - X feed unavailable", error, {
        source: config.source,
        url: config.url,
        feedType: "rsshub",
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
 * Fetch and merge all RSS feeds
 */
export async function fetchAllRumors(): Promise<RumorItem[]> {
  // Fetch all feeds in parallel
  const allRumorsArrays = await Promise.all(
    FEED_CONFIGS.map((config) => fetchFeed(config)),
  );
  const allRumors = allRumorsArrays.flat();

  // Filter out news older than 1 month
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  return allRumors
    .filter((rumor) => rumor.pubDate >= oneMonthAgo)
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
}

// Export for testing
export const _testExports = {
  FEED_CONFIGS,
};
