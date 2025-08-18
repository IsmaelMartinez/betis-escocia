/**
 * Notification Queue Manager
 * 
 * Centralized management for admin notifications with automatic cleanup
 * and deduplication. Eliminates duplicate code across API routes.
 */

export interface QueuedNotification {
  id: string;
  timestamp: string;
  type: 'rsvp' | 'contact';
  data: {
    title: string;
    body: string;
    icon: string;
    tag: string;
    url: string;
  };
  deliveredToUsers?: string[];
}

// Global notification queue with automatic cleanup
declare global {
  var pendingNotifications: QueuedNotification[] | undefined;
}

/**
 * Queue a notification for admin users
 */
export function queueNotification(
  type: 'rsvp' | 'contact',
  notificationData: {
    title: string;
    body: string;
    icon?: string;
    tag?: string;
    url?: string;
  }
): string {
  const notification: QueuedNotification = {
    id: Date.now().toString(),
    timestamp: new Date().toISOString(),
    type,
    data: {
      title: notificationData.title,
      body: notificationData.body,
      icon: notificationData.icon || '/images/logo_no_texto.jpg',
      tag: notificationData.tag || `${type}-notification`,
      url: notificationData.url || '/admin'
    }
  };

  // Initialize global queue if needed
  global.pendingNotifications = global.pendingNotifications || [];
  
  // Add notification to queue
  global.pendingNotifications.push(notification);
  
  // Log for debugging
  console.log(`📬 Queued ${type} notification:`, {
    id: notification.id,
    title: notification.data.title,
    queueSize: global.pendingNotifications.length
  });
  
  // Cleanup old notifications (keep only last 100)
  if (global.pendingNotifications.length > 100) {
    global.pendingNotifications = global.pendingNotifications.slice(-100);
  }
  
  return notification.id;
}

/**
 * Queue an RSVP notification
 */
export function queueRSVPNotification(userName: string, matchDate?: string): string {
  const dateStr = matchDate 
    ? new Date(matchDate).toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      })
    : 'fecha pendiente';

  return queueNotification('rsvp', {
    title: '🎉 Nuevo RSVP - Peña Bética',
    body: `${userName} confirmó asistencia para el partido del ${dateStr}`,
    tag: 'rsvp-notification'
  });
}

/**
 * Queue a contact form notification
 */
export function queueContactNotification(userName: string, contactType: string = 'general'): string {
  return queueNotification('contact', {
    title: '📬 Nuevo Mensaje - Peña Bética',
    body: `${userName} envió un mensaje (${contactType})`,
    tag: 'contact-notification'
  });
}

/**
 * Get all pending notifications (used by SSE endpoint)
 */
export function getPendingNotifications(): QueuedNotification[] {
  return global.pendingNotifications || [];
}

/**
 * Get notifications newer than a specific timestamp
 */
export function getNotificationsSince(lastSeenTimestamp: number): QueuedNotification[] {
  const notifications = getPendingNotifications();
  
  return notifications.filter(notification => {
    const notificationTimestamp = parseInt(notification.id);
    return notificationTimestamp > lastSeenTimestamp;
  });
}

/**
 * Mark notification as delivered to a user
 */
export function markNotificationDelivered(notificationId: string, userId: string): void {
  const notifications = getPendingNotifications();
  const notification = notifications.find(n => n.id === notificationId);
  
  if (notification) {
    notification.deliveredToUsers = notification.deliveredToUsers || [];
    if (!notification.deliveredToUsers.includes(userId)) {
      notification.deliveredToUsers.push(userId);
    }
  }
}

/**
 * Clean up old notifications
 */
export function cleanupOldNotifications(maxAgeMinutes: number = 10): void {
  if (!global.pendingNotifications) return;

  const cutoffTime = Date.now() - (maxAgeMinutes * 60 * 1000);
  const initialLength = global.pendingNotifications.length;
  
  global.pendingNotifications = global.pendingNotifications.filter(notification => {
    const notificationTimestamp = parseInt(notification.id);
    return notificationTimestamp > cutoffTime;
  });
  
  const finalLength = global.pendingNotifications.length;
  if (initialLength !== finalLength) {
    console.log(`Cleaned up ${initialLength - finalLength} old notifications. ${finalLength} remaining.`);
  }
}

/**
 * Get notification queue statistics
 */
export function getNotificationQueueStats(): {
  total: number;
  byType: Record<string, number>;
  oldestTimestamp?: string;
  newestTimestamp?: string;
} {
  const notifications = getPendingNotifications();
  
  const stats = {
    total: notifications.length,
    byType: {} as Record<string, number>,
    oldestTimestamp: undefined as string | undefined,
    newestTimestamp: undefined as string | undefined
  };
  
  if (notifications.length > 0) {
    // Count by type
    notifications.forEach(notification => {
      stats.byType[notification.type] = (stats.byType[notification.type] || 0) + 1;
    });
    
    // Find oldest and newest
    const timestamps = notifications.map(n => parseInt(n.id)).sort((a, b) => a - b);
    stats.oldestTimestamp = new Date(timestamps[0]).toISOString();
    stats.newestTimestamp = new Date(timestamps[timestamps.length - 1]).toISOString();
  }
  
  return stats;
}

/**
 * Clear all notifications (for testing/cleanup)
 */
export function clearNotificationQueue(): void {
  global.pendingNotifications = [];
}