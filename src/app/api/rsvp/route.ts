import { createApiHandler } from '@/lib/apiUtils';
import { supabase, type RSVP } from '@/lib/supabase';
import { getCurrentUpcomingMatch } from '@/lib/matchUtils';
import { rsvpSchema, type RSVPInput } from '@/lib/schemas/rsvp';
import { formatISO } from 'date-fns';
import { log } from '@/lib/logger';
import { queueRSVPNotification } from '@/lib/notifications/queueManager';

async function getRSVPData(queryData: { match?: number }) {
  const { match: matchId } = queryData;
  
  let currentMatch;
  let matchDate;
  
  if (matchId) {
    // Get specific match by ID
    const { data: matchData, error: matchError } = await supabase
      .from('matches')
      .select('id, opponent, date_time, competition')
      .eq('id', matchId)
      .single();
      
    if (matchError || !matchData) {
      log.error('Failed to fetch specific match', matchError, { matchId });
      throw new Error('Partido no encontrado');
    }
    
    currentMatch = {
      id: matchData.id,
      opponent: matchData.opponent,
      date: matchData.date_time,
      competition: matchData.competition
    };
    matchDate = matchData.date_time;
  } else {
    // Get current upcoming match
    currentMatch = await getCurrentUpcomingMatch();
    matchDate = currentMatch.date;
  }
  
  // Get all RSVPs for the current match using match_id if available
  let rsvpQuery = supabase
    .from('rsvps')
    .select('*')
    .order('created_at', { ascending: true });
  
  if (matchId && 'id' in currentMatch && currentMatch.id) {
    rsvpQuery = rsvpQuery.eq('match_id', currentMatch.id);
  } else {
    // Fallback to match_date for backwards compatibility
    rsvpQuery = rsvpQuery.eq('match_date', matchDate);
  }
  
  const { data: rsvps, error } = await rsvpQuery;

  if (error) {
    log.error('Failed to read RSVP data from Supabase', error, { matchId, matchDate });
    throw new Error('Error al obtener datos de confirmaciones');
  }

  // Calculate total attendees
  const totalAttendees = rsvps?.reduce((total: number, entry: RSVP) => total + entry.attendees, 0) ?? 0;
  
  return {
    success: true,
    currentMatch: currentMatch,
    totalAttendees,
    confirmedCount: rsvps?.length || 0
  };
}

// GET - Retrieve current RSVP data
export const GET = createApiHandler({
  auth: 'none',
  handler: async (_, context) => {
    const url = new URL(context.request.url);
    const matchParam = url.searchParams.get('match');
    const queryData = { match: matchParam ? parseInt(matchParam) : undefined };
    
    return await getRSVPData(queryData);
  }
});

async function createRSVP(rsvpData: RSVPInput) {
  const { name, email, attendees, message, whatsappInterest, matchId, userId } = rsvpData;

  let currentMatch;
  let currentMatchDate;
  let currentMatchId;

  if (matchId) {
    // Get specific match by ID
    const { data: matchData, error: matchError } = await supabase
      .from('matches')
      .select('id, opponent, date_time, competition')
      .eq('id', matchId)
      .maybeSingle();
      
    if (matchError || !matchData) {
      log.error('Failed to fetch specific match for RSVP', matchError, { matchId });
      throw new Error('Partido no encontrado');
    }
    
    currentMatch = {
      id: matchData.id,
      opponent: matchData.opponent,
      date: matchData.date_time,
      competition: matchData.competition
    };
    currentMatchDate = matchData.date_time;
    currentMatchId = matchData.id;
  } else {
    // Get current upcoming match
    const { data, error } = await supabase
      .from('matches')
      .select('id, opponent, date_time, competition')
      .gte('date_time', formatISO(new Date()))
      .order('date_time', { ascending: true })
      .limit(1)
      .maybeSingle();

    if (error || !data) {
      log.warn('Failed to fetch upcoming match, using fallback', undefined, { 
        error: error?.message || 'Unknown error'
      });
      // Fallback to default match
      currentMatch = {
        opponent: "Real Madrid",
        date: "2025-06-28T20:00:00",
        competition: "LaLiga"
      };
      currentMatchDate = "2025-06-28T20:00:00";
      currentMatchId = null;
    } else {
      currentMatch = {
        id: data.id,
        opponent: data.opponent,
        date: data.date_time,
        competition: data.competition
      };
      currentMatchDate = data.date_time;
      currentMatchId = data.id;
    }
  }

  // Check if email already exists for current match using match_id
  const { data: existingRSVPs, error: checkError } = await supabase
    .from('rsvps')
    .select('id')
    .eq('email', email.toLowerCase().trim())
    .eq('match_id', currentMatchId);

  if (checkError) {
    log.error('Failed to check existing RSVP', checkError, { 
      email: email.toLowerCase().trim(), 
      matchId: currentMatchId 
    });
    throw new Error('Error interno del servidor al verificar confirmación existente');
  }

  const isUpdate = existingRSVPs && existingRSVPs.length > 0;
  const existingRSVPId = isUpdate ? existingRSVPs[0].id : null;

  // Create new RSVP entry
  const newRSVPData = {
    name: name.trim(),
    email: email.toLowerCase().trim(),
    attendees: attendees,
    message: message?.trim() ?? '',
    whatsapp_interest: Boolean(whatsappInterest),
    match_date: currentMatchDate,
    match_id: currentMatchId,
    user_id: userId || null
  };

  let operationError;
  
  if (isUpdate) {
    // Delete existing RSVP and insert new one (workaround for update issues)
    const { error: deleteError } = await supabase
      .from('rsvps')
      .delete()
      .eq('id', existingRSVPId);
    
    if (deleteError) {
      log.error('Failed to delete existing RSVP', deleteError, { existingRSVPId });
      operationError = deleteError;
    } else {
      // Insert the updated RSVP
      const { error: insertError } = await supabase
        .from('rsvps')
        .insert(newRSVPData)
        .select();
      
      operationError = insertError;
    }
  } else {
    // Insert new RSVP
    const { error: insertError } = await supabase
      .from('rsvps')
      .insert(newRSVPData)
      .select();
    
    operationError = insertError;
  }

  if (operationError) {
    log.error(`Failed to ${isUpdate ? 'update' : 'insert'} RSVP`, operationError, {
      isUpdate,
      email: email.toLowerCase().trim(),
      matchId: currentMatchId,
      attendees
    });
    throw new Error(`Error interno del servidor al ${isUpdate ? 'actualizar' : 'procesar'} la confirmación`);
  }

  // Queue notification for admin users
  try {
    queueRSVPNotification(name.trim(), currentMatchDate);
  } catch (error) {
    log.warn('Failed to queue admin notification for RSVP', {
      email: email.toLowerCase().trim(),
      matchId: currentMatchId,
      attendees
    }, {
      error: error instanceof Error ? error.message : String(error)
    });
    // Don't fail the RSVP if notification fails
  }

  // Get updated totals for the current match using match_id
  const { data: allRSVPs, error: countError } = await supabase
    .from('rsvps')
    .select('attendees')
    .eq('match_id', currentMatchId);

  if (countError) {
    log.error('Failed to get RSVP counts after creation', countError, {
      matchId: currentMatchId
    });
    // Still return success since the RSVP was created, just with placeholder counts
    return {
      success: true,
      message: 'Confirmación recibida correctamente',
      totalAttendees: attendees,
      confirmedCount: 1
    };
  }

  const totalAttendees = allRSVPs?.reduce((total: number, entry: { attendees: number }) => total + entry.attendees, 0) ?? 0;

  // Log successful RSVP as business event
  log.business(isUpdate ? 'rsvp_updated' : 'rsvp_created', {
    attendees,
    totalAttendees,
    confirmedCount: allRSVPs?.length ?? 0,
    opponent: currentMatch.opponent
  }, {
    email: email.toLowerCase().trim(),
    matchId: currentMatchId
  });

  return {
    success: true,
    message: isUpdate ? 'Confirmación actualizada correctamente' : 'Confirmación recibida correctamente',
    totalAttendees,
    confirmedCount: allRSVPs?.length ?? 0
  };
}

// POST - Submit new RSVP
export const POST = createApiHandler({
  auth: 'none',
  schema: rsvpSchema,
  handler: async (validatedData) => {
    return await createRSVP(validatedData);
  }
});

async function deleteRSVP(deleteData: { id?: number; email?: string }) {
  const { id: entryId, email } = deleteData;

  let deleteQuery = supabase.from('rsvps').delete();
  
  if (entryId) {
    deleteQuery = deleteQuery.eq('id', entryId);
  } else if (email) {
    deleteQuery = deleteQuery.eq('email', email.toLowerCase());
  }

  const { data: deletedRSVPs, error: deleteError } = await deleteQuery.select();

  if (deleteError) {
    log.error('Failed to delete RSVP', deleteError, {
      entryId: entryId || undefined,
      email: email || undefined
    });
    throw new Error('Error interno del servidor al eliminar confirmación');
  }

  if (!deletedRSVPs || deletedRSVPs.length === 0) {
    throw new Error('Confirmación no encontrada');
  }

  // Get updated totals for the current match
  const currentMatch = await getCurrentUpcomingMatch();
  const currentMatchDate = currentMatch.date;
  const { data: remainingRSVPs, error: countError } = await supabase
    .from('rsvps')
    .select('attendees')
    .eq('match_date', currentMatchDate);

  if (countError) {
    log.error('Failed to get updated RSVP counts after deletion', countError, {
      currentMatchDate
    });
    // Still return success since the deletion happened
    return {
      success: true,
      message: 'Confirmación eliminada correctamente',
      totalAttendees: 0,
      confirmedCount: 0
    };
  }

  const totalAttendees = remainingRSVPs?.reduce((total: number, entry: { attendees: number }) => total + entry.attendees, 0) ?? 0;

  return {
    success: true,
    message: 'Confirmación eliminada correctamente',
    totalAttendees,
    confirmedCount: remainingRSVPs?.length ?? 0
  };
}

// DELETE - Remove RSVP (admin function)
export const DELETE = createApiHandler({
  auth: 'none', // TODO: Should this be admin only?
  handler: async (_, context) => {
    const url = new URL(context.request.url);
    const entryId = url.searchParams.get('id');
    const email = url.searchParams.get('email');
    
    const deleteData = {
      id: entryId ? parseInt(entryId) : undefined,
      email: email || undefined
    };
    
    return await deleteRSVP(deleteData);
  }
});
