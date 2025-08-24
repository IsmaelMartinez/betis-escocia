import { createApiHandler } from '@/lib/apiUtils';
import { supabase, createUserTriviaScore, getUserDailyTriviaScore, getAuthenticatedSupabaseClient, type SupabaseClient } from '@/lib/supabase';
import { triviaScoreSchema } from '@/lib/schemas/trivia';
import { log } from '@/lib/logger';
import { StandardErrors } from '@/lib/standardErrors';
import { 
  checkDailyPlayStatus,
  validateTriviaScore,
  logTriviaBusinessEvent,
  handleTriviaError,
  TriviaPerformanceTracker,
  TriviaError,
  logTriviaEvent,
  type TriviaQuestion,
  type TriviaErrorContext
} from '@/lib/trivia/utils';

// Define response types (TriviaQuestion now imported from utils)

type TriviaGetResponse = TriviaQuestion[] | {
  message: string;
  score: number;
};

type TriviaPostResponse = {
  message: string;
};

type TriviaScoreResponse = {
  score: number;
};

type TriviaTotalScoreResponse = {
  totalScore: number;
};

async function getTriviaQuestions(
  userId?: string, 
  authenticatedSupabase?: SupabaseClient,
  context: TriviaErrorContext = {}
): Promise<TriviaGetResponse> {
  const tracker = new TriviaPerformanceTracker('getTriviaQuestions', { ...context, userId, action: 'questions' });
  
  try {
    logTriviaEvent('info', 'Starting trivia questions retrieval', { userId }, context);

    // If user is authenticated, check if they have already played today using shared utility
    if (userId && authenticatedSupabase) {
      const dailyCheckStart = performance.now();
      const dailyCheck = await checkDailyPlayStatus(userId, authenticatedSupabase);
      tracker.logDbQuery('daily_play_check', performance.now() - dailyCheckStart);

      if (dailyCheck.error) {
        throw new TriviaError(
          'DATABASE_ERROR',
          `Daily play check failed: ${dailyCheck.error}`,
          StandardErrors.TRIVIA.DAILY_SCORE_ERROR,
          500,
          { ...context, userId }
        );
      }

      if (dailyCheck.hasPlayedToday && dailyCheck.existingScore !== undefined) {
        logTriviaEvent('info', 'User has already played today', { 
          userId, 
          existingScore: dailyCheck.existingScore 
        }, context);
        
        tracker.complete(true, { alreadyPlayed: true, score: dailyCheck.existingScore });
        
        return { 
          message: 'You have already played today.', 
          score: dailyCheck.existingScore 
        };
      }
    }

    // Fetch trivia questions (database-level randomization for optimal variety)
    logTriviaEvent('info', 'Fetching random trivia questions from database', { limit: 5 }, context);
    
    const questionsStart = performance.now();
    // Temporary fallback: Fetch more questions and shuffle client-side until RPC function is created
    const { data: allQuestions, error } = await supabase
      .from('trivia_questions')
      .select(`
        id,
        question_text,
        category,
        difficulty,
        trivia_answers!inner(
          id,
          answer_text,
          is_correct
        )
      `)
      .limit(25); // Fetch 25 for better randomness
    
    // Client-side randomization until database function is available
    const questions = allQuestions 
      ? allQuestions.sort(() => 0.5 - Math.random()).slice(0, 5)
      : null;

    tracker.logDbQuery('fetch_questions', performance.now() - questionsStart);

    if (error) {
      throw new TriviaError(
        'DATABASE_ERROR',
        `Failed to fetch trivia questions: ${error.message}`,
        StandardErrors.TRIVIA.QUESTIONS_FETCH_ERROR,
        500,
        { ...context, userId, dbError: error }
      );
    }

    if (!questions || questions.length === 0) {
      throw new TriviaError(
        'BUSINESS_LOGIC_ERROR',
        'No trivia questions available in database',
        StandardErrors.TRIVIA.QUESTIONS_NOT_AVAILABLE,
        503,
        { ...context, userId }
      );
    }

    // Shuffle answers within each question (questions already randomized by database)
    const questionsWithShuffledAnswers = questions.map(question => ({
      ...question,
      trivia_answers: [...question.trivia_answers].sort(() => 0.5 - Math.random())
    }));

    // Log business event for questions retrieved
    logTriviaBusinessEvent('questions_retrieved', { 
      questionCount: questionsWithShuffledAnswers.length,
      randomizationMethod: 'database_order_by_random'
    }, { userId });

    logTriviaEvent('info', 'Successfully retrieved random trivia questions with shuffled answers', {
      userId,
      questionCount: questionsWithShuffledAnswers.length,
      randomizationMethod: 'database_level'
    }, context);

    tracker.complete(true, { 
      questionCount: questionsWithShuffledAnswers.length,
      randomizationMethod: 'database_order_by_random'
    });
    return questionsWithShuffledAnswers;

  } catch (error) {
    const triviaError = handleTriviaError(error, { ...context, userId }, 'getTriviaQuestions');
    
    logTriviaEvent('error', 'Failed to get trivia questions', {
      error: triviaError.message,
      type: triviaError.type,
      statusCode: triviaError.statusCode
    }, triviaError.context);
    
    tracker.complete(false, { error: triviaError.type });
    throw triviaError;
  }
}

async function saveTriviaScore(
  scoreData: { score: number }, 
  userId: string, 
  authenticatedSupabase: SupabaseClient,
  context: TriviaErrorContext = {}
): Promise<TriviaPostResponse> {
  const tracker = new TriviaPerformanceTracker('saveTriviaScore', { ...context, userId, action: 'submit' });
  
  try {
    const { score } = scoreData;
    
    logTriviaEvent('info', 'Starting trivia score submission', { userId, score }, context);

    // Validate score using shared utility
    const scoreValidation = validateTriviaScore(score);
    if (!scoreValidation.isValid) {
      throw new TriviaError(
        'VALIDATION_ERROR',
        `Invalid trivia score attempted: ${scoreValidation.error}`,
        StandardErrors.TRIVIA.SCORE_VALIDATION_ERROR,
        400,
        { ...context, userId, score, validationError: scoreValidation.error }
      );
    }

    // Use shared utility to check if user has already submitted a score today
    const dailyCheckStart = performance.now();
    const dailyCheck = await checkDailyPlayStatus(userId, authenticatedSupabase);
    tracker.logDbQuery('daily_play_check_before_save', performance.now() - dailyCheckStart);

    if (dailyCheck.error) {
      throw new TriviaError(
        'DATABASE_ERROR',
        `Failed to check existing daily trivia score before saving: ${dailyCheck.error}`,
        StandardErrors.TRIVIA.DAILY_SCORE_ERROR,
        500,
        { ...context, userId, score }
      );
    }

    if (dailyCheck.hasPlayedToday) {
      throw new TriviaError(
        'BUSINESS_LOGIC_ERROR',
        'User attempted to submit score after already playing today',
        StandardErrors.TRIVIA.ALREADY_PLAYED,
        409,
        { ...context, userId, score, existingScore: dailyCheck.existingScore }
      );
    }

    // Save the score to database
    logTriviaEvent('info', 'Saving trivia score to database', { userId, score }, context);
    
    const saveStart = performance.now();
    const { success, error } = await createUserTriviaScore(
      { user_id: userId, daily_score: score }, 
      authenticatedSupabase
    );
    tracker.logDbQuery('save_score', performance.now() - saveStart);

    if (!success) {
      throw new TriviaError(
        'DATABASE_ERROR',
        `Failed to save trivia score: ${error}`,
        StandardErrors.TRIVIA.SAVE_SCORE_ERROR,
        500,
        { ...context, userId, score, dbError: error }
      );
    }

    // Use shared utility for business event logging
    logTriviaBusinessEvent('score_saved', { score }, { userId });

    logTriviaEvent('info', 'Successfully saved trivia score', { userId, score }, context);
    
    tracker.complete(true, { score });
    return { message: 'Score saved successfully!' };

  } catch (error) {
    const triviaError = handleTriviaError(error, { ...context, userId }, 'saveTriviaScore');
    
    logTriviaEvent('error', 'Failed to save trivia score', {
      error: triviaError.message,
      type: triviaError.type,
      statusCode: triviaError.statusCode,
      score: scoreData.score
    }, triviaError.context);
    
    tracker.complete(false, { error: triviaError.type, score: scoreData.score });
    throw triviaError;
  }
}

async function getUserTriviaScore(userId: string, clerkToken: string): Promise<TriviaScoreResponse> {
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

async function getUserTotalTriviaScore(
  userId: string, 
  authenticatedSupabase: SupabaseClient,
  context: TriviaErrorContext = {}
): Promise<TriviaTotalScoreResponse> {
  const tracker = new TriviaPerformanceTracker('getUserTotalTriviaScore', { ...context, userId, action: 'total' });
  
  try {
    logTriviaEvent('info', 'Starting total trivia score retrieval', { userId }, context);

    // Optimized: Use SQL aggregation instead of client-side calculation
    const aggregateStart = performance.now();
    const { data: aggregateResult, error } = await authenticatedSupabase
      .from('user_trivia_scores')
      .select('daily_score.sum(), user_id.count()')
      .eq('user_id', userId)
      .single();
    
    tracker.logDbQuery('aggregate_total_score', performance.now() - aggregateStart);

    if (error) {
      logTriviaEvent('warn', 'SQL aggregation failed, falling back to client-side calculation', { 
        userId, 
        aggregateError: error.message 
      }, context);
      
      // Fallback to client-side calculation if SQL aggregation fails
      const fallbackStart = performance.now();
      const { data: allUserScores, error: fallbackError } = await authenticatedSupabase
        .from('user_trivia_scores')
        .select('daily_score')
        .eq('user_id', userId);
      
      tracker.logDbQuery('fallback_total_score', performance.now() - fallbackStart);
      
      if (fallbackError) {
        throw new TriviaError(
          'DATABASE_ERROR',
          `Failed to fetch total score with fallback: ${fallbackError.message}`,
          StandardErrors.TRIVIA.AGGREGATION_ERROR,
          500,
          { ...context, userId, fallbackError: fallbackError.message }
        );
      }
      
      const totalScore = allUserScores?.reduce((sum: number, entry: { daily_score: number }) => sum + entry.daily_score, 0) || 0;
      
      logTriviaEvent('info', 'Successfully retrieved total score via fallback', { 
        userId, 
        totalScore,
        gameCount: allUserScores?.length || 0 
      }, context);
      
      tracker.complete(true, { totalScore, gameCount: allUserScores?.length || 0, method: 'fallback' });
      return { totalScore };
    }

    const totalScore = aggregateResult?.sum || 0;
    const gameCount = aggregateResult?.count || 0;

    logTriviaEvent('info', 'Successfully retrieved total score via SQL aggregation', { 
      userId, 
      totalScore, 
      gameCount 
    }, context);

    tracker.complete(true, { totalScore, gameCount, method: 'aggregation' });
    return { totalScore };

  } catch (error) {
    const triviaError = handleTriviaError(error, { ...context, userId }, 'getUserTotalTriviaScore');
    
    logTriviaEvent('error', 'Failed to get total trivia score', {
      error: triviaError.message,
      type: triviaError.type,
      statusCode: triviaError.statusCode
    }, triviaError.context);
    
    tracker.complete(false, { error: triviaError.type });
    throw triviaError;
  }
}

// GET - Consolidated endpoint with query parameter routing and comprehensive error handling
export const GET = createApiHandler({
  auth: 'optional', // Supports both authenticated and anonymous users
  handler: async (_, context) => {
    const { userId, authenticatedSupabase, request } = context;
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'questions';
    
    // Build comprehensive context for error handling and logging
    const triviaContext: TriviaErrorContext = {
      userId,
      action,
      requestId: request.headers.get('x-request-id') || `req_${Date.now()}`,
      userAgent: request.headers.get('user-agent') || undefined,
      timestamp: new Date().toISOString()
    };

    const tracker = new TriviaPerformanceTracker(`GET_${action}`, triviaContext);
    
    try {
      logTriviaEvent('info', `Processing GET request for action: ${action}`, { 
        action, 
        userId: userId || 'anonymous',
        hasAuthentication: !!userId
      }, triviaContext);

      // Route based on action parameter with enhanced error handling
      switch (action) {
        case 'questions':
          // Get trivia questions (default behavior)
          const result = await getTriviaQuestions(userId, authenticatedSupabase, triviaContext);
          tracker.complete(true, { action, questionCount: Array.isArray(result) ? result.length : 0 });
          return result;
          
        case 'score':
          // Get user's daily trivia score (requires authentication)
          if (!userId) {
            throw new TriviaError(
              'AUTHENTICATION_ERROR',
              'Authentication required for score retrieval',
              StandardErrors.TRIVIA.AUTHENTICATION_REQUIRED,
              401,
              triviaContext
            );
          }
          
          try {
            const { getAuth } = await import('@clerk/nextjs/server');
            const { getToken } = getAuth(request);
            const clerkToken = await getToken({ template: 'supabase' });
            
            if (!clerkToken) {
              throw new TriviaError(
                'AUTHENTICATION_ERROR',
                'Failed to retrieve authentication token',
                StandardErrors.TRIVIA.TOKEN_INVALID,
                401,
                triviaContext
              );
            }
            
            const scoreResult = await getUserTriviaScore(userId, clerkToken);
            tracker.complete(true, { action, score: scoreResult.score });
            return scoreResult;
          } catch (tokenError) {
            throw handleTriviaError(tokenError, triviaContext, 'token_retrieval');
          }
          
        case 'total':
          // Get user's total accumulated trivia score (requires authentication)
          if (!userId || !authenticatedSupabase) {
            throw new TriviaError(
              'AUTHENTICATION_ERROR',
              'Authentication required for total score retrieval',
              StandardErrors.TRIVIA.AUTHENTICATION_REQUIRED,
              401,
              triviaContext
            );
          }
          
          const totalResult = await getUserTotalTriviaScore(userId, authenticatedSupabase, triviaContext);
          tracker.complete(true, { action, totalScore: totalResult.totalScore });
          return totalResult;
          
        default:
          throw new TriviaError(
            'VALIDATION_ERROR',
            `Invalid action parameter: ${action}`,
            StandardErrors.TRIVIA.INVALID_ACTION,
            400,
            { ...triviaContext, invalidAction: action }
          );
      }
    } catch (error) {
      const triviaError = handleTriviaError(error, triviaContext, `GET_${action}`);
      
      logTriviaEvent('error', `Failed GET request for action: ${action}`, {
        action,
        error: triviaError.message,
        type: triviaError.type,
        statusCode: triviaError.statusCode,
        userId: userId || 'anonymous'
      }, triviaError.context);
      
      tracker.complete(false, { 
        action, 
        error: triviaError.type, 
        statusCode: triviaError.statusCode 
      });
      
      throw triviaError;
    }
  }
});

// POST - Consolidated endpoint for score submission with comprehensive error handling
export const POST = createApiHandler({
  auth: 'user', // Requires authentication
  schema: triviaScoreSchema,
  handler: async (validatedData, context) => {
    const { userId, authenticatedSupabase, request } = context;
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action') || 'submit';
    
    // Build comprehensive context for error handling and logging
    const triviaContext: TriviaErrorContext = {
      userId,
      action,
      requestId: request.headers.get('x-request-id') || `req_${Date.now()}`,
      userAgent: request.headers.get('user-agent') || undefined,
      timestamp: new Date().toISOString()
    };

    const tracker = new TriviaPerformanceTracker(`POST_${action}`, triviaContext);
    
    if (!authenticatedSupabase) {
      throw new TriviaError(
        'AUTHENTICATION_ERROR',
        'Authenticated Supabase client not available',
        StandardErrors.TRIVIA.AUTHENTICATION_REQUIRED,
        401,
        triviaContext
      );
    }

    try {
      logTriviaEvent('info', `Processing POST request for action: ${action}`, { 
        action, 
        userId,
        score: validatedData.score
      }, triviaContext);

      // Route based on action parameter with enhanced error handling
      switch (action) {
        case 'submit':
          // Submit trivia score (default behavior)
          const result = await saveTriviaScore(validatedData, userId!, authenticatedSupabase, triviaContext);
          tracker.complete(true, { action, score: validatedData.score });
          return result;
          
        default:
          throw new TriviaError(
            'VALIDATION_ERROR',
            `Invalid action parameter for POST: ${action}`,
            StandardErrors.TRIVIA.INVALID_ACTION,
            400,
            { ...triviaContext, invalidAction: action }
          );
      }
    } catch (error) {
      const triviaError = handleTriviaError(error, triviaContext, `POST_${action}`);
      
      logTriviaEvent('error', `Failed POST request for action: ${action}`, {
        action,
        error: triviaError.message,
        type: triviaError.type,
        statusCode: triviaError.statusCode,
        userId,
        score: validatedData.score
      }, triviaError.context);
      
      tracker.complete(false, { 
        action, 
        error: triviaError.type, 
        statusCode: triviaError.statusCode,
        score: validatedData.score
      });
      
      throw triviaError;
    }
  }
});