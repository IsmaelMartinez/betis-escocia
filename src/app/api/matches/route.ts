import { NextResponse } from 'next/server';
import { FootballDataService } from '@/services/footballDataService';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') ?? '10', 10);
    const offset = parseInt(searchParams.get('offset') ?? '0', 10);
    const type = searchParams.get('type') ?? 'all'; // 'all', 'upcoming', 'recent'
    
    const footballService = new FootballDataService();
    
    let matches;
    switch (type) {
      case 'upcoming':
        matches = await footballService.getUpcomingBetisMatches(limit, offset);
        break;
      case 'recent':
        matches = await footballService.getRecentBetisResults(limit, offset);
        break;
      default:
        matches = await footballService.getBetisMatches(limit, offset);
        break;
    }
    
    return NextResponse.json({
      success: true,
      matches,
      count: matches.length,
      limit,
      offset,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error fetching matches from Football-Data.org:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to fetch matches data',
        message: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      }, 
      { status: 500 }
    );
  }
}

// Add ISR caching configuration
export const revalidate = 1800; // 30 minutes cache
