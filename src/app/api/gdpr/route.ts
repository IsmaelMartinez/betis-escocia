import { NextRequest, NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

interface GDPRRequestBody {
  email: string;
  requestType: 'access' | 'deletion';
}

export async function POST(request: NextRequest) {
  try {
    const { email, requestType }: GDPRRequestBody = await request.json();

    // Validate input
    if (!email || !requestType) {
      return NextResponse.json({
        success: false,
        error: 'Email and request type are required'
      }, { status: 400 });
    }

    // Check if the email exists in the RSVPs or contacts
    const { data: rsvps, error: rsvpError } = await supabase
      .from('rsvps')
      .select('*')
      .eq('email', email.toLowerCase().trim());

    const { data: contacts, error: contactError } = await supabase
      .from('contact_submissions')
      .select('*')
      .eq('email', email.toLowerCase().trim());

    if (rsvpError || contactError) {
      return NextResponse.json({
        success: false,
        error: 'Error checking records'
      }, { status: 500 });
    }

    if (requestType === 'access') {
      // Return the user data as JSON
      return NextResponse.json({
        success: true,
        data: {
          rsvps: rsvps || [],
          contacts: contacts || []
        }
      });
    }

    if (requestType === 'deletion') {
      // Delete the user data
      const { error: rsvpDeleteError } = await supabase
        .from('rsvps')
        .delete()
        .eq('email', email.toLowerCase().trim());

      const { error: contactDeleteError } = await supabase
        .from('contact_submissions')
        .delete()
        .eq('email', email.toLowerCase().trim());

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
