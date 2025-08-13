'use client';

import React, { useState, useEffect } from 'react';
import { Bell, BellOff, Check, AlertCircle, Settings } from 'lucide-react';
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

interface NotificationPanelProps {
  className?: string;
  onPermissionChange?: (permission: NotificationPermission) => void;
  onSubscriptionChange?: (subscribed: boolean) => void;
}

const NotificationPanel: React.FC<NotificationPanelProps> = ({
  className = '',
  onPermissionChange,
  onSubscriptionChange
}) => {
  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [supported, setSupported] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [testNotificationSent, setTestNotificationSent] = useState(false);
  const [userPreferenceEnabled, setUserPreferenceEnabled] = useState(false);
  const [loadingPreference, setLoadingPreference] = useState(true);

  // Check initial state
  useEffect(() => {
    const checkInitialState = async () => {
      try {
        // Check browser notification state
        const browserSupported = isNotificationSupported();
        const currentPermission = getNotificationPermission();
        
        setSupported(browserSupported);
        setPermission(currentPermission);
        
        // Load user preference from database
        await loadUserPreference();
        
        // Notify parent components
        onPermissionChange?.(state.permission);
        onSubscriptionChange?.(subscribed);
      } catch (error) {
        console.error('Error checking notification state:', error);
        setError('Error al verificar el estado de las notificaciones');
      }
    };

    checkInitialState();
  }, [onPermissionChange, onSubscriptionChange]);

  // Load user preference from database
  const loadUserPreference = async () => {
    setLoadingPreference(true);
    try {
      const response = await fetch('/api/notifications/preferences');
      if (response.ok) {
        const data = await response.json();
        setUserPreferenceEnabled(data.enabled);
      } else {
        console.error('Failed to load user preference:', response.statusText);
      }
    } catch (error) {
      console.error('Error loading user preference:', error);
    } finally {
      setLoadingPreference(false);
    }
  };

  // Save user preference to database
  const saveUserPreference = async (enabled: boolean) => {
    try {
      const response = await fetch('/api/notifications/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ enabled }),
      });

      if (response.ok) {
        setUserPreferenceEnabled(enabled);
        console.log('User preference saved:', enabled);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to save preference');
      }
    } catch (error) {
      console.error('Error saving user preference:', error);
      throw error;
    }
  };

  const handleRequestPermission = async () => {
    setLoading(true);
    setError(null);

    try {
      const permission = await requestNotificationPermission();
      
      setPermissionState(prev => ({ ...prev, permission }));
      onPermissionChange?.(permission);

      if (permission === 'granted') {
        // Automatically subscribe if permission granted
        await handleSubscribe();
      }
    } catch (error) {
      console.error('Permission request failed:', error);
      setError(error instanceof Error ? error.message : 'Error al solicitar permisos');
    } finally {
      setLoading(false);
    }
  };

  const handleSubscribe = async () => {
    setLoading(true);
    setError(null);

    try {
      await subscribeToPushNotifications();
      
      setPermissionState(prev => ({ ...prev, subscribed: true }));
      onSubscriptionChange?.(true);
      
      // Save user preference as enabled
      await saveUserPreference(true);
    } catch (error) {
      console.error('Subscription failed:', error);
      setError(error instanceof Error ? error.message : 'Error al activar las notificaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setLoading(true);
    setError(null);

    try {
      const success = await unsubscribeFromPushNotifications();
      
      if (success) {
        setPermissionState(prev => ({ ...prev, subscribed: false }));
        onSubscriptionChange?.(false);
        
        // Save user preference as disabled
        await saveUserPreference(false);
      } else {
        throw new Error('Failed to unsubscribe');
      }
    } catch (error) {
      console.error('Unsubscribe failed:', error);
      setError(error instanceof Error ? error.message : 'Error al desactivar las notificaciones');
    } finally {
      setLoading(false);
    }
  };

  const handleTestNotification = async () => {
    setLoading(true);
    setError(null);
    setTestNotificationSent(false);

    try {
      await sendTestNotification({
        title: '🧪 Notificación de Prueba',
        body: 'Las notificaciones push están funcionando correctamente!',
        tag: 'test-notification'
      });
      
      setTestNotificationSent(true);
      
      // Reset the test notification indicator after 3 seconds
      setTimeout(() => {
        setTestNotificationSent(false);
      }, 3000);
    } catch (error) {
      console.error('Test notification failed:', error);
      setError(error instanceof Error ? error.message : 'Error al enviar notificación de prueba');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIndicator = () => {
    if (loadingPreference) {
      return (
        <div className="flex items-center text-gray-500">
          <LoadingSpinner size="sm" />
          <span className="text-sm ml-2">Cargando...</span>
        </div>
      );
    }

    if (!permissionState.supported) {
      return (
        <div className="flex items-center text-gray-500">
          <AlertCircle className="h-4 w-4 mr-2" />
          <span className="text-sm">No compatible</span>
        </div>
      );
    }

    if (permissionState.permission === 'denied') {
      return (
        <div className="flex items-center text-red-500">
          <BellOff className="h-4 w-4 mr-2" />
          <span className="text-sm">Bloqueadas</span>
        </div>
      );
    }

    if (permissionState.permission === 'granted' && permissionState.subscribed && userPreferenceEnabled) {
      return (
        <div className="flex items-center text-green-500">
          <Bell className="h-4 w-4 mr-2" />
          <span className="text-sm">Activas</span>
        </div>
      );
    }

    return (
      <div className="flex items-center text-yellow-500">
        <BellOff className="h-4 w-4 mr-2" />
        <span className="text-sm">Inactivas</span>
      </div>
    );
  };

  const getActionButton = () => {
    if (!permissionState.supported) {
      return (
        <Button variant="outline" disabled>
          No compatible
        </Button>
      );
    }

    if (permissionState.permission === 'denied') {
      return (
        <div className="text-sm text-gray-600">
          <p>Las notificaciones están bloqueadas.</p>
          <p className="mt-1">
            Puedes habilitarlas en la configuración del navegador haciendo clic en el icono de bloqueo 
            en la barra de direcciones.
          </p>
        </div>
      );
    }

    if (permissionState.permission === 'default') {
      return (
        <Button
          onClick={handleRequestPermission}
          leftIcon={<Bell className="h-4 w-4" />}
          isLoading={loading}
          disabled={loading}
        >
          Activar Notificaciones
        </Button>
      );
    }

    if (permissionState.permission === 'granted' && !permissionState.subscribed) {
      return (
        <Button
          onClick={handleSubscribe}
          leftIcon={<Bell className="h-4 w-4" />}
          isLoading={loading}
          disabled={loading}
        >
          Suscribirse a Notificaciones
        </Button>
      );
    }

    // User has browser permissions and subscription, show preference controls
    if (permissionState.permission === 'granted' && permissionState.subscribed) {
      return (
        <div className="space-y-3">
          {/* User preference toggle */}
          <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg" data-testid="subscription-status">
            <span className="text-sm font-medium text-gray-700">
              Recibir notificaciones:
            </span>
            <Button
              onClick={() => userPreferenceEnabled ? handleUnsubscribe() : handleSubscribe()}
              variant={userPreferenceEnabled ? "secondary" : "primary"}
              leftIcon={userPreferenceEnabled ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
              isLoading={loading || loadingPreference}
              disabled={loading || loadingPreference}
              size="sm"
            >
              {userPreferenceEnabled ? 'Desactivar' : 'Activar'}
            </Button>
          </div>
          
          {/* Test notification button - only show if enabled */}
          {userPreferenceEnabled && (
            <Button
              onClick={handleTestNotification}
              variant="outline"
              leftIcon={testNotificationSent ? <Check className="h-4 w-4" /> : <Settings className="h-4 w-4" />}
              isLoading={loading}
              disabled={loading}
              className="w-full"
            >
              {testNotificationSent ? 'Enviada!' : 'Probar Notificación'}
            </Button>
          )}
        </div>
      );
    }

    return null;
  };

  if (!permissionState.supported) {
    return (
      <Card className={className} data-testid="notification-panel">
        <CardHeader>
          <h3 className="text-lg font-semibold text-betis-black flex items-center">
            <AlertCircle className="h-5 w-5 mr-2 text-gray-500" />
            Notificaciones Push
          </h3>
        </CardHeader>
        <CardBody>
          <div className="text-center py-4" data-testid="browser-compatibility">
            <p className="text-gray-600 mb-4">
              Tu navegador no es compatible con las notificaciones push.
            </p>
            <p className="text-sm text-gray-500">
              Prueba con Chrome, Firefox, Safari o Edge para recibir notificaciones.
            </p>
          </div>
        </CardBody>
      </Card>
    );
  }

  return (
    <Card className={className} data-testid="notification-panel">
      <CardHeader>
        <h3 className="text-lg font-semibold text-betis-black flex items-center">
          <Bell className="h-5 w-5 mr-2" />
          Notificaciones Push
        </h3>
      </CardHeader>
      <CardBody>
        <div className="space-y-4">
          <p className="text-gray-600">
            Recibe notificaciones instantáneas cuando hay nuevos RSVPs o mensajes de contacto.
          </p>

          {/* Status Section */}
          <div className="flex items-center justify-between py-3 px-4 bg-gray-50 rounded-lg">
            <span className="text-sm font-medium text-gray-700">
              Estado actual:
            </span>
            <div data-testid="permission-status">
              {getStatusIndicator()}
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <div className="flex items-center">
                <AlertCircle className="h-4 w-4 text-red-500 mr-2" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            </div>
          )}

          {/* Test Notification Success */}
          {testNotificationSent && (
            <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
              <div className="flex items-center">
                <Check className="h-4 w-4 text-green-500 mr-2" />
                <span className="text-sm text-green-700">
                  ¡Notificación de prueba enviada! Revisa tu navegador.
                </span>
              </div>
            </div>
          )}

          {/* Loading Spinner */}
          {loading && (
            <div className="flex items-center justify-center py-2">
              <LoadingSpinner size="sm" />
              <span className="ml-2 text-sm text-gray-600">Procesando...</span>
            </div>
          )}

          {/* Action Buttons */}
          <div className="pt-2">
            {getActionButton()}
          </div>

          {/* Help Text */}
          {permissionState.subscribed && userPreferenceEnabled && (
            <div className="text-sm text-gray-500 pt-2 border-t">
              <p>
                ✅ Recibirás notificaciones para:
              </p>
              <ul className="ml-4 mt-1 space-y-1">
                <li>• Nuevas confirmaciones de asistencia (RSVPs)</li>
                <li>• Nuevos mensajes de contacto</li>
              </ul>
            </div>
          )}
          
          {permissionState.subscribed && !userPreferenceEnabled && (
            <div className="text-sm text-gray-500 pt-2 border-t">
              <p>
                ℹ️ Las notificaciones están configuradas pero desactivadas. Actívalas arriba para recibir alertas.
              </p>
            </div>
          )}
        </div>
      </CardBody>
    </Card>
  );
};

export default NotificationPanel;