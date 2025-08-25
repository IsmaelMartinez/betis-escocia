'use client';

export const dynamic = 'force-dynamic';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { 
  Send, 
  MessageSquare, 
  UserPlus, 
  Camera, 
  MessageCircle, 
  HelpCircle
} from 'lucide-react';
import { FormSuccessMessage, FormErrorMessage, FormLoadingMessage } from '@/components/MessageComponent';
import { useUser } from '@clerk/nextjs';
import LoadingSpinner from '@/components/LoadingSpinner';

interface ContactFormData {
  name: string;
  email: string;
  phone?: string;
  type: 'general' | 'rsvp' | 'photo' | 'whatsapp' | 'feedback';
  subject: string;
  message: string;
}

const formTypes = [
  {
    id: 'general' as const,
    name: 'Consulta General',
    description: 'Preguntas generales sobre la peña',
    icon: MessageSquare,
    color: 'bg-blue-500',
    feature: null // Always enabled
  },
  {
    id: 'rsvp' as const,
    name: 'Eventos y RSVP',
    description: 'Dudas sobre eventos y confirmaciones',
    icon: UserPlus,
    color: 'bg-green-500',
    feature: null // Always enabled
  },
  {
  id: 'photo' as const,
    name: 'Fotos y Galería',
    description: 'Envío de fotos o problemas con la galería',
    icon: Camera,
    color: 'bg-pink-500',
    feature: null // Always enabled
  },
  {
    id: 'whatsapp' as const,
    name: 'Unirse a WhatsApp',
    description: 'Solicitar invitación al grupo de WhatsApp',
    icon: MessageCircle,
    color: 'bg-green-600',
    feature: null // Always enabled for now
  },
  {
    id: 'feedback' as const,
    name: 'Sugerencias Web',
    description: 'Mejoras y feedback sobre la web',
    icon: HelpCircle,
    color: 'bg-orange-500',
    feature: null // Always enabled for now
  }
];

export default function ContactPage() {
  const { user } = useUser();
  const formRef = useRef<HTMLDivElement>(null);
  const [isContactFeatureEnabled] = useState(true);
  const [loadingFeatureFlag] = useState(false);
  const [highlightFeatures] = useState<Record<string, boolean>>({
    general: true,
    rsvp: true,
  photo: true,
    whatsapp: true,
    feedback: true,
  });


  const [formData, setFormData] = useState<ContactFormData>({
    name: '',
    email: '',
    phone: '',
    type: 'general',
    subject: '',
    message: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [errorMessage, setErrorMessage] = useState('');

  // Feature always enabled; no flag checks needed

  // Pre-populate form with user data when authenticated
  useEffect(() => {
    if (user) {
      const userName = user.firstName && user.lastName 
        ? `${user.firstName} ${user.lastName}` 
        : user.firstName || '';
      const userEmail = user.emailAddresses[0]?.emailAddress || '';
      
      setFormData(prev => ({
        ...prev,
        name: prev.name || userName,
        email: prev.email || userEmail,
      }));
    }
  }, [user]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleTypeChange = (type: ContactFormData['type']) => {
    setFormData(prev => ({
      ...prev,
      type,
      subject: getDefaultSubject(type)
    }));
    // Scroll to form when type changes
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const getDefaultSubject = (type: ContactFormData['type']): string => {
    switch (type) {
      case 'rsvp': return 'Consulta sobre eventos';
  case 'photo': return 'Envío de fotos';
      case 'whatsapp': return 'Solicitud de invitación a WhatsApp';
      case 'feedback': return 'Sugerencias para la web';
      default: return '';
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSubmitStatus('idle');
    setErrorMessage('');

    try {
      const response = await fetch('/api/contact', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok) {
        setSubmitStatus('success');
        setFormData(prev => ({
          ...prev,
          phone: '',
          type: 'general',
          subject: '',
          message: ''
        }));
      } else {
        setSubmitStatus('error');
        setErrorMessage(result.error ?? 'Error al enviar el mensaje');
      }
    } catch (err) {
      console.error('Contact form error:', err);
      setSubmitStatus('error');
      setErrorMessage('Error de conexión. Inténtalo de nuevo.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedType = formTypes.find(type => type.id === formData.type);

  const visibleFormTypes = formTypes.filter(type => !type.feature || highlightFeatures[type.id]);

  if (loadingFeatureFlag) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <LoadingSpinner size="lg" label="Cargando página de contacto..." />
      </div>
    );
  }

  if (!isContactFeatureEnabled) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full space-y-8 text-center">
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Página No Disponible
          </h2>
          <p className="mt-2 text-center text-sm text-gray-600">
            La página de contacto está deshabilitada en este momento.
          </p>
          <div className="bg-white p-8 rounded-lg shadow-md">
            <p className="text-gray-700 mb-4">
              Por favor, inténtalo de nuevo más tarde.
            </p>
            <Link 
              href="/"
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-betis-green hover:bg-betis-green/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-betis-green"
            >
              Volver al Inicio
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-betis-green text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Send className="h-16 w-16 mx-auto mb-4" />
          <h1 className="text-4xl sm:text-5xl font-black mb-4">
            Contacto
          </h1>
          <p className="text-xl opacity-90">
            ¿Tienes alguna pregunta? Estamos aquí para ayudarte
          </p>
        </div>
      </section>

      {/* Quick Contact Options */}
      <section className="py-12 bg-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">
            💬 ¿Qué necesitas?
          </h2>
          
          <div className={`grid grid-cols-1 md:grid-cols-2 ${visibleFormTypes.length === 4 ? 'lg:grid-cols-2' : 'lg:grid-cols-3'} gap-6 mb-12`}>
            {formTypes.map((type) => {
              const Icon = type.icon;
              // Conditionally render based on feature flag
              if (type.feature && !highlightFeatures[type.id]) {
                return null;
              }
              return (
                <button
                  key={type.id}
                  onClick={() => handleTypeChange(type.id)}
                  className={`p-6 rounded-2xl border-2 transition-all duration-300 text-left ${
                    formData.type === type.id
                      ? 'border-betis-green bg-betis-green/5 shadow-lg'
                      : 'border-gray-200 hover:border-betis-green/50 hover:shadow-md'
                  }`}
                >
                  <div className={`${type.color} w-12 h-12 rounded-full flex items-center justify-center mb-4`}>
                    <Icon className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-bold text-lg mb-2 text-gray-900">{type.name}</h3>
                  <p className="text-gray-600 text-sm">{type.description}</p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Contact Form */}
      <section ref={formRef} className="py-12 bg-gray-50">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white rounded-2xl shadow-xl p-8">
            <div className="text-center mb-8">
              {selectedType && (
                <div className={`${selectedType.color} w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4`}>
                  <selectedType.icon className="h-8 w-8 text-white" />
                </div>
              )}
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                {selectedType?.name ?? 'Formulario de Contacto'}
              </h3>
              <p className="text-gray-600">
                {selectedType?.description ?? 'Completa el formulario y te responderemos pronto'}
              </p>
            </div>

            {submitStatus === 'success' && (
              <FormSuccessMessage
                title="¡Mensaje enviado!"
                message="Te responderemos pronto."
                className="mb-6"
              />
            )}

            {submitStatus === 'error' && (
              <FormErrorMessage
                message={errorMessage || 'Error al enviar el mensaje. Inténtalo de nuevo.'}
                className="mb-6"
              />
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Info */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {user && (
                  <div className="text-center mt-4 p-3 bg-green-50 border border-green-200 rounded-lg col-span-full">
                    <p className="text-sm text-green-800">
                      ✓ Conectado como {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs text-green-600 mt-1">
                      Tus datos se han rellenado automáticamente
                    </p>
                  </div>
                )}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
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
                    data-testid="contact-name"
                  />
                </div>

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
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
                    data-testid="contact-email"
                  />
                </div>
              </div>

              {/* Phone (optional) */}
              <div>
                <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                  Teléfono (opcional)
                </label>
                <input
                  type="tel"
                  id="phone"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-betis-green focus:border-transparent"
                  placeholder="+44 o +34 número"
                />
              </div>

              {/* Subject */}
              <div>
                <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                  Asunto *
                </label>
                <input
                  type="text"
                  id="subject"
                  name="subject"
                  required
                  value={formData.subject}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-betis-green focus:border-transparent"
                  placeholder="Breve resumen de tu consulta"
                  data-testid="contact-subject"
                />
              </div>

              {/* Message */}
              <div>
                <label htmlFor="message" className="block text-sm font-medium text-gray-700 mb-2">
                  Mensaje *
                </label>
                <textarea
                  id="message"
                  name="message"
                  required
                  rows={6}
                  value={formData.message}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-betis-green focus:border-transparent"
                  placeholder="Cuéntanos en detalle lo que necesitas..."
                  data-testid="contact-message"
                />
              </div>

              {/* Special instructions based on type */}
              {formData.type === 'whatsapp' && (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                  <p className="text-green-800 text-sm">
                    📱 <strong>Solicitud de WhatsApp:</strong> Incluye tu número de móvil en el mensaje 
                    para poder añadirte al grupo. El grupo se usa para avisar de cambios de horario 
                    y eventos especiales.
                  </p>
                </div>
              )}

              {formData.type === 'photo' && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                  <p className="text-blue-800 text-sm">
                    📸 <strong>Envío de fotos:</strong> Puedes adjuntar fotos directamente en la galería 
                    o enviárnoslas por email. Menciona si quieres que se publiquen en redes sociales.
                  </p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-betis-green hover:bg-green-700 disabled:bg-gray-400 text-white py-4 px-6 rounded-lg font-bold text-lg transition-colors duration-200 disabled:cursor-not-allowed"
                data-testid="submit-contact"
              >
                {isSubmitting ? (
                  <FormLoadingMessage message="Enviando mensaje..." className="text-white" />
                ) : (
                  <>
                    <Send className="h-5 w-5 inline mr-2" />
                    Enviar Mensaje
                  </>
                )}
              </button>
            </form>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12 text-gray-900">
            Preguntas Frecuentes
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <h3 className="text-lg font-bold mb-3 text-betis-green">¿Cómo puedo unirme a la peña?</h3>
              <p className="text-gray-700 mb-6">
                Simplemente ven a The Polwarth Tavern cualquier día que juegue el Betis. 
                No hace falta ser socio, solo ganas de pasarlo bien.
              </p>

              <h3 className="text-lg font-bold mb-3 text-betis-green">¿Tengo que confirmar asistencia?</h3>
              <p className="text-gray-700 mb-6">
                No es obligatorio, pero nos ayuda a reservar mesa. Usa el formulario RSVP 
                si sabes que vas a venir.
              </p>

              <h3 className="text-lg font-bold mb-3 text-betis-green">¿Puedo traer amigos?</h3>
              <p className="text-gray-700">
                ¡Por supuesto! Cuantos más seamos, mejor ambiente. Solo menciona 
                cuántos sois en el RSVP.
              </p>
            </div>

            <div>

              <h3 className="text-lg font-bold mb-3 text-betis-green">¿Puedo enviar fotos?</h3>
              <p className="text-gray-700 mb-6">
                Sí, usa la galería online o escríbenos. Nos encanta ver fotos de 
                béticos animando al Betis.
              </p>

              <h3 className="text-lg font-bold mb-3 text-betis-green">¿Hay grupo de WhatsApp?</h3>
              <p className="text-gray-700">
                Sí, úsalo para solicitar invitación. Te añadimos para avisos importantes 
                y coordinación de eventos.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Alternative Contact Methods */}
      <section className="py-16 bg-betis-green text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-8">📱 Otras formas de contacto</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <MessageCircle className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-3">Facebook</h3>
              <p className="mb-4 opacity-90">Grupo oficial en Facebook</p>
              <a
                href="https://www.facebook.com/groups/beticosenescocia/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-betis-green px-4 py-2 rounded-lg font-bold hover:bg-gray-100 transition-colors"
              >
                Ir al grupo
              </a>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <Camera className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-3">Instagram</h3>
              <p className="mb-4 opacity-90">Síguenos @rbetisescocia</p>
              <a
                href="https://www.instagram.com/rbetisescocia/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-betis-green px-4 py-2 rounded-lg font-bold hover:bg-gray-100 transition-colors"
              >
                Seguir
              </a>
            </div>

            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6">
              <HelpCircle className="h-12 w-12 mx-auto mb-4" />
              <h3 className="text-xl font-bold mb-3">En persona</h3>
              <p className="mb-4 opacity-90">The Polwarth Tavern, Edinburgh</p>
              <a
                href="https://maps.google.com/maps?q=The+Polwarth+Tavern+Edinburgh"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-white text-betis-green px-4 py-2 rounded-lg font-bold hover:bg-gray-100 transition-colors"
              >
                Ver mapa
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}