import { NextResponse } from 'next/server';
import { FootballDataService } from '@/services/footballDataService';
import { supabase } from '@/lib/supabase';

export async function POST() {
  try {
    // Simple authentication check - in production, use proper authentication
    // For now, we'll allow any request. In production, add proper auth
    // Initialize the football data service
    const footballService = new FootballDataService();
    
    // Get current and upcoming season matches
    const currentYear = new Date().getFullYear();
    const seasons = [currentYear.toString(), (currentYear + 1).toString()];
    
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
          
          if (homeScoreValue !== null && awayScoreValue !== null) {
            homeScore = homeScoreValue;
            awayScore = awayScoreValue;
            
            if (homeScoreValue > awayScoreValue) {
              result = isBetisHome ? 'HOME_WIN' : 'AWAY_WIN';
            } else if (homeScoreValue < awayScoreValue) {
              result = isBetisHome ? 'AWAY_WIN' : 'HOME_WIN';
            } else {
              result = 'DRAW';
            }
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
            console.error(`❌ Error updating match ${match.id}:`, error);
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
            console.error(`❌ Error inserting match ${match.id}:`, error);
            errorCount++;
          } else {
            importedCount++;
          }
        }
      } catch (error) {
        console.error(`❌ Error processing match ${match.id}:`, error);
        errorCount++;
      }
    }
    
    const summary = {
      total: matches.length,
      imported: importedCount,
      updated: updatedCount,
      errors: errorCount
    };
    
    
    return NextResponse.json({
      success: true,
      message: `Sincronización completada: ${importedCount} nuevos, ${updatedCount} actualizados, ${errorCount} errores`,
      summary
    });
    
  } catch (error) {
    console.error('❌ Sync failed:', error);
    return NextResponse.json({
      success: false,
      message: 'Error durante la sincronización',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
