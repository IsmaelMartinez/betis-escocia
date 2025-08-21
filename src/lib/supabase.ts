import { createClient, SupabaseClient } from '@supabase/supabase-js'

export type { SupabaseClient }

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export function getAuthenticatedSupabaseClient(supabaseAccessToken: string): SupabaseClient {
  return createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: { Authorization: `Bearer ${supabaseAccessToken}` },
    },
  });
}

// Type definitions for our matches table
export interface Match {
  id: number
  date_time: string
  opponent: string
  competition: string
  home_away: 'home' | 'away'
  notes?: string
  created_at: string
  updated_at: string
  external_id?: number
  external_source?: string
  result?: string
  home_score?: number
  away_score?: number
  status?: string
  matchday?: number
}

export interface MatchInsert {
  date_time: string
  opponent: string
  competition: string
  home_away: 'home' | 'away'
  notes?: string
  external_id?: number
  external_source?: string
  result?: string
  home_score?: number
  away_score?: number
  status?: string
  matchday?: number
}

export interface MatchUpdate {
  date_time?: string
  opponent?: string
  competition?: string
  home_away?: 'home' | 'away'
  notes?: string
  external_id?: number
  external_source?: string
  result?: string
  home_score?: number
  away_score?: number
  status?: string
  matchday?: number
}

// Type definition for match RSVP counts view
export interface MatchRSVPCount {
  match_id: number
  opponent: string
  date_time: string
  total_attendees: number
  rsvp_count: number
}

// Type definitions for our RSVP table (updated with match_id and user_id)
export interface RSVP {
  id: number
  name: string
  email: string
  attendees: number
  message?: string
  whatsapp_interest: boolean
  match_date: string
  match_id?: number  // New field for linking to matches
  user_id?: string   // New field for linking to authenticated users
  created_at: string
}

export interface RSVPInsert {
  name: string
  email: string
  attendees: number
  message?: string
  whatsapp_interest: boolean
  match_date: string
  match_id?: number  // New field for linking to matches
  user_id?: string   // New field for linking to authenticated users
}

// Type definitions for our contact_submissions table
export interface ContactSubmission {
  id: number
  name: string
  email: string
  phone?: string | null
  type: 'general' | 'rsvp' | 'merchandise' | 'photo' | 'whatsapp' | 'feedback';
  subject: string;
  message: string;
  status: 'new' | 'in progress' | 'resolved' | 'closed';
  user_id?: string   // New field for linking to authenticated users
  created_at: string
  updated_at: string
  updated_by?: string // New field to store the user who updated the submission
}

export interface ContactSubmissionInsert {
  name: string;
  email: string;
  phone?: string | null;
  type: 'general' | 'rsvp' | 'merchandise' | 'photo' | 'whatsapp' | 'feedback'
  subject: string
  message: string
  status?: 'new' | 'in progress' | 'resolved' | 'closed';
  user_id?: string   // New field for linking to authenticated users
  updated_by?: string // New field to store the user who updated the submission
}

// Type definitions for our trivia_questions table
export interface TriviaQuestion {
  id: string;
  question_text: string;
  category: 'betis' | 'scotland';
  difficulty: 'easy' | 'medium' | 'hard';
  created_at: string;
  trivia_answers: TriviaAnswer[];
}

export interface TriviaQuestionInsert {
  question_text: string;
  category: 'betis' | 'scotland';
  difficulty?: 'easy' | 'medium' | 'hard';
}

export interface TriviaQuestionUpdate {
  question_text?: string;
  category?: 'betis' | 'scotland';
  difficulty?: 'easy' | 'medium' | 'hard';
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
    .from('matches')
    .select('*')
    .order('date_time', { ascending: true })
  
  if (limit) {
    query.limit(limit)
  }
  
  const { data, error } = await query
  
  if (error) {
    console.error('Error fetching matches:', error)
    return null
  }
  
  return data as Match[]
}

export async function getUpcomingMatches(limit = 2) {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .gte('date_time', new Date().toISOString())
    .order('date_time', { ascending: true })
    .limit(limit)
  
  if (error) {
    console.error('Error fetching upcoming matches:', error)
    return null
  }
  
  return data as Match[]
}

export async function getMatch(id: number) {
  const { data, error } = await supabase
    .from('matches')
    .select('*')
    .eq('id', id)
    .maybeSingle();
  
  if (error) {
    console.error('Error fetching match:', error)
    return null
  }
  
  return data as Match
}

export async function createMatch(match: MatchInsert) {
  const { data, error } = await supabase
    .from('matches')
    .insert([match])
    .select()
    .single()
  
  if (error) {
    console.error('Error creating match:', error)
    return { success: false, error: error.message }
  }
  
  return { success: true, data: data as Match }
}

export async function updateMatch(id: number, updates: MatchUpdate) {
  const { data, error } = await supabase
    .from('matches')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  
  if (error) {
    console.error('Error updating match:', error)
    return { success: false, error: error.message }
  }
  
  return { success: true, data: data as Match }
}

export async function deleteMatch(id: number) {
  const { error } = await supabase
    .from('matches')
    .delete()
    .eq('id', id)
  
  if (error) {
    console.error('Error deleting match:', error)
    return { success: false, error: error.message }
  }
  
  return { success: true }
}

// Get match with RSVP counts
export async function getMatchWithRSVPCounts(id: number) {
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      rsvps(
        id,
        attendees
      )
    `)
    .eq('id', id)
    .single()
  
  if (error) {
    console.error('Error fetching match with RSVP counts:', error)
    return null
  }
  
  // Calculate totals
  const rsvpCount = data.rsvps?.length || 0
  const totalAttendees = data.rsvps?.reduce((sum: number, rsvp: { attendees: number }) => sum + rsvp.attendees, 0) || 0
  
  return {
    ...data,
    rsvp_count: rsvpCount,
    total_attendees: totalAttendees
  }
}

// Get upcoming matches with RSVP counts
export async function getUpcomingMatchesWithRSVPCounts(limit = 2) {
  // First, try to get matches with RSVP data
  const { data, error } = await supabase
    .from('matches')
    .select(`
      *,
      rsvps(
        id,
        attendees
      )
    `)
    .gte('date_time', new Date().toISOString())
    .order('date_time', { ascending: true })
    .limit(limit)
  
  // If there's an error with RSVP join, fallback to matches only
  if (error) {
    console.warn('RSVP data not available, fetching matches only:', error)
    
    const fallbackResult = await supabase
      .from('matches')
      .select('*')
      .gte('date_time', new Date().toISOString())
      .order('date_time', { ascending: true })
      .limit(limit)
    
    if (fallbackResult.error) {
      console.error('Error fetching upcoming matches:', fallbackResult.error)
      return null
    }
    
    // Return matches with zero RSVP counts
    return fallbackResult.data.map(match => ({
      ...match,
      rsvp_count: 0,
      total_attendees: 0
    }))
  }
  
  // Calculate totals for each match
  if (!data) {
    return []
  }
  
  return data.map(match => {
    const rsvpCount = match.rsvps?.length || 0
    const totalAttendees = match.rsvps?.reduce((sum: number, rsvp: { attendees: number }) => sum + rsvp.attendees, 0) || 0
    
    return {
      ...match,
      rsvp_count: rsvpCount,
      total_attendees: totalAttendees
    }
  })
}

// User-specific database operations for authenticated users
export async function getUserRSVPs(userId: string) {
  const { data, error } = await supabase
    .from('rsvps')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching user RSVPs:', error)
    return null
  }
  
  return data as RSVP[]
}

export async function getUserContactSubmissions(userId: string) {
  const { data, error } = await supabase
    .from('contact_submissions')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
  
  if (error) {
    console.error('Error fetching user contact submissions:', error)
    return null
  }
  
  return data as ContactSubmission[]
}

export async function getUserSubmissionCounts(userId: string) {
  const [rsvpCount, contactCount] = await Promise.all([
    supabase
      .from('rsvps')
      .select('id', { count: 'exact' })
      .eq('user_id', userId),
    supabase
      .from('contact_submissions')
      .select('id', { count: 'exact' })
      .eq('user_id', userId)
  ])
  
  return {
    rsvpCount: rsvpCount.count || 0,
    contactCount: contactCount.count || 0,
    totalSubmissions: (rsvpCount.count || 0) + (contactCount.count || 0)
  }
}

// Email-based linking functions (used by webhook)
export async function linkExistingSubmissionsToUser(userId: string, email: string) {
  const results = await Promise.allSettled([
    // Link RSVP submissions
    supabase
      .from('rsvps')
      .update({ user_id: userId })
      .eq('email', email)
      .is('user_id', null),
    
    // Link contact submissions
    supabase
      .from('contact_submissions')
      .update({ user_id: userId })
      .eq('email', email)
      .is('user_id', null)
  ])
  
  const rsvpResult = results[0]
  const contactResult = results[1]
  
  return {
    rsvpLinked: rsvpResult.status === 'fulfilled' ? rsvpResult.value.count || 0 : 0,
    contactLinked: contactResult.status === 'fulfilled' ? contactResult.value.count || 0 : 0,
    errors: results.filter(r => r.status === 'rejected').map(r => (r as PromiseRejectedResult).reason)
  }
}

export async function unlinkUserSubmissions(userId: string) {
  const results = await Promise.allSettled([
    // Unlink RSVP submissions
    supabase
      .from('rsvps')
      .update({ user_id: null })
      .eq('user_id', userId),
    
    // Unlink contact submissions
    supabase
      .from('contact_submissions')
      .update({ user_id: null })
      .eq('user_id', userId)
  ])
  
  const rsvpResult = results[0]
  const contactResult = results[1]
  
  return {
    rsvpUnlinked: rsvpResult.status === 'fulfilled' ? rsvpResult.value.count || 0 : 0,
    contactUnlinked: contactResult.status === 'fulfilled' ? contactResult.value.count || 0 : 0,
    errors: results.filter(r => r.status === 'rejected').map(r => (r as PromiseRejectedResult).reason)
  }
}

export async function updateContactSubmissionStatus(id: number, status: 'new' | 'in progress' | 'resolved' | 'closed', adminUserId: string, clerkToken: string) {
  const response = await fetch(`/api/admin/contact-submissions/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${clerkToken}`,
    },
    body: JSON.stringify({ status, adminUserId }),
  });

  const responseText = await response.text();
  let result;
  try {
    result = JSON.parse(responseText);
  } catch (parseError) {
    console.error('Failed to parse JSON response:', responseText, parseError);
    return { success: false, error: 'Invalid JSON response from server.' };
  }

  if (!response.ok) {
    console.error('Error updating contact submission status:', result.error);
    return { success: false, error: result.error };
  }

  return { success: true, data: result.data as ContactSubmission };
}

// Trivia Question CRUD operations
export async function getTriviaQuestions() {
  const { data, error } = await supabase
    .from('trivia_questions')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching trivia questions:', error);
    return null;
  }
  return data as TriviaQuestion[];
}

export async function getTriviaQuestion(id: string) {
  const { data, error } = await supabase
    .from('trivia_questions')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching trivia question:', error);
    return null;
  }
  return data as TriviaQuestion;
}

export async function createTriviaQuestion(question: TriviaQuestionInsert) {
  const { data, error } = await supabase
    .from('trivia_questions')
    .insert([question])
    .select()
    .single();

  if (error) {
    console.error('Error creating trivia question:', error);
    return { success: false, error: error.message };
  }
  return { success: true, data: data as TriviaQuestion };
}

export async function updateTriviaQuestion(id: string, updates: TriviaQuestionUpdate) {
  const { data, error } = await supabase
    .from('trivia_questions')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating trivia question:', error);
    return { success: false, error: error.message };
  }
  return { success: true, data: data as TriviaQuestion };
}

export async function deleteTriviaQuestion(id: string) {
  const { error } = await supabase
    .from('trivia_questions')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting trivia question:', error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

// Trivia Answer CRUD operations
export async function getTriviaAnswersForQuestion(questionId: string) {
  const { data, error } = await supabase
    .from('trivia_answers')
    .select('*')
    .eq('question_id', questionId)
    .order('created_at', { ascending: true });

  if (error) {
    console.error('Error fetching trivia answers:', error);
    return null;
  }
  return data as TriviaAnswer[];
}

export async function getTriviaAnswer(id: string) {
  const { data, error } = await supabase
    .from('trivia_answers')
    .select('*')
    .eq('id', id)
    .maybeSingle();

  if (error) {
    console.error('Error fetching trivia answer:', error);
    return null;
  }
  return data as TriviaAnswer;
}

export async function createTriviaAnswer(answer: TriviaAnswerInsert) {
  const { data, error } = await supabase
    .from('trivia_answers')
    .insert([answer])
    .select()
    .single();

  if (error) {
    console.error('Error creating trivia answer:', error);
    return { success: false, error: error.message };
  }
  return { success: true, data: data as TriviaAnswer };
}

export async function updateTriviaAnswer(id: string, updates: TriviaAnswerUpdate) {
  const { data, error } = await supabase
    .from('trivia_answers')
    .update(updates)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    console.error('Error updating trivia answer:', error);
    return { success: false, error: error.message };
  }
  return { success: true, data: data as TriviaAnswer };
}

export async function deleteTriviaAnswer(id: string) {
  const { error } = await supabase
    .from('trivia_answers')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting trivia answer:', error);
    return { success: false, error: error.message };
  }
  return { success: true };
}

// User Trivia Score CRUD operations
export async function createUserTriviaScore(score: UserTriviaScoreInsert, authenticatedSupabase: SupabaseClient) {
  const { data, error } = await authenticatedSupabase
    .from('user_trivia_scores')
    .insert([score])
    .select()
    .single();

  if (error) {
    console.error('Error creating user trivia score:', error);
    return { success: false, error: error.message };
  }
  return { success: true, data: data as UserTriviaScore };
}

export async function getUserDailyTriviaScore(userId: string, authenticatedSupabase: SupabaseClient) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);

  // Optimized: Only select needed fields instead of '*'
  const { data, error } = await authenticatedSupabase
    .from('user_trivia_scores')
    .select('id, daily_score, timestamp')
    .eq('user_id', userId)
    .gte('timestamp', today.toISOString())
    .lt('timestamp', tomorrow.toISOString())
    .single(); // Assuming only one score per user per day

  if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found
    console.error('Error fetching user daily trivia score:', error);
    return { success: false, error: error.message };
  }
  
  return { success: true, data: data as UserTriviaScore | null };
}

// Get all matches with RSVP counts
export async function getAllMatchesWithRSVPCounts(limit?: number) {
  const query = supabase
    .from('matches')
    .select(`
      *,
      rsvps(
        id,
        attendees
      )
    `)
    .order('date_time', { ascending: true })
  
  if (limit) {
    query.limit(limit)
  }

  const { data, error } = await query

  // If there's an error with RSVP join, fallback to matches only
  if (error) {
    console.warn('RSVP data not available, fetching matches only:', error)

    const fallbackResult = await (limit ? 
      supabase.from('matches').select('*').order('date_time', { ascending: true }).limit(limit) :
      supabase.from('matches').select('*').order('date_time', { ascending: true })
    )

    if (fallbackResult.error) {
      console.error('Error fetching upcoming matches:', fallbackResult.error)
      return null
    }

    // Return matches with zero RSVP counts
    return fallbackResult.data.map(match => ({
      ...match,
      rsvp_count: 0,
      total_attendees: 0
    }))
  }

  // Calculate totals for each match
  if (!data) {
    return []
  }

  return data.map(match => {
    const rsvpCount = match.rsvps?.length || 0
    const totalAttendees = match.rsvps?.reduce((sum: number, rsvp: { attendees: number }) => sum + rsvp.attendees, 0) || 0

    return {
      ...match,
      rsvp_count: rsvpCount,
      total_attendees: totalAttendees
    }
  })
}

// Notification Preferences types
export interface NotificationPreference {
  id: number
  user_id: string
  enabled: boolean
  created_at: string
  updated_at: string
}

export interface NotificationPreferenceInsert {
  user_id: string
  enabled: boolean
}

export interface NotificationPreferenceUpdate {
  enabled?: boolean
  updated_at?: string
}

