'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Bell, Check, AlertCircle, TestTube } from 'lucide-react';
import { useUser } from '@clerk/nextjs';
import Button from '@/components/ui/Button';
import Card, { CardHeader, CardBody } from '@/components/ui/Card';
import LoadingSpinner from '@/components/LoadingSpinner';

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
  const { user } = useUser();
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
    console.log('[OneSignal] Initialize function called');
    console.log('[OneSignal] Window check:', typeof window);
    console.log('[OneSignal] Current URL:', window?.location?.href);
    
    if (typeof window === 'undefined') {
      console.log('[OneSignal] Skipping - not in browser');
      return false;
    }

    try {
      console.log('[OneSignal] Environment variables:', {
        appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
        nodeEnv: process.env.NODE_ENV,
        mockPush: process.env.MOCK_PUSH,
        isDev: process.env.NODE_ENV === 'development'
      });

      // Check and unregister existing service workers to avoid conflicts
      if ('serviceWorker' in navigator) {
        const registrations = await navigator.serviceWorker.getRegistrations();
        console.log('[OneSignal] Existing service workers:', registrations.length);
        
        for (const reg of registrations) {
          console.log('[OneSignal] Unregistering SW:', reg.scope, reg.active?.scriptURL);
          await reg.unregister();
        }
        console.log('[OneSignal] All existing service workers unregistered');
      }

      console.log('[OneSignal] Importing react-onesignal...');
      // Dynamic import of OneSignal SDK
      const OneSignal = await import('react-onesignal').then(mod => mod.default);
      console.log('[OneSignal] Import successful:', !!OneSignal);
      console.log('[OneSignal] OneSignal object methods:', Object.getOwnPropertyNames(OneSignal));
      
      const initConfig = {
        appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!,
        allowLocalhostAsSecureOrigin: process.env.NODE_ENV === 'development',
        // Let OneSignal handle everything automatically
      };

      console.log('[OneSignal] Initializing with config:', initConfig);

      // Check if OneSignal is already initialized to avoid double initialization
      if (typeof window !== 'undefined' && (window as unknown as { OneSignal?: { _initialized?: boolean } }).OneSignal?._initialized) {
        console.log('[OneSignal] Already initialized, skipping init');
      } else {
        await OneSignal.init(initConfig);
        console.log('[OneSignal] Init completed successfully');
      }

      // Set the external user ID to the Clerk user ID for precise targeting
      if (user?.id) {
        try {
          console.log('[OneSignal] Setting external user ID:', user.id);
          await OneSignal.login(user.id);
          console.log('[OneSignal] External user ID set successfully');
        } catch (err) {
          console.warn('[OneSignal] Failed to set external user ID:', err);
        }
      } else {
        console.warn('[OneSignal] No user ID available for external user ID');
      }

      // Set admin tag
      try {
        console.log('[OneSignal] Setting admin tag');
        await OneSignal.User.addTag('user_type', 'admin');
        console.log('[OneSignal] Admin tag set successfully');
      } catch (err) {
        console.warn('[OneSignal] Failed to set admin tag:', err);
      }

      // Check notification permission
      console.log('[OneSignal] Checking notification permission...');
      const permission = OneSignal.Notifications.permission;
      console.log('[OneSignal] Permission result:', permission);
      
      // Handle both boolean and string responses
      let permissionGranted = false;
      let permissionDenied = false;
      
      if (typeof permission === 'boolean') {
        permissionGranted = permission;
        permissionDenied = false;
      } else {
        permissionGranted = permission === 'granted';
        permissionDenied = permission === 'denied';
      }

      console.log('[OneSignal] Permission status:', {
        permission,
        permissionGranted,
        permissionDenied
      });

      setState(prev => ({
        ...prev,
        oneSignalReady: true,
        permissionGranted,
        permissionDenied
      }));

      console.log('[OneSignal] Initialization completed successfully');
      return true;
    } catch (error) {
      console.error('[OneSignal] Initialization failed with error:', error);
      console.error('[OneSignal] Error details:', {
        name: error instanceof Error ? error.name : 'Unknown',
        message: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined
      });
      setState(prev => ({
        ...prev,
        error: `Error initializing push notifications: ${error instanceof Error ? error.message : String(error)}`,
        oneSignalReady: false
      }));
      return false;
    }
  }, [user?.id]);

  // Handle toggle change
  const handleToggleChange = useCallback(async (enabled: boolean) => {
    try {
      setState(prev => ({ ...prev, loading: true, error: null }));

      console.log('[OneSignal] Starting toggle change:', enabled);
      console.log('[OneSignal] User ID:', user?.id);
      console.log('[OneSignal] Current state:', state);

      // ALWAYS update preference in database first
      console.log('[OneSignal] Updating preference in database:', enabled);
      const response = await fetch('/api/admin/notifications/preferences', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ enabled })
      });

      const data = await response.json();
      console.log('[OneSignal] Database response:', data);
      
      if (!data.success) {
        throw new Error(data.error || 'Error updating preferences');
      }

      // Update state with the database result
      console.log('[OneSignal] Updating state with database result:', data.data);
      setState(prev => ({ 
        ...prev, 
        enabled: data.data.enabled,
        loading: false,
        error: null
      }));

      // If enabling, try to initialize OneSignal (but don't fail if it doesn't work)
      if (enabled) {
        try {
          console.log('[OneSignal] Attempting to initialize OneSignal...');
          console.log('[OneSignal] Environment check:', {
            appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
            nodeEnv: process.env.NODE_ENV,
            mockPush: process.env.MOCK_PUSH
          });
          const initialized = await initializeOneSignal();
          
          if (!initialized) {
            console.warn('OneSignal initialization failed, but preference saved');
            setState(prev => ({ 
              ...prev, 
              error: 'Preferencia guardada, pero hay problemas con OneSignal. Revisa la configuración.' 
            }));
            return;
          }

          console.log('[OneSignal] OneSignal fully initialized successfully');
          
          // Request permissions if needed (after a short delay to ensure OneSignal is ready)
          setTimeout(async () => {
            try {
              const OneSignal = await import('react-onesignal').then(mod => mod.default);
              const currentPermission = OneSignal.Notifications.permission;
              console.log('[OneSignal] Current permission after init:', currentPermission);
              
              if (currentPermission !== 'granted' && currentPermission !== true) {
                console.log('[OneSignal] Requesting notification permissions...');
                await OneSignal.Notifications.requestPermission();
                console.log('[OneSignal] Permission request completed');
                
                // Check permission after request
                const newPermission = OneSignal.Notifications.permission;
                
                // Update state based on permission result
                setState(prev => ({
                  ...prev,
                  permissionGranted: newPermission === 'granted',
                  permissionDenied: newPermission === 'denied',
                  error: newPermission === 'denied' ? 'Se requieren permisos de notificación para recibir alertas.' : null
                }));
              }
            } catch (permError) {
              console.error('[OneSignal] Permission request failed:', permError);
            }
          }, 1000);
        } catch (oneSignalError) {
          console.error('OneSignal setup failed:', oneSignalError);
          setState(prev => ({
            ...prev,
            error: 'Preferencia guardada, pero OneSignal no está disponible. Revisa la configuración.'
          }));
        }
      }
    } catch (error) {
      console.error('Toggle change failed:', error);
      setState(prev => ({ 
        ...prev, 
        error: error instanceof Error ? error.message : 'Error updating preferences',
        loading: false 
      }));
    }
  }, [initializeOneSignal, user?.id, state]);

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