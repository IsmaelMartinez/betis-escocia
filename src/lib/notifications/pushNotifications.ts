/**
 * Push Notifications Utility Functions
 * 
 * This module provides push notification functionality for admin users,
 * including permission handling, subscription management, and notification sending.
 */

import { 
  NotificationPayload, 
  NotificationSubscription, 
  NotificationPermissionState,
  PushNotificationError,
  NotificationTriggerData
} from './types';

/**
 * Check if push notifications are supported by the browser
 */
export function isPushNotificationSupported(): boolean {
  if (typeof window === 'undefined') {
    return false;
  }
  
  return 'serviceWorker' in navigator && 
         'PushManager' in window && 
         'Notification' in window;
}

/**
 * Register service worker for push notifications
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isPushNotificationSupported()) {
    throw new Error('Push notifications are not supported in this browser');
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });

    console.log('[PushNotifications] Service worker registered:', registration);
    
    // Wait for service worker to be ready
    await navigator.serviceWorker.ready;
    
    return registration;
  } catch (error) {
    console.error('[PushNotifications] Service worker registration failed:', error);
    throw new Error('Failed to register service worker');
  }
}

/**
 * Request notification permission from the user
 */
export async function requestNotificationPermission(): Promise<NotificationPermission> {
  if (!isPushNotificationSupported()) {
    throw new Error('Push notifications are not supported');
  }

  try {
    const permission = await Notification.requestPermission();
    console.log('[PushNotifications] Permission result:', permission);
    return permission;
  } catch (error) {
    console.error('[PushNotifications] Permission request failed:', error);
    throw new Error('Failed to request notification permission');
  }
}

/**
 * Get current notification permission state
 */
export function getNotificationPermissionState(): NotificationPermissionState {
  const supported = isPushNotificationSupported();
  
  return {
    permission: supported ? Notification.permission : 'denied',
    supported,
    subscribed: false // This will be updated when checking subscription status
  };
}

/**
 * Subscribe to push notifications
 */
export async function subscribeToPushNotifications(): Promise<NotificationSubscription | null> {
  if (!isPushNotificationSupported()) {
    throw new Error('Push notifications are not supported');
  }

  // Check permission first
  if (Notification.permission !== 'granted') {
    const permission = await requestNotificationPermission();
    if (permission !== 'granted') {
      throw new Error('Notification permission denied');
    }
  }

  try {
    // Register service worker
    const registration = await registerServiceWorker();
    if (!registration) {
      throw new Error('Service worker registration failed');
    }

    // For now, we'll use a basic subscription without VAPID keys
    // In production, you would want to implement VAPID keys for security
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      // applicationServerKey: urlBase64ToUint8Array(vapidPublicKey) // TODO: Add VAPID key
    });

    const subscriptionData: NotificationSubscription = {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
        auth: arrayBufferToBase64(subscription.getKey('auth')!)
      }
    };

    console.log('[PushNotifications] Subscription created:', subscriptionData);
    return subscriptionData;
  } catch (error) {
    console.error('[PushNotifications] Subscription failed:', error);
    throw new Error('Failed to subscribe to push notifications');
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  if (!isPushNotificationSupported()) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (subscription) {
      const success = await subscription.unsubscribe();
      console.log('[PushNotifications] Unsubscribed:', success);
      return success;
    }
    
    return true; // Already unsubscribed
  } catch (error) {
    console.error('[PushNotifications] Unsubscribe failed:', error);
    return false;
  }
}

/**
 * Check if user is currently subscribed to push notifications
 */
export async function isSubscribedToPushNotifications(): Promise<boolean> {
  if (!isPushNotificationSupported()) {
    return false;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return subscription !== null;
  } catch (error) {
    console.error('[PushNotifications] Check subscription failed:', error);
    return false;
  }
}

/**
 * Get current push subscription
 */
export async function getCurrentPushSubscription(): Promise<NotificationSubscription | null> {
  if (!isPushNotificationSupported()) {
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      return null;
    }

    return {
      endpoint: subscription.endpoint,
      keys: {
        p256dh: arrayBufferToBase64(subscription.getKey('p256dh')!),
        auth: arrayBufferToBase64(subscription.getKey('auth')!)
      }
    };
  } catch (error) {
    console.error('[PushNotifications] Get subscription failed:', error);
    return null;
  }
}

/**
 * Send a test notification (client-side only, for testing)
 */
export async function sendTestNotification(payload: Partial<NotificationPayload>): Promise<void> {
  if (!isPushNotificationSupported()) {
    throw new Error('Push notifications are not supported');
  }

  if (Notification.permission !== 'granted') {
    throw new Error('Notification permission not granted');
  }

  const defaultPayload: NotificationPayload = {
    title: 'Peña Bética Escocesa',
    body: 'Notificación de prueba',
    icon: '/images/logo_no_texto.jpg',
    tag: 'test',
    data: {
      type: 'rsvp',
      id: 0,
      url: '/admin'
    }
  };

  const notification = new Notification(payload.title || defaultPayload.title, {
    body: payload.body || defaultPayload.body,
    icon: payload.icon || defaultPayload.icon,
    tag: payload.tag || defaultPayload.tag,
    data: payload.data || defaultPayload.data
  });

  // Close notification after 5 seconds
  setTimeout(() => {
    notification.close();
  }, 5000);

  console.log('[PushNotifications] Test notification sent');
}

/**
 * Create notification payload for RSVP events
 */
export function createRSVPNotificationPayload(data: NotificationTriggerData): NotificationPayload {
  if (data.type !== 'rsvp') {
    throw new Error('Invalid data type for RSVP notification');
  }

  const matchDate = data.data.matchDate ? new Date(data.data.matchDate).toLocaleDateString('es-ES') : 'fecha pendiente';
  
  return {
    title: '🎉 Nuevo RSVP - Peña Bética',
    body: `${data.data.userName} confirmó asistencia para el partido del ${matchDate} (${data.data.attendees} personas)`,
    icon: '/images/logo_no_texto.jpg',
    badge: '/images/logo_no_texto.jpg',
    tag: `rsvp-${data.id}`,
    data: {
      type: 'rsvp',
      id: data.id,
      url: '/admin',
      matchDate: data.data.matchDate,
      userName: data.data.userName
    }
  };
}

/**
 * Create notification payload for contact form events
 */
export function createContactNotificationPayload(data: NotificationTriggerData): NotificationPayload {
  if (data.type !== 'contact') {
    throw new Error('Invalid data type for contact notification');
  }

  return {
    title: '📬 Nuevo Mensaje - Peña Bética',
    body: `${data.data.userName} envió un mensaje: "${data.data.subject}" (${data.data.contactType})`,
    icon: '/images/logo_no_texto.jpg',
    badge: '/images/logo_no_texto.jpg',
    tag: `contact-${data.id}`,
    data: {
      type: 'contact',
      id: data.id,
      url: '/admin',
      userName: data.data.userName,
      contactType: data.data.contactType
    }
  };
}

/**
 * Utility function to convert ArrayBuffer to Base64
 */
function arrayBufferToBase64(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer);
  let binary = '';
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

/**
 * Utility function to convert Base64 to Uint8Array (for VAPID keys)
 */
export function urlBase64ToUint8Array(base64String: string): Uint8Array {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
}

/**
 * Send push notification to admin users via API
 * This function should be called from API routes to send notifications
 */
export async function sendNotificationToAdmins(
  notificationData: NotificationTriggerData
): Promise<{ success: boolean; error?: string }> {
  try {
    // Create appropriate notification payload
    let payload: NotificationPayload;
    
    if (notificationData.type === 'rsvp') {
      payload = createRSVPNotificationPayload(notificationData);
    } else if (notificationData.type === 'contact') {
      payload = createContactNotificationPayload(notificationData);
    } else {
      throw new Error('Invalid notification type');
    }

    // Send notification via API endpoint
    const response = await fetch('/api/notifications/send', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        payload,
        adminOnly: true
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || 'Failed to send notification');
    }

    const result = await response.json();
    console.log('[PushNotifications] Notification sent successfully:', result);
    
    return { success: true };
  } catch (error) {
    console.error('[PushNotifications] Failed to send notification:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
}

/**
 * Handle push notification errors
 */
export function createPushNotificationError(
  type: PushNotificationError['type'], 
  message: string, 
  details?: string
): PushNotificationError {
  return {
    type,
    message,
    details
  };
}