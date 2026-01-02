import { Metadata } from "next";
import { Suspense } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Spinner from "@/components/ui/Spinner";
import { withFeatureFlag } from "@/lib/featureProtection";
import { Newspaper, AlertCircle } from "lucide-react";
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
            <Newspaper className="h-5 w-5 text-white" />
            <span className="text-white font-heading font-medium text-sm tracking-wide">
              Rumores de Fichajes
            </span>
          </div>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-black mb-6 text-white text-shadow-xl uppercase tracking-tight">
            Soylenti
          </h1>

          <p className="font-accent text-2xl sm:text-3xl text-oro-bright mb-8 text-shadow-lg italic">
            Las últimas noticias y rumores del Real Betis
          </p>
        </div>
      </section>

      {/* Rumors Grid - Canvas Warm Background */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-canvas-warm" />
        <div className="absolute inset-0 pattern-tartan-subtle opacity-40" />
        <div className="absolute left-0 top-0 bottom-0 w-4 pattern-verdiblanco-whisper" />

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

      {/* Disclaimer - Cultural Fusion Style */}
      <section className="relative py-12 overflow-hidden">
        <div className="absolute inset-0 bg-betis-verde-light" />
        <div className="absolute inset-0 pattern-tartan-subtle opacity-20" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-start gap-4 bg-white/60 backdrop-blur-sm rounded-xl p-6 border border-betis-verde/10">
            <AlertCircle className="h-5 w-5 text-betis-verde-dark flex-shrink-0 mt-0.5" />
            <p className="font-body text-sm text-betis-verde-dark leading-relaxed">
              Los rumores mostrados provienen de fuentes externas y no
              representan información oficial del Real Betis. Esta sección es
              solo para entretenimiento de la comunidad bética.
            </p>
          </div>
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
          <div className="min-h-screen">
            {/* Hero Section Skeleton */}
            <section className="relative py-20 overflow-hidden">
              <div className="absolute inset-0 bg-hero-fusion" />
              <div className="absolute inset-0 pattern-tartan-navy opacity-25" />
              <div className="absolute left-0 top-0 bottom-0 w-8 pattern-verdiblanco-subtle opacity-30" />
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl bg-oro-glow opacity-40 pointer-events-none" />

              <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
                  <Newspaper className="h-5 w-5 text-white" />
                  <span className="text-white font-heading font-medium text-sm tracking-wide">
                    Rumores de Fichajes
                  </span>
                </div>

                <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-black mb-6 text-white text-shadow-xl uppercase tracking-tight">
                  Soylenti
                </h1>

                <p className="font-accent text-2xl sm:text-3xl text-oro-bright mb-8 text-shadow-lg italic">
                  Las últimas noticias y rumores del Real Betis
                </p>
              </div>
            </section>

            {/* Loading Content */}
            <section className="relative py-16 overflow-hidden">
              <div className="absolute inset-0 bg-canvas-warm" />
              <div className="absolute inset-0 pattern-tartan-subtle opacity-40" />

              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                  <Spinner size="lg" />
                  <p className="mt-4 font-body text-betis-verde-dark">
                    Cargando rumores...
                  </p>
                </div>
              </div>
            </section>
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
