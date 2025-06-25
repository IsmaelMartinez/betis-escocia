import { NextResponse } from 'next/server';
import { FootballDataService } from '@/services/footballDataService';
import fs from 'fs';
import path from 'path';
import type { Match, MatchCardProps } from '@/types/match';

// Helper to read local match data as fallback
const readLocalMatches = (): { upcoming: Match[], recent: Match[], conferenceLeague: Match[], friendlies: Match[] } => {
  try {
    const filePath = path.join(process.cwd(), 'data', 'matches.json');
    const fileContents = fs.readFileSync(filePath, 'utf8');
    return JSON.parse(fileContents);
  } catch (error) {
    console.error('Error reading local matches:', error);
    return { upcoming: [], recent: [], conferenceLeague: [], friendlies: [] };
  }
};

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const type = url.searchParams.get('type') ?? 'all'; // 'all', 'upcoming', 'recent', 'conference', 'friendlies'
    const useLive = url.searchParams.get('live') === 'true'; // Add ?live=true to use live API

    let matches: (Match | MatchCardProps)[] = [];

    if (useLive) {
      // Use live Football-Data.org API
      try {
        const service = new FootballDataService();
        
        switch (type) {
          case 'upcoming':
            matches = await service.getUpcomingBetisMatchesForCards(10);
            break;
          case 'recent':
            matches = await service.getRecentBetisResultsForCards(10);
            break;
          case 'all': {
            const upcoming = await service.getUpcomingBetisMatchesForCards(5);
            const recent = await service.getRecentBetisResultsForCards(5);
            matches = [...upcoming, ...recent];
            break;
          }
          default: {
            // For conference and friendlies, fall back to local data
            const localMatches = readLocalMatches();
            matches = type === 'conference' ? localMatches.conferenceLeague : localMatches.friendlies;
            break;
          }
        }
      } catch (apiError) {
        console.error('Live API error, falling back to local data:', apiError);
        // Fall back to local data if API fails
        const localMatches = readLocalMatches();
        switch (type) {
          case 'upcoming':
            matches = localMatches.upcoming;
            break;
          case 'recent':
            matches = localMatches.recent;
            break;
          case 'conference':
            matches = localMatches.conferenceLeague;
            break;
          case 'friendlies':
            matches = localMatches.friendlies;
            break;
          default:
            matches = [...localMatches.upcoming, ...localMatches.recent, ...localMatches.conferenceLeague, ...localMatches.friendlies];
            break;
        }
      }
    } else {
      // Use local JSON data (current behavior)
      const allMatches = readLocalMatches();

      switch (type) {
        case 'upcoming':
          matches = allMatches.upcoming;
          break;
        case 'recent':
          matches = allMatches.recent;
          break;
        case 'conference':
          matches = allMatches.conferenceLeague;
          break;
        case 'friendlies':
          matches = allMatches.friendlies;
          break;
        default:
          matches = [...allMatches.upcoming, ...allMatches.recent, ...allMatches.conferenceLeague, ...allMatches.friendlies];
          break;
      }
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
        error: 'Error interno del servidor al obtener los eventos',
        matches: [],
        count: 0,
      },
      { status: 500 }
    );
  }
}
export const revalidate = 1800; // 30 minutes cache
export const dynamic = 'force-dynamic'; // This route requires dynamic rendering
