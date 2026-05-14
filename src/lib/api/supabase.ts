import { createClient, SupabaseClient } from "@supabase/supabase-js";
import { log } from "@/lib/utils/logger";

// Next.js automatically loads .env.local - no dotenv needed
export type { SupabaseClient };

// Default to placeholder values so module evaluation succeeds when env vars
// are missing (e.g. CI builds on Dependabot PRs that don't get repository
// secrets, or local dev without a Supabase project). createClient accepts any
// string URL — it stores the value without validating it — so the build can
// collect page data and unit tests can mock `@supabase/supabase-js` cleanly.
// At runtime any actual API call against a placeholder URL fails at request
// time with a clear network error, which is the "optional" semantic.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder-anon-key";

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
