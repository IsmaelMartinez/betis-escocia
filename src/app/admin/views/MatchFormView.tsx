"use client";

import LoadingSpinner from "@/components/LoadingSpinner";
import dynamicImport from "next/dynamic";
import type { Match, MatchInsert, MatchUpdate } from "@/lib/api/supabase";

const MatchForm = dynamicImport(
  () => import("@/components/admin/MatchForm"),
  { loading: () => <LoadingSpinner /> },
);

interface MatchFormViewProps {
  readonly match?: Match;
  readonly onSubmit: (data: MatchInsert | MatchUpdate) => Promise<{ success: boolean; error?: string }>;
  readonly onCancel: () => void;
  readonly onDelete?: () => Promise<{ success: boolean; error?: string }>;
  readonly isLoading: boolean;
}

export default function MatchFormView({
  match,
  onSubmit,
  onCancel,
  onDelete,
  isLoading,
}: MatchFormViewProps) {
  return (
    <MatchForm
      match={match}
      onSubmit={onSubmit}
      onCancel={onCancel}
      onDelete={onDelete}
      isLoading={isLoading}
    />
  );
}
