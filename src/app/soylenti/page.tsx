import { Metadata } from "next";
import { Suspense } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Spinner from "@/components/ui/Spinner";
import { withFeatureFlag } from "@/lib/featureProtection";
import { Newspaper } from "lucide-react";
import { fetchTrendingPlayersWithTimeline } from "@/lib/data/players";
import SoylentiClient from "./SoylentiClient";

export const metadata: Metadata = {
  title: "Soylenti - Rumores de Fichajes | Peña Bética Escocesa",
  description:
    "Últimos rumores de fichajes y noticias del Real Betis desde múltiples fuentes.",
};

const INITIAL_LIMIT = 50;

// Fetch rumors from database (Phase 2: persisted with AI analysis)
async function fetchRumors() {
  const { supabase } = await import("@/lib/supabase");

  const [rumorsResult, countResult] = await Promise.all([
    supabase
      .from("betis_news")
      .select(
        `
        *,
        news_players (
          players (
            name,
            normalized_name
          )
        )
      `,
      )
      .eq("is_duplicate", false)
      .eq("is_hidden", false)
      .gt("ai_probability", 0)
      .order("pub_date", { ascending: false })
      .limit(INITIAL_LIMIT + 1),
    supabase
      .from("betis_news")
      .select("*", { count: "exact", head: true })
      .eq("is_duplicate", false)
      .eq("is_hidden", false)
      .gt("ai_probability", 0),
  ]);

  if (rumorsResult.error || countResult.error) {
    throw new Error("Error al cargar rumores");
  }

  const hasMore = (rumorsResult.data?.length || 0) > INITIAL_LIMIT;
  const items = hasMore
    ? rumorsResult.data?.slice(0, INITIAL_LIMIT)
    : rumorsResult.data;

  return {
    data: {
      rumors:
        items?.map((rumor) => ({
          title: rumor.title,
          link: rumor.link,
          pubDate: rumor.pub_date,
          source: rumor.source,
          description: rumor.description,
          aiProbability: rumor.ai_probability,
          aiAnalysis: rumor.ai_analysis,
          players:
            rumor.news_players?.map(
              (np: {
                role: string;
                players: { name: string; normalized_name: string };
              }) => ({
                name: np.players?.name || "",
                normalizedName: np.players?.normalized_name || "",
                role: np.role as "target" | "departing" | "mentioned",
              }),
            ) || [],
        })) || [],
      totalCount: countResult.count || 0,
      lastUpdated: items?.[0]?.created_at || new Date().toISOString(),
      hasMore,
    },
  };
}

// Content component with data fetching
async function SoylentiContent() {
  const [response, trendingPlayers] = await Promise.all([
    fetchRumors(),
    fetchTrendingPlayersWithTimeline(),
  ]);
  const data = response.data || {};
  const rumors = data.rumors || [];

  return (
    <div className="min-h-screen">
      {/* Hero Section - Cultural Fusion Design */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-hero-fusion" />
        <div className="absolute inset-0 pattern-tartan-navy opacity-25" />
        <div className="absolute left-0 top-0 bottom-0 w-8 pattern-verdiblanco-subtle opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl bg-oro-glow opacity-40 pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
            <Newspaper size={20} className="text-oro-bright" />
            <span className="text-white font-heading font-medium text-sm tracking-wide">
              Análisis con IA
            </span>
          </div>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-black mb-6 text-white text-shadow-xl uppercase tracking-tight">
            Soylenti
          </h1>

          <p className="font-accent text-2xl sm:text-3xl text-oro-bright mb-6 text-shadow-lg italic">
            Rumores de fichajes del Real Betis
          </p>

          <p className="font-body text-lg text-white/90 max-w-2xl mx-auto leading-relaxed">
            Rumores analizados con inteligencia artificial desde múltiples
            fuentes. Cada rumor incluye un análisis de credibilidad para ayudarte
            a separar la realidad de la especulación.
          </p>
        </div>
      </section>

      {/* Rumors Grid */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-canvas-warm" />
        <div className="absolute inset-0 pattern-tartan-subtle opacity-40" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <SoylentiClient
            initialRumors={rumors}
            lastUpdated={data.lastUpdated}
            initialHasMore={data.hasMore}
            totalCount={data.totalCount}
            trendingPlayers={trendingPlayers}
          />
        </div>
      </section>

      {/* Disclaimer */}
      <section className="relative py-12 overflow-hidden">
        <div className="absolute inset-0 bg-betis-verde-light" />
        <div className="absolute inset-0 pattern-verdiblanco-subtle opacity-30" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="font-body text-sm text-betis-verde-dark leading-relaxed">
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
