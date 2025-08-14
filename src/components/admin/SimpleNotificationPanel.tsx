'use client';

import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Check, AlertCircle } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card, { CardHeader, CardBody } from '@/components/ui/Card';
import LoadingSpinner from '@/components/LoadingSpinner';
import {
  isNotificationSupported,
  getNotificationPermission,
  requestNotificationPermission,
  showNotification,
  areNotificationsEnabled
} from '@/lib/notifications/simpleNotifications';
import { 
  getPushNotificationStatus,
  initializePushNotifications,
  registerServiceWorker
} from '@/lib/notifications/pushNotifications';
import { getNotificationManager } from '@/lib/notifications/notificationManager';

interface SimpleNotificationPanelProps {
  className?: string;
  onPermissionChange?: (permission: NotificationPermission) => void;
}

const SimpleNotificationPanel: React.FC<SimpleNotificationPanelProps> = ({
  className = '',
  onPermissionChange
}) => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [supported, setSupported] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testNotificationSent, setTestNotificationSent] = useState(false);
  const [userPreferenceEnabled, setUserPreferenceEnabled] = useState(false);
  const [loadingPreference, setLoadingPreference] = useState(true);
  const [pushNotificationStatus, setPushNotificationStatus] = useState({
    supported: false,
    permission: 'default' as NotificationPermission,
    subscribed: false,
    serviceWorkerReady: false
  });
  const [notificationManagerStatus, setNotificationManagerStatus] = useState({
    connected: false,
    reconnectAttempts: 0
  });

  // Check initial state
  useEffect(() => {
    const checkInitialState = async () => {
      try {
        // Check browser notification state
        const browserSupported = isNotificationSupported();
        const currentPermission = getNotificationPermission();
        
        setSupported(browserSupported);
        setPermission(currentPermission);
        
        // Check push notification status
        try {
          const pushStatus = await getPushNotificationStatus();
          setPushNotificationStatus(pushStatus);
        } catch (err) {
          console.warn('Failed to get push notification status:', err);
        }
        
        // Load user preference from database
        try {
          const enabled = await areNotificationsEnabled();
          setUserPreferenceEnabled(enabled);
        } catch (err) {
          // Default to false if API fails (e.g., in test environment)
          console.warn('Failed to load notification preferences, defaulting to false:', err);
          setUserPreferenceEnabled(false);
        }
        
        // Check notification manager status
        try {
          const manager = getNotificationManager();
          const managerStatus = manager.getStatus();
          setNotificationManagerStatus(managerStatus);
        } catch (err) {
          console.warn('Failed to get notification manager status:', err);
        }
        
        setLoadingPreference(false);
        
        // Notify parent components
        onPermissionChange?.(currentPermission);
      } catch (err) {
        console.error('Failed to check initial notification state:', err);
        setError('Failed to load notification settings');
        setLoadingPreference(false);
      }
    };

    checkInitialState();
  }, [onPermissionChange]);

  const handleEnablePermission = async () => {
    setLoading(true);
    setError(null);

    try {
      const newPermission = await requestNotificationPermission();
      setPermission(newPermission);
      onPermissionChange?.(newPermission);
    } catch (err) {
      setError('Failed to request notification permission');
      console.error('Permission request failed:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleTogglePreference = async () => {
    if (loadingPreference) return;

    const newEnabledState = !userPreferenceEnabled;
    
    // Optimistically update UI immediately for better UX
    setUserPreferenceEnabled(newEnabledState);
    setLoadingPreference(true);
    setError(null);
    
    try {
      // Toggle preference via API
      const response = await fetch('/api/notifications/preferences', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ enabled: newEnabledState })
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        // Revert the optimistic update on failure
        setUserPreferenceEnabled(!newEnabledState);
        throw new Error(errorData.error || 'Failed to update preferences');
      }

      console.log('Notification preference updated successfully:', newEnabledState);
    } catch (err) {
      setError('Failed to update notification preferences');
      console.error('Preference update failed:', err);
      // State already reverted above on API failure
    } finally {
      setLoadingPreference(false);
    }
  };

  const handleTestNotification = async () => {
    if (!supported || permission !== 'granted') return;

    try {
      // Try using the notification manager for push notifications first
      const manager = getNotificationManager();
      const success = await manager.testNotification();
      
      if (!success) {
        // Fallback to simple notification
        showNotification({
          title: '🧪 Test Notification - Peña Bética',
          body: 'Your notifications are working correctly!',
          tag: 'test'
        });
      }
      
      setTestNotificationSent(true);
      setTimeout(() => setTestNotificationSent(false), 3000);
    } catch (err) {
      setError('Failed to send test notification');
      console.error('Test notification failed:', err);
    }
  };

  const getStatusColor = () => {
    if (!supported) return 'text-gray-500';
    if (permission === 'granted' && userPreferenceEnabled) return 'text-green-600';
    if (permission === 'denied') return 'text-red-600';
    return 'text-yellow-600';
  };

  const getStatusIcon = () => {
    if (!supported || permission === 'denied' || !userPreferenceEnabled) {
      return <BellOff className="h-5 w-5" />;
    }
    return <Bell className="h-5 w-5" />;
  };

  const getStatusText = () => {
    if (!supported) return 'Not supported in this browser';
    if (!userPreferenceEnabled) return 'Notificaciones deshabilitadas';
    if (permission === 'granted') return 'Notifications enabled';
    if (permission === 'denied') return 'Permissions denied';
    return 'Permissions not requested';
  };

  return (
    <Card className={`${className}`} data-testid="notification-panel">
      <CardHeader>
        <div className="flex items-center gap-3">
          <div className={getStatusColor()}>
            {getStatusIcon()}
          </div>
          <h3 className="text-lg font-semibold">Push Notifications</h3>
        </div>
      </CardHeader>
      
      <CardBody className="space-y-4">
        {error && (
          <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">{error}</span>
          </div>
        )}

        {/* Browser Compatibility Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium">Browser Support</p>
            <p className="text-sm text-gray-600" data-testid="browser-support-status">
              {supported ? 'Supported' : 'Not supported'}
            </p>
          </div>
          <div className={supported ? 'text-green-600' : 'text-red-600'}>
            {supported ? <Check className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          </div>
        </div>

        {/* Permission Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium">Permission Status</p>
            <p className="text-sm text-gray-600" data-testid="permission-status">
              {getStatusText()}
            </p>
          </div>
          <div className={getStatusColor()}>
            {getStatusIcon()}
          </div>
        </div>

        {/* Service Worker Status */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium">Service Worker</p>
            <p className="text-sm text-gray-600" data-testid="service-worker-status">
              {pushNotificationStatus.serviceWorkerReady ? 'Ready' : 'Not Ready'}
            </p>
          </div>
          <div className={pushNotificationStatus.serviceWorkerReady ? 'text-green-600' : 'text-yellow-600'}>
            {pushNotificationStatus.serviceWorkerReady ? <Check className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          </div>
        </div>

        {/* Background Notifications */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium">Background Notifications</p>
            <p className="text-sm text-gray-600" data-testid="background-notifications-status">
              {notificationManagerStatus.connected ? 'Connected' : 'Disconnected'}
            </p>
          </div>
          <div className={notificationManagerStatus.connected ? 'text-green-600' : 'text-gray-400'}>
            {notificationManagerStatus.connected ? <Check className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          </div>
        </div>

        {/* Subscription Status (for backward compatibility with tests) */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium">Overall Status</p>
            <p className="text-sm text-gray-600" data-testid="subscription-status">
              {permission === 'granted' && userPreferenceEnabled && pushNotificationStatus.serviceWorkerReady ? 'Fully Active' : 'Inactive'}
            </p>
          </div>
          <div className={permission === 'granted' && userPreferenceEnabled && pushNotificationStatus.serviceWorkerReady ? 'text-green-600' : 'text-gray-400'}>
            {permission === 'granted' && userPreferenceEnabled && pushNotificationStatus.serviceWorkerReady ? <Check className="h-5 w-5" /> : <AlertCircle className="h-5 w-5" />}
          </div>
        </div>

        {/* User Preference Toggle */}
        <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
          <div>
            <p className="font-medium">Enable Notifications</p>
            <p className="text-sm text-gray-600">
              Receive admin alerts for RSVP and contact submissions
            </p>
          </div>
          <div className="flex items-center gap-2">
            {loadingPreference && <LoadingSpinner size="sm" />}
            <input
              type="checkbox"
              checked={userPreferenceEnabled}
              onChange={handleTogglePreference}
              disabled={loadingPreference}
              className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
              data-testid="notification-toggle"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-4 border-t">
          {permission !== 'granted' && supported && (
            <Button
              onClick={handleEnablePermission}
              disabled={loading}
              className="flex-1"
              variant="primary"
            >
              {loading ? 'Requesting...' : 'Enable Notifications'}
            </Button>
          )}
          
          {permission === 'granted' && supported && (
            <Button
              onClick={handleTestNotification}
              disabled={!userPreferenceEnabled}
              variant="secondary"
              className="flex-1"
            >
              {testNotificationSent ? 'Test Sent!' : 'Send Test'}
            </Button>
          )}
        </div>

        {/* Info Text */}
        <div className="text-xs text-gray-500 mt-4 space-y-1">
          <p>
            Notifications work in secure contexts (HTTPS) and require user permission.
          </p>
          <p>
            Background notifications work even when the admin dashboard is closed, 
            using a service worker for real-time push notifications.
          </p>
          <p>
            {notificationManagerStatus.connected 
              ? '✅ You will receive notifications in the background.' 
              : '⚠️ Background notifications are currently disabled.'
            }
          </p>
        </div>
      </CardBody>
    </Card>
  );
};

export default SimpleNotificationPanel;