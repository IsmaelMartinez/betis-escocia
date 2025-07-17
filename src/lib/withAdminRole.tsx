'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';
import MessageComponent from '@/components/MessageComponent';

/**
 * Higher-order component that protects routes requiring admin role
 */
export function withAdminRole<T extends object>(
  WrappedComponent: React.ComponentType<T>
) {
  return function AdminProtectedComponent(props: T) {
    const { isLoaded, isSignedIn } = useAuth();
    const { user } = useUser();
    const router = useRouter();

    useEffect(() => {
      if (isLoaded && !isSignedIn) {
        router.push('/sign-in');
      }
    }, [isLoaded, isSignedIn, router]);

    // Show loading while Clerk is loading
    if (!isLoaded) {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <LoadingSpinner size="lg" label="Verificando permisos..." />
        </div>
      );
    }

    // Redirect to sign-in if not authenticated
    if (!isSignedIn) {
      return null;
    }

    // Check if user has admin role
    const userRole = user?.publicMetadata?.role;
    if (userRole !== 'admin') {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
          <div className="max-w-md w-full">
            <MessageComponent
              type="error"
              message="Acceso denegado. Solo los administradores pueden acceder a esta página."
            />
            <div className="mt-6 text-center">
              <button
                onClick={() => router.push('/dashboard')}
                className="bg-betis-green hover:bg-betis-green/90 text-white px-6 py-3 rounded-lg font-medium transition-colors"
              >
                Volver al Dashboard
              </button>
            </div>
          </div>
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
}
