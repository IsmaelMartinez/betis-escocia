import { z } from "zod";
import type { ValidationTranslator } from "./contact";

const defaultT: ValidationTranslator = (key) => {
  const fallback: Record<string, string> = {
    nameMin: "Nombre debe tener al menos 2 caracteres",
    nameMax: "Nombre no puede exceder 50 caracteres",
    emailInvalid: "Formato de email inválido",
    emailMax: "Email demasiado largo",
    attendeesInt: "Número de asistentes debe ser un entero",
    attendeesMin: "Número de asistentes debe ser al menos 1",
    attendeesMax: "Número de asistentes no puede exceder 10",
    rsvpMessageMax: "Mensaje no puede exceder 500 caracteres",
    rsvpDeleteIdOrEmail: "Debes proporcionar un id o un email",
    gdprRequestTypeRequired: "El tipo de solicitud es obligatorio",
  };
  return fallback[key] ?? key;
};

export function createRsvpSchema(t: ValidationTranslator = defaultT) {
  return z.object({
    name: z
      .string()
      .min(2, t("nameMin"))
      .max(50, t("nameMax"))
      .trim(),
    email: z
      .string()
      .email(t("emailInvalid"))
      .max(254, t("emailMax"))
      .toLowerCase()
      .trim(),
    attendees: z
      .number()
      .int(t("attendeesInt"))
      .min(1, t("attendeesMin"))
      .max(10, t("attendeesMax")),
    message: z
      .string()
      .max(500, t("rsvpMessageMax"))
      .trim()
      .optional(),
    whatsappInterest: z.boolean(),
    matchId: z.number().int().positive().optional(),
    userId: z.string().optional(),
  });
}

export const rsvpSchema = createRsvpSchema();

// Query schema for GET requests
export const rsvpQuerySchema = z.object({
  match: z
    .string()
    .transform((val) => parseInt(val))
    .optional(),
});

export function createRsvpDeleteSchema(t: ValidationTranslator = defaultT) {
  return z
    .object({
      id: z
        .string()
        .transform((val) => parseInt(val))
        .optional(),
      email: z.string().email().optional(),
    })
    .refine((data) => data.id || data.email, {
      message: t("rsvpDeleteIdOrEmail"),
    });
}

export const rsvpDeleteSchema = createRsvpDeleteSchema();

export function createGdprSchema(t: ValidationTranslator = defaultT) {
  return z.object({
    requestType: z.enum(["access", "deletion"], {
      message: t("gdprRequestTypeRequired"),
    }),
  });
}

export const gdprSchema = createGdprSchema();

// Type inference for TypeScript
export type RSVPInput = z.infer<typeof rsvpSchema>;
export type RSVPQueryInput = z.infer<typeof rsvpQuerySchema>;
export type RSVPDeleteInput = z.infer<typeof rsvpDeleteSchema>;
export type GDPRInput = z.infer<typeof gdprSchema>;
