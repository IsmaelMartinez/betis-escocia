import { GoogleGenAI } from "@google/genai";
import { log } from "@/lib/logger";

export interface RumorAnalysis {
  isTransferRumor: boolean; // Is this actually a transfer rumor?
  probability: number; // 0-100 (only if isTransferRumor=true)
  reasoning: string;
  confidence: "low" | "medium" | "high";
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
  const prompt = `Analiza esta noticia del Real Betis en DOS PASOS:

PASO 1: ¿Es esto un rumor de FICHAJE (transferencia de jugadores)?
- Debe mencionar específicamente llegadas o salidas de jugadores al/del Real Betis
- NO son fichajes: noticias de partidos, lesiones, declaraciones generales, análisis tácticos

PASO 2 (solo si es fichaje): Evalúa la credibilidad
- Probabilidad (0-100) de que el rumor sea creíble o se haga realidad
- Razonamiento breve (2-3 frases en español)
- Nivel de confianza (low/medium/high)

Título: ${title}
Descripción: ${description || "Sin descripción"}
Fuente: ${source}

Responde SOLO en este formato JSON:
{
  "isTransferRumor": <true|false>,
  "probability": <número 0-100, o 0 si no es fichaje>,
  "reasoning": "<texto en español explicando por qué es/no es fichaje y su credibilidad>",
  "confidence": "<low|medium|high>"
}`;

  // Simple retry with backoff (3 attempts, 1 second delay)
  for (let attempt = 0; attempt < 3; attempt++) {
    try {
      const response = await genAI.models.generateContent({
        model: "gemini-2.5-flash",
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
        log.error("Gemini quota exceeded - using fallback", error, {
          title,
          source,
          note: "Free tier: 20 requests/day limit reached",
        });
        return {
          isTransferRumor: true, // Assume yes to avoid filtering out potential transfers
          probability: 50,
          reasoning: "No se pudo analizar este rumor automáticamente.",
          confidence: "low",
        };
      }

      if (attempt === 2) {
        // Last attempt failed
        log.error("Gemini analysis failed after retries", error, {
          title,
          source,
        });
        return {
          isTransferRumor: true, // Assume yes to avoid filtering out potential transfers
          probability: 50,
          reasoning: "No se pudo analizar este rumor automáticamente.",
          confidence: "low",
        };
      }
      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  // This should never be reached, but TypeScript needs it
  throw new Error("Unreachable code");
}
