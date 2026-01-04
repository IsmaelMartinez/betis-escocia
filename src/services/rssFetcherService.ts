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

const RSS_FEEDS = {
  googleNewsFichajes:
    "https://news.google.com/rss/search?q=Real+Betis+fichajes+rumores&hl=es&gl=ES&ceid=ES:es",
  googleNewsGeneral:
    "https://news.google.com/rss/search?q=Real+Betis&hl=es&gl=ES&ceid=ES:es",
  betisWeb: "https://betisweb.com/feed/",
} as const;

// X/Twitter feeds via RSSHub bridge (https://docs.rsshub.app/routes/social-media#twitter)
const X_RSS_FEEDS = {
  // Official Real Betis account - official announcements and signings
  realBetis: "https://rsshub.app/twitter/user/RealBetis",
  // Fabrizio Romano - top transfer news specialist ("Here we go")
  fabrizioRomano: "https://rsshub.app/twitter/user/FabrizioRomano",
  // Matteo Moretto - Tier 1 transfer journalist, covers La Liga
  matteoMorettoRelevo: "https://rsshub.app/twitter/user/MatteMoretto",
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
  // Fetch all feeds in parallel (traditional RSS + X feeds)
  const [
    googleFichajes,
    googleGeneral,
    betisWeb,
    xRealBetis,
    xFabrizioRomano,
    xMatteoMoretto,
  ] = await Promise.all([
    // Traditional RSS feeds
    fetchFeed(RSS_FEEDS.googleNewsFichajes, "Google News (Fichajes)"),
    fetchFeed(RSS_FEEDS.googleNewsGeneral, "Google News (General)"),
    fetchFeed(RSS_FEEDS.betisWeb, "BetisWeb"),
    // X/Twitter feeds via RSSHub
    fetchFeed(X_RSS_FEEDS.realBetis, "X: @RealBetis"),
    fetchFeed(X_RSS_FEEDS.fabrizioRomano, "X: @FabrizioRomano"),
    fetchFeed(X_RSS_FEEDS.matteoMorettoRelevo, "X: @MatteMoretto"),
  ]);

  // Filter out news older than 1 month
  const oneMonthAgo = new Date();
  oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);

  // Merge, filter by date, and sort by date (newest first)
  const allRumors = [
    ...googleFichajes,
    ...googleGeneral,
    ...betisWeb,
    ...xRealBetis,
    ...xFabrizioRomano,
    ...xMatteoMoretto,
  ];
  return allRumors
    .filter((rumor) => rumor.pubDate >= oneMonthAgo)
    .sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
}
