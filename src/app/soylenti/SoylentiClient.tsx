"use client";

import { useState, useTransition, useMemo } from "react";
import RumorCard from "@/components/RumorCard";
import TrendingPlayers from "@/components/TrendingPlayers";
import { RefreshCw, Loader2, X, ChevronUp, ChevronDown } from "lucide-react";
import { fetchMoreRumors, fetchRumorsByPlayer } from "./actions";
import type { TrendingPlayer } from "@/lib/supabase";
import type { Rumor, PlayerInfo } from "@/types/soylenti";
import { isTransferRumor } from "@/lib/soylenti/utils";

interface SoylentiClientProps {
  initialRumors: Rumor[];
  lastUpdated: string;
  initialHasMore: boolean;
  totalCount: number;
  trendingPlayers?: TrendingPlayer[];
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
  const [showAllNews, setShowAllNews] = useState(false);
  const [franMode, setFranMode] = useState(true);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);
  const [playerRumors, setPlayerRumors] = useState<Rumor[]>([]);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
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
  const rumorsToFilter = selectedPlayer ? playerRumors : rumors;

  const displayedRumors = useMemo(
    () =>
      rumorsToFilter
        .filter((rumor) => {
          const isTransfer = isTransferRumor(rumor.aiProbability);
          return isTransfer || showAllNews;
        })
        .sort(
          (a, b) =>
            new Date(b.pubDate).getTime() - new Date(a.pubDate).getTime(),
        ),
    [rumorsToFilter, showAllNews],
  );

  const rumorCount = useMemo(
    () => rumorsToFilter.filter((r) => isTransferRumor(r.aiProbability)).length,
    [rumorsToFilter],
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
        setError("Error al cargar más noticias. Inténtalo de nuevo.");
      }
    });
  };

  return (
    <>
      {/* Trending Players Sidebar (on larger screens) */}
      <div className="lg:flex lg:gap-8">
        {/* Trending Players - collapsible sidebar */}
        {trendingPlayers.length > 0 && (
          <div className="lg:w-72 mb-8 lg:mb-0 flex-shrink-0">
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="flex items-center gap-2 w-full mb-2 py-2 px-3 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-betis-verde-pale transition-colors"
              aria-label={
                sidebarCollapsed ? "Mostrar jugadores" : "Ocultar jugadores"
              }
              aria-expanded={!sidebarCollapsed}
            >
              <span className="text-sm font-medium text-betis-verde-dark flex-1 text-left">
                Jugadores en tendencia
              </span>
              {sidebarCollapsed ? (
                <ChevronDown size={20} className="text-betis-verde" />
              ) : (
                <ChevronUp size={20} className="text-betis-verde" />
              )}
            </button>

            {!sidebarCollapsed && (
              <TrendingPlayers
                players={trendingPlayers}
                onPlayerClick={handlePlayerClick}
                selectedPlayer={selectedPlayer}
              />
            )}
          </div>
        )}

        {/* Main Content */}
        <div className="flex-1 min-w-0">
          {/* Info Bar */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div className="flex items-center space-x-2">
                <RefreshCw size={20} className="text-betis-verde" />
                <p className="text-sm text-gray-600">
                  {selectedPlayer ? (
                    <>
                      {displayedRumors.length} noticias de {selectedPlayerName}
                      {rumorCount > 0 && ` (${rumorCount} rumores)`}
                    </>
                  ) : (
                    <>
                      {displayedRumors.length} de {totalCount} noticias
                      {rumorCount > 0 && ` (${rumorCount} rumores)`}
                    </>
                  )}
                </p>
              </div>

              <div className="flex flex-wrap gap-4">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={franMode}
                    onChange={(e) => setFranMode(e.target.checked)}
                    className="w-4 h-4 rounded border-betis-verde text-betis-verde focus:ring-betis-verde"
                  />
                  <span className="text-sm text-betis-verde-dark font-medium">
                    Fran Mode
                  </span>
                </label>
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={showAllNews}
                    onChange={(e) => setShowAllNews(e.target.checked)}
                    className="w-4 h-4 rounded border-betis-verde text-betis-verde focus:ring-betis-verde"
                  />
                  <span className="text-sm text-betis-verde-dark">
                    Mostrar noticias
                  </span>
                </label>
              </div>
            </div>

            {/* Player filter indicator */}
            {selectedPlayer && (
              <div className="mt-3 flex items-center gap-2">
                <span className="text-sm text-gray-600">
                  Filtrando por jugador:
                </span>
                <button
                  onClick={clearPlayerFilter}
                  aria-label="Quitar filtro de jugador"
                  className="inline-flex items-center gap-1 px-3 py-1 bg-betis-verde-light text-betis-verde-dark rounded-full text-sm font-medium hover:bg-betis-verde hover:text-white transition-colors"
                >
                  {selectedPlayerName}
                  <X size={14} />
                </button>
              </div>
            )}

            <p className="text-xs text-gray-500 mt-2 sm:mt-0">
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

          {/* Rumors Grid */}
          {isPending && selectedPlayer ? (
            <div className="text-center py-16">
              <Loader2
                size={32}
                className="animate-spin text-betis-verde mx-auto"
              />
              <p className="mt-4 text-gray-600">
                Cargando noticias de {selectedPlayerName}...
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
                    className="inline-flex items-center gap-2 px-6 py-3 bg-betis-verde text-white rounded-lg hover:bg-betis-verde-dark transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isPending ? (
                      <>
                        <Loader2 size={20} className="animate-spin" />
                        Cargando...
                      </>
                    ) : (
                      "Cargar más noticias"
                    )}
                  </button>
                  {error && (
                    <p className="mt-4 text-red-600 text-sm">{error}</p>
                  )}
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-16">
              <p className="text-gray-600 text-lg">
                {selectedPlayer
                  ? `No hay rumores de ${selectedPlayerName} en este momento`
                  : "No hay rumores disponibles en este momento"}
              </p>
              {selectedPlayer && (
                <button
                  onClick={clearPlayerFilter}
                  aria-label="Quitar filtro de jugador"
                  className="mt-4 text-betis-verde hover:text-betis-verde-dark underline"
                >
                  Quitar filtro
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </>
  );
}
