'use client';

import { AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

export type MessageType = 'success' | 'error' | 'warning' | 'info';

interface MessageComponentProps {
  readonly type: MessageType;
  readonly title?: string;
  readonly message: string;
  readonly className?: string;
  readonly showIcon?: boolean;
}

export default function MessageComponent({ 
  type, 
  title, 
  message, 
  className = '', 
  showIcon = true 
}: MessageComponentProps) {
  const getStyles = (type: MessageType) => {
    switch (type) {
      case 'success':
        return {
          container: 'bg-green-50 border-green-200 text-green-800',
          icon: CheckCircle,
          iconColor: 'text-green-600'
        };
      case 'error':
        return {
          container: 'bg-red-50 border-red-200 text-red-800',
          icon: AlertCircle,
          iconColor: 'text-red-600'
        };
      case 'warning':
        return {
          container: 'bg-yellow-50 border-yellow-200 text-yellow-800',
          icon: AlertTriangle,
          iconColor: 'text-yellow-600'
        };
      case 'info':
        return {
          container: 'bg-blue-50 border-blue-200 text-blue-800',
          icon: Info,
          iconColor: 'text-blue-600'
        };
      default:
        return {
          container: 'bg-gray-50 border-gray-200 text-gray-800',
          icon: Info,
          iconColor: 'text-gray-600'
        };
    }
  };

  const styles = getStyles(type);
  const IconComponent = styles.icon;

  return (
    <div className={`border-2 rounded-2xl p-4 ${styles.container} ${className}`}>
      <div className="flex items-start space-x-3">
        {showIcon && (
          <IconComponent className={`h-5 w-5 ${styles.iconColor} flex-shrink-0 mt-0.5`} />
        )}
        <div className="flex-1">
          {title && (
            <h4 className="font-bold text-lg mb-2">{title}</h4>
          )}
          <p className="text-base leading-relaxed">{message}</p>
        </div>
      </div>
    </div>
  );
}

// Form-specific message components
export function FormSuccessMessage({ 
  title = '¡Éxito!', 
  message, 
  className = '' 
}: { 
  readonly title?: string; 
  readonly message: string; 
  readonly className?: string; 
}) {
  return (
    <MessageComponent
      type="success"
      title={title}
      message={message}
      className={`text-center ${className}`}
    />
  );
}

export function FormErrorMessage({ 
  title = 'Error', 
  message, 
  className = '' 
}: { 
  readonly title?: string; 
  readonly message: string; 
  readonly className?: string; 
}) {
  return (
    <MessageComponent
      type="error"
      title={title}
      message={message}
      className={className}
    />
  );
}

export function FormLoadingMessage({ 
  message = 'Enviando...', 
  className = '' 
}: { 
  readonly message?: string; 
  readonly className?: string; 
}) {
  return (
    <div className={`flex items-center justify-center space-x-3 p-4 ${className}`}>
      <div className="animate-spin rounded-full h-6 w-6 border-4 border-gray-300 border-t-betis-green" />
      <span className="text-gray-600 font-medium">{message}</span>
    </div>
  );
}
