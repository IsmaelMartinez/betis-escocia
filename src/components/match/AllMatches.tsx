"use client";

import { useEffect, useMemo, useState } from "react";
import type { Match, MatchCardProps } from "@/types/match";
import MatchCard, {
  convertFootballDataMatchToCardProps,
} from "./MatchCard";

type Filter = "upcoming" | "past" | "all";

interface AllMatchesProps {
  className?: string;
}

const MATCHES_PER_PAGE = 6;

export default function AllMatches({ className = "" }: AllMatchesProps) {
  const [matches, setMatches] = useState<MatchCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<Filter>("upcoming");
  const [competitionFilter, setCompetitionFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);

  useEffect(() => {
    let cancelled = false;

    async function fetchAllMatches() {
      try {
        setIsLoading(true);
        setError(null);
        const response = await fetch("/api/matches?type=all&live=true");
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }
        const payload = (await response.json()) as {
          matches: Match[];
        };
        if (cancelled) return;
        setMatches(
          (payload.matches ?? []).map(convertFootballDataMatchToCardProps),
        );
      } catch (err) {
        if (cancelled) return;
        console.error("Error fetching matches:", err);
        setError("Error al cargar los partidos");
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    }

    fetchAllMatches();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, competitionFilter]);

  const availableCompetitions = useMemo(
    () => Array.from(new Set(matches.map((m) => m.competition))).sort(),
    [matches],
  );

  const now = useMemo(() => new Date(), []);
  const isUpcoming = (match: MatchCardProps): boolean =>
    new Date(match.date) > now;

  const filteredMatches = useMemo(() => {
    return matches.filter((match) => {
      const passesTimeFilter =
        filter === "all" ||
        (filter === "upcoming" ? isUpcoming(match) : !isUpcoming(match));
      const passesCompetitionFilter =
        competitionFilter === "all" ||
        match.competition === competitionFilter;
      return passesTimeFilter && passesCompetitionFilter;
    });
  }, [matches, filter, competitionFilter, now]);

  const sortedMatches = useMemo(() => {
    return [...filteredMatches].sort((a, b) => {
      const dateA = new Date(a.date).getTime();
      const dateB = new Date(b.date).getTime();
      return filter === "past" ? dateB - dateA : dateA - dateB;
    });
  }, [filteredMatches, filter]);

  const totalMatches = sortedMatches.length;
  const totalPages = Math.max(1, Math.ceil(totalMatches / MATCHES_PER_PAGE));
  const startIndex = (currentPage - 1) * MATCHES_PER_PAGE;
  const endIndex = startIndex + MATCHES_PER_PAGE;
  const pagedMatches = sortedMatches.slice(startIndex, endIndex);

  const countFor = (target: Filter): number => {
    return matches.filter((match) => {
      const matchesTime =
        target === "all" ||
        (target === "upcoming" ? isUpcoming(match) : !isUpcoming(match));
      const matchesCompetition =
        competitionFilter === "all" ||
        match.competition === competitionFilter;
      return matchesTime && matchesCompetition;
    }).length;
  };

  if (isLoading) {
    return (
      <div className={className}>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Todos los Partidos
        </h2>
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, index) => (
            <div
              key={index}
              className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden animate-pulse"
            >
              <div className="bg-gray-300 h-10" />
              <div className="p-4 space-y-4">
                <div className="h-8 bg-gray-300 rounded w-full" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={className}>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Todos los Partidos
        </h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
          <div className="text-red-600 text-lg mb-2">⚠️</div>
          <h3 className="text-lg font-medium text-red-800 mb-2">
            Error al cargar partidos
          </h3>
          <p className="text-red-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-betis-verde hover:bg-betis-verde-dark text-white px-4 py-2 rounded-md font-medium transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className={className}>
        <h2 className="text-2xl font-bold text-gray-900 mb-6">
          Todos los Partidos
        </h2>
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <div className="text-gray-400 text-4xl mb-4">📅</div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay partidos disponibles
          </h3>
        </div>
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900 mb-4">
          Todos los Partidos
          <span className="text-lg font-normal text-gray-600 ml-2">
            ({countFor(filter)}{" "}
            {filter === "all"
              ? "total"
              : filter === "upcoming"
                ? "próximos"
                : "pasados"}
            )
          </span>
        </h2>

        <div className="flex flex-wrap gap-2 mb-4">
          {(["all", "upcoming", "past"] as Filter[]).map((value) => (
            <button
              key={value}
              onClick={() => setFilter(value)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                filter === value
                  ? "bg-betis-verde text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {value === "all"
                ? "Todos"
                : value === "upcoming"
                  ? "Próximos"
                  : "Pasados"}{" "}
              ({countFor(value)})
            </button>
          ))}
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCompetitionFilter("all")}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
              competitionFilter === "all"
                ? "bg-betis-verde text-white"
                : "bg-gray-200 text-gray-700 hover:bg-gray-300"
            }`}
          >
            Todas
          </button>
          {availableCompetitions.map((competition) => (
            <button
              key={competition}
              onClick={() => setCompetitionFilter(competition)}
              className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                competitionFilter === competition
                  ? "bg-betis-verde text-white"
                  : "bg-gray-200 text-gray-700 hover:bg-gray-300"
              }`}
            >
              {competition}
            </button>
          ))}
        </div>
      </div>

      {pagedMatches.length === 0 ? (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-8 text-center">
          <div className="text-gray-400 text-4xl mb-4">📅</div>
          <p className="text-gray-600">
            No hay partidos{" "}
            {filter === "upcoming" ? "próximos" : "pasados"} en esta competición.
          </p>
        </div>
      ) : (
        <>
          <div className="grid gap-6 md:grid-cols-2">
            {pagedMatches.map((match) => (
              <MatchCard key={match.id} {...match} />
            ))}
          </div>

          {totalPages > 1 && (
            <div className="mt-8 px-4">
              <div className="text-sm text-gray-600 text-center mb-4">
                Mostrando {startIndex + 1}-{Math.min(endIndex, totalMatches)} de{" "}
                {totalMatches} partidos
              </div>
              <div className="flex items-center justify-center space-x-2">
                <button
                  onClick={() => setCurrentPage(currentPage - 1)}
                  disabled={currentPage === 1}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    currentPage === 1
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  ← Anterior
                </button>
                <span className="text-sm text-gray-700">
                  {currentPage} / {totalPages}
                </span>
                <button
                  onClick={() => setCurrentPage(currentPage + 1)}
                  disabled={currentPage === totalPages}
                  className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                    currentPage === totalPages
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  Siguiente →
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
