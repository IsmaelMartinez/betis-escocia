import { describe, it, expect, beforeEach, vi } from 'vitest';
import { NextRequest } from 'next/server';
import { GET } from '@/app/api/trivia/route';
import { getAuth } from '@clerk/nextjs/server';
import { getUserDailyTriviaScore } from '@/lib/supabase';

// Ensure Response.json (static) exists for NextResponse.json in Jest env
type ResponseStatic = typeof globalThis.Response & {
  json?: (data: unknown, init?: ResponseInit) => Response;
};
const ResponseStaticRef = globalThis.Response as unknown as ResponseStatic;
if (!ResponseStaticRef.json) {
  ResponseStaticRef.json = (data: unknown, init?: ResponseInit) =>
    new Response(JSON.stringify(data), {
      ...init,
      headers: { ...(init?.headers || {}), 'content-type': 'application/json' },
    });
}

// (Supabase mocks are defined inside the vi.mock factory to avoid hoisting issues)

// Mock Clerk's getAuth
vi.mock('@clerk/nextjs/server', () => ({
  getAuth: vi.fn(() => ({
    userId: 'user_test_id',
    getToken: vi.fn(() => Promise.resolve('mock_clerk_token')),
  })),
}));

// Mock Supabase
vi.mock('@/lib/supabase', () => {
  // Flattened Supabase mocks to avoid deep nesting and hoisting issues
  const supabaseLimit = vi.fn(async () => ({
    data: [
      { id: 'q1', question_text: 'Question 1', trivia_answers: [] },
      { id: 'q2', question_text: 'Question 2', trivia_answers: [] },
    ],
    error: null,
  }));
  const supabaseSelect = vi.fn(() => ({ limit: supabaseLimit }));
  const supabaseFrom = vi.fn(() => ({ select: supabaseSelect }));

  const authSingle = vi.fn(async () => ({ data: null, error: null }));
  const authSelect = vi.fn(() => ({ single: authSingle }));
  const authFrom = vi.fn(() => ({ select: authSelect }));
  const mockAuthenticatedSupabaseClient = { from: authFrom };

  return {
    supabase: {
      from: supabaseFrom,
    },
    // Mock other functions from supabase.ts if needed by the trivia API
    getUserDailyTriviaScore: vi.fn(() => Promise.resolve({ success: true, data: null })), // User has not played today
    getAuthenticatedSupabaseClient: vi.fn(() => mockAuthenticatedSupabaseClient),
  };
});

const mockGetAuth = getAuth as any;
const mockGetUserDailyTriviaScore = vi.mocked(getUserDailyTriviaScore);

describe('End-to-End API Workflow: Trivia with Authentication', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return trivia questions for an authenticated user who has not played today', async () => {
    const mockRequest = new NextRequest('http://localhost/api/trivia');

    const response = await GET(mockRequest);
    const data = await response.json();

    expect(response.status).toBe(200);
  expect(data).toHaveLength(2);
  const texts = (data as Array<{ question_text: string }>).map(q => q.question_text);
  expect(texts).toEqual(expect.arrayContaining(['Question 1', 'Question 2']));
    expect(mockGetAuth).toHaveBeenCalledTimes(1);
    expect(mockGetUserDailyTriviaScore).toHaveBeenCalledWith('user_test_id', expect.any(Object)); // Check userId and authenticatedSupabase
  });
});