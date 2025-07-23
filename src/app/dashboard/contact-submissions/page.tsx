import { currentUser } from '@clerk/nextjs/server';
import { redirect } from 'next/navigation';
import { getUserContactSubmissions } from '@/lib/supabase';
import { MessageSquare, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { isFeatureEnabledAsync } from '@/lib/featureFlags';

export default async function UserContactSubmissionsPage() {
  const isAuthEnabled = await isFeatureEnabledAsync('showClerkAuth');
  
  if (!isAuthEnabled) {
    redirect('/');
  }

  const user = await currentUser();

  if (!user) {
    redirect('/sign-in');
  }

  const contactSubmissions = await getUserContactSubmissions(user.id);

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-black text-betis-black mb-6">Mis Mensajes de Contacto</h1>

        {contactSubmissions && contactSubmissions.length > 0 ? (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="space-y-4">
              {contactSubmissions.map((submission) => (
                <div key={submission.id} className="border-l-4 border-betis-green pl-4 py-2">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <p className="font-semibold text-gray-900">{submission.subject}</p>
                      <p className="text-sm text-gray-600 capitalize">{submission.type}</p>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{submission.message}</p>
                    </div>
                    <div className="text-right">
                      <span className={`text-xs px-2 py-1 rounded-full ${
                        submission.status === 'new' ? 'bg-blue-100 text-blue-800' :
                        submission.status === 'in progress' ? 'bg-yellow-100 text-yellow-800' :
                        submission.status === 'resolved' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {submission.status}
                      </span>
                      <p className="text-xs text-gray-400 mt-1">
                        {new Date(submission.created_at).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center py-8 bg-white rounded-lg shadow-md p-6">
            <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No has enviado ningún mensaje de contacto aún.</p>
            <Link 
              href="/contacto" 
              className="text-betis-green hover:text-betis-green/80 text-sm font-medium inline-flex items-center mt-2"
            >
              Enviar un mensaje <ExternalLink className="h-3 w-3 ml-1" />
            </Link>
          </div>
        )}
      </div>
    </div>
  );
}
