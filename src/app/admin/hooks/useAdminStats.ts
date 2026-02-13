'use client';

import { useState, useCallback, useEffect } from 'react';
import { supabase, type RSVP, type ContactSubmission, getMatches } from '@/lib/api/supabase';
import { log } from '@/lib/utils/logger';

export interface AdminStats {
  totalRSVPs: number;
  totalAttendees: number;
  totalContacts: number;
  totalMatches: number;
  recentRSVPs: RSVP[];
  recentContacts: ContactSubmission[];
}

export function useAdminStats(isSignedIn?: boolean) {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = useCallback(async () => {
    try {
      setError(null);

      const [rsvpsResult, contactsResult, matchesData] = await Promise.all([
        supabase
          .from('rsvps')
          .select('*')
          .order('created_at', { ascending: false }),
        supabase
          .from('contact_submissions')
          .select('*')
          .order('created_at', { ascending: false }),
        getMatches(),
      ]);

      const { data: rsvps, error: rsvpError } = rsvpsResult;
      const { data: contacts, error: contactError } = contactsResult;

      if (rsvpError) throw rsvpError;
      if (contactError) throw contactError;

      const totalRSVPs = rsvps?.length || 0;
      const totalAttendees = rsvps?.reduce((sum, rsvp) => sum + (rsvp.attendees || 0), 0) || 0;
      const totalContacts = contacts?.length || 0;
      const totalMatches = matchesData?.length || 0;

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
      log.error('Failed to fetch admin stats:', err);
      setError('Error al cargar las estadísticas del panel de administración');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  const refresh = useCallback(async () => {
    setRefreshing(true);
    await fetchStats();
  }, [fetchStats]);

  useEffect(() => {
    if (isSignedIn) {
      fetchStats();
    }
  }, [isSignedIn, fetchStats]);

  return {
    stats,
    loading,
    error,
    refreshing,
    refresh,
    fetchStats,
  };
}
