'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import { MessageCircle, X, Send, Loader2, Bot, User } from 'lucide-react';
// import { hasFeature } from '@/lib/featureFlags';
import { WELCOME_MESSAGE_ES } from '@/lib/chat/systemPrompt';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

export default function ChatWidget() {
  const [mounted, setMounted] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      setMessages([{ id: 'welcome', role: 'assistant', content: WELCOME_MESSAGE_ES }]);
    }
  }, [isOpen, messages.length]);

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, scrollToBottom]);

  useEffect(() => {
    if (isOpen && mounted) {
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen, mounted]);

  const sendMessage = async () => {
    const trimmedInput = inputValue.trim();
    if (!trimmedInput || isLoading) return;

    setError(null);
    const userMessage: Message = { id: Date.now().toString(), role: 'user', content: trimmedInput };
    setMessages(prev => [...prev, userMessage]);
    setInputValue('');
    setIsLoading(true);

    try {
      const history = messages
        .filter(m => m.id !== 'welcome' && m.content.trim().length > 0)
        .map(m => ({ role: m.role, content: m.content }));

      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmedInput, history }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Error al enviar mensaje');
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No response body');

      const decoder = new TextDecoder();
      let assistantContent = '';
      const assistantId = (Date.now() + 1).toString();
      setMessages(prev => [...prev, { id: assistantId, role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        assistantContent += decoder.decode(value, { stream: true });
        setMessages(prev => prev.map(m => m.id === assistantId ? { ...m, content: assistantContent } : m));
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    sendMessage();
  };

  // Must return null during SSR to prevent hydration mismatch
  if (!mounted) return null;

  // Feature flag - temporarily disabled for testing
  // const isEnabled = hasFeature('show-chat-assistant');
  // if (!isEnabled) return null;

  return (
    <div className="fixed bottom-4 right-4 z-[9999]">
      {isOpen && (
        <div className="mb-4 w-[350px] max-w-[calc(100vw-2rem)] bg-white rounded-lg shadow-2xl border border-gray-200 overflow-hidden flex flex-col" style={{ height: 'min(500px, calc(100vh - 120px))' }}>
          <div className="bg-gradient-to-r from-green-600 to-green-700 p-4 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <Bot className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <h3 className="text-white font-semibold text-sm">Asistente Peña Bética</h3>
                <p className="text-green-100 text-xs">¡Viva el Betis!</p>
              </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="text-white hover:text-yellow-400 p-1">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-lg px-4 py-2 ${message.role === 'user' ? 'bg-green-600 text-white' : 'bg-white text-gray-800 border border-gray-200'}`}>
                  <div className="flex items-start space-x-2">
                    {message.role === 'assistant' && <Bot className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />}
                    <p className="text-sm whitespace-pre-wrap break-words">{message.content}</p>
                    {message.role === 'user' && <User className="w-4 h-4 text-green-100 mt-0.5 flex-shrink-0" />}
                  </div>
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 rounded-lg px-4 py-2 flex items-center space-x-2">
                  <Bot className="w-4 h-4 text-green-600" />
                  <Loader2 className="w-4 h-4 animate-spin text-green-600" />
                  <span className="text-sm text-gray-500">Escribiendo...</span>
                </div>
              </div>
            )}
            {error && (
              <div className="flex justify-center">
                <div className="bg-red-50 text-red-600 border border-red-200 rounded-lg px-4 py-2 text-sm">{error}</div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSubmit} className="p-4 border-t border-gray-200 bg-white">
            <div className="flex space-x-2">
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder="Escribe tu mensaje..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-full text-sm focus:outline-none focus:border-green-500"
                disabled={isLoading}
                maxLength={500}
              />
              <button
                type="submit"
                disabled={isLoading || !inputValue.trim()}
                className="bg-green-600 text-white p-2 rounded-full hover:bg-green-700 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
              </button>
            </div>
          </form>
        </div>
      )}

      <button
        onClick={() => setIsOpen(!isOpen)}
        className={`w-14 h-14 rounded-full shadow-lg flex items-center justify-center transition-transform hover:scale-105 ${isOpen ? 'bg-gray-600' : 'bg-gradient-to-r from-green-600 to-green-700'}`}
      >
        {isOpen ? <X className="w-6 h-6 text-white" /> : <MessageCircle className="w-6 h-6 text-white" />}
      </button>
    </div>
  );
}
