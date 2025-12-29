import { Metadata } from "next";
import { Suspense } from "react";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import Spinner from "@/components/ui/Spinner";
import { withFeatureFlag } from "@/lib/featureProtection";
import { Newspaper } from "lucide-react";
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
          role,
          players (
            name,
            normalized_name
          )
        )
      `,
      )
      .eq("is_duplicate", false)
      .order("pub_date", { ascending: false })
      .limit(INITIAL_LIMIT + 1),
    supabase
      .from("betis_news")
      .select("*", { count: "exact", head: true })
      .eq("is_duplicate", false),
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
          transferDirection: rumor.transfer_direction,
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

// Fetch trending players (Phase 2B)
async function fetchTrendingPlayers() {
  const { supabase } = await import("@/lib/supabase");

  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

  const { data, error } = await supabase
    .from("players")
    .select("name, normalized_name, rumor_count, first_seen_at, last_seen_at")
    .gte("rumor_count", 2)
    .order("last_seen_at", { ascending: false })
    .order("rumor_count", { ascending: false })
    .limit(10);

  if (error) {
    console.error("Error fetching trending players:", error);
    return [];
  }

  return (data || []).map((player) => ({
    name: player.name,
    normalizedName: player.normalized_name,
    rumorCount: player.rumor_count,
    firstSeen: player.first_seen_at,
    lastSeen: player.last_seen_at,
    isActive: new Date(player.last_seen_at) > sevenDaysAgo,
  }));
}

// Content component with data fetching
async function SoylentiContent() {
  const [response, trendingPlayers] = await Promise.all([
    fetchRumors(),
    fetchTrendingPlayers(),
  ]);
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
