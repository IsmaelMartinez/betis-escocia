/**
 * Topic Filter for AI Chat Assistant
 */

import type { TopicFilterResult } from './types';

const ALLOWED_TOPICS: string[] = [
  // Betis-related
  'betis', 'betico', 'béticos', 'verdiblanco', 'heliópolis', 'benito villamarín',
  'villamarin', 'sevilla', 'verdiblancos',
  // La Liga
  'la liga', 'liga española', 'fútbol', 'futbol', 'primera división',
  // Scotland-related
  'escocia', 'edimburgo', 'scotland', 'edinburgh', 'scottish',
  'celtic', 'rangers', 'hearts', 'hibs', 'hibernian', 'scottish premiership',
  // Peña-related
  'peña', 'pena', 'polwarth', 'tavern', 'pub', 'no busques más',
  // Football terms
  'partido', 'partidos', 'gol', 'jugador', 'entrenador', 'fichaje', 'estadio',
  'copa', 'champions', 'europa league', 'temporada', 'clasificación',
  'match', 'goal', 'player', 'coach', 'transfer', 'stadium', 'season',
  // Events
  'trivia', 'rsvp', 'evento', 'event', 'unirse', 'join',
  // Players
  'joaquín', 'fekir', 'pellegrini', 'isco', 'lo celso', 'juanmi',
];

const ALLOWED_SHORT_PATTERNS = [
  /^hola/i, /^hello/i, /^hi$/i, /^hey$/i,
  /^buenos?\s*(días|dias|tardes|noches)/i,
  /^gracias/i, /^thanks/i, /^ayuda/i, /^help$/i,
];

const SUSPICIOUS_PATTERNS = [
  /write\s*(me\s*)?(a\s*)?(code|script|program)/i,
  /hack/i, /password/i, /credit\s*card/i, /bitcoin/i, /crypto/i,
  /ignore\s*(previous|all)\s*(instructions|prompts)/i,
  /pretend\s*you/i, /act\s*as\s*if/i,
];

export function isLikelyOnTopic(message: string): TopicFilterResult {
  const normalized = message.toLowerCase().trim();
  const matchedTopics: string[] = [];
  
  // Allow short messages
  if (normalized.length < 15) {
    for (const pattern of ALLOWED_SHORT_PATTERNS) {
      if (pattern.test(normalized)) {
        return { isOnTopic: true, confidence: 'high', matchedTopics: ['greeting'] };
      }
    }
    return { isOnTopic: true, confidence: 'medium', matchedTopics: ['short-message'] };
  }
  
  // Check suspicious patterns
  for (const pattern of SUSPICIOUS_PATTERNS) {
    if (pattern.test(normalized)) {
      return { isOnTopic: false, confidence: 'high', matchedTopics: [] };
    }
  }
  
  // Check topic keywords
  for (const topic of ALLOWED_TOPICS) {
    if (normalized.includes(topic.toLowerCase())) {
      matchedTopics.push(topic);
    }
  }
  
  if (matchedTopics.length > 0) {
    return {
      isOnTopic: true,
      confidence: matchedTopics.length >= 2 ? 'high' : 'medium',
      matchedTopics,
    };
  }
  
  // Allow medium-length messages, let AI handle
  if (normalized.length < 100) {
    return { isOnTopic: true, confidence: 'low', matchedTopics: [] };
  }
  
  return { isOnTopic: false, confidence: 'medium', matchedTopics: [] };
}

export function isOnTopic(message: string): boolean {
  return isLikelyOnTopic(message).isOnTopic;
}

export function detectLanguage(message: string): 'es' | 'en' {
  const spanishIndicators = [
    /[áéíóúñ¿¡]/,
    /\b(hola|buenos|gracias|cómo|qué|dónde)\b/i,
  ];
  for (const pattern of spanishIndicators) {
    if (pattern.test(message)) return 'es';
  }
  return 'en';
}
