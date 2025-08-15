import { NextRequest, NextResponse } from 'next/server';
import { FootballDataService } from '@/services/footballDataService';
import axios from 'axios';
import { supabase } from '@/lib/supabase';
import { checkAdminRole } from '@/lib/adminApiProtection';
import { getYear } from 'date-fns';
import { log } from '@/lib/logger';

/**
 * Determine match result label based on Betis home/away and score
 */
function getMatchResult(isBetisHome: boolean, homeScore: number, awayScore: number): string {
  if (homeScore > awayScore) {
    return 'HOME_WIN';
  }
  if (awayScore > homeScore) {
    return 'AWAY_WIN';
  }
  return 'DRAW';
}

export async function POST(
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  request: NextRequest
) {
  let user: any = null; // Declare user outside try block for catch access
  try {
    // Check admin role
    const { user: adminUser, isAdmin, error } = await checkAdminRole();
    user = adminUser;
    if (!isAdmin || error) {
      return NextResponse.json({
        success: false,
        message: error || 'Admin access required'
      }, { status: !adminUser ? 401 : 403 });
    }
    
    // Note: Rate limiting is now handled by Next.js middleware
    
    // Initialize the football data service
    const footballService = new FootballDataService(axios.create());
    
    // Get current and previous season matches
    // Use current year like the working script
    const currentSeason = getYear(new Date());
    const seasons = [currentSeason.toString(), (currentSeason - 1).toString(), '2023'];
    
    // Fetch matches from the API
    const matches = await footballService.getBetisMatchesForSeasons(seasons, 50);
    
    let importedCount = 0;
    let updatedCount = 0;
    let errorCount = 0;
    
    // Process each match
    for (const match of matches) {
      try {
        // Check if match already exists
        const { data: existingMatch } = await supabase
          .from('matches')
          .select('id')
          .eq('external_id', match.id)
          .single();
        
        // Convert API match to database format
        const isBetisHome = match.homeTeam.id === 90; // Real Betis team ID
        let result: string | undefined;
        let homeScore: number | undefined;
        let awayScore: number | undefined;
        
        if (match.status === 'FINISHED' && match.score?.fullTime) {
          const homeScoreValue = match.score.fullTime.home;
          const awayScoreValue = match.score.fullTime.away;

          if (homeScoreValue != null && awayScoreValue != null) {
            homeScore = homeScoreValue;
            awayScore = awayScoreValue;
            // compute result label
            result = getMatchResult(isBetisHome, homeScoreValue, awayScoreValue);
          }
        }
        
        const dbMatch = {
          opponent: isBetisHome ? match.awayTeam.name : match.homeTeam.name,
          date_time: match.utcDate,
          competition: match.competition.name,
          home_away: isBetisHome ? 'home' : 'away',
          notes: `Jornada ${match.matchday || 'N/A'} - Sincronizado desde Football-Data.org`,
          external_id: match.id,
          external_source: 'football-data.org',
          result: result,
          home_score: homeScore,
          away_score: awayScore,
          status: match.status,
          matchday: match.matchday
        };
        
        if (existingMatch) {
          // Update existing match
          const { error } = await supabase
            .from('matches')
            .update(dbMatch)
            .eq('id', existingMatch.id);
          
          if (error) {
            log.error('Failed to update match during sync', error, {
              matchId: match.id,
              externalMatchId: match.id,
              userId: user?.id
            });
            errorCount++;
          } else {
            updatedCount++;
          }
        } else {
          // Insert new match
          const { error } = await supabase
            .from('matches')
            .insert(dbMatch);
          
          if (error) {
            log.error('Failed to insert match during sync', error, {
              matchId: match.id,
              externalMatchId: match.id,
              userId: user?.id
            });
            errorCount++;
          } else {
            importedCount++;
          }
        }
      } catch (error) {
        log.error('Failed to process match during sync', error, {
          matchId: match.id,
          externalMatchId: match.id,
          userId: user?.id
        });
        errorCount++;
      }
    }
    
    const summary = {
      total: matches.length,
      imported: importedCount,
      updated: updatedCount,
      errors: errorCount
    };
    
    // Log successful sync operation as business event
    log.business('matches_sync_completed', summary, {
      userId: user?.id,
      seasons: seasons.join(',')
    });
    
    return NextResponse.json({
      success: true,
      message: `Sincronización completada: ${importedCount} nuevos, ${updatedCount} actualizados, ${errorCount} errores`,
      summary
    });
    
  } catch (error) {
    log.error('Match sync operation failed', error, {
      userId: user?.id || 'unknown'
    });
    return NextResponse.json({
      success: false,
      message: 'Error durante la sincronización',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
