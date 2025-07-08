#!/usr/bin/env node

/**
 * Populate Matches Database Script
 * 
 * This script fetches Real Betis matches from football-data.org API
 * and populates the Supabase matches table
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const footballDataApiKey = process.env.FOOTBALL_DATA_API_KEY;
const footballDataApiUrl = process.env.FOOTBALL_DATA_API_URL;
const betisTeamId = process.env.REAL_BETIS_TEAM_ID || '90';

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
  if (match.venue) {
    venue = match.venue;
  } else if (isBetisHome) {
    venue = 'Estadio Benito Villamarín';
  } else {
    // Try to get venue from team name
    const awayTeam = match.awayTeam.name;
    venue = `Estadio de ${opponent}`;
  }

  // Get competition name
  let competition = match.competition.name;
  if (competition === 'Primera División') {
    competition = 'LaLiga';
  }

  return {
    date_time: match.utcDate,
    opponent: opponent,
    venue: venue,
    competition: competition,
    home_away: homeAway,
    notes: `Jornada ${match.matchday || 'TBD'} - Estado: ${match.status}`
  };
}

// Main function to populate matches
async function populateMatches() {
  try {
    console.log('🏁 Starting matches population...');
    
    // Get current season matches for Real Betis
    console.log('📅 Fetching current season matches for Real Betis...');
    
    const matchesUrl = `${footballDataApiUrl}/teams/${betisTeamId}/matches?status=SCHEDULED,FINISHED&season=2024`;
    const matchesData = await makeApiRequest(matchesUrl);
    
    if (!matchesData.matches || matchesData.matches.length === 0) {
      console.log('⚠️  No matches found for the current season');
      return;
    }

    console.log(`📊 Found ${matchesData.matches.length} matches`);

    // Check existing matches in database to avoid duplicates
    const { data: existingMatches, error: selectError } = await supabase
      .from('matches')
      .select('date_time, opponent, competition');

    if (selectError) {
      throw new Error(`Failed to fetch existing matches: ${selectError.message}`);
    }

    console.log(`💾 Found ${existingMatches?.length || 0} existing matches in database`);

    // Convert and filter matches
    const newMatches = [];
    for (const match of matchesData.matches) {
      const dbMatch = convertApiMatchToDbFormat(match);
      
      // Check if match already exists
      const exists = existingMatches?.some(existing => 
        existing.date_time === dbMatch.date_time &&
        existing.opponent === dbMatch.opponent &&
        existing.competition === dbMatch.competition
      );

      if (!exists) {
        newMatches.push(dbMatch);
      }
    }

    console.log(`✨ Found ${newMatches.length} new matches to insert`);

    if (newMatches.length === 0) {
      console.log('✅ No new matches to add. Database is up to date!');
      return;
    }

    // Insert new matches
    console.log('💿 Inserting new matches into database...');
    
    const { data: insertedMatches, error: insertError } = await supabase
      .from('matches')
      .insert(newMatches)
      .select();

    if (insertError) {
      throw new Error(`Failed to insert matches: ${insertError.message}`);
    }

    console.log('✅ Successfully populated matches database!');
    console.log(`📊 Inserted ${insertedMatches.length} new matches`);
    
    // Show some sample data
    console.log('\n📋 Sample matches added:');
    insertedMatches.slice(0, 5).forEach((match, index) => {
      const date = new Date(match.date_time).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      console.log(`  ${index + 1}. ${date} - ${match.opponent} (${match.home_away}) - ${match.competition}`);
    });

    if (insertedMatches.length > 5) {
      console.log(`  ... and ${insertedMatches.length - 5} more`);
    }

  } catch (error) {
    console.error('❌ Error populating matches:', error.message);
    process.exit(1);
  }
}

// Run the script
if (require.main === module) {
  populateMatches()
    .then(() => {
      console.log('🎉 Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { populateMatches, convertApiMatchToDbFormat };
