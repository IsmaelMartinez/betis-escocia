import { ApiErrorBoundary } from '@/components/ErrorBoundary';
import FilteredMatches from '@/components/FilteredMatches';
import BetisPositionWidget from '@/components/BetisPositionWidget';
import UpcomingMatches from '@/components/UpcomingMatches';
import { FeatureWrapper } from '@/lib/featureProtection';
import { notFound } from 'next/navigation';
import { isFeatureEnabled } from '@/lib/featureFlags';
import Link from 'next/link';

// Fetch data at build time and revalidate every 30 minutes
async function getMatches() {
  try {
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';
    
    const [upcomingRes, recentRes, conferenceRes, friendliesRes] = await Promise.all([
      fetch(`${baseUrl}/api/matches?type=upcoming`, { 
        next: { revalidate: 1800 } // 30 minutes
      }),
      fetch(`${baseUrl}/api/matches?type=recent`, { 
        next: { revalidate: 1800 } // 30 minutes
      }),
      fetch(`${baseUrl}/api/matches?type=conference`, { 
        next: { revalidate: 1800 } // 30 minutes
      }),
      fetch(`${baseUrl}/api/matches?type=friendlies`, { 
        next: { revalidate: 1800 } // 30 minutes
      })
    ]);

    if (!upcomingRes.ok || !recentRes.ok || !conferenceRes.ok || !friendliesRes.ok) {
      throw new Error('Failed to fetch matches');
    }

    const [upcomingData, recentData, conferenceData, friendliesData] = await Promise.all([
      upcomingRes.json(),
      recentRes.json(),
      conferenceRes.json(),
      friendliesRes.json()
    ]);

    return {
      upcoming: upcomingData.matches ?? [],
      recent: recentData.matches ?? [],
      conference: conferenceData.matches ?? [],
      friendlies: friendliesData.matches ?? []
    };
  } catch (error) {
    console.error('Error fetching matches:', error);
    return {
      upcoming: [],
      recent: [],
      conference: [],
      friendlies: []
    };
  }
}

export default async function MatchesPage() {
  // Check if partidos feature is enabled
  if (!isFeatureEnabled('showPartidos')) {
    notFound();
  }

  const { upcoming, recent, conference, friendlies } = await getMatches();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-betis-green text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">📅 Partidos del Betis</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Todos los partidos se ven en el Polwarth Tavern. ¡No te pierdas ni uno!
          </p>
          
          {/* Admin controls */}
          <FeatureWrapper feature="showAdmin">
            <div className="mt-6">
              <Link
                href="/admin/matches"
                className="bg-white/20 hover:bg-white/30 text-white px-6 py-2 rounded-lg font-medium transition-colors inline-flex items-center"
              >
                ⚙️ Gestionar Partidos
              </Link>
            </div>
          </FeatureWrapper>
        </div>
      </section>

      {/* Matches with Filtering and Position Widget */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main content - matches */}
            <div className="lg:col-span-3 space-y-12">
              {/* Database-driven upcoming matches - PRIMARY DATA SOURCE */}
              <ApiErrorBoundary>
                <UpcomingMatches 
                  limit={10}
                  showViewAllLink={false}
                  className=""
                />
              </ApiErrorBoundary>
              
              {/* Optional: API-driven matches for backup/additional data */}
              {(upcoming.length > 0 || recent.length > 0) && (
                <div className="border-t border-gray-200 pt-8">
                  <details className="group">
                    <summary className="cursor-pointer list-none">
                      <h2 className="text-xl font-semibold text-gray-700 mb-4 flex items-center group-open:text-gray-900">
                        <span className="mr-2 transition-transform group-open:rotate-90">▶</span>
                        Datos Adicionales de la API
                        <span className="ml-2 text-sm font-normal text-gray-500">(Click para expandir)</span>
                      </h2>
                    </summary>
                    
                    <div className="mt-4">
                      <ApiErrorBoundary>
                        <FilteredMatches 
                          upcomingMatches={upcoming} 
                          recentMatches={recent}
                          conferenceMatches={conference}
                          friendlyMatches={friendlies}
                        />
                      </ApiErrorBoundary>
                    </div>
                  </details>
                </div>
              )}
            </div>
            
            {/* Sidebar - Betis Position Widget */}
            <FeatureWrapper feature="showClasificacion">
              <div className="lg:col-span-1">
                <div className="sticky top-8">
                  <BetisPositionWidget />
                </div>
              </div>
            </FeatureWrapper>
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
              <p className="mb-2">15 Polwarth Pl</p>
              <p className="mb-2">Edinburgh EH11 1NH</p>
              <p>📞 +44 131 229 3402</p>
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
    </div>
  );
}
