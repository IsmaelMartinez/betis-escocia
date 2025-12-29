"use client";

import { useState, useTransition, useMemo } from "react";
import RumorCard from "@/components/RumorCard";
import TrendingPlayers from "@/components/TrendingPlayers";
import { RefreshCw, Loader2, X, ChevronLeft, ChevronRight } from "lucide-react";
import { fetchMoreRumors } from "./actions";
import type { TrendingPlayer } from "@/lib/supabase";

interface PlayerInfo {
  name: string;
  normalizedName?: string;
  role: "target" | "departing" | "mentioned";
}

interface Rumor {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  description?: string;
  aiProbability?: number | null;
  aiAnalysis?: string | null;
  transferDirection?: "in" | "out" | "unknown" | null;
  players?: PlayerInfo[];
}

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
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
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

  const displayedRumors = useMemo(
    () =>
      rumors.filter((rumor) => {
        const prob = rumor.aiProbability;
        const isTransfer = prob !== null && prob !== undefined && prob > 0;
        const passesNewsFilter = isTransfer || showAllNews;

        // Player filter
        if (selectedPlayer) {
          const hasPlayer = rumor.players?.some(
            (p) => p.normalizedName === selectedPlayer,
          );
          return passesNewsFilter && hasPlayer;
        }

        return passesNewsFilter;
      }),
    [rumors, showAllNews, selectedPlayer],
  );

  const rumorCount = useMemo(
    () =>
      rumors.filter((r) => {
        const prob = r.aiProbability;
        return prob !== null && prob !== undefined && prob > 0;
      }).length,
    [rumors],
  );

  const handlePlayerClick = (normalizedName: string) => {
    setSelectedPlayer((prev) =>
      prev === normalizedName ? null : normalizedName,
    );
  };

  const clearPlayerFilter = () => {
    setSelectedPlayer(null);
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
        {/* Trending Players - collapsible sidebar on desktop */}
        {trendingPlayers.length > 0 && (
          <div
            className={`transition-all duration-300 ease-in-out ${
              sidebarCollapsed ? "lg:w-12" : "lg:w-72"
            } mb-8 lg:mb-0 flex-shrink-0`}
          >
            {/* Collapse toggle button - only visible on lg screens */}
            <button
              onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
              className="hidden lg:flex items-center justify-center w-full mb-2 py-2 bg-white rounded-lg shadow-sm border border-gray-200 hover:bg-betis-verde-pale transition-colors"
              aria-label={
                sidebarCollapsed ? "Expandir panel" : "Colapsar panel"
              }
            >
              {sidebarCollapsed ? (
                <ChevronRight size={20} className="text-betis-verde" />
              ) : (
                <>
                  <ChevronLeft size={16} className="text-betis-verde" />
                  <span className="text-sm text-gray-600 ml-1">Ocultar</span>
                </>
              )}
            </button>

            {/* Sidebar content - hidden when collapsed on desktop */}
            <div
              className={`${sidebarCollapsed ? "lg:hidden" : "lg:block"} block`}
            >
              <TrendingPlayers
                players={trendingPlayers}
                onPlayerClick={handlePlayerClick}
                selectedPlayer={selectedPlayer}
              />
            </div>
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
                  {displayedRumors.length} de {totalCount} noticias
                  {rumorCount > 0 && ` (${rumorCount} rumores)`}
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
          {displayedRumors.length > 0 ? (
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
                    transferDirection={rumor.transferDirection}
                    showCredibility={franMode}
                    players={rumor.players}
                  />
                ))}
              </div>

              {/* Load More Button */}
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
