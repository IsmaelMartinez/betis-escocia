'use client';

import React, { useState, useEffect } from 'react';

interface OfflineMessageProps {
  readonly isOnline: boolean;
}

function OfflineMessage({ isOnline }: OfflineMessageProps) {
  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50 bg-red-600 text-white p-2 text-center text-sm font-medium shadow-lg">
      <div className="flex items-center justify-center space-x-2">
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
        <span>Sin conexión a internet - Mostrando información guardada</span>
      </div>
    </div>
  );
}

export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(true);

  useEffect(() => {
    // Check if we're in the browser environment
    if (typeof window === 'undefined') {
      return;
    }

    // Set initial online status
    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Cleanup
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return isOnline;
}

export function OfflineDetector() {
  const isOnline = useOnlineStatus();

  return <OfflineMessage isOnline={isOnline} />;
}

// Hook for components that need to react to online status
export function useOfflineMessage() {
  const isOnline = useOnlineStatus();

  const getOfflineMessage = (context: 'matches' | 'general' = 'general') => {
    if (isOnline) return null;

    const messages = {
      matches: 'No hay conexión a internet. Los partidos mostrados pueden no estar actualizados.',
      general: 'Sin conexión a internet. Mostrando información guardada.'
    };

    return messages[context];
  };

  return { isOnline, getOfflineMessage };
}

// Offline-aware error message component
interface OfflineAwareErrorProps {
  readonly error?: Error | null;
  readonly message?: string;
  readonly context?: 'matches' | 'general';
  readonly onRetry?: () => void;
}

export function OfflineAwareError({ 
  error, 
  message, 
  context = 'general', 
  onRetry 
}: OfflineAwareErrorProps) {
  const { isOnline, getOfflineMessage } = useOfflineMessage();
  
  // If offline, show offline message instead of error
  const offlineMessage = getOfflineMessage(context);
  if (!isOnline && offlineMessage) {
    return (
      <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 text-center">
        <div className="text-amber-600 mb-2">
          <svg className="h-6 w-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-amber-800 text-sm font-medium">{offlineMessage}</p>
      </div>
    );
  }

  // Show normal error if online
  if (error || message) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
        <div className="text-red-600 mb-2">
          <svg className="h-6 w-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-red-800 text-sm font-medium mb-3">
          {message || error?.message || 'Ha ocurrido un error'}
        </p>
        {onRetry && (
          <button
            onClick={onRetry}
            className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
          >
            Intentar de nuevo
          </button>
        )}
      </div>
    );
  }

  return null;
}

export default OfflineDetector;
