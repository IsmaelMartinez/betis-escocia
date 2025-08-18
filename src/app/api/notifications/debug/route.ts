import { NextResponse } from 'next/server';
import { checkAdminRole } from '@/lib/adminApiProtection';
import { getNotificationQueueStats, getPendingNotifications } from '@/lib/notifications/queueManager';

/**
 * GET endpoint for debugging notification queue
 * Admin-only endpoint to see current queue status
 */
export async function GET() {
  // Check if user has admin role
  const { user, isAdmin, error: authError } = await checkAdminRole();
  if (!isAdmin || !user) {
    return NextResponse.json(
      { error: authError || 'Unauthorized' },
      { status: 401 }
    );
  }

  try {
    const stats = getNotificationQueueStats();
    const notifications = getPendingNotifications();
    
    return NextResponse.json({
      success: true,
      data: {
        stats,
        notifications: notifications.map(n => ({
          id: n.id,
          type: n.type,
          timestamp: n.timestamp,
          title: n.data.title,
          deliveredToUsers: n.deliveredToUsers || []
        })),
        globalQueueExists: global.pendingNotifications !== undefined,
        globalQueueLength: global.pendingNotifications?.length || 0
      }
    });
  } catch (error) {
    console.error('Error getting notification debug info:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to get notification debug info',
        details: error instanceof Error ? error.message : String(error)
      },
      { status: 500 }
    );
  }
}