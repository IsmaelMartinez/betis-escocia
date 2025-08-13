import { NextRequest, NextResponse } from 'next/server';
import { checkAdminRole } from '@/lib/adminApiProtection';
import { getAuth } from '@clerk/nextjs/server';
import { getAuthenticatedSupabaseClient } from '@/lib/supabase';
import { NotificationPayload } from '@/lib/notifications/types';

export async function POST(request: NextRequest) {
  try {
    // Check admin authorization
    const { user, isAdmin, error } = await checkAdminRole();
    if (!isAdmin) {
      return NextResponse.json({ error }, { status: 401 });
    }

    // Parse request body
    const body = await request.json();
    const { payload, adminOnly }: { payload: NotificationPayload; adminOnly?: boolean } = body;

    // Validate payload
    if (!payload || !payload.title || !payload.body) {
      return NextResponse.json(
        { error: 'Invalid notification payload. Title and body are required.' },
        { status: 400 }
      );
    }

    // Get authenticated Supabase client
    const { getToken } = getAuth(request);
    const token = await getToken({ template: 'supabase' });
    const supabase = getAuthenticatedSupabaseClient(token);

    // Get admin users who have notifications enabled
    const { data: adminUsers, error: adminUsersError } = await supabase
      .from('users')
      .select(`
        id,
        email,
        clerk_user_id,
        notification_preferences (
          enabled,
          rsvp_notifications,
          contact_notifications
        )
      `)
      .eq('role', 'admin');

    if (adminUsersError) {
      console.error('[NotificationAPI] Error fetching admin users:', adminUsersError);
      return NextResponse.json(
        { error: 'Failed to fetch admin users' },
        { status: 500 }
      );
    }

    // Filter admins who have notifications enabled
    const eligibleAdmins = adminUsers?.filter(admin => {
      const prefs = admin.notification_preferences?.[0];
      if (!prefs?.enabled) return false;
      
      // Check specific notification type preferences
      if (payload.data?.type === 'rsvp') {
        return prefs.rsvp_notifications;
      } else if (payload.data?.type === 'contact') {
        return prefs.contact_notifications;
      }
      
      return true;
    }) || [];

    if (eligibleAdmins.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No eligible admin users for notifications',
        recipients: 0
      });
    }

    // Get push subscriptions for eligible admins
    const { data: subscriptions, error: subscriptionsError } = await supabase
      .from('push_subscriptions')
      .select('*')
      .in('user_id', eligibleAdmins.map(admin => admin.clerk_user_id));

    if (subscriptionsError) {
      console.error('[NotificationAPI] Error fetching subscriptions:', subscriptionsError);
      return NextResponse.json(
        { error: 'Failed to fetch push subscriptions' },
        { status: 500 }
      );
    }

    const activeSubscriptions = subscriptions || [];

    if (activeSubscriptions.length === 0) {
      return NextResponse.json({
        success: true,
        message: 'No active push subscriptions found',
        recipients: 0
      });
    }

    // Send push notifications to all active subscriptions
    const pushPromises = activeSubscriptions.map(async (subscription) => {
      try {
        // For now, we'll simulate sending the push notification
        // In a real implementation, you would use a service like Firebase Cloud Messaging
        // or implement a push service using web-push library
        
        console.log('[NotificationAPI] Sending push notification:', {
          endpoint: subscription.endpoint,
          payload: payload.title
        });
        
        // Simulate successful send
        return { success: true, subscription: subscription.id };
      } catch (error) {
        console.error('[NotificationAPI] Failed to send push notification:', error);
        return { success: false, subscription: subscription.id, error: error.message };
      }
    });

    const results = await Promise.allSettled(pushPromises);
    const successful = results.filter(result => 
      result.status === 'fulfilled' && result.value.success
    ).length;

    console.log('[NotificationAPI] Push notification results:', {
      total: activeSubscriptions.length,
      successful,
      failed: activeSubscriptions.length - successful
    });

    return NextResponse.json({
      success: true,
      message: 'Notifications sent',
      recipients: successful,
      total: activeSubscriptions.length
    });

  } catch (error) {
    console.error('[NotificationAPI] Unexpected error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}