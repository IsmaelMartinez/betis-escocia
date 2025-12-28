import { z } from "zod";

// Response schema for rumors API
export const rumorItemSchema = z.object({
  title: z.string(),
  link: z.string().url(),
  pubDate: z.string().datetime(),
  source: z.enum([
    "Google News (Fichajes)",
    "Google News (General)",
    "BetisWeb",
  ]),
  description: z.string().optional(),
});

export const rumorsResponseSchema = z.object({
  rumors: z.array(rumorItemSchema),
  totalCount: z.number(),
  lastUpdated: z.string().datetime(),
});

export type RumorItem = z.infer<typeof rumorItemSchema>;
export type RumorsResponse = z.infer<typeof rumorsResponseSchema>;
