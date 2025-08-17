import { z } from 'zod';

// Trivia score submission schema
export const triviaScoreSchema = z.object({
  score: z.number()
    .min(0, 'La puntuación debe ser mayor o igual a 0')
    .max(100, 'La puntuación no puede exceder 100')
    .int('La puntuación debe ser un número entero')
});

// Export TypeScript types
export type TriviaScoreData = z.infer<typeof triviaScoreSchema>;