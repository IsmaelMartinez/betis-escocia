"use client";

import { Plus } from "lucide-react";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/LoadingSpinner";
import dynamicImport from "next/dynamic";
import type { Match } from "@/lib/api/supabase";

const MatchesList = dynamicImport(
  () => import("@/components/admin/MatchesList"),
  { loading: () => <LoadingSpinner /> },
);

interface MatchesViewProps {
  readonly matches: Match[];
  readonly onEdit: (match: Match) => void;
  readonly onDelete: (matchId: number) => Promise<{ success: boolean; error?: string }>;
  readonly onSync: (matchId: number) => Promise<{ success: boolean; error?: string }>;
  readonly isLoading: boolean;
  readonly onCreateNew: () => void;
}

export default function MatchesView({
  matches,
  onEdit,
  onDelete,
  onSync,
  isLoading,
  onCreateNew,
}: MatchesViewProps) {
  return (
    <>
      <div className="mb-6 flex justify-between items-center">
        <Button
          onClick={onCreateNew}
          variant="primary"
          leftIcon={<Plus className="h-4 w-4" />}
        >
          Crear Nuevo Partido
        </Button>
      </div>

      <MatchesList
        matches={matches}
        onEdit={onEdit}
        onDelete={onDelete}
        onSync={onSync}
        isLoading={isLoading}
      />
    </>
  );
}
