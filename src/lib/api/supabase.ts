import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { log } from "@/lib/utils/logger";

// Next.js automatically loads .env.local - no dotenv needed
export type { SupabaseClient };

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export function getAuthenticatedSupabaseClient(
  supabaseAccessToken: string,
): SupabaseClient {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: { Authorization: `Bearer ${supabaseAccessToken}` },
    },
  });
}

// Type definitions for our matches table
export interface Match {
  id: number;
  date_time: string;
  opponent: string;
  competition: string;
  home_away: "home" | "away";
  notes?: string;
  created_at: string;
  updated_at: string;
  external_id?: number;
  external_source?: string;
  result?: string;
  home_score?: number;
  away_score?: number;
  status?: string;
  matchday?: number;
}

export interface MatchInsert {
  date_time: string;
  opponent: string;
  competition: string;
  home_away: "home" | "away";
  notes?: string;
  external_id?: number;
  external_source?: string;
  result?: string;
  home_score?: number;
  away_score?: number;
  status?: string;
  matchday?: number;
}

export interface MatchUpdate {
  date_time?: string;
  opponent?: string;
  competition?: string;
  home_away?: "home" | "away";
  notes?: string;
  external_id?: number;
  external_source?: string;
  result?: string;
  home_score?: number;
  away_score?: number;
  status?: string;
  matchday?: number;
}

// Type definitions for our trivia_questions table
export interface TriviaQuestion {
  id: string;
  question_text: string;
  category: "betis" | "scotland";
  difficulty: "easy" | "medium" | "hard";
  created_at: string;
  trivia_answers: TriviaAnswer[];
}

export interface TriviaQuestionInsert {
  question_text: string;
  category: "betis" | "scotland";
  difficulty?: "easy" | "medium" | "hard";
}

export interface TriviaQuestionUpdate {
  question_text?: string;
  category?: "betis" | "scotland" | "whisky";
  difficulty?: "easy" | "medium" | "hard";
}

// Type definitions for our trivia_answers table
export interface TriviaAnswer {
  id: string;
  question_id: string;
  answer_text: string;
  is_correct: boolean;
  created_at: string;
}

export interface TriviaAnswerInsert {
  question_id: string;
  answer_text: string;
  is_correct?: boolean;
}

export interface TriviaAnswerUpdate {
  answer_text?: string;
  is_correct?: boolean;
}

// Type definitions for our user_trivia_scores table
export interface UserTriviaScore {
  id: string;
  user_id: string;
  daily_score: number;
  timestamp: string;
}

export interface UserTriviaScoreInsert {
  user_id: string;
  daily_score: number;
}

// Match CRUD operations
export async function getMatches(limit?: number) {
  const query = supabase
    .from("matches")
    .select("*")
    .order("date_time", { ascending: true });

  if (limit) {
    query.limit(limit);
  }

  const { data, error } = await query;

  if (error) {
    log.database("select", "matches", undefined, error as Error);
    return null;
  }

  return data as Match[];
}

export async function getUpcomingMatches(limit = 2) {
  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .gte("date_time", new Date().toISOString())
    .order("date_time", { ascending: true })
    .limit(limit);

  if (error) {
    log.database("select", "matches", undefined, error as Error);
    return null;
  }

  return data as Match[];
}

export async function getMatch(id: number) {
  const { data, error } = await supabase
    .from("matches")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    log.database("select", "matches", undefined, error as Error, {
      matchId: id,
    });
    return null;
  }

  return data as Match;
}

export async function createMatch(match: MatchInsert) {
  const { data, error } = await supabase
    .from("matches")
    .insert([match])
    .select()
    .single();

  if (error) {
    log.database("insert", "matches", undefined, error as Error);
    return { success: false, error: error.message };
  }

  return { success: true, data: data as Match };
}

export async function updateMatch(id: number, updates: MatchUpdate) {
  const { data, error } = await supabase
    .from("matches")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    log.database("update", "matches", undefined, error as Error, {
      matchId: id,
    });
    return { success: false, error: error.message };
  }

  return { success: true, data: data as Match };
}

export async function deleteMatch(id: number) {
  const { error } = await supabase.from("matches").delete().eq("id", id);

  if (error) {
    log.database("delete", "matches", undefined, error as Error, {
      matchId: id,
    });
    return { success: false, error: error.message };
  }

  return { success: true };
}

// Trivia Question CRUD operations
export async function getTriviaQuestions() {
  const { data, error } = await supabase
    .from("trivia_questions")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    log.database("select", "trivia_questions", undefined, error as Error);
    return null;
  }
  return data as TriviaQuestion[];
}

export async function getTriviaQuestion(id: string) {
  const { data, error } = await supabase
    .from("trivia_questions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    log.database("select", "trivia_questions", undefined, error as Error, {
      questionId: id,
    });
    return null;
  }
  return data as TriviaQuestion;
}

export async function createTriviaQuestion(question: TriviaQuestionInsert) {
  const { data, error } = await supabase
    .from("trivia_questions")
    .insert([question])
    .select()
    .single();

  if (error) {
    log.database("insert", "trivia_questions", undefined, error as Error);
    return { success: false, error: error.message };
  }
  return { success: true, data: data as TriviaQuestion };
}

export async function updateTriviaQuestion(
  id: string,
  updates: TriviaQuestionUpdate,
) {
  const { data, error } = await supabase
    .from("trivia_questions")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    log.database("update", "trivia_questions", undefined, error as Error, {
      questionId: id,
    });
    return { success: false, error: error.message };
  }
  return { success: true, data: data as TriviaQuestion };
}

export async function deleteTriviaQuestion(id: string) {
  const { error } = await supabase
    .from("trivia_questions")
    .delete()
    .eq("id", id);

  if (error) {
    log.database("delete", "trivia_questions", undefined, error as Error, {
      questionId: id,
    });
    return { success: false, error: error.message };
  }
  return { success: true };
}

// Trivia Answer CRUD operations
export async function getTriviaAnswersForQuestion(questionId: string) {
  const { data, error } = await supabase
    .from("trivia_answers")
    .select("*")
    .eq("question_id", questionId)
    .order("created_at", { ascending: true });

  if (error) {
    log.database("select", "trivia_answers", undefined, error as Error, {
      questionId,
    });
    return null;
  }
  return data as TriviaAnswer[];
}

export async function getTriviaAnswer(id: string) {
  const { data, error } = await supabase
    .from("trivia_answers")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    log.database("select", "trivia_answers", undefined, error as Error, {
      answerId: id,
    });
    return null;
  }
  return data as TriviaAnswer;
}

export async function createTriviaAnswer(answer: TriviaAnswerInsert) {
  const { data, error } = await supabase
    .from("trivia_answers")
    .insert([answer])
    .select()
    .single();

  if (error) {
    log.database("insert", "trivia_answers", undefined, error as Error);
    return { success: false, error: error.message };
  }
  return { success: true, data: data as TriviaAnswer };
}

export async function updateTriviaAnswer(
  id: string,
  updates: TriviaAnswerUpdate,
) {
  const { data, error } = await supabase
    .from("trivia_answers")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    log.database("update", "trivia_answers", undefined, error as Error, {
      answerId: id,
    });
    return { success: false, error: error.message };
  }
  return { success: true, data: data as TriviaAnswer };
}

export async function deleteTriviaAnswer(id: string) {
  const { error } = await supabase.from("trivia_answers").delete().eq("id", id);

  if (error) {
    log.database("delete", "trivia_answers", undefined, error as Error, {
      answerId: id,
    });
    return { success: false, error: error.message };
  }
  return { success: true };
}

// User Trivia Score CRUD operations
export async function createUserTriviaScore(
  score: UserTriviaScoreInsert,
  authenticatedSupabase: SupabaseClient,
) {
  log.debug("Attempting to insert trivia score", {
    score,
    table: "user_trivia_scores",
  });

  const { data, error } = await authenticatedSupabase
    .from("user_trivia_scores")
    .insert([score])
    .select()
    .single();

  if (error) {
    log.database("insert", "user_trivia_scores", undefined, error as Error, {
      code: error.code,
      details: error.details,
      hint: error.hint,
    });
    return { success: false, error: error.message };
  }
  return { success: true, data: data as UserTriviaScore };
}

export async function getUserDailyTriviaScore(
  userId: string,
  authenticatedSupabase: SupabaseClient,
) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Optimized: Only select needed fields instead of '*'
  const { data, error } = await authenticatedSupabase
    .from("user_trivia_scores")
    .select("id, daily_score, timestamp")
    .eq("user_id", userId)
    .gte("timestamp", today.toISOString())
    .lt("timestamp", tomorrow.toISOString())
    .single(); // Assuming only one score per user per day

  if (error && error.code !== "PGRST116" && error.code !== "PGRST301") {
    // PGRST116 means no rows found, PGRST301 means "No suitable key or wrong key type"
    log.database("select", "user_trivia_scores", undefined, error as Error, {
      userId,
    });
    return { success: false, error: error.message };
  }

  return { success: true, data: data as UserTriviaScore | null };
}

// Notification Preferences types
export interface NotificationPreference {
  id: number;
  user_id: string;
  enabled: boolean;
  created_at: string;
  updated_at: string;
}

export interface NotificationPreferenceInsert {
  user_id: string;
  enabled: boolean;
}

export interface NotificationPreferenceUpdate {
  enabled?: boolean;
  updated_at?: string;
}
