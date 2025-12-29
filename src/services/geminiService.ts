import { GoogleGenAI } from "@google/genai";
import { log } from "@/lib/logger";

// Extracted player from AI analysis
export interface ExtractedPlayer {
  name: string;
}

export interface RumorAnalysis {
  isTransferRumor: boolean | null; // Is this actually a transfer rumor? null = couldn't analyze
  probability: number | null; // 0-100 (only if isTransferRumor=true), null = not analyzed
  reasoning: string;
  confidence: "low" | "medium" | "high";
  players: ExtractedPlayer[]; // Extracted player names mentioned in the article
}

export async function analyzeRumorCredibility(
  title: string,
  description: string,
  source: string,
  articleContent?: string | null,
): Promise<RumorAnalysis> {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable is required");
  }

  const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  // Build content section - include article if available
  const contentSection = articleContent
    ? `Contenido del artículo:\n${articleContent}`
    : `Descripción: ${description || "Sin descripción"}`;

  const prompt = `Analiza esta noticia del Real Betis Balompié (equipo de fútbol de Sevilla, España):

Título: ${title}
${contentSection}
Fuente: ${source}

INSTRUCCIONES:
1. Determina si es un RUMOR DE FICHAJE (transferencia de jugador). NO es fichaje: partidos, lesiones, declaraciones, premios, inocentadas/bromas del 28 de diciembre.
2. Si es fichaje: evalúa credibilidad 0-100 basándote en la fuente y el lenguaje usado.

3. EXTRACCIÓN DE JUGADORES (MUY IMPORTANTE - sigue estas reglas estrictamente):
   - Extrae SOLO nombres de futbolistas profesionales que aparecen EXPLÍCITAMENTE en el texto
   - Busca el nombre MÁS COMPLETO disponible en el artículo (nombre + apellido si está)
   - Si solo aparece un apodo o nombre corto, úsalo (ej: "Isco", "Lo Celso", "Fekir")
   - NO incluyas: entrenadores, directivos, agentes, presidentes, periodistas
   - NO incluyas: nombres de equipos, ciudades o competiciones
   - NO inventes nombres que no aparecen literalmente en el texto
   - Si no hay futbolistas mencionados, devuelve array vacío []

EJEMPLOS de extracción correcta:
- "El Betis ficha a Giovani Lo Celso" → [{"name":"Giovani Lo Celso"}]
- "Isco podría salir del club" → [{"name":"Isco"}]
- "Marc Roca y William Carvalho..." → [{"name":"Marc Roca"},{"name":"William Carvalho"}]
- "El club negocia con el Liverpool" → [] (no hay jugador nombrado)
- "Pellegrini habló sobre el mercado" → [] (entrenador, no jugador)

JSON (solo el JSON, sin markdown):
{"isTransferRumor":<bool>,"probability":<0-100|null>,"reasoning":"<explicación breve>","confidence":"<low|medium|high>","players":[{"name":"<nombre>"}]}`;

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
        playerCount: result.players?.length || 0,
      });

      // Ensure players array exists (fallback for older responses)
      return {
        ...result,
        players: result.players || [],
      };
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
          players: [],
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
          players: [],
        };
      }
      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  // This should never be reached, but TypeScript needs it
  throw new Error("Unreachable code");
}
