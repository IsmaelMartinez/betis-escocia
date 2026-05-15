"use client";

import { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DATETIME_FORMAT } from "@/lib/constants/dateFormats";
import type { Match, MatchCardProps } from "@/types/match";
import { convertFootballDataMatchToCardProps } from "./MatchCard";

interface UpcomingMatchesWidgetProps {
  className?: string;
}

export default function UpcomingMatchesWidget({
  className = "",
}: UpcomingMatchesWidgetProps) {
  const [matches, setMatches] = useState<MatchCardProps[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchMatches = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      const response = await fetch("/api/matches?type=upcoming&live=true");
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      const payload = (await response.json()) as { matches: Match[] };
      setMatches(
        (payload.matches ?? [])
          .slice(0, 2)
          .map(convertFootballDataMatchToCardProps),
      );
    } catch (err) {
      console.error("Error fetching upcoming matches widget:", err);
      setError("Error al cargar los próximos partidos");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Próximos Partidos</h2>
          <div className="h-4 w-20 bg-gray-300 rounded animate-pulse" />
        </div>
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, index) => (
            <div
              key={index}
              className="border border-gray-200 rounded-lg p-4 animate-pulse"
            >
              <div className="h-8 bg-gray-300 rounded w-full" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <h2 className="text-xl font-bold text-gray-900 mb-4">
          Próximos Partidos
        </h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <div className="text-red-600 text-sm mb-2">⚠️</div>
          <p className="text-red-600 text-sm mb-3">{error}</p>
          <button
            onClick={() => fetchMatches()}
            className="text-xs bg-betis-verde hover:bg-betis-verde-dark text-white px-3 py-1 rounded font-medium transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  if (matches.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Próximos Partidos</h2>
          <Link
            href="/partidos"
            className="text-betis-verde hover:text-betis-verde-dark font-semibold text-sm underline underline-offset-2"
          >
            Ver todos →
          </Link>
        </div>
        <div className="text-center py-8">
          <div className="text-gray-400 text-2xl mb-3">📅</div>
          <h3 className="font-medium text-gray-900 mb-2">
            No hay partidos programados
          </h3>
          <p className="text-gray-600 text-sm mb-4">
            Próximamente se anunciarán los siguientes partidos.
          </p>
          <Link
            href="/partidos"
            className="text-betis-verde hover:text-betis-verde-dark font-semibold text-sm underline underline-offset-2"
          >
            Ver historial →
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Próximos Partidos</h2>
        <Link
          href="/partidos"
          className="text-betis-verde hover:text-betis-verde-dark font-semibold text-sm flex items-center underline underline-offset-2"
        >
          Ver todos →
        </Link>
      </div>

      <div
        className={`${matches.length > 1 ? "grid grid-cols-1 md:grid-cols-2 gap-4" : "space-y-4"}`}
      >
        {matches.map((match) => {
          const matchDate = new Date(match.date);
          const localName = match.isHome ? "Real Betis" : match.opponent;
          const visitorName = match.isHome ? match.opponent : "Real Betis";

          return (
            <div
              key={match.id}
              className="border border-gray-200 rounded-lg p-4 hover:border-betis-verde transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {match.competition}
                </span>
                <span className="text-xs text-gray-500">
                  {format(matchDate, DATETIME_FORMAT, { locale: es })}
                </span>
              </div>
              <div className="flex items-center justify-center space-x-4">
                <div className="text-right flex-1">
                  <p
                    className={`font-semibold text-sm ${
                      match.isHome ? "text-betis-verde" : "text-gray-900"
                    }`}
                  >
                    {localName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {match.isHome ? "Local" : "Visitante"}
                  </p>
                </div>
                <div className="text-lg font-bold text-gray-400 px-2">VS</div>
                <div className="text-left flex-1">
                  <p
                    className={`font-semibold text-sm ${
                      !match.isHome ? "text-betis-verde" : "text-gray-900"
                    }`}
                  >
                    {visitorName}
                  </p>
                  <p className="text-xs text-gray-500">
                    {match.isHome ? "Visitante" : "Local"}
                  </p>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-6 text-center">
        <Link
          href="/partidos"
          className="text-betis-verde hover:text-betis-verde-dark font-semibold text-sm underline underline-offset-2"
        >
          Ver todos los partidos →
        </Link>
      </div>
    </div>
  );
}
