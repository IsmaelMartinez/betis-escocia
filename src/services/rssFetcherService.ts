import Parser from 'rss-parser';

export interface RumorItem {
  title: string;
  link: string;
  pubDate: Date;
  source: 'Google News (Fichajes)' | 'Google News (General)' | 'BetisWeb';
  description?: string;
}

const RSS_FEEDS = {
  googleNewsFichajes: 'https://news.google.com/rss/search?q=Real+Betis+fichajes+rumores&hl=es&gl=ES&ceid=ES:es',
  googleNewsGeneral: 'https://news.google.com/rss/search?q=Real+Betis&hl=es&gl=ES&ceid=ES:es',
  betisWeb: 'https://betisweb.com/feed/',
} as const;

export class RSSFetcherService {
  private parser: Parser;

  constructor() {
    this.parser = new Parser({
      timeout: 10000, // 10 second timeout
      headers: {
        'User-Agent': 'Pena-Betica-Escocesa/1.0',
      },
    });
  }

  async fetchGoogleNewsFichajes(): Promise<RumorItem[]> {
    try {
      const feed = await this.parser.parseURL(RSS_FEEDS.googleNewsFichajes);
      return feed.items.map(item => ({
        title: item.title || 'Sin título',
        link: item.link || '#',
        pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
        source: 'Google News (Fichajes)',
        description: item.contentSnippet || item.content,
      }));
    } catch (error) {
      console.error('Error fetching Google News Fichajes feed:', error);
      return [];
    }
  }

  async fetchGoogleNewsGeneral(): Promise<RumorItem[]> {
    try {
      const feed = await this.parser.parseURL(RSS_FEEDS.googleNewsGeneral);
      return feed.items.map(item => ({
        title: item.title || 'Sin título',
        link: item.link || '#',
        pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
        source: 'Google News (General)',
        description: item.contentSnippet || item.content,
      }));
    } catch (error) {
      console.error('Error fetching Google News General feed:', error);
      return [];
    }
  }

  async fetchBetisWeb(): Promise<RumorItem[]> {
    try {
      const feed = await this.parser.parseURL(RSS_FEEDS.betisWeb);
      return feed.items.map(item => ({
        title: item.title || 'Sin título',
        link: item.link || '#',
        pubDate: item.pubDate ? new Date(item.pubDate) : new Date(),
        source: 'BetisWeb',
        description: item.contentSnippet || item.content,
      }));
    } catch (error) {
      console.error('Error fetching BetisWeb feed:', error);
      return [];
    }
  }

  async fetchAllRumors(): Promise<RumorItem[]> {
    // Fetch all feeds in parallel
    const [googleFichajes, googleGeneral, betisWeb] = await Promise.all([
      this.fetchGoogleNewsFichajes(),
      this.fetchGoogleNewsGeneral(),
      this.fetchBetisWeb(),
    ]);

    // Merge and sort by date (newest first)
    const allRumors = [...googleFichajes, ...googleGeneral, ...betisWeb];
    return allRumors.sort((a, b) => b.pubDate.getTime() - a.pubDate.getTime());
  }
}
