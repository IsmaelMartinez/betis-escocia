import { NextRequest, NextResponse } from 'next/server';
import { supabase, type ContactSubmissionInsert } from '@/lib/supabase';
import { emailService, type ContactEmailData } from '@/lib/emailService';

// Supabase-based contact operations - no file system needed

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

    // Create new submission for Supabase
    const newSubmission: ContactSubmissionInsert = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim() || null,
      type: type ?? 'general',
      subject: subject.trim(),
      message: message.trim(),
      status: 'new'
    };

    // Insert into Supabase
    const { error: insertError } = await supabase
      .from('contact_submissions')
      .insert(newSubmission)
      .select()
      .single();

    if (insertError) {
      console.error('Error inserting contact submission:', insertError);
      return NextResponse.json({
        success: false,
        error: 'Error interno del servidor al procesar tu mensaje'
      }, { status: 500 });
    }

    // Send email notification to admin (non-blocking)
    const emailData: ContactEmailData = {
      name: newSubmission.name,
      email: newSubmission.email,
      phone: newSubmission.phone || undefined,
      type: newSubmission.type,
      subject: newSubmission.subject,
      message: newSubmission.message
    };
    
    // Send notification asynchronously (don't wait for it)
    emailService.sendContactNotification(emailData).catch(error => {
      console.error('Failed to send contact notification email:', error);
      // Don't fail the API request if email fails
    });

    // Log for admin purposes
    console.log(`New contact submission: ${name} (${email}) - Type: ${type ?? 'general'} - Subject: ${subject}`);

    return NextResponse.json({ 
      success: true, 
      message: 'Mensaje enviado correctamente. Te responderemos pronto.' 
    });

  } catch (error) {
    console.error('Error processing contact form:', error);
    
    // Provide more specific error messages for Supabase operations
    let errorMessage = 'Error interno del servidor al procesar tu mensaje';
    
    if (error instanceof SyntaxError) {
      errorMessage = 'Los datos enviados no son válidos. Por favor, revisa el formulario.';
    } else if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
      if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = 'Error de conexión con la base de datos. Por favor, inténtalo de nuevo.';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Tiempo de espera agotado. Por favor, inténtalo de nuevo.';
      } else if (error.message.includes('duplicate') || error.message.includes('unique')) {
        errorMessage = 'Ya existe un mensaje similar. Por favor, verifica tu información.';
      }
    }
    
    return NextResponse.json({ 
      success: false,
      error: errorMessage 
    }, { status: 500 });
  }
}

// GET - Retrieve contact statistics (for admin purposes)
export async function GET() {
  try {
    // Get total submissions count
    const { count: totalSubmissions, error: countError } = await supabase
      .from('contact_submissions')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error getting total submissions count:', countError);
      return NextResponse.json({
        success: false,
        error: 'Error al obtener estadísticas de contacto'
      }, { status: 500 });
    }

    // Get new submissions count
    const { count: newSubmissions, error: newCountError } = await supabase
      .from('contact_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'new');

    if (newCountError) {
      console.error('Error getting new submissions count:', newCountError);
      return NextResponse.json({
        success: false,
        error: 'Error al obtener estadísticas de contacto'
      }, { status: 500 });
    }
    
    return NextResponse.json({
      success: true,
      totalSubmissions: totalSubmissions || 0,
      newSubmissions: newSubmissions || 0,
      stats: {
        totalSubmissions: totalSubmissions || 0,
        responseRate: 0, // TODO: Calculate based on actual response data
        averageResponseTime: 24 // TODO: Calculate based on actual response times
      }
    });
  } catch (error) {
    console.error('Error reading contact statistics:', error);
    
    // Provide more specific error messages for Supabase
    let errorMessage = 'Error interno al obtener estadísticas de contacto';
    
    if (error && typeof error === 'object' && 'message' in error && typeof error.message === 'string') {
      if (error.message.includes('network') || error.message.includes('fetch')) {
        errorMessage = 'Error de conexión con la base de datos';
      } else if (error.message.includes('timeout')) {
        errorMessage = 'Tiempo de espera agotado al obtener estadísticas';
      }
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
