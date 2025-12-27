import { Metadata } from "next";
import { Suspense } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Spinner from "@/components/ui/Spinner";
import RumorCard from "@/components/RumorCard";
import { withFeatureFlag } from "@/lib/featureProtection";
import { Newspaper, RefreshCw } from "lucide-react";

export const metadata: Metadata = {
  title: "Soylenti - Rumores de Fichajes | Peña Bética Escocesa",
  description:
    "Últimos rumores de fichajes y noticias del Real Betis desde múltiples fuentes.",
};

// Fetch rumors from database (Phase 2: persisted with AI analysis)
async function fetchRumors() {
  const { supabase } = await import("@/lib/supabase");

  const { data, error } = await supabase
    .from("betis_news")
    .select("*")
    .eq("is_duplicate", false)
    .order("pub_date", { ascending: false })
    .limit(50);

  if (error) {
    throw new Error("Error al cargar rumores");
  }

  return {
    data: {
      rumors:
        data?.map((rumor) => ({
          title: rumor.title,
          link: rumor.link,
          pubDate: rumor.pub_date,
          source: rumor.source,
          description: rumor.description,
          aiProbability: rumor.ai_probability,
          aiAnalysis: rumor.ai_analysis,
        })) || [],
      totalCount: data?.length || 0,
      lastUpdated: data?.[0]?.created_at || new Date().toISOString(),
    },
  };
}

// Content component with data fetching
async function SoylentiContent() {
  const response = await fetchRumors();
  const data = response.data || {};
  const rumors = data.rumors || [];

  return (
    <div className="min-h-screen bg-gradient-to-b from-betis-verde-pale to-white">
      {/* Hero Section */}
      <section className="bg-betis-verde text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="flex items-center justify-center mb-4">
            <Newspaper size={48} />
          </div>
          <h1 className="text-4xl font-bold mb-2">
            Soylenti - Rumores de Fichajes
          </h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Las últimas noticias y rumores del Real Betis desde múltiples
            fuentes
          </p>
        </div>
      </section>

      {/* Rumors Grid */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Info Bar */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-8 flex flex-col sm:flex-row justify-between items-center">
            <div className="flex items-center space-x-2 mb-4 sm:mb-0">
              <RefreshCw size={20} className="text-betis-verde" />
              <p className="text-sm text-gray-600">
                {rumors.length} rumores analizados con IA
              </p>
            </div>
            <p className="text-xs text-gray-500">
              Última actualización:{" "}
              {new Intl.DateTimeFormat("es-ES", {
                day: "2-digit",
                month: "2-digit",
                year: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              }).format(new Date(data.lastUpdated))}
            </p>
          </div>

          {/* Rumors Grid */}
          {rumors.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {rumors.map((rumor: any, index: number) => (
                <RumorCard
                  key={`${rumor.link}-${index}`}
                  title={rumor.title}
                  link={rumor.link}
                  pubDate={rumor.pubDate}
                  source={rumor.source}
                  description={rumor.description}
                  aiProbability={rumor.aiProbability}
                  aiAnalysis={rumor.aiAnalysis}
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
        </div>
      </section>

      {/* Disclaimer */}
      <section className="bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-sm text-gray-600">
            Los rumores mostrados provienen de fuentes externas y no representan
            información oficial del Real Betis. Esta sección es solo para
            entretenimiento de la comunidad bética.
          </p>
        </div>
      </section>
    </div>
  );
}

// Main page with error boundary and loading
async function SoylentiPage() {
  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <div className="min-h-screen bg-gradient-to-b from-betis-verde-pale to-white flex items-center justify-center">
            <div className="text-center">
              <Spinner size="lg" />
              <p className="mt-4 text-gray-600">Cargando rumores...</p>
            </div>
          </div>
        }
      >
        <SoylentiContent />
      </Suspense>
    </ErrorBoundary>
  );
}

// Export protected component
export default withFeatureFlag(SoylentiPage, "show-soylenti");
