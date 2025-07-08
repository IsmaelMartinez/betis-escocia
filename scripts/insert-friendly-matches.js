#!/usr/bin/env node

/**
 * Insert Real Betis 2025 Preseason Friendly Matches
 * 
 * Based on: https://www.estadiodeportivo.com/futbol/betis/pretemporada-2025-del-real-betis-calendario-amistosos-rivales-horarios-donde-ver-por-20250629-501781.html
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

// Configuration
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing required environment variables');
  console.error('Required: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY');
  process.exit(1);
}

// Initialize Supabase client
const supabase = createClient(supabaseUrl, supabaseKey);

// 2025 Preseason friendly matches data
const friendlyMatches = [
  {
    date_time: '2025-07-19T21:00:00+01:00', // 21:00 Portugal time (20:00 UTC in summer)
    opponent: 'Triangular: Uniao Leiria vs SC Farense',
    venue: 'Estadio de São Luís de Faro, Portugal',
    competition: 'Amistoso Pretemporada',
    home_away: 'away',
    notes: 'Triangular con dos partidos de 45 minutos. Fin de concentración en Almancil.'
  },
  {
    date_time: '2025-07-25T21:00:00+02:00', // 21:00 Spanish time
    opponent: 'Córdoba CF',
    venue: 'Estadio Nuevo Arcángel, Córdoba',
    competition: 'Amistoso Pretemporada',
    home_away: 'away',
    notes: 'Primer partido del calendario veraniego. Derbi andaluz.'
  },
  {
    date_time: '2025-07-30T20:00:00+02:00', // 20:00 Spanish time (19:00 UK time)
    opponent: 'Coventry City',
    venue: 'Coventry Building Society Arena, Inglaterra',
    competition: 'Amistoso Pretemporada',
    home_away: 'away',
    notes: 'Gira por tierras británicas. Coventry recién ascendido a Premier League.'
  },
  {
    date_time: '2025-08-02T16:00:00+02:00', // 16:00 Spanish time (15:00 UK time)
    opponent: 'Sunderland AFC',
    venue: 'Stadium of Light, Sunderland, Inglaterra',
    competition: 'Amistoso Pretemporada',
    home_away: 'away',
    notes: 'Continuación de la gira inglesa. The Black Cats también se enfrentan al Sevilla FC.'
  },
  {
    date_time: '2025-08-09T20:30:00+02:00', // 20:30 Spanish time
    opponent: 'Málaga CF',
    venue: 'Estadio La Rosaleda, Málaga',
    competition: 'Trofeo Costa del Sol',
    home_away: 'away',
    notes: 'XXXV edición del Trofeo Costa del Sol. Una semana antes del inicio de LaLiga.'
  }
];

// Main function to insert friendly matches
async function insertFriendlyMatches() {
  try {
    console.log('🏁 Starting friendly matches insertion...');
    console.log(`📊 Ready to insert ${friendlyMatches.length} friendly matches`);

    // Check existing matches in database to avoid duplicates
    const { data: existingMatches, error: selectError } = await supabase
      .from('matches')
      .select('date_time, opponent, competition');

    if (selectError) {
      throw new Error(`Failed to fetch existing matches: ${selectError.message}`);
    }

    console.log(`💾 Found ${existingMatches?.length || 0} existing matches in database`);

    // Filter out duplicates
    const newMatches = [];
    for (const match of friendlyMatches) {
      // Check if match already exists
      const exists = existingMatches?.some(existing => 
        existing.date_time === match.date_time &&
        existing.opponent === match.opponent &&
        existing.competition === match.competition
      );

      if (!exists) {
        newMatches.push(match);
      } else {
        console.log(`⚠️  Skipping duplicate: ${match.opponent} on ${match.date_time}`);
      }
    }

    console.log(`✨ Found ${newMatches.length} new friendly matches to insert`);

    if (newMatches.length === 0) {
      console.log('✅ No new friendly matches to add. Database is up to date!');
      return;
    }

    // Insert new matches
    console.log('💿 Inserting new friendly matches into database...');
    
    const { data: insertedMatches, error: insertError } = await supabase
      .from('matches')
      .insert(newMatches)
      .select();

    if (insertError) {
      throw new Error(`Failed to insert matches: ${insertError.message}`);
    }

    console.log('✅ Successfully inserted friendly matches!');
    console.log(`📊 Inserted ${insertedMatches.length} new matches`);
    
    // Show inserted data
    console.log('\n📋 Inserted friendly matches:');
    insertedMatches.forEach((match, index) => {
      const date = new Date(match.date_time).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
      console.log(`  ${index + 1}. ${date} - ${match.opponent} (${match.home_away})`);
      console.log(`     📍 ${match.venue}`);
      console.log(`     🏆 ${match.competition}`);
      console.log(`     📝 ${match.notes}`);
      console.log('');
    });

    console.log('🎉 All friendly matches have been added to the database!');
    console.log('🌐 You can now test the partidos page at: http://localhost:3001/partidos');

  } catch (error) {
    console.error('❌ Error inserting friendly matches:', error.message);
    
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
  insertFriendlyMatches()
    .then(() => {
      console.log('🎉 Script completed successfully!');
      process.exit(0);
    })
    .catch((error) => {
      console.error('💥 Script failed:', error);
      process.exit(1);
    });
}

module.exports = { insertFriendlyMatches, friendlyMatches };
