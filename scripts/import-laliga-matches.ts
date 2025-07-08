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
 */

import { FootballDataService, REAL_BETIS_TEAM_ID } from '../src/services/footballDataService';
import { supabase, type Match as DatabaseMatch, type MatchInsert } from '../src/lib/supabase';
import type { Match as ApiMatch } from '../src/types/match';

interface ImportStats {
  total: number;
  imported: number;
  skipped: number;
  errors: number;
}

/**
 * Convert Football-Data API match to database format
 */
function convertApiMatchToDatabase(apiMatch: ApiMatch): MatchInsert {
  const isBetisHome = apiMatch.homeTeam.id === REAL_BETIS_TEAM_ID;
  
  return {
    opponent: isBetisHome ? apiMatch.awayTeam.name : apiMatch.homeTeam.name,
    date_time: apiMatch.utcDate,
    venue: isBetisHome ? (apiMatch.venue || 'Estadio Benito Villamarín') : (apiMatch.venue || 'Campo del adversario'),
    competition: apiMatch.competition.name,
    home_away: isBetisHome ? 'home' : 'away',
    notes: `Jornada ${apiMatch.matchday || 'N/A'} - Importado desde Football-Data.org`,
    external_id: apiMatch.id,
    external_source: 'football-data.org'
  };
}

/**
 * Check if a match already exists in the database
 */
async function matchExists(externalId: number): Promise<boolean> {
  const { data, error } = await supabase
    .from('matches')
    .select('id')
    .eq('external_id', externalId)
    .single();
    
  if (error && error.code !== 'PGRST116') { // PGRST116 = not found
    console.error('Error checking if match exists:', error);
    return false;
  }
  
  return !!data;
}

/**
 * Import a single match to the database
 */
async function importMatch(apiMatch: ApiMatch, dryRun: boolean = false): Promise<boolean> {
  try {
    // Check if match already exists
    if (await matchExists(apiMatch.id)) {
      console.log(`⏭️  Skipping existing match: ${apiMatch.homeTeam.name} vs ${apiMatch.awayTeam.name} (${new Date(apiMatch.utcDate).toLocaleDateString()})`);
      return false;
    }
    
    const dbMatch = convertApiMatchToDatabase(apiMatch);
    
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
  } catch (error) {
    console.error(`❌ Error processing match ${apiMatch.id}:`, error);
    return false;
  }
}

/**
 * Main import function
 */
async function importLaLigaMatches(dryRun: boolean = false): Promise<ImportStats> {
  const stats: ImportStats = {
    total: 0,
    imported: 0,
    skipped: 0,
    errors: 0
  };
  
  console.log('🚀 Starting LaLiga match import...');
  console.log(`Mode: ${dryRun ? 'DRY RUN' : 'LIVE IMPORT'}`);
  console.log('');
  
  try {
    const service = new FootballDataService();
    
    // Get all Betis matches (this includes past and future matches)
    console.log('📡 Fetching Real Betis matches from Football-Data.org...');
    const matches = await service.getBetisMatches(100); // Limit to 100 matches
    
    console.log(`📊 Found ${matches.length} Betis matches from API`);
    console.log('');
    
    stats.total = matches.length;
    
    // Process each match
    for (let i = 0; i < matches.length; i++) {
      const match = matches[i];
      console.log(`[${i + 1}/${matches.length}] Processing match ID ${match.id}...`);
      
      try {
        const imported = await importMatch(match, dryRun);
        if (imported) {
          stats.imported++;
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
  console.log(`Skipped (already exist): ${stats.skipped}`);
  console.log(`Errors: ${stats.errors}`);
  console.log('');
  
  if (dryRun) {
    console.log('🔍 This was a dry run. No data was actually imported.');
    console.log('Run without --dry-run to perform the actual import.');
  } else {
    console.log('✅ Import completed!');
  }
}

/**
 * Main execution
 */
async function main(): Promise<void> {
  const args = process.argv.slice(2);
  const dryRun = args.includes('--dry-run');
  
  try {
    const stats = await importLaLigaMatches(dryRun);
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
