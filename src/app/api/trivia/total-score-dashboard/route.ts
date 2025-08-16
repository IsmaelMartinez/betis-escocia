import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { getAuthenticatedSupabaseClient } from '@/lib/supabase';
import { log } from '@/lib/logger';

type TotalScoreResponse = {
  totalScore: number;
};

async function getTotalScore(context: { userId: string; clerkToken: string }): Promise<TotalScoreResponse> {
  const { userId, clerkToken } = context;
  const authenticatedSupabase = getAuthenticatedSupabaseClient(clerkToken);

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

// Use the traditional route pattern like the working POST /api/trivia
export async function GET(req: NextRequest) {
  const { userId, getToken } = getAuth(req);

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = await getToken();
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized: No Clerk token found' }, { status: 401 });
  }
  
  try {
    const result = await getTotalScore({ userId, clerkToken: token });
    
    // Add cache-busting headers
    const response = NextResponse.json(result);
    response.headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
    
    return response;
  } catch (error) {
    log.error('Error in total score dashboard API', error, { userId });
    return NextResponse.json({ error: 'Failed to fetch total score' }, { status: 500 });
  }
}