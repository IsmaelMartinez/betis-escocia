import { createApiHandler } from '@/lib/apiUtils';
import { supabase } from '@/lib/supabase';
import { getCurrentUpcomingMatch } from '@/lib/matchUtils';
import { formatISO } from 'date-fns';
import { log } from '@/lib/logger';
import { StandardErrors } from '@/lib/standardErrors';

async function getRSVPStatus(queryData: { match?: number }, userId?: string, userEmail?: string) {
  const { match: matchId } = queryData;
  
  // Must have either userId or userEmail to look up RSVP status
  if (!userId && !userEmail) {
    throw new Error(StandardErrors.UNAUTHORIZED);
  }
  
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
      log.error('Failed to fetch specific match for RSVP status', matchError, { matchId });
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
      log.error('Failed to get current upcoming match for RSVP status', error);
      throw new Error(StandardErrors.RSVP.MATCH_NOT_FOUND);
    }
  }
  
  // Look up RSVP by user_id first, then fall back to email
  let rsvpQuery = supabase
    .from('rsvps')
    .select('*');
  
  // Add match filtering
  if (actualMatchId) {
    rsvpQuery = rsvpQuery.eq('match_id', actualMatchId);
  } else {
    rsvpQuery = rsvpQuery.eq('match_date', matchDate);
  }
  
  // Add user filtering - prefer user_id, fallback to email
  if (userId) {
    rsvpQuery = rsvpQuery.eq('user_id', userId);
  } else if (userEmail) {
    rsvpQuery = rsvpQuery.eq('email', userEmail.toLowerCase().trim());
  }
  
  const { data: rsvps, error } = await rsvpQuery
    .order('created_at', { ascending: false })
    .limit(1);

  if (error) {
    log.error('Failed to read RSVP status from Supabase', error, { 
      matchId: actualMatchId, 
      matchDate,
      userId: userId || 'none',
      userEmail: userEmail || 'none'
    });
    throw new Error(StandardErrors.RSVP.DATA_ERROR);
  }

  if (!rsvps || rsvps.length === 0) {
    // No existing RSVP found - return 404
    throw new Error(StandardErrors.NOT_FOUND);
  }

  const rsvp = rsvps[0];
  
  return {
    success: true,
    status: 'confirmed', // All RSVPs in our system are confirmations
    attendees: rsvp.attendees,
    message: rsvp.message || '',
    whatsapp_interest: rsvp.whatsapp_interest,
    created_at: rsvp.created_at,
    updated_at: rsvp.updated_at,
    match: {
      id: actualMatchId,
      opponent: currentMatch.opponent,
      date: matchDate,
      competition: 'competition' in currentMatch ? currentMatch.competition : 'LaLiga'
    }
  };
}

// GET - Retrieve current user's RSVP status for specified or current match
export const GET = createApiHandler({
  auth: 'optional', // Allows both authenticated and anonymous users
  handler: async (_, context) => {
    const url = new URL(context.request.url);
    const matchParam = url.searchParams.get('match');
    const emailParam = url.searchParams.get('email'); // Allow email lookup for anonymous users
    
    const queryData = { match: matchParam ? parseInt(matchParam) : undefined };
    
    // Get user info from context (if authenticated)
    const userId = context.user?.id;
    const userEmail = context.user?.primaryEmailAddress?.emailAddress || emailParam;
    
    return await getRSVPStatus(queryData, userId, userEmail);
  }
});