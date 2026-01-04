"use client";

import { useState, useEffect, useCallback } from "react";
import { User, Flag, Calendar, Edit2 } from "lucide-react";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/LoadingSpinner";
import clsx from "clsx";
import { POSITION_TO_GROUP } from "@/types/squad";
import type { SquadMember, Position, PositionGroup } from "@/types/squad";

interface SquadManagementProps {
  readonly onSync?: () => void;
}

const POSITION_GROUP_LABELS: Record<PositionGroup, string> = {
  goalkeepers: "Porteros",
  defenders: "Defensas",
  midfielders: "Centrocampistas",
  forwards: "Delanteros",
};

const POSITION_GROUP_ORDER: PositionGroup[] = [
  "goalkeepers",
  "defenders",
  "midfielders",
  "forwards",
];

export default function SquadManagement({ onSync }: SquadManagementProps) {
  const [squadMembers, setSquadMembers] = useState<SquadMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSquad = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/squad");
      const result = await response.json();

      if (result.success) {
        setSquadMembers(result.squadMembers);
      } else {
        setError(result.error || "Error al cargar plantilla");
      }
    } catch (err) {
      setError("Error al cargar la plantilla");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSquad();
  }, [fetchSquad]);

  // Group squad members by position group
  const groupedSquad = POSITION_GROUP_ORDER.reduce(
    (acc, group) => {
      acc[group] = squadMembers.filter((member) => {
        if (!member.position) return group === "forwards"; // Default unknown to forwards
        return POSITION_TO_GROUP[member.position as Position] === group;
      });
      return acc;
    },
    {} as Record<PositionGroup, SquadMember[]>
  );

  const formatDate = (dateStr: string | null): string => {
    if (!dateStr) return "-";
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString("es-ES", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
    } catch {
      return "-";
    }
  };

  const getAge = (dateOfBirth: string | null): number | null => {
    if (!dateOfBirth) return null;
    try {
      const dob = new Date(dateOfBirth);
      const today = new Date();
      let age = today.getFullYear() - dob.getFullYear();
      const monthDiff = today.getMonth() - dob.getMonth();
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
        age--;
      }
      return age;
    } catch {
      return null;
    }
  };

  if (loading) {
    return <LoadingSpinner size="md" label="Cargando plantilla..." />;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        <p>{error}</p>
        <Button variant="outline" size="sm" onClick={fetchSquad} className="mt-4">
          Reintentar
        </Button>
      </div>
    );
  }

  if (squadMembers.length === 0) {
    return (
      <div className="text-center py-8">
        <p className="text-gray-500 mb-4">
          No hay jugadores en la plantilla. Sincroniza desde Football-Data.org para importar la plantilla actual.
        </p>
        {onSync && (
          <Button variant="primary" onClick={onSync}>
            Sincronizar Plantilla
          </Button>
        )}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {POSITION_GROUP_ORDER.map((group) => {
        const members = groupedSquad[group];
        if (members.length === 0) return null;

        return (
          <div key={group}>
            <h3 className="text-lg font-semibold text-gray-700 mb-4 flex items-center gap-2">
              <span
                className={clsx(
                  "w-3 h-3 rounded-full",
                  group === "goalkeepers" && "bg-yellow-500",
                  group === "defenders" && "bg-blue-500",
                  group === "midfielders" && "bg-green-500",
                  group === "forwards" && "bg-red-500"
                )}
              />
              {POSITION_GROUP_LABELS[group]}
              <span className="text-sm font-normal text-gray-400">({members.length})</span>
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {members.map((member) => {
                const age = getAge(member.date_of_birth);
                const playerName =
                  member.player?.display_name || member.player?.name || "Jugador desconocido";

                return (
                  <div
                    key={member.id}
                    className={clsx(
                      "border rounded-lg p-4 bg-white hover:shadow-md transition-shadow",
                      member.squad_status !== "active" && "opacity-60"
                    )}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={clsx(
                            "w-10 h-10 rounded-full flex items-center justify-center text-white font-bold",
                            group === "goalkeepers" && "bg-yellow-500",
                            group === "defenders" && "bg-blue-500",
                            group === "midfielders" && "bg-green-500",
                            group === "forwards" && "bg-red-500"
                          )}
                        >
                          {member.shirt_number || <User className="h-5 w-5" />}
                        </div>
                        <div>
                          <div className="font-semibold text-gray-900">{playerName}</div>
                          <div className="text-sm text-gray-500">
                            {member.position_short || member.position || "Sin posición"}
                          </div>
                        </div>
                      </div>

                      {member.is_captain && (
                        <span className="px-2 py-0.5 text-xs bg-betis-oro text-white rounded font-medium">
                          C
                        </span>
                      )}
                      {member.is_vice_captain && (
                        <span className="px-2 py-0.5 text-xs bg-gray-400 text-white rounded font-medium">
                          VC
                        </span>
                      )}
                    </div>

                    <div className="mt-3 pt-3 border-t space-y-1.5">
                      {member.nationality && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Flag className="h-3.5 w-3.5" />
                          <span>{member.nationality}</span>
                        </div>
                      )}
                      {age !== null && (
                        <div className="flex items-center gap-2 text-sm text-gray-600">
                          <Calendar className="h-3.5 w-3.5" />
                          <span>{age} años</span>
                          {member.date_of_birth && (
                            <span className="text-gray-400">
                              ({formatDate(member.date_of_birth)})
                            </span>
                          )}
                        </div>
                      )}
                      {member.player?.rumor_count !== undefined && member.player.rumor_count > 0 && (
                        <div className="text-sm text-betis-verde">
                          {member.player.rumor_count} menciones en noticias
                        </div>
                      )}
                    </div>

                    {member.squad_status !== "active" && (
                      <div className="mt-2">
                        <span
                          className={clsx(
                            "inline-block px-2 py-0.5 text-xs rounded",
                            member.squad_status === "injured" && "bg-red-100 text-red-700",
                            member.squad_status === "suspended" && "bg-orange-100 text-orange-700",
                            member.squad_status === "loaned_out" && "bg-gray-100 text-gray-700",
                            member.squad_status === "on_loan" && "bg-blue-100 text-blue-700"
                          )}
                        >
                          {member.squad_status === "injured" && "Lesionado"}
                          {member.squad_status === "suspended" && "Sancionado"}
                          {member.squad_status === "loaned_out" && "Cedido"}
                          {member.squad_status === "on_loan" && "En préstamo"}
                        </span>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <div className="text-sm text-gray-400 text-center pt-4 border-t">
        Total: {squadMembers.length} jugadores en plantilla
      </div>
    </div>
  );
}
