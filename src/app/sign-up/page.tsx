'use client';

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Registro No Disponible
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            El registro de nuevos usuarios está deshabilitado.
          </p>
        </div>
        <div className="bg-white p-8 rounded-lg shadow-md">
          <div className="text-center">
            <p className="text-gray-700 mb-4">
              Para obtener acceso al panel de administración, contacta con la junta de la peña.
            </p>
            <p className="text-sm text-gray-500">
              Los usuarios deben ser creados manualmente por los administradores.
            </p>
            <div className="mt-6">
              <a 
                href="/sign-in"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-betis-green hover:bg-betis-green/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-betis-green"
              >
                Ir al Inicio de Sesión
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
