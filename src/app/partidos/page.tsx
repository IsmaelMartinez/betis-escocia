'use client';

import { ApiErrorBoundary } from '@/components/ErrorBoundary';
import BetisPositionWidget from '@/components/widgets/BetisPositionWidget';
import AllDatabaseMatches from '@/components/match/AllDatabaseMatches';
import RSVPModal, { useRSVPModal } from '@/components/rsvp/RSVPModal';
import SidebarCard from '@/components/SidebarCard';
import { Calendar } from 'lucide-react';
import { hasFeature } from '@/lib/features/featureFlags';

export default function MatchesPage() {
  const { isOpen, openModal, closeModal } = useRSVPModal();
  const isRSVPEnabled = hasFeature('show-rsvp');
  return (
    <div className="min-h-screen">
      {/* Hero Section - Cultural Fusion Design */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-hero-fusion" />
        <div className="absolute inset-0 pattern-tartan-navy opacity-25" />
        <div className="absolute left-0 top-0 bottom-0 w-8 pattern-verdiblanco-subtle opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl bg-oro-glow opacity-40 pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-black mb-6 text-white text-shadow-xl uppercase tracking-tight">
            Partidos
          </h1>
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
                {isRSVPEnabled && (
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
                )}

                {/* Position Widget - With design wrapper */}
                <SidebarCard patternClass="pattern-tartan-subtle">
                  <BetisPositionWidget />
                </SidebarCard>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* RSVP Modal */}
      {isRSVPEnabled && (
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
      )}
    </div>
  );
}
