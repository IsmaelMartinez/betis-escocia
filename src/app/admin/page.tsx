'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@clerk/nextjs';
import LoadingSpinner from '@/components/LoadingSpinner';
import { isFeatureEnabled } from '@/lib/flags';
import { useRouter } from 'next/navigation';

export default function AdminPage() {
  const { isLoaded, isSignedIn } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);

  // Redirect to sign-in if not authenticated
  useEffect(() => {
    if (isLoaded && !isSignedIn) {
      router.push('/sign-in');
    }
  }, [isLoaded, isSignedIn, router]);

  useEffect(() => {
    if (isSignedIn) {
      setLoading(false);
    }
  }, [isSignedIn]);

  if (!isFeatureEnabled('show-admin')) {
    return null;
  }

  // Show loading while Clerk is loading
  if (!isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" label="Cargando autenticación..." />
      </div>
    );
  }

  // Don't render anything if not signed in (redirect will handle this)
  if (!isSignedIn) {
    return null;
  }

  // Show loading while fetching data
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" label="Cargando panel de administración..." />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-black text-betis-black">Panel de Administración</h1>
        <p className="text-gray-600 mt-2">Gestión de la Peña Bética Escocesa</p>
      </div>
    </div>
  );
}
