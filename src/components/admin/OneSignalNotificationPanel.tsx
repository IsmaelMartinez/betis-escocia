'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Bell, BellOff, Check, AlertCircle, TestTube } from 'lucide-react';
import Button from '@/components/ui/Button';
import Card, { CardHeader, CardBody } from '@/components/ui/Card';
import LoadingSpinner from '@/components/LoadingSpinner';
import { createTestNotificationPayload } from '@/lib/notifications/oneSignalClient';

interface OneSignalNotificationPanelProps {
  className?: string;
}

interface NotificationState {
  enabled: boolean;
  loading: boolean;
  error: string | null;
  permissionGranted: boolean;
  permissionDenied: boolean;
  oneSignalReady: boolean;
  testLoading: boolean;
}

const OneSignalNotificationPanel: React.FC<OneSignalNotificationPanelProps> = ({ 
  className = '' 
}) => {
  const [state, setState] = useState<NotificationState>({
    enabled: false,
    loading: true,
    error: null,
    permissionGranted: false,
    permissionDenied: false,
    oneSignalReady: false,
    testLoading: false
  });

  // Load current preference from API
  const loadPreference = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));
      
      const response = await fetch('/api/admin/notifications/preferences');
      const data = await response.json();
      
      if (data.success) {
        setState(prev => ({ 
          ...prev, 
          enabled: data.data.enabled,
          loading: false 
        }));
      } else {
        throw new Error(data.error || 'Error loading preferences');
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Error loading preferences',
        loading: false 
      }));
    }
  }, []);

  // Initialize OneSignal SDK dynamically
  const initializeOneSignal = useCallback(async () => {
    if (typeof window === 'undefined') return;

    try {
      // Dynamic import of OneSignal SDK
      const OneSignal = await import('react-onesignal').then(mod => mod.default);
      
      await OneSignal.init({
        appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!,
        safari_web_id: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
        notifyButton: {
          enable: false, // We'll handle the UI ourselves
        },
        allowLocalhostAsSecureOrigin: process.env.NODE_ENV === 'development',
      });

      // Set admin tag
      await OneSignal.sendTag('user_type', 'admin');

      // Check notification permission
      const permission = await OneSignal.getNotificationPermission();
      const permissionGranted = permission === 'granted';
      const permissionDenied = permission === 'denied';

      setState(prev => ({
        ...prev,
        oneSignalReady: true,
        permissionGranted,
        permissionDenied
      }));

      return true;
    } catch (error) {
      console.error('OneSignal initialization failed:', error);
      setState(prev => ({
        ...prev,
        error: 'Error initializing push notifications',
        oneSignalReady: false
      }));
      return false;
    }
  }, []);

  // Handle toggle change
  const handleToggleChange = useCallback(async (enabled: boolean) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      if (enabled) {
        // Initialize OneSignal first
        const initialized = await initializeOneSignal();
        if (!initialized) {
          setState(prev => ({ ...prev, loading: false }));
          return;
        }

        // Request permission if needed
        if (!state.permissionGranted) {
          try {
            const OneSignal = await import('react-onesignal').then(mod => mod.default);
            const permission = await OneSignal.showSlidedownPrompt();
            
            if (permission !== true) {
              setState(prev => ({
                ...prev,
                permissionDenied: true,
                loading: false,
                error: 'Las notificaciones push requieren permisos del navegador'
              }));
              return;
            }
            
            setState(prev => ({
              ...prev,
              permissionGranted: true,
              permissionDenied: false
            }));
          } catch (permError) {
            console.error('Permission request failed:', permError);
            setState(prev => ({
              ...prev,
              loading: false,
              error: 'No se pudieron solicitar permisos de notificación'
            }));
            return;
          }
        }
      }

      // Update preference in database
      const response = await fetch('/api/admin/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ enabled })
      });

      const data = await response.json();
      
      if (data.success) {
        setState(prev => ({ 
          ...prev, 
          enabled: data.data.enabled,
          loading: false,
          error: null
        }));
      } else {
        throw new Error(data.error || 'Error updating preferences');
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Error updating preferences',
        loading: false 
      }));
    }
  }, [state.permissionGranted, initializeOneSignal]);

  // Handle test notification
  const handleTestNotification = useCallback(async () => {
    try {
      setState(prev => ({ ...prev, testLoading: true, error: null }));
      
      const response = await fetch('/api/admin/notifications/test', {
        method: 'POST'
      });
      
      const data = await response.json();
      
      if (data.success) {
        // Success - no need to show anything as the notification will appear
      } else {
        throw new Error(data.error || 'Error sending test notification');
      }
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Error sending test notification'
      }));
    } finally {
      setState(prev => ({ ...prev, testLoading: false }));
    }
  }, []);

  // Initialize on mount
  useEffect(() => {
    loadPreference();
  }, [loadPreference]);

  return (
    <Card className={`hover-lift ${className}`} data-testid="onesignal-notification-panel">
      <CardHeader>
        <div className="flex items-center space-x-2">
          <Bell className="h-5 w-5 text-betis-green" />
          <h2 className="text-xl font-bold text-betis-black">Notificaciones Push</h2>
        </div>
      </CardHeader>
      <CardBody>
        <div className="space-y-4">
          {/* Error Message */}
          {state.error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-red-400 mt-0.5 mr-2" />
                <div className="text-sm text-red-800">{state.error}</div>
              </div>
            </div>
          )}

          {/* Permission Denied Warning */}
          {state.permissionDenied && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
              <div className="flex">
                <AlertCircle className="h-5 w-5 text-yellow-400 mt-0.5 mr-2" />
                <div className="text-sm text-yellow-800">
                  Las notificaciones push están bloqueadas en tu navegador. 
                  Puedes habilitarlas en la configuración del sitio.
                </div>
              </div>
            </div>
          )}

          {/* Toggle Section */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {state.loading ? (
                <LoadingSpinner size="sm" />
              ) : (
                <div className={`w-3 h-3 rounded-full ${
                  state.enabled && state.permissionGranted 
                    ? 'bg-green-500' 
                    : 'bg-gray-300'
                }`} />
              )}
              <div>
                <label 
                  htmlFor="notification-toggle" 
                  className="block text-sm font-medium text-gray-700"
                >
                  Recibir notificaciones de actividad
                </label>
                <p className="text-xs text-gray-500 mt-1">
                  RSVP, mensajes de contacto y actividad administrativa
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <label className="inline-flex items-center">
                <input
                  id="notification-toggle"
                  type="checkbox"
                  checked={state.enabled}
                  onChange={(e) => handleToggleChange(e.target.checked)}
                  disabled={state.loading}
                  className="rounded border-gray-300 text-betis-green shadow-sm focus:border-betis-green focus:ring focus:ring-betis-green focus:ring-opacity-50 disabled:opacity-50"
                />
              </label>
            </div>
          </div>

          {/* Status Display */}
          <div className="flex items-center space-x-2 text-sm">
            <span className="text-gray-600">Estado:</span>
            {state.loading ? (
              <span className="text-gray-500">Cargando...</span>
            ) : state.enabled && state.permissionGranted ? (
              <span className="text-green-600 flex items-center">
                <Check className="h-4 w-4 mr-1" />
                Activo
              </span>
            ) : state.enabled && state.permissionDenied ? (
              <span className="text-yellow-600">Permisos necesarios</span>
            ) : (
              <span className="text-gray-500">Desactivado</span>
            )}
          </div>

          {/* Test Button */}
          {state.enabled && state.permissionGranted && !state.loading && (
            <div className="pt-2 border-t">
              <Button
                onClick={handleTestNotification}
                variant="outline"
                size="sm"
                disabled={state.testLoading}
                isLoading={state.testLoading}
                leftIcon={<TestTube className="h-4 w-4" />}
              >
                Enviar Notificación de Prueba
              </Button>
            </div>
          )}

          {/* Info Text */}
          <div className="text-xs text-gray-500">
            <p>
              Las notificaciones push te permiten recibir alertas en tiempo real 
              sobre nueva actividad de la comunidad, incluso cuando el navegador 
              está cerrado.
            </p>
          </div>
        </div>
      </CardBody>
    </Card>
  );
};

export default OneSignalNotificationPanel;