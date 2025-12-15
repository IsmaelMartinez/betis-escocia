/**
 * Chat API Route - AI Assistant for Peña Bética Escocesa
 */

import { google } from '@ai-sdk/google';
import { streamText, type CoreMessage } from 'ai';
import { NextRequest, NextResponse } from 'next/server';
import { ZodError } from 'zod';
import { chatRequestSchema } from '@/lib/schemas/chat';
import { SYSTEM_PROMPT, OFF_TOPIC_RESPONSE_ES, OFF_TOPIC_RESPONSE_EN } from '@/lib/chat/systemPrompt';
import { isLikelyOnTopic, detectLanguage } from '@/lib/chat/topicFilter';
import { hasFeature } from '@/lib/featureFlags';

// Simple in-memory rate limiting
const rateLimitStore = new Map<string, { count: number; timestamp: number }>();
const RATE_LIMIT = { maxRequests: 10, windowMs: 60 * 1000 };

function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for');
  return forwarded ? forwarded.split(',')[0].trim() : 'unknown';
}

function checkRateLimit(clientIP: string): { allowed: boolean; remaining: number } {
  const now = Date.now();
  const clientData = rateLimitStore.get(clientIP);
  
  if (!clientData || (now - clientData.timestamp) > RATE_LIMIT.windowMs) {
    rateLimitStore.set(clientIP, { count: 1, timestamp: now });
    return { allowed: true, remaining: RATE_LIMIT.maxRequests - 1 };
  }
  
  if (clientData.count >= RATE_LIMIT.maxRequests) {
    return { allowed: false, remaining: 0 };
  }
  
  clientData.count++;
  return { allowed: true, remaining: RATE_LIMIT.maxRequests - clientData.count };
}

export async function POST(request: NextRequest) {
  // Check feature flag
  if (!hasFeature('show-chat-assistant')) {
    return NextResponse.json({ error: 'Chat assistant is not enabled' }, { status: 404 });
  }
  
  // Check API key
  const apiKey = process.env.GOOGLE_GEMINI_API_KEY;
  if (!apiKey) {
    console.error('GOOGLE_GEMINI_API_KEY is not configured');
    return NextResponse.json({ error: 'Chat service is not configured' }, { status: 503 });
  }
  
  // Rate limiting
  const clientIP = getClientIP(request);
  const { allowed, remaining } = checkRateLimit(clientIP);
  
  if (!allowed) {
    return NextResponse.json(
      { error: 'Demasiadas solicitudes. Por favor, espera un momento.' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }
  
  try {
    const body = await request.json();
    const { message, history } = chatRequestSchema.parse(body);
    
    // Topic pre-filtering
    const topicResult = isLikelyOnTopic(message);
    
    if (!topicResult.isOnTopic) {
      const language = detectLanguage(message);
      const offTopicResponse = language === 'es' ? OFF_TOPIC_RESPONSE_ES : OFF_TOPIC_RESPONSE_EN;
      return NextResponse.json({ response: offTopicResponse, filtered: true, remaining });
    }
    
    // Build messages for AI
    const messages: CoreMessage[] = [
      ...history.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      })),
      { role: 'user' as const, content: message },
    ];
    
    // Stream response from Gemini
    const result = streamText({
      model: google('gemini-2.0-flash'),
      system: SYSTEM_PROMPT,
      messages,
      maxOutputTokens: 500,
      temperature: 0.7,
    });
    
    return result.toTextStreamResponse({
      headers: { 'X-RateLimit-Remaining': remaining.toString() },
    });
    
  } catch (error) {
    console.error('Chat API error:', error);
    
    if (error instanceof ZodError) {
      return NextResponse.json(
        { error: 'Datos de entrada inválidos', details: error.issues },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: 'Error al procesar tu mensaje. Inténtalo de nuevo.' },
      { status: 500 }
    );
  }
}
