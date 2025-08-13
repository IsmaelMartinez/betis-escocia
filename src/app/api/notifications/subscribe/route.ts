import { NextRequest, NextResponse } from 'next/server';
import { checkAdminRole } from '@/lib/adminApiProtection';
import { hasFeature } from '@/lib/flagsmith';
import { getAuth } from '@clerk/nextjs/server';
import { getAuthenticatedSupabaseClient } from '@/lib/supabase';

/**
 * API endpoint for managing push notification subscriptions
 * This is a placeholder for subscription management - in a full implementation,
 * you would store subscription data in the database and manage VAPID keys
 */

// GET - Check subscription status for current admin user
export async function GET(request: NextRequest) {
  try {
    // Check if user has admin role
    const { user, isAdmin, error: authError } = await checkAdminRole();
    if (!isAdmin) {
      return NextResponse.json(
        { error: authError },
        { status: 401 }
      );
    }

    // Check if notifications feature is enabled
    const notificationsEnabled = await hasFeature('admin-push-notifications');
    if (!notificationsEnabled) {
      return NextResponse.json(
        { error: 'Push notifications feature is not enabled' },
        { status: 403 }
      );
    }

    // Get authenticated Supabase client
    const { getToken } = getAuth(request);
    const token = await getToken({ template: 'supabase' });
    const supabase = getAuthenticatedSupabaseClient(token);

    // Check if user has an active push subscription
    const { data: subscription, error: dbError } = await supabase
      .from('push_subscriptions')
      .select('id, endpoint, created_at, last_used_at')
      .eq('user_id', user?.id)
      .single();

    if (dbError && dbError.code !== 'PGRST116') { // PGRST116 = no rows returned
      console.error('Error checking subscription:', dbError);
      return NextResponse.json(
        { error: 'Database error' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      subscribed: !!subscription,
      supported: true,
      userId: user?.id,
      subscription: subscription ? {
        id: subscription.id,
        createdAt: subscription.created_at,
        lastUsedAt: subscription.last_used_at
      } : null
    });

  } catch (error) {
    console.error('Error checking subscription status:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Subscribe to push notifications
export async function POST(request: NextRequest) {
  try {
    // Check if user has admin role
    const { user, isAdmin, error: authError } = await checkAdminRole();
    if (!isAdmin) {
      return NextResponse.json(
        { error: authError },
        { status: 401 }
      );
    }

    // Check if notifications feature is enabled
    const notificationsEnabled = await hasFeature('admin-push-notifications');
    if (!notificationsEnabled) {
      return NextResponse.json(
        { error: 'Push notifications feature is not enabled' },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { subscription } = body;

    if (!subscription) {
      return NextResponse.json(
        { error: 'Subscription data is required' },
        { status: 400 }
      );
    }

    // Validate subscription object
    if (!subscription.endpoint || !subscription.keys || !subscription.keys.p256dh || !subscription.keys.auth) {
      return NextResponse.json(
        { error: 'Invalid subscription data format' },
        { status: 400 }
      );
    }

    // Get authenticated Supabase client
    const { getToken } = getAuth(request);
    const token = await getToken({ template: 'supabase' });
    const supabase = getAuthenticatedSupabaseClient(token);

    // Get user agent for debugging
    const userAgent = request.headers.get('user-agent') || 'Unknown';

    // Store or update the subscription in the database
    const { data, error: dbError } = await supabase
      .from('push_subscriptions')
      .upsert({
        user_id: user?.id,
        endpoint: subscription.endpoint,
        p256dh_key: subscription.keys.p256dh,
        auth_key: subscription.keys.auth,
        user_agent: userAgent,
        last_used_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (dbError) {
      console.error('Error storing subscription:', dbError);
      return NextResponse.json(
        { error: 'Failed to store subscription' },
        { status: 500 }
      );
    }
    
    console.log(`Admin user ${user?.id} subscribed to push notifications`);
    console.log('Subscription stored:', {
      id: data.id,
      endpoint: subscription.endpoint.substring(0, 50) + '...',
      hasKeys: !!subscription.keys
    });

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to push notifications',
      subscribed: true,
      subscriptionId: data.id
    });

  } catch (error) {
    console.error('Error subscribing to notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// DELETE - Unsubscribe from push notifications
export async function DELETE(request: NextRequest) {
  try {
    // Check if user has admin role
    const { user, isAdmin, error: authError } = await checkAdminRole();
    if (!isAdmin) {
      return NextResponse.json(
        { error: authError },
        { status: 401 }
      );
    }

    // Check if notifications feature is enabled
    const notificationsEnabled = await hasFeature('admin-push-notifications');
    if (!notificationsEnabled) {
      return NextResponse.json(
        { error: 'Push notifications feature is not enabled' },
        { status: 403 }
      );
    }

    // Get authenticated Supabase client
    const { getToken } = getAuth(request);
    const token = await getToken({ template: 'supabase' });
    const supabase = getAuthenticatedSupabaseClient(token);

    // Remove the subscription from the database
    const { error: dbError } = await supabase
      .from('push_subscriptions')
      .delete()
      .eq('user_id', user?.id);

    if (dbError) {
      console.error('Error removing subscription:', dbError);
      return NextResponse.json(
        { error: 'Failed to remove subscription' },
        { status: 500 }
      );
    }
    
    console.log(`Admin user ${user?.id} unsubscribed from push notifications`);

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed from push notifications',
      subscribed: false
    });

  } catch (error) {
    console.error('Error unsubscribing from notifications:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}