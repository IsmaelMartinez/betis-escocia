import { NextRequest, NextResponse } from 'next/server';
import { supabase, type ContactSubmissionInsert, getAuthenticatedSupabaseClient } from '@/lib/supabase';

import { sanitizeObject, validateEmail, validateInputLength, checkRateLimit, getClientIP } from '@/lib/security';
import { getAuth } from '@clerk/nextjs/server';

// Supabase-based contact operations - no file system needed

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { name, email, phone, type, subject, message } = sanitizeObject(body);
    const { userId, getToken } = getAuth(request);
    let authenticatedSupabase;
    if (userId) {
      const clerkToken = await getToken({ template: 'supabase' });
      if (clerkToken) {
        authenticatedSupabase = getAuthenticatedSupabaseClient(clerkToken);
      }
    }

    // Rate limiting
    const clientIP = getClientIP(request);
    const rateLimit = checkRateLimit(clientIP, { windowMs: 15 * 60 * 1000, maxRequests: 3 });
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { success: false, error: 'Demasiadas solicitudes. Por favor, intenta de nuevo más tarde.' },
        { status: 429 }
      );
    }
    
    // Security validations
    const nameValidation = validateInputLength(name, 2, 50);
    if (!nameValidation.isValid) {
      return NextResponse.json({ success: false, error: nameValidation.error }, { status: 400 });
    }

    const emailValidation = validateEmail(email);
    if (!emailValidation.isValid) {
      return NextResponse.json({ success: false, error: emailValidation.error }, { status: 400 });
    }

    const subjectValidation = validateInputLength(subject, 3, 100);
    if (!subjectValidation.isValid) {
      return NextResponse.json({ success: false, error: subjectValidation.error }, { status: 400 });
    }

    const messageValidation = validateInputLength(message, 5, 1000);
    if (!messageValidation.isValid) {
      return NextResponse.json({ success: false, error: messageValidation.error }, { status: 400 });
    }

    // Required fields validation
    if (!name || !email || !subject || !message) {
      return NextResponse.json({ 
        success: false,
        error: 'Nombre, email, asunto y mensaje son obligatorios' 
      }, { status: 400 });
    }

    // Validate phone if provided
    if (phone && phone.trim()) {
      const phoneRegex = /^[+]?[\d\s-()]{9,15}$/;
      if (!phoneRegex.test(phone)) {
        return NextResponse.json({ 
          success: false,
          error: 'Formato de teléfono inválido' 
        }, { status: 400 });
      }
    }

    // Create new submission for Supabase
    const newSubmission: ContactSubmissionInsert = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      phone: phone?.trim() || null,
      type: type ?? 'general',
      subject: subject.trim(),
      message: message.trim(),
      status: 'new',
      user_id: userId || undefined
    };

    // Insert into Supabase
    const { error: insertError } = await (authenticatedSupabase || supabase)
      .from('contact_submissions')
      .insert(newSubmission)
      .select()
      .single();

    if (insertError) {
      console.error('Supabase insert error:', insertError);
      return NextResponse.json({
        success: false,
        error: 'Error interno del servidor al procesar tu mensaje'
      }, { status: 500 });
    }

    // Send email notification to admin (non-blocking)
    


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
