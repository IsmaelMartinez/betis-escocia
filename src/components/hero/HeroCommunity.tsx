"use client";

import Link from "next/link";
import { Heart, Coffee, Smile, Calendar } from "lucide-react";
import dynamic from "next/dynamic";
import { memo } from "react";

// Lazy load CommunityStats - not critical for initial render
const CommunityStats = dynamic(() => import("../widgets/CommunityStats"), {
  loading: () => (
    <div className="bg-gray-50 rounded-lg p-6 text-center border border-gray-200 animate-pulse">
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <div className="h-8 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
        <div>
          <div className="h-8 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
        <div>
          <div className="h-8 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
      <div className="h-4 bg-gray-200 rounded"></div>
    </div>
  ),
});

interface HeroCommunityProps {
  readonly showPartidos: boolean;
}

function HeroCommunity({ showPartidos }: HeroCommunityProps) {
  return (
    <section className="relative min-h-screen overflow-hidden">
      {/* ============================================
       * LAYERED BACKGROUND - Design System v2
       * Edinburgh mist + tartan texture + verdiblanco edges
       * ============================================ */}
      <div className="absolute inset-0">
        {/* Layer 1: Edinburgh mist gradient */}
        <div className="absolute inset-0 bg-edinburgh-mist" />

        {/* Layer 2: Subtle tartan texture */}
        <div className="absolute inset-0 pattern-tartan-subtle" />

        {/* Layer 3: Verdiblanco whisper on edges */}
        <div className="absolute left-0 top-0 bottom-0 w-8 md:w-16 pattern-verdiblanco-subtle opacity-50" />
        <div className="absolute right-0 top-0 bottom-0 w-8 md:w-16 pattern-verdiblanco-subtle opacity-50" />

        {/* Layer 4: Gold accent glow */}
        <div className="absolute top-1/4 right-1/4 w-64 md:w-96 h-64 md:h-96 rounded-full blur-3xl bg-oro-glow pointer-events-none" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 md:py-20">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* ============================================
           * LEFT SIDE - Main Message
           * Uses new typography system
           * ============================================ */}
          <div className="animate-fade-in-up">
            {/* Tagline badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-betis-verde-light border border-betis-verde/20 mb-6">
              <span className="text-sm font-medium text-betis-verde-dark">
                🏴󠁧󠁢󠁳󠁣󠁴󠁿 Desde Sevilla a Edimburgo
              </span>
            </div>

            {/* Main headline - using display font */}
            <h1 className="mb-6 lg:mb-8 leading-none">
              <span className="block font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-scotland-navy tracking-tight">
                MÁS QUE
              </span>
              <span className="block font-display text-5xl sm:text-6xl md:text-7xl lg:text-8xl font-black text-betis-verde tracking-tight">
                UNA PEÑA
              </span>
              <span className="block font-accent text-2xl sm:text-3xl md:text-4xl text-oro-antique mt-4 italic">
                Una Familia
              </span>
            </h1>

            {/* Description card with verdiblanco edge */}
            <div className="relative bg-canvas-warm rounded-xl p-6 lg:p-8 mb-8 shadow-lg border border-gray-100 pattern-verdiblanco-edge-left">
              <p className="font-body text-lg lg:text-xl leading-relaxed text-gray-700 mb-4">
                <strong className="text-betis-verde font-heading">
                  Más de 15 años
                </strong>{" "}
                compartiendo la pasión por el Betis desde Edimburgo. Aquí
                encontrarás{" "}
                <strong className="text-betis-verde font-heading">
                  amigos de verdad
                </strong>
                , momentos únicos y el cariño de una comunidad que te acoge como
                en casa.
              </p>
              <p className="font-body text-base lg:text-lg text-gray-600">
                Ya seas de Sevilla, de cualquier parte de España, o incluso
                escocés... si llevas el Betis en el corazón,{" "}
                <strong className="text-betis-verde">
                  ya eres de los nuestros
                </strong>
                .
              </p>
            </div>

            {/* Feature cards with cultural pattern */}
            <h2 className="sr-only">Características de la peña</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 mb-8">
              <div className="group pattern-card-cultural rounded-xl p-6 border border-gray-100 hover:border-betis-verde hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <Coffee className="h-8 w-8 text-betis-verde mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="font-heading font-bold text-scotland-navy mb-2 text-lg uppercase tracking-wide">
                  Ambiente Familiar
                </h3>
                <p className="font-body text-sm text-gray-600">
                  Niños bienvenidos, ambiente relajado y acogedor
                </p>
              </div>
              <div className="group pattern-card-cultural rounded-xl p-6 border border-gray-100 hover:border-betis-verde hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1">
                <Smile className="h-8 w-8 text-betis-verde mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="font-heading font-bold text-scotland-navy mb-2 text-lg uppercase tracking-wide">
                  Siempre con Humor
                </h3>
                <p className="font-body text-sm text-gray-600">
                  Ganemos o perdamos, aquí se ríe y se disfruta
                </p>
              </div>
            </div>

            {/* CTA buttons - centered 2-column grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto">
              <Link
                href="/unete"
                className="group bg-betis-verde-dark hover:bg-betis-verde text-white px-8 py-4 rounded-xl font-heading font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl shadow-betis flex items-center justify-center"
              >
                <Heart className="mr-3 h-5 w-5 group-hover:animate-pulse" />
                ÚNETE A LA FAMILIA
              </Link>
              {showPartidos && (
                <Link
                  href="/partidos"
                  className="group bg-white hover:bg-betis-verde-pale text-betis-verde-dark border-2 border-betis-verde-dark px-8 py-4 rounded-xl font-heading font-bold text-lg transition-all duration-300 flex items-center justify-center"
                >
                  <Calendar className="mr-3 h-5 w-5" />
                  VER PARTIDOS
                </Link>
              )}
            </div>
          </div>

          {/* ============================================
           * RIGHT SIDE - Community Showcase
           * Card with cultural styling
           * ============================================ */}
          <div
            className="relative animate-fade-in-up"
            style={{ animationDelay: "0.2s" }}
          >
            {/* Main community card */}
            <div className="bg-white rounded-2xl p-8 shadow-xl border border-gray-100 relative overflow-hidden">
              {/* Decorative corner pattern */}
              <div className="absolute top-0 right-0 w-24 h-24 pattern-verdiblanco-diagonal opacity-10" />

              {/* Stats section */}
              <div className="mb-8 relative">
                <CommunityStats />
              </div>
            </div>

            {/* Floating accent elements */}
            <div className="absolute -top-4 -right-4 bg-white rounded-full p-4 shadow-lg">
              <Heart className="h-6 w-6 text-betis-verde" />
            </div>
            <div className="absolute -bottom-3 -left-3 bg-white rounded-full p-3 shadow-lg">
              <span className="text-2xl leading-none">🏴󠁧󠁢󠁳󠁣󠁴󠁿</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default memo(HeroCommunity);
