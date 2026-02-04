import { createApiHandler } from '@/lib/apiUtils';
import { FootballDataService, REAL_BETIS_TEAM_ID } from '@/services/footballDataService';
import axios from 'axios';
import { supabase } from '@/lib/supabase';
import { log } from '@/lib/logger';
import { subDays } from 'date-fns';

// Module-level singleton to preserve rate-limiting state across requests
const footballService = new FootballDataService(axios.create());

// Server-side rate limiting: track last sync timestamp in memory
let lastSyncTimestamp = 0;
const SYNC_COOLDOWN_MS = 60 * 60 * 1000; // 1 hour

/**
 * Determine match result label based on scores.
 * Values match the database CHECK constraint: HOME_WIN, AWAY_WIN, DRAW.
 */
function getMatchResult(homeScore: number, awayScore: number): string {
  if (homeScore > awayScore) {
    return 'HOME_WIN';
  }
  if (awayScore > homeScore) {
    return 'AWAY_WIN';
  }
  return 'DRAW';
}

/**
 * Background sync endpoint for updating past matches with missing data.
 * This endpoint is triggered by client visits to keep match data fresh.
 */
async function syncOutdatedMatches() {
  const now = new Date();
  const gracePeriod = subDays(now, 1); // Only sync matches older than 1 day

  // Find matches that are in the past but have missing data
  const { data: outdatedMatches, error: queryError } = await supabase
    .from('matches')
    .select('id, external_id, date_time, opponent, status, home_score, away_score, result')
    .lt('date_time', gracePeriod.toISOString())
    .or('status.is.null,status.neq.FINISHED,home_score.is.null,away_score.is.null,result.is.null')
    .not('external_id', 'is', null)
    .limit(20); // Limit to avoid API rate limits

  if (queryError) {
    log.error('Failed to query outdated matches', queryError, {
      operation: 'sync-outdated-matches'
    });
    throw queryError;
  }

  if (!outdatedMatches || outdatedMatches.length === 0) {
    return {
      success: true,
      message: 'No outdated matches to sync',
      summary: {
        checked: 0,
        updated: 0,
        errors: 0
      }
    };
  }

  log.info('Found outdated matches to sync', undefined, {
    count: outdatedMatches.length,
    matchIds: outdatedMatches.map(m => m.external_id)
  });

  let updatedCount = 0;
  let errorCount = 0;

  // Process matches sequentially to respect the external API's rate limits
  for (const dbMatch of outdatedMatches) {
    if (!dbMatch.external_id) continue;

    try {
      // Fetch fresh data from the API
      const match = await footballService.getMatchById(dbMatch.external_id);

      if (!match) {
        log.warn('Match not found in API', undefined, {
          externalId: dbMatch.external_id,
          opponent: dbMatch.opponent
        });
        continue;
      }

      // Only update if the match is finished
      if (match.status !== 'FINISHED') {
        continue;
      }

      // Extract match data
      const isBetisHome = match.homeTeam.id === REAL_BETIS_TEAM_ID;
      let result: string | undefined;
      let homeScore: number | undefined;
      let awayScore: number | undefined;

      if (match.score?.fullTime) {
        const homeScoreValue = match.score.fullTime.home;
        const awayScoreValue = match.score.fullTime.away;

        if (homeScoreValue != null && awayScoreValue != null) {
          homeScore = homeScoreValue;
          awayScore = awayScoreValue;
          result = getMatchResult(homeScoreValue, awayScoreValue);
        }
      }

      // Update the match in the database
      const { error: updateError } = await supabase
        .from('matches')
        .update({
          result,
          home_score: homeScore,
          away_score: awayScore,
          status: match.status,
          home_away: isBetisHome ? 'home' : 'away'
        })
        .eq('id', dbMatch.id);

      if (updateError) {
        log.error('Failed to update match', updateError, {
          matchId: dbMatch.id,
          externalId: dbMatch.external_id
        });
        errorCount++;
      } else {
        log.info('Successfully updated match', undefined, {
          matchId: dbMatch.id,
          externalId: dbMatch.external_id,
          opponent: dbMatch.opponent,
          result,
          score: homeScore !== undefined && awayScore !== undefined
            ? `${homeScore}-${awayScore}`
            : 'N/A'
        });
        updatedCount++;
      }
    } catch (error) {
      log.error('Failed to process outdated match', error, {
        matchId: dbMatch.id,
        externalId: dbMatch.external_id
      });
      errorCount++;
    }
  }

  const summary = {
    checked: outdatedMatches.length,
    updated: updatedCount,
    errors: errorCount
  };

  log.business('outdated_matches_sync_completed', summary, {
    operation: 'background-sync'
  });

  return {
    success: true,
    message: `Sync completed: ${updatedCount} updated, ${errorCount} errors`,
    summary
  };
}

// GET - Sync outdated matches with server-side rate limiting
export const GET = createApiHandler({
  auth: 'none',
  handler: async () => {
    // Server-side rate limiting: reject if called within the cooldown period
    const now = Date.now();
    if (now - lastSyncTimestamp < SYNC_COOLDOWN_MS) {
      return {
        success: true,
        message: 'Sync skipped: cooldown period active',
        summary: { checked: 0, updated: 0, errors: 0 }
      };
    }
    lastSyncTimestamp = now;

    return await syncOutdatedMatches();
  }
});

export const revalidate = 0; // No caching for this endpoint
export const dynamic = 'force-dynamic';
