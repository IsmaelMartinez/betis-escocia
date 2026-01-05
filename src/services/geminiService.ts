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
  // Relevance check - is this news actually about Real Betis?
  isRelevantToBetis: boolean; // true if the news is specifically about Betis
  irrelevanceReason?: string; // reason why it's not relevant (only if isRelevantToBetis=false)
}

export interface ReassessmentOptions {
  adminContext?: string; // e.g., "wrong player", "wrong team", "not a transfer rumor"
  isReassessment?: boolean;
  currentSquad?: string[]; // List of current Betis player names for context
}

/**
 * Sanitize user input to prevent prompt injection attacks
 */
function sanitizeInput(input: string, maxLength: number): string {
  return input
    .replace(/```/g, "") // Remove code blocks that could break prompt structure
    .replace(/INSTRUCCIONES:|IGNORE|IMPORTANT:|SYSTEM:|ADMIN:/gi, "") // Remove command-like keywords
    .substring(0, maxLength) // Truncate to prevent excessive input
    .trim();
}

/**
 * Validate AI response for anomalous patterns that might indicate manipulation
 */
function validateAIResponse(
  result: RumorAnalysis,
  title: string,
): { valid: boolean; reason?: string } {
  // Flag suspiciously perfect probability without proper reasoning
  if (
    result.probability === 100 &&
    (!result.reasoning || result.reasoning.length < 20)
  ) {
    return {
      valid: false,
      reason: "Suspicious: probability=100 with minimal reasoning",
    };
  }

  // Flag if marked as not relevant but still has high probability
  if (result.isRelevantToBetis === false && (result.probability ?? 0) > 50) {
    return {
      valid: false,
      reason: "Suspicious: irrelevant news with high probability",
    };
  }

  // Flag if probability is high but confidence is low (contradiction)
  if ((result.probability ?? 0) > 70 && result.confidence === "low") {
    return {
      valid: false,
      reason: "Suspicious: high probability with low confidence",
    };
  }

  return { valid: true };
}

export async function analyzeRumorCredibility(
  title: string,
  description: string,
  source: string,
  articleContent?: string | null,
  options?: ReassessmentOptions,
): Promise<RumorAnalysis> {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;
  if (!GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY environment variable is required");
  }

  const genAI = new GoogleGenAI({ apiKey: GEMINI_API_KEY });

  // Sanitize inputs to prevent prompt injection
  const sanitizedTitle = sanitizeInput(title, 500);
  const sanitizedDescription = sanitizeInput(description || "", 1000);
  const sanitizedArticle = articleContent
    ? sanitizeInput(articleContent, 5000)
    : null;
  const sanitizedSource = sanitizeInput(source, 200);

  // Build content section - include article if available
  const contentSection = sanitizedArticle
    ? `Contenido del artículo:\n${sanitizedArticle}`
    : `Descripción: ${sanitizedDescription || "Sin descripción"}`;

  // Build admin context section for reassessment (admin input is trusted)
  const adminContextSection = options?.adminContext
    ? `\n\nCORRECCIÓN DEL ADMINISTRADOR (IMPORTANTE - ten esto en cuenta para tu análisis):
${options.adminContext}

Nota: Un administrador ha marcado esta noticia para re-evaluación con el contexto anterior. Por favor, ajusta tu análisis según esta información.`
    : "";

  // Build current squad section if available (trusted data from database)
  const currentSquadSection =
    options?.currentSquad && options.currentSquad.length > 0
      ? `\n\nPLANTILLA ACTUAL DEL BETIS (jugadores que actualmente pertenecen al club):
${options.currentSquad.join(", ")}

IMPORTANTE: Si un jugador de esta lista aparece en la noticia, ten en cuenta que ya es jugador del Betis. Si la noticia habla de su posible salida, es un rumor de SALIDA (departing). Si la noticia habla de su renovación o situación en el club, no es un fichaje.`
      : "";

  const prompt = `Analiza esta noticia del Real Betis Balompié (equipo de fútbol de Sevilla, España):

Título: ${sanitizedTitle}
${contentSection}
Fuente: ${sanitizedSource}

INSTRUCCIONES:
0. PRIMERO: Determina si esta noticia es ESPECÍFICAMENTE sobre el Real Betis Balompié.
   - isRelevantToBetis = true: La noticia trata directamente sobre el Betis, sus jugadores, fichajes, o el club
   - isRelevantToBetis = false: La noticia es sobre otros equipos (incluso de La Liga), fútbol general, o solo menciona al Betis de pasada
   - Si NO es relevante, incluye irrelevanceReason con una explicación breve (ej: "Noticia sobre el Sevilla FC", "Noticia de fútbol general")

1. Si es relevante: Determina si es un RUMOR DE FICHAJE (transferencia de jugador). NO es fichaje: partidos, lesiones, declaraciones, premios, inocentadas/bromas del 28 de diciembre.
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
${currentSquadSection}${adminContextSection}
JSON (solo el JSON, sin markdown):
{"isRelevantToBetis":<bool>,"irrelevanceReason":"<razón si no es relevante>","isTransferRumor":<bool>,"probability":<0-100|null>,"reasoning":"<explicación breve>","confidence":"<low|medium|high>","players":[{"name":"<nombre>"}]}`;

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

      // Validate response for anomalous patterns
      const validation = validateAIResponse(result, sanitizedTitle);
      if (!validation.valid) {
        log.error("Suspicious AI response detected", null, {
          title: sanitizedTitle,
          source: sanitizedSource,
          reason: validation.reason,
          probability: result.probability,
          confidence: result.confidence,
        });
        // Return with null probability to flag for manual review
        return {
          isTransferRumor: null,
          probability: null,
          reasoning: `Análisis automático bloqueado por patrones sospechosos: ${validation.reason}`,
          confidence: "low",
          players: result.players || [],
          isRelevantToBetis: result.isRelevantToBetis ?? true,
          irrelevanceReason: result.irrelevanceReason,
        };
      }

      log.business("rumor_analyzed", {
        probability: result.probability,
        confidence: result.confidence,
        playerCount: result.players?.length || 0,
        isRelevantToBetis: result.isRelevantToBetis,
      });

      // Ensure players array and relevance fields exist (fallback for older responses)
      return {
        ...result,
        players: result.players || [],
        isRelevantToBetis: result.isRelevantToBetis ?? true,
        irrelevanceReason: result.irrelevanceReason,
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
          isRelevantToBetis: true, // Assume relevant when we can't analyze
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
          isRelevantToBetis: true, // Assume relevant when we can't analyze
        };
      }
      // Wait before retry
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  // This should never be reached, but TypeScript needs it
  throw new Error("Unreachable code");
}
