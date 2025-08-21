/**
 * OneSignal Client Wrapper for Admin Push Notifications
 * 
 * Provides a simple interface for sending push notifications to admin users
 * via OneSignal's REST API with built-in mock support for testing.
 */

import { log } from '@/lib/logger';
import { getUsersWithNotificationsEnabledDb } from '@/lib/notifications/preferencesDb';

// OneSignal notification payload structure
export interface OneSignalNotificationPayload {
  title: string;
  body: string;
  url?: string;
  icon?: string;
  badge?: string;
  data?: Record<string, unknown>;
}

// OneSignal API response structure
interface OneSignalResponse {
  id: string;
  recipients: number;
  external_id?: string;
}

// Configuration interface
interface OneSignalConfig {
  appId: string;
  restApiKey: string;
  mockMode: boolean;
}

/**
 * Get OneSignal configuration from environment variables
 */
function getOneSignalConfig(): OneSignalConfig {
  return {
    appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || '',
    restApiKey: process.env.ONESIGNAL_REST_API_KEY || '',
    mockMode: process.env.MOCK_PUSH === '1'
  };
}

/**
 * Validate OneSignal configuration
 */
function validateConfig(config: OneSignalConfig): { isValid: boolean; missingVars: string[] } {
  const missingVars: string[] = [];
  
  if (!config.appId) {
    missingVars.push('NEXT_PUBLIC_ONESIGNAL_APP_ID');
  }
  
  if (!config.restApiKey && !config.mockMode) {
    missingVars.push('ONESIGNAL_REST_API_KEY');
  }
  
  return {
    isValid: missingVars.length === 0,
    missingVars
  };
}

/**
 * Send a push notification to admin users via OneSignal
 * 
 * @param payload - Notification content and metadata
 * @returns Promise resolving to success status and optional notification ID
 */
export async function sendAdminNotification(
  payload: OneSignalNotificationPayload
): Promise<{ success: boolean; notificationId?: string; error?: string }> {
  const config = getOneSignalConfig();
  
  // Validate configuration
  const validation = validateConfig(config);
  if (!validation.isValid) {
    const warningMessage = `OneSignal configuration incomplete. Missing: ${validation.missingVars.join(', ')}`;
    
    if (config.mockMode) {
      log.info('Mock push notification (config incomplete)', {
        title: payload.title,
        body: payload.body,
        missingVars: validation.missingVars
      });
      return { success: true, notificationId: 'mock-notification-id' };
    }
    
    log.warn('OneSignal notification skipped due to missing configuration', {
      missingVars: validation.missingVars,
      payload: {
        title: payload.title,
        body: payload.body
      }
    });
    
    return { success: false, error: warningMessage };
  }
  
  // Mock mode short-circuit
  if (config.mockMode) {
    // In mock mode, still check preferences to simulate real behavior
    const enabledAdminUserIds = await getUsersWithNotificationsEnabledDb();
    
    log.info('Mock push notification sent', {
      title: payload.title,
      body: payload.body,
      url: payload.url,
      mockMode: true,
      enabledAdminCount: enabledAdminUserIds.length,
      userIds: enabledAdminUserIds
    });
    
    return { 
      success: true, 
      notificationId: `mock-${Date.now()}`,
      error: enabledAdminUserIds.length === 0 ? 'No admin users have notifications enabled' : undefined
    };
  }
  
  try {
    // Get list of admin users who have notifications enabled
    const enabledAdminUserIds = await getUsersWithNotificationsEnabledDb();
    
    if (enabledAdminUserIds.length === 0) {
      log.info('No admin users have notifications enabled', {
        title: payload.title,
        body: payload.body
      });
      return { 
        success: true, 
        notificationId: 'no-recipients',
        error: 'No admin users have notifications enabled'
      };
    }

    log.info('Sending notification to enabled admin users', {
      title: payload.title,
      enabledAdminCount: enabledAdminUserIds.length,
      userIds: enabledAdminUserIds
    });

    // Prepare OneSignal API request targeting specific admin users by external ID
    interface OneSignalPayload {
      app_id: string;
      include_external_user_ids: string[];
      headings: { en: string };
      contents: { en: string };
      url?: string;
      web_url?: string;
      data?: Record<string, unknown>;
      chrome_web_icon?: string;
      chrome_web_badge?: string;
    }

    const oneSignalPayload: OneSignalPayload = {
      app_id: config.appId,
      include_external_user_ids: enabledAdminUserIds, // Target specific Clerk user IDs
      headings: { en: payload.title },
      contents: { en: payload.body },
      url: payload.url || '/admin',
      data: payload.data || {}
    };

    // Only add icons if they're provided and look like valid URLs
    if (payload.icon && (payload.icon.startsWith('http://') || payload.icon.startsWith('https://'))) {
      oneSignalPayload.chrome_web_icon = payload.icon;
    }
    if (payload.badge && (payload.badge.startsWith('http://') || payload.badge.startsWith('https://'))) {
      oneSignalPayload.chrome_web_badge = payload.badge;
    }
    
    // Make request to OneSignal REST API
    const response = await fetch('https://onesignal.com/api/v1/notifications', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Basic ${config.restApiKey}`
      },
      body: JSON.stringify(oneSignalPayload)
    });
    
    const responseData = await response.json();
    
    if (!response.ok) {
      throw new Error(`OneSignal API error: ${response.status} - ${JSON.stringify(responseData)}`);
    }
    
    const result = responseData as OneSignalResponse;
    
    log.info('OneSignal notification sent successfully', {
      notificationId: result.id,
      recipients: result.recipients,
      title: payload.title,
      body: payload.body
    });
    
    return {
      success: true,
      notificationId: result.id
    };
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    
    log.error('Failed to send OneSignal notification', {
      error: errorMessage,
      payload: {
        title: payload.title,
        body: payload.body,
        url: payload.url
      }
    });
    
    return {
      success: false,
      error: errorMessage
    };
  }
}

/**
 * Helper function to create RSVP notification payload
 */
export function createRSVPNotificationPayload(
  userName: string, 
  attendeeCount: number,
  matchDate?: string
): OneSignalNotificationPayload {
  const guestText = attendeeCount > 1 ? ` (+${attendeeCount - 1})` : '';
  const dateText = matchDate ? ` para ${new Date(matchDate).toLocaleDateString('es-ES')}` : '';
  
  return {
    title: '🎉 Nuevo RSVP - Peña Bética',
    body: `${userName}${guestText} confirmó asistencia${dateText}`,
    url: '/admin',
    data: {
      type: 'rsvp',
      userName,
      attendeeCount,
      matchDate
    }
  };
}

/**
 * Helper function to create contact form notification payload
 */
export function createContactNotificationPayload(
  userName: string,
  subject: string,
  contactType: string = 'general'
): OneSignalNotificationPayload {
  return {
    title: '📬 Nuevo Contacto - Peña Bética',
    body: `${userName}: ${subject}`,
    url: '/admin',
    data: {
      type: 'contact',
      userName,
      subject,
      contactType
    }
  };
}

/**
 * Helper function to create test notification payload
 */
export function createTestNotificationPayload(): OneSignalNotificationPayload {
  return {
    title: '🧪 Notificación de Prueba',
    body: 'Sistema de notificaciones funcionando correctamente',
    url: '/admin',
    data: {
      type: 'test',
      timestamp: new Date().toISOString()
    }
    // No icon/badge specified to avoid URL construction errors
  };
}