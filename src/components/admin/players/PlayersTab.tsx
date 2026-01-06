"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import clsx from "clsx";
import { Users, GitMerge, RefreshCw } from "lucide-react";
import Card, { CardHeader, CardBody } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/LoadingSpinner";
import PlayersList from "./PlayersList";
import PlayerEditModal from "./PlayerEditModal";
import PlayerMergeUI from "./PlayerMergeUI";
import type { Player } from "@/lib/supabase";

type PlayersSubView = "all-players" | "merge";

interface PlayerWithDetails extends Player {
  display_name?: string | null;
}

interface PlayersTabProps {
  readonly isLoading?: boolean;
}

export default function PlayersTab({ isLoading = false }: PlayersTabProps) {
  const [subView, setSubView] = useState<PlayersSubView>("all-players");
  const [syncing, setSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState<string | null>(null);
  const [editingPlayer, setEditingPlayer] = useState<PlayerWithDetails | null>(
    null,
  );
  const [refreshKey, setRefreshKey] = useState(0);
  const syncTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, []);

  const handleSyncSquad = useCallback(async () => {
    setSyncing(true);
    setSyncMessage(null);

    // Clear any existing timeout
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    try {
      const response = await fetch("/api/admin/squad/sync", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (result.success) {
        setSyncMessage(result.message);
        // Refresh player list after successful sync
        setRefreshKey((k) => k + 1);
      } else {
        setSyncMessage(`Error: ${result.error || "Error desconocido"}`);
      }
    } catch (error) {
      setSyncMessage("Error al sincronizar jugadores");
    } finally {
      setSyncing(false);
      // Clear message after 5 seconds
      syncTimeoutRef.current = setTimeout(() => setSyncMessage(null), 5000);
    }
  }, []);

  if (isLoading) {
    return <LoadingSpinner size="lg" label="Cargando jugadores..." />;
  }

  return (
    <div className="space-y-6">
      {/* Sub-navigation */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSubView("all-players")}
            className={clsx(
              "inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors",
              subView === "all-players"
                ? "bg-betis-verde text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200",
            )}
          >
            <Users className="h-4 w-4" />
            Todos los Jugadores
          </button>
          <button
            onClick={() => setSubView("merge")}
            className={clsx(
              "inline-flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-colors",
              subView === "merge"
                ? "bg-betis-verde text-white"
                : "bg-gray-100 text-gray-700 hover:bg-gray-200",
            )}
          >
            <GitMerge className="h-4 w-4" />
            Fusionar
          </button>
        </div>

        <Button
          onClick={handleSyncSquad}
          variant="secondary"
          size="sm"
          leftIcon={
            <RefreshCw className={clsx("h-4 w-4", syncing && "animate-spin")} />
          }
          isLoading={syncing}
        >
          Sincronizar Jugadores
        </Button>
      </div>

      {/* Sync message */}
      {syncMessage && (
        <div
          className={clsx(
            "p-3 rounded-lg text-sm",
            syncMessage.includes("Error")
              ? "bg-red-100 text-red-700"
              : "bg-green-100 text-green-700",
          )}
        >
          {syncMessage}
        </div>
      )}

      {/* Content based on sub-view */}
      {subView === "all-players" && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold text-betis-black">
              Todos los Jugadores
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Lista de todos los jugadores en la base de datos con sus alias y
              menciones. Usa el botón de sincronizar para actualizar la plantilla
              actual desde la API de Football-Data.org.
            </p>
          </CardHeader>
          <CardBody>
            <PlayersList
              key={refreshKey}
              onEditPlayer={(player) => setEditingPlayer(player)}
            />
          </CardBody>
        </Card>
      )}

      {/* Player Edit Modal */}
      <PlayerEditModal
        player={editingPlayer}
        isOpen={!!editingPlayer}
        onClose={() => setEditingPlayer(null)}
        onSave={() => setRefreshKey((k) => k + 1)}
      />

      {subView === "merge" && (
        <Card>
          <CardHeader>
            <h2 className="text-xl font-bold text-betis-black">
              Fusionar Jugadores
            </h2>
            <p className="text-sm text-gray-500 mt-1">
              Combina jugadores duplicados manteniendo todas sus noticias y
              alias
            </p>
          </CardHeader>
          <CardBody>
            <PlayerMergeUI
              onMergeComplete={() => setRefreshKey((k) => k + 1)}
            />
          </CardBody>
        </Card>
      )}
    </div>
  );
}
