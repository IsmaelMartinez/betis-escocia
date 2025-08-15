import { NextRequest, NextResponse } from 'next/server';
import { supabase, type ContactSubmissionInsert, getAuthenticatedSupabaseClient } from '@/lib/supabase';
import { getAuth } from '@clerk/nextjs/server';
import { contactSchema } from '@/lib/schemas/contact';
import { ZodError } from 'zod';

// Supabase-based contact operations - no file system needed

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validate input using Zod schema
    const validatedData = contactSchema.parse(body);
    const { name, email, phone, type, subject, message } = validatedData;
    
    const { userId, getToken } = getAuth(request);
    let authenticatedSupabase;
    if (userId) {
      const clerkToken = await getToken({ template: 'supabase' });
      if (clerkToken) {
        authenticatedSupabase = getAuthenticatedSupabaseClient(clerkToken);
      }
    }

    // Create new submission for Supabase (data already validated and sanitized by Zod)
    const newSubmission: ContactSubmissionInsert = {
      name,
      email,
      phone: phone || null,
      type,
      subject,
      message,
      status: 'new',
      user_id: userId || undefined
    };

    // Insert into Supabase
    const { data: insertedSubmission, error: insertError } = await (authenticatedSupabase || supabase)
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

    // Queue notification for admin users (will be picked up by SSE stream)
    try {
      const notification = {
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        type: 'contact' as const,
        data: {
          title: '📬 Nuevo Mensaje - Peña Bética',
          body: `${name.trim()} envió un mensaje (${type ?? 'general'})`,
          icon: '/images/logo_no_texto.jpg',
          tag: 'contact-notification',
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

      console.log('Contact notification queued:', notification.id);
    } catch (error) {
      console.warn('Error queueing admin notification:', error);
      // Don't fail the contact submission if notification fails
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Mensaje enviado correctamente. Te responderemos pronto.' 
    });

  } catch (error) {
    console.error('Error processing contact form:', error);
    
    // Handle Zod validation errors
    if (error instanceof ZodError) {
      const errorMessages = error.issues.map(issue => issue.message);
      return NextResponse.json({
        success: false,
        error: 'Datos de formulario inválidos',
        details: errorMessages
      }, { status: 400 });
    }
    
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
