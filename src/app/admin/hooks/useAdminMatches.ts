import { useState, useCallback, useEffect } from 'react';
import {
  type Match,
  type MatchInsert,
  type MatchUpdate,
  getMatches,
  createMatch,
  updateMatch,
  deleteMatch,
} from '@/lib/api/supabase';
import { log } from '@/lib/utils/logger';

export function useAdminMatches() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(false);
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

  const handleCreateMatch = useCallback(async (matchData: MatchInsert) => {
    const result = await createMatch(matchData);
    if (result.success) {
      await fetchMatches();
    }
    return result;
  }, [fetchMatches]);

  const handleUpdateMatch = useCallback(async (id: number, matchData: MatchUpdate) => {
    const result = await updateMatch(id, matchData);
    if (result.success) {
      await fetchMatches();
    }
    return result;
  }, [fetchMatches]);

  const handleDeleteMatch = useCallback(async (id: number) => {
    const result = await deleteMatch(id);
    if (result.success) {
      await fetchMatches();
    }
    return result;
  }, [fetchMatches]);

  const syncMatches = useCallback(async () => {
    setSyncing(true);
    setSyncMessage(null);

    try {
      const response = await fetch('/api/admin/sync-matches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        setSyncMessage(result.message);
        await fetchMatches();
      } else {
        setSyncMessage(`Error: ${result.message}`);
      }
    } catch (err) {
      log.error('Failed to sync matches:', { error: err });
      setSyncMessage('Error al sincronizar partidos');
    } finally {
      setSyncing(false);
    }
  }, [fetchMatches]);

  const handleSyncMatchFromTable = useCallback(async (
    matchId: number,
  ): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`/api/admin/sync-match/${matchId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();

      if (result.success) {
        await fetchMatches();
        return { success: true };
      } else {
        return { success: false, error: result.message };
      }
    } catch (err) {
      log.error('Failed to sync individual match from admin table', err, {
        matchId,
      });
      return { success: false, error: 'Error al sincronizar el partido' };
    }
  }, [fetchMatches]);

  // Auto-clear sync message after 5 seconds
  useEffect(() => {
    if (syncMessage) {
      const timerId = setTimeout(() => {
        setSyncMessage(null);
      }, 5000);

      return () => clearTimeout(timerId);
    }
  }, [syncMessage]);

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
    handleSyncMatchFromTable,
  };
}
