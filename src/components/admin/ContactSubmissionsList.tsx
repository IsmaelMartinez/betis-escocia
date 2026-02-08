import React from 'react';
import { ContactSubmission } from '@/lib/api/supabase';
import Card, { CardBody } from '@/components/ui/Card';
import MessageComponent from '@/components/MessageComponent';
import LoadingSpinner from '@/components/LoadingSpinner';

interface ContactSubmissionsListProps {
  submissions: ContactSubmission[];
  onUpdateStatus: (id: number, status: ContactSubmission['status']) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

const ContactSubmissionsList: React.FC<ContactSubmissionsListProps> = ({
  submissions,
  onUpdateStatus,
  isLoading,
  error,
}) => {

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" label="Cargando contactos..." />
      </div>
    );
  }

  if (error) {
    return <MessageComponent type="error" message={error} />;
  }

  return (
    <div className="space-y-6">
      {submissions.length === 0 ? (
        <MessageComponent type="info" message="No hay contactos para mostrar con el filtro actual." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {submissions.map((contact) => (
            <Card key={contact.id} className="hover-lift">
              <CardBody>
                <div className="flex justify-between items-start mb-2">
                  <div className="font-semibold text-betis-black">{contact.name}</div>
                  <div className="text-sm text-gray-500">
                    {new Date(contact.created_at).toLocaleDateString('es-ES')}
                  </div>
                </div>
                <div className="text-sm text-gray-600 mb-1">{contact.email}</div>
                {contact.phone && <div className="text-sm text-gray-600 mb-1">Teléfono: {contact.phone}</div>}
                <div className="text-sm mb-2">
                  <select
                    value={contact.status}
                    onChange={(e) => onUpdateStatus(contact.id, e.target.value as ContactSubmission['status'])}
                    className="inline-block bg-gray-100 text-gray-800 px-2 py-1 rounded text-xs font-medium mr-2 focus:outline-none focus:ring-2 focus:ring-betis-green"
                  >
                    <option value="new">Nuevo</option>
                    <option value="in progress">En Progreso</option>
                    <option value="resolved">Resuelto</option>
                  </select>
                  <span className="inline-block bg-gray-200 text-gray-700 px-2 py-1 rounded text-xs font-medium">
                    {contact.type}
                  </span>
                </div>
                <div className="text-sm font-medium text-gray-700 mb-1">Asunto: {contact.subject}</div>
                <div className="text-sm text-gray-600">Mensaje: {contact.message}</div>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ContactSubmissionsList;
