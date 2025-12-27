"use client";

import Card from "@/components/ui/Card";
import { ExternalLink } from "lucide-react";

interface RumorCardProps {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  description?: string;
  aiProbability?: number | null;
  aiAnalysis?: string | null;
}

export default function RumorCard({
  title,
  link,
  pubDate,
  source,
  description,
  aiProbability,
  aiAnalysis,
}: RumorCardProps) {
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("es-ES", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const getSourceColor = (source: string) => {
    if (source.includes("Fichajes"))
      return "bg-betis-oro text-betis-verde-dark";
    if (source.includes("BetisWeb")) return "bg-betis-verde text-white";
    return "bg-scotland-navy text-white";
  };

  return (
    <Card
      variant="interactive"
      className="hover:border-betis-verde transition-all duration-200"
    >
      <div className="p-6">
        {/* Source Badge & AI Probability */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center space-x-2">
            <span
              className={`px-3 py-1 rounded-full text-xs font-bold ${getSourceColor(source)}`}
            >
              {source}
            </span>
            {aiProbability !== null && aiProbability !== undefined && (
              <span
                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  aiProbability >= 70
                    ? "bg-betis-verde text-white"
                    : aiProbability >= 40
                    ? "bg-betis-oro text-betis-verde-dark"
                    : "bg-gray-200 text-gray-700"
                }`}
                title={aiAnalysis || undefined}
              >
                {aiProbability}% credibilidad
              </span>
            )}
          </div>
          <span className="text-sm text-gray-500">{formatDate(pubDate)}</span>
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold text-gray-900 mb-3 line-clamp-2">
          {title}
        </h3>

        {/* Description (if available) */}
        {description && (
          <p className="text-sm text-gray-600 mb-4 line-clamp-3">
            {description}
          </p>
        )}

        {/* Link */}
        <a
          href={link}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center space-x-2 text-betis-verde hover:text-betis-verde-dark font-medium transition-colors"
        >
          <span>Leer más</span>
          <ExternalLink size={16} />
        </a>
      </div>
    </Card>
  );
}
