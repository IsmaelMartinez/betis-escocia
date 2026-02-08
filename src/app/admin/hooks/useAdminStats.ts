import { useState, useCallback } from 'react';
import { supabase, type RSVP, type ContactSubmission } from '@/lib/api/supabase';
import { log } from '@/lib/utils/logger';

export interface AdminStats {
  totalRSVPs: number;
  totalAttendees: number;
  totalContacts: number;
  totalMatches: number;
  recentRSVPs: RSVP[];
  recentContacts: ContactSubmission[];
}

export function useAdminStats() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      setError(null);

      // Fetch RSVPs
      const { data: rsvps, error: rsvpError } = await supabase
        .from('rsvps')
        .select('*')
        .order('created_at', { ascending: false });

      if (rsvpError) throw rsvpError;

      // Fetch contacts
      const { data: contacts, error: contactError } = await supabase
        .from('contact_submissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (contactError) throw contactError;

      // Fetch matches
      const { data: matches, error: matchError } = await supabase
        .from('matches')
        .select('*')
        .order('date_time', { ascending: false });

      if (matchError) throw matchError;

      const totalRSVPs = rsvps?.length || 0;
      const totalAttendees = rsvps?.reduce((sum, rsvp) => sum + (rsvp.attendees || 0), 0) || 0;
      const totalContacts = contacts?.length || 0;
      const totalMatches = matches?.length || 0;

      setStats({
        totalRSVPs,
        totalAttendees,
        totalContacts,
        totalMatches,
        recentRSVPs: rsvps?.slice(0, 5) || [],
        recentContacts: contacts?.slice(0, 5) || [],
      });
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load admin statistics';
      setError(errorMessage);
      log.error('Failed to fetch admin stats:', { error: err });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refreshing,
    fetchStats,
    refresh,
  };
}
