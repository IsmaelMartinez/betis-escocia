/**
 * TypeScript Types for Push Notifications
 * 
 * This file defines all the TypeScript interfaces and types needed for 
 * the admin push notification system.
 */

export interface NotificationPayload {
  title: string;
  body: string;
  icon?: string;
  badge?: string;
  tag?: string;
  data?: {
    type: 'rsvp' | 'contact';
    id: number;
    url: string;
    matchDate?: string;
    userName?: string;
    contactType?: string;
  };
}

export interface NotificationSubscription {
  endpoint: string;
  keys: {
    p256dh: string;
    auth: string;
  };
}

export interface NotificationPermissionState {
  permission: NotificationPermission;
  supported: boolean;
  subscribed: boolean;
}

export interface NotificationPreferences {
  enabled: boolean;
  rsvpNotifications: boolean;
  contactNotifications: boolean;
  userId: string;
}

export interface PushNotificationError {
  type: 'PERMISSION_DENIED' | 'SUBSCRIPTION_FAILED' | 'SEND_FAILED' | 'UNSUPPORTED';
  message: string;
  details?: string;
}

export interface NotificationTriggerData {
  type: 'rsvp' | 'contact';
  id: number;
  data: {
    userName: string;
    userEmail: string;
    matchDate?: string;
    attendees?: number;
    contactType?: string;
    subject?: string;
  };
}