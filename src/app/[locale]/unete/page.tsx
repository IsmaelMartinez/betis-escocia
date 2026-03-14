import Link from "next/link";
import { MapPin, Clock, Users } from "lucide-react";
import { FeatureWrapper } from "@/lib/features/featureProtection";

export default function Unete() {
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
              💚 Bienvenido a la familia
            </span>
          </div>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-black mb-6 text-white text-shadow-xl uppercase tracking-tight">
            Únete
          </h1>

          <p className="font-accent text-2xl sm:text-3xl text-oro-bright mb-8 text-shadow-lg italic">
            Tres cosas que necesitas saber
          </p>
        </div>
      </section>

      {/* Main Content - 3 Simple Cards */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-canvas-warm" />
        <div className="absolute inset-0 pattern-tartan-subtle opacity-40" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Card 1: Show Up */}
            <div className="group bg-white rounded-2xl p-8 shadow-xl border border-gray-100 hover:border-betis-verde transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-1 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 pattern-verdiblanco-diagonal-subtle opacity-20" />
              <div className="relative">
                <div className="w-16 h-16 bg-betis-verde rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <MapPin className="h-8 w-8 text-white" />
                </div>
                <h2 className="font-display text-2xl font-black text-scotland-navy mb-4 uppercase tracking-tight">
                  1. Aparece
                </h2>
                <div className="space-y-3 font-body text-gray-700">
                  <p className="font-bold text-betis-verde-dark">
                    Polwarth Tavern
                  </p>
                  <p className="text-sm">
                    35 Polwarth Crescent
                    <br />
                    Edinburgh EH11 1HR
                  </p>
                  <div className="pt-4 border-t border-gray-100">
                    <div className="flex items-start gap-2 text-sm">
                      <Clock className="h-4 w-4 text-betis-verde mt-0.5 flex-shrink-0" />
                      <span>15 minutos antes del partido</span>
                    </div>
                  </div>
                </div>
                <a
                  href="https://maps.google.com/maps?q=Polwarth+Tavern+Edinburgh"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-6 inline-flex items-center gap-2 bg-betis-verde hover:bg-betis-verde-dark text-white px-6 py-3 rounded-xl font-heading font-bold text-sm transition-all duration-300 transform hover:scale-105"
                >
                  <MapPin className="h-4 w-4" />
                  Abrir en Maps
                </a>
              </div>
            </div>

            {/* Card 2: Connect Online */}
            <div className="group bg-white rounded-2xl p-8 shadow-xl border border-gray-100 hover:border-betis-verde transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-1 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 pattern-tartan-subtle opacity-30" />
              <div className="relative">
                <div className="w-16 h-16 bg-betis-verde rounded-full flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <h2 className="font-display text-2xl font-black text-scotland-navy mb-4 uppercase tracking-tight">
                  2. Conéctate
                </h2>
                <p className="font-body text-gray-700 mb-6">
                  Síguenos para estar al día de partidos, planes y fotos de la
                  peña.
                </p>
                <div className="space-y-3">
                  <a
                    href="https://www.facebook.com/groups/beticosenescocia/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-heading font-bold text-sm transition-all duration-300 transform hover:scale-105"
                  >
                    <span className="text-xl">📘</span>
                    Facebook
                  </a>
                  <a
                    href="https://www.instagram.com/rbetisescocia/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white px-6 py-3 rounded-xl font-heading font-bold text-sm transition-all duration-300 transform hover:scale-105"
                  >
                    <span className="text-xl">📷</span>
                    Instagram
                  </a>
                </div>
              </div>
            </div>

            {/* Card 3: That's It */}
            <div className="group bg-white rounded-2xl p-8 shadow-xl border border-gray-100 hover:border-betis-oro transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-1 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-20 h-20 pattern-verdiblanco-diagonal-subtle opacity-20" />
              <div className="relative">
                <div className="w-16 h-16 bg-betis-oro rounded-full flex items-center justify-center mb-6 text-4xl group-hover:scale-110 transition-transform duration-300">
                  💚
                </div>
                <h2 className="font-display text-2xl font-black text-scotland-navy mb-4 uppercase tracking-tight">
                  3. Disfruta
                </h2>
                <div className="space-y-4 font-body text-gray-700">
                  <p className="font-semibold text-betis-verde-dark">
                    No hace falta más
                  </p>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-start gap-2">
                      <span className="text-betis-verde">✓</span>
                      <span>Sin cuotas ni gastos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-betis-verde">✓</span>
                      <span>Ambiente familiar y acogedor</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-betis-verde">✓</span>
                      <span>Niños bienvenidos</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <span className="text-betis-verde">✓</span>
                      <span>No hace falta reservar</span>
                    </li>
                  </ul>
                  <p className="text-sm italic pt-4 border-t border-gray-100">
                    Solo preséntate, di que eres bético y ya eres de los
                    nuestros.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Info Bar */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-betis-verde-light" />
        <div className="absolute inset-0 pattern-verdiblanco-subtle opacity-30" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-xl font-bold text-betis-verde-dark mb-6 uppercase tracking-wide">
            🏴󠁧󠁢󠁳󠁣󠁴󠁿 ¿De visita en Escocia?
          </h2>
          <p className="font-body text-lg text-gray-700 leading-relaxed">
            Turistas, estudiantes, trabajadores temporales... si eres bético y
            estás en Edinburgh, este es tu sitio. Nos encanta conocer béticos de
            toda España y hacerles sentir como en casa.
          </p>
        </div>
      </section>

      {/* Final CTA */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-hero-fusion" />
        <div className="absolute inset-0 pattern-tartan-navy opacity-25" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl bg-oro-glow opacity-40 pointer-events-none" />
        <div className="absolute inset-0 bg-black/15" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-black mb-6 text-white drop-shadow-xl uppercase tracking-tight">
            Te esperamos
          </h2>
          <p className="font-body text-xl mb-8 text-white/95 leading-relaxed drop-shadow-lg">
            El próximo partido puede ser el momento perfecto para conocernos.
          </p>
          <FeatureWrapper feature="show-partidos">
            <Link
              href="/partidos"
              className="inline-flex items-center gap-3 bg-oro-bright hover:bg-oro-antique text-scotland-navy px-10 py-5 rounded-2xl font-display font-black text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-[0_0_30px_rgba(255,215,0,0.4)] uppercase tracking-wide"
            >
              📅 Ver Próximos Partidos
            </Link>
          </FeatureWrapper>
        </div>
      </section>
    </div>
  );
}
