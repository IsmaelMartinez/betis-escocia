import { GoogleGenAI } from "@google/genai";
import { log } from "@/lib/logger";

export interface RumorAnalysis {
  isTransferRumor: boolean | null; // Is this actually a transfer rumor? null = couldn't analyze
  probability: number | null; // 0-100 (only if isTransferRumor=true), null = not analyzed
  reasoning: string;
  confidence: "low" | "medium" | "high";
  transferDirection: "in" | "out" | "unknown" | null; // in=arriving, out=leaving
}

export async function analyzeRumorCredibility(
  title: string,
  description: string,
  source: string,
): Promise<RumorAnalysis> {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable is required");
  }

  const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });
  const prompt = `Analiza si esta noticia del Real Betis es un rumor de fichaje:

Título: ${title}
Descripción: ${description || "Sin descripción"}
Fuente: ${source}

Evalúa: ¿Es fichaje? (no: partidos, lesiones, declaraciones). Si es fichaje: credibilidad 0-100, dirección ("in"=llega, "out"=sale, "unknown").

JSON:
{"isTransferRumor":<bool>,"probability":<0-100>,"reasoning":"<breve>","confidence":"<low|medium|high>","transferDirection":"<in|out|unknown|null>"}`;

  // Simple retry with backoff (3 attempts, 1 second delay)
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await genAI.models.generateContent({
        model: process.env.GEMINI_MODEL || "gemini-3-flash-preview",
        contents: prompt,
      });
      const text = response.text;
      if (!text) {
        throw new Error("No text in response");
      }
      const cleanText = text.replace(/```json\n?|\n?```/g, "").trim();
      const result = JSON.parse(cleanText);

      log.business("rumor_analyzed", {
        probability: result.probability,
        confidence: result.confidence,
      });

      return result;
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : String(error);

      // Check if this is a quota/rate limit error (429) - don't retry these
      const isQuotaError =
        errorMessage.includes("429") ||
        errorMessage.includes("quota") ||
        errorMessage.includes("rate limit");

      if (isQuotaError) {
        log.error("Gemini quota exceeded - storing without analysis", error, {
          title,
          source,
          note: "Free tier limit reached - storing with null probability",
        });
        return {
          isTransferRumor: null,
          probability: null,
          reasoning: "No se pudo analizar este rumor automáticamente.",
          confidence: "low",
          transferDirection: null,
        };
      }

      if (attempt === 2) {
        log.error(
          "Gemini analysis failed after retries - storing without analysis",
          error,
          { title, source },
        );
        return {
          isTransferRumor: null,
          probability: null,
          reasoning: "No se pudo analizar este rumor automáticamente.",
          confidence: "low",
          transferDirection: null,
        };
      }
      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  // This should never be reached, but TypeScript needs it
  throw new Error("Unreachable code");
}
