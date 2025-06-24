'use client';

interface LoadingSpinnerProps {
  readonly size?: 'sm' | 'md' | 'lg';
  readonly className?: string;
  readonly label?: string;
}

export default function LoadingSpinner({ 
  size = 'md', 
  className = '', 
  label = 'Cargando...' 
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-8 w-8',
    lg: 'h-12 w-12'
  };

  return (
    <div className={`flex flex-col items-center justify-center ${className}`}>
      <div
        className={`${sizeClasses[size]} animate-spin rounded-full border-4 border-gray-300 border-t-betis-green`}
        aria-label={label}
      />
      {label && (
        <p className="mt-2 text-sm text-gray-600">{label}</p>
      )}
    </div>
  );
}

// Loading skeleton for match cards
export function MatchCardSkeleton() {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden animate-pulse">
      {/* Competition header skeleton */}
      <div className="bg-gray-300 px-4 py-2 h-10" />

      <div className="p-4">
        {/* Match details skeleton */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center space-x-4 mb-2">
            <div className="text-right flex-1">
              <div className="flex items-center justify-end space-x-2 mb-1">
                <div className="h-5 bg-gray-300 rounded w-24" />
                <div className="w-8 h-8 bg-gray-300 rounded-full" />
              </div>
              <div className="h-4 bg-gray-200 rounded w-16 ml-auto" />
            </div>
            
            <div className="h-8 bg-gray-300 rounded w-12" />
            
            <div className="text-left flex-1">
              <div className="flex items-center justify-start space-x-2 mb-1">
                <div className="w-8 h-8 bg-gray-300 rounded-full" />
                <div className="h-5 bg-gray-300 rounded w-24" />
              </div>
              <div className="h-4 bg-gray-200 rounded w-16" />
            </div>
          </div>
        </div>

        {/* Date and venue skeleton */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-center space-x-2">
            <div className="h-4 w-4 bg-gray-300 rounded" />
            <div className="h-4 bg-gray-300 rounded w-32" />
          </div>
          
          <div className="flex items-center justify-center space-x-2">
            <div className="h-4 w-4 bg-gray-300 rounded" />
            <div className="h-4 bg-gray-300 rounded w-40" />
          </div>
        </div>

        {/* Status skeleton */}
        <div className="text-center">
          <div className="h-6 bg-gray-300 rounded-full w-20 mx-auto" />
        </div>
      </div>
    </div>
  );
}

// Loading spinner for full page loading
export function PageLoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <LoadingSpinner size="lg" label="Cargando partidos..." />
    </div>
  );
}

// Loading grid for multiple match cards
export function MatchCardSkeletonGrid({ count = 6 }: { readonly count?: number }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }, (_, i) => (
        <MatchCardSkeleton key={i} />
      ))}
    </div>
  );
}
