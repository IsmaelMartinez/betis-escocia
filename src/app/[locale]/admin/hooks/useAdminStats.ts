'use client';

import { useState, useCallback, useEffect } from 'react';
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

      // Fetch RSVPs, contacts, and matches in parallel to minimize latency
      const [rsvpsResult, contactsResult, matchesResult] = await Promise.all([
        supabase
          .from('rsvps')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('contact_submissions')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('matches')
          .select('*')
          .order('date_time', { ascending: false }),
      ]);

      const { data: rsvps, error: rsvpError } = rsvpsResult;
      const { data: contacts, error: contactError } = contactsResult;
      const { data: matches, error: matchError } = matchesResult;

      if (rsvpError) throw rsvpError;
      if (contactError) throw contactError;
      if (matchError) throw matchError;

      const totalRSVPs = rsvps?.length || 0;
      const totalAttendees = rsvps?.reduce((sum, rsvp) => sum + (rsvp.attendees || 0), 0) || 0;
      const totalContacts = contacts?.length || 0;
      const totalMatches = matches?.length || 0;

      // Filter to only show new contacts in the dashboard (preserves original behavior)
      const newContacts = (contacts || []).filter(
        (contact) => contact.status === 'new'
      );

      setStats({
        totalRSVPs,
        totalAttendees,
        totalContacts,
        totalMatches,
        recentRSVPs: rsvps?.slice(0, 5) || [],
        recentContacts: newContacts.slice(0, 5),
      });
    } catch (err: unknown) {
      const errorMessage =
        (err as { message?: string } | null | undefined)?.message ??
        'Failed to load admin statistics';
      setError(errorMessage);
      log.error('Failed to fetch admin stats:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchStats();
  }, [fetchStats]);

  // Automatically fetch stats on mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  return {
    stats,
    loading,
    error,
    refreshing,
    refresh,
  };
}
