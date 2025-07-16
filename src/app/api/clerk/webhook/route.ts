import { NextRequest, NextResponse } from 'next/server';
import { headers } from 'next/headers';
import { Webhook } from 'svix';
import { supabase } from '@/lib/supabase';

// Clerk webhook secret - should be set in environment variables
const CLERK_WEBHOOK_SECRET = process.env.CLERK_WEBHOOK_SECRET;

export async function POST(request: NextRequest) {
  if (!CLERK_WEBHOOK_SECRET) {
    console.error('CLERK_WEBHOOK_SECRET is not set');
    return NextResponse.json({ error: 'Webhook secret not configured' }, { status: 500 });
  }

  // Get headers
  const headersList = await headers();
  const svixId = headersList.get('svix-id');
  const svixTimestamp = headersList.get('svix-timestamp');
  const svixSignature = headersList.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing required headers' }, { status: 400 });
  }

  // Get body
  const payload = await request.text();

  // Verify webhook signature
  const webhook = new Webhook(CLERK_WEBHOOK_SECRET);
  let event: { type: string; data: Record<string, unknown> };

  try {
    event = webhook.verify(payload, {
      'svix-id': svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as { type: string; data: Record<string, unknown> };
  } catch (error) {
    console.error('Webhook verification failed:', error);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  // Handle different event types
  switch (event.type) {
    case 'user.created':
      await handleUserCreated(event.data as { id: string; email_addresses?: { email_address: string }[] });
      break;
    case 'user.updated':
      await handleUserUpdated(event.data as { id: string; email_addresses?: { email_address: string }[] });
      break;
    case 'user.deleted':
      await handleUserDeleted(event.data as { id: string });
      break;
    default:
      console.log(`Unhandled event type: ${event.type}`);
  }

  return NextResponse.json({ message: 'Webhook processed successfully' });
}

async function handleUserCreated(userData: {
  id: string;
  email_addresses?: { email_address: string }[];
}) {
  console.log('User created:', userData.id);
  
  // Get user email for linking existing submissions
  const email = userData.email_addresses?.[0]?.email_address;
  if (!email) {
    console.warn('No email found for user:', userData.id);
    return;
  }

  try {
    // Link existing RSVP submissions to this user
    const { error: rsvpError } = await supabase
      .from('rsvps')
      .update({ user_id: userData.id })
      .eq('email', email)
      .is('user_id', null);

    if (rsvpError) {
      console.error('Error linking RSVP submissions:', rsvpError);
    } else {
      console.log(`Linked RSVP submissions for user ${userData.id} with email ${email}`);
    }

    // Link existing contact submissions to this user
    const { error: contactError } = await supabase
      .from('contact_submissions')
      .update({ user_id: userData.id })
      .eq('email', email)
      .is('user_id', null);

    if (contactError) {
      console.error('Error linking contact submissions:', contactError);
    } else {
      console.log(`Linked contact submissions for user ${userData.id} with email ${email}`);
    }

  } catch (error) {
    console.error('Error in handleUserCreated:', error);
  }
}

async function handleUserUpdated(userData: {
  id: string;
  email_addresses?: { email_address: string }[];
}) {
  console.log('User updated:', userData.id);
  
  // Handle email changes - re-link submissions if email changed
  const email = userData.email_addresses?.[0]?.email_address;
  if (email) {
    try {
      // Re-link any new submissions with this email
      await supabase
        .from('rsvps')
        .update({ user_id: userData.id })
        .eq('email', email)
        .is('user_id', null);

      await supabase
        .from('contact_submissions')
        .update({ user_id: userData.id })
        .eq('email', email)
        .is('user_id', null);

    } catch (error) {
      console.error('Error in handleUserUpdated:', error);
    }
  }
}

async function handleUserDeleted(userData: {
  id: string;
}) {
  console.log('User deleted:', userData.id);
  
  try {
    // Remove user association from submissions (keep submissions but unlink them)
    await supabase
      .from('rsvps')
      .update({ user_id: null })
      .eq('user_id', userData.id);

    await supabase
      .from('contact_submissions')
      .update({ user_id: null })
      .eq('user_id', userData.id);

    console.log(`Unlinked submissions for deleted user ${userData.id}`);
  } catch (error) {
    console.error('Error in handleUserDeleted:', error);
  }
}
