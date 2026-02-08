import { createApiHandler } from '@/lib/api/apiUtils';
import { supabase } from '@/lib/api/supabase';
import { getCurrentUpcomingMatch } from '@/lib/utils/matchUtils';
import { formatISO } from 'date-fns';
import { log } from '@/lib/utils/logger';
import { StandardErrors } from '@/lib/utils/standardErrors';

async function getAttendeeCount(queryData: { match?: number }) {
  const { match: matchId } = queryData;
  
  let currentMatch;
  let matchDate;
  let actualMatchId;
  
  if (matchId) {
    // Get specific match by ID
    const { data: matchData, error: matchError } = await supabase
      .from('matches')
      .select('id, opponent, date_time, competition')
      .eq('id', matchId)
      .single();
      
    if (matchError || !matchData) {
      log.error('Failed to fetch specific match for attendee count', matchError, { matchId });
      throw new Error(StandardErrors.RSVP.MATCH_NOT_FOUND);
    }
    
    currentMatch = {
      id: matchData.id,
      opponent: matchData.opponent,
      date: matchData.date_time,
      competition: matchData.competition
    };
    matchDate = matchData.date_time;
    actualMatchId = matchData.id;
  } else {
    // Get current upcoming match
    try {
      currentMatch = await getCurrentUpcomingMatch();
      matchDate = currentMatch.date;
      actualMatchId = 'id' in currentMatch ? currentMatch.id : null;
    } catch (error) {
      log.error('Failed to get current upcoming match for attendee count', error);
      // Fallback to default values
      matchDate = formatISO(new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)); // Next week
      actualMatchId = null;
    }
  }
  
  // Get all RSVPs for the specified match
  let rsvpQuery = supabase
    .from('rsvps')
    .select('attendees, name, created_at');
  
  if (actualMatchId) {
    rsvpQuery = rsvpQuery.eq('match_id', actualMatchId);
  } else {
    // Fallback to match_date for backwards compatibility
    rsvpQuery = rsvpQuery.eq('match_date', matchDate);
  }
  
  const { data: rsvps, error } = await rsvpQuery.order('created_at', { ascending: true });

  if (error) {
    log.error('Failed to read RSVP attendee data from Supabase', error, { 
      matchId: actualMatchId, 
      matchDate 
    });
    throw new Error(StandardErrors.RSVP.DATA_ERROR);
  }

  // Calculate totals
  const totalAttendees = rsvps?.reduce((total, entry) => total + entry.attendees, 0) || 0;
  const confirmedCount = rsvps?.length || 0;
  
  // Get recent confirmations (last 24 hours) for additional context
  const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentConfirmations = rsvps?.filter(
    rsvp => new Date(rsvp.created_at) >= yesterday
  )?.length || 0;

  return {
    success: true,
    count: totalAttendees,
    details: {
      totalAttendees,
      confirmedCount,
      recentConfirmations,
      averageGroupSize: confirmedCount > 0 ? Math.round((totalAttendees / confirmedCount) * 10) / 10 : 0
    },
    match: {
      id: actualMatchId,
      opponent: currentMatch?.opponent || 'Unknown',
      date: matchDate,
      competition: (currentMatch && 'competition' in currentMatch) ? currentMatch.competition : 'LaLiga'
    }
  };
}

// GET - Retrieve attendee count for specified or current match
export const GET = createApiHandler({
  auth: 'none',
  handler: async (_, context) => {
    const url = new URL(context.request.url);
    const matchParam = url.searchParams.get('match');
    const queryData = { match: matchParam ? parseInt(matchParam) : undefined };
    
    return await getAttendeeCount(queryData);
  }
});