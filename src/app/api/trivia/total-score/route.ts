import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { getUserDailyTriviaScore, getAuthenticatedSupabaseClient } from '@/lib/supabase';

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
    const { success, data: existingScore, error: scoreError } = await getUserDailyTriviaScore(userId, authenticatedSupabase);

    if (!success) {
      console.error('Error checking daily trivia score:', scoreError);
      return NextResponse.json({ error: 'Failed to check daily score' }, { status: 500 });
    }

    if (existingScore) {
      return NextResponse.json({ score: existingScore.daily_score }, { status: 200 });
    } else {
      return NextResponse.json({ score: 0 }, { status: 200 }); // No score for today yet
    }
  } catch (error) {
    console.error('Unexpected error in total-score API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
