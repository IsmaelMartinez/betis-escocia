import { GoogleGenerativeAI } from '@google/generative-ai';
import { log } from '@/lib/logger';

export interface RumorAnalysis {
  probability: number; // 0-100
  reasoning: string;
  confidence: 'low' | 'medium' | 'high';
}

export class GeminiService {
  private genAI: GoogleGenerativeAI;
  private model: string;
  private maxRetries: number;
  private timeoutMs: number;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }

    this.genAI = new GoogleGenerativeAI(apiKey);
    this.model = process.env.GEMINI_MODEL || 'gemini-2.0-flash-exp';
    this.maxRetries = parseInt(process.env.GEMINI_MAX_RETRIES || '3', 10);
    this.timeoutMs = parseInt(process.env.GEMINI_TIMEOUT_MS || '30000', 10);
  }

  async analyzeRumorCredibility(
    title: string,
    description: string,
    source: string
  ): Promise<RumorAnalysis> {
    const prompt = `Analiza este rumor de fichaje del Real Betis y proporciona:
1. Probabilidad (0-100) de que este rumor sea creíble o se haga realidad
2. Razonamiento breve (2-3 frases en español)
3. Nivel de confianza (low/medium/high)

Título: ${title}
Descripción: ${description || 'Sin descripción'}
Fuente: ${source}

Responde SOLO en este formato JSON:
{
  "probability": <número 0-100>,
  "reasoning": "<texto en español>",
  "confidence": "<low|medium|high>"
}`;

    try {
      const model = this.genAI.getGenerativeModel({ model: this.model });
      const result = await this.withRetry(async () => {
        const response = await model.generateContent(prompt);
        const text = response.response.text();
        // Remove markdown code blocks if present
        const cleanText = text.replace(/```json\n?|\n?```/g, '').trim();
        return JSON.parse(cleanText);
      });

      log.business('rumor_analyzed', {
        probability: result.probability,
        confidence: result.confidence,
      });

      return result;
    } catch (error) {
      log.error('Gemini analysis failed', error, { title, source });
      // Return neutral analysis on failure
      return {
        probability: 50,
        reasoning: 'No se pudo analizar este rumor automáticamente.',
        confidence: 'low',
      };
    }
  }

  private async withRetry<T>(
    operation: () => Promise<T>,
    retries: number = this.maxRetries
  ): Promise<T> {
    try {
      return await Promise.race([
        operation(),
        new Promise<never>((_, reject) =>
          setTimeout(() => reject(new Error('Timeout')), this.timeoutMs)
        ),
      ]);
    } catch (error) {
      if (retries > 0) {
        await new Promise(resolve => setTimeout(resolve, 1000)); // 1s backoff
        return this.withRetry(operation, retries - 1);
      }
      throw error;
    }
  }
}
