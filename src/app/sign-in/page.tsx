'use client';

import { SignIn } from '@clerk/nextjs';

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Panel de Administración
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            Acceso exclusivo para la junta de la peña
          </p>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-md">
          <SignIn 
            appearance={{
              elements: {
                formButtonPrimary: 'bg-betis-green hover:bg-betis-green/90 text-white',
                card: 'shadow-none',
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}
