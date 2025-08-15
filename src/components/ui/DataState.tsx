/**
 * Reusable UI components for common data states
 * Eliminates repetitive loading, error, and empty state patterns
 */

import React from 'react';
import { AlertCircle, RefreshCw } from 'lucide-react';
import LoadingSpinner from '@/components/LoadingSpinner';
import Button from '@/components/ui/Button';

export interface DataStateProps {
  loading: boolean;
  error: string | null;
  data: any;
  children: React.ReactNode;
  emptyMessage?: string;
  onRetry?: () => void;
  skeletonCount?: number;
}

/**
 * Handles loading, error, and empty states with children for success state
 */
export function DataState({
  loading,
  error,
  data,
  children,
  emptyMessage = 'No hay datos disponibles',
  onRetry,
  skeletonCount = 3
}: DataStateProps) {
  if (loading) {
    return <LoadingSkeleton count={skeletonCount} />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={onRetry} />;
  }

  if (!data || (Array.isArray(data) && data.length === 0)) {
    return <EmptyState message={emptyMessage} />;
  }

  return <>{children}</>;
}

/**
 * Loading skeleton component
 */
export function LoadingSkeleton({ count = 3, className = '' }: { count?: number; className?: string }) {
  return (
    <div className={`space-y-4 animate-pulse ${className}`}>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="bg-gray-200 rounded-lg p-4">
          <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
          <div className="h-3 bg-gray-300 rounded w-1/2 mb-2"></div>
          <div className="h-3 bg-gray-300 rounded w-2/3"></div>
        </div>
      ))}
    </div>
  );
}

/**
 * Error state component with retry functionality
 */
export function ErrorState({ 
  error, 
  onRetry,
  className = ''
}: { 
  error: string; 
  onRetry?: () => void;
  className?: string;
}) {
  return (
    <div className={`bg-red-50 border border-red-200 rounded-lg p-6 text-center ${className}`}>
      <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
      <h3 className="text-lg font-semibold text-red-800 mb-2">
        Error al cargar datos
      </h3>
      <p className="text-red-600 mb-4">{error}</p>
      {onRetry && (
        <Button 
          onClick={onRetry} 
          variant="outline"
          leftIcon={<RefreshCw className="h-4 w-4" />}
        >
          Reintentar
        </Button>
      )}
    </div>
  );
}

/**
 * Empty state component
 */
export function EmptyState({ 
  message, 
  icon: Icon,
  action,
  className = ''
}: { 
  message: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`text-center py-12 px-4 ${className}`}>
      {Icon && <Icon className="h-16 w-16 text-gray-300 mx-auto mb-4" />}
      <p className="text-gray-500 text-lg mb-4">{message}</p>
      {action && action}
    </div>
  );
}

/**
 * List data state wrapper specifically for lists/grids
 */
export function ListDataState<T>({
  loading,
  error,
  data,
  renderItem,
  onRetry,
  emptyMessage = 'No hay elementos',
  skeletonCount = 3,
  className = ''
}: {
  loading: boolean;
  error: string | null;
  data: T[] | null;
  renderItem: (item: T, index: number) => React.ReactNode;
  onRetry?: () => void;
  emptyMessage?: string;
  skeletonCount?: number;
  className?: string;
}) {
  return (
    <DataState
      loading={loading}
      error={error}
      data={data}
      onRetry={onRetry}
      emptyMessage={emptyMessage}
      skeletonCount={skeletonCount}
    >
      <div className={className}>
        {data?.map((item, index) => renderItem(item, index))}
      </div>
    </DataState>
  );
}

/**
 * Card skeleton for loading states
 */
export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-6">
        <div className="flex items-start space-x-4">
          <div className="bg-gray-300 h-12 w-12 rounded-full"></div>
          <div className="flex-1 space-y-2">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-3 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
        <div className="mt-4 space-y-2">
          <div className="h-3 bg-gray-300 rounded w-full"></div>
          <div className="h-3 bg-gray-300 rounded w-2/3"></div>
        </div>
        <div className="mt-4 flex space-x-2">
          <div className="h-8 bg-gray-300 rounded w-20"></div>
          <div className="h-8 bg-gray-300 rounded w-16"></div>
        </div>
      </div>
    </div>
  );
}

/**
 * Table skeleton for loading states
 */
export function TableSkeleton({ 
  rows = 5, 
  columns = 4,
  className = ''
}: { 
  rows?: number;
  columns?: number;
  className?: string;
}) {
  return (
    <div className={`animate-pulse ${className}`}>
      <div className="bg-white shadow-sm rounded-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gray-50 px-6 py-3 border-b border-gray-200">
          <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
            {Array.from({ length: columns }).map((_, index) => (
              <div key={index} className="h-4 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
        
        {/* Rows */}
        {Array.from({ length: rows }).map((_, rowIndex) => (
          <div key={rowIndex} className="px-6 py-4 border-b border-gray-100">
            <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
              {Array.from({ length: columns }).map((_, colIndex) => (
                <div key={colIndex} className="h-4 bg-gray-200 rounded"></div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}