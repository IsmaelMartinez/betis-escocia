"use client";

import { User, X } from "lucide-react";
import clsx from "clsx";
import type { LineupPlayer, PositionShort } from "@/types/squad";

interface PitchPosition {
  position: PositionShort;
  x: number;
  y: number;
}

interface PitchViewProps {
  readonly positions: PitchPosition[];
  readonly lineup: LineupPlayer[];
  readonly getPlayerName: (playerId: number) => string;
  readonly onPositionClick?: (position: PitchPosition, index: number) => void;
  readonly onRemovePlayer?: (index: number) => void;
  readonly highlightedPosition?: number | null;
}

const POSITION_COLORS: Record<string, string> = {
  GK: "bg-yellow-500",
  CB: "bg-blue-500",
  LB: "bg-blue-400",
  RB: "bg-blue-400",
  DM: "bg-green-600",
  CM: "bg-green-500",
  AM: "bg-green-400",
  LW: "bg-red-400",
  RW: "bg-red-400",
  ST: "bg-red-500",
};

export default function PitchView({
  positions,
  lineup,
  getPlayerName,
  onPositionClick,
  onRemovePlayer,
  highlightedPosition,
}: PitchViewProps) {
  // Find lineup player for a given position index
  const getLineupForPosition = (index: number): LineupPlayer | undefined => {
    return lineup.find(
      (l) =>
        Math.abs(l.x - positions[index].x) < 5 &&
        Math.abs(l.y - positions[index].y) < 5,
    );
  };

  return (
    <div className="relative aspect-[2/3] max-w-md mx-auto bg-gradient-to-b from-green-600 to-green-700 rounded-lg overflow-hidden shadow-lg">
      {/* Pitch markings */}
      <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 150">
        {/* Pitch outline */}
        <rect
          x="5"
          y="5"
          width="90"
          height="140"
          fill="none"
          stroke="white"
          strokeWidth="0.5"
          opacity="0.5"
        />

        {/* Center line */}
        <line
          x1="5"
          y1="75"
          x2="95"
          y2="75"
          stroke="white"
          strokeWidth="0.5"
          opacity="0.5"
        />

        {/* Center circle */}
        <circle
          cx="50"
          cy="75"
          r="15"
          fill="none"
          stroke="white"
          strokeWidth="0.5"
          opacity="0.5"
        />
        <circle cx="50" cy="75" r="0.5" fill="white" opacity="0.5" />

        {/* Top penalty area */}
        <rect
          x="20"
          y="5"
          width="60"
          height="25"
          fill="none"
          stroke="white"
          strokeWidth="0.5"
          opacity="0.5"
        />
        {/* Top goal area */}
        <rect
          x="35"
          y="5"
          width="30"
          height="10"
          fill="none"
          stroke="white"
          strokeWidth="0.5"
          opacity="0.5"
        />

        {/* Bottom penalty area */}
        <rect
          x="20"
          y="120"
          width="60"
          height="25"
          fill="none"
          stroke="white"
          strokeWidth="0.5"
          opacity="0.5"
        />
        {/* Bottom goal area */}
        <rect
          x="35"
          y="135"
          width="30"
          height="10"
          fill="none"
          stroke="white"
          strokeWidth="0.5"
          opacity="0.5"
        />

        {/* Corner arcs */}
        <path
          d="M 5 8 A 3 3 0 0 0 8 5"
          fill="none"
          stroke="white"
          strokeWidth="0.5"
          opacity="0.5"
        />
        <path
          d="M 92 5 A 3 3 0 0 0 95 8"
          fill="none"
          stroke="white"
          strokeWidth="0.5"
          opacity="0.5"
        />
        <path
          d="M 5 142 A 3 3 0 0 1 8 145"
          fill="none"
          stroke="white"
          strokeWidth="0.5"
          opacity="0.5"
        />
        <path
          d="M 92 145 A 3 3 0 0 1 95 142"
          fill="none"
          stroke="white"
          strokeWidth="0.5"
          opacity="0.5"
        />
      </svg>

      {/* Position markers */}
      {positions.map((pos, index) => {
        const lineupPlayer = getLineupForPosition(index);
        const playerName = lineupPlayer
          ? getPlayerName(lineupPlayer.playerId)
          : null;
        const isHighlighted = highlightedPosition === index;
        const hasPlayer = !!lineupPlayer;

        return (
          <div
            key={`${pos.position}-${index}`}
            className={clsx(
              "absolute transform -translate-x-1/2 -translate-y-1/2 transition-all",
              onPositionClick && "cursor-pointer",
              onPositionClick && "focus:outline-none focus:ring-2 focus:ring-white focus:ring-offset-2 focus:ring-offset-green-600 rounded",
            )}
            style={{
              left: `${pos.x}%`,
              top: `${100 - pos.y}%`, // Invert Y so bottom is 0
            }}
            role={onPositionClick ? "button" : undefined}
            tabIndex={onPositionClick ? 0 : -1}
            aria-label={
              onPositionClick
                ? hasPlayer
                  ? `Posición ${pos.position}: ${playerName}`
                  : `Posición ${pos.position} vacía`
                : undefined
            }
            onClick={() => onPositionClick?.(pos, index)}
            onKeyDown={(e) => {
              if (!onPositionClick) return;
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onPositionClick(pos, index);
              }
            }}
          >
            <div
              className={clsx(
                "relative flex flex-col items-center",
                isHighlighted &&
                  "ring-2 ring-white ring-offset-2 ring-offset-green-600 rounded",
              )}
            >
              {/* Player circle */}
              <div
                className={clsx(
                  "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-md border-2 border-white/30",
                  hasPlayer
                    ? POSITION_COLORS[pos.position] || "bg-gray-500"
                    : "bg-white/20",
                )}
              >
                {hasPlayer ? (
                  playerName?.charAt(0).toUpperCase() || (
                    <User className="h-5 w-5" />
                  )
                ) : (
                  <span className="text-white/60">{pos.position}</span>
                )}
              </div>

              {/* Player name */}
              {hasPlayer && playerName && (
                <div className="absolute -bottom-5 whitespace-nowrap text-[10px] text-white font-medium bg-black/40 px-1.5 py-0.5 rounded">
                  {playerName.split(" ").slice(-1)[0]}
                </div>
              )}

              {/* Position label when empty */}
              {!hasPlayer && (
                <div className="absolute -bottom-4 whitespace-nowrap text-[10px] text-white/60">
                  {pos.position}
                </div>
              )}

              {/* Remove button */}
              {hasPlayer && onRemovePlayer && (
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onRemovePlayer(index);
                  }}
                  className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full flex items-center justify-center hover:bg-red-600"
                  aria-label="Eliminar jugador"
                >
                  <X className="h-2.5 w-2.5 text-white" />
                </button>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}
