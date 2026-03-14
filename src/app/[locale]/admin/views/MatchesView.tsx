import { Plus, RotateCcw, RefreshCw } from 'lucide-react';
import Button from '@/components/ui/Button';
import dynamicImport from 'next/dynamic';
import LoadingSpinner from '@/components/LoadingSpinner';
import type { Match } from '@/lib/api/supabase';
import clsx from 'clsx';

const MatchesList = dynamicImport(
  () => import('@/components/admin/MatchesList'),
  { loading: () => <LoadingSpinner /> }
);

const MatchForm = dynamicImport(() => import('@/components/admin/MatchForm'), {
  loading: () => <LoadingSpinner />,
});

interface MatchesViewProps {
  matches: Match[];
  syncing: boolean;
  syncMessage: string | null;
  matchFormMode: 'list' | 'create' | 'edit';
  editingMatch?: Match;
  onSyncMatches: () => void;
  onCreateNew: () => void;
  onEdit: (match: Match) => void;
  onDelete: (id: number) => Promise<{ success: boolean; error?: string }>;
  onSaveMatch: (matchData: Partial<Match>) => Promise<{ success: boolean; error?: string }>;
  onCancelForm: () => void;
}

export function MatchesView({
  matches,
  syncing,
  syncMessage,
  matchFormMode,
  editingMatch,
  onSyncMatches,
  onCreateNew,
  onEdit,
  onDelete,
  onSaveMatch,
  onCancelForm,
}: MatchesViewProps) {
  if (matchFormMode === 'create' || matchFormMode === 'edit') {
    return (
      <MatchForm
        match={editingMatch}
        onSubmit={onSaveMatch}
        onCancel={onCancelForm}
        onDelete={editingMatch ? async () => onDelete(editingMatch.id) : undefined}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Actions */}
      <div className="flex gap-4 items-center">
        <Button onClick={onCreateNew}>
          <Plus className="h-4 w-4 mr-2" />
          Create New Match
        </Button>
        <Button
          onClick={onSyncMatches}
          disabled={syncing}
          variant="secondary"
          className={clsx(syncing && 'opacity-50 cursor-not-allowed')}
        >
          <RefreshCw
            className={clsx('h-4 w-4 mr-2', syncing && 'animate-spin')}
          />
          {syncing ? 'Syncing...' : 'Sync from API'}
        </Button>
        {syncMessage && (
          <span className="text-sm text-green-600">{syncMessage}</span>
        )}
      </div>

      {/* Matches List */}
      <MatchesList
        matches={matches}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </div>
  );
}
