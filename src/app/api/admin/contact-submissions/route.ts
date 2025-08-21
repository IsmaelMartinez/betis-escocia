import { createApiHandler } from '@/lib/apiUtils';
import { supabase } from '@/lib/supabase';

// GET - List all contact submissions (admin only)
export const GET = createApiHandler({
  auth: 'admin',
  handler: async () => {
    const { data: submissions, error } = await supabase
      .from('contact_submissions')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error(`Failed to fetch contact submissions: ${error.message}`);
    }

    return { submissions: submissions || [] };
  }
});