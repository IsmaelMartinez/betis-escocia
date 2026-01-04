"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { X, Plus, Trash2, Save } from "lucide-react";
import Button from "@/components/ui/Button";
import type { Player } from "@/lib/supabase";

interface PlayerWithDetails extends Player {
  display_name?: string | null;
}

interface PlayerEditModalProps {
  readonly player: PlayerWithDetails | null;
  readonly isOpen: boolean;
  readonly onClose: () => void;
  readonly onSave: () => void;
}

export default function PlayerEditModal({
  player,
  isOpen,
  onClose,
  onSave,
}: PlayerEditModalProps) {
  const [displayName, setDisplayName] = useState("");
  const [aliases, setAliases] = useState<string[]>([]);
  const [newAlias, setNewAlias] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const modalRef = useRef<HTMLDivElement>(null);
  const firstInputRef = useRef<HTMLInputElement>(null);
  const previousActiveElement = useRef<HTMLElement | null>(null);

  // Initialize form when player changes
  useEffect(() => {
    if (player) {
      setDisplayName(player.display_name || "");
      setAliases((player.aliases as string[]) || []);
      setNewAlias("");
      setError(null);
    }
  }, [player]);

  // Focus management: trap focus in modal and restore on close
  useEffect(() => {
    if (isOpen) {
      previousActiveElement.current = document.activeElement as HTMLElement;
      // Focus first input after modal renders
      setTimeout(() => firstInputRef.current?.focus(), 0);
    } else if (previousActiveElement.current) {
      previousActiveElement.current.focus();
    }
  }, [isOpen]);

  // Handle escape key and focus trap
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === "Escape") {
        onClose();
        return;
      }

      // Focus trap
      if (e.key === "Tab" && modalRef.current) {
        const focusableElements = modalRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        const firstEl = focusableElements[0] as HTMLElement;
        const lastEl = focusableElements[
          focusableElements.length - 1
        ] as HTMLElement;

        if (e.shiftKey && document.activeElement === firstEl) {
          e.preventDefault();
          lastEl?.focus();
        } else if (!e.shiftKey && document.activeElement === lastEl) {
          e.preventDefault();
          firstEl?.focus();
        }
      }
    },
    [isOpen, onClose],
  );

  useEffect(() => {
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  const handleAddAlias = () => {
    const trimmed = newAlias.trim().toLowerCase();
    if (!trimmed) return;

    if (aliases.includes(trimmed)) {
      setError("Este alias ya existe");
      return;
    }

    setAliases([...aliases, trimmed]);
    setNewAlias("");
    setError(null);
  };

  const handleRemoveAlias = (aliasToRemove: string) => {
    setAliases(aliases.filter((a) => a !== aliasToRemove));
  };

  const handleSave = async () => {
    if (!player) return;

    setSaving(true);
    setError(null);

    try {
      const response = await fetch(`/api/admin/players/${player.id}/aliases`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          displayName: displayName || null,
          aliases,
        }),
      });

      const result = await response.json();

      if (result.success) {
        onSave();
        onClose();
      } else {
        setError(result.error || "Error al guardar");
      }
    } catch (err) {
      setError("Error al guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleAddAlias();
    }
  };

  if (!isOpen || !player) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 transition-opacity"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div
          ref={modalRef}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-title"
          className="relative bg-white rounded-lg shadow-xl w-full max-w-md"
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <h3
              id="modal-title"
              className="text-lg font-semibold text-gray-900"
            >
              Editar Jugador
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-500"
              aria-label="Cerrar"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {/* Body */}
          <div className="p-4 space-y-4">
            {/* Player name (read-only) */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nombre Original
              </label>
              <div className="px-3 py-2 bg-gray-100 rounded-lg text-gray-600">
                {player.name}
              </div>
            </div>

            {/* Display name */}
            <div>
              <label
                htmlFor="displayName"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Nombre a Mostrar
              </label>
              <input
                ref={firstInputRef}
                id="displayName"
                type="text"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="Ej: Isco"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-betis-verde focus:border-transparent"
              />
              <p className="mt-1 text-xs text-gray-500">
                El nombre que se mostrará en la UI (dejar vacío para usar el
                original)
              </p>
            </div>

            {/* Aliases */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Aliases
              </label>

              {/* Existing aliases */}
              <div className="flex flex-wrap gap-2 mb-2">
                {aliases.map((alias) => (
                  <span
                    key={alias}
                    className="inline-flex items-center gap-1 px-2 py-1 bg-gray-100 text-gray-700 rounded text-sm"
                  >
                    {alias}
                    <button
                      type="button"
                      onClick={() => handleRemoveAlias(alias)}
                      className="text-gray-400 hover:text-red-500"
                      aria-label={`Eliminar alias ${alias}`}
                    >
                      <Trash2 className="h-3 w-3" />
                    </button>
                  </span>
                ))}
                {aliases.length === 0 && (
                  <span className="text-sm text-gray-400">Sin aliases</span>
                )}
              </div>

              {/* Add new alias */}
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newAlias}
                  onChange={(e) => setNewAlias(e.target.value)}
                  onKeyDown={handleInputKeyDown}
                  placeholder="Añadir alias..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-betis-verde focus:border-transparent text-sm"
                />
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={handleAddAlias}
                  disabled={!newAlias.trim()}
                  leftIcon={<Plus className="h-4 w-4" />}
                >
                  Añadir
                </Button>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                Los aliases se usan para detectar menciones del jugador en
                noticias
              </p>
            </div>

            {/* Stats */}
            <div className="pt-2 border-t">
              <div className="flex justify-between text-sm text-gray-500">
                <span>Menciones en noticias:</span>
                <span className="font-medium text-gray-700">
                  {player.rumor_count}
                </span>
              </div>
              {player.is_current_squad && (
                <div className="flex justify-between text-sm text-gray-500 mt-1">
                  <span>Estado:</span>
                  <span className="font-medium text-betis-verde">
                    En plantilla
                  </span>
                </div>
              )}
            </div>

            {/* Error message */}
            {error && (
              <div className="p-2 bg-red-100 text-red-700 rounded text-sm">
                {error}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="flex justify-end gap-2 p-4 border-t">
            <Button variant="outline" onClick={onClose} disabled={saving}>
              Cancelar
            </Button>
            <Button
              variant="primary"
              onClick={handleSave}
              isLoading={saving}
              leftIcon={<Save className="h-4 w-4" />}
            >
              Guardar
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
