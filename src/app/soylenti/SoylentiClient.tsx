"use client";

import { useState, useTransition, useMemo } from "react";
import RumorCard from "@/components/RumorCard";
import { RefreshCw, Loader2, X, Filter } from "lucide-react";
import { fetchMoreRumors, fetchRumorsByPlayer } from "./actions";
import type { Rumor, TrendingPlayerWithTimeline } from "@/types/soylenti";

interface SoylentiClientProps {
  initialRumors: Rumor[];
  lastUpdated: string;
  initialHasMore: boolean;
  totalCount: number;
  trendingPlayers?: TrendingPlayerWithTimeline[];
}

export default function SoylentiClient({
  initialRumors,
  lastUpdated,
  initialHasMore,
  totalCount,
  trendingPlayers = [],
}: SoylentiClientProps) {
  const [rumors, setRumors] = useState(initialRumors);
  const [hasMore, setHasMore] = useState(initialHasMore);
  const [franMode, setFranMode] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [playerRumors, setPlayerRumors] = useState<Rumor[]>([]);
  const [isPending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  // Get the display name of the selected player
  const selectedPlayerName = useMemo(() => {
    if (!selectedPlayer) return null;
    const player = trendingPlayers.find(
      (p) => p.normalizedName === selectedPlayer,
    );
    return player?.name || selectedPlayer;
  }, [selectedPlayer, trendingPlayers]);

  // When a player is selected, show their rumors; otherwise show the main list
  const rumorsToDisplay = selectedPlayer ? playerRumors : rumors;

  const displayedRumors = useMemo(
    () =>
      [...rumorsToDisplay].sort(
        (a, b) => new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime(),
      ),
    [rumorsToDisplay],
  );

  const handlePlayerClick = (normalizedName: string) => {
    if (selectedPlayer === normalizedName) {
      // Deselect - clear the filter
      setSelectedPlayer(null);
      setPlayerRumors([]);
    } else {
      // Select - fetch all rumors for this player from server
      setSelectedPlayer(normalizedName);
      setError(null);
      startTransition(async () => {
        try {
          const rumors = await fetchRumorsByPlayer(normalizedName);
          setPlayerRumors(rumors);
        } catch {
          setError("Error al cargar rumores del jugador.");
          setPlayerRumors([]);
        }
      });
    }
  };

  const clearPlayerFilter = () => {
    setSelectedPlayer(null);
    setPlayerRumors([]);
  };

  const handleLoadMore = () => {
    if (!hasMore || isPending) return;

    const lastRumor = rumors[rumors.length - 1];
    if (!lastRumor) return;

    setError(null);
    startTransition(async () => {
      try {
        const result = await fetchMoreRumors(lastRumor.pubDate);
        setRumors((prev) => [...prev, ...result.rumors]);
        setHasMore(result.hasMore);
      } catch {
        setError("Error al cargar más rumores. Inténtalo de nuevo.");
      }
    });
  };

  return (
    <>
      {/* Info and Filter Bar */}
      <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 mb-8">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          {/* Left side - Stats and update */}
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-2">
              <RefreshCw size={20} className="text-betis-verde" />
              <p className="font-heading text-sm text-gray-700 font-medium">
                {selectedPlayer ? (
                  <>
                    <span className="text-betis-verde-dark font-bold">
                      {displayedRumors.length}
                    </span>{" "}
                    rumores de {selectedPlayerName}
                  </>
                ) : (
                  <>
                    <span className="text-betis-verde-dark font-bold">
                      {displayedRumors.length}
                    </span>{" "}
                    de {totalCount} rumores
                  </>
                )}
              </p>
            </div>
            <p className="text-xs text-gray-500">
              Última actualización:{" "}
              {new Intl.DateTimeFormat("es-ES", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }).format(new Date(lastUpdated))}
            </p>
          </div>

          {/* Right side - Filters */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
            {/* Player Filter Dropdown */}
            {trendingPlayers.length > 0 && (
              <div className="relative w-full sm:w-auto">
                <div className="flex items-center gap-2 mb-1">
                  <Filter size={16} className="text-betis-verde" />
                  <label
                    htmlFor="player-filter"
                    className="text-xs font-heading font-medium text-gray-600 uppercase tracking-wide"
                  >
                    Filtrar por jugador
                  </label>
                </div>
                <select
                  id="player-filter"
                  value={selectedPlayer || ""}
                  onChange={(e) => {
                    const value = e.target.value;
                    if (value) {
                      handlePlayerClick(value);
                    } else {
                      clearPlayerFilter();
                    }
                  }}
                  className="w-full sm:w-64 px-4 py-2 rounded-lg border border-gray-200 bg-white text-sm font-body focus:outline-none focus:ring-2 focus:ring-betis-verde focus:border-transparent"
                >
                  <option value="">Todos los jugadores</option>
                  {trendingPlayers.map((player) => (
                    <option
                      key={player.normalizedName}
                      value={player.normalizedName}
                    >
                      {player.name} ({player.rumorCount})
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Fran Mode Toggle */}
            <label className="flex items-center gap-2 cursor-pointer whitespace-nowrap">
              <input
                type="checkbox"
                checked={franMode}
                onChange={(e) => setFranMode(e.target.checked)}
                className="w-4 h-4 rounded border-betis-verde text-betis-verde focus:ring-betis-verde"
              />
              <span className="text-sm text-betis-verde-dark font-heading font-medium">
                Fran Mode
              </span>
            </label>
          </div>
        </div>
      </div>

      {/* Rumors Grid */}
      {isPending && selectedPlayer ? (
        <div className="text-center py-16">
          <Loader2
            size={32}
            className="animate-spin text-betis-verde mx-auto"
          />
          <p className="mt-4 font-body text-gray-600">
            Cargando rumores de {selectedPlayerName}...
          </p>
        </div>
      ) : displayedRumors.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {displayedRumors.map((rumor) => (
              <RumorCard
                key={rumor.link}
                title={rumor.title}
                link={rumor.link}
                pubDate={rumor.pubDate}
                source={rumor.source}
                description={rumor.description}
                aiProbability={rumor.aiProbability}
                aiAnalysis={rumor.aiAnalysis}
                showCredibility={franMode}
                players={rumor.players}
              />
            ))}
          </div>

          {/* Load More Button - only shown when not filtering by player */}
          {hasMore && !selectedPlayer && (
            <div className="mt-8 text-center">
              <button
                onClick={handleLoadMore}
                disabled={isPending}
                className="inline-flex items-center gap-2 px-8 py-4 bg-betis-verde text-white rounded-xl font-heading font-bold text-sm hover:bg-betis-verde-dark transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 uppercase tracking-wide"
              >
                {isPending ? (
                  <>
                    <Loader2 size={20} className="animate-spin" />
                    Cargando...
                  </>
                ) : (
                  "Cargar más rumores"
                )}
              </button>
              {error && (
                <p className="mt-4 text-red-600 text-sm font-body">{error}</p>
              )}
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-16 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <p className="font-body text-gray-600 text-lg">
            {selectedPlayer
              ? `No hay rumores de ${selectedPlayerName} en este momento`
              : "No hay rumores disponibles en este momento"}
          </p>
          {selectedPlayer && (
            <button
              onClick={clearPlayerFilter}
              aria-label="Quitar filtro de jugador"
              className="mt-4 text-betis-verde hover:text-betis-verde-dark underline font-heading"
            >
              Quitar filtro
            </button>
          )}
        </div>
      )}
    </>
  );
}
