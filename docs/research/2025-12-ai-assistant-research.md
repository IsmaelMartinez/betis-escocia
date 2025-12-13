# AI Assistant Research - Peña Bética Escocesa

> **Date**: December 2025  
> **Status**: Research  
> **Goal**: Implement a cheap AI assistant restricted to Betis/Escocia/Peña Bética topics

## Executive Summary

This document analyzes options for implementing an AI chatbot assistant that:
1. Uses a **free or very cheap** LLM API
2. Is **topic-restricted** to Real Betis, Scotland football, and Peña Bética matters
3. Integrates seamlessly with the existing Next.js 15 architecture

**Recommended Solution**: Google Gemini API (free tier) with system prompt-based topic restriction.

---

## 1. LLM Provider Comparison

### 🏆 Google Gemini (Recommended)

| Aspect | Details |
|--------|---------|
| **Free Tier** | ✅ **15 requests/minute, 1,500 requests/day** (Gemini 1.5 Flash) |
| **Pricing** | \$0.075 per 1M input tokens, \$0.30 per 1M output tokens (paid tier) |
| **Models** | Gemini 2.0 Flash, Gemini 1.5 Flash, Gemini 1.5 Pro |
| **API** | REST API with official Node.js SDK (\`@google/generative-ai\`) |
| **Context Window** | 1M tokens (Gemini 1.5 Flash) |
| **Speed** | Very fast responses (~1-2 seconds) |
| **Rate Limits** | Generous for a community website |

**Why Gemini is Best for This Project:**
- **Completely free** for low-to-moderate traffic (1,500 requests/day = ~50 users × 30 messages)
- Simple SDK integration with Next.js
- Excellent for conversational AI with topic restriction
- No credit card required for free tier

### Alternative Options

#### Groq (Free Tier)

| Aspect | Details |
|--------|---------|
| **Free Tier** | ✅ 14,400 requests/day (varies by model) |
| **Models** | Llama 3.1, Mistral, Mixtral |
| **Speed** | **Extremely fast** (fastest inference available) |
| **Context Window** | 8K-128K depending on model |
| **SDK** | Node.js SDK available |

**Pros**: Fastest responses, generous free tier  
**Cons**: Hosted models only (no Gemini/GPT), less refined conversation quality

#### OpenAI (GPT-3.5/GPT-4)

| Aspect | Details |
|--------|---------|
| **Free Tier** | ❌ No free tier (pay-per-use only) |
| **Pricing** | GPT-3.5: \$0.50/1M tokens, GPT-4: \$30/1M tokens |
| **Quality** | Highest conversation quality |

**Not recommended** - No free tier, higher cost.

#### Anthropic Claude

| Aspect | Details |
|--------|---------|
| **Free Tier** | ❌ No free API tier |
| **Pricing** | Claude 3 Haiku: \$0.25/1M input, \$1.25/1M output |
| **Quality** | Excellent conversation quality |

**Not recommended** - No free API tier.

#### Cloudflare Workers AI

| Aspect | Details |
|--------|---------|
| **Free Tier** | ✅ 10,000 neurons/day (roughly 100-500 requests) |
| **Models** | Llama 3, Mistral, Phi-2 |
| **Integration** | Works great with Vercel/Cloudflare |

**Backup option** - Good if already using Cloudflare, limited free tier.

#### Ollama (Self-hosted)

| Aspect | Details |
|--------|---------|
| **Cost** | Free (requires server) |
| **Models** | Any open-source model (Llama, Mistral, etc.) |
| **Hosting** | Requires VPS (\$5-20/month) |

**Not recommended** - Requires infrastructure management.

---

## 2. Topic Restriction Strategy

### Approach: System Prompt + Input Validation

The most effective way to restrict the AI to specific topics is a **multi-layered approach**:

#### Layer 1: System Prompt (Primary)

\`\`\`typescript
const SYSTEM_PROMPT = \`Eres el asistente virtual de la Peña Bética Escocesa, un club de aficionados del Real Betis Balompié ubicado en Edimburgo, Escocia.

**REGLAS ESTRICTAS:**
1. SOLO puedes responder preguntas sobre:
   - Real Betis Balompié (historia, jugadores, partidos, estadísticas)
   - Fútbol escocés y la Selección de Escocia
   - La Peña Bética Escocesa (eventos, membresía, ubicación)
   - El pub Polwarth Tavern donde vemos los partidos
   - La ciudad de Edimburgo y puntos de interés para béticos visitantes

2. Si alguien pregunta sobre otros temas, responde amablemente:
   "Lo siento, soy el asistente de la Peña Bética Escocesa y solo puedo ayudarte con temas relacionados con el Real Betis, fútbol escocés, o nuestra peña. ¿Puedo ayudarte con algo sobre estos temas?"

3. Siempre responde en el mismo idioma en que te preguntan (español o inglés).

4. Sé amigable, entusiasta sobre el Betis, y usa expresiones béticas como "¡Viva el Betis!" cuando sea apropiado.

5. Información clave de la peña:
   - Ubicación: Polwarth Tavern, Edimburgo
   - Eventos: Vemos todos los partidos del Betis juntos
   - Contacto: A través de la página web
   - Trivia: Tenemos un juego de trivia diario sobre el Betis\`;
\`\`\`

#### Layer 2: Input Keyword Filtering (Secondary)

Pre-check user messages for off-topic signals:

\`\`\`typescript
const ALLOWED_TOPICS = [
  // Spanish
  'betis', 'betico', 'béticos', 'verdiblanco', 'heliópolis', 'benito villamarín',
  'sevilla', 'la liga', 'liga española', 'fútbol', 'futbol',
  'escocia', 'edimburgo', 'scotland', 'edinburgh', 'scottish',
  'peña', 'pena', 'polwarth', 'tavern', 'pub',
  'partido', 'match', 'gol', 'jugador', 'player', 'entrenador', 'coach',
  'trivia', 'porra', 'rsvp', 'evento', 'event',
  // Common football terms
  'copa', 'champions', 'europa league', 'temporada', 'season',
  'fichaje', 'transfer', 'estadio', 'stadium',
  // Players/coaches (current and historical)
  'joaquín', 'fekir', 'pellegrini', 'isco', 'william carvalho',
  'lo celso', 'nabil', 'isco', 'juanmi', 'borja iglesias'
];

function isLikelyOnTopic(message: string): boolean {
  const normalized = message.toLowerCase();
  // Allow greetings and basic questions
  if (normalized.length < 20) return true;
  // Check for topic keywords
  return ALLOWED_TOPICS.some(topic => normalized.includes(topic));
}
\`\`\`

#### Layer 3: Response Validation (Tertiary)

Check AI responses to ensure they stay on topic:

\`\`\`typescript
const OFF_TOPIC_PHRASES = [
  'as an AI language model',
  'I cannot provide medical',
  'I cannot help with',
  'that is outside my scope'
];

function validateResponse(response: string): boolean {
  // If AI self-identifies as refusing, it's working correctly
  return !OFF_TOPIC_PHRASES.some(phrase => 
    response.toLowerCase().includes(phrase.toLowerCase())
  );
}
\`\`\`

---

## 3. Recommended Architecture

### Component Diagram

\`\`\`
┌─────────────────────────────────────────────────────────────┐
│                      Frontend (React)                       │
│  ┌────────────────────────────────────────────────────┐    │
│  │              ChatWidget Component                   │    │
│  │  - Floating button in bottom-right                 │    │
│  │  - Expandable chat window                          │    │
│  │  - Message history (session storage)              │    │
│  │  - Typing indicators                               │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   API Route (/api/chat)                     │
│  ┌────────────────────────────────────────────────────┐    │
│  │  1. Rate limiting (per IP/session)                 │    │
│  │  2. Input validation (Zod schema)                  │    │
│  │  3. Topic pre-filtering                            │    │
│  │  4. Gemini API call                                │    │
│  │  5. Response validation                            │    │
│  │  6. Error handling                                 │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Google Gemini API (Free Tier)                  │
│  - Model: gemini-1.5-flash                                  │
│  - System prompt with topic restrictions                    │
│  - Streaming responses for better UX                        │
└─────────────────────────────────────────────────────────────┘
\`\`\`

### File Structure

\`\`\`
src/
├── app/
│   └── api/
│       └── chat/
│           └── route.ts          # Chat API endpoint
├── components/
│   ├── ChatWidget.tsx            # Main chat widget
│   ├── ChatMessage.tsx           # Individual message component
│   └── ChatInput.tsx             # Message input component
└── lib/
    └── chat/
        ├── geminiClient.ts       # Gemini SDK wrapper
        ├── topicFilter.ts        # Topic restriction logic
        ├── systemPrompt.ts       # System prompt configuration
        └── types.ts              # TypeScript types
\`\`\`

---

## 4. Implementation Guide

### Step 1: Install Dependencies

\`\`\`bash
npm install @google/generative-ai
\`\`\`

### Step 2: Environment Variables

\`\`\`env
# .env.local
GOOGLE_GEMINI_API_KEY=your_api_key_here
\`\`\`

### Step 3: Gemini Client Setup

\`\`\`typescript
// src/lib/chat/geminiClient.ts
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GEMINI_API_KEY!);

export const geminiModel = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  systemInstruction: SYSTEM_PROMPT,
  generationConfig: {
    temperature: 0.7,
    topP: 0.8,
    topK: 40,
    maxOutputTokens: 500, // Keep responses concise
  },
});

export async function getChatResponse(
  message: string,
  history: Array<{ role: 'user' | 'model'; parts: string }>
): Promise<string> {
  const chat = geminiModel.startChat({
    history: history.map(h => ({
      role: h.role,
      parts: [{ text: h.parts }],
    })),
  });

  const result = await chat.sendMessage(message);
  return result.response.text();
}
\`\`\`

### Step 4: API Route

\`\`\`typescript
// src/app/api/chat/route.ts
import { createApiHandler } from '@/lib/apiUtils';
import { z } from 'zod';
import { getChatResponse } from '@/lib/chat/geminiClient';
import { isLikelyOnTopic } from '@/lib/chat/topicFilter';

const chatSchema = z.object({
  message: z.string().min(1).max(500),
  history: z.array(z.object({
    role: z.enum(['user', 'model']),
    parts: z.string(),
  })).max(20).optional().default([]),
});

export const POST = createApiHandler({
  auth: 'none', // Allow anonymous users
  schema: chatSchema,
  handler: async ({ message, history }) => {
    // Pre-filter obvious off-topic messages
    if (!isLikelyOnTopic(message)) {
      return {
        response: 'Lo siento, soy el asistente de la Peña Bética Escocesa. ' +
                  '¿Puedo ayudarte con algo sobre el Real Betis, fútbol escocés, ' +
                  'o nuestra peña?',
        filtered: true,
      };
    }

    try {
      const response = await getChatResponse(message, history);
      return { response, filtered: false };
    } catch (error) {
      console.error('Gemini API error:', error);
      throw new Error('Error al procesar tu mensaje. Inténtalo de nuevo.');
    }
  },
});
\`\`\`

### Step 5: Chat Widget Component

\`\`\`typescript
// src/components/ChatWidget.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Loader2 } from 'lucide-react';

interface Message {
  role: 'user' | 'model';
  content: string;
  timestamp: Date;
}

export function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: userMessage.content,
          history: messages.map(m => ({
            role: m.role,
            parts: m.content,
          })),
        }),
      });

      const data = await response.json();

      if (data.success) {
        setMessages(prev => [...prev, {
          role: 'model',
          content: data.data.response,
          timestamp: new Date(),
        }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, {
        role: 'model',
        content: 'Lo siento, ha ocurrido un error. Inténtalo de nuevo.',
        timestamp: new Date(),
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  // ... JSX for the widget UI
}
\`\`\`

---

## 5. Rate Limiting Strategy

To prevent abuse while keeping the experience smooth:

### Per-Session Limits (Recommended for Free Tier)

\`\`\`typescript
// Limits per user session
const RATE_LIMITS = {
  messagesPerMinute: 5,
  messagesPerHour: 30,
  messagesPerDay: 100,
};
\`\`\`

### Implementation Options

1. **Session Storage** - Track in browser (client-side, easy to bypass)
2. **IP-based** - Use request IP + in-memory cache (recommended)
3. **Database** - Store in Supabase (most robust, adds latency)

Recommended: IP-based with in-memory Map, cleared every minute.

---

## 6. Cost Analysis

### Google Gemini Free Tier Usage

| Scenario | Daily Users | Messages/User | Total Messages | Within Free Tier? |
|----------|-------------|---------------|----------------|-------------------|
| Low | 10 | 10 | 100 | ✅ Yes (1,500 limit) |
| Medium | 30 | 20 | 600 | ✅ Yes |
| High | 50 | 30 | 1,500 | ✅ Just within limit |
| Very High | 100+ | 30+ | 3,000+ | ❌ Need paid tier |

### Paid Tier Estimate (if needed)

If exceeding free tier:
- **5,000 messages/month** × 500 tokens avg = 2.5M tokens
- **Cost**: ~\$0.19/month (input) + \$0.75/month (output) = **~\$1/month**

---

## 7. Security Considerations

### Required Measures

1. **API Key Protection** - Never expose Gemini API key to client
2. **Rate Limiting** - Prevent abuse (see section 5)
3. **Input Sanitization** - Already handled by Zod schema
4. **Content Filtering** - Gemini has built-in safety filters
5. **No User Data Storage** - Keep chat history in session only (GDPR friendly)

### Optional Enhancements

1. **CAPTCHA** - Add for high-traffic scenarios
2. **User Auth** - Require Clerk login for chat access
3. **Logging** - Store anonymized metrics for monitoring

---

## 8. UI/UX Recommendations

### Design Principles

1. **Non-intrusive** - Small floating button, doesn't block content
2. **On-brand** - Betis green/gold colors
3. **Mobile-first** - Full-screen chat on mobile
4. **Quick responses** - Stream responses for perceived speed

### Suggested UI

\`\`\`
┌──────────────────────────────────────┐
│  🟢 Asistente Peña Bética      [X]  │
├──────────────────────────────────────┤
│                                      │
│  ¡Hola! Soy el asistente de la      │
│  Peña Bética Escocesa. ¿En qué      │
│  puedo ayudarte?                     │
│                                      │
│  • Información sobre el Betis        │
│  • Próximos eventos                  │
│  • Cómo unirte a la peña            │
│  • Trivia y porra                    │
│                                      │
│  [User message bubble]               │
│                                      │
│  [Assistant response bubble]         │
│                                      │
├──────────────────────────────────────┤
│ ┌────────────────────────┐ [Send]   │
│ │ Escribe tu mensaje...  │          │
│ └────────────────────────┘          │
└──────────────────────────────────────┘
\`\`\`

---

## 9. Feature Flag Integration

Add feature flag for gradual rollout:

\`\`\`typescript
// src/lib/featureFlags.ts
export type FeatureName = 
  | 'chat-assistant'  // New flag
  | 'show-trivia-game'
  // ... existing flags
\`\`\`

\`\`\`env
# .env.local - disabled by default
NEXT_PUBLIC_FEATURE_CHAT_ASSISTANT=false
\`\`\`

---

## 10. Testing Strategy

### Unit Tests

\`\`\`typescript
// tests/unit/chat/topicFilter.test.ts
describe('Topic Filter', () => {
  it('allows Betis-related questions', () => {
    expect(isLikelyOnTopic('¿Quién es el entrenador del Betis?')).toBe(true);
  });

  it('allows Scottish football questions', () => {
    expect(isLikelyOnTopic('Tell me about Scottish football')).toBe(true);
  });

  it('allows peña-related questions', () => {
    expect(isLikelyOnTopic('¿Dónde está el Polwarth Tavern?')).toBe(true);
  });

  it('flags potentially off-topic messages', () => {
    expect(isLikelyOnTopic('Write me a Python script to hack NASA')).toBe(false);
  });
});
\`\`\`

### E2E Tests

\`\`\`typescript
// e2e/chat.spec.ts
test('chat widget responds to Betis questions', async ({ page }) => {
  await page.goto('/');
  await page.click('[data-testid="chat-toggle"]');
  await page.fill('[data-testid="chat-input"]', '¿Cuándo juega el Betis?');
  await page.click('[data-testid="chat-send"]');
  await expect(page.locator('[data-testid="chat-response"]')).toBeVisible();
});
\`\`\`

---

## 11. Implementation Phases

### Phase 1: MVP (1-2 days)
- [ ] Set up Gemini API client
- [ ] Create \`/api/chat\` endpoint
- [ ] Basic ChatWidget component
- [ ] System prompt with topic restrictions
- [ ] Feature flag integration

### Phase 2: Polish (1 day)
- [ ] Streaming responses
- [ ] Rate limiting
- [ ] Improved UI/UX
- [ ] Mobile responsiveness

### Phase 3: Production (1 day)
- [ ] Error tracking (Sentry)
- [ ] Usage metrics
- [ ] A/B testing readiness
- [ ] Documentation

---

## 12. Alternative: Vercel AI SDK

For streaming responses and better DX, consider the Vercel AI SDK:

\`\`\`bash
npm install ai @ai-sdk/google
\`\`\`

\`\`\`typescript
// src/app/api/chat/route.ts
import { google } from '@ai-sdk/google';
import { streamText } from 'ai';

export async function POST(req: Request) {
  const { messages } = await req.json();

  const result = await streamText({
    model: google('gemini-1.5-flash'),
    system: SYSTEM_PROMPT,
    messages,
  });

  return result.toDataStreamResponse();
}
\`\`\`

This provides built-in streaming, React hooks, and better error handling.

---

## 13. Decision

**Recommended approach:**
1. **Provider**: Google Gemini (free tier)
2. **SDK**: Vercel AI SDK for streaming support
3. **Topic restriction**: System prompt + keyword pre-filter
4. **UI**: Floating widget with Betis branding
5. **Rate limiting**: IP-based, 5 msg/min, 30 msg/hour

---

## References

- [Google Gemini API Documentation](https://ai.google.dev/docs)
- [Gemini Pricing](https://ai.google.dev/pricing)
- [Vercel AI SDK Documentation](https://sdk.vercel.ai/docs)
- [Next.js API Routes](https://nextjs.org/docs/app/building-your-application/routing/route-handlers)
- [Groq API](https://console.groq.com/docs/quickstart) (alternative)
