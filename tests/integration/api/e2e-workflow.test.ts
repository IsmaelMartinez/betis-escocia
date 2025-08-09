import { NextRequest } from 'next/server';
import { GET } from '@/app/api/trivia/route';
import { getAuth } from '@clerk/nextjs/server';

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

// (Supabase mocks are defined inside the jest.mock factory to avoid hoisting issues)

// Mock Clerk's getAuth
jest.mock('@clerk/nextjs/server', () => ({
  getAuth: jest.fn(() => ({
    userId: 'user_test_id',
    getToken: jest.fn(() => Promise.resolve('mock_clerk_token')),
  })),
}));

// Mock Supabase
jest.mock('@/lib/supabase', () => {
  // Flattened Supabase mocks to avoid deep nesting and hoisting issues
  const supabaseLimit = jest.fn(async () => ({
    data: [
      { id: 'q1', question_text: 'Question 1', trivia_answers: [] },
      { id: 'q2', question_text: 'Question 2', trivia_answers: [] },
    ],
    error: null,
  }));
  const supabaseSelect = jest.fn(() => ({ limit: supabaseLimit }));
  const supabaseFrom = jest.fn(() => ({ select: supabaseSelect }));

  const authSingle = jest.fn(async () => ({ data: null, error: null }));
  const authSelect = jest.fn(() => ({ single: authSingle }));
  const authFrom = jest.fn(() => ({ select: authSelect }));
  const mockAuthenticatedSupabaseClient = { from: authFrom };

  return {
    supabase: {
      from: supabaseFrom,
    },
    // Mock other functions from supabase.ts if needed by the trivia API
    getUserDailyTriviaScore: jest.fn(() => Promise.resolve({ success: true, data: null })), // User has not played today
    getAuthenticatedSupabaseClient: jest.fn(() => mockAuthenticatedSupabaseClient),
  };
});

const mockGetAuth = getAuth as jest.Mock;
const mockGetUserDailyTriviaScore = jest.requireMock('@/lib/supabase').getUserDailyTriviaScore;

describe('End-to-End API Workflow: Trivia with Authentication', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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