import { Calendar, MessageSquare, PieChart, ExternalLink } from 'lucide-react';
import Link from 'next/link';
import { User } from '@clerk/nextjs/server';
import { RSVP, ContactSubmission } from '@/lib/supabase';

interface Counts {
  rsvpCount: number;
  contactCount: number;
  totalSubmissions: number;
}

interface DashboardDisplayProps {
  user: {
    firstName: string | null;
    lastName: string | null;
    emailAddresses: Array<{ emailAddress: string }>;
    createdAt: number | null;
    lastSignInAt: number | null;
  }; // Clerk user object with only used properties
  rsvps: RSVP[] | null; // User RSVPs
  contactSubmissions: ContactSubmission[] | null; // User contact submissions
  counts: Counts; // Submission counts
}

export default function DashboardDisplay({
  user,
  rsvps,
  contactSubmissions,
  counts,
}: DashboardDisplayProps) {
  const userEmail = user.emailAddresses[0]?.emailAddress;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* User Info - Display only, editing is in UserProfile tab */}
      <section className="pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Información de la Cuenta</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-600">Nombre</p>
                <p className="text-gray-900">{user.firstName || 'N/A'} {user.lastName || ''}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Email</p>
                <p className="text-gray-900">{userEmail}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Miembro desde</p>
                <p className="text-gray-900">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Último acceso</p>
                <p className="text-gray-900">
                  {user.lastSignInAt ? new Date(user.lastSignInAt).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Cards */}
      <section className="py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Confirmaciones RSVP</p>
                  <p className="text-3xl font-bold text-betis-green">{counts?.rsvpCount || 0}</p>
                </div>
                <Calendar className="h-12 w-12 text-betis-green opacity-20" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Mensajes Enviados</p>
                  <p className="text-3xl font-bold text-betis-green">{counts?.contactCount || 0}</p>
                </div>
                <MessageSquare className="h-12 w-12 text-betis-green opacity-20" />
              </div>
            </div>
            
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">Total Interacciones</p>
                  <p className="text-3xl font-bold text-betis-green">{counts?.totalSubmissions || 0}</p>
                </div>
                <PieChart className="h-12 w-12 text-betis-green opacity-20" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Content Grid */}
      <section className="pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            
            {/* RSVP History */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <Calendar className="h-5 w-5 mr-2 text-betis-green" />
                Historial de RSVPs
              </h2>
              
              {rsvps && rsvps.length > 0 ? (
                <div className="space-y-4">
                  {rsvps.slice(0, 5).map((rsvp) => (
                    <div key={rsvp.id} className="border-l-4 border-betis-green pl-4 py-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{rsvp.match_date}</p>
                          <p className="text-sm text-gray-600">{rsvp.attendees} asistentes</p>
                          {rsvp.message && (
                          <p className="text-sm text-gray-500 mt-1">&ldquo;{rsvp.message}&rdquo;</p>
                          )}
                        </div>
                        <span className="text-xs text-gray-400">
                          {new Date(rsvp.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}
                  {rsvps.length > 5 && (
                    <p className="text-sm text-gray-500 text-center pt-2">
                      y {rsvps.length - 5} más...
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Calendar className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No hay RSVPs registrados</p>
                  <Link 
                    href="/rsvp" 
                    className="text-betis-green hover:text-betis-green/80 text-sm font-medium inline-flex items-center mt-2"
                  >
                    Confirmar asistencia <ExternalLink className="h-3 w-3 ml-1" />
                  </Link>
                </div>
              )}
            </div>

            {/* Contact History */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <MessageSquare className="h-5 w-5 mr-2 text-betis-green" />
                Historial de Mensajes
              </h2>
              
              {contactSubmissions && contactSubmissions.length > 0 ? (
                <div className="space-y-4">
                  {contactSubmissions.slice(0, 5).map((submission) => (
                    <div key={submission.id} className="border-l-4 border-betis-green pl-4 py-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium text-gray-900">{submission.subject}</p>
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
                  {contactSubmissions.length > 5 && (
                    <p className="text-sm text-gray-500 text-center pt-2">
                      <Link 
                        href="/dashboard/contact-submissions" 
                        className="text-betis-green hover:text-betis-green/80 text-sm font-medium inline-flex items-center"
                      >
                        Ver todos los mensajes <ExternalLink className="h-3 w-3 ml-1" />
                      </Link>
                    </p>
                  )}
                </div>
              ) : (
                <div className="text-center py-8">
                  <MessageSquare className="h-12 w-12 text-gray-300 mx-auto mb-4" />
                  <p className="text-gray-500">No hay mensajes enviados</p>
                  <Link 
                    href="/contacto" 
                    className="text-betis-green hover:text-betis-green/80 text-sm font-medium inline-flex items-center mt-2"
                  >
                    Enviar mensaje <ExternalLink className="h-3 w-3 ml-1" />
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="pb-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-betis-green text-white rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Acciones Rápidas</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Link 
                href="/rsvp" 
                className="bg-white/20 hover:bg-white/30 text-white p-4 rounded-lg transition-colors inline-flex items-center"
              >
                <Calendar className="h-5 w-5 mr-2" />
                Confirmar Asistencia
              </Link>
              <Link 
                href="/contacto" 
                className="bg-white/20 hover:bg-white/30 text-white p-4 rounded-lg transition-colors inline-flex items-center"
              >
                <MessageSquare className="h-5 w-5 mr-2" />
                Enviar Mensaje
              </Link>
              <Link 
                href="/partidos" 
                className="bg-white/20 hover:bg-white/30 text-white p-4 rounded-lg transition-colors inline-flex items-center"
              >
                <ExternalLink className="h-5 w-5 mr-2" />
                Ver Partidos
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}