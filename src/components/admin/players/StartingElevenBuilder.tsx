"use client";

import { useState, useEffect, useCallback } from "react";
import { Save, Trash2, Plus, RefreshCw } from "lucide-react";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/LoadingSpinner";
import PitchView from "./PitchView";
import { FORMATION_POSITIONS } from "@/types/squad";
import type {
  SquadMember,
  Formation,
  LineupPlayer,
  PositionShort,
  StartingEleven,
} from "@/types/squad";

const FORMATION_OPTIONS: Formation[] = [
  "4-3-3",
  "4-4-2",
  "4-2-3-1",
  "3-5-2",
  "3-4-3",
  "5-3-2",
  "4-1-4-1",
  "4-5-1",
];

export default function StartingElevenBuilder() {
  const [formation, setFormation] = useState<Formation>("4-3-3");
  const [lineup, setLineup] = useState<LineupPlayer[]>([]);
  const [squadMembers, setSquadMembers] = useState<SquadMember[]>([]);
  const [savedFormations, setSavedFormations] = useState<StartingEleven[]>([]);
  const [selectedPositionIndex, setSelectedPositionIndex] = useState<
    number | null
  >(null);
  const [formationName, setFormationName] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Fetch squad members
  const fetchSquad = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/squad");
      const result = await response.json();
      if (result.success) {
        setSquadMembers(
          result.squadMembers.filter(
            (m: SquadMember) => m.squad_status === "active",
          ),
        );
      }
    } catch (err) {
      setError("Error al cargar la plantilla");
    }
  }, []);

  // Fetch saved formations
  const fetchFormations = useCallback(async () => {
    try {
      const response = await fetch("/api/admin/formations");
      const result = await response.json();
      if (result.success) {
        setSavedFormations(result.formations);
      }
    } catch (err) {
      // Silently fail
    }
  }, []);

  useEffect(() => {
    Promise.all([fetchSquad(), fetchFormations()]).finally(() =>
      setLoading(false),
    );
  }, [fetchSquad, fetchFormations]);

  const positions = FORMATION_POSITIONS[formation];

  // Get player name by ID
  const getPlayerName = (playerId: number): string => {
    const member = squadMembers.find((m) => m.player_id === playerId);
    return member?.player?.display_name || member?.player?.name || "Jugador";
  };

  // Handle position click - select for player assignment
  const handlePositionClick = (
    position: { position: PositionShort; x: number; y: number },
    index: number,
  ) => {
    setSelectedPositionIndex(index);
  };

  // Handle player selection from the sidebar
  const handlePlayerSelect = (member: SquadMember) => {
    if (selectedPositionIndex === null) return;

    const position = positions[selectedPositionIndex];

    // Check if player is already in lineup
    const existingIndex = lineup.findIndex(
      (l) => l.playerId === member.player_id,
    );
    if (existingIndex >= 0) {
      // Remove from old position
      setLineup((prev) => prev.filter((l) => l.playerId !== member.player_id));
    }

    // Add to new position
    const newLineupPlayer: LineupPlayer = {
      playerId: member.player_id,
      squadMemberId: member.id,
      position: position.position,
      x: position.x,
      y: position.y,
    };

    // Remove any existing player at this position
    setLineup((prev) => {
      const filtered = prev.filter(
        (l) =>
          !(Math.abs(l.x - position.x) < 5 && Math.abs(l.y - position.y) < 5),
      );
      return [...filtered, newLineupPlayer];
    });

    setSelectedPositionIndex(null);
  };

  // Handle remove player from position
  const handleRemovePlayer = (index: number) => {
    const position = positions[index];
    setLineup((prev) =>
      prev.filter(
        (l) =>
          !(Math.abs(l.x - position.x) < 5 && Math.abs(l.y - position.y) < 5),
      ),
    );
  };

  // Check if player is in lineup
  const isPlayerInLineup = (playerId: number): boolean => {
    return lineup.some((l) => l.playerId === playerId);
  };

  // Save formation
  const handleSave = async () => {
    if (!formationName.trim()) {
      setError("Por favor, introduce un nombre para la alineación");
      return;
    }

    if (lineup.length !== 11) {
      setError("La alineación debe tener 11 jugadores");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccessMessage(null);

    try {
      const response = await fetch("/api/admin/formations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: formationName,
          formation,
          lineup,
          isActive: true,
          isPredicted: false,
        }),
      });

      const result = await response.json();

      if (result.success) {
        setSuccessMessage("Alineación guardada correctamente");
        setFormationName("");
        setLineup([]);
        fetchFormations();
      } else {
        setError(result.error || "Error al guardar");
      }
    } catch (err) {
      setError("Error al guardar la alineación");
    } finally {
      setSaving(false);
    }
  };

  // Load saved formation
  const handleLoadFormation = (saved: StartingEleven) => {
    setFormation(saved.formation as Formation);
    setLineup(saved.lineup);
    setFormationName(saved.name);
  };

  // Delete saved formation
  const handleDeleteFormation = async (id: number) => {
    try {
      const response = await fetch(`/api/admin/formations/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (result.success) {
        fetchFormations();
      } else {
        setError(result.error || "Error al eliminar");
      }
    } catch (err) {
      setError("Error al eliminar la alineación");
    }
  };

  // Clear lineup
  const handleClear = () => {
    setLineup([]);
    setSelectedPositionIndex(null);
    setFormationName("");
  };

  if (loading) {
    return <LoadingSpinner size="md" label="Cargando..." />;
  }

  if (squadMembers.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No hay jugadores en la plantilla. Sincroniza primero desde la pestaña
        Plantilla.
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Messages */}
      {successMessage && (
        <div className="bg-green-100 text-green-700 p-3 rounded-lg">
          {successMessage}
        </div>
      )}
      {error && (
        <div className="bg-red-100 text-red-700 p-3 rounded-lg">{error}</div>
      )}

      {/* Formation selector */}
      <div className="flex flex-wrap gap-4 items-center">
        <div>
          <label
            htmlFor="formation"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Formación
          </label>
          <select
            id="formation"
            value={formation}
            onChange={(e) => {
              setFormation(e.target.value as Formation);
              setLineup([]);
              setSelectedPositionIndex(null);
            }}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-betis-verde focus:border-transparent"
          >
            {FORMATION_OPTIONS.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label
            htmlFor="formationName"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Nombre de la alineación
          </label>
          <input
            id="formationName"
            type="text"
            value={formationName}
            onChange={(e) => setFormationName(e.target.value)}
            placeholder="Ej: vs Athletic - Copa del Rey"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-betis-verde focus:border-transparent"
          />
        </div>

        <div className="flex gap-2 pt-6">
          <Button
            variant="outline"
            onClick={handleClear}
            leftIcon={<RefreshCw className="h-4 w-4" />}
          >
            Limpiar
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            isLoading={saving}
            disabled={lineup.length !== 11}
            leftIcon={<Save className="h-4 w-4" />}
          >
            Guardar
          </Button>
        </div>
      </div>

      {/* Main content: Pitch + Squad */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Pitch */}
        <div className="lg:col-span-2">
          <div className="bg-gray-100 rounded-lg p-4">
            <div className="text-center mb-2 text-sm text-gray-500">
              {lineup.length}/11 jugadores seleccionados
              {selectedPositionIndex !== null && (
                <span className="ml-2 text-betis-verde font-medium">
                  - Selecciona un jugador para la posición{" "}
                  {positions[selectedPositionIndex].position}
                </span>
              )}
            </div>
            <PitchView
              positions={positions}
              lineup={lineup}
              getPlayerName={getPlayerName}
              onPositionClick={handlePositionClick}
              onRemovePlayer={handleRemovePlayer}
              highlightedPosition={selectedPositionIndex}
            />
          </div>
        </div>

        {/* Squad sidebar */}
        <div className="space-y-4">
          <h4 className="font-medium text-gray-700">Plantilla Disponible</h4>
          <div className="max-h-[500px] overflow-y-auto space-y-2 pr-2">
            {squadMembers.map((member) => {
              const isInLineup = isPlayerInLineup(member.player_id);
              const playerName =
                member.player?.display_name || member.player?.name || "Jugador";

              return (
                <button
                  key={member.id}
                  onClick={() => handlePlayerSelect(member)}
                  disabled={selectedPositionIndex === null}
                  className={`w-full text-left px-3 py-2 rounded-lg border transition-colors ${
                    isInLineup
                      ? "bg-betis-verde-light border-betis-verde text-betis-verde-dark"
                      : selectedPositionIndex !== null
                        ? "bg-white border-gray-200 hover:border-betis-verde hover:bg-betis-verde-pale cursor-pointer"
                        : "bg-gray-50 border-gray-200 opacity-60 cursor-not-allowed"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                        member.position_short === "GK"
                          ? "bg-yellow-500"
                          : ["CB", "LB", "RB"].includes(
                                member.position_short || "",
                              )
                            ? "bg-blue-500"
                            : ["DM", "CM", "AM"].includes(
                                  member.position_short || "",
                                )
                              ? "bg-green-500"
                              : "bg-red-500"
                      }`}
                    >
                      {member.shirt_number || playerName.charAt(0)}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-gray-900 truncate">
                        {playerName}
                      </div>
                      <div className="text-xs text-gray-500">
                        {member.position_short ||
                          member.position ||
                          "Sin posición"}
                      </div>
                    </div>
                    {isInLineup && (
                      <span className="text-xs bg-betis-verde text-white px-1.5 py-0.5 rounded">
                        En campo
                      </span>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Saved formations */}
      {savedFormations.length > 0 && (
        <div className="border-t pt-6">
          <h4 className="font-medium text-gray-700 mb-4">
            Alineaciones Guardadas
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {savedFormations.map((saved) => (
              <div key={saved.id} className="border rounded-lg p-3 bg-white">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <div className="font-medium text-gray-900">
                      {saved.name}
                    </div>
                    <div className="text-sm text-gray-500">
                      {saved.formation}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleLoadFormation(saved)}
                      leftIcon={<Plus className="h-3 w-3" />}
                    >
                      Cargar
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteFormation(saved.id)}
                      className="text-red-500 hover:text-red-600"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
