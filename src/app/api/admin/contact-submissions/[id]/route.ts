import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { currentUser } from '@clerk/nextjs/server';
import { isAdmin } from '@/lib/roleUtils';

export async function PUT(request: NextRequest) {
  try {
    const user = await currentUser();

    if (!user || !isAdmin(user)) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const id = request.url.split('/').pop();
    if (!id) {
      return NextResponse.json({ success: false, error: 'Missing ID' }, { status: 400 });
    }
    console.log('Received ID:', id);
    const { status } = await request.json();

    if (!status || !['new', 'in progress', 'resolved'].includes(status)) {
      return NextResponse.json({ success: false, error: 'Invalid status provided' }, { status: 400 });
    }

    const { data, error } = await supabase
      .from('contact_submissions')
      .update({ status: status })
      .eq('id', id)
      .select()
      .maybeSingle();

    if (error) {
      console.error('Error updating contact submission status:', error);
      return NextResponse.json({ success: false, error: 'Failed to update status' }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ success: false, error: 'Submission not found or not authorized' }, { status: 404 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Error in PUT /api/admin/contact-submissions/[id]:', error);
    return NextResponse.json({ success: false, error: 'Internal server error' }, { status: 500 });
  }
}
