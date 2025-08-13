import { supabase } from '@/lib/supabase';
import { formatISO } from 'date-fns';

const DEFAULT_MATCH = {
  opponent: "Real Madrid",
  date: "2025-06-28T20:00:00",
  competition: "LaLiga"
};

export async function getCurrentUpcomingMatch() {
  const { data, error } = await supabase
    .from('matches')
    .select('id, opponent, date_time, competition')
    .gte('date_time', formatISO(new Date()))
    .order('date_time', { ascending: true })
    .limit(1);

  if (error) {
    console.error('Error fetching upcoming match:', error);
    return DEFAULT_MATCH;
  }

  if (data && data.length > 0) {
    const nextMatch = data[0];
    return {
      opponent: nextMatch.opponent,
      date: nextMatch.date_time,
      competition: nextMatch.competition
    };
  }
  return DEFAULT_MATCH;
}