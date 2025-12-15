/**
 * Chat Assistant Types
 */

export type MessageRole = 'user' | 'assistant';

export interface ChatMessage {
  role: MessageRole;
  content: string;
}

export interface TopicFilterResult {
  isOnTopic: boolean;
  confidence: 'high' | 'medium' | 'low';
  matchedTopics: string[];
}
