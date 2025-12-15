'use client';

import { useState, useEffect } from 'react';
import { User, Mail, MessageSquare, Users } from 'lucide-react';
import { FormSuccessMessage, FormErrorMessage, FormLoadingMessage } from '@/components/MessageComponent';
import Field, { ValidatedInput, ValidatedSelect, ValidatedTextarea } from '@/components/Field';
import { useFormValidation, commonValidationRules } from '@/lib/formValidation';
import { useUser } from '@clerk/nextjs';
import { isFeatureEnabled } from '@/lib/featureFlags';

interface RSVPFormProps {
  readonly onSuccess?: () => void;
  readonly selectedMatchId?: number;
}

const rsvpValidationRules = {
  name: commonValidationRules.name,
  email: commonValidationRules.email,
  attendees: { required: true },
  message: { ...commonValidationRules.message, required: false }
};

export default function RSVPForm({ onSuccess, selectedMatchId }: RSVPFormProps) {
  const { user } = useUser();
  const isAuthEnabled = isFeatureEnabled('show-clerk-auth');
  
  const {
    data: formData,
    errors,
    touched,
    updateField,
    touchField,
    validateAll,
    reset
  } = useFormValidation({
    name: '',
    email: '',
    attendees: 1,
    message: '',
    whatsappInterest: false
  }, rsvpValidationRules);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');
  
  // Pre-fill form with user data when authenticated
  useEffect(() => {
    if (isAuthEnabled && user) {
      const userName = user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : user.firstName || '';
      const userEmail = user.emailAddresses[0]?.emailAddress || '';
      
      if (userName) updateField('name', userName);
      if (userEmail) updateField('email', userEmail);
    }
  }, [user, isAuthEnabled, updateField]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const validation = validateAll();
    if (!validation.isValid) {
      return;
    }
    
    setIsSubmitting(true);
    setSubmitStatus('idle');

    try {
      const apiUrl = selectedMatchId ? `/api/rsvp?match=${selectedMatchId}` : '/api/rsvp';
      const submissionData = {
        ...formData,
        matchId: selectedMatchId,
        ...(isAuthEnabled && user ? { userId: user.id } : {})
      };
      
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        throw new Error('Error al enviar la confirmación');
      }

      setSubmitStatus('success');
      reset();
      
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

  const handleInputChange = (field: string, value: string | number | boolean) => {
    updateField(field, value);
  };

  const handleBlur = (field: string) => {
    touchField(field);
  };

  if (submitStatus === 'success') {
    return (
      <FormSuccessMessage
        title="¡Confirmación Recibida!"
        message="Gracias por confirmar tu asistencia. Te esperamos en el Polwarth Tavern. Recordatorio: Llega 15 minutos antes del partido para asegurar sitio."
        className="text-center"
      />
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
        {isAuthEnabled && user && (
          <div className="mt-4 p-3 bg-betis-verde-light border border-betis-verde/20 rounded-lg">
            <p className="text-sm text-betis-verde-dark">
              ✓ Conectado como {user.firstName} {user.lastName}
            </p>
            <p className="text-xs text-betis-verde mt-1">
              Tus datos se han rellenado automáticamente
            </p>
          </div>
        )}
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name */}
        <Field
          label="Nombre completo"
          htmlFor="rsvp-name"
          required
          icon={<User className="h-4 w-4" />}
          error={errors.name}
          touched={touched.name}
        >
          <ValidatedInput
            type="text"
            id="rsvp-name"
            name="name"
            required
            value={formData.name as string}
            onChange={(e) => handleInputChange('name', e.target.value)}
            onBlur={() => handleBlur('name')}
            placeholder="Tu nombre y apellido"
            error={errors.name}
            touched={touched.name}
            disabled={!!(isAuthEnabled && user)}
            data-testid="name-input"
          />
        </Field>

        {/* Email */}
        <Field
          label="Email"
          htmlFor="rsvp-email"
          required
          icon={<Mail className="h-4 w-4" />}
          error={errors.email}
          touched={touched.email}
        >
          <ValidatedInput
            type="email"
            id="rsvp-email"
            name="email"
            required
            value={formData.email as string}
            onChange={(e) => handleInputChange('email', e.target.value)}
            onBlur={() => handleBlur('email')}
            placeholder="tu@email.com"
            error={errors.email}
            touched={touched.email}
            disabled={!!(isAuthEnabled && user)}
            data-testid="email-input"
          />
        </Field>

        {/* Number of attendees */}
        <Field
          label="¿Cuántos venís?"
          htmlFor="rsvp-attendees"
          required
          icon={<Users className="h-4 w-4" />}
          error={errors.attendees}
          touched={touched.attendees}
        >
          <ValidatedSelect
            id="rsvp-attendees"
            name="attendees"
            required
            value={formData.attendees as number}
            onChange={(e) => handleInputChange('attendees', parseInt(e.target.value))}
            onBlur={() => handleBlur('attendees')}
            error={errors.attendees}
            touched={touched.attendees}
            data-testid="attendees-select"
          >
            <option value={1}>Solo yo</option>
            <option value={2}>2 personas</option>
            <option value={3}>3 personas</option>
            <option value={4}>4 personas</option>
            <option value={5}>5+ personas</option>
          </ValidatedSelect>
        </Field>

        {/* Message */}
        <Field
          label="Mensaje adicional (opcional)"
          htmlFor="rsvp-message"
          icon={<MessageSquare className="h-4 w-4" />}
          error={errors.message}
          touched={touched.message}
        >
          <ValidatedTextarea
            id="rsvp-message"
            name="message"
            rows={3}
            value={formData.message as string}
            onChange={(e) => handleInputChange('message', e.target.value)}
            onBlur={() => handleBlur('message')}
            placeholder="¿Alguna pregunta o comentario?"
            error={errors.message}
            touched={touched.message}
            data-testid="message-textarea"
          />
        </Field>

        {/* WhatsApp Interest */}
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="whatsappInterest"
            name="whatsappInterest"
            checked={formData.whatsappInterest as boolean}
            onChange={(e) => handleInputChange('whatsappInterest', e.target.checked)}
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
          <FormErrorMessage 
            message={errorMessage || 'Error al enviar la confirmación. Por favor, inténtalo de nuevo.'}
          />
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-betis-verde hover:bg-betis-verde-dark disabled:bg-gray-400 text-white py-4 px-6 rounded-lg font-bold text-lg transition-colors duration-200 disabled:cursor-not-allowed"
          data-testid="submit-rsvp"
        >
          {isSubmitting ? (
            <FormLoadingMessage message="Enviando confirmación..." className="text-white" />
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
