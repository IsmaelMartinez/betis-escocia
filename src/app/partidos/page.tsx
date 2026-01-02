'use client';

import { ApiErrorBoundary } from '@/components/ErrorBoundary';
import BetisPositionWidget from '@/components/BetisPositionWidget';
import AllDatabaseMatches from '@/components/AllDatabaseMatches';
import RSVPModal, { useRSVPModal } from '@/components/RSVPModal';
import SidebarCard from '@/components/SidebarCard';
import { Calendar, MapPin } from 'lucide-react';

export default function MatchesPage() {
  const { isOpen, openModal, closeModal } = useRSVPModal();
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
            <Calendar size={20} className="text-oro-bright" />
            <span className="text-white font-heading font-medium text-sm tracking-wide">
              Ver partidos en vivo
            </span>
          </div>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-black mb-6 text-white text-shadow-xl uppercase tracking-tight">
            Partidos
          </h1>

          <p className="font-accent text-2xl sm:text-3xl text-oro-bright mb-6 text-shadow-lg italic">
            Todos los partidos en el Polwarth Tavern
          </p>

          <p className="font-body text-lg text-white/90 max-w-2xl mx-auto leading-relaxed">
            ¡No te pierdas ningún partido del Betis! Todos se ven en el Polwarth
            Tavern con la peña.
          </p>
        </div>
      </section>

      {/* Matches with Filtering and Sidebar */}
      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-canvas-warm" />
        <div className="absolute inset-0 pattern-tartan-subtle opacity-40" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main content - matches from database */}
            <div className="lg:col-span-3">
              <ApiErrorBoundary>
                <AllDatabaseMatches />
              </ApiErrorBoundary>
            </div>

            {/* Redesigned Sidebar */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                {/* RSVP Card - Redesigned */}
                <SidebarCard>
                  <div className="w-12 h-12 bg-betis-verde rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Calendar className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="font-heading text-lg font-bold text-scotland-navy mb-2 text-center uppercase tracking-wide">
                    Próximo Partido
                  </h3>
                  <p className="font-body text-sm text-gray-600 mb-4 text-center">
                    ¿Vienes al Polwarth Tavern?
                  </p>
                  <button
                    onClick={openModal}
                    className="w-full bg-betis-verde hover:bg-betis-verde-dark text-white font-heading font-bold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl uppercase tracking-wide text-sm"
                  >
                    ✅ Confirmar Asistencia
                  </button>
                </SidebarCard>

                {/* Position Widget - With design wrapper */}
                <SidebarCard patternClass="pattern-tartan-subtle">
                  <BetisPositionWidget />
                </SidebarCard>

                {/* Quick Info Card */}
                <SidebarCard
                  bgColor="bg-betis-verde-light"
                  borderColor="border-betis-verde/20"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <MapPin size={20} className="text-betis-verde-dark" />
                    <h3 className="font-heading font-bold text-betis-verde-dark uppercase tracking-wide text-sm">
                      Polwarth Tavern
                    </h3>
                  </div>
                  <p className="font-body text-xs text-gray-700 mb-2">
                    35 Polwarth Cres, Edinburgh EH11 1HR
                  </p>
                  <p className="font-body text-xs text-gray-700 mb-3">
                    📞 +44 131 221 9906
                  </p>
                  <a
                    href="https://maps.google.com/maps?q=Polwarth+Tavern+Edinburgh"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-betis-verde-dark hover:text-betis-verde font-heading font-bold text-xs transition-colors uppercase tracking-wide"
                  >
                    <MapPin size={14} />
                    Ver en Maps
                  </a>
                </SidebarCard>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RSVP Modal */}
      <RSVPModal
        isOpen={isOpen}
        onClose={closeModal}
        event={{
          id: undefined,
          title: "Próximo Partido del Betis",
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
          location: "Polwarth Tavern, Edinburgh",
          description: "Confirma tu asistencia para ver el partido con la peña"
        }}
        modalTitle="¿Vienes al próximo partido?"
      />
    </div>
  );
}
