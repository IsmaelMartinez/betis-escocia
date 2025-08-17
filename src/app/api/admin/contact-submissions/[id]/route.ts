import { createApiHandler } from '@/lib/apiUtils';
import { z } from 'zod';

const updateStatusSchema = z.object({
  status: z.enum(['new', 'in progress', 'resolved'])
});

export const PUT = createApiHandler({
  auth: 'admin',
  schema: updateStatusSchema,
  handler: async (validatedData, context) => {
    const { status } = validatedData;
    const { user, authenticatedSupabase } = context;
    
    const id = parseInt(context.request.url.split('/').pop() || '', 10);
    if (isNaN(id)) {
      throw new Error('Invalid ID');
    }

    const { data, error } = await authenticatedSupabase!
      .from('contact_submissions')
      .update({ status: status, updated_by: user!.id })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Supabase update error:', error);
      throw new Error('Failed to update status');
    }

    if (!data) {
      throw new Error('Submission not found or not authorized');
    }

    return { success: true, data };
  }
});
