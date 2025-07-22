import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { getAuth, currentUser } from '@clerk/nextjs/server';
import { isAdmin } from '@/lib/roleUtils';

export async function PUT(request: NextRequest) {
  try {
    const { userId, getToken } = getAuth(request);
    const user = await currentUser();

    if (!userId || !user) {
      return NextResponse.json({ success: false, error: 'Unauthorized. Please sign in.' }, { status: 401 });
    }

    const userIsAdmin = isAdmin(user);

    if (!userIsAdmin) {
      return NextResponse.json({ success: false, error: 'Forbidden. Admin access required.' }, { status: 403 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        global: {
          // Pass the Clerk session token to Supabase
          // Supabase will validate this token against Clerk's JWKS endpoint
          // and set the authenticated user context for RLS.
          headers: { Authorization: `Bearer ${await getToken()}` },
        },
      }
    );

    const id = parseInt(request.url.split('/').pop() || '', 10);
    if (isNaN(id)) {
      return NextResponse.json({ success: false, error: 'Invalid ID' }, { status: 400 });
    }
    console.log('Received ID:', id);
    const { status } = await request.json();

    if (!status || !['new', 'in progress', 'resolved'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid status provided' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('contact_submissions')
      .update({ status: status, updated_by: userId })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Supabase update error:', error);
      return NextResponse.json({ success: false, error: 'Failed to update status' }, { status: 500 });
    }

    if (!data) {
      console.warn('Supabase update returned no data for ID:', id);
      return NextResponse.json({ success: false, error: 'Submission not found or not authorized' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error in PUT /api/admin/contact-submissions/[id]:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
