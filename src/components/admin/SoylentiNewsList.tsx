"use client";

import React, { useState, useEffect } from "react";
import { BetisNews } from "@/lib/supabase";
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
} from "lucide-react";
import clsx from "clsx";

// Extended type to include player data from the joined query
interface NewsPlayer {
  player_id: number;
  role: string;
  players: {
    id: number;
    name: string;
    normalized_name: string;
  } | null;
}

interface BetisNewsWithPlayers extends BetisNews {
  news_players?: NewsPlayer[];
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
  isLoading: boolean;
  error: string | null;
  showHidden?: boolean;
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
  isLoading,
  error,
  showHidden = false,
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

      {errorMessage && (
        <MessageComponent type="error" message={errorMessage} />
      )}

      {news.length === 0 ? (
        <MessageComponent type="info" message="No hay noticias para mostrar." />
      ) : (
        <div className="space-y-4">
          {news
            .filter((item) => (showHidden ? item.is_hidden : !item.is_hidden))
            .map((item) => {
              const isExpanded = expandedItems.has(item.id);
              const isReassessing = reassessmentState.newsId === item.id;
              const isHiding = hidingNewsId === item.id;

            return (
              <Card key={item.id} className="hover-lift">
                <CardBody>
                  {/* Header */}
                  <div className="flex justify-between items-start gap-4 mb-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {/* Probability Badge */}
                        <span
                          className={clsx(
                            "inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium text-white",
                            getProbabilityColor(item.ai_probability),
                          )}
                        >
                          {item.ai_probability !== null &&
                          item.ai_probability !== undefined
                            ? `${item.ai_probability}%`
                            : "Sin analizar"}
                        </span>

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

                      {/* Player Tags */}
                      {item.news_players && item.news_players.length > 0 && (
                        <div className="flex flex-wrap gap-1 mt-2">
                          {item.news_players.map(
                            (np) =>
                              np.players && (
                                <span
                                  key={np.player_id}
                                  className="inline-flex items-center gap-1 bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full text-xs"
                                >
                                  <User size={10} />
                                  {np.players.name}
                                </span>
                              ),
                          )}
                        </div>
                      )}
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
                        title={item.is_hidden ? "Mostrar noticia" : "Ocultar noticia"}
                      >
                        {item.is_hidden ? <EyeOff size={18} /> : <Eye size={18} />}
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
                        title={isExpanded ? "Ocultar detalles" : "Ver detalles"}
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
        </div>
      )}
    </div>
  );
};

export default SoylentiNewsList;
