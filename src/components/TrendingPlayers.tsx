"use client";

import { TrendingUp, Flame, Snowflake } from "lucide-react";
import Card, { CardHeader, CardBody } from "@/components/ui/Card";
import type { TrendingPlayer } from "@/lib/supabase";

interface TrendingPlayersProps {
  players: TrendingPlayer[];
  onPlayerClick?: (normalizedName: string) => void;
  selectedPlayer?: string | null;
}

export default function TrendingPlayers({
  players,
  onPlayerClick,
  selectedPlayer,
}: TrendingPlayersProps) {
  if (players.length === 0) {
    return null;
  }

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("es-ES", {
      day: "numeric",
      month: "short",
    }).format(new Date(dateString));
  };

  return (
    <Card variant="elevated" className="mb-8">
      <CardHeader className="flex items-center gap-2">
        <TrendingUp className="text-betis-verde" size={20} />
        <h2 className="text-lg font-bold text-gray-900">
          Jugadores en Tendencia
        </h2>
      </CardHeader>
      <CardBody className="p-0">
        <div className="divide-y divide-gray-100">
          {players.map((player) => (
            <button
              key={player.normalizedName}
              onClick={() => onPlayerClick?.(player.normalizedName)}
              aria-label={`Filtrar rumores por ${player.name}`}
              aria-pressed={selectedPlayer === player.normalizedName}
              className={`w-full px-4 py-3 flex items-center justify-between hover:bg-betis-verde-pale transition-colors text-left ${
                selectedPlayer === player.normalizedName
                  ? "bg-betis-verde-light"
                  : ""
              }`}
            >
              <div className="flex items-center gap-3">
                {player.isActive ? (
                  <Flame className="text-betis-oro" size={16} />
                ) : (
                  <Snowflake className="text-gray-400" size={16} />
                )}
                <div>
                  <span className="font-medium text-gray-900">
                    {player.name}
                  </span>
                  <span className="ml-2 text-xs text-gray-500">
                    desde {formatDate(player.firstSeen)}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                    player.isActive
                      ? "bg-betis-verde text-white"
                      : "bg-gray-200 text-gray-600"
                  }`}
                >
                  {player.rumorCount} menciones
                </span>
              </div>
            </button>
          ))}
        </div>
      </CardBody>
    </Card>
  );
}
