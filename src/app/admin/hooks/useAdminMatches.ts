import { useState, useCallback } from 'react';
import { type Match, getMatches, createMatch, updateMatch, deleteMatch } from '@/lib/api/supabase';
import { log } from '@/lib/utils/logger';

export function useAdminMatches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);

  const fetchMatches = useCallback(async () => {
    try {
      setError(null);
      const data = await getMatches();

      if (data === null) {
        throw new Error('Failed to load matches');
      }

      setMatches(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to load matches';
      setError(errorMessage);
      log.error('Failed to fetch matches:', { error: err });
    } finally {
      setLoading(false);
    }
  }, []);

  const handleCreateMatch = useCallback(async (matchData: Omit<Match, 'id'>) => {
    try {
      setError(null);
      const { data, error: createError } = await createMatch(matchData);

      if (createError) {
        throw createError;
      }

      // Refresh matches list
      await fetchMatches();
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create match';
      setError(errorMessage);
      log.error('Failed to create match:', { error: err });
      return { success: false, error: errorMessage };
    }
  }, [fetchMatches]);

  const handleUpdateMatch = useCallback(async (id: number, matchData: Partial<Match>) => {
    try {
      setError(null);
      const { data, error: updateError } = await updateMatch(id, matchData);

      if (updateError) {
        throw updateError;
      }

      // Refresh matches list
      await fetchMatches();
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update match';
      setError(errorMessage);
      log.error('Failed to update match:', { error: err });
      return { success: false, error: errorMessage };
    }
  }, [fetchMatches]);

  const handleDeleteMatch = useCallback(async (id: number) => {
    try {
      setError(null);
      const { error: deleteError } = await deleteMatch(id);

      if (deleteError) {
        throw deleteError;
      }

      // Refresh matches list
      await fetchMatches();
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete match';
      setError(errorMessage);
      log.error('Failed to delete match:', { error: err });
      return { success: false, error: errorMessage };
    }
  }, [fetchMatches]);

  const syncMatches = useCallback(async () => {
    setSyncing(true);
    setSyncMessage(null);

    try {
      const response = await fetch('/api/admin/sync-matches', {
        method: 'POST',
      });

      if (!response.ok) {
        throw new Error('Failed to sync matches');
      }

      const data = await response.json();
      setSyncMessage(
        `Successfully synchronized ${data.synchronizedCount || 0} matches`,
      );

      // Refresh matches list
      await fetchMatches();
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to sync matches';
      setError(errorMessage);
      log.error('Failed to sync matches:', { error: err });
    } finally {
      setSyncing(false);
    }
  }, [fetchMatches]);

  return {
    matches,
    loading,
    error,
    syncing,
    syncMessage,
    fetchMatches,
    handleCreateMatch,
    handleUpdateMatch,
    handleDeleteMatch,
    syncMatches,
  };
}
