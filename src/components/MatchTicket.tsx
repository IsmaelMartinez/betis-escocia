"use client";

import React from "react";
import { Calendar, Clock, Users, MapPin, Trophy } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import type { MatchCardProps } from "@/types/match";
import type { Match as DatabaseMatch } from "@/lib/supabase";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { DATETIME_FORMAT } from "@/lib/constants/dateFormats";

/**
 * Variant types for the MatchTicket component
 */
export type MatchTicketVariant = "upcoming" | "live" | "finished";
export type MatchTicketPriority = "normal" | "featured" | "derby";

export interface MatchTicketProps extends MatchCardProps {
  variant?: MatchTicketVariant;
  priority?: MatchTicketPriority;
}

/**
 * Adapter function to convert database match to MatchTicketProps
 */
export function convertDatabaseMatchToTicketProps(
  dbMatch: DatabaseMatch,
  rsvpCount?: number,
  totalAttendees?: number,
  showRSVP: boolean = true,
): MatchTicketProps {
  const isUpcoming = new Date(dbMatch.date_time) > new Date();
  const isDerby = dbMatch.opponent.toLowerCase().includes("sevilla");

  return {
    id: dbMatch.id,
    opponent: dbMatch.opponent,
    date: dbMatch.date_time,
    competition: dbMatch.competition,
    isHome: dbMatch.home_away === "home",
    status:
      (dbMatch.status as
        | "SCHEDULED"
        | "FINISHED"
        | "IN_PLAY"
        | "PAUSED"
        | "POSTPONED"
        | "SUSPENDED"
        | "CANCELLED"
        | "AWARDED"
        | "TIMED") || (isUpcoming ? "SCHEDULED" : "FINISHED"),
    result: dbMatch.result || (isUpcoming ? undefined : "FINALIZADO"),
    matchday: dbMatch.matchday,
    score:
      dbMatch.home_score !== null &&
      dbMatch.away_score !== null &&
      dbMatch.home_score !== undefined &&
      dbMatch.away_score !== undefined
        ? {
            home: dbMatch.home_score,
            away: dbMatch.away_score,
          }
        : undefined,
    watchParty: isUpcoming
      ? {
          location: "Polwarth Tavern",
          address: "35 Polwarth Cres, Edinburgh EH11 1HR",
          time: format(new Date(dbMatch.date_time), "HH:mm", { locale: es }),
        }
      : undefined,
    rsvpInfo:
      rsvpCount !== undefined && totalAttendees !== undefined
        ? {
            rsvpCount,
            totalAttendees,
          }
        : undefined,
    showRSVP,
    variant:
      dbMatch.status === "IN_PLAY" || dbMatch.status === "PAUSED"
        ? "live"
        : isUpcoming
          ? "upcoming"
          : "finished",
    priority: isDerby ? "derby" : "normal",
  };
}

/**
 * MatchTicket - A distinctive match card with ticket-stub aesthetic
 *
 * Design System v2 component that replaces the generic MatchCard with
 * a culturally distinctive ticket-inspired design featuring:
 * - Verdiblanco stripe edge
 * - Competition ribbon
 * - Large matchday typography
 * - Perforated edge effects
 */
const MatchTicket: React.FC<MatchTicketProps> = (props) => {
  const {
    id,
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
    watchParty,
    rsvpInfo,
    showRSVP,
    variant = "upcoming",
    priority = "normal",
  } = props;

  const isUpcoming =
    status === "SCHEDULED" || status === "TIMED" || new Date(date) > new Date();
  const isLive = status === "IN_PLAY" || status === "PAUSED";

  // Format date
  const formatDate = (dateString: string): string => {
    const matchDate = new Date(dateString);
    return format(matchDate, DATETIME_FORMAT, { locale: es });
  };

  const formatShortDate = (
    dateString: string,
  ): { day: string; month: string; time: string } => {
    const matchDate = new Date(dateString);
    return {
      day: format(matchDate, "d", { locale: es }),
      month: format(matchDate, "MMM", { locale: es }).toUpperCase(),
      time: format(matchDate, "HH:mm", { locale: es }),
    };
  };

  const shortDate = formatShortDate(date);

  // Competition ribbon colors
  const getCompetitionRibbon = (comp: string): { bg: string; text: string } => {
    const compLower = comp.toLowerCase();
    if (compLower.includes("liga") || compLower.includes("primera")) {
      return {
        bg: "bg-gradient-to-r from-red-600 to-red-700",
        text: "text-white",
      };
    }
    if (compLower.includes("champions")) {
      return {
        bg: "bg-gradient-to-r from-blue-600 to-blue-800",
        text: "text-white",
      };
    }
    if (compLower.includes("europa") && !compLower.includes("conference")) {
      return {
        bg: "bg-gradient-to-r from-orange-500 to-orange-600",
        text: "text-white",
      };
    }
    if (compLower.includes("copa")) {
      return {
        bg: "bg-gradient-to-r from-betis-oro to-oro-antique",
        text: "text-scotland-navy",
      };
    }
    return {
      bg: "bg-gradient-to-r from-betis-verde to-betis-verde-dark",
      text: "text-white",
    };
  };

  const ribbon = getCompetitionRibbon(competition);

  // Get competition display name
  const getCompetitionDisplayName = (comp: string): string => {
    const compLower = comp.toLowerCase();
    if (
      compLower.includes("primera") ||
      compLower === "laliga santander" ||
      compLower === "la liga"
    )
      return "LaLiga";
    if (compLower.includes("champions")) return "UCL";
    if (compLower.includes("europa") && !compLower.includes("conference"))
      return "UEL";
    if (compLower.includes("conference")) return "UECL";
    if (compLower.includes("copa del rey")) return "Copa";
    return comp.substring(0, 8);
  };

  // Status badge
  const getStatusBadge = () => {
    if (isLive) {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-match-live text-white animate-pulse">
          <span className="w-2 h-2 bg-white rounded-full mr-2" />
          EN VIVO
        </span>
      );
    }
    if (status === "POSTPONED") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-match-postponed text-white">
          APLAZADO
        </span>
      );
    }
    if (status === "FINISHED") {
      return (
        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-match-finished text-white">
          FINAL
        </span>
      );
    }
    return null;
  };

  // Score display
  const getMatchResult = (): string => {
    if (score && score.home !== null && score.away !== null) {
      return `${score.home} - ${score.away}`;
    }
    return result ?? "VS";
  };

  // Team info
  const localTeam = isHome
    ? { name: "Real Betis", crest: "/images/logo_no_texto.jpg", isBetis: true }
    : { name: opponent, crest: opponentCrest, isBetis: false };

  const visitorTeam = isHome
    ? { name: opponent, crest: opponentCrest, isBetis: false }
    : { name: "Real Betis", crest: "/images/logo_no_texto.jpg", isBetis: true };

  // Priority styling
  const priorityClasses = {
    normal: "border-gray-200",
    featured: "border-betis-verde border-2",
    derby: "border-betis-oro border-2 shadow-lg",
  };

  return (
    <div
      className={`
      relative bg-white rounded-xl overflow-hidden 
      transition-all duration-300 hover:shadow-xl hover:-translate-y-1
      ${priorityClasses[priority]}
    `}
    >
      {/* Verdiblanco edge - ticket stub effect */}
      <div
        className="absolute left-0 top-0 bottom-0 w-1 bg-betis-verde"
        style={{
          maskImage:
            "repeating-linear-gradient(180deg, transparent 0px, transparent 3px, black 3px, black 12px)",
          WebkitMaskImage:
            "repeating-linear-gradient(180deg, transparent 0px, transparent 3px, black 3px, black 12px)",
        }}
      />

      {/* Competition ribbon - diagonal */}
      <div
        className={`
        absolute top-0 right-0 ${ribbon.bg} ${ribbon.text}
        px-8 py-1 text-xs font-bold tracking-wider
        transform translate-x-6 -translate-y-0 rotate-0
        rounded-bl-lg
      `}
      >
        {competitionEmblem && (
          <Image
            src={competitionEmblem}
            alt=""
            width={14}
            height={14}
            className="inline-block mr-1 -mt-0.5"
          />
        )}
        {getCompetitionDisplayName(competition)}
      </div>

      {/* Derby badge */}
      {priority === "derby" && (
        <div className="absolute top-2 left-6 flex items-center gap-1 bg-betis-oro text-scotland-navy px-2 py-0.5 rounded-full text-xs font-bold">
          <Trophy className="w-3 h-3" />
          DERBI
        </div>
      )}

      <div className="p-5 pl-6">
        {/* Match header with date block */}
        <div className="flex items-start gap-4 mb-4">
          {/* Date block - ticket style */}
          <div className="flex-shrink-0 text-center bg-betis-verde-pale rounded-lg p-3 min-w-16">
            <div className="font-display text-3xl font-black text-betis-verde leading-none">
              {shortDate.day}
            </div>
            <div className="text-xs font-bold text-betis-verde-dark uppercase tracking-wide">
              {shortDate.month}
            </div>
            <div className="text-sm font-mono font-bold text-scotland-navy mt-1">
              {shortDate.time}
            </div>
          </div>

          {/* Teams */}
          <div className="flex-grow min-w-0">
            {/* Matchday number */}
            {matchday && (
              <div className="text-xs text-gray-500 uppercase tracking-wider mb-1">
                Jornada {matchday}
              </div>
            )}

            {/* Team names */}
            <div className="space-y-1">
              <div
                className={`font-heading font-bold text-lg truncate ${localTeam.isBetis ? "text-betis-verde" : "text-gray-900"}`}
              >
                {localTeam.name}
              </div>
              <div className="text-gray-400 text-sm font-mono">vs</div>
              <div
                className={`font-heading font-bold text-lg truncate ${visitorTeam.isBetis ? "text-betis-verde" : "text-gray-900"}`}
              >
                {visitorTeam.name}
              </div>
            </div>
          </div>

          {/* Score (for finished/live matches) */}
          {(isLive || status === "FINISHED") && score && (
            <div className="flex-shrink-0 text-center">
              <div
                className={`
                font-display text-4xl font-black
                ${isLive ? "text-match-live" : "text-gray-600"}
              `}
              >
                {getMatchResult()}
              </div>
              {getStatusBadge()}
            </div>
          )}
        </div>

        {/* Watch party info for upcoming matches */}
        {isUpcoming && watchParty && (
          <div className="bg-scotland-mist rounded-lg p-3 mb-4">
            <div className="flex items-center gap-2 text-scotland-navy font-medium text-sm mb-1">
              <MapPin className="w-4 h-4 text-betis-verde" />
              {watchParty.location}
            </div>
            <div className="text-xs text-gray-600 ml-6">
              {watchParty.address}
            </div>
          </div>
        )}

        {/* RSVP section for upcoming matches */}
        {isUpcoming && showRSVP && (
          <div className="border-t border-gray-100 pt-4 mt-4">
            {rsvpInfo && (
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <Users className="w-4 h-4 text-betis-verde" />
                  <span>
                    <span className="font-bold text-betis-verde">
                      {rsvpInfo.rsvpCount}
                    </span>{" "}
                    confirmaciones
                  </span>
                  {rsvpInfo.totalAttendees > 0 && (
                    <span className="text-gray-400">
                      •{" "}
                      <span className="font-bold text-betis-verde">
                        {rsvpInfo.totalAttendees}
                      </span>{" "}
                      asistentes
                    </span>
                  )}
                </div>
              </div>
            )}

            <Link
              href={`/rsvp?match=${id}`}
              className="
                block w-full text-center py-3 px-4 rounded-lg
                bg-betis-verde hover:bg-betis-verde-dark
                text-white font-bold text-sm
                transition-colors duration-200
                focus:outline-none focus:ring-2 focus:ring-betis-verde focus:ring-offset-2
              "
            >
              📝 Confirmar Asistencia
              {rsvpInfo && rsvpInfo.totalAttendees > 0 && (
                <span className="ml-1 opacity-80">
                  ({rsvpInfo.totalAttendees})
                </span>
              )}
            </Link>
          </div>
        )}
      </div>

      {/* Bottom edge decoration for upcoming matches */}
      {isUpcoming && (
        <div className="h-1 bg-gradient-to-r from-betis-verde via-betis-oro to-scotland-navy" />
      )}
    </div>
  );
};

export default MatchTicket;
