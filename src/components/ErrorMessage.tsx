'use client';

import { useState, useEffect } from 'react';
import { AlertCircle, RefreshCw, WifiOff } from 'lucide-react';

interface ErrorMessageProps {
  readonly title?: string;
  readonly message: string;
  readonly type?: 'error' | 'warning' | 'offline';
  readonly onRetry?: () => void;
  readonly retryLabel?: string;
  readonly className?: string;
}

export default function ErrorMessage({
  title,
  message,
  type = 'error',
  onRetry,
  retryLabel = 'Intentar de nuevo',
  className = ''
}: ErrorMessageProps) {
  const getStyles = () => {
    switch (type) {
      case 'warning':
        return {
          container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
          icon: 'text-yellow-500',
          button: 'bg-yellow-600 hover:bg-yellow-700 text-white'
        };
      case 'offline':
        return {
          container: 'bg-gray-50 border-gray-200 text-gray-800',
          icon: 'text-gray-500',
          button: 'bg-gray-600 hover:bg-gray-700 text-white'
        };
      default:
        return {
          container: 'bg-red-50 border-red-200 text-red-800',
          icon: 'text-red-500',
          button: 'bg-red-600 hover:bg-red-700 text-white'
        };
    }
  };

  const styles = getStyles();

  const getIcon = () => {
    if (type === 'offline') {
      return <WifiOff className={`h-5 w-5 ${styles.icon}`} />;
    }
    return <AlertCircle className={`h-5 w-5 ${styles.icon}`} />;
  };

  return (
    <div className={`rounded-lg border p-4 ${styles.container} ${className}`}>
      <div className="flex items-start space-x-3">
        {getIcon()}
        <div className="flex-1">
          {title && (
            <h3 className="text-sm font-medium mb-1">{title}</h3>
          )}
          <p className="text-sm">{message}</p>
          {onRetry && (
            <button
              onClick={onRetry}
              className={`mt-3 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md ${styles.button} focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors`}
            >
              <RefreshCw className="h-4 w-4 mr-1" />
              {retryLabel}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

// Specific error components for common scenarios
export function ApiErrorMessage({ onRetry }: { readonly onRetry?: () => void }) {
  return (
    <ErrorMessage
      title="Error al cargar los datos"
      message="No pudimos obtener la información de los partidos. Comprueba tu conexión a internet e intenta de nuevo."
      onRetry={onRetry}
    />
  );
}

export function MatchDataErrorMessage({ onRetry }: { readonly onRetry?: () => void }) {
  return (
    <ErrorMessage
      title="Error en los datos del partido"
      message="Hubo un problema al mostrar la información de este partido. Los datos podrían estar temporalmente no disponibles."
      onRetry={onRetry}
    />
  );
}

export function NoMatchesMessage() {
  return (
    <ErrorMessage
      type="warning"
      title="No hay partidos"
      message="No hay partidos programados para mostrar en este momento. ¡Vuelve pronto para ver las próximas fechas!"
    />
  );
}

export function NoUpcomingMatchesMessage() {
  return (
    <ErrorMessage
      type="warning" 
      title="No hay próximos partidos"
      message="No hay partidos próximos programados. Mantente atento para futuras fechas del Betis."
    />
  );
}

export function NoRecentMatchesMessage() {
  return (
    <ErrorMessage
      type="warning"
      title="No hay resultados recientes"
      message="No se encontraron resultados recientes. Los resultados aparecerán aquí después de los partidos."
    />
  );
}

export function ServerErrorMessage({ onRetry }: { readonly onRetry?: () => void }) {
  return (
    <ErrorMessage
      title="Error del servidor"
      message="El servidor no está disponible en este momento. Intenta de nuevo en unos minutos."
      onRetry={onRetry}
    />
  );
}

export function RateLimitErrorMessage({ onRetry }: { readonly onRetry?: () => void }) {
  return (
    <ErrorMessage
      title="Límite de consultas alcanzado"
      message="Hemos alcanzado el límite de consultas a la API. Intenta de nuevo en unos minutos."
      onRetry={onRetry}
      retryLabel="Intentar más tarde"
    />
  );
}

export function OfflineMessage({ onRetry }: { readonly onRetry?: () => void }) {
  return (
    <ErrorMessage
      type="offline"
      title="Sin conexión"
      message="Parece que no tienes conexión a internet. Comprueba tu conexión e intenta de nuevo."
      onRetry={onRetry}
      retryLabel="Comprobar conexión"
    />
  );
}

// Error boundary fallback component
export function ErrorBoundaryFallback({ 
  error, 
  resetError 
}: { 
  readonly error: Error; 
  readonly resetError: () => void; 
}) {
  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        <ErrorMessage
          title="¡Ups! Algo ha salido mal"
          message={`Ha ocurrido un error inesperado: ${error.message}`}
          onRetry={resetError}
          retryLabel="Recargar página"
          className="text-center"
        />
      </div>
    </div>
  );
}

// Network status component
export function NetworkStatus() {
  const [isOnline, setIsOnline] = useState(true);
  
  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    setIsOnline(navigator.onLine);
    
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  if (isOnline) return null;

  return (
    <div className="fixed top-0 left-0 right-0 z-50">
      <div className="bg-red-600 text-white px-4 py-2 text-center text-sm">
        <div className="flex items-center justify-center space-x-2">
          <WifiOff className="h-4 w-4" />
          <span>Sin conexión a internet</span>
        </div>
      </div>
    </div>
  );
}
