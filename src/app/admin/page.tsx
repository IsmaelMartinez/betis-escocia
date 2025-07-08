'use client';

import { useState, useEffect } from 'react';
import { supabase, RSVP, ContactSubmission } from '@/lib/supabase';
import { Users, Mail, Calendar, TrendingUp, Download, RefreshCw } from 'lucide-react';
import Card, { CardHeader, CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import LoadingSpinner from '@/components/LoadingSpinner';
import MessageComponent from '@/components/MessageComponent';

interface AdminStats {
  totalRSVPs: number;
  totalAttendees: number;
  totalContacts: number;
  recentRSVPs: RSVP[];
  recentContacts: ContactSubmission[];
}

export default function AdminPage() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      setError(null);
      
      // Fetch RSVP data
      const { data: rsvpData, error: rsvpError } = await supabase
        .from('rsvps')
        .select('*')
        .order('created_at', { ascending: false });

      if (rsvpError) throw rsvpError;

      // Fetch contact data
      const { data: contactData, error: contactError } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (contactError) throw contactError;

      // Calculate stats
      const totalRSVPs = rsvpData?.length || 0;
      const totalAttendees = rsvpData?.reduce((sum, rsvp) => sum + rsvp.attendees, 0) || 0;
      const totalContacts = contactData?.length || 0;
      const recentRSVPs = rsvpData?.slice(0, 5) || [];
      const recentContacts = contactData?.slice(0, 5) || [];

      setStats({
        totalRSVPs,
        totalAttendees,
        totalContacts,
        recentRSVPs,
        recentContacts
      });
    } catch (err) {
      console.error('Error fetching admin stats:', err);
      setError('Error al cargar las estadísticas del panel de administración');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchStats();
  };

  const exportRSVPs = async () => {
    try {
      const { data, error } = await supabase
        .from('rsvps')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const csvContent = [
        'Name,Email,Attendees,Match Date,Message,WhatsApp Interest,Created At',
        ...(data || []).map(rsvp => 
          `"${rsvp.name}","${rsvp.email}",${rsvp.attendees},"${rsvp.match_date}","${rsvp.message || ''}",${rsvp.whatsapp_interest},"${rsvp.created_at}"`
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `rsvps-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error exporting RSVPs:', err);
    }
  };

  const exportContacts = async () => {
    try {
      const { data, error } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      const csvContent = [
        'Name,Email,Phone,Type,Subject,Message,Status,Created At',
        ...(data || []).map(contact => 
          `"${contact.name}","${contact.email}","${contact.phone || ''}","${contact.type}","${contact.subject}","${contact.message}","${contact.status}","${contact.created_at}"`
        )
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', `contacts-${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      console.error('Error exporting contacts:', err);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" label="Cargando panel de administración..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <MessageComponent type="error" message={error} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-black text-betis-black">Panel de Administración</h1>
              <p className="text-gray-600 mt-2">Gestión de RSVPs y contactos de la Peña Bética</p>
            </div>
            <Button
              onClick={handleRefresh}
              variant="outline"
              leftIcon={<RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />}
              isLoading={refreshing}
            >
              Actualizar
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="hover-lift">
            <CardBody className="text-center">
              <div className="mx-auto w-12 h-12 bg-betis-green/10 rounded-lg flex items-center justify-center mb-4">
                <Users className="h-6 w-6 text-betis-green" />
              </div>
              <div className="text-3xl font-black text-betis-black mb-2">{stats?.totalRSVPs}</div>
              <div className="text-sm text-gray-600">RSVPs Totales</div>
            </CardBody>
          </Card>

          <Card className="hover-lift">
            <CardBody className="text-center">
              <div className="mx-auto w-12 h-12 bg-betis-green/10 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="h-6 w-6 text-betis-green" />
              </div>
              <div className="text-3xl font-black text-betis-black mb-2">{stats?.totalAttendees}</div>
              <div className="text-sm text-gray-600">Asistentes Confirmados</div>
            </CardBody>
          </Card>

          <Card className="hover-lift">
            <CardBody className="text-center">
              <div className="mx-auto w-12 h-12 bg-betis-green/10 rounded-lg flex items-center justify-center mb-4">
                <Mail className="h-6 w-6 text-betis-green" />
              </div>
              <div className="text-3xl font-black text-betis-black mb-2">{stats?.totalContacts}</div>
              <div className="text-sm text-gray-600">Mensajes de Contacto</div>
            </CardBody>
          </Card>
        </div>

        {/* Export Actions */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold text-betis-black">Exportar Datos</h2>
            </CardHeader>
            <CardBody>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={exportRSVPs}
                  variant="primary"
                  leftIcon={<Download className="h-4 w-4" />}
                >
                  Exportar RSVPs (CSV)
                </Button>
                <Button
                  onClick={exportContacts}
                  variant="secondary"
                  leftIcon={<Download className="h-4 w-4" />}
                >
                  Exportar Contactos (CSV)
                </Button>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* Recent Data */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Recent RSVPs */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold text-betis-black">RSVPs Recientes</h2>
            </CardHeader>
            <CardBody>
              {stats?.recentRSVPs.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No hay RSVPs recientes</p>
              ) : (
                <div className="space-y-4">
                  {stats?.recentRSVPs.map((rsvp) => (
                    <div key={rsvp.id} className="border-l-4 border-betis-green bg-gray-50 p-4 rounded-r-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-semibold text-betis-black">{rsvp.name}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(rsvp.created_at).toLocaleDateString('es-ES')}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mb-1">{rsvp.email}</div>
                      <div className="text-sm">
                        <span className="font-medium">Asistentes:</span> {rsvp.attendees} | 
                        <span className="font-medium"> Partido:</span> {new Date(rsvp.match_date).toLocaleDateString('es-ES')}
                      </div>
                      {rsvp.message && (
                        <div className="text-sm text-gray-600 mt-2 italic">"{rsvp.message}"</div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>

          {/* Recent Contacts */}
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold text-betis-black">Contactos Recientes</h2>
            </CardHeader>
            <CardBody>
              {stats?.recentContacts.length === 0 ? (
                <p className="text-gray-500 text-center py-4">No hay contactos recientes</p>
              ) : (
                <div className="space-y-4">
                  {stats?.recentContacts.map((contact) => (
                    <div key={contact.id} className="border-l-4 border-betis-green bg-gray-50 p-4 rounded-r-lg">
                      <div className="flex justify-between items-start mb-2">
                        <div className="font-semibold text-betis-black">{contact.name}</div>
                        <div className="text-sm text-gray-500">
                          {new Date(contact.created_at).toLocaleDateString('es-ES')}
                        </div>
                      </div>
                      <div className="text-sm text-gray-600 mb-1">{contact.email}</div>
                      <div className="text-sm mb-2">
                        <span className="inline-block bg-betis-green/10 text-betis-green px-2 py-1 rounded text-xs font-medium mr-2">
                          {contact.type}
                        </span>
                        <span className="inline-block bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-medium">
                          {contact.status}
                        </span>
                      </div>
                      <div className="text-sm font-medium text-gray-700 mb-1">{contact.subject}</div>
                      <div className="text-sm text-gray-600 truncate">{contact.message}</div>
                    </div>
                  ))}
                </div>
              )}
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
