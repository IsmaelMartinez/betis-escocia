import { z } from "zod";
import type { ValidationTranslator } from "./contact";

const defaultT: ValidationTranslator = (key) => {
  const fallback: Record<string, string> = {
    triviaScoreMin: "La puntuación debe ser mayor o igual a 0",
    triviaScoreMax: "La puntuación no puede exceder 100",
    triviaScoreInt: "La puntuación debe ser un número entero",
  };
  return fallback[key] ?? key;
};

export function createTriviaScoreSchema(t: ValidationTranslator = defaultT) {
  return z.object({
    score: z
      .number()
      .min(0, t("triviaScoreMin"))
      .max(100, t("triviaScoreMax"))
      .int(t("triviaScoreInt")),
  });
}

export const triviaScoreSchema = createTriviaScoreSchema();

export type TriviaScoreData = z.infer<typeof triviaScoreSchema>;
