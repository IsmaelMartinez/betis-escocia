import { createApiHandler } from '@/lib/apiUtils';
import { getAuthenticatedSupabaseClient } from '@/lib/supabase';
import { log } from '@/lib/logger';

type TotalScoreResponse = {
  totalScore: number;
};

async function getTotalScore(context: { userId: string; clerkToken: string }): Promise<TotalScoreResponse> {
  const { userId, clerkToken } = context;
  const authenticatedSupabase = getAuthenticatedSupabaseClient(clerkToken);

  // Fetch all scores for the user to calculate total
  const { data: scores, error } = await authenticatedSupabase
    .from('user_trivia_scores')
    .select('daily_score')
    .eq('user_id', userId);

  if (error) {
    log.error('Failed to fetch all trivia scores for dashboard', error, { userId });
    throw new Error('Failed to fetch total score');
  }

  const totalScore = scores.reduce((sum: number, entry: { daily_score: number }) => sum + entry.daily_score, 0);

  log.info('Retrieved total trivia score for dashboard', { userId }, { 
    totalScore, 
    gameCount: scores.length 
  });

  return { totalScore };
}

export const GET = createApiHandler({
  auth: 'user',
  handler: async (validatedData, context) => {
    const { userId } = context;
    const { getToken } = await import('@clerk/nextjs/server').then(m => m.getAuth(context.request));
    const clerkToken = await getToken({ template: 'supabase' });
    return await getTotalScore({ userId: userId!, clerkToken: clerkToken! });
  }
});