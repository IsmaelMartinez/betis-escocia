import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from "@sentry/nextjs";
import { supabase, type RSVP } from '@/lib/supabase';
import { getCurrentUpcomingMatch } from '@/lib/matchUtils';
import { rsvpSchema } from '@/lib/schemas/rsvp';
import { ZodError } from 'zod';
import { formatISO } from 'date-fns';
import { log } from '@/lib/logger';

// Default current match info (this could be moved to env vars or a separate config)


// GET - Retrieve current RSVP data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
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
        log.error('Failed to fetch specific match', matchError, { matchId });
        return NextResponse.json(
          { 
            success: false, 
            error: 'Partido no encontrado' 
          },
          { status: 404 }
        );
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
      return NextResponse.json(
        { 
          success: false, 
          error: 'Error al obtener datos de confirmaciones' 
        },
        { status: 500 }
      );
    }

    // Calculate total attendees
    const totalAttendees = rsvps?.reduce((total: number, entry: RSVP) => total + entry.attendees, 0) ?? 0;
    
    return NextResponse.json({
      success: true,
      currentMatch: currentMatch,
      totalAttendees,
      confirmedCount: rsvps?.length || 0
    });
  } catch (error) {
    log.error('Unexpected error reading RSVP data', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error al obtener datos de confirmaciones' 
      },
      { status: 500 }
    );
  }
}

// POST - Submit new RSVP
export async function POST(request: NextRequest) {
  return Sentry.startSpan(
    {
      op: "http.server",
      name: "POST /api/rsvp",
      attributes: {
        method: "POST",
        route: "/api/rsvp",
      },
    },
    async () => {
  try {
    const body = await request.json();
    
    // Validate input using Zod schema
    const validatedData = rsvpSchema.parse(body);
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
        log.error('Failed to fetch specific match for RSVP', matchError, { matchId });
        return NextResponse.json(
          { 
            success: false, 
            error: 'Partido no encontrado' 
          },
          { status: 404 }
        );
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
      return NextResponse.json(
        { 
          success: false, 
          error: 'Error interno del servidor al verificar confirmación existente' 
        },
        { status: 500 }
      );
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
      user_id: userId || null // Include userId if present
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
          .insert(rsvpData)
          .select();
        
        operationError = insertError;
      }
    } else {
      // Insert new RSVP
      const { error: insertError } = await supabase
        .from('rsvps')
        .insert(rsvpData)
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
      return NextResponse.json(
        { 
          success: false, 
          error: `Error interno del servidor al ${isUpdate ? 'actualizar' : 'procesar'} la confirmación` 
        },
        { status: 500 }
      );
    }

    // Queue notification for admin users (will be picked up by SSE stream)
    try {
      const notification = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        type: 'rsvp' as const,
        data: {
          title: '🎉 Nuevo RSVP - Peña Bética',
          body: `${name.trim()} confirmó asistencia para el partido`,
          icon: '/images/logo_no_texto.jpg',
          tag: 'rsvp-notification',
          url: '/admin'
        }
      };

      // Store in global notification queue for SSE pickup
      global.pendingNotifications = global.pendingNotifications || [];
      global.pendingNotifications.push(notification);

      // Clean up old notifications (keep only last 100)
      if (global.pendingNotifications.length > 100) {
        global.pendingNotifications = global.pendingNotifications.slice(-100);
      }

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
      return NextResponse.json({
        success: true,
        message: 'Confirmación recibida correctamente',
        totalAttendees: attendees,
        confirmedCount: 1
      });
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

    return NextResponse.json({
      success: true,
      message: isUpdate ? 'Confirmación actualizada correctamente' : 'Confirmación recibida correctamente',
      totalAttendees,
      confirmedCount: allRSVPs?.length ?? 0
    });

  } catch (error) {
    log.error('Unexpected error processing RSVP', error);
    
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const errorMessages = error.issues.map(issue => issue.message);
      log.warn('RSVP validation failed', undefined, { 
        validationErrors: errorMessages 
      });
      return NextResponse.json({
        success: false,
        error: 'Datos de confirmación inválidos',
        details: errorMessages
      }, { status: 400 });
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor al procesar la confirmación' 
      },
      { status: 500 }
    );
  }
});
}

// DELETE - Remove RSVP (admin function)
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const entryId = searchParams.get('id');
    const email = searchParams.get('email');

    if (!entryId && !email) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'ID de entrada o email requerido' 
        },
        { status: 400 }
      );
    }

    let deleteQuery = supabase.from('rsvps').delete();
    
    if (entryId) {
      deleteQuery = deleteQuery.eq('id', parseInt(entryId));
    } else if (email) {
      deleteQuery = deleteQuery.eq('email', email.toLowerCase());
    }

    const { data: deletedRSVPs, error: deleteError } = await deleteQuery.select();

    if (deleteError) {
      log.error('Failed to delete RSVP', deleteError, {
        entryId: entryId || undefined,
        email: email || undefined
      });
      return NextResponse.json(
        { 
          success: false, 
          error: 'Error interno del servidor al eliminar confirmación' 
        },
        { status: 500 }
      );
    }

    if (!deletedRSVPs || deletedRSVPs.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Confirmación no encontrada' 
        },
        { status: 404 }
      );
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
      return NextResponse.json({
        success: true,
        message: 'Confirmación eliminada correctamente',
        totalAttendees: 0,
        confirmedCount: 0
      });
    }

    const totalAttendees = remainingRSVPs?.reduce((total: number, entry: { attendees: number }) => total + entry.attendees, 0) ?? 0;

    return NextResponse.json({
      success: true,
      message: 'Confirmación eliminada correctamente',
      totalAttendees,
      confirmedCount: remainingRSVPs?.length ?? 0
    });

  } catch (error) {
    log.error('Unexpected error deleting RSVP', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor' 
      },
      { status: 500 }
    );
  }
}
