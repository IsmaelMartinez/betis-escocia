import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs/promises';
import path from 'path';

interface ContactSubmission {
  id: string;
  name: string;
  email: string;
  phone?: string;
  type: 'general' | 'rsvp' | 'merchandise' | 'photo' | 'whatsapp' | 'feedback';
  subject: string;
  message: string;
  submittedAt: string;
  status: 'new' | 'read' | 'responded' | 'closed';
}

interface ContactData {
  submissions: ContactSubmission[];
  stats: {
    totalSubmissions: number;
    responseRate: number;
    averageResponseTime: number; // in hours
  };
}

const CONTACT_FILE_PATH = path.join(process.cwd(), 'data', 'contact.json');

async function readContactData(): Promise<ContactData> {
  try {
    const dataDir = path.dirname(CONTACT_FILE_PATH);
    await fs.mkdir(dataDir, { recursive: true });
    
    const data = await fs.readFile(CONTACT_FILE_PATH, 'utf-8');
    return JSON.parse(data);
  } catch (error) {
    console.error('Error reading contact data:', error);
    return {
      submissions: [],
      stats: {
        totalSubmissions: 0,
        responseRate: 0,
        averageResponseTime: 24
      }
    };
  }
}

async function writeContactData(data: ContactData): Promise<void> {
  const dataDir = path.dirname(CONTACT_FILE_PATH);
  await fs.mkdir(dataDir, { recursive: true });
  await fs.writeFile(CONTACT_FILE_PATH, JSON.stringify(data, null, 2));
}

export async function POST(request: NextRequest) {
  try {
    const { name, email, phone, type, subject, message } = await request.json();
    
    // Validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ 
        success: false,
        error: 'Nombre, email, asunto y mensaje son obligatorios' 
      }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json({ 
        success: false,
        error: 'Por favor introduce un email válido' 
      }, { status: 400 });
    }

    // Read current data
    const data = await readContactData();

    // Create new submission
    const newSubmission: ContactSubmission = {
      id: `contact_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`,
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim(),
      type: type ?? 'general',
      subject: subject.trim(),
      message: message.trim(),
      submittedAt: new Date().toISOString(),
      status: 'new'
    };

    // Add to submissions
    data.submissions.push(newSubmission);
    
    // Update stats
    data.stats.totalSubmissions = data.submissions.length;

    // Save updated data
    await writeContactData(data);

    // Log for admin purposes (in a real app, you might send email notification here)
    console.log(`New contact submission: ${name} (${email}) - Type: ${type ?? 'general'} - Subject: ${subject}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Mensaje enviado correctamente. Te responderemos pronto.' 
    });

  } catch (error) {
    console.error('Error processing contact form:', error);
    
    // Provide more specific error messages based on the error type
    let errorMessage = 'Error interno del servidor al procesar tu mensaje';
    
    if (error instanceof SyntaxError) {
      errorMessage = 'Los datos enviados no son válidos. Por favor, revisa el formulario.';
    } else if (error && typeof error === 'object' && 'code' in error && (error.code === 'ENOENT' || error.code === 'EACCES')) {
      errorMessage = 'Error de almacenamiento temporal. Por favor, inténtalo de nuevo.';
    } else if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string' && error.message.includes('space')) {
      errorMessage = 'Error de espacio de almacenamiento. Por favor, contacta al administrador.';
    }
    
    return NextResponse.json({ 
      success: false,
      error: errorMessage 
    }, { status: 500 });
  }
}

// GET - Retrieve contact data (for admin purposes)
export async function GET() {
  try {
    const data = await readContactData();
    
    return NextResponse.json({
      success: true,
      totalSubmissions: data.stats.totalSubmissions,
      newSubmissions: data.submissions.filter(s => s.status === 'new').length,
      stats: data.stats
    });
  } catch (error) {
    console.error('Error reading contact data:', error);
    
    // Provide more specific error messages
    let errorMessage = 'Error al cargar los datos de contacto';
    
    if (error && typeof error === 'object' && 'code' in error) {
      if (error.code === 'ENOENT') {
        errorMessage = 'No se encontraron datos de contacto previos';
      } else if (error.code === 'EACCES') {
        errorMessage = 'Error de permisos al acceder a los datos';
      }
    } else if (error instanceof SyntaxError) {
      errorMessage = 'Error en el formato de los datos almacenados';
    }
    
    return NextResponse.json(
      { 
        success: false, 
        error: errorMessage 
      },
      { status: 500 }
    );
  }
}
