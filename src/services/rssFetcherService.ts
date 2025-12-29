import Parser from "rss-parser";
import { log } from "@/lib/logger";

export interface RumorItem {
  title: string;
  link: string;
  pubDate: Date;
  source: "Google News (Fichajes)" | "Google News (General)" | "BetisWeb";
  description?: string;
}

const RSS_FEEDS = {
  googleNewsFichajes:
    "https://news.google.com/rss/search?q=Real+Betis+fichajes+rumores&hl=es&gl=ES&ceid=ES:es",
  googleNewsGeneral:
    "https://news.google.com/rss/search?q=Real+Betis&hl=es&gl=ES&ceid=ES:es",
  betisWeb: "https://betisweb.com/feed/",
} as const;

const parser = new Parser({
  timeout: 10000, // 10 second timeout
  headers: {
    "User-Agent": "Pena-Betica-Escocesa/1.0",
  },
});

/**
 * Fetch rumors from a single RSS feed
 */
async function fetchFeed(
  url: string,
  source: RumorItem["source"],
): Promise<RumorItem[]> {
  try {
    const feed = await parser.parseURL(url);
    return feed.items.map((item) => ({
      title: item.title || "Sin título",
      link: item.link || "#",
      pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
      source,
      description: item.contentSnippet || item.content,
    }));
  } catch (error) {
    log.error("Failed to fetch RSS feed", error, { source, url });
    return [];
  }
}

/**
 * Fetch and merge all RSS feeds
 */
export async function fetchAllRumors(): Promise<RumorItem[]> {
  // Fetch all feeds in parallel
  const [googleFichajes, googleGeneral, betisWeb] = await Promise.all([
    fetchFeed(RSS_FEEDS.googleNewsFichajes, "Google News (Fichajes)"),
    fetchFeed(RSS_FEEDS.googleNewsGeneral, "Google News (General)"),
    fetchFeed(RSS_FEEDS.betisWeb, "BetisWeb"),
  ]);

  // Filter out news older than 6 months
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  // Merge, filter by date, and sort by date (newest first)
  const allRumors = [...googleFichajes, ...googleGeneral, ...betisWeb];
  return allRumors
    .filter((rumor) => rumor.pubDate >= sixMonthsAgo)
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
}
