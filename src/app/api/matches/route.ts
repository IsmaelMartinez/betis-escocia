import { NextResponse } from 'next/server';
import { FootballDataService } from '@/services/footballDataService';
import axios from 'axios';
import type { Match, MatchCardProps } from '@/types/match';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get('type') ?? 'all'; // 'all', 'upcoming', 'recent', 'conference', 'friendlies'
    const useLive = url.searchParams.get('live') === 'true'; // Add ?live=true to use live API

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
      } catch (apiError) {
        console.error('Live API error:', apiError);
        matches = [];
      }
    } else {
      matches = [];
    }

    return NextResponse.json({
      success: true,
      matches,
      count: matches.length,
      timestamp: new Date().toISOString(),
      source: useLive ? 'live-api' : 'local-data',
    });
  } catch (error) {
    console.error('Error fetching matches:', error);

    return NextResponse.json(
      {
        success: false,
        error: 'Error interno al cargar los partidos',
        matches: [],
        count: 0,
      },
      { status: 500 }
    );
  }
}
export const revalidate = 1800; // 30 minutes cache
export const dynamic = 'force-dynamic'; // This route requires dynamic rendering
