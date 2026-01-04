"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  Edit2,
  ChevronLeft,
  ChevronRight,
  Shield,
  Newspaper,
} from "lucide-react";
import Button from "@/components/ui/Button";
import LoadingSpinner from "@/components/LoadingSpinner";
import clsx from "clsx";
import type { Player } from "@/lib/supabase";

interface PlayerWithDetails extends Player {
  display_name?: string | null;
}

interface PlayersListProps {
  readonly onEditPlayer?: (player: PlayerWithDetails) => void;
}

interface PaginationInfo {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export default function PlayersList({ onEditPlayer }: PlayersListProps) {
  const [players, setPlayers] = useState<PlayerWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [currentSquadOnly, setCurrentSquadOnly] = useState(false);
  const [withRumorsOnly, setWithRumorsOnly] = useState(false);
  const [pagination, setPagination] = useState<PaginationInfo>({
    page: 1,
    limit: 25,
    total: 0,
    totalPages: 0,
  });

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 300);
    return () => clearTimeout(timer);
  }, [search]);

  // Track previous filter values to detect changes and reset page
  const prevFiltersRef = useRef({
    debouncedSearch,
    currentSquadOnly,
    withRumorsOnly,
  });

  const fetchPlayers = useCallback(async (pageOverride?: number) => {
    setLoading(true);
    setError(null);

    const pageToFetch = pageOverride ?? pagination.page;

    try {
      const params = new URLSearchParams();
      params.set("page", pageToFetch.toString());
      params.set("limit", pagination.limit.toString());

      if (debouncedSearch) {
        params.set("search", debouncedSearch);
      }
      if (currentSquadOnly) {
        params.set("currentSquad", "true");
      }
      if (withRumorsOnly) {
        params.set("withRumors", "true");
      }

      const response = await fetch(`/api/admin/players?${params}`);
      const result = await response.json();

      if (result.success) {
        setPlayers(result.players);
        setPagination((prev) => ({
          ...prev,
          page: pageToFetch,
          total: result.pagination.total,
          totalPages: result.pagination.totalPages,
        }));
      } else {
        setError(result.error || "Error al cargar jugadores");
      }
    } catch (err) {
      setError("Error al cargar jugadores");
    } finally {
      setLoading(false);
    }
  }, [debouncedSearch, currentSquadOnly, withRumorsOnly, pagination.page, pagination.limit]);

  // Single effect to handle fetching with filter change detection
  useEffect(() => {
    const filtersChanged =
      prevFiltersRef.current.debouncedSearch !== debouncedSearch ||
      prevFiltersRef.current.currentSquadOnly !== currentSquadOnly ||
      prevFiltersRef.current.withRumorsOnly !== withRumorsOnly;

    // Update ref for next comparison
    prevFiltersRef.current = { debouncedSearch, currentSquadOnly, withRumorsOnly };

    // Reset to page 1 when filters change, otherwise use current page
    fetchPlayers(filtersChanged ? 1 : undefined);
  }, [debouncedSearch, currentSquadOnly, withRumorsOnly, fetchPlayers]);

  const handlePageChange = (newPage: number) => {
    fetchPlayers(newPage);
  };

  if (loading && players.length === 0) {
    return <LoadingSpinner size="md" label="Cargando jugadores..." />;
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        <p>{error}</p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => fetchPlayers()}
          className="mt-4"
        >
          Reintentar
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar por nombre o alias..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-betis-verde focus:border-transparent"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={currentSquadOnly}
              onChange={(e) => setCurrentSquadOnly(e.target.checked)}
              className="sr-only peer"
            />
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-betis-verde/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-betis-verde"></div>
            <span className="ms-2 text-sm font-medium text-gray-700">
              Solo plantilla
            </span>
          </label>

          <label className="inline-flex items-center cursor-pointer">
            <input
              type="checkbox"
              checked={withRumorsOnly}
              onChange={(e) => setWithRumorsOnly(e.target.checked)}
              className="sr-only peer"
            />
            <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-betis-verde/20 rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-betis-verde"></div>
            <span className="ms-2 text-sm font-medium text-gray-700">
              Con noticias
            </span>
          </label>
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-gray-500">
        {pagination.total} jugadores encontrados
      </div>

      {/* Players table */}
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Jugador
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Alias
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Noticias
              </th>
              <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                Estado
              </th>
              <th className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {players.map((player) => (
              <tr key={player.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 whitespace-nowrap">
                  <div>
                    <div className="font-medium text-gray-900">
                      {player.display_name || player.name}
                    </div>
                    {player.display_name &&
                      player.display_name !== player.name && (
                        <div className="text-sm text-gray-500">
                          {player.name}
                        </div>
                      )}
                  </div>
                </td>
                <td className="px-4 py-3">
                  <div className="flex flex-wrap gap-1">
                    {player.aliases &&
                    (player.aliases as string[]).length > 0 ? (
                      (player.aliases as string[])
                        .slice(0, 3)
                        .map((alias, idx) => (
                          <span
                            key={idx}
                            className="inline-block px-2 py-0.5 text-xs bg-gray-100 text-gray-600 rounded"
                          >
                            {alias}
                          </span>
                        ))
                    ) : (
                      <span className="text-sm text-gray-400">Sin alias</span>
                    )}
                    {player.aliases &&
                      (player.aliases as string[]).length > 3 && (
                        <span className="text-xs text-gray-400">
                          +{(player.aliases as string[]).length - 3} más
                        </span>
                      )}
                  </div>
                </td>
                <td className="px-4 py-3 text-center whitespace-nowrap">
                  <span
                    className={clsx(
                      "inline-flex items-center gap-1 px-2 py-1 rounded text-sm font-medium",
                      player.rumor_count > 0
                        ? "bg-betis-verde-light text-betis-verde-dark"
                        : "bg-gray-100 text-gray-500",
                    )}
                  >
                    <Newspaper className="h-3 w-3" />
                    {player.rumor_count}
                  </span>
                </td>
                <td className="px-4 py-3 text-center whitespace-nowrap">
                  {player.is_current_squad ? (
                    <span className="inline-flex items-center gap-1 px-2 py-1 bg-betis-verde text-white rounded text-xs font-medium">
                      <Shield className="h-3 w-3" />
                      Plantilla
                    </span>
                  ) : (
                    <span className="text-gray-400 text-sm">-</span>
                  )}
                </td>
                <td className="px-4 py-3 text-right whitespace-nowrap">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onEditPlayer?.(player)}
                    leftIcon={<Edit2 className="h-3 w-3" />}
                  >
                    Editar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {players.length === 0 && !loading && (
        <div className="text-center py-8 text-gray-500">
          No se encontraron jugadores con los filtros seleccionados
        </div>
      )}

      {/* Pagination */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 pt-4">
          <div className="text-sm text-gray-500">
            Página {pagination.page} de {pagination.totalPages}
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page - 1)}
              disabled={pagination.page <= 1}
              leftIcon={<ChevronLeft className="h-4 w-4" />}
            >
              Anterior
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.page + 1)}
              disabled={pagination.page >= pagination.totalPages}
              rightIcon={<ChevronRight className="h-4 w-4" />}
            >
              Siguiente
            </Button>
          </div>
        </div>
      )}

      {loading && players.length > 0 && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center">
          <LoadingSpinner size="md" />
        </div>
      )}
    </div>
  );
}
