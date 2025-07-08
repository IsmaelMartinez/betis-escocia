#!/usr/bin/env node

/**
 * Sync LaLiga matches from football-data.org API to database
 * 
 * This script fetches current season LaLiga matches for Real Betis
 * and syncs them with the Supabase database
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const footballDataApiKey = process.env.FOOTBALL_DATA_API_KEY;
const footballDataApiUrl = process.env.FOOTBALL_DATA_API_URL;
const betisTeamId = process.env.REAL_BETIS_TEAM_ID || '90';
const laligaCompetitionId = process.env.LALIGA_COMPETITION_ID || 'PD';

if (!supabaseUrl || !supabaseKey || !footballDataApiKey) {
  console.error('❌ Missing required environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY, FOOTBALL_DATA_API_KEY');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// Helper function to make API requests with rate limiting
async function makeApiRequest(url) {
  console.log(`🔄 Fetching: ${url}`);
  
  const response = await fetch(url, {
    headers: {
      'X-Auth-Token': footballDataApiKey,
      'User-Agent': 'Betis-Escocia-App/1.0'
    }
  });

  if (!response.ok) {
    if (response.status === 429) {
      console.log('⏱️  Rate limit hit, waiting 60 seconds...');
      await new Promise(resolve => setTimeout(resolve, 60000));
      return makeApiRequest(url);
    }
    throw new Error(`API request failed: ${response.status} ${response.statusText}`);
  }

  // Rate limiting: wait 6 seconds between requests (10 requests per minute limit)
  await new Promise(resolve => setTimeout(resolve, 6000));
  
  return response.json();
}

// Helper function to convert API match to database format
function convertApiMatchToDbFormat(match) {
  const isBetisHome = match.homeTeam.id === parseInt(betisTeamId);
  const opponent = isBetisHome ? match.awayTeam.name : match.homeTeam.name;
  const homeAway = isBetisHome ? 'home' : 'away';
  
  // Determine venue
  let venue = 'Estadio desconocido';
  if (isBetisHome) {
    venue = 'Estadio Benito Villamarín';
  } else {
    // Known LaLiga stadiums
    const stadiums = {
      'FC Barcelona': 'Spotify Camp Nou',
      'Real Madrid CF': 'Santiago Bernabéu',
      'Atlético Madrid': 'Riyadh Air Metropolitano',
      'Sevilla FC': 'Ramón Sánchez-Pizjuán',
      'Valencia CF': 'Mestalla',
      'Athletic Bilbao': 'San Mamés',
      'Real Sociedad': 'Reale Arena',
      'Villarreal CF': 'Estadio de la Cerámica',
      'CA Osasuna': 'El Sadar',
      'Celta Vigo': 'Abanca-Balaídos',
      'RCD Espanyol': 'RCDE Stadium',
      'Getafe CF': 'Coliseum',
      'Deportivo Alavés': 'Mendizorroza',
      'Girona FC': 'Montilivi',
      'UD Las Palmas': 'Estadio Gran Canaria',
      'Rayo Vallecano': 'Campo de Fútbol de Vallecas',
      'RCD Mallorca': 'Son Moix',
      'CD Leganés': 'Butarque',
      'Real Valladolid CF': 'José Zorrilla'
    };
    venue = stadiums[opponent] || `Estadio de ${opponent}`;
  }

  // Get competition name
  let competition = match.competition.name;
  if (competition === 'Primera División') {
    competition = 'LaLiga';
  }

  // Create notes with match status and additional info
  let notes = `Jornada ${match.matchday || 'TBD'} - Estado: ${match.status}`;
  if (match.status === 'FINISHED' && match.score?.fullTime) {
    const betisScore = isBetisHome ? match.score.fullTime.home : match.score.fullTime.away;
    const opponentScore = isBetisHome ? match.score.fullTime.away : match.score.fullTime.home;
    notes += ` - Resultado: Betis ${betisScore}-${opponentScore} ${opponent}`;
  }

  return {
    date_time: match.utcDate,
    opponent: opponent,
    venue: venue,
    competition: competition,
    home_away: homeAway,
    notes: notes
  };
}

// Main function to sync LaLiga matches
async function syncLaligaMatches() {
  try {
    console.log('🏁 Starting LaLiga matches synchronization...');
    
    // Get current season LaLiga matches for Real Betis
    console.log('📅 Fetching current season LaLiga matches for Real Betis...');
    
    const currentSeason = new Date().getFullYear();
    const matchesUrl = `${footballDataApiUrl}/teams/${betisTeamId}/matches?competitions=${laligaCompetitionId}&season=${currentSeason}`;
    const matchesData = await makeApiRequest(matchesUrl);
    
    if (!matchesData.matches || matchesData.matches.length === 0) {
      console.log('⚠️  No LaLiga matches found for the current season');
      return;
    }

    console.log(`📊 Found ${matchesData.matches.length} LaLiga matches`);

    // Check existing matches in database
    const { data: existingMatches, error: selectError } = await supabase
      .from('matches')
      .select('date_time, opponent, competition, home_away');

    if (selectError) {
      throw new Error(`Failed to fetch existing matches: ${selectError.message}`);
    }

    console.log(`💾 Found ${existingMatches?.length || 0} existing matches in database`);

    // Convert and filter matches
    const newMatches = [];
    const updateMatches = [];
    
    for (const match of matchesData.matches) {
      const dbMatch = convertApiMatchToDbFormat(match);
      
      // Check if match already exists (by date, opponent, and competition)
      const existingMatch = existingMatches?.find(existing => 
        new Date(existing.date_time).getTime() === new Date(dbMatch.date_time).getTime() &&
        existing.opponent === dbMatch.opponent &&
        existing.competition === dbMatch.competition
      );

      if (!existingMatch) {
        newMatches.push(dbMatch);
      } else if (existingMatch.home_away !== dbMatch.home_away || !existingMatch.notes?.includes(match.status)) {
        // Update existing match if status or details changed
        updateMatches.push({
          ...dbMatch,
          id: existingMatch.id
        });
      }
    }

    console.log(`✨ Found ${newMatches.length} new LaLiga matches to insert`);
    console.log(`🔄 Found ${updateMatches.length} existing matches to update`);

    // Insert new matches
    if (newMatches.length > 0) {
      console.log('💿 Inserting new LaLiga matches into database...');
      
      const { data: insertedMatches, error: insertError } = await supabase
        .from('matches')
        .insert(newMatches)
        .select();

      if (insertError) {
        throw new Error(`Failed to insert matches: ${insertError.message}`);
      }

      console.log(`✅ Successfully inserted ${insertedMatches.length} new LaLiga matches`);
    }

    // Update existing matches
    if (updateMatches.length > 0) {
      console.log('🔄 Updating existing LaLiga matches...');
      
      for (const updateMatch of updateMatches) {
        const { error: updateError } = await supabase
          .from('matches')
          .update({
            venue: updateMatch.venue,
            notes: updateMatch.notes
          })
          .eq('date_time', updateMatch.date_time)
          .eq('opponent', updateMatch.opponent)
          .eq('competition', updateMatch.competition);

        if (updateError) {
          console.error(`Failed to update match: ${updateError.message}`);
        }
      }
      
      console.log(`✅ Successfully updated ${updateMatches.length} LaLiga matches`);
    }

    if (newMatches.length === 0 && updateMatches.length === 0) {
      console.log('✅ No changes needed. LaLiga matches are up to date!');
      return;
    }

    // Show summary
    console.log('\n📋 LaLiga matches synchronization summary:');
    if (newMatches.length > 0) {
      console.log(`  ➕ ${newMatches.length} new matches added`);
      newMatches.slice(0, 3).forEach((match, index) => {
        const date = new Date(match.date_time).toLocaleDateString('es-ES', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit'
        });
        console.log(`    ${index + 1}. ${date} - ${match.opponent} (${match.home_away})`);
      });
      if (newMatches.length > 3) {
        console.log(`    ... and ${newMatches.length - 3} more`);
      }
    }

    if (updateMatches.length > 0) {
      console.log(`  🔄 ${updateMatches.length} matches updated`);
    }

    console.log('\n🎉 LaLiga matches synchronization completed!');
    console.log('🌐 Check the partidos page to see the updated matches');

  } catch (error) {
    console.error('❌ Error syncing LaLiga matches:', error.message);
    
    if (error.message.includes('row-level security policy')) {
      console.log('\n💡 Tip: You may need to run the temporary policy SQL first:');
      console.log('   Run this in your Supabase SQL Editor: sql/temp_allow_anon_insert.sql');
      console.log('   Then run this script again.');
    }
    
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  syncLaligaMatches()
    .then(() => {
      console.log('🎉 Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { syncLaligaMatches, convertApiMatchToDbFormat };
