import { createApiHandler } from '@/lib/apiUtils';
import { FootballDataService } from '@/services/footballDataService';
import axios from 'axios';
import { supabase } from '@/lib/supabase';

export const POST = createApiHandler({
  auth: 'admin',
  handler: async (_, context) => {
    // Extract matchId from URL path
    const matchId = context.request.url.split('/').pop();
    const matchIdNumber = parseInt(matchId || '');
    
    if (isNaN(matchIdNumber)) {
      throw new Error('Invalid match ID provided');
    }

    console.log(`🔄 Updating individual match ID: ${matchIdNumber}`);
    
    // Initialize the football data service
    const footballService = new FootballDataService(axios.create());
    
    // Get the specific match from the API
    const match = await footballService.getMatchById(matchIdNumber);
    
    if (!match) {
      throw new Error(`Match with ID ${matchIdNumber} not found in API`);
    }

    console.log(`✅ Found match: ${match.homeTeam.name} vs ${match.awayTeam.name} on ${match.utcDate}`);
    
    // Check if match already exists in database
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
      notes: `Jornada ${match.matchday || 'N/A'} - Actualizado desde Football-Data.org`,
      external_id: match.id,
      external_source: 'football-data.org',
      result: result,
      home_score: homeScore,
      away_score: awayScore,
      status: match.status,
      matchday: match.matchday
    };
    
    let operation = '';
    
    if (existingMatch) {
      // Update existing match
      const { error } = await supabase
        .from('matches')
        .update(dbMatch)
        .eq('id', existingMatch.id);
      
      if (error) {
        console.error(`❌ Error updating match ${match.id}:`, error);
        throw new Error(`Error updating match: ${error.message}`);
      }
      
      operation = 'updated';
      console.log(`✅ Updated match ${match.id} in database`);
    } else {
      // Insert new match
      const { error } = await supabase
        .from('matches')
        .insert(dbMatch);
      
      if (error) {
        console.error(`❌ Error inserting match ${match.id}:`, error);
        throw new Error(`Error inserting match: ${error.message}`);
      }
      
      operation = 'created';
      console.log(`✅ Created new match ${match.id} in database`);
    }
    
    return {
      success: true,
      message: `Match ${operation} successfully`,
      match: {
        id: match.id,
        opponent: dbMatch.opponent,
        date: dbMatch.date_time,
        competition: dbMatch.competition,
        homeAway: dbMatch.home_away,
        status: dbMatch.status,
        result: dbMatch.result,
        score: homeScore !== undefined && awayScore !== undefined ? `${homeScore}-${awayScore}` : null
      }
    };
  }
});
