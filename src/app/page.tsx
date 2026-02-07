import Link from "next/link";
import dynamic from "next/dynamic";
import HeroCommunity from "@/components/hero/HeroCommunity";
import { hasFeature } from "@/lib/featureFlags";

// Lazy load widgets that are below the fold for better LCP
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

export default function Home() {
  // Get feature flags on server to pass to client components
  const showPartidos = hasFeature("show-partidos");
  const showClasificacion = hasFeature("show-clasificacion");
  const showRsvp = hasFeature("show-rsvp");

  return (
    <>
      <HeroCommunity showPartidos={showPartidos} showRsvp={showRsvp} />

      {/* Upcoming Matches and Classification Widgets */}
      {/* El Tercio Nuevo: Warm canvas + subtle tartan texture */}
      <section className="relative py-20 overflow-hidden">
        {/* Background layers */}
        <div className="absolute inset-0 bg-canvas-warm" />
        <div className="absolute inset-0 pattern-tartan-subtle opacity-40" />
        <div className="absolute left-0 top-0 bottom-0 w-4 pattern-verdiblanco-whisper" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Upcoming Matches */}
            <div className="lg:col-span-3">
              {showPartidos && (
                <>
                  {/* Section header with display typography */}
                  <div className="mb-8 text-center lg:text-left">
                    <h2 className="font-display text-4xl sm:text-5xl lg:text-6xl font-black text-scotland-navy mb-3 uppercase tracking-tight">
                      Próximos Partidos
                    </h2>
                    <div className="h-1 w-32 bg-gradient-to-r from-betis-verde via-betis-oro to-scotland-navy mx-auto lg:mx-0 rounded-full" />
                  </div>
                  <UpcomingMatchesWidget className="" />
                </>
              )}
            </div>

            {/* Classification */}
            <div className="lg:col-span-1">
              {showClasificacion && <ClassificationWidget className="" />}
            </div>
          </div>
        </div>
      </section>

      {/* Join Us CTA - El Tercio Nuevo: Layered cultural fusion */}
      <section className="relative py-24 overflow-hidden">
        {/* Multi-layer background - Cultural fusion */}
        <div className="absolute inset-0 bg-hero-fusion" />
        <div className="absolute inset-0 pattern-tartan-navy opacity-25" />
        <div className="absolute left-0 top-0 bottom-0 w-8 pattern-verdiblanco-subtle opacity-30" />
        <div className="absolute right-0 top-0 bottom-0 w-8 pattern-verdiblanco-subtle opacity-30" />

        {/* Gold accent glow */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl bg-oro-glow opacity-40 pointer-events-none" />

        {/* Text readability overlay */}
        <div className="absolute inset-0 bg-black/15" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
            <span className="text-white font-heading font-medium text-sm tracking-wide">
              🏴󠁧󠁢󠁳󠁣󠁴󠁿 Bienvenidos a Escocia
            </span>
          </div>

          {/* Display typography - massive impact */}
          <h2 className="font-display text-4xl sm:text-5xl lg:text-7xl font-black mb-6 text-white text-shadow-xl uppercase tracking-tight leading-none">
            ¿Estás de visita
            <br />
            en Escocia?
          </h2>

          <p className="font-accent text-2xl sm:text-3xl lg:text-4xl mb-6 text-oro-bright text-shadow-lg italic">
            ¡Ven a ver los partidos con nosotros!
          </p>

          <p className="font-body text-lg sm:text-xl lg:text-2xl mb-12 max-w-3xl mx-auto text-white/95 leading-relaxed text-shadow-lg">
            Todos los béticos son bienvenidos. No importa de dónde vengas, aquí
            tienes una familia que comparte tu pasión por el Betis.
          </p>

          {/* CTA Buttons - enhanced with new styling */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-20">
            <Link
              href="/unete"
              className="group bg-oro-bright hover:bg-oro-antique text-scotland-navy px-12 py-6 rounded-2xl font-display font-black text-xl shadow-2xl transition-all duration-300 transform hover:scale-105 hover:shadow-[0_0_30px_rgba(255,215,0,0.4)] uppercase tracking-wide"
            >
              <span className="flex items-center gap-3">
                💬 Únete a la Familia
              </span>
            </Link>

            <a
              href="https://www.facebook.com/groups/beticosenescocia/"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white/10 backdrop-blur-md border-2 border-white/30 hover:bg-white hover:border-white px-10 py-5 rounded-2xl font-heading font-bold text-lg text-white hover:text-betis-verde transition-all duration-300 transform hover:scale-105"
            >
              <span className="flex items-center gap-2">📘 Facebook</span>
            </a>
          </div>

          {/* Contact info cards - with cultural patterns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Location Card */}
            <div className="group relative bg-white/10 backdrop-blur-md rounded-2xl p-7 border border-white/20 hover:bg-white/20 hover:border-oro-bright transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 pattern-verdiblanco-diagonal-subtle opacity-20" />
              <h3 className="font-heading text-xl font-bold mb-4 text-oro-bright uppercase tracking-wide flex items-center gap-2">
                📍 Ubicación
              </h3>
              <p className="font-body text-base text-white/90 leading-relaxed">
                Polwarth Tavern
                <br />
                Edinburgh EH11 1HR
              </p>
            </div>

            {/* Schedule Card */}
            <div className="group relative bg-white/10 backdrop-blur-md rounded-2xl p-7 border border-white/20 hover:bg-white/20 hover:border-oro-bright transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 pattern-tartan-subtle opacity-30" />
              <h3 className="font-heading text-xl font-bold mb-4 text-oro-bright uppercase tracking-wide flex items-center gap-2">
                ⏰ Horarios
              </h3>
              <p className="font-body text-base text-white/90 leading-relaxed">
                15 min antes del partido
                <br />
                Todos los eventos
                <br />
                Fútbol · Reuniones · Celebraciones
              </p>
            </div>

            {/* Atmosphere Card */}
            <div className="group relative bg-white/10 backdrop-blur-md rounded-2xl p-7 border border-white/20 hover:bg-white/20 hover:border-oro-bright transition-all duration-300 overflow-hidden">
              <div className="absolute top-0 right-0 w-16 h-16 pattern-verdiblanco-diagonal-subtle opacity-20" />
              <h3 className="font-heading text-xl font-bold mb-4 text-oro-bright uppercase tracking-wide flex items-center gap-2">
                💚 Ambiente
              </h3>
              <p className="font-body text-base text-white/90 leading-relaxed">
                100% bético
                <br />
                Familiar y acogedor
                <br />
                Cervezas frías garantizadas
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
