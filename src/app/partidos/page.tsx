'use client';

import { ApiErrorBoundary } from '@/components/ErrorBoundary';
import BetisPositionWidget from '@/components/BetisPositionWidget';
import AllDatabaseMatches from '@/components/AllDatabaseMatches';
import RSVPModal, { useRSVPModal } from '@/components/RSVPModal';

export default function MatchesPage() {
  const { isOpen, openModal, closeModal } = useRSVPModal();
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-betis-green text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-2">📅 Partidos del Betis</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Todos los partidos se ven en el Polwarth Tavern. ¡No te pierdas ni uno!
          </p>
        </div>
      </section>

      {/* Matches with Filtering and Position Widget */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main content - matches from database */}
            <div className="lg:col-span-3">
              <ApiErrorBoundary>
                <AllDatabaseMatches />
              </ApiErrorBoundary>
            </div>
            
            {/* Sidebar - RSVP Button and Position Widget */}
            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                {/* RSVP Button for match-specific confirmations */}
                <div className="bg-white rounded-2xl shadow-lg p-6">
                  <h3 className="text-lg font-bold text-gray-900 mb-3 text-center">
                    🍺 Próximo Partido
                  </h3>
                  <p className="text-sm text-gray-600 mb-4 text-center">
                    ¿Vienes al Polwarth Tavern?
                  </p>
                  <button
                    onClick={openModal}
                    className="w-full bg-betis-green hover:bg-betis-green-dark text-white font-bold py-3 px-4 rounded-xl transition-colors duration-200 shadow-md hover:shadow-lg"
                  >
                    ✅ Confirmar Asistencia
                  </button>
                </div>
                
                <BetisPositionWidget />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Polwarth Tavern Info */}
      <section className="py-16 bg-scotland-blue text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-8">🍺 Polwarth Tavern</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/10 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">Dirección</h3>
              <p className="mb-2">35 Polwarth Cres</p>
              <p className="mb-2">Edinburgh EH11 1HR</p>
              <p>📞 +44 131 221 9906</p>
            </div>
            
            <div className="bg-white/10 rounded-lg p-6">
              <h3 className="text-xl font-semibold mb-4">¿Cómo llegar?</h3>
              <p className="mb-2">🚌 Autobuses: 10, 27, 45</p>
              <p>🚶 10 min desde Haymarket</p>
            </div>
          </div>
          
          <div className="mt-8">
            <a
              href="https://maps.google.com/maps?q=Polwarth+Tavern+Edinburgh"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-betis-gold text-betis-dark px-8 py-3 rounded-lg font-bold text-lg hover:bg-yellow-400 transition-colors duration-200 inline-block"
            >
              📍 Ver en Google Maps
            </a>
          </div>
        </div>
      </section>

      {/* RSVP Modal */}
      <RSVPModal
        isOpen={isOpen}
        onClose={closeModal}
        event={{
          id: undefined, // Will be match-specific in future enhancement
          title: "Próximo Partido del Betis",
          date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Next week as default
          location: "Polwarth Tavern, Edinburgh",
          description: "Confirma tu asistencia para ver el partido con la peña"
        }}
        modalTitle="¿Vienes al próximo partido?"
      />
    </div>
  );
}
