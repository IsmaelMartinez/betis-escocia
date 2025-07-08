#!/usr/bin/env tsx

/**
 * LaLiga Match Import Script
 * 
 * This script fetches Real Betis matches from Football-Data.org API
 * and imports them into the local database, avoiding duplicates.
 * 
 * Usage:
 *   npx tsx scripts/import-laliga-matches.ts
 *   npx tsx scripts/import-laliga-matches.ts --dry-run
 *   npx tsx scripts/import-laliga-matches.ts --season=2025
 *   npx tsx scripts/import-laliga-matches.ts --season=2025 --dry-run
 */

// Load environment variables
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env.local from the project root (works for both CJS and ESM)
dotenv.config({ path: resolve(process.cwd(), '.env.local') });

import { FootballDataService, REAL_BETIS_TEAM_ID } from '../src/services/footballDataService';
import { supabase, type Match as DatabaseMatch, type MatchInsert } from '../src/lib/supabase';
import type { Match as ApiMatch } from '../src/types/match';

interface ImportStats {
  total: number;
  imported: number;
  updated: number;
  skipped: number;
  errors: number;
}

/**
 * Convert Football-Data API match to database format
 */
function convertApiMatchToDatabase(apiMatch: ApiMatch): MatchInsert {
  const isBetisHome = apiMatch.homeTeam.id === REAL_BETIS_TEAM_ID;
  
  // Determine result based on score and match status
  let result: string | undefined;
  let homeScore: number | undefined;
  let awayScore: number | undefined;
  
  if (apiMatch.status === 'FINISHED' && apiMatch.score?.fullTime) {
    const homeScoreValue = apiMatch.score.fullTime.home;
    const awayScoreValue = apiMatch.score.fullTime.away;
    
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
  
  return {
    opponent: isBetisHome ? apiMatch.awayTeam.name : apiMatch.homeTeam.name,
    date_time: apiMatch.utcDate,
    competition: apiMatch.competition.name,
    home_away: isBetisHome ? 'home' : 'away',
    notes: `Jornada ${apiMatch.matchday || 'N/A'} - Importado desde Football-Data.org`,
    external_id: apiMatch.id,
    external_source: 'football-data.org',
    result: result,
    home_score: homeScore,
    away_score: awayScore,
    status: apiMatch.status,
    matchday: apiMatch.matchday
  };
}

/**
 * Check if a match already exists in the database and return its ID
 */
async function getExistingMatch(externalId: number): Promise<number | null> {
  const { data, error } = await supabase
    .from('matches')
    .select('id')
    .eq('external_id', externalId)
    .single();
    
  if (error && error.code !== 'PGRST116') { // PGRST116 = not found
    console.error('Error checking if match exists:', error);
    return null;
  }
  
  return data?.id || null;
}

/**
 * Import or update a single match in the database
 */
async function importMatch(apiMatch: ApiMatch, dryRun: boolean = false): Promise<boolean> {
  try {
    // Check if match already exists
    const existingMatchId = await getExistingMatch(apiMatch.id);
    const dbMatch = convertApiMatchToDatabase(apiMatch);
    
    if (existingMatchId) {
      // Update existing match
      if (dryRun) {
        console.log(`🔍 [DRY RUN] Would update: ${dbMatch.opponent} (${dbMatch.home_away}) on ${new Date(dbMatch.date_time).toLocaleDateString()}`);
        return true;
      }
      
      const { error } = await supabase
        .from('matches')
        .update(dbMatch)
        .eq('id', existingMatchId);
        
      if (error) {
        console.error(`❌ Error updating match ${apiMatch.id}:`, error);
        return false;
      }
      
      console.log(`🔄 Updated: ${dbMatch.opponent} (${dbMatch.home_away}) on ${new Date(dbMatch.date_time).toLocaleDateString()}`);
      return true;
    } else {
      // Insert new match
      if (dryRun) {
        console.log(`🔍 [DRY RUN] Would import: ${dbMatch.opponent} (${dbMatch.home_away}) on ${new Date(dbMatch.date_time).toLocaleDateString()}`);
        return true;
      }
      
      const { error } = await supabase
        .from('matches')
        .insert(dbMatch);
        
      if (error) {
        console.error(`❌ Error importing match ${apiMatch.id}:`, error);
        return false;
      }
      
      console.log(`✅ Imported: ${dbMatch.opponent} (${dbMatch.home_away}) on ${new Date(dbMatch.date_time).toLocaleDateString()}`);
      return true;
    }
  } catch (error) {
    console.error(`❌ Error processing match ${apiMatch.id}:`, error);
    return false;
  }
}

/**
 * Main import function
 */
async function importLaLigaMatches(dryRun: boolean = false, seasons: string[] = ['2024', '2023', '2025']): Promise<ImportStats> {
  const stats: ImportStats = {
    total: 0,
    imported: 0,
    updated: 0,
    skipped: 0,
    errors: 0
  };
  
  console.log('🚀 Starting LaLiga match import...');
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE IMPORT'}`);
  console.log(`Seasons: ${seasons.join(', ')}`);
  console.log('');
  
  try {
    const service = new FootballDataService();
    
    // Get all Betis matches (this includes past and future matches)
    console.log('📡 Fetching Real Betis matches from Football-Data.org...');
    const matches = await service.getBetisMatchesForSeasons(seasons, 200); // Limit to 200 matches
    
    console.log(`📊 Found ${matches.length} Betis matches from API`);
    console.log('');
    
    stats.total = matches.length;
    
    // Process each match
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      console.log(`[${i + 1}/${matches.length}] Processing match ID ${match.id}...`);
      
      try {
        const existingMatchId = await getExistingMatch(match.id);
        const processed = await importMatch(match, dryRun);
        
        if (processed) {
          if (existingMatchId) {
            stats.updated++;
          } else {
            stats.imported++;
          }
        } else {
          stats.skipped++;
        }
      } catch (error) {
        console.error(`❌ Error processing match ${match.id}:`, error);
        stats.errors++;
      }
      
      // Add small delay to avoid overwhelming the database
      if (i < matches.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100));
      }
    }
    
  } catch (error) {
    console.error('❌ Fatal error during import:', error);
    stats.errors++;
  }
  
  return stats;
}

/**
 * Print import statistics
 */
function printStats(stats: ImportStats, dryRun: boolean): void {
  console.log('');
  console.log('📈 Import Summary:');
  console.log('─'.repeat(40));
  console.log(`Total matches processed: ${stats.total}`);
  console.log(`${dryRun ? 'Would import' : 'Imported'}: ${stats.imported}`);
  console.log(`${dryRun ? 'Would update' : 'Updated'}: ${stats.updated}`);
  console.log(`Skipped: ${stats.skipped}`);
  console.log(`Errors: ${stats.errors}`);
  console.log('');
  
  if (dryRun) {
    console.log('🔍 This was a dry run. No data was actually imported or updated.');
    console.log('Run without --dry-run to perform the actual import/update.');
  } else {
    console.log('✅ Import/Update completed!');
  }
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  
  // Check if specific season is requested
  const seasonArg = args.find(arg => arg.startsWith('--season='));
  let seasons = ['2024', '2023', '2025']; // Default: current, previous, and next season
  
  if (seasonArg) {
    const requestedSeason = seasonArg.split('=')[1];
    seasons = [requestedSeason];
  }
  
  try {
    const stats = await importLaLigaMatches(dryRun, seasons);
    printStats(stats, dryRun);
    
    process.exit(stats.errors > 0 ? 1 : 0);
  } catch (error) {
    console.error('❌ Script failed:', error);
    process.exit(1);
  }
}

// Run the script if called directly
if (require.main === module) {
  main();
}
