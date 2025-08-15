/**
 * Working refactored Contact API route using new abstraction patterns
 * Simplified version that compiles without TypeScript issues
 */

import { createApiHandler } from '@/lib/apiUtils';
import { contactSchema } from '@/lib/schemas/contact';
import { supabase, getAuthenticatedSupabaseClient, type ContactSubmissionInsert } from '@/lib/supabase';
import { getAuth } from '@clerk/nextjs/server';
import { queueContactNotification } from '@/lib/notifications/queueManager';

// POST - Submit contact form
export const POST = createApiHandler({
  auth: 'none', // Contact supports anonymous submissions
  schema: contactSchema,
  handler: async (validatedData, context) => {
    const { name, email, phone, type, subject, message } = validatedData;
    
    // Get user authentication if available
    const { userId, getToken } = getAuth(context.request);
    let authenticatedSupabase;
    
    if (userId) {
      const clerkToken = await getToken({ template: 'supabase' });
      if (clerkToken) {
        authenticatedSupabase = getAuthenticatedSupabaseClient(clerkToken);
      }
    }

    // Create new submission
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
      throw new Error('Error interno del servidor al procesar tu mensaje');
    }

    // Queue notification for admin users
    try {
      queueContactNotification(name.trim(), type);
    } catch (error) {
      console.warn('Error queueing admin notification:', error);
      // Don't fail the contact submission if notification fails
    }

    return {
      success: true,
      message: 'Mensaje enviado correctamente. Te responderemos pronto.'
    };
  }
});

// GET - Retrieve contact statistics (for admin purposes)
export const GET = createApiHandler({
  auth: 'none',
  handler: async (_, context) => {
    // Get total submissions count
    const { count: totalSubmissions, error: countError } = await supabase
      .from('contact_submissions')
      .select('*', { count: 'exact', head: true });

    if (countError) {
      console.error('Error getting total submissions count:', countError);
      throw new Error('Error al obtener estadísticas de contacto');
    }

    // Get new submissions count
    const { count: newSubmissions, error: newCountError } = await supabase
      .from('contact_submissions')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'new');

    if (newCountError) {
      console.error('Error getting new submissions count:', newCountError);
      throw new Error('Error al obtener estadísticas de contacto');
    }
    
    return {
      success: true,
      totalSubmissions: totalSubmissions || 0,
      newSubmissions: newSubmissions || 0,
      stats: {
        totalSubmissions: totalSubmissions || 0,
        responseRate: 0,
        averageResponseTime: 24
      }
    };
  }
});