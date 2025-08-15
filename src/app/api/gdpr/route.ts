import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';
import { auth } from '@clerk/nextjs/server';
import { log } from '@/lib/logger';

interface GDPRRequestBody {
  requestType: 'access' | 'deletion';
}

export async function POST(request: NextRequest) {
  let userId: string | null = null;
  try {
    const auth_result = await auth();
    userId = auth_result.userId;

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
      // Delete RSVPs
      const { data: deletedRsvps, error: rsvpDeleteError } = await supabase
        .from('rsvps')
        .delete()
        .eq('user_id', userId);

      // Delete contact submissions
      const { data: deletedContacts, error: contactDeleteError } = await supabase
        .from('contact_submissions')
        .delete()
        .eq('user_id', userId);

      // Log detailed results
      log.business('gdpr_deletion_executed', {
        rsvpCount: (deletedRsvps as any)?.length || 0,
        contactCount: (deletedContacts as any)?.length || 0,
        rsvpError: rsvpDeleteError?.message,
        contactError: contactDeleteError?.message
      }, { userId });

      if (rsvpDeleteError || contactDeleteError) {
        log.error('GDPR deletion failed', rsvpDeleteError || contactDeleteError, {
          userId,
          rsvpError: rsvpDeleteError?.message,
          contactError: contactDeleteError?.message
        });
        return NextResponse.json({
          success: false,
          error: 'Error deleting records',
          details: {
            rsvpError: rsvpDeleteError?.message,
            contactError: contactDeleteError?.message
          }
        }, { status: 500 });
      }

      return NextResponse.json({
        success: true,
        message: 'Data deleted successfully',
        deletedCounts: {
          rsvps: (deletedRsvps as any)?.length || 0,
          contacts: (deletedContacts as any)?.length || 0
        }
      });
    }

    return NextResponse.json({ success: false, error: 'Invalid request type' }, { status: 400 });
  } catch (error) {
    log.error('Unexpected error processing GDPR request', error, {
      userId: userId || 'unauthenticated'
    });
    return NextResponse.json({
      success: false,
      error: 'An error occurred while processing the request'
    }, { status: 500 });
  }
}