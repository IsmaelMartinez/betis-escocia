'use client';

import { useState, useEffect } from 'react';
import { User, Mail, MessageSquare, Users, Calendar, MapPin, Clock } from 'lucide-react';
import { FormSuccessMessage, FormErrorMessage, FormLoadingMessage } from '@/components/MessageComponent';
import Field, { ValidatedInput, ValidatedTextarea } from '@/components/Field';
import { useFormValidation, commonValidationRules } from '@/lib/formValidation';
import { useUser } from '@clerk/nextjs';
import { isFeatureEnabled } from '@/lib/featureFlags';
import { useRSVPData } from '@/hooks/useRSVPData';

export interface EventDetails {
  id?: number;
  title: string;
  date: Date;
  location: string;
  description?: string;
}

export interface RSVPWidgetProps {
  /** Event details to display */
  event: EventDetails;
  /** Display mode - inline shows widget directly, modal shows as overlay */
  displayMode?: 'inline' | 'modal';
  /** Show event details section */
  showEventDetails?: boolean;
  /** Show attendee count */
  showAttendeeCount?: boolean;
  /** Override attendee count (if not provided, will fetch from API) */
  attendeeCount?: number;
  /** Override current RSVP status (if not provided, will fetch from API for authenticated users) */
  currentRSVP?: {
    status: 'confirmed';
    attendees: number;
    message?: string;
  } | null;
  /** Success callback */
  onSuccess?: () => void;
  /** Error callback */
  onError?: (error: string) => void;
  /** Custom CSS classes */
  className?: string;
  /** Compact mode for smaller spaces */
  compact?: boolean;
  /** Disable hook data fetching (for Storybook/testing) */
  disableDataFetching?: boolean;
}

const rsvpValidationRules = {
  name: commonValidationRules.name,
  email: commonValidationRules.email,
  attendees: { required: true, min: 1, max: 50 },
  message: { ...commonValidationRules.message, required: false }
};

export default function RSVPWidget({
  event,
  displayMode = 'inline',
  showEventDetails = true,
  showAttendeeCount = true,
  attendeeCount: propAttendeeCount,
  currentRSVP: propCurrentRSVP,
  onSuccess,
  onError,
  className = '',
  compact = false,
  disableDataFetching = false
}: RSVPWidgetProps) {
  const { user } = useUser();
  const isAuthEnabled = isFeatureEnabled('show-clerk-auth');
  
  // Use hook for data fetching when not disabled (e.g., in Storybook)
  const {
    currentRSVP: hookCurrentRSVP,
    attendeeCount: hookAttendeeCount,
    isLoading: hookIsLoading,
    isSubmitting: hookIsSubmitting,
    error: hookError,
    submitError: hookSubmitError,
    submitRSVP,
    clearErrors
  } = useRSVPData({ 
    event, 
    enabled: !disableDataFetching 
  });
  
  // Use prop values if provided, otherwise use hook values
  const currentRSVP = propCurrentRSVP !== undefined ? propCurrentRSVP : hookCurrentRSVP;
  const attendeeCount = propAttendeeCount !== undefined ? propAttendeeCount : hookAttendeeCount;
  
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
    attendees: currentRSVP?.attendees || 1,
    message: currentRSVP?.message || '',
    whatsappInterest: false
  }, rsvpValidationRules);
  
  // Use hook states when data fetching is enabled, fallback to local state for Storybook/testing
  const [localIsSubmitting, setLocalIsSubmitting] = useState(false);
  const [localSubmitStatus, setLocalSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [localErrorMessage, setLocalErrorMessage] = useState('');
  const [isExpanded, setIsExpanded] = useState(!compact);
  
  // Determine which states to use
  const isSubmitting = disableDataFetching ? localIsSubmitting : hookIsSubmitting;
  const submitStatus = disableDataFetching ? localSubmitStatus : (hookSubmitError ? 'error' : 'idle');
  const errorMessage = disableDataFetching ? localErrorMessage : (hookSubmitError || hookError || '');
  const isLoading = disableDataFetching ? false : hookIsLoading;
  
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
    
    if (!disableDataFetching) {
      // Use the hook for submission
      clearErrors(); // Clear any previous errors
      
      const result = await submitRSVP({
        name: formData.name as string,
        email: formData.email as string,
        attendees: formData.attendees as number,
        message: formData.message as string,
        whatsappInterest: formData.whatsappInterest as boolean,
        matchId: event.id,
      });

      if (result.success) {
        reset();
        // Call success callback after a delay
        setTimeout(() => {
          onSuccess?.();
        }, 2000);
      } else {
        onError?.(result.message || 'Error desconocido');
      }
    } else {
      // Fallback for Storybook/testing - use local state management
      setLocalIsSubmitting(true);
      setLocalSubmitStatus('idle');

      try {
        const apiUrl = event.id ? `/api/rsvp?match=${event.id}` : '/api/rsvp';
        const submissionData = {
          ...formData,
          matchId: event.id,
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

        setLocalSubmitStatus('success');
        reset();
        
        // Call success callback after a delay
        setTimeout(() => {
          onSuccess?.();
        }, 2000);

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Error desconocido';
        setLocalSubmitStatus('error');
        setLocalErrorMessage(errorMsg);
        onError?.(errorMsg);
      } finally {
        setLocalIsSubmitting(false);
      }
    }
  };

  const handleInputChange = (field: string, value: string | number | boolean) => {
    updateField(field, value);
  };

  const handleBlur = (field: string) => {
    touchField(field);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('es-ES', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  const getStatusText = () => {
    return 'Confirmado';
  };

  const showSuccessState = disableDataFetching ? localSubmitStatus === 'success' : false; // Hook handles success internally
  
  if (showSuccessState) {
    return (
      <div className={`${displayMode === 'modal' ? 'p-6' : ''} ${className}`}>
        <FormSuccessMessage
          title="¡Confirmación Recibida!"
          message="Gracias por confirmar tu asistencia. Te esperamos en el Polwarth Tavern. Recordatorio: Llega 15 minutos antes del partido para asegurar sitio."
          className="text-center"
        />
      </div>
    );
  }

  // Show loading state when hook is initially loading data
  if (isLoading && !disableDataFetching) {
    return (
      <div className={`bg-white rounded-2xl shadow-xl border border-gray-200 p-6 ${className}`}>
        <div className="text-center">
          <FormLoadingMessage message="Cargando datos..." className="text-gray-600" />
        </div>
      </div>
    );
  }

  const widgetContent = (
    <div className={`bg-white rounded-2xl shadow-xl border border-gray-200 ${compact && !isExpanded ? 'p-4' : 'p-6'} ${className}`}>
      {/* Header */}
      <div className="text-center mb-6">
        <h3 className={`font-bold text-gray-900 mb-2 ${compact ? 'text-lg' : 'text-2xl'}`}>
          {currentRSVP ? 'Actualizar Confirmación' : 'Confirma tu Asistencia'}
        </h3>
        {!compact && (
          <p className="text-gray-600 text-sm">
            {currentRSVP ? 'Modifica tu confirmación anterior' : 'Rellena el formulario para que sepamos que vienes'}
          </p>
        )}
      </div>

      {/* Event Details */}
      {showEventDetails && (
        <div className="mb-6 p-4 bg-betis-green/10 border border-betis-green/20 rounded-lg">
          <h4 className="font-bold text-betis-black mb-2 flex items-center">
            <Calendar className="h-4 w-4 mr-2" />
            {event.title}
          </h4>
          <div className="space-y-1 text-sm text-gray-700">
            <div className="flex items-center">
              <Clock className="h-4 w-4 mr-2" />
              {formatDate(event.date)}
            </div>
            <div className="flex items-center">
              <MapPin className="h-4 w-4 mr-2" />
              {event.location}
            </div>
          </div>
          {event.description && (
            <p className="text-sm text-gray-600 mt-2">{event.description}</p>
          )}
          {showAttendeeCount && (
            <div className="mt-3 pt-3 border-t border-betis-green/20">
              <p className="text-sm font-medium text-betis-green">
                <Users className="h-4 w-4 inline mr-1" />
                {attendeeCount} personas confirmadas
              </p>
            </div>
          )}
        </div>
      )}

      {/* Current RSVP Status */}
      {currentRSVP && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            <strong>Estado actual:</strong> {getStatusText()} 
            {currentRSVP.attendees > 1 && ` (${currentRSVP.attendees} personas)`}
          </p>
        </div>
      )}

      {/* Auth Status */}
      {isAuthEnabled && user && (
        <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-sm text-green-800">
            ✓ Conectado como {user.firstName} {user.lastName}
          </p>
        </div>
      )}

      {/* Compact toggle */}
      {compact && !isExpanded && (
        <div className="text-center">
          <button
            onClick={() => setIsExpanded(true)}
            className="w-full bg-betis-green hover:bg-green-700 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200"
          >
            {currentRSVP ? 'Actualizar RSVP' : 'Confirmar Asistencia'}
          </button>
        </div>
      )}

      {/* Form */}
      {(!compact || isExpanded) && (
        <form onSubmit={handleSubmit} className="space-y-4">

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

          {/* Number of attendees - Number input instead of dropdown */}
          <Field
            label="¿Cuántos venís?"
            htmlFor="rsvp-attendees"
            required
            icon={<Users className="h-4 w-4" />}
            error={errors.attendees}
            touched={touched.attendees}
          >
            <ValidatedInput
              type="number"
              id="rsvp-attendees"
              name="attendees"
              required
              min={1}
              max={50}
              value={formData.attendees as number}
              onChange={(e) => handleInputChange('attendees', parseInt(e.target.value) || 1)}
              onBlur={() => handleBlur('attendees')}
              error={errors.attendees}
              touched={touched.attendees}
              data-testid="attendees-input"
              placeholder="Número de personas"
            />
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
              className="mt-1 h-4 w-4 text-betis-green border-gray-300 rounded focus:ring-betis-green"
            />
            <label htmlFor="whatsappInterest" className="text-sm text-gray-700">
              <strong>¿Te interesa unirte al grupo de WhatsApp?</strong>
              <br />
              <span className="text-gray-500">
                Recibe notificaciones sobre cambios de horario y eventos especiales.
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
          <div className="flex gap-2">
            {compact && isExpanded && (
              <button
                type="button"
                onClick={() => setIsExpanded(false)}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium transition-colors duration-200"
              >
                Cancelar
              </button>
            )}
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 bg-betis-green hover:bg-green-700 disabled:bg-gray-400 text-white py-3 px-4 rounded-lg font-medium transition-colors duration-200 disabled:cursor-not-allowed"
              data-testid="submit-rsvp"
            >
              {isSubmitting ? (
                <FormLoadingMessage message="Enviando..." className="text-white" />
              ) : (
                currentRSVP ? '✅ Actualizar Confirmación' : '✅ Confirmar Asistencia'
              )}
            </button>
          </div>
        </form>
      )}

      {(!compact || isExpanded) && (
        <div className="mt-4 text-center">
          <p className="text-xs text-gray-500">
            * Campos obligatorios. Tus datos solo se usan para organizar el evento.
          </p>
        </div>
      )}
    </div>
  );

  return displayMode === 'modal' ? (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="max-w-md w-full max-h-[90vh] overflow-y-auto">
        {widgetContent}
      </div>
    </div>
  ) : (
    widgetContent
  );
}