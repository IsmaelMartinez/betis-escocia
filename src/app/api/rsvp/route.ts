import { NextRequest, NextResponse } from 'next/server';
import { supabase, type RSVP, type RSVPInsert } from '@/lib/supabase';
import { emailService, type RSVPEmailData } from '@/lib/emailService';

// Default current match info (this could be moved to env vars or a separate config)
const DEFAULT_MATCH = {
  opponent: "Real Madrid",
  date: "2025-06-28T20:00:00",
  competition: "LaLiga"
};

// Helper function to get current upcoming match for RSVP
async function getCurrentUpcomingMatch() {
  // Query the database for upcoming matches
  const { data, error } = await supabase
    .from('matches')
    .select('id, opponent, date_time, competition')
    .gte('date_time', new Date().toISOString())
    .order('date_time', { ascending: true })
    .limit(1);

  if (error) {
    console.error('Error fetching upcoming match:', error);
    return DEFAULT_MATCH;
  }

  if (data && data.length > 0) {
    const nextMatch = data[0];
    return {
      opponent: nextMatch.opponent,
      date: nextMatch.date_time,
      competition: nextMatch.competition
    };
  }
  return DEFAULT_MATCH;
}

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
        .eq('id', parseInt(matchId))
        .single();
        
      if (matchError || !matchData) {
        console.error('Error fetching specific match:', matchError);
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
    
    // Get all RSVPs for the current match
    const { data: rsvps, error } = await supabase
      .from('rsvps')
      .select('*')
      .eq('match_date', matchDate)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error reading RSVP data from Supabase:', error);
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
    console.error('Error reading RSVP data:', error);
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
  try {
    const body = await request.json();
    const { name, email, attendees, message, whatsappInterest } = body;

    // Validation
    if (!name || !email || !attendees) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Nombre, email y número de asistentes son obligatorios' 
        },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Por favor introduce un email válido' 
        },
        { status: 400 }
      );
    }

    const currentMatch = await getCurrentUpcomingMatch();
    const currentMatchDate = currentMatch.date;

    // Check if email already exists for current match
    const { data: existingRSVPs, error: checkError } = await supabase
      .from('rsvps')
      .select('id')
      .eq('email', email.toLowerCase().trim())
      .eq('match_date', currentMatchDate);

    if (checkError) {
      console.error('Error checking existing RSVP:', checkError);
      return NextResponse.json(
        { 
          success: false, 
          error: 'Error interno del servidor al verificar confirmación existente' 
        },
        { status: 500 }
      );
    }

    const isUpdate = existingRSVPs && existingRSVPs.length > 0;

    // Create new RSVP entry
    const rsvpData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      attendees: parseInt(attendees),
      message: message?.trim() ?? '',
      whatsapp_interest: Boolean(whatsappInterest),
      match_date: currentMatchDate
    };

    let operationError;
    if (isUpdate) {
      // Update existing RSVP
      const { error: updateError } = await supabase
        .from('rsvps')
        .update(rsvpData)
        .eq('email', email.toLowerCase().trim())
        .eq('match_date', currentMatchDate);
      operationError = updateError;
    } else {
      // Insert new RSVP
      const { error: insertError } = await supabase
        .from('rsvps')
        .insert(rsvpData);
      operationError = insertError;
    }

    if (operationError) {
      console.error(`Error ${isUpdate ? 'updating' : 'inserting'} RSVP:`, operationError);
      return NextResponse.json(
        { 
          success: false, 
          error: `Error interno del servidor al ${isUpdate ? 'actualizar' : 'procesar'} la confirmación` 
        },
        { status: 500 }
      );
    }

    // Send email notification to admin (non-blocking)
    const emailData: RSVPEmailData = {
      name: rsvpData.name,
      email: rsvpData.email,
      attendees: rsvpData.attendees,
      matchDate: rsvpData.match_date,
      message: rsvpData.message,
      whatsappInterest: rsvpData.whatsapp_interest
    };
    
    // Send notification asynchronously (don't wait for it)
    emailService.sendRSVPNotification(emailData).catch(error => {
      console.error('Failed to send RSVP notification email:', error);
      // Don't fail the API request if email fails
    });

    // Get updated totals for the current match
    const { data: allRSVPs, error: countError } = await supabase
      .from('rsvps')
      .select('attendees')
      .eq('match_date', currentMatchDate);

    if (countError) {
      console.error('Error getting RSVP counts:', countError);
      // Still return success since the RSVP was created, just with placeholder counts
      return NextResponse.json({
        success: true,
        message: 'Confirmación recibida correctamente',
        totalAttendees: parseInt(attendees),
        confirmedCount: 1
      });
    }

    const totalAttendees = allRSVPs?.reduce((total: number, entry: { attendees: number }) => total + entry.attendees, 0) ?? 0;

    // Log for admin purposes
    console.log(`${isUpdate ? 'Updated' : 'New'} RSVP: ${name} (${email}) - ${attendees} attendees for ${currentMatch.opponent}`);

    return NextResponse.json({
      success: true,
      message: isUpdate ? 'Confirmación actualizada correctamente' : 'Confirmación recibida correctamente',
      totalAttendees,
      confirmedCount: allRSVPs?.length ?? 0
    });

  } catch (error) {
    console.error('Error processing RSVP:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor al procesar la confirmación' 
      },
      { status: 500 }
    );
  }
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
      console.error('Error deleting RSVP:', deleteError);
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
      console.error('Error getting updated RSVP counts:', countError);
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
    console.error('Error deleting RSVP:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Error interno del servidor' 
      },
      { status: 500 }
    );
  }
}
