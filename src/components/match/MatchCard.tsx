"use client";

import React from "react";
import { Calendar } from "lucide-react";
import Image from "next/image";
import type { Match, MatchCardProps } from "@/types/match";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DATETIME_FORMAT } from "@/lib/constants/dateFormats";
import {
  getCompetitionBadge,
  getCompetitionDisplayName,
} from "@/lib/constants/competitions";

const REAL_BETIS_TEAM_ID = 90;

export function convertFootballDataMatchToCardProps(
  match: Match,
): MatchCardProps {
  const isHome = match.homeTeam.id === REAL_BETIS_TEAM_ID;
  const opponentTeam = isHome ? match.awayTeam : match.homeTeam;
  const fullTime = match.score?.fullTime;
  const hasScore =
    fullTime &&
    fullTime.home !== null &&
    fullTime.away !== null &&
    fullTime.home !== undefined &&
    fullTime.away !== undefined;

  return {
    id: match.id,
    opponent: opponentTeam.name,
    date: match.utcDate,
    competition: match.competition.name,
    isHome,
    status: match.status,
    matchday: match.matchday,
    opponentCrest: opponentTeam.crest,
    competitionEmblem: match.competition.emblem,
    score: hasScore ? { home: fullTime.home, away: fullTime.away } : undefined,
  };
}

const MatchCard: React.FC<MatchCardProps> = (props) => {
  const {
    opponent,
    date,
    competition,
    isHome,
    result,
    status,
    matchday,
    opponentCrest,
    competitionEmblem,
    score,
  } = props;

  // Format date with Spanish locale
  const formatDate = (dateString: string): string => {
    const matchDate = new Date(dateString);
    return format(matchDate, DATETIME_FORMAT, { locale: es });
  };

  const getCompetitionColor = (comp: string): string =>
    getCompetitionBadge(comp);

  // Get match status display
  const getStatusInfo = () => {
    switch (status) {
      case "IN_PLAY":
        return {
          text: "EN VIVO",
          color: "bg-red-500 text-white animate-pulse",
        };
      case "PAUSED":
        return { text: "DESCANSO", color: "bg-orange-500 text-white" };
      case "FINISHED":
        return { text: "FINALIZADO", color: "bg-gray-500 text-white" };
      case "POSTPONED":
        return { text: "APLAZADO", color: "bg-yellow-500 text-white" };
      case "SUSPENDED":
        return { text: "SUSPENDIDO", color: "bg-red-600 text-white" };
      case "CANCELLED":
        return { text: "CANCELADO", color: "bg-gray-600 text-white" };
      case "AWARDED":
        return { text: "OTORGADO", color: "bg-purple-500 text-white" };
      case "SCHEDULED":
      case "TIMED":
      default:
        return { text: "PRÓXIMO", color: "bg-betis-verde text-white" };
    }
  };

  const statusInfo = getStatusInfo();

  // Get formatted score or result - always show local team score first
  const getMatchResult = (): string => {
    if (score && score.home !== null && score.away !== null) {
      // Always show local team score first, visitor team score second
      return `${score.home} - ${score.away}`;
    }
    return result ?? "VS";
  };

  // Determine team display information - always show local (home) team on left, visitor (away) on right
  const localTeam = isHome
    ? {
        name: "Real Betis",
        crest: "/images/logo_no_texto.jpg",
        isBetis: true,
      }
    : {
        name: opponent,
        crest: opponentCrest,
        isBetis: false,
      };

  const visitorTeam = isHome
    ? {
        name: opponent,
        crest: opponentCrest,
        isBetis: false,
      }
    : {
        name: "Real Betis",
        crest: "/images/logo_no_texto.jpg",
        isBetis: true,
      };

  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow duration-200">
      {/* Competition header with emblem */}
      <div
        className={`${getCompetitionColor(competition)} text-white px-4 py-2 flex items-center justify-between`}
      >
        <div className="flex items-center space-x-2">
          {competitionEmblem && (
            <Image
              src={competitionEmblem}
              alt={`${competition} logo`}
              width={20}
              height={20}
              className="object-contain"
            />
          )}
          <p className="text-sm font-medium">
            {getCompetitionDisplayName(competition)}
          </p>
        </div>
        {matchday && (
          <span className="text-xs bg-white/20 px-2 py-1 rounded-full">
            J{matchday}
          </span>
        )}
      </div>

      <div className="p-4">
        {/* Match details */}
        <div className="text-center mb-4">
          <div className="flex items-center justify-center space-x-4 mb-2">
            {/* Local Team (always on left) */}
            <div className="text-right flex-1">
              <div className="flex items-center justify-end space-x-2">
                <p
                  className={`font-bold text-lg ${localTeam.isBetis ? "text-betis-green" : ""}`}
                >
                  {localTeam.name}
                </p>
              </div>
            </div>

            {/* Score/VS */}
            <div className="text-2xl font-bold text-gray-400 px-4">
              {getMatchResult()}
            </div>

            {/* Visitor Team (always on right) */}
            <div className="text-left flex-1">
              <div className="flex items-center justify-start space-x-2">
                <p
                  className={`font-bold text-lg ${visitorTeam.isBetis ? "text-betis-green" : ""}`}
                >
                  {visitorTeam.name}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Date */}
        <div className="space-y-2 mb-4">
          <div className="flex items-center justify-center space-x-2 text-gray-600">
            <Calendar className="h-4 w-4" />
            <span className="text-sm">{formatDate(date)}</span>
          </div>
        </div>

        {/* Match status */}
        <div className="text-center">
          <span
            className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${statusInfo.color}`}
          >
            {statusInfo.text}
          </span>
        </div>
      </div>
    </div>
  );
};

export default MatchCard;
