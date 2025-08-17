import { createApiHandler } from '@/lib/apiUtils';
import { log } from '@/lib/logger';

export const GET = createApiHandler({
  auth: 'user',
  handler: async (_, context) => {
    const { id: userId } = context.user!;
    const authenticatedSupabase = context.authenticatedSupabase!;

    // Fetch ALL historical scores for the user (not just today's)
    const { data: allUserScores, error } = await authenticatedSupabase
      .from('user_trivia_scores')
      .select('daily_score, user_id, timestamp')
      .eq('user_id', userId)
      .order('timestamp', { ascending: false });

    if (error) {
      log.error('Failed to fetch all trivia scores for dashboard', JSON.stringify(error, null, 2), { userId });
      throw new Error(`Failed to fetch total score: ${error.message || JSON.stringify(error)}`);
    }

    const totalScore = allUserScores.reduce((sum: number, entry: { daily_score: number }) => sum + entry.daily_score, 0);

    log.info('Retrieved total trivia score for dashboard', { userId }, { 
      totalScore, 
      gameCount: allUserScores.length 
    });

    return { totalScore };
  }
});