import { createApiHandler } from '@/lib/apiUtils';
import { getUserDailyTriviaScore, getAuthenticatedSupabaseClient } from '@/lib/supabase';
import { log } from '@/lib/logger';

type TriviaScoreResponse = {
  score: number;
};

async function getUserTotalScore(context: { userId: string; clerkToken: string }): Promise<TriviaScoreResponse> {
  const { userId, clerkToken } = context;
  const authenticatedSupabase = getAuthenticatedSupabaseClient(clerkToken);

  const { success, data: existingScore, error: scoreError } = await getUserDailyTriviaScore(userId, authenticatedSupabase);

  if (!success) {
    log.error('Failed to check daily trivia score', scoreError, { userId });
    throw new Error('Failed to check daily score');
  }

  const score = existingScore?.daily_score || 0;
  
  log.info('Retrieved user trivia score', { userId }, { score });

  return { score };
}

export const GET = createApiHandler({
  auth: 'user',
  handler: async (validatedData, context) => {
    const { userId } = context;
    const { getToken } = await import('@clerk/nextjs/server').then(m => m.getAuth(context.request));
    const clerkToken = await getToken({ template: 'supabase' });
    return await getUserTotalScore({ userId: userId!, clerkToken: clerkToken! });
  }
});