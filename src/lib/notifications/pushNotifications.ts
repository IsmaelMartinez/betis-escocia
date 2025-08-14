/**
 * Push Notifications Utilities for Real Betis Peña Bética
 * 
 * Implements Web Push API for background notifications to admin users.
 * Supports notifications even when the admin dashboard is not open.
 */

import { getUsersWithNotificationsEnabledDb } from './preferencesDb';

export interface PushNotificationData {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  url?: string;
  requireInteraction?: boolean;
  actions?: Array<{
    action: string;
    title: string;
    icon?: string;
  }>;
}

/**
 * Check if push notifications are supported in this browser
 */
export function isPushNotificationSupported(): boolean {
  if (typeof window === 'undefined') return false;
  
  return (
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window
  );
}

/**
 * Register service worker for push notifications
 */
export async function registerServiceWorker(): Promise<ServiceWorkerRegistration | null> {
  if (!isPushNotificationSupported()) {
    console.warn('Push notifications not supported in this browser');
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/'
    });

    console.log('Service Worker registered successfully:', registration);
    
    // Wait for service worker to be ready
    await navigator.serviceWorker.ready;
    
    return registration;
  } catch (error) {
    console.error('Service Worker registration failed:', error);
    return null;
  }
}

/**
 * Get current push subscription
 */
export async function getCurrentPushSubscription(): Promise<PushSubscription | null> {
  if (!isPushNotificationSupported()) return null;

  try {
    const registration = await navigator.serviceWorker.ready;
    return await registration.pushManager.getSubscription();
  } catch (error) {
    console.error('Error getting push subscription:', error);
    return null;
  }
}

/**
 * Subscribe to push notifications
 * Note: This is a basic implementation. In production, you'd want to use VAPID keys
 */
export async function subscribeToPushNotifications(): Promise<PushSubscription | null> {
  if (!isPushNotificationSupported()) {
    throw new Error('Push notifications not supported');
  }

  // Check notification permission
  let permission = Notification.permission;
  if (permission === 'default') {
    permission = await Notification.requestPermission();
  }

  if (permission !== 'granted') {
    throw new Error('Notification permission denied');
  }

  try {
    const registration = await registerServiceWorker();
    if (!registration) {
      throw new Error('Service Worker registration failed');
    }

    // Check if already subscribed
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      // Subscribe to push notifications
      // Note: Using userVisibleOnly for now. In production, implement VAPID keys
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true
      });
    }

    console.log('Push subscription created:', subscription);
    return subscription;
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    throw error;
  }
}

/**
 * Unsubscribe from push notifications
 */
export async function unsubscribeFromPushNotifications(): Promise<boolean> {
  try {
    const subscription = await getCurrentPushSubscription();
    if (subscription) {
      const result = await subscription.unsubscribe();
      console.log('Push subscription removed:', result);
      return result;
    }
    return true;
  } catch (error) {
    console.error('Error unsubscribing from push notifications:', error);
    return false;
  }
}

/**
 * Send push notification to service worker
 * This is a client-side trigger for testing purposes
 */
export async function sendTestPushNotification(data: PushNotificationData): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Use postMessage to trigger notification from service worker
    registration.active?.postMessage({
      type: 'SHOW_NOTIFICATION',
      data
    });
    
    return true;
  } catch (error) {
    console.error('Error sending test push notification:', error);
    return false;
  }
}

/**
 * Show RSVP push notification
 */
export function createRSVPNotificationData(userName: string, matchDate?: string): PushNotificationData {
  const dateStr = matchDate 
    ? new Date(matchDate).toLocaleDateString('es-ES', { 
        day: 'numeric', 
        month: 'long', 
        year: 'numeric' 
      })
    : 'fecha pendiente';
  
  return {
    title: '🎉 Nuevo RSVP - Peña Bética',
    body: `${userName} confirmó asistencia para el partido del ${dateStr}`,
    icon: '/images/logo_no_texto.jpg',
    badge: '/images/logo_no_texto.jpg',
    tag: 'rsvp-notification',
    url: '/admin',
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'Ver Dashboard'
      },
      {
        action: 'dismiss',
        title: 'Cerrar'
      }
    ]
  };
}

/**
 * Show contact form push notification
 */
export function createContactNotificationData(userName: string, contactType: string): PushNotificationData {
  return {
    title: '📬 Nuevo Mensaje - Peña Bética',
    body: `${userName} envió un mensaje (${contactType})`,
    icon: '/images/logo_no_texto.jpg',
    badge: '/images/logo_no_texto.jpg',
    tag: 'contact-notification',
    url: '/admin',
    requireInteraction: true,
    actions: [
      {
        action: 'view',
        title: 'Ver Dashboard'
      },
      {
        action: 'dismiss',
        title: 'Cerrar'
      }
    ]
  };
}

/**
 * Get push notification status for current user
 */
export async function getPushNotificationStatus(): Promise<{
  supported: boolean;
  permission: NotificationPermission;
  subscribed: boolean;
  serviceWorkerReady: boolean;
}> {
  const supported = isPushNotificationSupported();
  
  if (!supported) {
    return {
      supported: false,
      permission: 'denied',
      subscribed: false,
      serviceWorkerReady: false
    };
  }

  const permission = Notification.permission;
  const subscription = await getCurrentPushSubscription();
  const subscribed = subscription !== null;
  
  let serviceWorkerReady = false;
  try {
    await navigator.serviceWorker.ready;
    serviceWorkerReady = true;
  } catch {
    serviceWorkerReady = false;
  }

  return {
    supported,
    permission,
    subscribed,
    serviceWorkerReady
  };
}

/**
 * Initialize push notifications for admin users
 * Call this when the admin dashboard loads
 */
export async function initializePushNotifications(): Promise<boolean> {
  try {
    if (!isPushNotificationSupported()) {
      console.warn('Push notifications not supported, falling back to simple notifications');
      return false;
    }

    // Register service worker
    const registration = await registerServiceWorker();
    if (!registration) {
      console.warn('Service worker registration failed');
      return false;
    }

    // Check if user has granted notification permission
    if (Notification.permission !== 'granted') {
      console.log('Notification permission not granted, user needs to enable manually');
      return false;
    }

    // Try to subscribe to push notifications
    const subscription = await subscribeToPushNotifications();
    if (!subscription) {
      console.warn('Push subscription failed');
      return false;
    }

    console.log('Push notifications initialized successfully');
    return true;
  } catch (error) {
    console.error('Error initializing push notifications:', error);
    return false;
  }
}

/**
 * Trigger push notification via service worker
 * This simulates a server push for client-side testing
 */
export async function triggerPushNotification(data: PushNotificationData): Promise<boolean> {
  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Show notification directly through service worker registration
    await registration.showNotification(data.title, {
      body: data.body,
      icon: data.icon || '/images/logo_no_texto.jpg',
      badge: data.badge || '/images/logo_no_texto.jpg',
      tag: data.tag,
      requireInteraction: data.requireInteraction,
      actions: data.actions,
      data: {
        url: data.url || '/admin',
        timestamp: Date.now()
      }
    });
    
    return true;
  } catch (error) {
    console.error('Error triggering push notification:', error);
    return false;
  }
}