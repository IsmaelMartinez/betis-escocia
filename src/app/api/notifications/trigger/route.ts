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
  
  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection message
      const initialMessage = `data: ${JSON.stringify({
        type: 'connected',
        message: 'Connected to notification stream',
        timestamp: new Date().toISOString()
      })}\n\n`;
      
      controller.enqueue(encoder.encode(initialMessage));
      
      // Track last processed notification
      let lastProcessedId = '';
      
      // Set up interval to check for new notifications
      const interval = setInterval(async () => {
        try {
          const pendingNotifications = global.pendingNotifications || [];
          
          // Find new notifications since last check
          const newNotifications = pendingNotifications.filter(notification => 
            notification.id > lastProcessedId
          );
          
          newNotifications.forEach(notification => {
            const message = `data: ${JSON.stringify({
              type: 'notification',
              ...notification.data,
              id: notification.id,
              timestamp: notification.timestamp
            })}\n\n`;
            
            controller.enqueue(encoder.encode(message));
            lastProcessedId = notification.id;
          });
          
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