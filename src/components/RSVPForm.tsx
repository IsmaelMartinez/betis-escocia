"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { User, Mail, MessageSquare, Users } from "lucide-react";
import {
  FormSuccessMessage,
  FormErrorMessage,
  FormLoadingMessage,
} from "@/components/MessageComponent";
import Field, {
  ValidatedInput,
  ValidatedSelect,
  ValidatedTextarea,
} from "@/components/Field";
import { useUser } from "@clerk/nextjs";
import { isFeatureEnabled } from "@/lib/featureFlags";
import { rsvpSchema, type RSVPInput } from "@/lib/schemas/rsvp";

interface RSVPFormProps {
  readonly onSuccess?: () => void;
  readonly selectedMatchId?: number;
}

export default function RSVPForm({
  onSuccess,
  selectedMatchId,
}: RSVPFormProps) {
  const { user } = useUser();
  const isAuthEnabled = isFeatureEnabled("show-clerk-auth");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState<
    "idle" | "success" | "error"
  >("idle");
  const [errorMessage, setErrorMessage] = useState("");

  const {
    register,
    handleSubmit: handleFormSubmit,
    formState: { errors, touchedFields },
    setValue,
    reset,
    watch,
  } = useForm<RSVPInput>({
    resolver: zodResolver(rsvpSchema),
    defaultValues: {
      name: "",
      email: "",
      attendees: 1,
      message: "",
      whatsappInterest: false,
    },
  });

  // Pre-fill form with user data when authenticated
  useEffect(() => {
    if (isAuthEnabled && user) {
      const userName =
        user.firstName && user.lastName
          ? `${user.firstName} ${user.lastName}`
          : user.firstName || "";
      const userEmail = user.emailAddresses[0]?.emailAddress || "";

      if (userName) setValue("name", userName);
      if (userEmail) setValue("email", userEmail);
    }
  }, [user, isAuthEnabled, setValue]);

  const onSubmit = async (data: RSVPInput) => {
    setIsSubmitting(true);
    setSubmitStatus("idle");

    try {
      const apiUrl = selectedMatchId
        ? `/api/rsvp?match=${selectedMatchId}`
        : "/api/rsvp";
      const submissionData = {
        ...data,
        matchId: selectedMatchId,
        ...(isAuthEnabled && user ? { userId: user.id } : {}),
      };

      const response = await fetch(apiUrl, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(submissionData),
      });

      if (!response.ok) {
        throw new Error("Error al enviar la confirmación");
      }

      setSubmitStatus("success");
      reset();

      // Call success callback after a delay
      setTimeout(() => {
        onSuccess?.();
      }, 2000);
    } catch (error) {
      setSubmitStatus("error");
      setErrorMessage(
        error instanceof Error ? error.message : "Error desconocido",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  if (submitStatus === "success") {
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

      <form onSubmit={handleFormSubmit(onSubmit)} className="space-y-6">
        {/* Name */}
        <Field
          label="Nombre completo"
          htmlFor="rsvp-name"
          required
          icon={<User className="h-4 w-4" />}
          error={errors.name?.message}
          touched={!!touchedFields.name}
        >
          <ValidatedInput
            type="text"
            id="rsvp-name"
            {...register("name")}
            placeholder="Tu nombre y apellido"
            error={errors.name?.message}
            touched={!!touchedFields.name}
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
          error={errors.email?.message}
          touched={!!touchedFields.email}
        >
          <ValidatedInput
            type="email"
            id="rsvp-email"
            {...register("email")}
            placeholder="tu@email.com"
            error={errors.email?.message}
            touched={!!touchedFields.email}
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
          error={errors.attendees?.message}
          touched={!!touchedFields.attendees}
        >
          <ValidatedSelect
            id="rsvp-attendees"
            {...register("attendees", { valueAsNumber: true })}
            error={errors.attendees?.message}
            touched={!!touchedFields.attendees}
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
          error={errors.message?.message}
          touched={!!touchedFields.message}
        >
          <ValidatedTextarea
            id="rsvp-message"
            {...register("message")}
            rows={3}
            placeholder="¿Alguna pregunta o comentario?"
            error={errors.message?.message}
            touched={!!touchedFields.message}
            data-testid="message-textarea"
          />
        </Field>

        {/* WhatsApp Interest */}
        <div className="flex items-start space-x-3">
          <input
            type="checkbox"
            id="whatsappInterest"
            {...register("whatsappInterest")}
            className="mt-1 h-5 w-5 text-betis-green border-gray-300 rounded focus:ring-betis-green"
          />
          <label htmlFor="whatsappInterest" className="text-sm text-gray-700">
            <strong>¿Te interesa unirte al grupo de WhatsApp?</strong>
            <br />
            <span className="text-gray-500">
              Recibe notificaciones sobre cambios de horario, eventos especiales
              y más.
            </span>
          </label>
        </div>

        {/* Error Message */}
        {submitStatus === "error" && (
          <FormErrorMessage
            message={
              errorMessage ||
              "Error al enviar la confirmación. Por favor, inténtalo de nuevo."
            }
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
            <FormLoadingMessage
              message="Enviando confirmación..."
              className="text-white"
            />
          ) : (
            "✅ Confirmar Asistencia"
          )}
        </button>
      </form>

      <div className="mt-6 text-center">
        <p className="text-xs text-gray-500">
          * Campos obligatorios. Tus datos solo se usan para organizar el
          evento.
        </p>
      </div>
    </div>
  );
}
