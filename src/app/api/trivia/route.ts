import { createApiHandler } from '@/lib/apiUtils';
import { supabase, createUserTriviaScore, getUserDailyTriviaScore, type SupabaseClient } from '@/lib/supabase';
import { triviaScoreSchema } from '@/lib/schemas/trivia';
import { log } from '@/lib/logger';
import { StandardErrors } from '@/lib/standardErrors';

// Define response types
type TriviaQuestion = {
  id: string;
  question_text: string;
  category: string;
  difficulty: string;
  trivia_answers: Array<{
    id: string;
    answer_text: string;
    is_correct: boolean;
  }>;
};

type TriviaGetResponse = TriviaQuestion[] | {
  message: string;
  score: number;
};

type TriviaPostResponse = {
  message: string;
};

async function getTriviaQuestions(userId?: string, authenticatedSupabase?: SupabaseClient): Promise<TriviaGetResponse> {
  // If user is authenticated, check if they have already played today
  if (userId && authenticatedSupabase) {
    const { success, data: existingScore, error: scoreError } = await getUserDailyTriviaScore(userId, authenticatedSupabase);

    if (!success) {
      log.error('Failed to check daily trivia score', scoreError, { userId });
      throw new Error(StandardErrors.TRIVIA.DAILY_SCORE_ERROR);
    }

    if (existingScore) {
      return { 
        message: 'You have already played today.', 
        score: existingScore.daily_score 
      };
    }
  }

  // Fetch trivia questions
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
    .limit(100);

  if (error) {
    log.error('Failed to fetch trivia questions', error, { 
      userId: userId || 'unauthenticated' 
    });
    throw new Error(error.message);
  }

  // Shuffle questions and answers to ensure randomness
  const shuffledQuestions = [...questions].sort(() => 0.5 - Math.random());
  const formattedQuestions = shuffledQuestions.map(q => ({
    ...q,
    trivia_answers: [...q.trivia_answers].sort(() => 0.5 - Math.random())
  }));

  return formattedQuestions;
}

async function saveTriviaScore(
  scoreData: { score: number }, 
  userId: string, 
  authenticatedSupabase: SupabaseClient
): Promise<TriviaPostResponse> {
  const { score } = scoreData;

  // Check if user has already submitted a score today
  const { success: checkSuccess, data: existingScore, error: checkError } = await getUserDailyTriviaScore(userId, authenticatedSupabase);

  if (!checkSuccess) {
    log.error('Failed to check existing daily trivia score before saving', checkError, { userId });
    throw new Error('Failed to check existing score');
  }

  if (existingScore) {
    throw new Error(StandardErrors.TRIVIA.ALREADY_PLAYED);
  }

  const { success, error } = await createUserTriviaScore({ user_id: userId, daily_score: score }, authenticatedSupabase);

  if (!success) {
    log.error('Failed to save trivia score', error, { userId, score });
    throw new Error(StandardErrors.TRIVIA.SAVE_SCORE_ERROR);
  }

  // Log successful score save as business event
  log.business('trivia_score_saved', { score }, { userId });

  return { message: 'Score saved successfully!' };
}

// GET - Get trivia questions
export const GET = createApiHandler({
  auth: 'optional', // Supports both authenticated and anonymous users
  handler: async (_, context) => {
    const { userId, authenticatedSupabase } = context;
    
    try {
      const result = await getTriviaQuestions(userId, authenticatedSupabase);
      return result;
    } catch (error) {
      log.error('Unexpected error in trivia GET API', error, { userId: userId || 'unauthenticated' });
      throw new Error('Internal Server Error');
    }
  }
});

// POST - Submit trivia score
export const POST = createApiHandler({
  auth: 'user', // Requires authentication
  schema: triviaScoreSchema,
  handler: async (validatedData, context) => {
    const { userId, authenticatedSupabase } = context;
    
    if (!authenticatedSupabase) {
      throw new Error(StandardErrors.TRIVIA.AUTHENTICATION_REQUIRED);
    }

    try {
      const result = await saveTriviaScore(validatedData, userId!, authenticatedSupabase);
      return result;
    } catch (error) {
      log.error('Unexpected error in trivia POST API', error, { userId });
      throw error; // Re-throw to preserve specific error messages
    }
  }
});