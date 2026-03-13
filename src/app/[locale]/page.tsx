import dynamic from "next/dynamic";
import HeroCommunity from "@/components/hero/HeroCommunity";
import { hasFeature } from "@/lib/features/featureFlags";
import { setRequestLocale } from "next-intl/server";

const BetisEfemerides = dynamic(
  () => import("@/components/widgets/BetisEfemerides"),
  {
    loading: () => (
      <div className="bg-white rounded-2xl shadow-xl p-6 animate-pulse">
        <div className="h-16 bg-betis-verde/20 rounded-xl mb-4"></div>
        <div className="space-y-3">
          <div className="h-4 bg-gray-200 rounded w-24"></div>
          <div className="h-6 bg-gray-200 rounded w-3/4"></div>
          <div className="h-4 bg-gray-200 rounded w-full"></div>
          <div className="h-4 bg-gray-200 rounded w-5/6"></div>
        </div>
      </div>
    ),
  },
);

const UpcomingMatchesWidget = dynamic(
  () => import("@/components/match/UpcomingMatchesWidget"),
  {
    loading: () => (
      <div className="bg-white rounded-lg shadow-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
            <div className="flex items-center justify-center space-x-4">
              <div className="h-6 bg-gray-200 rounded flex-1"></div>
              <div className="h-6 w-12 bg-gray-200 rounded"></div>
              <div className="h-6 bg-gray-200 rounded flex-1"></div>
            </div>
          </div>
        </div>
      </div>
    ),
  },
);

const ClassificationWidget = dynamic(
  () => import("@/components/widgets/ClassificationWidget"),
  {
    loading: () => (
      <div className="bg-white rounded-lg shadow-lg p-6 animate-pulse">
        <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="flex items-center space-x-3">
              <div className="h-4 w-6 bg-gray-200 rounded"></div>
              <div className="h-4 flex-1 bg-gray-200 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    ),
  },
);

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const showPartidos = hasFeature("show-partidos");
  const showClasificacion = hasFeature("show-clasificacion");
  const showRsvp = hasFeature("show-rsvp");
  const showEfemerides = hasFeature("show-efemerides");

  return (
    <>
      <HeroCommunity showPartidos={showPartidos} showRsvp={showRsvp} />

      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-canvas-warm" />
        <div className="absolute inset-0 pattern-tartan-subtle opacity-40" />
        <div className="absolute left-0 top-0 bottom-0 w-4 pattern-verdiblanco-whisper" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              {showPartidos && <UpcomingMatchesWidget className="" />}
            </div>
            <div className="lg:col-span-1">
              {showClasificacion && <ClassificationWidget className="" />}
            </div>
          </div>
        </div>
      </section>

      {showEfemerides && (
        <section className="relative py-16 overflow-hidden">
          <div className="absolute inset-0 bg-betis-verde-pale" />
          <div className="absolute inset-0 pattern-verdiblanco-whisper opacity-30" />

          <div className="relative max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
            <BetisEfemerides />
          </div>
        </section>
      )}

      <section className="relative py-24 overflow-hidden">
        <div className="absolute inset-0 bg-hero-fusion" />
        <div className="absolute inset-0 pattern-tartan-navy opacity-25" />
        <div className="absolute left-0 top-0 bottom-0 w-8 pattern-verdiblanco-subtle opacity-30" />
        <div className="absolute right-0 top-0 bottom-0 w-8 pattern-verdiblanco-subtle opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl bg-oro-glow opacity-40 pointer-events-none" />
        <div className="absolute inset-0 bg-black/15" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
            <span className="text-white font-heading font-medium text-sm tracking-wide">
              🏴󠁧󠁢󠁳󠁣󠁴󠁿
            </span>
          </div>
        </div>
      </section>
    </>
  );
}
