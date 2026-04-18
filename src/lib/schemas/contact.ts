import { z } from "zod";

export type ValidationTranslator = (key: string) => string;

/**
 * Fallback translator used when no `next-intl` translator is provided.
 * Keeps the historical Spanish wording so API routes and tests that import
 * `contactSchema` directly keep the same behaviour as before.
 */
const defaultT: ValidationTranslator = (key) => {
  const fallback: Record<string, string> = {
    nameMin: "Nombre debe tener al menos 2 caracteres",
    nameMax: "Nombre no puede exceder 50 caracteres",
    emailInvalid: "Formato de email inválido",
    emailMax: "Email demasiado largo",
    phoneInvalid: "Formato de teléfono inválido (mínimo 9 dígitos)",
    subjectMin: "Asunto debe tener al menos 3 caracteres",
    subjectMax: "Asunto no puede exceder 100 caracteres",
    messageMin: "Mensaje debe tener al menos 5 caracteres",
    messageMax: "Mensaje no puede exceder 1000 caracteres",
  };
  return fallback[key] ?? key;
};

export function createContactSchema(t: ValidationTranslator = defaultT) {
  return z.object({
    name: z.string().min(2, t("nameMin")).max(50, t("nameMax")).trim(),
    email: z
      .string()
      .email(t("emailInvalid"))
      .max(254, t("emailMax"))
      .toLowerCase()
      .trim(),
    phone: z
      .string()
      .regex(/^(?=(?:\D*\d){9})[+]?[\d\s-()]{9,15}$/, t("phoneInvalid"))
      .optional()
      .or(z.literal("")),
    type: z
      .enum(["rsvp", "general", "photo", "whatsapp", "feedback"])
      .default("general"),
    subject: z
      .string()
      .min(3, t("subjectMin"))
      .max(100, t("subjectMax"))
      .trim(),
    message: z
      .string()
      .min(5, t("messageMin"))
      .max(1000, t("messageMax"))
      .trim(),
  });
}

export const contactSchema = createContactSchema();

export type ContactInput = z.infer<typeof contactSchema>;

// Contact submission status update schema (for admin)
export const contactStatusSchema = z.object({
  status: z.enum(["new", "in_progress", "resolved", "closed"]),
  admin_notes: z.string().max(500).optional(),
});

export type ContactStatusInput = z.infer<typeof contactStatusSchema>;
