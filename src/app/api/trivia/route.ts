import { NextRequest, NextResponse } from 'next/server';
import { getAuth } from '@clerk/nextjs/server';
import { supabase, createUserTriviaScore, getUserDailyTriviaScore, getAuthenticatedSupabaseClient } from '@/lib/supabase';

export async function GET(req: NextRequest) {
  const { userId, getToken } = getAuth(req);

  if (!userId) {
    // If no user is authenticated, return questions without checking daily score
    try {
      const { data: questions, error } = await supabase
        .from('trivia_questions')
        .select(`
          id,
          question_text,
          category,
          difficulty,
          trivia_answers(
            id,
            answer_text,
            is_correct
          )
        `)
        .limit(5);

      if (error) {
        console.error('Error fetching trivia questions for unauthenticated user:', error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }

      const shuffledQuestions = [...questions].sort(() => 0.5 - Math.random());
      const formattedQuestions = shuffledQuestions.map(q => ({
        ...q,
        trivia_answers: [...q.trivia_answers].sort(() => 0.5 - Math.random())
      }));

      return NextResponse.json(formattedQuestions);
    } catch (error) {
      console.error('Unexpected error in trivia API for unauthenticated user:', error);
      return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
    }
  }

  const token = await getToken();
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized: No Clerk token found' }, { status: 401 });
  }
  const authenticatedSupabase = getAuthenticatedSupabaseClient(token);

  // If user is authenticated, check if they have already played today
  const { success, data: existingScore, error: scoreError } = await getUserDailyTriviaScore(userId, authenticatedSupabase);

  if (!success) {
    console.error('Error checking daily trivia score:', scoreError);
    return NextResponse.json({ error: 'Failed to check daily score' }, { status: 500 });
  }

  if (existingScore) {
    return NextResponse.json({ message: 'You have already played today.', score: existingScore.daily_score }, { status: 403 });
  }

  try {
    // Fetch a random set of trivia questions
    const { data: questions, error } = await supabase
      .from('trivia_questions')
      .select(`
        id,
        question_text,
        category,
        difficulty,
        trivia_answers(
          id,
          answer_text,
          is_correct
        )
      `)
      .limit(10); // Fetch 10 questions for now

    if (error) {
      console.error('Error fetching trivia questions:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Shuffle questions and answers to ensure randomness
    const shuffledQuestions = [...questions].sort(() => 0.5 - Math.random());
    const formattedQuestions = shuffledQuestions.map(q => ({
      ...q,
      trivia_answers: [...q.trivia_answers].sort(() => 0.5 - Math.random())
    }));

    return NextResponse.json(formattedQuestions);
  } catch (error) {
    console.error('Unexpected error in trivia API:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const { userId, getToken } = getAuth(req);

  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const token = await getToken();
  if (!token) {
    return NextResponse.json({ error: 'Unauthorized: No Clerk token found' }, { status: 401 });
  }
  const authenticatedSupabase = getAuthenticatedSupabaseClient(token);

  const { score } = await req.json();

  if (typeof score !== 'number') {
    return NextResponse.json({ error: 'Invalid score provided' }, { status: 400 });
  }

  // Check if user has already submitted a score today
  const { success: checkSuccess, data: existingScore, error: checkError } = await getUserDailyTriviaScore(userId, authenticatedSupabase);

  if (!checkSuccess) {
    console.error('Error checking existing daily score:', checkError);
    return NextResponse.json({ error: 'Failed to check existing score' }, { status: 500 });
  }

  if (existingScore) {
    return NextResponse.json({ error: 'You have already submitted a score today.' }, { status: 409 });
  }

  const { success, error } = await createUserTriviaScore({ user_id: userId, daily_score: score }, authenticatedSupabase);

  if (!success) {
    console.error('Error saving trivia score:', error);
    return NextResponse.json({ error: 'Failed to save score' }, { status: 500 });
  }

  return NextResponse.json({ message: 'Score saved successfully!' }, { status: 201 });
}




