'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Global application error:', error);
  }, [error]);

  return (
    <html lang="es">
      <body>
        <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center px-4">
          <div className="max-w-md w-full text-center">
            <div className="mb-8">
              <h1 className="text-6xl font-black text-red-600 mb-4">¡Oops!</h1>
              <h2 className="text-2xl font-bold text-gray-800 mb-4">
                Error del sistema
              </h2>
              <p className="text-gray-600 mb-8">
                Ha ocurrido un error crítico en la aplicación.
              </p>
            </div>
            
            <div className="space-y-4">
              <button
                onClick={() => reset()}
                className="inline-block bg-green-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-green-700 transition-colors mr-4"
              >
                Intentar de nuevo
              </button>
              
              <Link
                href="/"
                className="inline-block bg-gray-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-700 transition-colors"
              >
                Volver al inicio
              </Link>
            </div>
          </div>
        </div>
      </body>
    </html>
  );
}
