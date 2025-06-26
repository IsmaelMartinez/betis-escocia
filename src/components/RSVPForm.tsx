'use client';

import { useState } from 'react';
import { User, Mail, MessageSquare, CheckCircle, AlertCircle } from 'lucide-react';

interface RSVPFormProps {
  readonly onSuccess?: () => void;
}

export default function RSVPForm({ onSuccess }: RSVPFormProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    attendees: 1,
    message: '',
    whatsappInterest: false
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const response = await fetch('/api/rsvp', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Error al enviar la confirmación');
      }

      setSubmitStatus('success');
      setFormData({
        name: '',
        email: '',
        attendees: 1,
        message: '',
        whatsappInterest: false
      });
      
      // Call success callback after a delay
      setTimeout(() => {
        onSuccess?.();
      }, 2000);

    } catch (error) {
      setSubmitStatus('error');
      setErrorMessage(error instanceof Error ? error.message : 'Error desconocido');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value
    }));
  };

  if (submitStatus === 'success') {
    return (
      <div className="bg-green-50 border-2 border-green-200 rounded-2xl p-8 text-center">
        <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-2xl font-bold text-green-800 mb-4">
          ¡Confirmación Recibida!
        </h3>
        <p className="text-green-700 text-lg mb-6">
          Gracias por confirmar tu asistencia. Te esperamos en el Polwarth Tavern.
        </p>
        <div className="bg-white rounded-lg p-4 border border-green-200">
          <p className="text-sm text-gray-600">
            <strong>Recordatorio:</strong> Llega 30 minutos antes del partido para asegurar sitio.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-200">
      <div className="text-center mb-8">
        <h3 className="text-2xl font-bold text-gray-900 mb-2">
          Confirma tu Asistencia
        </h3>
        <p className="text-gray-600">
          Rellena el formulario para que sepamos que vienes
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
            <User className="h-4 w-4 inline mr-2" />
            Nombre completo *
          </label>
          <input
            type="text"
            id="name"
            name="name"
            required
            value={formData.name}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-betis-green focus:border-transparent"
            placeholder="Tu nombre y apellido"
          />
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
            <Mail className="h-4 w-4 inline mr-2" />
            Email *
          </label>
          <input
            type="email"
            id="email"
            name="email"
            required
            value={formData.email}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-betis-green focus:border-transparent"
            placeholder="tu@email.com"
          />
        </div>

        {/* Number of attendees */}
        <div>
          <label htmlFor="attendees" className="block text-sm font-medium text-gray-700 mb-2">
            ¿Cuántos venís? *
          </label>
          <select
            id="attendees"
            name="attendees"
            required
            value={formData.attendees}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-betis-green focus:border-transparent"
          >
            <option value={1}>Solo yo</option>
            <option value={2}>2 personas</option>
            <option value={3}>3 personas</option>
            <option value={4}>4 personas</option>
            <option value={5}>5+ personas</option>
          </select>
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
            <MessageSquare className="h-4 w-4 inline mr-2" />
            Mensaje adicional (opcional)
          </label>
          <textarea
            id="message"
            name="message"
            rows={3}
            value={formData.message}
            onChange={handleInputChange}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-betis-green focus:border-transparent"
            placeholder="¿Alguna pregunta o comentario?"
          />
        </div>

        {/* WhatsApp Interest */}
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="whatsappInterest"
            name="whatsappInterest"
            checked={formData.whatsappInterest}
            onChange={handleInputChange}
            className="mt-1 h-5 w-5 text-betis-green border-gray-300 rounded focus:ring-betis-green"
          />
          <label htmlFor="whatsappInterest" className="text-sm text-gray-700">
            <strong>¿Te interesa unirte al grupo de WhatsApp?</strong>
            <br />
            <span className="text-gray-500">
              Recibe notificaciones sobre cambios de horario, eventos especiales y más.
            </span>
          </label>
        </div>

        {/* Error Message */}
        {submitStatus === 'error' && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700 text-sm">{errorMessage}</p>
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-betis-green hover:bg-green-700 disabled:bg-gray-400 text-white py-4 px-6 rounded-lg font-bold text-lg transition-colors duration-200 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center space-x-2">
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Enviando...</span>
            </span>
          ) : (
            '✅ Confirmar Asistencia'
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          * Campos obligatorios. Tus datos solo se usan para organizar el evento.
        </p>
      </div>
    </div>
  );
}
