import { createApiHandler, type ApiContext } from '@/lib/api/apiUtils';
import { supabase } from '@/lib/api/supabase';
import { gdprSchema, type GDPRInput } from '@/lib/schemas/rsvp';
import { log } from '@/lib/utils/logger';

async function processGDPRRequest(gdprData: GDPRInput, context: ApiContext) {
  const { requestType } = gdprData;
  const userId = context.userId;
  
  if (!userId) {
    throw new Error('Usuario no autenticado');
  }

  // Use userId for querying
  const { data: rsvps, error: rsvpError } = await supabase
    .from('rsvps')
    .select('*')
    .eq('user_id', userId);

  const { data: contacts, error: contactError } = await supabase
    .from('contact_submissions')
    .select('*')
    .eq('user_id', userId);

  if (rsvpError || contactError) {
    log.error('Error checking GDPR records', rsvpError || contactError, { userId });
    throw new Error('Error verificando registros');
  }

  if (requestType === 'access') {
    return {
      success: true,
      data: {
        rsvps: rsvps || [],
        contacts: contacts || []
      }
    };
  }

  if (requestType === 'deletion') {
    // Delete RSVPs
    const { data: deletedRsvps, error: rsvpDeleteError } = await supabase
      .from('rsvps')
      .delete()
      .eq('user_id', userId)
      .select();

    // Delete contact submissions
    const { data: deletedContacts, error: contactDeleteError } = await supabase
      .from('contact_submissions')
      .delete()
      .eq('user_id', userId)
      .select();

    // Log detailed results
    log.business('gdpr_deletion_executed', {
      rsvpCount: deletedRsvps?.length || 0,
      contactCount: deletedContacts?.length || 0,
      rsvpError: rsvpDeleteError?.message,
      contactError: contactDeleteError?.message
    }, { userId });

    if (rsvpDeleteError || contactDeleteError) {
      log.error('GDPR deletion failed', rsvpDeleteError || contactDeleteError, {
        userId,
        rsvpError: rsvpDeleteError?.message,
        contactError: contactDeleteError?.message
      });
      throw new Error('Error eliminando registros');
    }

    return {
      success: true,
      message: 'Datos eliminados correctamente',
      deletedCounts: {
        rsvps: deletedRsvps?.length || 0,
        contacts: deletedContacts?.length || 0
      }
    };
  }

  throw new Error('Tipo de petición inválido');
}

// POST - Process GDPR request
export const POST = createApiHandler({
  auth: 'user', // Requires authentication
  schema: gdprSchema,
  handler: async (validatedData, context) => {
    return await processGDPRRequest(validatedData, context);
  }
});