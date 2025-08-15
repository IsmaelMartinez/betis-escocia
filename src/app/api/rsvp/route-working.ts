/**
 * Working refactored RSVP API route using new abstraction patterns
 * Simplified version that compiles without TypeScript issues
 */

import { createApiHandler } from '@/lib/apiUtils';
import { rsvpSchema } from '@/lib/schemas/rsvp';
import { supabase } from '@/lib/supabase';
import { queueRSVPNotification } from '@/lib/notifications/queueManager';
import { getCurrentUpcomingMatch } from '@/lib/matchUtils';

// GET - Retrieve current RSVP data
export const GET = createApiHandler({
  auth: 'none',
  handler: async (_, context) => {
    const { searchParams } = new URL(context.request.url);
    const matchId = searchParams.get('match');
    
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
    
    // Get all RSVPs for the current match
    let rsvpQuery = supabase
      .from('rsvps')
      .select('*')
      .order('created_at', { ascending: true });
    
    if (matchId && 'id' in currentMatch && currentMatch.id) {
      rsvpQuery = rsvpQuery.eq('match_id', currentMatch.id);
    } else {
      rsvpQuery = rsvpQuery.eq('match_date', matchDate);
    }
    
    const { data: rsvps, error } = await rsvpQuery;

    if (error) {
      console.error('Error reading RSVP data from Supabase:', error);
      throw new Error('Error al obtener datos de confirmaciones');
    }

    const totalAttendees = rsvps?.reduce((total: number, entry: any) => total + entry.attendees, 0) ?? 0;
    
    return {
      success: true,
      currentMatch: currentMatch,
      totalAttendees,
      confirmedCount: rsvps?.length || 0
    };
  }
});

// POST - Submit new RSVP
export const POST = createApiHandler({
  auth: 'none',
  schema: rsvpSchema,
  handler: async (validatedData) => {
    const { name, email, attendees, message, whatsappInterest, matchId, userId } = validatedData;

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
      currentMatch = await getCurrentUpcomingMatch();
      currentMatchDate = currentMatch.date;
      currentMatchId = 'id' in currentMatch ? currentMatch.id : null;
    }

    // Check if email already exists for current match
    const { data: existingRSVPs, error: checkError } = await supabase
      .from('rsvps')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .eq('match_id', currentMatchId);

    if (checkError) {
      console.error('Error checking existing RSVP:', checkError);
      throw new Error('Error interno del servidor al verificar confirmación existente');
    }

    const isUpdate = existingRSVPs && existingRSVPs.length > 0;
    const existingRSVPId = isUpdate ? existingRSVPs[0].id : null;

    // Create new RSVP entry
    const rsvpData = {
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
      // Delete existing RSVP and insert new one
      const { error: deleteError } = await supabase
        .from('rsvps')
        .delete()
        .eq('id', existingRSVPId);
      
      if (deleteError) {
        console.error('Error deleting existing RSVP:', deleteError);
        operationError = deleteError;
      } else {
        const { error: insertError } = await supabase
          .from('rsvps')
          .insert(rsvpData)
          .select();
        
        operationError = insertError;
      }
    } else {
      const { error: insertError } = await supabase
        .from('rsvps')
        .insert(rsvpData)
        .select();
      
      operationError = insertError;
    }

    if (operationError) {
      console.error(`Error ${isUpdate ? 'updating' : 'inserting'} RSVP:`, operationError);
      throw new Error(`Error interno del servidor al ${isUpdate ? 'actualizar' : 'procesar'} la confirmación`);
    }

    // Queue notification for admin users
    try {
      queueRSVPNotification(name.trim(), currentMatchDate);
    } catch (error) {
      console.warn('Error queueing admin notification:', error);
    }

    // Get updated totals
    const { data: allRSVPs, error: countError } = await supabase
      .from('rsvps')
      .select('attendees')
      .eq('match_id', currentMatchId);

    if (countError) {
      console.error('Error getting RSVP counts:', countError);
      return {
        success: true,
        message: 'Confirmación recibida correctamente',
        totalAttendees: attendees,
        confirmedCount: 1
      };
    }

    const totalAttendees = allRSVPs?.reduce((total: number, entry: { attendees: number }) => total + entry.attendees, 0) ?? 0;

    console.log(`${isUpdate ? 'Updated' : 'New'} RSVP: ${name} (${email}) - ${attendees} attendees`);

    return {
      success: true,
      message: isUpdate ? 'Confirmación actualizada correctamente' : 'Confirmación recibida correctamente',
      totalAttendees,
      confirmedCount: allRSVPs?.length ?? 0
    };
  }
});

// DELETE - Remove RSVP (admin function)
export const DELETE = createApiHandler({
  auth: 'none', // Will be restricted by query validation
  handler: async (_, context) => {
    const { searchParams } = new URL(context.request.url);
    const entryId = searchParams.get('id');
    const email = searchParams.get('email');

    if (!entryId && !email) {
      throw new Error('ID de entrada o email requerido');
    }

    let deleteQuery = supabase.from('rsvps').delete();
    
    if (entryId) {
      deleteQuery = deleteQuery.eq('id', parseInt(entryId));
    } else if (email) {
      deleteQuery = deleteQuery.eq('email', email.toLowerCase());
    }

    const { data: deletedRSVPs, error: deleteError } = await deleteQuery.select();

    if (deleteError) {
      console.error('Error deleting RSVP:', deleteError);
      throw new Error('Error interno del servidor al eliminar confirmación');
    }

    if (!deletedRSVPs || deletedRSVPs.length === 0) {
      throw new Error('Confirmación no encontrada');
    }

    // Get updated totals
    const currentMatch = await getCurrentUpcomingMatch();
    const currentMatchDate = currentMatch.date;
    const { data: remainingRSVPs, error: countError } = await supabase
      .from('rsvps')
      .select('attendees')
      .eq('match_date', currentMatchDate);

    if (countError) {
      console.error('Error getting updated RSVP counts:', countError);
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
});