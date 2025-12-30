"use client";

import React, { useState } from "react";
import { BetisNews } from "@/lib/supabase";
import Card, { CardBody } from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import MessageComponent from "@/components/MessageComponent";
import LoadingSpinner from "@/components/LoadingSpinner";
import { REASSESSMENT_CONTEXT_OPTIONS } from "@/lib/schemas/soylenti";
import {
  RefreshCw,
  ExternalLink,
  AlertCircle,
  CheckCircle,
  ChevronDown,
  ChevronUp,
} from "lucide-react";
import clsx from "clsx";

interface SoylentiNewsListProps {
  news: BetisNews[];
  onReassess: (
    newsId: number,
    adminContext: string,
  ) => Promise<{ success: boolean; error?: string }>;
  isLoading: boolean;
  error: string | null;
}

interface ReassessmentState {
  newsId: number | null;
  contextType: string;
  customContext: string;
  isSubmitting: boolean;
}

const SoylentiNewsList: React.FC<SoylentiNewsListProps> = ({
  news,
  onReassess,
  isLoading,
  error,
}) => {
  const [reassessmentState, setReassessmentState] = useState<ReassessmentState>(
    {
      newsId: null,
      contextType: "",
      customContext: "",
      isSubmitting: false,
    },
  );
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

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
      contextType: "",
      customContext: "",
      isSubmitting: false,
    });
    setSuccessMessage(null);
  };

  const closeReassessmentModal = () => {
    setReassessmentState({
      newsId: null,
      contextType: "",
      customContext: "",
      isSubmitting: false,
    });
  };

  const handleReassess = async () => {
    if (!reassessmentState.newsId) return;

    const contextOption = REASSESSMENT_CONTEXT_OPTIONS.find(
      (opt) => opt.value === reassessmentState.contextType,
    );

    let adminContext = "";
    if (reassessmentState.contextType === "custom") {
      adminContext = reassessmentState.customContext;
    } else if (contextOption) {
      adminContext = contextOption.label;
    }

    if (!adminContext.trim()) {
      return;
    }

    setReassessmentState((prev) => ({ ...prev, isSubmitting: true }));

    const result = await onReassess(reassessmentState.newsId, adminContext);

    if (result.success) {
      setSuccessMessage("Noticia re-analizada correctamente");
      closeReassessmentModal();
      setTimeout(() => setSuccessMessage(null), 5000);
    } else {
      setReassessmentState((prev) => ({ ...prev, isSubmitting: false }));
    }
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

      {news.length === 0 ? (
        <MessageComponent
          type="info"
          message="No hay noticias para mostrar."
        />
      ) : (
        <div className="space-y-4">
          {news.map((item) => {
            const isExpanded = expandedItems.has(item.id);
            const isReassessing = reassessmentState.newsId === item.id;

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
                      </div>

                      <h3 className="font-semibold text-betis-black truncate">
                        {item.title}
                      </h3>

                      <div className="text-xs text-gray-500 mt-1">
                        {formatDate(item.pub_date)}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 flex-shrink-0">
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
                            Solicitar re-análisis con IA
                          </h4>

                          <div className="space-y-3">
                            <div>
                              <label
                                htmlFor={`context-type-${item.id}`}
                                className="block text-xs font-medium text-gray-700 mb-1"
                              >
                                Tipo de corrección:
                              </label>
                              <select
                                id={`context-type-${item.id}`}
                                value={reassessmentState.contextType}
                                onChange={(e) =>
                                  setReassessmentState((prev) => ({
                                    ...prev,
                                    contextType: e.target.value,
                                  }))
                                }
                                className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-betis-verde"
                              >
                                <option value="">Seleccionar...</option>
                                {REASSESSMENT_CONTEXT_OPTIONS.map((opt) => (
                                  <option key={opt.value} value={opt.value}>
                                    {opt.label}
                                  </option>
                                ))}
                              </select>
                            </div>

                            {reassessmentState.contextType === "custom" && (
                              <div>
                                <label
                                  htmlFor={`custom-context-${item.id}`}
                                  className="block text-xs font-medium text-gray-700 mb-1"
                                >
                                  Especificar contexto:
                                </label>
                                <textarea
                                  id={`custom-context-${item.id}`}
                                  value={reassessmentState.customContext}
                                  onChange={(e) =>
                                    setReassessmentState((prev) => ({
                                      ...prev,
                                      customContext: e.target.value,
                                    }))
                                  }
                                  placeholder="Describe el problema con el análisis..."
                                  rows={3}
                                  maxLength={500}
                                  className="w-full border border-gray-300 rounded-md px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-betis-verde resize-none"
                                />
                                <div className="text-xs text-gray-500 mt-1">
                                  {reassessmentState.customContext.length}/500
                                  caracteres
                                </div>
                              </div>
                            )}

                            <div className="flex gap-2">
                              <Button
                                onClick={handleReassess}
                                variant="primary"
                                size="sm"
                                isLoading={reassessmentState.isSubmitting}
                                disabled={
                                  !reassessmentState.contextType ||
                                  (reassessmentState.contextType === "custom" &&
                                    !reassessmentState.customContext.trim())
                                }
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
