'use client';

import { useAuth, useUser } from '@clerk/nextjs';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import LoadingSpinner from '@/components/LoadingSpinner';

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

    // Check if user has admin role (fallback protection)
    const userRole = user?.publicMetadata?.role;
    
    useEffect(() => {
      if (isLoaded && isSignedIn && userRole !== 'admin') {
        router.push('/dashboard');
      }
    }, [isLoaded, isSignedIn, userRole, router]);

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

    // Show loading while redirecting non-admin users
    if (userRole !== 'admin') {
      return (
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <LoadingSpinner size="lg" label="Verificando permisos..." />
        </div>
      );
    }

    return <WrappedComponent {...props} />;
  };
}
