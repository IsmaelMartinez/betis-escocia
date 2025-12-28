import { createApiHandler } from "@/lib/apiUtils";
import { fetchAllRumors, type RumorItem } from "@/services/rssFetcherService";

// GET - Fetch all rumors from RSS feeds
export const GET = createApiHandler({
  auth: "none", // Public endpoint
  handler: async () => {
    const rumors = await fetchAllRumors();

    // Return data directly - createApiHandler will wrap it in { success: true, data: {...} }
    return {
      rumors: rumors.map((rumor: RumorItem) => ({
        title: rumor.title,
        link: rumor.link,
        pubDate: rumor.pubDate.toISOString(),
        source: rumor.source,
        description: rumor.description,
      })),
      totalCount: rumors.length,
      lastUpdated: new Date().toISOString(),
    };
  },
});
