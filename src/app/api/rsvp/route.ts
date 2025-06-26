import { NextRequest, NextResponse } from 'next/server';
import { join } from 'path';
import { writeFile, readFile, mkdir } from 'fs/promises';

interface RSVPEntry {
  id: string;
  name: string;
  email: string;
  attendees: number;
  message?: string;
  whatsappInterest: boolean;
  matchDate: string;
  submittedAt: string;
}

interface RSVPData {
  currentMatch: {
    opponent: string;
    date: string;
    competition: string;
  };
  entries: RSVPEntry[];
  totalAttendees: number;
}

const dataPath = join(process.cwd(), 'data', 'rsvp.json');

// Helper function to ensure data directory exists
async function ensureDataDirectory() {
  try {
    const dataDir = join(process.cwd(), 'data');
    await mkdir(dataDir, { recursive: true });
  } catch {
    // Directory might already exist, ignore error
  }
}

// Helper function to read RSVP data
async function readRSVPData(): Promise<RSVPData> {
  try {
    const fileContent = await readFile(dataPath, 'utf-8');
    return JSON.parse(fileContent);
  } catch {
    // If file doesn't exist, return default structure
    return {
      currentMatch: {
        opponent: "Real Madrid",
        date: "2025-06-28T20:00:00",
        competition: "LaLiga"
      },
      entries: [],
      totalAttendees: 0
    };
  }
}

// Helper function to write RSVP data
async function writeRSVPData(data: RSVPData): Promise<void> {
  await ensureDataDirectory();
  await writeFile(dataPath, JSON.stringify(data, null, 2), 'utf-8');
}

// GET - Retrieve current RSVP data
export async function GET() {
  try {
    const data = await readRSVPData();
    
    return NextResponse.json({
      success: true,
      currentMatch: data.currentMatch,
      totalAttendees: data.totalAttendees,
      confirmedCount: data.entries.length
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

    // Read current data
    const data = await readRSVPData();

    // Check if email already exists for current match
    const existingEntry = data.entries.find(entry => 
      entry.email.toLowerCase() === email.toLowerCase() && 
      entry.matchDate === data.currentMatch.date
    );

    if (existingEntry) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Este email ya ha confirmado asistencia para este partido' 
        },
        { status: 400 }
      );
    }

    // Create new RSVP entry
    const newEntry: RSVPEntry = {
      id: `rsvp_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      attendees: parseInt(attendees),
      message: message?.trim() ?? '',
      whatsappInterest: Boolean(whatsappInterest),
      matchDate: data.currentMatch.date,
      submittedAt: new Date().toISOString()
    };

    // Add to entries and update total
    data.entries.push(newEntry);
    data.totalAttendees = data.entries.reduce((total, entry) => total + entry.attendees, 0);

    // Save updated data
    await writeRSVPData(data);

    // Log for admin purposes (in a real app, you might send email notification here)
    console.log(`New RSVP: ${name} (${email}) - ${attendees} attendees for ${data.currentMatch.opponent}`);

    return NextResponse.json({
      success: true,
      message: 'Confirmación recibida correctamente',
      totalAttendees: data.totalAttendees,
      confirmedCount: data.entries.length
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

    const data = await readRSVPData();
    
    // Find and remove entry
    const initialLength = data.entries.length;
    data.entries = data.entries.filter(entry => {
      if (entryId) {
        return entry.id !== entryId;
      }
      if (email) {
        return entry.email.toLowerCase() !== email.toLowerCase();
      }
      return true;
    });

    if (data.entries.length === initialLength) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Confirmación no encontrada' 
        },
        { status: 404 }
      );
    }

    // Recalculate total attendees
    data.totalAttendees = data.entries.reduce((total, entry) => total + entry.attendees, 0);

    await writeRSVPData(data);

    return NextResponse.json({
      success: true,
      message: 'Confirmación eliminada correctamente',
      totalAttendees: data.totalAttendees,
      confirmedCount: data.entries.length
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
