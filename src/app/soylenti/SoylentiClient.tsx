"use client";

import { useState } from "react";
import RumorCard from "@/components/RumorCard";
import { RefreshCw } from "lucide-react";

interface Rumor {
  title: string;
  link: string;
  pubDate: string;
  source: string;
  description?: string;
  aiProbability?: number | null;
  aiAnalysis?: string | null;
}

interface SoylentiClientProps {
  initialRumors: Rumor[];
  lastUpdated: string;
}

export default function SoylentiClient({
  initialRumors,
  lastUpdated,
}: SoylentiClientProps) {
  const [showAllNews, setShowAllNews] = useState(false);
  const [franMode, setFranMode] = useState(true);

  const displayedRumors = initialRumors.filter((rumor) => {
    // Always show transfer rumors (aiProbability > 0)
    const prob = rumor.aiProbability;
    if (prob !== null && prob !== undefined && prob > 0) return true;

    // Show news and unanalyzed only if toggle is ON
    return showAllNews;
  });

  const rumorCount = initialRumors.filter((r) => {
    const prob = r.aiProbability;
    return prob !== null && prob !== undefined && prob > 0;
  }).length;

  return (
    <>
      {/* Info Bar */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-8">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="flex items-center space-x-2">
            <RefreshCw size={20} className="text-betis-verde" />
            <p className="text-sm text-gray-600">
              {displayedRumors.length} de {initialRumors.length} noticias
              {rumorCount > 0 && ` (${rumorCount} rumores)`}
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            {/* Fran Mode Toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={franMode}
                onChange={(e) => setFranMode(e.target.checked)}
                className="w-4 h-4 rounded border-betis-verde text-betis-verde focus:ring-betis-verde"
              />
              <span className="text-sm text-betis-verde-dark font-medium">
                Fran Mode
              </span>
            </label>

            {/* Show News Toggle */}
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={showAllNews}
                onChange={(e) => setShowAllNews(e.target.checked)}
                className="w-4 h-4 rounded border-betis-verde text-betis-verde focus:ring-betis-verde"
              />
              <span className="text-sm text-betis-verde-dark">
                Mostrar noticias
              </span>
            </label>
          </div>
        </div>

        <p className="text-xs text-gray-500 mt-2 sm:mt-0">
          Última actualización:{" "}
          {new Intl.DateTimeFormat("es-ES", {
            day: "2-digit",
            month: "2-digit",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
          }).format(new Date(lastUpdated))}
        </p>
      </div>

      {/* Rumors Grid */}
      {displayedRumors.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {displayedRumors.map((rumor, index) => (
            <RumorCard
              key={`${rumor.link}-${index}`}
              title={rumor.title}
              link={rumor.link}
              pubDate={rumor.pubDate}
              source={rumor.source}
              description={rumor.description}
              aiProbability={rumor.aiProbability}
              aiAnalysis={rumor.aiAnalysis}
              showCredibility={franMode}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-16">
          <p className="text-gray-600 text-lg">
            No hay rumores disponibles en este momento
          </p>
        </div>
      )}
    </>
  );
}
