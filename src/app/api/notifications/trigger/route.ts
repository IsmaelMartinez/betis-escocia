import { NextRequest, NextResponse } from 'next/server';
import { checkAdminRole } from '@/lib/adminApiProtection';
import { getUsersWithNotificationsEnabledDb } from '@/lib/notifications/preferencesDb';

/**
 * GET endpoint for Server-Sent Events (SSE)
 * Allows admin clients to listen for new notifications in real-time
 */
export async function GET(request: NextRequest) {
  // Check if user has admin role
  const { user, isAdmin, error: authError } = await checkAdminRole();
  if (!isAdmin || !user) {
    return NextResponse.json(
      { error: authError || 'Unauthorized' },
      { status: 401 }
    );
  }

  // Check if user has notifications enabled
  const enabledUsers = await getUsersWithNotificationsEnabledDb();
  const hasNotificationsEnabled = enabledUsers.includes(user.id);

  if (!hasNotificationsEnabled) {
    return NextResponse.json(
      { error: 'Notifications not enabled for this user' },
      { status: 403 }
    );
  }

  const encoder = new TextEncoder();
  
  // Get last seen timestamp from query parameter (for reconnection)
  const { searchParams } = new URL(request.url);
  const lastSeenParam = searchParams.get('lastSeen');
  // If no lastSeen provided, start from beginning of time to catch all existing notifications
  // If lastSeen is provided, use it to resume from last processed notification
  const initialLastSeen = lastSeenParam ? parseInt(lastSeenParam) : 0;
  
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      const initialMessage = `data: ${JSON.stringify({
        type: 'connected',
        message: 'Connected to notification stream',
        timestamp: new Date().toISOString(),
        lastSeen: initialLastSeen
      })}\n\n`;
      
      controller.enqueue(encoder.encode(initialMessage));
      
      // Track last processed notification timestamp (as number)
      let lastProcessedTimestamp = initialLastSeen;
      
      // Set up interval to check for new notifications
      const interval = setInterval(async () => {
        try {
          const pendingNotifications = global.pendingNotifications || [];
          
          // Find new notifications since last check
          const newNotifications = pendingNotifications.filter(notification => {
            const notificationTimestamp = parseInt(notification.id);
            return notificationTimestamp > lastProcessedTimestamp;
          });
          
          // Debug logging
          if (pendingNotifications.length > 0) {
            console.log(`📡 SSE Check for user ${user.id}:`, {
              totalPending: pendingNotifications.length,
              lastProcessedTimestamp,
              newNotifications: newNotifications.length,
              pendingIds: pendingNotifications.map(n => n.id),
              newIds: newNotifications.map(n => n.id)
            });
          }
          
          if (newNotifications.length > 0) {
            console.log(`🚀 Sending ${newNotifications.length} new notifications to user ${user.id}`);
          }
          
          newNotifications.forEach(notification => {
            const message = `data: ${JSON.stringify({
              type: 'notification',
              ...notification.data,
              id: notification.id,
              timestamp: notification.timestamp
            })}\n\n`;
            
            controller.enqueue(encoder.encode(message));
            
            // Update last processed timestamp
            const notificationTimestamp = parseInt(notification.id);
            if (notificationTimestamp > lastProcessedTimestamp) {
              lastProcessedTimestamp = notificationTimestamp;
            }
            
            // Mark this notification as delivered to this user
            notification.deliveredToUsers = notification.deliveredToUsers || [];
            if (!notification.deliveredToUsers.includes(user.id)) {
              notification.deliveredToUsers.push(user.id);
            }
            
            console.log(`Delivered notification ${notification.id} to user ${user.id}`);
          });
          
          // Clean up old notifications more aggressively
          const tenMinutesAgo = Date.now() - (10 * 60 * 1000);
          const initialLength = pendingNotifications.length;
          
          global.pendingNotifications = pendingNotifications.filter(notification => {
            const notificationTimestamp = parseInt(notification.id);
            // Remove if older than 10 minutes
            return notificationTimestamp > tenMinutesAgo;
          });
          
          const finalLength = global.pendingNotifications.length;
          if (initialLength !== finalLength) {
            console.log(`Cleaned up ${initialLength - finalLength} old notifications. ${finalLength} remaining.`);
          }
          
          // Send keepalive every few checks
          if (Date.now() % 30000 < 5000) { // Roughly every 30 seconds
            const keepalive = `data: ${JSON.stringify({
              type: 'keepalive',
              timestamp: new Date().toISOString()
            })}\n\n`;
            
            controller.enqueue(encoder.encode(keepalive));
          }
        } catch (error) {
          console.error('Error in SSE stream:', error);
        }
      }, 5000); // Check every 5 seconds
      
      // Clean up on close
      request.signal.addEventListener('abort', () => {
        clearInterval(interval);
        controller.close();
      });
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Headers': 'Cache-Control'
    }
  });
}