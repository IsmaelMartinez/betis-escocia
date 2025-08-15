/**
 * Notification Manager for Background Push Notifications
 * 
 * Manages the connection between the admin dashboard and the notification
 * system using Server-Sent Events (SSE) and Service Worker integration.
 */

import { 
  initializePushNotifications, 
  triggerPushNotification,
  getPushNotificationStatus,
  type PushNotificationData 
} from './pushNotifications';
import { areNotificationsEnabled } from './simpleNotifications';

export class NotificationManager {
  private eventSource: EventSource | null = null;
  private isConnected = false;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000; // Start with 1 second

  constructor() {
    this.handleMessage = this.handleMessage.bind(this);
    this.handleError = this.handleError.bind(this);
    this.handleOpen = this.handleOpen.bind(this);
  }

  /**
   * Initialize and start the notification manager
   */
  async initialize(): Promise<boolean> {
    try {
      // Check if notifications are enabled for this user
      const notificationsEnabled = await areNotificationsEnabled();
      if (!notificationsEnabled) {
        console.log('NotificationManager: User has notifications disabled');
        return false;
      }

      // Initialize push notifications
      const pushInitialized = await initializePushNotifications();
      
      // Start SSE connection for real-time notifications
      await this.connect();
      
      console.log('NotificationManager: Initialized successfully', {
        pushNotifications: pushInitialized,
        sseConnected: this.isConnected
      });
      
      return true;
    } catch (error) {
      console.error('NotificationManager: Initialization failed:', error);
      return false;
    }
  }

  /**
   * Connect to the SSE notification stream
   */
  async connect(): Promise<void> {
    if (this.eventSource) {
      this.disconnect();
    }

    try {
      // Get last seen timestamp from localStorage for reconnection
      const lastSeenTimestamp = localStorage.getItem('last_notification_timestamp') || Date.now().toString();
      const sseUrl = `/api/notifications/trigger?lastSeen=${lastSeenTimestamp}`;
      
      this.eventSource = new EventSource(sseUrl);
      
      this.eventSource.addEventListener('open', this.handleOpen);
      this.eventSource.addEventListener('message', this.handleMessage);
      this.eventSource.addEventListener('error', this.handleError);
      
      console.log('NotificationManager: Connecting to SSE stream with lastSeen:', lastSeenTimestamp);
    } catch (error) {
      console.error('NotificationManager: Failed to connect to SSE stream:', error);
      this.scheduleReconnect();
    }
  }

  /**
   * Disconnect from the SSE stream
   */
  disconnect(): void {
    if (this.eventSource) {
      this.eventSource.removeEventListener('open', this.handleOpen);
      this.eventSource.removeEventListener('message', this.handleMessage);
      this.eventSource.removeEventListener('error', this.handleError);
      this.eventSource.close();
      this.eventSource = null;
    }
    
    this.isConnected = false;
    console.log('NotificationManager: Disconnected from SSE stream');
  }

  /**
   * Handle SSE connection open
   */
  private handleOpen(): void {
    this.isConnected = true;
    this.reconnectAttempts = 0;
    console.log('NotificationManager: Connected to notification stream');
  }

  /**
   * Handle incoming SSE messages
   */
  private async handleMessage(event: MessageEvent): void {
    try {
      const data = JSON.parse(event.data);
      
      switch (data.type) {
        case 'connected':
          console.log('NotificationManager: Stream connection confirmed');
          break;
          
        case 'notification':
          await this.handleNotification(data);
          break;
          
        case 'keepalive':
          // Just acknowledge the keepalive
          break;
          
        default:
          console.warn('NotificationManager: Unknown message type:', data.type);
      }
    } catch (error) {
      console.error('NotificationManager: Error processing message:', error);
    }
  }

  /**
   * Handle notification data from SSE
   */
  private async handleNotification(notificationData: PushNotificationData & { id: string; timestamp: string }): void {
    try {
      console.log('NotificationManager: Received notification:', notificationData.id);
      
      // Check if we've already processed this notification
      const processedKey = `notification_${notificationData.id}`;
      if (localStorage.getItem(processedKey)) {
        console.log('NotificationManager: Notification already processed, skipping');
        return;
      }
      
      // Mark as processed immediately to prevent duplicates
      localStorage.setItem(processedKey, 'true');
      
      // Update last seen timestamp
      localStorage.setItem('last_notification_timestamp', notificationData.id);
      
      // Clean up old processed notifications (older than 1 hour)
      const oneHourAgo = Date.now() - (60 * 60 * 1000);
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith('notification_')) {
          const notificationId = key.replace('notification_', '');
          const timestamp = parseInt(notificationId);
          if (timestamp < oneHourAgo) {
            localStorage.removeItem(key);
          }
        }
      }
      
      // Check if push notifications are available
      const status = await getPushNotificationStatus();
      
      if (status.supported && status.permission === 'granted' && status.subscribed) {
        // Trigger push notification through service worker
        const success = await triggerPushNotification(notificationData);
        
        if (success) {
          console.log('NotificationManager: Push notification sent successfully');
        } else {
          console.warn('NotificationManager: Push notification failed, falling back to simple notification');
          this.fallbackToSimpleNotification(notificationData);
        }
      } else {
        console.log('NotificationManager: Push notifications not available, using simple notification');
        this.fallbackToSimpleNotification(notificationData);
      }
    } catch (error) {
      console.error('NotificationManager: Error handling notification:', error);
    }
  }

  /**
   * Fallback to simple browser notification
   */
  private fallbackToSimpleNotification(notificationData: PushNotificationData): void {
    try {
      if (Notification.permission === 'granted') {
        const notification = new Notification(notificationData.title, {
          body: notificationData.body,
          icon: notificationData.icon,
          tag: notificationData.tag,
          requireInteraction: notificationData.requireInteraction
        });
        
        notification.onclick = () => {
          window.focus();
          if (notificationData.url) {
            window.location.href = notificationData.url;
          }
          notification.close();
        };
        
        // Auto-close after 10 seconds
        setTimeout(() => notification.close(), 10000);
      }
    } catch (error) {
      console.error('NotificationManager: Fallback notification failed:', error);
    }
  }

  /**
   * Handle SSE connection errors
   */
  private handleError(event: Event): void {
    console.error('NotificationManager: SSE connection error:', event);
    this.isConnected = false;
    
    if (this.eventSource?.readyState === EventSource.CLOSED) {
      this.scheduleReconnect();
    }
  }

  /**
   * Schedule reconnection with exponential backoff
   */
  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('NotificationManager: Max reconnection attempts reached');
      return;
    }

    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts);
    this.reconnectAttempts++;
    
    console.log(`NotificationManager: Scheduling reconnect in ${delay}ms (attempt ${this.reconnectAttempts})`);
    
    setTimeout(() => {
      if (!this.isConnected) {
        this.connect();
      }
    }, delay);
  }

  /**
   * Get connection status
   */
  getStatus(): {
    connected: boolean;
    reconnectAttempts: number;
    hasEventSource: boolean;
  } {
    return {
      connected: this.isConnected,
      reconnectAttempts: this.reconnectAttempts,
      hasEventSource: this.eventSource !== null
    };
  }

  /**
   * Test notification functionality
   */
  async testNotification(): Promise<boolean> {
    const testData: PushNotificationData = {
      title: '🧪 Test Notification - Peña Bética',
      body: 'This is a test notification to verify the system is working',
      icon: '/images/logo_no_texto.jpg',
      tag: 'test-notification',
      url: '/admin'
    };

    try {
      const status = await getPushNotificationStatus();
      
      if (status.supported && status.permission === 'granted') {
        return await triggerPushNotification(testData);
      } else {
        this.fallbackToSimpleNotification(testData);
        return true;
      }
    } catch (error) {
      console.error('NotificationManager: Test notification failed:', error);
      return false;
    }
  }
}

// Singleton instance
let notificationManager: NotificationManager | null = null;

/**
 * Get or create the notification manager instance
 */
export function getNotificationManager(): NotificationManager {
  if (!notificationManager) {
    notificationManager = new NotificationManager();
  }
  return notificationManager;
}

/**
 * Initialize notifications for the current session
 */
export async function initializeNotifications(): Promise<boolean> {
  const manager = getNotificationManager();
  return await manager.initialize();
}

/**
 * Cleanup notifications on page unload
 */
export function cleanupNotifications(): void {
  if (notificationManager) {
    notificationManager.disconnect();
    notificationManager = null;
  }
}