import Link from "next/link";
import { Heart, Users, Calendar } from "lucide-react";
import { FeatureWrapper } from "@/lib/featureProtection";

export default function Nosotros() {
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
            <span className="text-white font-heading font-medium text-sm tracking-wide">
              💚 Nuestra Historia
            </span>
          </div>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-black mb-6 text-white text-shadow-xl uppercase tracking-tight">
            Nosotros
          </h1>

          <p className="font-accent text-2xl sm:text-3xl text-oro-bright mb-8 text-shadow-lg italic">
            Más que una peña, somos familia
          </p>
        </div>
      </section>

      {/* Main Content - 3 Core Cards */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-canvas-warm" />
        <div className="absolute inset-0 pattern-tartan-subtle opacity-40" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Nuestros Orígenes */}
            <div className="group bg-white rounded-2xl p-8 shadow-xl border border-gray-100 hover:border-betis-verde transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-1 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 pattern-verdiblanco-diagonal-subtle opacity-20" />
              <div className="relative">
                <div className="w-16 h-16 bg-betis-verde rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Heart className="h-8 w-8 text-white" />
                </div>
                <h2 className="font-display text-2xl font-black text-scotland-navy mb-4 uppercase tracking-tight">
                  Nuestros Orígenes
                </h2>
                <div className="space-y-4 font-body text-gray-700">
                  <p className="text-sm">
                    <strong className="text-betis-verde-dark">
                      4 de diciembre de 2010
                    </strong>{" "}
                    - Juan Morata y José María Conde se encuentran casualmente
                    jugando fútbol en Edimburgo. Ambos llevaban la camiseta del
                    Betis.
                  </p>
                  <p className="text-sm">
                    Esa coincidencia fue el inicio de una gran amistad bética y
                    la primera peña oficial del Real Betis en Reino Unido.
                  </p>
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-sm italic text-betis-verde-dark">
                      "La idea vino tomando algo en un pub. Simplemente lo
                      decidieron así."
                    </p>
                    <p className="text-xs text-gray-600 mt-2">
                      — LaLiga oficial
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 2: Nuestra Familia */}
            <div className="group bg-white rounded-2xl p-8 shadow-xl border border-gray-100 hover:border-betis-verde transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-1 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 pattern-tartan-subtle opacity-30" />
              <div className="relative">
                <div className="w-16 h-16 bg-betis-verde rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h2 className="font-display text-2xl font-black text-scotland-navy mb-4 uppercase tracking-tight">
                  Nuestra Familia
                </h2>
                <div className="space-y-4 font-body text-gray-700">
                  <p className="text-sm">
                    Desde 2010, hemos acogido a béticos de toda España que viven
                    en Escocia, estudiantes de intercambio, turistas de paso...{" "}
                    <strong className="text-betis-verde-dark">
                      todos son bienvenidos
                    </strong>
                    .
                  </p>
                  <p className="text-sm">
                    Hemos celebrado ascensos, títulos y momentos únicos juntos.
                    También hemos llorado derrotas y nos hemos consolado con la
                    certeza de que "el año que viene será el nuestro".
                  </p>
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-sm font-semibold text-betis-verde-dark">
                      Reconocidos por LaLiga como "bastión" del betismo en
                      Escocia
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Card 3: Nuestro Legado */}
            <div className="group bg-white rounded-2xl p-8 shadow-xl border border-gray-100 hover:border-betis-oro transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-1 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 pattern-verdiblanco-diagonal-subtle opacity-20" />
              <div className="relative">
                <div className="w-16 h-16 bg-betis-oro rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="h-8 w-8 text-white" />
                </div>
                <h2 className="font-display text-2xl font-black text-scotland-navy mb-4 uppercase tracking-tight">
                  Nuestro Legado
                </h2>
                <div className="space-y-3 font-body text-gray-700">
                  <div className="flex items-start gap-3">
                    <span className="inline-block bg-betis-verde text-white px-2 py-1 rounded-full font-bold text-xs mt-0.5">
                      2010
                    </span>
                    <p className="text-sm flex-1">
                      Primera peña oficial del Betis en Reino Unido
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="inline-block bg-betis-verde text-white px-2 py-1 rounded-full font-bold text-xs mt-0.5">
                      2015
                    </span>
                    <p className="text-sm flex-1">
                      Nuevo hogar en Polwarth Tavern
                    </p>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className="inline-block bg-betis-verde text-white px-2 py-1 rounded-full font-bold text-xs mt-0.5">
                      2018
                    </span>
                    <p className="text-sm flex-1">
                      Reconocimiento oficial de LaLiga
                    </p>
                  </div>
                  <div className="pt-4 border-t border-gray-100">
                    <p className="text-sm italic text-betis-verde-dark">
                      Cada bético que se une añade un capítulo más a nuestra
                      historia
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-hero-fusion" />
        <div className="absolute inset-0 pattern-tartan-navy opacity-25" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl bg-oro-glow opacity-40 pointer-events-none" />
        <div className="absolute inset-0 bg-black/15" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-black mb-6 text-white drop-shadow-xl uppercase tracking-tight">
            ¿Quieres ser parte de nuestra historia?
          </h2>
          <p className="font-body text-xl mb-8 text-white/95 leading-relaxed drop-shadow-lg">
            Tu historia también puede formar parte de la nuestra.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/unete"
              className="inline-flex items-center gap-3 bg-oro-bright hover:bg-oro-antique text-scotland-navy px-10 py-5 rounded-2xl font-display font-black text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-[0_0_30px_rgba(255,215,0,0.4)] uppercase tracking-wide"
            >
              <Heart className="h-6 w-6" />
              Únete a Nosotros
            </Link>
            <FeatureWrapper feature="show-partidos">
              <Link
                href="/partidos"
                className="inline-flex items-center gap-3 bg-white/10 hover:bg-white/20 backdrop-blur-md text-white border-2 border-white/30 px-10 py-5 rounded-2xl font-heading font-bold text-lg transition-all duration-300 transform hover:scale-105 uppercase tracking-wide"
              >
                <Calendar className="h-6 w-6" />
                Ver Partidos
              </Link>
            </FeatureWrapper>
          </div>
        </div>
      </section>
    </div>
  );
}
