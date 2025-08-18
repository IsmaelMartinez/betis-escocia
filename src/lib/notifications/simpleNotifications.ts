import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { DATE_FORMAT } from '@/lib/constants/dateFormats';

/**
 * Simple Browser Notifications for Admin Users
 * 
 * Uses the basic Notification API for local notifications when admins
 * are actively using the admin dashboard.
 */

export interface SimpleNotificationData {
  title: string;
  body: string;
  icon?: string;
  tag?: string;
  onClick?: () => void;
}

/**
 * Check if browser supports notifications
 */
export function isNotificationSupported(): boolean {
  return typeof window !== 'undefined' && 'Notification' in window;
}

/**
 * Get current notification permission state
 */
export function getNotificationPermission(): NotificationPermission {
  if (!isNotificationSupported()) {
    return 'denied';
  }
  return Notification.permission;
}

/**
 * Request notification permission from user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isNotificationSupported()) {
    throw new Error('Notifications not supported');
  }

  try {
    const permission = await Notification.requestPermission();
    return permission;
  } catch (error) {
    console.error('Failed to request notification permission:', error);
    throw error;
  }
}

/**
 * Show a simple browser notification
 */
export function showNotification(data: SimpleNotificationData): Notification | null {
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return null;
  }

  const notification = new Notification(data.title, {
    body: data.body,
    icon: data.icon || '/images/logo_no_texto.jpg',
    tag: data.tag,
    requireInteraction: true,
  });

  // Handle click if provided
  if (data.onClick) {
    notification.onclick = data.onClick;
  }

  // Auto-close after 10 seconds
  setTimeout(() => {
    notification.close();
  }, 10000);

  return notification;
}

/**
 * Show RSVP notification
 */
export function showRSVPNotification(userName: string, matchDate?: string): Notification | null {
  const dateStr = matchDate ? format(new Date(matchDate), DATE_FORMAT, { locale: es }) : 'fecha pendiente';
  
  return showNotification({
    title: '🎉 Nuevo RSVP - Peña Bética',
    body: `${userName} confirmó asistencia para el partido del ${dateStr}`,
    tag: 'rsvp',
    onClick: () => {
      window.focus();
      // Could navigate to admin dashboard here if needed
    }
  });
}

/**
 * Show contact form notification
 */
export function showContactNotification(userName: string, contactType: string): Notification | null {
  return showNotification({
    title: '📬 Nuevo Mensaje - Peña Bética',
    body: `${userName} envió un mensaje (${contactType})`,
    tag: 'contact',
    onClick: () => {
      window.focus();
      // Could navigate to admin dashboard here if needed
    }
  });
}

// Cache for notification preferences to prevent excessive API calls
let notificationPreferenceCache: {
  enabled: boolean;
  timestamp: number;
  expiry: number;
} | null = null;

const CACHE_DURATION = 30000; // 30 seconds

/**
 * Check if user has notifications enabled in their preferences
 * Includes caching to prevent excessive API calls
 */
export async function areNotificationsEnabled(): Promise<boolean> {
  // Check cache first
  if (notificationPreferenceCache && Date.now() < notificationPreferenceCache.expiry) {
    return notificationPreferenceCache.enabled;
  }

  try {
    const response = await fetch('/api/notifications/preferences');
    if (!response.ok) return false;
    
    const data = await response.json();
    const enabled = data.enabled === true;
    
    // Update cache
    notificationPreferenceCache = {
      enabled,
      timestamp: Date.now(),
      expiry: Date.now() + CACHE_DURATION
    };
    
    return enabled;
  } catch (error) {
    console.error('Failed to check notification preferences:', error);
    return false;
  }
}

/**
 * Clear the notification preferences cache
 * Useful when preferences are updated
 */
export function clearNotificationPreferenceCache(): void {
  notificationPreferenceCache = null;
}

/**
 * Main function to trigger admin notification if conditions are met
 */
export async function triggerAdminNotification(type: 'rsvp' | 'contact', data: {
  userName: string;
  matchDate?: string;
  contactType?: string;
}): Promise<void> {
  // Only show notifications if:
  // 1. Browser supports it
  // 2. User has granted permission
  // 3. User has enabled notifications in preferences
  
  if (!isNotificationSupported() || Notification.permission !== 'granted') {
    return;
  }

  try {
    const enabled = await areNotificationsEnabled();
    if (!enabled) {
      return;
    }

    if (type === 'rsvp') {
      showRSVPNotification(data.userName, data.matchDate);
    } else if (type === 'contact') {
      showContactNotification(data.userName, data.contactType || 'general');
    }
  } catch (error) {
    console.error('Failed to trigger admin notification:', error);
  }
}