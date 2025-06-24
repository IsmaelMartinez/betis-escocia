'use client';

import React from 'react';
import { ErrorBoundaryFallback } from './ErrorMessage';

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  readonly children: React.ReactNode;
  readonly fallback?: React.ComponentType<{ error: Error; resetError: () => void }>;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    // Update state so the next render will show the fallback UI
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    // Log error details for debugging
    console.error('Error Boundary caught an error:', error, errorInfo);
  }

  resetError = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || ErrorBoundaryFallback;
      return <FallbackComponent error={this.state.error} resetError={this.resetError} />;
    }

    return this.props.children;
  }
}

// HOC for wrapping components with error boundary
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  fallback?: React.ComponentType<{ error: Error; resetError: () => void }>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary fallback={fallback}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}

// API Error Fallback Component
function ApiErrorFallback({ resetError }: { readonly resetError: () => void }) {
  return (
    <div className="min-h-[200px] flex items-center justify-center p-4">
      <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md w-full text-center">
        <div className="text-red-600 mb-4">
          <svg className="h-8 w-8 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-red-900 mb-2">
          Error al cargar los datos
        </h3>
        <p className="text-red-700 mb-4 text-sm">
          Ha ocurrido un problema al obtener la información de los partidos.
        </p>
        <button
          onClick={resetError}
          className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
        >
          Intentar de nuevo
        </button>
      </div>
    </div>
  );
}

// Match Card Error Fallback Component
function MatchCardErrorFallback({ resetError }: { readonly resetError: () => void }) {
  return (
    <div className="bg-white rounded-lg shadow-md border border-red-200 p-4">
      <div className="text-center">
        <div className="text-red-500 mb-2">
          <svg className="h-6 w-6 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <p className="text-sm text-red-700 mb-3">Error al mostrar el partido</p>
        <button
          onClick={resetError}
          className="text-xs bg-red-100 hover:bg-red-200 text-red-800 px-2 py-1 rounded"
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}

// Specific error boundary for API-related errors
export function ApiErrorBoundary({ children }: { readonly children: React.ReactNode }) {
  return (
    <ErrorBoundary fallback={ApiErrorFallback}>
      {children}
    </ErrorBoundary>
  );
}

// Error boundary for match cards
export function MatchCardErrorBoundary({ children }: { readonly children: React.ReactNode }) {
  return (
    <ErrorBoundary fallback={MatchCardErrorFallback}>
      {children}
    </ErrorBoundary>
  );
}
