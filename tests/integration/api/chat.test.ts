import { describe, it, expect, vi, beforeEach } from 'vitest';
import { NextRequest } from 'next/server';
import { POST } from '@/app/api/chat/route';

// Mock feature flags
vi.mock('@/lib/featureFlags', () => ({
  hasFeature: vi.fn((flag: string) => flag === 'show-chat-assistant'),
}));

// Mock the AI SDK
vi.mock('@ai-sdk/google', () => ({
  google: vi.fn(() => ({ modelId: 'gemini-2.0-flash' })),
}));

vi.mock('ai', () => ({
  streamText: vi.fn(() => ({
    toTextStreamResponse: vi.fn(() => new Response('Streaming response', {
      headers: { 'Content-Type': 'text/plain' }
    })),
  })),
}));

// Mock environment variables
const originalEnv = process.env;

describe('Chat API Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env = { ...originalEnv, GOOGLE_GEMINI_API_KEY: 'test-api-key' };
  });

  afterEach(() => {
    process.env = originalEnv;
  });

  describe('POST /api/chat', () => {
    it('returns 404 when feature is disabled', async () => {
      const { hasFeature } = await import('@/lib/featureFlags');
      vi.mocked(hasFeature).mockReturnValue(false);

      const request = new NextRequest('http://localhost/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: 'Hello' }),
      });

      const response = await POST(request);
      expect(response.status).toBe(404);
      
      const data = await response.json();
      expect(data.error).toBe('Chat assistant is not enabled');
    });

    it('returns 503 when API key is not configured', async () => {
      const { hasFeature } = await import('@/lib/featureFlags');
      vi.mocked(hasFeature).mockReturnValue(true);
      delete process.env.GOOGLE_GEMINI_API_KEY;

      const request = new NextRequest('http://localhost/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: 'Hello' }),
      });

      const response = await POST(request);
      expect(response.status).toBe(503);
    });

    it('validates request body with Zod schema', async () => {
      const { hasFeature } = await import('@/lib/featureFlags');
      vi.mocked(hasFeature).mockReturnValue(true);

      const request = new NextRequest('http://localhost/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: '' }), // Empty message
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error).toBe('Datos de entrada inválidos');
    });

    it('rejects messages exceeding max length', async () => {
      const { hasFeature } = await import('@/lib/featureFlags');
      vi.mocked(hasFeature).mockReturnValue(true);

      const longMessage = 'a'.repeat(501);
      const request = new NextRequest('http://localhost/api/chat', {
        method: 'POST',
        body: JSON.stringify({ message: longMessage }),
      });

      const response = await POST(request);
      expect(response.status).toBe(400);
    });

    it('filters off-topic messages and returns filtered response', async () => {
      const { hasFeature } = await import('@/lib/featureFlags');
      vi.mocked(hasFeature).mockReturnValue(true);

      const request = new NextRequest('http://localhost/api/chat', {
        method: 'POST',
        body: JSON.stringify({ 
          message: 'Write me a Python script to hack into a bank system' 
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.filtered).toBe(true);
      expect(data.response).toContain('Peña Bética Escocesa');
    });

    it('processes valid on-topic messages', async () => {
      const { hasFeature } = await import('@/lib/featureFlags');
      vi.mocked(hasFeature).mockReturnValue(true);

      const request = new NextRequest('http://localhost/api/chat', {
        method: 'POST',
        body: JSON.stringify({ 
          message: '¿Cuándo juega el Betis?' 
        }),
      });

      const response = await POST(request);
      // Should return streaming response (200 OK)
      expect(response.status).toBe(200);
    });

    it('handles message history correctly', async () => {
      const { hasFeature } = await import('@/lib/featureFlags');
      vi.mocked(hasFeature).mockReturnValue(true);

      const request = new NextRequest('http://localhost/api/chat', {
        method: 'POST',
        body: JSON.stringify({ 
          message: 'Tell me more about the stadium',
          history: [
            { role: 'user', content: 'Hello' },
            { role: 'assistant', content: 'Hi! How can I help?' },
          ]
        }),
      });

      const response = await POST(request);
      expect(response.status).toBe(200);
    });
  });
});
