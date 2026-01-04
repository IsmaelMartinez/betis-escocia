"use client";

import { useState, useEffect, useCallback } from "react";
import { Search, ArrowRight, Check, X, AlertTriangle, Newspaper } from "lucide-react";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/LoadingSpinner";
import clsx from "clsx";
import type { Player } from "@/lib/supabase";

interface PlayerWithDetails extends Player {
  display_name?: string | null;
}

interface PlayerMergeUIProps {
  readonly onMergeComplete?: () => void;
}

export default function PlayerMergeUI({ onMergeComplete }: PlayerMergeUIProps) {
  const [primaryPlayer, setPrimaryPlayer] = useState<PlayerWithDetails | null>(null);
  const [duplicatePlayer, setDuplicatePlayer] = useState<PlayerWithDetails | null>(null);
  const [primarySearch, setPrimarySearch] = useState("");
  const [duplicateSearch, setDuplicateSearch] = useState("");
  const [primaryResults, setPrimaryResults] = useState<PlayerWithDetails[]>([]);
  const [duplicateResults, setDuplicateResults] = useState<PlayerWithDetails[]>([]);
  const [searchingPrimary, setSearchingPrimary] = useState(false);
  const [searchingDuplicate, setSearchingDuplicate] = useState(false);
  const [merging, setMerging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Search for players
  const searchPlayers = useCallback(
    async (query: string, isPrimary: boolean) => {
      if (!query.trim()) {
        if (isPrimary) {
          setPrimaryResults([]);
        } else {
          setDuplicateResults([]);
        }
        return;
      }

      if (isPrimary) {
        setSearchingPrimary(true);
      } else {
        setSearchingDuplicate(true);
      }

      try {
        const params = new URLSearchParams({ search: query, limit: "10" });
        const response = await fetch(`/api/admin/players?${params}`);
        const result = await response.json();

        if (result.success) {
          if (isPrimary) {
            setPrimaryResults(result.players);
          } else {
            setDuplicateResults(result.players);
          }
        }
      } catch (err) {
        // Silently fail search
      } finally {
        if (isPrimary) {
          setSearchingPrimary(false);
        } else {
          setSearchingDuplicate(false);
        }
      }
    },
    []
  );

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (primarySearch) {
        searchPlayers(primarySearch, true);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [primarySearch, searchPlayers]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if (duplicateSearch) {
        searchPlayers(duplicateSearch, false);
      }
    }, 300);
    return () => clearTimeout(timer);
  }, [duplicateSearch, searchPlayers]);

  const handleSelectPrimary = (player: PlayerWithDetails) => {
    setPrimaryPlayer(player);
    setPrimarySearch("");
    setPrimaryResults([]);
    setError(null);
    setSuccessMessage(null);
  };

  const handleSelectDuplicate = (player: PlayerWithDetails) => {
    if (primaryPlayer && player.id === primaryPlayer.id) {
      setError("No puedes fusionar un jugador consigo mismo");
      return;
    }
    setDuplicatePlayer(player);
    setDuplicateSearch("");
    setDuplicateResults([]);
    setError(null);
    setSuccessMessage(null);
  };

  const handleMerge = async () => {
    if (!primaryPlayer || !duplicatePlayer) return;

    setMerging(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/admin/soylenti/players/merge", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          primaryId: primaryPlayer.id,
          duplicateId: duplicatePlayer.id,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccessMessage(
          `Jugadores fusionados correctamente. ${result.newsTransferred || 0} noticias transferidas.`
        );
        setPrimaryPlayer(null);
        setDuplicatePlayer(null);
        onMergeComplete?.();
      } else {
        setError(result.error || "Error al fusionar jugadores");
      }
    } catch (err) {
      setError("Error al fusionar jugadores");
    } finally {
      setMerging(false);
    }
  };

  const handleReset = () => {
    setPrimaryPlayer(null);
    setDuplicatePlayer(null);
    setPrimarySearch("");
    setDuplicateSearch("");
    setPrimaryResults([]);
    setDuplicateResults([]);
    setError(null);
    setSuccessMessage(null);
  };

  const renderPlayerCard = (
    player: PlayerWithDetails | null,
    type: "primary" | "duplicate"
  ) => {
    if (!player) return null;

    return (
      <div
        className={clsx(
          "border rounded-lg p-4",
          type === "primary" ? "border-betis-verde bg-betis-verde-pale" : "border-orange-400 bg-orange-50"
        )}
      >
        <div className="flex items-center justify-between mb-2">
          <span
            className={clsx(
              "text-xs font-medium px-2 py-0.5 rounded",
              type === "primary" ? "bg-betis-verde text-white" : "bg-orange-400 text-white"
            )}
          >
            {type === "primary" ? "Jugador Principal" : "Jugador Duplicado"}
          </span>
          <button
            onClick={() =>
              type === "primary" ? setPrimaryPlayer(null) : setDuplicatePlayer(null)
            }
            className="text-gray-400 hover:text-gray-600"
            aria-label="Eliminar selección"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <div className="font-semibold text-gray-900">
          {player.display_name || player.name}
        </div>
        {player.display_name && player.display_name !== player.name && (
          <div className="text-sm text-gray-500">{player.name}</div>
        )}
        <div className="mt-2 flex items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Newspaper className="h-3 w-3" />
            {player.rumor_count} noticias
          </span>
          {player.aliases && (player.aliases as string[]).length > 0 && (
            <span>{(player.aliases as string[]).length} aliases</span>
          )}
        </div>
      </div>
    );
  };

  const renderSearchPanel = (
    type: "primary" | "duplicate",
    search: string,
    setSearch: (v: string) => void,
    results: PlayerWithDetails[],
    isSearching: boolean,
    onSelect: (p: PlayerWithDetails) => void,
    selectedPlayer: PlayerWithDetails | null
  ) => {
    return (
      <div className="flex-1 space-y-4">
        <h4 className="font-medium text-gray-700">
          {type === "primary" ? "Jugador Principal" : "Jugador Duplicado"}
        </h4>
        <p className="text-sm text-gray-500">
          {type === "primary"
            ? "El jugador que se mantendrá. Recibirá todos los datos del duplicado."
            : "El jugador que se eliminará. Sus noticias y aliases se transferirán al principal."}
        </p>

        {selectedPlayer ? (
          renderPlayerCard(selectedPlayer, type)
        ) : (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Buscar jugador..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-betis-verde focus:border-transparent"
              />
              {isSearching && (
                <div className="absolute right-3 top-1/2 -translate-y-1/2">
                  <LoadingSpinner size="sm" />
                </div>
              )}
            </div>

            {results.length > 0 && (
              <div className="border rounded-lg divide-y max-h-60 overflow-y-auto">
                {results.map((player) => {
                  const isSelected =
                    (type === "primary" && primaryPlayer?.id === player.id) ||
                    (type === "duplicate" && duplicatePlayer?.id === player.id) ||
                    (type === "duplicate" && primaryPlayer?.id === player.id);

                  return (
                    <button
                      key={player.id}
                      onClick={() => onSelect(player)}
                      disabled={isSelected}
                      className={clsx(
                        "w-full text-left px-3 py-2 hover:bg-gray-50",
                        isSelected && "bg-gray-100 opacity-50 cursor-not-allowed"
                      )}
                    >
                      <div className="font-medium text-gray-900">
                        {player.display_name || player.name}
                      </div>
                      <div className="text-sm text-gray-500 flex items-center gap-2">
                        <span>{player.rumor_count} noticias</span>
                        {player.is_current_squad && (
                          <span className="text-betis-verde">• Plantilla</span>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            )}

            {search && results.length === 0 && !isSearching && (
              <p className="text-sm text-gray-500 text-center py-4">
                No se encontraron jugadores
              </p>
            )}
          </>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="h-5 w-5 text-blue-500 mt-0.5" />
          <div>
            <h4 className="font-medium text-blue-700">¿Cómo funciona la fusión?</h4>
            <p className="text-sm text-blue-600 mt-1">
              Al fusionar, todas las noticias del jugador duplicado se transfieren al jugador
              principal. El nombre normalizado del duplicado se añade como alias al principal.
              El jugador duplicado se elimina de la base de datos.
            </p>
          </div>
        </div>
      </div>

      {/* Success/Error messages */}
      {successMessage && (
        <div className="bg-green-100 text-green-700 p-3 rounded-lg flex items-center gap-2">
          <Check className="h-4 w-4" />
          {successMessage}
        </div>
      )}
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg flex items-center gap-2">
          <X className="h-4 w-4" />
          {error}
        </div>
      )}

      {/* Two-panel interface */}
      <div className="flex flex-col lg:flex-row gap-6">
        {renderSearchPanel(
          "primary",
          primarySearch,
          setPrimarySearch,
          primaryResults,
          searchingPrimary,
          handleSelectPrimary,
          primaryPlayer
        )}

        {/* Arrow between panels */}
        <div className="hidden lg:flex items-center justify-center">
          <div className="bg-gray-100 rounded-full p-2">
            <ArrowRight className="h-6 w-6 text-gray-400" />
          </div>
        </div>

        {renderSearchPanel(
          "duplicate",
          duplicateSearch,
          setDuplicateSearch,
          duplicateResults,
          searchingDuplicate,
          handleSelectDuplicate,
          duplicatePlayer
        )}
      </div>

      {/* Preview and action */}
      {primaryPlayer && duplicatePlayer && (
        <div className="border-t pt-6">
          <h4 className="font-medium text-gray-700 mb-4">Vista previa de la fusión</h4>

          <div className="bg-gray-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Nombre final:</span>
              <span className="font-medium">
                {primaryPlayer.display_name || primaryPlayer.name}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Noticias combinadas:</span>
              <span className="font-medium">
                {primaryPlayer.rumor_count + duplicatePlayer.rumor_count}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-500">Nuevo alias:</span>
              <span className="font-medium text-gray-600">
                {duplicatePlayer.normalized_name}
              </span>
            </div>
          </div>

          <div className="flex gap-3 mt-4">
            <Button variant="outline" onClick={handleReset} disabled={merging}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleMerge}
              isLoading={merging}
              leftIcon={<Check className="h-4 w-4" />}
            >
              Confirmar Fusión
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
