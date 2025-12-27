import { GoogleGenerativeAI } from "@google/generative-ai";
import { log } from "@/lib/logger";

export interface RumorAnalysis {
  isTransferRumor: boolean; // Is this actually a transfer rumor?
  probability: number; // 0-100 (only if isTransferRumor=true)
  reasoning: string;
  confidence: "low" | "medium" | "high";
}

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: string;
  private maxRetries: number;
  private timeoutMs: number;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY environment variable is required");
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = process.env.GEMINI_MODEL || "gemini-3-flash-preview";
    this.maxRetries = parseInt(process.env.GEMINI_MAX_RETRIES || "3", 10);
    this.timeoutMs = parseInt(process.env.GEMINI_TIMEOUT_MS || "30000", 10);
  }

  async analyzeRumorCredibility(
    title: string,
    description: string,
    source: string,
  ): Promise<RumorAnalysis> {
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

    try {
      const model = this.genAI.getGenerativeModel({ model: this.model });
      const result = await this.withRetry(async () => {
        const response = await model.generateContent(prompt);
        const text = response.response.text();
        // Remove markdown code blocks if present
        const cleanText = text.replace(/```json\n?|\n?```/g, "").trim();
        return JSON.parse(cleanText);
      });

      log.business("rumor_analyzed", {
        probability: result.probability,
        confidence: result.confidence,
      });

      return result;
    } catch (error) {
      log.error("Gemini analysis failed", error, { title, source });
      // Return neutral analysis on failure (assume it might be a transfer)
      return {
        isTransferRumor: true, // Assume yes to avoid filtering out potential transfers
        probability: 50,
        reasoning: "No se pudo analizar este rumor automáticamente.",
        confidence: "low",
      };
    }
  }

  private async withRetry<T>(
    operation: () => Promise<T>,
    retries: number = this.maxRetries,
  ): Promise<T> {
    try {
      return await Promise.race([
        operation(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error("Timeout")), this.timeoutMs),
        ),
      ]);
    } catch (error) {
      if (retries > 0) {
        await new Promise((resolve) => setTimeout(resolve, 1000)); // 1s backoff
        return this.withRetry(operation, retries - 1);
      }
      throw error;
    }
  }
}
