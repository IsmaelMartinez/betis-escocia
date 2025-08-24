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
      
      console.log('[OneSignal] Loaded preferences from API:', data);
      
      if (data.success) {
        const enabled = data.data.enabled;
        console.log('[OneSignal] Setting enabled state to:', enabled);
        
        setState(prev => ({ 
          ...prev, 
          enabled,
          loading: false 
        }));

        // Note: OneSignal initialization will be handled by the toggle handler if needed
      } else {
        throw new Error(data.error || 'Error loading preferences');
      }
    } catch (error) {
      console.error('[OneSignal] Error loading preferences:', error);
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
    console.log('[OneSignal] Current state:', { oneSignalReady: state.oneSignalReady, loading: state.loading });
    
    if (typeof window === 'undefined') {
      console.log('[OneSignal] Skipping - not in browser');
      return false;
    }

    // Check if already ready to avoid duplicate initialization
    if (state.oneSignalReady) {
      console.log('[OneSignal] Already ready, skipping initialization');
      return true;
    }

    try {
      // Validate required environment variables
      if (!process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID) {
        throw new Error('NEXT_PUBLIC_ONESIGNAL_APP_ID environment variable is not configured');
      }

      console.log('[OneSignal] Environment variables:', {
        appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID,
        nodeEnv: process.env.NODE_ENV,
        mockPush: process.env.MOCK_PUSH,
        isDev: process.env.NODE_ENV === 'development'
      });

      // Dynamic import of OneSignal SDK
      console.log('[OneSignal] Importing react-onesignal...');
      const OneSignal = await import('react-onesignal').then(mod => mod.default);
      console.log('[OneSignal] Import successful:', !!OneSignal);

      // Check if OneSignal is already initialized 
      const windowWithOneSignal = window as unknown as { OneSignalDeferred?: unknown[] };
      const isAlreadyInitialized = typeof window !== 'undefined' && 
        windowWithOneSignal.OneSignalDeferred && 
        windowWithOneSignal.OneSignalDeferred.length === 0;

      if (isAlreadyInitialized) {
        console.log('[OneSignal] SDK already initialized, skipping init() call');
      } else {
        // Check for conflicting service workers (only unregister legacy ones, not OneSignal)
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations();
          console.log('[OneSignal] Existing service workers:', registrations.length);
          
          for (const reg of registrations) {
            const scriptURL = reg.active?.scriptURL || reg.waiting?.scriptURL || reg.installing?.scriptURL;
            console.log('[OneSignal] Checking SW:', reg.scope, scriptURL);
            
            // Only unregister legacy service workers, not OneSignal ones
            if (scriptURL && (
              scriptURL.includes('/sw.js') || 
              scriptURL.includes('mockServiceWorker.js') ||
              (scriptURL.includes('localhost') && !scriptURL.includes('OneSignal'))
            )) {
              console.log('[OneSignal] Unregistering legacy SW:', scriptURL);
              await reg.unregister();
            } else {
              console.log('[OneSignal] Keeping SW (likely OneSignal):', scriptURL);
            }
          }
        }

        const initConfig = {
          appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID!,
          allowLocalhostAsSecureOrigin: process.env.NODE_ENV === 'development',
          serviceWorkerParam: {
            scope: '/',
          },
          serviceWorkerPath: 'OneSignalSDKWorker.js',
          serviceWorkerUpdaterPath: 'OneSignalSDKUpdaterWorker.js',
        };

        console.log('[OneSignal] Starting OneSignal initialization with config:', initConfig);
        
        try {
          await OneSignal.init(initConfig);
          console.log('[OneSignal] Init completed successfully');
        } catch (initError) {
          // Check if the error is about already being initialized
          if (initError instanceof Error && initError.message.includes('already initialized')) {
            console.log('[OneSignal] Already initialized (caught during init), continuing...');
          } else {
            throw initError; // Re-throw other errors
          }
        }
        
        // Wait a moment for initialization to complete
        await new Promise(resolve => setTimeout(resolve, 1000));
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

      // Check notification permission with error handling
      console.log('[OneSignal] Checking notification permission...');
      let permissionGranted = false;
      let permissionDenied = false;
      
      try {
        const permission = OneSignal.Notifications.permission;
        console.log('[OneSignal] Permission result:', permission);
        
        // Handle both boolean and string responses
        if (typeof permission === 'boolean') {
          permissionGranted = permission;
          permissionDenied = false;
        } else {
          permissionGranted = permission === 'granted';
          permissionDenied = permission === 'denied';
        }
      } catch (permError) {
        console.warn('[OneSignal] Error checking permission:', permError);
        // Fall back to browser Notification API
        const browserPermission = Notification.permission;
        permissionGranted = browserPermission === 'granted';
        permissionDenied = browserPermission === 'denied';
        console.log('[OneSignal] Using browser permission fallback:', browserPermission);
      }

      console.log('[OneSignal] Permission status:', {
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
  }, [user?.id, state.oneSignalReady, state.loading]);

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

      // If enabling, first request browser permissions, then try OneSignal
      if (enabled) {
        // First, always request browser permissions
        console.log('[OneSignal] Requesting browser permissions first...');
        try {
          if (typeof Notification !== 'undefined') {
            const currentPermission = Notification.permission;
            console.log('[OneSignal] Current browser permission:', currentPermission);
            
            if (currentPermission === 'default') {
              console.log('[OneSignal] Requesting permission...');
              const newPermission = await Notification.requestPermission();
              console.log('[OneSignal] Permission request result:', newPermission);
              
              // Update state immediately with permission result
              setState(prev => ({
                ...prev,
                permissionGranted: newPermission === 'granted',
                permissionDenied: newPermission === 'denied'
              }));
              
              if (newPermission !== 'granted') {
                setState(prev => ({
                  ...prev,
                  error: 'Se requieren permisos de notificación para activar las alertas.'
                }));
                return; // Don't proceed with OneSignal if permissions denied
              }
            } else if (currentPermission === 'granted') {
              // Permission already granted
              setState(prev => ({
                ...prev,
                permissionGranted: true,
                permissionDenied: false
              }));
            } else {
              // Permission denied
              setState(prev => ({
                ...prev,
                permissionGranted: false,
                permissionDenied: true,
                error: 'Los permisos de notificación están denegados. Puedes habilitarlos en la configuración del navegador.'
              }));
              return;
            }
          }
        } catch (permError) {
          console.error('[OneSignal] Browser permission request failed:', permError);
          setState(prev => ({
            ...prev,
            error: 'Error solicitando permisos de notificación.'
          }));
          return;
        }
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
              error: 'Preferencia guardada, pero hay problemas con OneSignal. Revisa la configuración.',
              // Still show as enabled since the database preference was saved
              permissionGranted: false,
              permissionDenied: false
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
              
              const isPermissionGranted = (perm: string | boolean) => perm === 'granted' || perm === true;
              
              if (!isPermissionGranted(currentPermission)) {
                console.log('[OneSignal] Requesting notification permissions...');
                
                // Try both OneSignal and browser native permissions
                try {
                  // First try OneSignal's permission request
                  await OneSignal.Notifications.requestPermission();
                  console.log('[OneSignal] OneSignal permission request completed');
                } catch (oneSignalError) {
                  console.warn('[OneSignal] OneSignal permission request failed, trying browser native:', oneSignalError);
                  
                  // Fallback to browser native permission request
                  if (typeof Notification !== 'undefined' && Notification.requestPermission) {
                    const browserPermission = await Notification.requestPermission();
                    console.log('[OneSignal] Browser permission request result:', browserPermission);
                  }
                }
                
                // Check permission after request (use browser API as source of truth)
                const browserPermission = typeof Notification !== 'undefined' ? Notification.permission : 'denied';
                let newPermission;
                
                try {
                  newPermission = OneSignal.Notifications.permission;
                } catch (error) {
                  console.warn('[OneSignal] Could not get OneSignal permission, using browser permission:', error);
                  newPermission = browserPermission;
                }
                
                console.log('[OneSignal] Final permissions:', { oneSignal: newPermission, browser: browserPermission });
                
                // Use browser permission as the authoritative source
                const finalPermissionGranted = browserPermission === 'granted';
                const finalPermissionDenied = browserPermission === 'denied';
                
                // Update state based on permission result
                setState(prev => ({
                  ...prev,
                  permissionGranted: finalPermissionGranted,
                  permissionDenied: finalPermissionDenied,
                  error: finalPermissionDenied ? 'Se requieren permisos de notificación para recibir alertas.' : null
                }));
              }
            } catch (permError) {
              console.error('[OneSignal] Permission request failed:', permError);
            }
          }, 1000);
        } catch (oneSignalError) {
          console.error('OneSignal setup failed:', oneSignalError);
          
          // If OneSignal fails, still try to get browser permissions directly
          console.log('[OneSignal] OneSignal failed, requesting browser permissions directly...');
          try {
            if (typeof Notification !== 'undefined') {
              const browserPermission = await Notification.requestPermission();
              console.log('[OneSignal] Direct browser permission result:', browserPermission);
              
              setState(prev => ({
                ...prev,
                error: browserPermission === 'granted' 
                  ? 'OneSignal no disponible, pero notificaciones del navegador activas.'
                  : 'Error: OneSignal no disponible y permisos de navegador denegados.',
                permissionGranted: browserPermission === 'granted',
                permissionDenied: browserPermission === 'denied'
              }));
            } else {
              setState(prev => ({
                ...prev,
                error: 'Las notificaciones no están soportadas en este navegador.'
              }));
            }
          } catch (browserPermError) {
            console.error('[OneSignal] Browser permission request failed:', browserPermError);
            setState(prev => ({
              ...prev,
              error: 'Error solicitando permisos de notificación.'
            }));
          }
        }
      } else {
        // If disabling, clear permission states
        console.log('[OneSignal] Disabling notifications, clearing states...');
        setState(prev => ({ 
          ...prev, 
          permissionGranted: false,
          permissionDenied: false,
          oneSignalReady: false,
          error: null
        }));
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
      
      console.log('[OneSignal] Sending test notification...');
      
      // Send OneSignal notification
      const response = await fetch('/api/admin/notifications/test', {
        method: 'POST'
      });
      
      const data = await response.json();
      console.log('[OneSignal] Test notification API response:', data);
      
      if (data.success) {
        console.log('[OneSignal] OneSignal test notification sent successfully');
        
        // Also show a local browser notification as a fallback/confirmation
        if (typeof Notification !== 'undefined' && Notification.permission === 'granted') {
          try {
            const browserNotification = new Notification('🧪 Notificación de Prueba - Peña Bética', {
              body: 'Esta es una notificación de prueba para confirmar que funcionan correctamente.',
              icon: '/images/logo_no_texto.jpg',
              badge: '/images/logo_no_texto.jpg',
              tag: 'test-notification',
              requireInteraction: false,
              silent: false
            });

            // Auto-close after 5 seconds
            setTimeout(() => {
              browserNotification.close();
            }, 5000);

            console.log('[OneSignal] Browser notification also displayed');
          } catch (browserError) {
            console.warn('[OneSignal] Could not show browser notification:', browserError);
          }
        } else {
          console.warn('[OneSignal] Browser notifications not available or not permitted');
        }
      } else {
        throw new Error(data.error || 'Error sending test notification');
      }
    } catch (error) {
      console.error('[OneSignal] Test notification failed:', error);
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

  // Initialize OneSignal when preferences are loaded and enabled
  useEffect(() => {
    if (state.enabled && !state.loading && !state.oneSignalReady) {
      console.log('[OneSignal] Preferences loaded and enabled, initializing OneSignal...');
      const initTimeout = setTimeout(async () => {
        try {
          const success = await initializeOneSignal();
          if (success) {
            console.log('[OneSignal] Initialization on preference load successful');
          }
        } catch (error) {
          console.warn('[OneSignal] Failed to initialize on preference load:', error);
        }
      }, 500);

      return () => clearTimeout(initTimeout);
    } else if (state.oneSignalReady) {
      console.log('[OneSignal] OneSignal already ready, skipping preference-based initialization');
    }
  }, [state.enabled, state.loading, state.oneSignalReady, initializeOneSignal]);

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