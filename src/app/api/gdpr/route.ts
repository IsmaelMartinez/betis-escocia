import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';

interface GDPRRequestBody {
  requestType: 'access' | 'deletion';
}

export async function POST(request: NextRequest) {
  try {
    const { userId } = await auth();

    if (!userId) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    const { requestType }: Pick<GDPRRequestBody, 'requestType'> = await request.json();

    // Validate input
    if (!requestType) {
      return NextResponse.json({
        success: false,
        error: 'Request type is required'
      }, { status: 400 });
    }

    if (requestType !== 'access' && requestType !== 'deletion') {
      return NextResponse.json({ success: false, error: 'Invalid request type' }, { status: 400 });
    }

    // Use userId for querying
    const { data: rsvps, error: rsvpError } = await supabase
      .from('rsvps')
      .select('*')
      .eq('user_id', userId); // Assuming rsvps table has user_id

    const { data: contacts, error: contactError } = await supabase
      .from('contact_submissions')
      .select('*')
      .eq('user_id', userId); // Assuming contact_submissions table has user_id

    if (rsvpError || contactError) {
      return NextResponse.json({
        success: false,
        error: 'Error checking records'
      }, { status: 500 });
    }

    if (requestType === 'access') {
      return NextResponse.json({
        success: true,
        data: {
          rsvps: rsvps || [],
          contacts: contacts || []
        }
      });
    }

    if (requestType === 'deletion') {
      const { error: rsvpDeleteError } = await supabase
        .from('rsvps')
        .delete()
        .eq('user_id', userId); // Use userId for deletion

      const { error: contactDeleteError } = await supabase
        .from('contact_submissions')
        .delete()
        .eq('user_id', userId); // Use userId for deletion

      if (rsvpDeleteError || contactDeleteError) {
        return NextResponse.json({
          success: false,
          error: 'Error deleting records'
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'Data deleted successfully'
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid request type' }, { status: 400 });
  } catch (error) {
    console.error('GDPR Request Error:', error);
    return NextResponse.json({
      success: false,
      error: 'An error occurred while processing the request'
    }, { status: 500 });
  }
}