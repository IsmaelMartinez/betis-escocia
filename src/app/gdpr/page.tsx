'use client';

export const dynamic = 'force-dynamic';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@clerk/nextjs';
import { Shield, Mail } from 'lucide-react';
import Card, { CardBody } from '@/components/ui/Card';


export default function GDPRPage() {
  const { isSignedIn } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isSignedIn) {
      // Redirect authenticated users to their profile dashboard
      router.push('/user-dashboard'); // Assuming /user-dashboard is the path to the user dashboard
    }
  }, [isSignedIn, router]);

  if (isSignedIn === undefined) {
    // Render a loading state while Clerk is initializing
    return (
      <div className="min-h-screen bg-gray-50 py-8 flex items-center justify-center">
        <p>Cargando...</p>
      </div>
    );
  }

  if (isSignedIn) {
    // This part should ideally not be reached due to the redirect in useEffect
    // but as a fallback, we can render nothing or a redirect message
    return null;
  }

  // Content for unauthenticated users
  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="bg-betis-green/10 p-3 rounded-full">
              <Shield className="h-8 w-8 text-betis-green" />
            </div>
          </div>
          <h1 className="text-3xl font-black text-betis-black mb-4">
            Protección de Datos Personales
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            En cumplimiento del Reglamento General de Protección de Datos (GDPR),
            puedes acceder a tus datos personales o solicitar su eliminación.
          </p>
        </div>

        {/* Message for unauthenticated users */}
        <div className="mt-8 text-center">
          <Card>
            <CardBody>
              <div className="flex justify-center mb-4">
                <Mail className="h-6 w-6 text-betis-green" />
              </div>
              <h3 className="font-semibold text-betis-black mb-2">Acceso a tus Datos GDPR</h3>
              <p className="text-sm text-gray-600 mb-4">
                Para poder consultar y borrar tus datos necesitas estar logeado.
                Ponte en contact con nosotros utilizando el formulario si no tienes sesión de usuario pero tienes datos en nuestro sistema.
              </p>
              <p className="text-xs text-gray-500 mb-4">
                **Información sobre retención de datos:**
                Both RSVPs and contact information are automatically deleted after 3 months for GDPR compliance.
              </p>
              <a
                href="/contacto" // Assuming /contacto is the path to the contact form
                className="text-betis-green hover:text-betis-green-dark font-medium"
              >
                Ir al formulario de contacto
              </a>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}