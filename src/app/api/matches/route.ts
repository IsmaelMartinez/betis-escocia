import { createApiHandler } from '@/lib/apiUtils';
import { FootballDataService } from '@/services/footballDataService';
import axios from 'axios';
import type { Match, MatchCardProps } from '@/types/match';
import { z } from 'zod';
import { log } from '@/lib/logger';

// Request validation schema
const matchesQuerySchema = z.object({
  type: z.enum(['all', 'upcoming', 'recent', 'conference', 'friendlies']).default('all'),
  live: z.string().default('false').transform(val => val === 'true')
});

type MatchesResponse = {
  success: boolean;
  matches: (Match | MatchCardProps)[];
  count: number;
  timestamp: string;
  source: 'live-api' | 'local-data';
};

async function getMatches(params: z.infer<typeof matchesQuerySchema>): Promise<MatchesResponse> {
  const { type, live: useLive } = params;
  let matches: (Match | MatchCardProps)[] = [];

  if (useLive) {
    // Use live Football-Data.org API
    try {
      const service = new FootballDataService(axios.create());
      
      switch (type) {
        case 'upcoming':
          matches = (await service.getUpcomingBetisMatchesForCards(10)) || [];
          break;
        case 'recent':
          matches = (await service.getRecentBetisResultsForCards(10)) || [];
          break;
        case 'all': {
          const upcoming = (await service.getUpcomingBetisMatchesForCards(5)) || [];
          const recent = (await service.getRecentBetisResultsForCards(5)) || [];
          matches = [...upcoming, ...recent];
          break;
        }
        default:
          matches = [];
          break;
      }
      
      log.info('Successfully fetched live match data', undefined, {
        type,
        matchCount: matches.length,
        source: 'football-data-api'
      });
    } catch (apiError) {
      log.warn('Live API error, falling back to empty results', undefined, {
        error: apiError instanceof Error ? apiError.message : String(apiError),
        type
      });
      matches = [];
    }
  } else {
    matches = [];
  }

  return {
    success: true,
    matches,
    count: matches.length,
    timestamp: new Date().toISOString(),
    source: useLive ? 'live-api' : 'local-data',
  };
}

export const GET = createApiHandler({
  auth: 'none',
  schema: matchesQuerySchema,
  handler: async (validatedData) => {
    return await getMatches(validatedData);
  }
});

export const revalidate = 1800; // 30 minutes cache
export const dynamic = 'force-dynamic'; // This route requires dynamic rendering