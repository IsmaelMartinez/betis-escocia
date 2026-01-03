"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import Card, { CardBody } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import MessageComponent from "@/components/MessageComponent";
import LoadingSpinner from "@/components/LoadingSpinner";
import {
  RefreshCw,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
  User,
  EyeOff,
  Eye,
  X,
  Plus,
  Check,
  Edit2,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import clsx from "clsx";
import type { BetisNewsWithPlayers } from "@/types/soylenti";

interface PlayerSearchResult {
  id: number;
  name: string;
  normalized_name: string;
  rumor_count: number;
}

interface SoylentiNewsListProps {
  news: BetisNewsWithPlayers[];
  onReassess: (
    newsId: number,
    adminContext: string,
  ) => Promise<{ success: boolean; error?: string }>;
  onHide: (
    newsId: number,
    hide: boolean,
    reason?: string,
  ) => Promise<{ success: boolean; error?: string }>;
  onUpdateProbability: (
    newsId: number,
    probability: number,
  ) => Promise<{ success: boolean; error?: string }>;
  onAddPlayer: (
    newsId: number,
    playerName: string,
  ) => Promise<{ success: boolean; error?: string }>;
  onRemovePlayer: (
    newsId: number,
    playerId: number,
  ) => Promise<{ success: boolean; error?: string }>;
  isLoading: boolean;
  error: string | null;
  currentPage?: number;
  totalCount?: number;
  itemsPerPage?: number;
  onPageChange?: (page: number) => void;
}

interface ReassessmentState {
  newsId: number | null;
  context: string;
  isSubmitting: boolean;
}

const SoylentiNewsList: React.FC<SoylentiNewsListProps> = ({
  news,
  onReassess,
  onHide,
  onUpdateProbability,
  onAddPlayer,
  onRemovePlayer,
  isLoading,
  error,
  currentPage = 1,
  totalCount = 0,
  itemsPerPage = 20,
  onPageChange,
}) => {
  const [reassessmentState, setReassessmentState] = useState<ReassessmentState>(
    {
      newsId: null,
      context: "",
      isSubmitting: false,
    },
  );
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [hidingNewsId, setHidingNewsId] = useState<number | null>(null);

  // Probability editing state
  const [editingProbabilityId, setEditingProbabilityId] = useState<
    number | null
  >(null);
  const [probabilityValue, setProbabilityValue] = useState<string>("");
  const [savingProbability, setSavingProbability] = useState(false);

  // Player management state
  const [addingPlayerToNewsId, setAddingPlayerToNewsId] = useState<
    number | null
  >(null);
  const [playerSearchQuery, setPlayerSearchQuery] = useState("");
  const [playerSearchResults, setPlayerSearchResults] = useState<
    PlayerSearchResult[]
  >([]);
  const [isSearchingPlayers, setIsSearchingPlayers] = useState(false);
  const [removingPlayerId, setRemovingPlayerId] = useState<number | null>(null);
  const playerSearchRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const dropdownId = useRef(`player-dropdown-${Date.now()}`).current;

  // Cleanup timeout on unmount to prevent memory leaks
  useEffect(() => {
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, []);

  // Auto-clear success/error messages after 5 seconds
  useEffect(() => {
    if (!successMessage) return;
    const timer = setTimeout(() => setSuccessMessage(null), 5000);
    return () => clearTimeout(timer);
  }, [successMessage]);

  useEffect(() => {
    if (!errorMessage) return;
    const timer = setTimeout(() => setErrorMessage(null), 8000);
    return () => clearTimeout(timer);
  }, [errorMessage]);

  const toggleExpand = (id: number) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  };

  const openReassessmentModal = (newsId: number) => {
    setReassessmentState({
      newsId,
      context: "",
      isSubmitting: false,
    });
    setSuccessMessage(null);
  };

  const closeReassessmentModal = () => {
    setReassessmentState({
      newsId: null,
      context: "",
      isSubmitting: false,
    });
  };

  const handleReassess = async () => {
    if (!reassessmentState.newsId || !reassessmentState.context.trim()) return;

    setReassessmentState((prev) => ({ ...prev, isSubmitting: true }));
    setErrorMessage(null);

    const result = await onReassess(
      reassessmentState.newsId,
      reassessmentState.context,
    );

    if (result.success) {
      setSuccessMessage("Noticia re-analizada correctamente");
      closeReassessmentModal();
    } else {
      setErrorMessage(result.error || "Error al re-analizar la noticia");
      setReassessmentState((prev) => ({ ...prev, isSubmitting: false }));
    }
  };

  const handleHideToggle = async (newsId: number, currentlyHidden: boolean) => {
    setHidingNewsId(newsId);
    setErrorMessage(null);

    const result = await onHide(newsId, !currentlyHidden);

    if (result.success) {
      setSuccessMessage(
        currentlyHidden
          ? "Noticia mostrada correctamente"
          : "Noticia ocultada correctamente",
      );
    } else {
      setErrorMessage(result.error || "Error al cambiar visibilidad");
    }

    setHidingNewsId(null);
  };

  // Probability editing handlers
  const startEditingProbability = (
    newsId: number,
    currentProbability: number | null,
  ) => {
    setEditingProbabilityId(newsId);
    setProbabilityValue(
      currentProbability !== null ? String(currentProbability) : "",
    );
  };

  const cancelEditingProbability = () => {
    setEditingProbabilityId(null);
    setProbabilityValue("");
  };

  const saveProbability = async (newsId: number) => {
    const value = parseFloat(probabilityValue);
    if (isNaN(value) || value < 0 || value > 100) {
      setErrorMessage("La probabilidad debe ser un número entre 0 y 100");
      return;
    }

    setSavingProbability(true);
    setErrorMessage(null);

    const result = await onUpdateProbability(newsId, value);

    if (result.success) {
      setSuccessMessage("Probabilidad actualizada correctamente");
      cancelEditingProbability();
    } else {
      setErrorMessage(result.error || "Error al actualizar la probabilidad");
    }

    setSavingProbability(false);
  };

  // Player search with debounce
  // Empty deps array is correct - state setters are stable references guaranteed by React
  const searchPlayers = useCallback(async (query: string) => {
    if (query.length < 2) {
      setPlayerSearchResults([]);
      return;
    }

    setIsSearchingPlayers(true);
    try {
      const response = await fetch("/api/admin/soylenti/players/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query, limit: 10 }),
      });
      const data = await response.json();
      if (data.success) {
        setPlayerSearchResults(data.players);
      }
    } catch (err) {
      // Log error but don't disrupt UX - empty results will show
      console.error("Player search failed:", err);
      setPlayerSearchResults([]);
    } finally {
      setIsSearchingPlayers(false);
    }
  }, []);

  const handlePlayerSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const query = e.target.value;
    setPlayerSearchQuery(query);

    // Debounce search
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      searchPlayers(query);
    }, 300);
  };

  const handleAddPlayer = async (newsId: number, playerName: string) => {
    if (!playerName.trim()) return;

    setErrorMessage(null);
    const result = await onAddPlayer(newsId, playerName.trim());

    if (result.success) {
      setSuccessMessage("Jugador añadido correctamente");
      setPlayerSearchQuery("");
      setPlayerSearchResults([]);
      setAddingPlayerToNewsId(null);
    } else {
      setErrorMessage(result.error || "Error al añadir el jugador");
    }
  };

  const handleRemovePlayer = async (newsId: number, playerId: number) => {
    setRemovingPlayerId(playerId);
    setErrorMessage(null);

    const result = await onRemovePlayer(newsId, playerId);

    if (result.success) {
      setSuccessMessage("Jugador eliminado correctamente");
    } else {
      setErrorMessage(result.error || "Error al eliminar el jugador");
    }

    setRemovingPlayerId(null);
  };

  const startAddingPlayer = (newsId: number) => {
    setAddingPlayerToNewsId(newsId);
    setPlayerSearchQuery("");
    setPlayerSearchResults([]);
    // Focus the input after render, tracking timeout for cleanup
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }
    searchTimeoutRef.current = setTimeout(() => {
      playerSearchRef.current?.focus();
    }, 100);
  };

  const cancelAddingPlayer = () => {
    setAddingPlayerToNewsId(null);
    setPlayerSearchQuery("");
    setPlayerSearchResults([]);
  };

  const getProbabilityColor = (probability: number | null | undefined) => {
    if (probability === null || probability === undefined) return "bg-gray-200";
    if (probability >= 70) return "bg-betis-verde";
    if (probability >= 40) return "bg-betis-oro";
    return "bg-gray-400";
  };

  const formatDate = (dateString: string) => {
    return new Intl.DateTimeFormat("es-ES", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(new Date(dateString));
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" label="Cargando noticias..." />
      </div>
    );
  }

  if (error) {
    return <MessageComponent type="error" message={error} />;
  }

  return (
    <div className="space-y-6">
      {successMessage && (
        <MessageComponent type="success" message={successMessage} />
      )}

      {errorMessage && <MessageComponent type="error" message={errorMessage} />}

      {news.length === 0 ? (
        <MessageComponent type="info" message="No hay noticias para mostrar." />
      ) : (
        <div className="space-y-4">
          {news.map((item) => {
              const isExpanded = expandedItems.has(item.id);
              const isReassessing = reassessmentState.newsId === item.id;
              const isHiding = hidingNewsId === item.id;

              const isEditingProbability = editingProbabilityId === item.id;
              const isAddingPlayer = addingPlayerToNewsId === item.id;

              return (
                <Card key={item.id} className="hover-lift">
                  <CardBody>
                    {/* Header */}
                    <div className="flex justify-between items-start gap-4 mb-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          {/* Probability Badge - Editable */}
                          {isEditingProbability ? (
                            <div className="inline-flex items-center gap-1">
                              <input
                                type="number"
                                min="0"
                                max="100"
                                value={probabilityValue}
                                onChange={(e) =>
                                  setProbabilityValue(e.target.value)
                                }
                                className="w-16 px-2 py-0.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-betis-verde"
                                autoFocus
                                onKeyDown={(e) => {
                                  if (e.key === "Enter")
                                    saveProbability(item.id);
                                  if (e.key === "Escape")
                                    cancelEditingProbability();
                                }}
                              />
                              <span className="text-xs text-gray-500">%</span>
                              <button
                                onClick={() => saveProbability(item.id)}
                                disabled={savingProbability}
                                className="p-0.5 text-betis-verde hover:text-betis-verde-dark disabled:opacity-50"
                                title="Guardar"
                                aria-label="Guardar probabilidad"
                              >
                                <Check size={14} />
                              </button>
                              <button
                                onClick={cancelEditingProbability}
                                disabled={savingProbability}
                                className="p-0.5 text-gray-500 hover:text-gray-700 disabled:opacity-50"
                                title="Cancelar"
                                aria-label="Cancelar edición"
                              >
                                <X size={14} />
                              </button>
                            </div>
                          ) : (
                            <button
                              onClick={() =>
                                startEditingProbability(
                                  item.id,
                                  item.ai_probability ?? null,
                                )
                              }
                              className={clsx(
                                "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium text-white cursor-pointer hover:opacity-80 transition-opacity",
                                getProbabilityColor(item.ai_probability),
                              )}
                              title="Clic para editar probabilidad"
                            >
                              {item.ai_probability !== null &&
                              item.ai_probability !== undefined
                                ? `${item.ai_probability}%`
                                : "Sin analizar"}
                              <Edit2 size={10} className="ml-0.5 opacity-70" />
                            </button>
                          )}

                          {/* Source Badge */}
                          <span className="inline-block bg-gray-200 text-gray-700 px-2 py-0.5 rounded-full text-xs">
                            {item.source}
                          </span>

                          {/* Reassessed indicator */}
                          {item.reassessed_at && (
                            <span className="inline-flex items-center text-xs text-betis-verde">
                              <CheckCircle size={12} className="mr-1" />
                              Re-analizado
                            </span>
                          )}

                          {/* Hidden indicator */}
                          {item.is_hidden && (
                            <span className="inline-flex items-center text-xs text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">
                              <EyeOff size={12} className="mr-1" />
                              Oculto
                            </span>
                          )}
                        </div>

                        <h3 className="font-semibold text-betis-black truncate">
                          {item.title}
                        </h3>

                        <div className="text-xs text-gray-500 mt-1">
                          {formatDate(item.pub_date)}
                        </div>

                        {/* Player Tags with management */}
                        <div className="flex flex-wrap gap-1 mt-2 items-center">
                          {item.news_players &&
                            item.news_players.map(
                              (np) =>
                                np.players && (
                                  <span
                                    key={np.player_id}
                                    className={clsx(
                                      "inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs",
                                      removingPlayerId === np.player_id &&
                                        "opacity-50",
                                    )}
                                  >
                                    <User size={10} />
                                    {np.players.name}
                                    <button
                                      onClick={() =>
                                        handleRemovePlayer(
                                          item.id,
                                          np.player_id,
                                        )
                                      }
                                      disabled={
                                        removingPlayerId === np.player_id
                                      }
                                      className="ml-0.5 p-0.5 hover:bg-blue-200 rounded-full transition-colors"
                                      title="Eliminar jugador"
                                      aria-label={`Eliminar ${np.players.name}`}
                                    >
                                      <X size={10} />
                                    </button>
                                  </span>
                                ),
                            )}

                          {/* Add player button/form */}
                          {isAddingPlayer ? (
                            <div className="relative inline-flex items-center gap-1">
                              <input
                                ref={playerSearchRef}
                                type="text"
                                value={playerSearchQuery}
                                onChange={handlePlayerSearchChange}
                                placeholder="Nombre del jugador..."
                                className="w-40 px-2 py-0.5 text-xs border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-betis-verde"
                                role="combobox"
                                aria-expanded={playerSearchResults.length > 0}
                                aria-autocomplete="list"
                                aria-controls={dropdownId}
                                aria-label="Buscar jugador"
                                onKeyDown={(e) => {
                                  if (
                                    e.key === "Enter" &&
                                    playerSearchQuery.trim()
                                  ) {
                                    handleAddPlayer(item.id, playerSearchQuery);
                                  }
                                  if (e.key === "Escape") cancelAddingPlayer();
                                }}
                              />
                              <button
                                onClick={() =>
                                  handleAddPlayer(item.id, playerSearchQuery)
                                }
                                disabled={!playerSearchQuery.trim()}
                                className="p-0.5 text-betis-verde hover:text-betis-verde-dark disabled:opacity-50"
                                title="Añadir jugador"
                                aria-label="Añadir jugador"
                              >
                                <Check size={14} />
                              </button>
                              <button
                                onClick={cancelAddingPlayer}
                                className="p-0.5 text-gray-500 hover:text-gray-700"
                                title="Cancelar"
                                aria-label="Cancelar búsqueda"
                              >
                                <X size={14} />
                              </button>

                              {/* Autocomplete dropdown */}
                              {playerSearchResults.length > 0 && (
                                <div
                                  id={dropdownId}
                                  role="listbox"
                                  className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50 max-h-40 overflow-y-auto"
                                >
                                  {playerSearchResults.map((player) => (
                                    <button
                                      key={player.id}
                                      role="option"
                                      onClick={() =>
                                        handleAddPlayer(item.id, player.name)
                                      }
                                      className="w-full px-3 py-1.5 text-left text-xs hover:bg-gray-100 flex items-center gap-2"
                                    >
                                      <User
                                        size={12}
                                        className="text-gray-400"
                                      />
                                      <span>{player.name}</span>
                                      <span className="text-gray-400 ml-auto">
                                        ({player.rumor_count})
                                      </span>
                                    </button>
                                  ))}
                                </div>
                              )}
                              {isSearchingPlayers && (
                                <div className="absolute top-full left-0 mt-1 w-48 bg-white border border-gray-200 rounded-md shadow-lg z-50 p-2">
                                  <span className="text-xs text-gray-500">
                                    Buscando...
                                  </span>
                                </div>
                              )}
                            </div>
                          ) : (
                            <button
                              onClick={() => startAddingPlayer(item.id)}
                              className="inline-flex items-center gap-0.5 bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full text-xs hover:bg-gray-200 transition-colors"
                              title="Añadir jugador"
                            >
                              <Plus size={10} />
                              Añadir
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          onClick={() =>
                            handleHideToggle(item.id, item.is_hidden || false)
                          }
                          disabled={isHiding}
                          className={clsx(
                            "text-gray-500 hover:text-betis-verde disabled:opacity-50",
                            isHiding && "animate-pulse",
                          )}
                          title={
                            item.is_hidden
                              ? "Mostrar noticia"
                              : "Ocultar noticia"
                          }
                        >
                          {item.is_hidden ? (
                            <EyeOff size={18} />
                          ) : (
                            <Eye size={18} />
                          )}
                        </button>
                        <a
                          href={item.link}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-gray-500 hover:text-betis-verde"
                          title="Ver artículo original"
                        >
                          <ExternalLink size={18} />
                        </a>
                        <button
                          onClick={() => toggleExpand(item.id)}
                          className="text-gray-500 hover:text-betis-verde"
                          title={
                            isExpanded ? "Ocultar detalles" : "Ver detalles"
                          }
                        >
                          {isExpanded ? (
                            <ChevronUp size={18} />
                          ) : (
                            <ChevronDown size={18} />
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Expanded Content */}
                    {isExpanded && (
                      <div className="border-t border-gray-200 pt-3 mt-3">
                        {item.description && (
                          <p className="text-sm text-gray-600 mb-3">
                            {item.description}
                          </p>
                        )}

                        {item.ai_analysis && (
                          <div className="bg-betis-verde-pale p-3 rounded-lg mb-3">
                            <h4 className="text-xs font-semibold text-betis-verde-dark mb-1">
                              Análisis IA:
                            </h4>
                            <p className="text-sm text-gray-700">
                              {item.ai_analysis}
                            </p>
                          </div>
                        )}

                        {item.admin_context && (
                          <div className="bg-yellow-50 p-3 rounded-lg mb-3">
                            <h4 className="text-xs font-semibold text-yellow-800 mb-1 flex items-center">
                              <AlertCircle size={12} className="mr-1" />
                              Contexto del administrador:
                            </h4>
                            <p className="text-sm text-yellow-700">
                              {item.admin_context}
                            </p>
                          </div>
                        )}

                        {/* Reassessment Form */}
                        {isReassessing ? (
                          <div className="border-t border-gray-200 pt-3 mt-3">
                            <h4 className="text-sm font-semibold text-betis-black mb-2">
                              Re-análisis con IA
                            </h4>

                            <textarea
                              id={`context-${item.id}`}
                              value={reassessmentState.context}
                              onChange={(e) =>
                                setReassessmentState((prev) => ({
                                  ...prev,
                                  context: e.target.value,
                                }))
                              }
                              placeholder="Añade contexto para el re-análisis (ej: jugador incorrecto, no es un fichaje...)"
                              rows={3}
                              maxLength={500}
                              className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-betis-verde resize-none mb-3"
                            />

                            <div className="flex gap-2">
                              <Button
                                onClick={handleReassess}
                                variant="primary"
                                size="sm"
                                isLoading={reassessmentState.isSubmitting}
                                disabled={!reassessmentState.context.trim()}
                                leftIcon={<RefreshCw size={14} />}
                              >
                                Re-analizar
                              </Button>
                              <Button
                                onClick={closeReassessmentModal}
                                variant="outline"
                                size="sm"
                                disabled={reassessmentState.isSubmitting}
                              >
                                Cancelar
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <Button
                            onClick={() => openReassessmentModal(item.id)}
                            variant="secondary"
                            size="sm"
                            leftIcon={<RefreshCw size={14} />}
                          >
                            Solicitar re-análisis
                          </Button>
                        )}
                      </div>
                    )}
                  </CardBody>
                </Card>
              );
            })}

          {/* Pagination Controls */}
          {onPageChange && totalCount > itemsPerPage && (
            <div className="flex items-center justify-between mt-6 pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                Mostrando {(currentPage - 1) * itemsPerPage + 1} -{" "}
                {(currentPage - 1) * itemsPerPage + news.length} de {totalCount}
              </div>
              <div className="flex items-center gap-2">
                <Button
                  onClick={() => onPageChange(currentPage - 1)}
                  disabled={currentPage <= 1}
                  variant="outline"
                  size="sm"
                  leftIcon={<ChevronLeft size={16} />}
                >
                  Anterior
                </Button>
                <span className="text-sm text-gray-600 px-3">
                  Página {currentPage} de {Math.ceil(totalCount / itemsPerPage)}
                </span>
                <Button
                  onClick={() => onPageChange(currentPage + 1)}
                  disabled={currentPage >= Math.ceil(totalCount / itemsPerPage)}
                  variant="outline"
                  size="sm"
                  rightIcon={<ChevronRight size={16} />}
                >
                  Siguiente
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default SoylentiNewsList;
