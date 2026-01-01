"use client";

import { useState } from "react";
import {
  TrendingUp,
  ChevronDown,
  ChevronUp,
  Flame,
  TrendingDown,
  Minus,
  Snowflake,
  ArrowUpRight,
  ArrowDownRight,
  ArrowRight,
} from "lucide-react";
import Sparkline from "@/components/Sparkline";
import type {
  TrendingPlayerWithTimeline,
  MomentumPhase,
} from "@/types/soylenti";

interface TrendingPlayersChartProps {
  players: TrendingPlayerWithTimeline[];
  onPlayerClick?: (normalizedName: string) => void;
  selectedPlayer?: string | null;
  defaultCollapsed?: boolean;
}

/** Phase configuration for display */
const phaseConfig: Record<
  MomentumPhase,
  {
    icon: typeof Flame;
    label: string;
    labelEs: string;
    bgColor: string;
    textColor: string;
    iconColor: string;
  }
> = {
  hot: {
    icon: Flame,
    label: "Hot",
    labelEs: "Caliente",
    bgColor: "bg-red-50",
    textColor: "text-red-700",
    iconColor: "text-red-500",
  },
  rising: {
    icon: TrendingUp,
    label: "Rising",
    labelEs: "Subiendo",
    bgColor: "bg-betis-verde-pale",
    textColor: "text-betis-verde-dark",
    iconColor: "text-betis-verde",
  },
  stable: {
    icon: Minus,
    label: "Stable",
    labelEs: "Estable",
    bgColor: "bg-gray-50",
    textColor: "text-gray-700",
    iconColor: "text-gray-500",
  },
  cooling: {
    icon: TrendingDown,
    label: "Cooling",
    labelEs: "Enfriándose",
    bgColor: "bg-blue-50",
    textColor: "text-blue-700",
    iconColor: "text-blue-500",
  },
  dormant: {
    icon: Snowflake,
    label: "Dormant",
    labelEs: "Dormido",
    bgColor: "bg-gray-100",
    textColor: "text-gray-500",
    iconColor: "text-gray-400",
  },
};

/** Format "X days ago" in Spanish */
function formatDaysAgo(days: number): string {
  if (days === 0) return "hoy";
  if (days === 1) return "hace 1 día";
  return `hace ${days} días`;
}

/** Get trend direction from momentum */
function getTrend(momentumPct: number): "up" | "down" | "stable" {
  if (momentumPct > 20) return "up";
  if (momentumPct < -20) return "down";
  return "stable";
}

/** Get momentum arrow component */
function MomentumArrow({ trend }: { trend: "up" | "down" | "stable" }) {
  if (trend === "up") {
    return <ArrowUpRight size={14} className="text-betis-verde" />;
  }
  if (trend === "down") {
    return <ArrowDownRight size={14} className="text-red-500" />;
  }
  return <ArrowRight size={14} className="text-gray-400" />;
}

/** Player row component */
function PlayerRow({
  player,
  isSelected,
  onClick,
}: {
  player: TrendingPlayerWithTimeline;
  isSelected: boolean;
  onClick?: () => void;
}) {
  const trend = getTrend(player.momentumPct);

  return (
    <button
      onClick={onClick}
      aria-label={`Filtrar rumores por ${player.name}`}
      aria-pressed={isSelected}
      className={`w-full px-3 py-2.5 flex items-center gap-3 hover:bg-betis-verde-pale transition-colors text-left rounded-lg ${
        isSelected ? "bg-betis-verde-light ring-1 ring-betis-verde/20" : ""
      }`}
    >
      {/* Sparkline */}
      <div className="flex-shrink-0">
        <Sparkline
          data={player.timeline}
          trend={trend}
          width={56}
          height={18}
        />
      </div>

      {/* Player info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-1.5">
          <span className="font-medium text-gray-900 truncate text-sm">
            {player.name}
          </span>
          <MomentumArrow trend={trend} />
        </div>
        <div className="text-xs text-gray-500">
          {formatDaysAgo(player.daysSinceLastMention)} · {player.rumorCount}{" "}
          {player.rumorCount === 1 ? "mención" : "menciones"}
        </div>
      </div>

      {/* Momentum badge */}
      {player.momentumPct !== 0 && player.phase !== "dormant" && (
        <span
          className={`text-xs font-medium px-1.5 py-0.5 rounded ${
            player.momentumPct > 0
              ? "bg-betis-verde-light text-betis-verde-dark"
              : "bg-red-100 text-red-700"
          }`}
        >
          {player.momentumPct > 0 ? "+" : ""}
          {player.momentumPct}%
        </span>
      )}
    </button>
  );
}

/** Phase group component */
function PhaseGroup({
  phase,
  players,
  selectedPlayer,
  onPlayerClick,
}: {
  phase: MomentumPhase;
  players: TrendingPlayerWithTimeline[];
  selectedPlayer?: string | null;
  onPlayerClick?: (normalizedName: string) => void;
}) {
  const config = phaseConfig[phase];
  const Icon = config.icon;

  if (players.length === 0) return null;

  return (
    <div className="mb-3 last:mb-0">
      {/* Phase header */}
      <div
        className={`flex items-center gap-1.5 px-2 py-1 rounded-md ${config.bgColor} mb-1`}
      >
        <Icon size={14} className={config.iconColor} />
        <span className={`text-xs font-semibold uppercase ${config.textColor}`}>
          {config.labelEs}
        </span>
        <span className={`text-xs ${config.textColor} opacity-70`}>
          ({players.length})
        </span>
      </div>

      {/* Players in this phase */}
      <div className="space-y-0.5">
        {players.map((player) => (
          <PlayerRow
            key={player.normalizedName}
            player={player}
            isSelected={selectedPlayer === player.normalizedName}
            onClick={() => onPlayerClick?.(player.normalizedName)}
          />
        ))}
      </div>
    </div>
  );
}

/**
 * Enhanced trending players visualization with sparklines and momentum grouping.
 * Collapsible by default, shows players grouped by activity phase.
 */
export default function TrendingPlayersChart({
  players,
  onPlayerClick,
  selectedPlayer,
  defaultCollapsed = true,
}: TrendingPlayersChartProps) {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);

  if (players.length === 0) {
    return null;
  }

  // Group players by phase
  const phaseOrder: MomentumPhase[] = [
    "hot",
    "rising",
    "stable",
    "cooling",
    "dormant",
  ];
  const groupedPlayers = phaseOrder.reduce(
    (acc, phase) => {
      acc[phase] = players.filter((p) => p.phase === phase);
      return acc;
    },
    {} as Record<MomentumPhase, TrendingPlayerWithTimeline[]>,
  );

  // Count active players (not dormant)
  const activeCount = players.filter((p) => p.phase !== "dormant").length;

  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      {/* Header - always visible */}
      <button
        onClick={() => setIsCollapsed(!isCollapsed)}
        className="w-full px-4 py-3 flex items-center justify-between hover:bg-gray-50 transition-colors"
        aria-expanded={!isCollapsed}
        aria-controls="trending-players-content"
      >
        <div className="flex items-center gap-2">
          <TrendingUp className="text-betis-verde" size={18} />
          <span className="font-semibold text-gray-900 text-sm">
            Evolución de Rumores
          </span>
          <span className="text-xs text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
            {activeCount} activos
          </span>
        </div>
        {isCollapsed ? (
          <ChevronDown size={18} className="text-gray-400" />
        ) : (
          <ChevronUp size={18} className="text-gray-400" />
        )}
      </button>

      {/* Content - collapsible */}
      {!isCollapsed && (
        <div
          id="trending-players-content"
          className="px-3 pb-3 border-t border-gray-100"
        >
          {/* Legend */}
          <div className="flex flex-wrap gap-2 py-2 mb-2 border-b border-gray-100">
            <span className="text-xs text-gray-500">Últimos 14 días:</span>
            <div className="flex items-center gap-1">
              <div className="w-8 h-2 bg-gradient-to-r from-gray-200 via-betis-verde-light to-betis-verde rounded" />
              <span className="text-xs text-gray-500">actividad</span>
            </div>
          </div>

          {/* Phase groups */}
          {phaseOrder.map((phase) => (
            <PhaseGroup
              key={phase}
              phase={phase}
              players={groupedPlayers[phase]}
              selectedPlayer={selectedPlayer}
              onPlayerClick={onPlayerClick}
            />
          ))}

          {/* Empty state */}
          {players.length === 0 && (
            <p className="text-sm text-gray-500 text-center py-4">
              No hay jugadores en tendencia
            </p>
          )}
        </div>
      )}
    </div>
  );
}
