'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="mb-8">
          <h1 className="text-6xl font-black text-red-600 mb-4">¡Oops!</h1>
          <h2 className="text-2xl font-bold text-betis-black mb-4">
            Algo salió mal
          </h2>
          <p className="text-gray-600 mb-8">
            Ha ocurrido un error inesperado. Por favor, intenta de nuevo.
          </p>
        </div>
        
        <div className="space-y-4">
          <button
            onClick={() => reset()}
            className="inline-block bg-betis-green text-white px-6 py-3 rounded-lg font-semibold hover:bg-betis-green/90 transition-colors mr-4"
          >
            Intentar de nuevo
          </button>
          
          <Link
            href="/"
            className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
          >
            Volver al inicio
          </Link>
          
          <div className="text-sm text-gray-500 mt-4">
            <p>Si el problema persiste, <Link href="/contacto" className="text-betis-green hover:underline">contáctanos</Link></p>
          </div>
        </div>
      </div>
    </div>
  );
}
