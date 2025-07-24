import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { getAuthenticatedSupabaseClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { userId, getToken } = getAuth(req);

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = await getToken();
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized: No Clerk token found' }, { status: 401 });
  }
  const authenticatedSupabase = getAuthenticatedSupabaseClient(token);

  try {
    // Fetch all scores for the user to calculate total
    const { data: scores, error } = await authenticatedSupabase
      .from('user_trivia_scores')
      .select('daily_score')
      .eq('user_id', userId);

    if (error) {
      console.error('Error fetching all trivia scores:', error);
      return NextResponse.json({ error: 'Failed to fetch total score' }, { status: 500 });
    }

    const totalScore = scores.reduce((sum: number, entry: { daily_score: number }) => sum + entry.daily_score, 0);

    return NextResponse.json({ totalScore }, { status: 200 });
  } catch (error) {
    console.error('Unexpected error in total-score-dashboard API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
