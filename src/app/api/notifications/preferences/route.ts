import { NextRequest, NextResponse } from 'next/server';
import { checkAdminRole } from '@/lib/adminApiProtection';
import { 
  getUserNotificationPreferenceDb, 
  setUserNotificationPreferenceDb 
} from '@/lib/notifications/preferencesDb';
import { getAuth } from '@clerk/nextjs/server';

/**
 * API endpoint for managing user notification preferences
 */

// GET - Get notification preference for current user
export async function GET(request: NextRequest) {
  try {
    // Check if user has admin role
    const { user, isAdmin, error: authError } = await checkAdminRole();
    if (!isAdmin || !user) {
      return NextResponse.json(
        { error: authError || 'User not found' },
        { status: 401 }
      );
    }

    // Notifications are always enabled for admin users

    // Get authenticated Supabase client
    const { getToken } = getAuth(request);
    const clerkToken = await getToken({ template: 'supabase' });

    // Get user preference from database
    const enabled = await getUserNotificationPreferenceDb(user.id, clerkToken || undefined);

    return NextResponse.json({
      success: true,
      enabled,
      userId: user.id
    });

  } catch (error) {
    console.error('Error getting notification preference:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST - Set notification preference for current user
export async function POST(request: NextRequest) {
  try {
    // Check if user has admin role
    const { user, isAdmin, error: authError } = await checkAdminRole();
    if (!isAdmin || !user) {
      return NextResponse.json(
        { error: authError || 'User not found' },
        { status: 401 }
      );
    }

    // Notifications are always enabled for admin users

    const body = await request.json();
    const { enabled } = body;

    if (typeof enabled !== 'boolean') {
      return NextResponse.json(
        { error: 'Enabled must be a boolean value' },
        { status: 400 }
      );
    }

    // Get authenticated Supabase client
    const { getToken } = getAuth(request);
    const clerkToken = await getToken({ template: 'supabase' });

    // Set user preference in database
    await setUserNotificationPreferenceDb(user.id, enabled, clerkToken || undefined);

    return NextResponse.json({
      success: true,
      enabled,
      message: `Notifications ${enabled ? 'enabled' : 'disabled'} successfully`
    });

  } catch (error) {
    console.error('Error setting notification preference:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// PUT - Update notification preference for current user (same as POST for compatibility)
export async function PUT(request: NextRequest) {
  return POST(request);
}