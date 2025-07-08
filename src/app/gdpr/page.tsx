'use client';

import { useState } from 'react';
import { Shield, Download, Trash2, Mail } from 'lucide-react';
import Card, { CardHeader, CardBody } from '@/components/ui/Card';
import Button from '@/components/ui/Button';
import { ValidatedInput } from '@/components/Field';
import MessageComponent from '@/components/MessageComponent';
import type { RSVP, ContactSubmission } from '@/lib/supabase';

export default function GDPRPage() {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [userData, setUserData] = useState<{ rsvps: RSVP[]; contacts: ContactSubmission[] } | null>(null);

  const handleDataAccess = async () => {
    if (!email) {
      setMessage({ type: 'error', text: 'Por favor, introduce tu email' });
      return;
    }

    setLoading(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/gdpr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          requestType: 'access'
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setUserData(result.data);
        setMessage({ 
          type: 'success', 
          text: 'Datos recuperados exitosamente. Puedes ver y descargar tu información a continuación.' 
        });
      } else {
        setMessage({ type: 'error', text: result.error || 'Error al acceder a los datos' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Error de conexión. Por favor, inténtalo de nuevo.' });
    } finally {
      setLoading(false);
    }
  };

  const handleDataDeletion = async () => {
    if (!email) {
      setMessage({ type: 'error', text: 'Por favor, introduce tu email' });
      return;
    }

    if (!confirm('¿Estás seguro de que quieres eliminar todos tus datos? Esta acción no se puede deshacer.')) {
      return;
    }

    setLoading(true);
    setMessage(null);
    
    try {
      const response = await fetch('/api/gdpr', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email,
          requestType: 'deletion'
        }),
      });

      const result = await response.json();
      
      if (result.success) {
        setUserData(null);
        setMessage({ 
          type: 'success', 
          text: 'Todos tus datos han sido eliminados exitosamente de nuestros sistemas.' 
        });
        setEmail('');
      } else {
        setMessage({ type: 'error', text: result.error || 'Error al eliminar los datos' });
      }
    } catch {
      setMessage({ type: 'error', text: 'Error de conexión. Por favor, inténtalo de nuevo.' });
    } finally {
      setLoading(false);
    }
  };

  const downloadData = () => {
    if (!userData) return;

    const dataStr = JSON.stringify(userData, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `mi-datos-betis-escocia-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

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

        {/* GDPR Information */}
        <div className="mb-8">
          <Card>
            <CardHeader>
              <h2 className="text-xl font-bold text-betis-black">Tus Derechos GDPR</h2>
            </CardHeader>
            <CardBody>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-betis-green mb-2">Derecho de Acceso</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Puedes solicitar una copia de todos los datos personales que tenemos sobre ti.
                  </p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Confirmaciones RSVP</li>
                    <li>• Mensajes de contacto</li>
                    <li>• Fechas de creación</li>
                  </ul>
                </div>
                <div>
                  <h3 className="font-semibold text-betis-green mb-2">Derecho al Olvido</h3>
                  <p className="text-sm text-gray-600 mb-4">
                    Puedes solicitar la eliminación completa de tus datos personales.
                  </p>
                  <ul className="text-xs text-gray-500 space-y-1">
                    <li>• Eliminación permanente</li>
                    <li>• No se puede deshacer</li>
                    <li>• Efectivo inmediatamente</li>
                  </ul>
                </div>
              </div>
            </CardBody>
          </Card>
        </div>

        {/* GDPR Actions */}
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold text-betis-black">Gestionar Mis Datos</h2>
          </CardHeader>
          <CardBody>
            <div className="space-y-6">
              {/* Email Input */}
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                  Email asociado a tus datos
                </label>
                <ValidatedInput
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="tu.email@ejemplo.com"
                  disabled={loading}
                />
              </div>

              {/* Message Display */}
              {message && (
                <MessageComponent
                  type={message.type}
                  message={message.text}
                />
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Button
                  onClick={handleDataAccess}
                  variant="primary"
                  leftIcon={<Download className="h-4 w-4" />}
                  isLoading={loading}
                  disabled={!email || loading}
                >
                  Acceder a Mis Datos
                </Button>
                
                <Button
                  onClick={handleDataDeletion}
                  variant="danger"
                  leftIcon={<Trash2 className="h-4 w-4" />}
                  isLoading={loading}
                  disabled={!email || loading}
                >
                  Eliminar Mis Datos
                </Button>
              </div>

              {/* Data Display */}
              {userData && (
                <div className="mt-8 p-6 bg-gray-50 rounded-lg border">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-semibold text-betis-black">Tus Datos</h3>
                    <Button
                      onClick={downloadData}
                      variant="outline"
                      size="sm"
                      leftIcon={<Download className="h-4 w-4" />}
                    >
                      Descargar JSON
                    </Button>
                  </div>
                  
                  <div className="space-y-4">
                    {/* RSVPs */}
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">
                        Confirmaciones RSVP ({userData.rsvps?.length || 0})
                      </h4>
                      {userData.rsvps?.length > 0 ? (
                        <div className="space-y-2">
                          {userData.rsvps.map((rsvp: RSVP, index: number) => (
                            <div key={index} className="bg-white p-3 rounded border text-sm">
                              <div><strong>Nombre:</strong> {rsvp.name}</div>
                              <div><strong>Asistentes:</strong> {rsvp.attendees}</div>
                              <div><strong>Fecha del partido:</strong> {new Date(rsvp.match_date).toLocaleDateString()}</div>
                              <div><strong>Creado:</strong> {new Date(rsvp.created_at).toLocaleDateString()}</div>
                              {rsvp.message && <div><strong>Mensaje:</strong> {rsvp.message}</div>}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No se encontraron confirmaciones RSVP</p>
                      )}
                    </div>

                    {/* Contacts */}
                    <div>
                      <h4 className="font-medium text-gray-700 mb-2">
                        Mensajes de Contacto ({userData.contacts?.length || 0})
                      </h4>
                      {userData.contacts?.length > 0 ? (
                        <div className="space-y-2">
                          {userData.contacts.map((contact: ContactSubmission, index: number) => (
                            <div key={index} className="bg-white p-3 rounded border text-sm">
                              <div><strong>Nombre:</strong> {contact.name}</div>
                              <div><strong>Tipo:</strong> {contact.type}</div>
                              <div><strong>Asunto:</strong> {contact.subject}</div>
                              <div><strong>Creado:</strong> {new Date(contact.created_at).toLocaleDateString()}</div>
                              {contact.phone && <div><strong>Teléfono:</strong> {contact.phone}</div>}
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-sm">No se encontraron mensajes de contacto</p>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </CardBody>
        </Card>

        {/* Contact Information */}
        <div className="mt-8 text-center">
          <Card>
            <CardBody>
              <div className="flex justify-center mb-4">
                <Mail className="h-6 w-6 text-betis-green" />
              </div>
              <h3 className="font-semibold text-betis-black mb-2">¿Necesitas Ayuda?</h3>
              <p className="text-sm text-gray-600 mb-4">
                Si tienes preguntas sobre la protección de datos o necesitas asistencia adicional, 
                puedes contactarnos directamente.
              </p>
              <a 
                href="mailto:admin@betis-escocia.com" 
                className="text-betis-green hover:text-betis-green-dark font-medium"
              >
                admin@betis-escocia.com
              </a>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
}
