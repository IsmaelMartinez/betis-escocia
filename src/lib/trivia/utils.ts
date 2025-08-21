import { getUserDailyTriviaScore, type SupabaseClient } from '@/lib/supabase';
import { log } from '@/lib/logger';
import { StandardErrors } from '@/lib/standardErrors';

// Type definitions for trivia utilities
export type TriviaQuestion = {
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

export type DailyPlayCheckResult = {
  hasPlayedToday: boolean;
  existingScore?: number;
  error?: string;
};

/**
 * Shared utility function to check if user has already played trivia today
 * Eliminates duplicate daily-play-check logic across the application
 */
export async function checkDailyPlayStatus(
  userId: string, 
  authenticatedSupabase: SupabaseClient
): Promise<DailyPlayCheckResult> {
  try {
    const { success, data: existingScore, error: scoreError } = await getUserDailyTriviaScore(userId, authenticatedSupabase);

    if (!success) {
      log.error('Failed to check daily trivia score in utility', scoreError, { userId });
      return {
        hasPlayedToday: false,
        error: 'Failed to check daily play status'
      };
    }

    if (existingScore) {
      log.info('User has already played trivia today', { userId }, { score: existingScore.daily_score });
      return {
        hasPlayedToday: true,
        existingScore: existingScore.daily_score
      };
    }

    return {
      hasPlayedToday: false
    };
  } catch (error) {
    log.error('Unexpected error checking daily play status', error, { userId });
    return {
      hasPlayedToday: false,
      error: 'Unexpected error during daily play check'
    };
  }
}

/**
 * Shared utility function to shuffle trivia questions and their answers
 * Ensures consistent randomization logic across the application
 */
export function shuffleTriviaQuestions(questions: TriviaQuestion[]): TriviaQuestion[] {
  // Shuffle the questions array
  const shuffledQuestions = [...questions].sort(() => 0.5 - Math.random());
  
  // Shuffle answers within each question for additional randomization
  return shuffledQuestions.map(question => ({
    ...question,
    trivia_answers: [...question.trivia_answers].sort(() => 0.5 - Math.random())
  }));
}

/**
 * Shared utility function to validate trivia score
 * Provides consistent score validation logic
 */
export function validateTriviaScore(score: number): { isValid: boolean; error?: string } {
  if (typeof score !== 'number') {
    return { isValid: false, error: 'Score must be a number' };
  }

  if (!Number.isInteger(score)) {
    return { isValid: false, error: 'Score must be an integer' };
  }

  if (score < 0) {
    return { isValid: false, error: 'Score cannot be negative' };
  }

  if (score > 100) {
    return { isValid: false, error: 'Score cannot exceed 100%' };
  }

  return { isValid: true };
}

/**
 * Shared utility function to calculate trivia points based on score
 * Centralizes scoring algorithm for consistency
 */
export function calculateTriviaPoints(score: number): number {
  const validation = validateTriviaScore(score);
  if (!validation.isValid) {
    throw new Error(`Invalid score for points calculation: ${validation.error}`);
  }

  // Simple 1:1 mapping for now, but can be enhanced with multipliers, bonuses, etc.
  return score;
}

/**
 * Shared utility function to format trivia API responses
 * Ensures consistent response structure across endpoints
 */
export function formatTriviaResponse<T>(data: T, success: boolean = true): { success: boolean; data?: T; error?: string } {
  return success ? { success, data } : { success: false, error: data as string };
}

/**
 * Shared utility function to handle trivia authentication errors
 * Centralizes authentication error handling for trivia endpoints
 */
export function handleTriviaAuthError(userId?: string): never {
  const error = StandardErrors.TRIVIA.AUTHENTICATION_REQUIRED;
  log.warn('Trivia authentication required', { userId: userId || 'none' });
  throw new Error(error);
}

/**
 * Shared utility function to log trivia business events
 * Provides consistent business event logging for trivia actions
 */
export function logTriviaBusinessEvent(
  event: 'score_saved' | 'questions_retrieved' | 'daily_check_performed',
  data: Record<string, unknown>,
  context: { userId?: string }
) {
  log.business(`trivia_${event}`, data, context);
}

/**
 * Enhanced error handling utilities for trivia system
 */
export type TriviaErrorType = 
  | 'AUTHENTICATION_ERROR'
  | 'DATABASE_ERROR' 
  | 'VALIDATION_ERROR'
  | 'RATE_LIMIT_ERROR'
  | 'BUSINESS_LOGIC_ERROR'
  | 'PERFORMANCE_ERROR'
  | 'UNEXPECTED_ERROR';

export interface TriviaErrorContext {
  userId?: string;
  action?: string;
  timestamp?: string;
  requestId?: string;
  userAgent?: string;
  ipAddress?: string;
  performanceData?: {
    startTime: number;
    duration?: number;
    dbQueryTime?: number;
  };
  // Additional error context
  dbError?: unknown;
  validationError?: string;
  invalidAction?: string;
  existingScore?: number;
  score?: number;
  operation?: string;
  fallbackError?: string;
  aggregateError?: string;
}

export class TriviaError extends Error {
  public readonly type: TriviaErrorType;
  public readonly context: TriviaErrorContext;
  public readonly statusCode: number;
  public readonly userMessage: string;

  constructor(
    type: TriviaErrorType,
    message: string,
    userMessage: string,
    statusCode: number = 500,
    context: TriviaErrorContext = {}
  ) {
    super(message);
    this.name = 'TriviaError';
    this.type = type;
    this.userMessage = userMessage;
    this.statusCode = statusCode;
    this.context = {
      ...context,
      timestamp: context.timestamp || new Date().toISOString(),
    };
  }
}

/**
 * Comprehensive error handler for trivia operations
 */
export function handleTriviaError(
  error: unknown,
  context: TriviaErrorContext,
  operation: string
): TriviaError {
  const baseContext = {
    ...context,
    operation,
    timestamp: new Date().toISOString(),
  };

  // Handle known TriviaError instances
  if (error instanceof TriviaError) {
    return new TriviaError(
      error.type,
      error.message,
      error.userMessage,
      error.statusCode,
      { ...error.context, ...baseContext }
    );
  }

  // Handle standard JavaScript errors
  if (error instanceof Error) {
    const errorMessage = error.message.toLowerCase();

    // Database connection errors
    if (errorMessage.includes('connection') || errorMessage.includes('timeout')) {
      return new TriviaError(
        'DATABASE_ERROR',
        `Database connection failed during ${operation}: ${error.message}`,
        StandardErrors.TRIVIA.DATABASE_CONNECTION_FAILED,
        503,
        baseContext
      );
    }

    // Authentication errors
    if (errorMessage.includes('auth') || errorMessage.includes('token') || errorMessage.includes('unauthorized')) {
      return new TriviaError(
        'AUTHENTICATION_ERROR',
        `Authentication failed during ${operation}: ${error.message}`,
        StandardErrors.TRIVIA.AUTHENTICATION_REQUIRED,
        401,
        baseContext
      );
    }

    // Rate limiting errors
    if (errorMessage.includes('rate') || errorMessage.includes('too many')) {
      return new TriviaError(
        'RATE_LIMIT_ERROR',
        `Rate limit exceeded during ${operation}: ${error.message}`,
        StandardErrors.TRIVIA.RATE_LIMITED,
        429,
        baseContext
      );
    }

    // Validation errors
    if (errorMessage.includes('validation') || errorMessage.includes('invalid')) {
      return new TriviaError(
        'VALIDATION_ERROR',
        `Validation failed during ${operation}: ${error.message}`,
        StandardErrors.TRIVIA.SCORE_VALIDATION_ERROR,
        400,
        baseContext
      );
    }

    // Already played errors (business logic)
    if (errorMessage.includes('already played') || errorMessage.includes('ya has jugado')) {
      return new TriviaError(
        'BUSINESS_LOGIC_ERROR',
        `User has already played today: ${error.message}`,
        StandardErrors.TRIVIA.ALREADY_PLAYED,
        409,
        baseContext
      );
    }
  }

  // Handle unexpected errors
  return new TriviaError(
    'UNEXPECTED_ERROR',
    `Unexpected error during ${operation}: ${error}`,
    StandardErrors.TRIVIA.UNEXPECTED_ERROR,
    500,
    baseContext
  );
}

/**
 * Performance tracking utility for trivia operations
 */
export class TriviaPerformanceTracker {
  private startTime: number;
  private operation: string;
  private context: TriviaErrorContext;

  constructor(operation: string, context: TriviaErrorContext = {}) {
    this.startTime = performance.now();
    this.operation = operation;
    this.context = context;
  }

  logDbQuery(queryType: string, duration: number) {
    log.info(`Trivia DB Query: ${queryType}`, {
      operation: this.operation,
      queryType,
      duration,
      userId: this.context.userId
    });
  }

  complete(success: boolean = true, additionalData: Record<string, unknown> = {}) {
    const duration = performance.now() - this.startTime;
    const level = success ? 'info' : 'error';
    const status = success ? 'completed' : 'failed';

    log[level](`Trivia operation ${status}: ${this.operation}`, {
      operation: this.operation,
      duration,
      success,
      userId: this.context.userId,
      action: this.context.action,
      ...additionalData
    });

    // Log performance warnings for slow operations
    if (duration > 2000) { // > 2 seconds
      log.warn(`Slow trivia operation detected: ${this.operation}`, {
        operation: this.operation,
        duration,
        userId: this.context.userId,
        threshold: 2000
      });
    }

    return duration;
  }
}

/**
 * Structured logging utility for trivia system
 */
export function logTriviaEvent(
  level: 'info' | 'warn' | 'error',
  message: string,
  data: Record<string, unknown> = {},
  context: TriviaErrorContext = {}
) {
  const logData = {
    system: 'trivia',
    timestamp: new Date().toISOString(),
    userId: context.userId,
    action: context.action,
    requestId: context.requestId,
    ...data
  };

  log[level](message, logData, { userId: context.userId });
}