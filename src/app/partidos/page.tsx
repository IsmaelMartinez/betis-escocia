import MatchCard from '@/components/MatchCard';
import { Match } from '@/services/footballDataService';

// Fetch data at build time and revalidate every 30 minutes
async function getMatches() {
  try {
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';
    
    const [upcomingRes, recentRes] = await Promise.all([
      fetch(`${baseUrl}/api/matches?type=upcoming&limit=5`, { 
        next: { revalidate: 1800 } // 30 minutes
      }),
      fetch(`${baseUrl}/api/matches?type=recent&limit=5`, { 
        next: { revalidate: 1800 } // 30 minutes
      })
    ]);

    if (!upcomingRes.ok || !recentRes.ok) {
      throw new Error('Failed to fetch matches');
    }

    const [upcomingData, recentData] = await Promise.all([
      upcomingRes.json(),
      recentRes.json()
    ]);

    return {
      upcoming: upcomingData.matches || [],
      recent: recentData.matches || []
    };
  } catch (error) {
    console.error('Error fetching matches:', error);
    return {
      upcoming: [],
      recent: []
    };
  }
}

// Helper function to transform Football-Data.org match to component props
function transformMatch(match: Match, isUpcoming: boolean = false) {
  const isHome = match.homeTeam.id === 90; // Real Betis team ID
  const opponent = isHome ? match.awayTeam.name : match.homeTeam.name;
  
  return {
    opponent,
    date: match.utcDate,
    venue: match.venue || (isHome ? "Estadio Benito Villamarín" : "Estadio rival"),
    competition: match.competition.name,
    isHome,
    result: !isUpcoming && match.score?.fullTime?.home !== null && match.score?.fullTime?.away !== null
      ? `${match.score.fullTime.home}-${match.score.fullTime.away}`
      : undefined,
    watchParty: isUpcoming ? {
      location: "Polwarth Tavern",
      address: "15 Polwarth Pl, Edinburgh EH11 1NH",
      time: "30 minutos antes del partido"
    } : undefined
  };
}

export default async function MatchesPage() {
  const { upcoming, recent } = await getMatches();

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-betis-green text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">📅 Partidos del Betis</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Todos los partidos se ven en el Polwarth Tavern. ¡No te pierdas ni uno!
          </p>
        </div>
      </section>

      {/* Upcoming Matches */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Próximos Partidos</h2>
          
          {upcoming.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcoming.map((match: Match) => {
                const transformedMatch = transformMatch(match, true);
                return (
                  <MatchCard
                    key={`upcoming-${match.id}`}
                    opponent={transformedMatch.opponent}
                    date={transformedMatch.date}
                    venue={transformedMatch.venue}
                    competition={transformedMatch.competition}
                    isHome={transformedMatch.isHome}
                    watchParty={transformedMatch.watchParty}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                No hay próximos partidos programados en este momento.
              </p>
              <p className="text-gray-500 mt-2">
                ¡Mantente atento para las próximas fechas!
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Recent Results */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Resultados Recientes</h2>
          
          {recent.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recent.map((match: Match) => {
                const transformedMatch = transformMatch(match, false);
                return (
                  <MatchCard
                    key={`recent-${match.id}`}
                    opponent={transformedMatch.opponent}
                    date={transformedMatch.date}
                    venue={transformedMatch.venue}
                    competition={transformedMatch.competition}
                    isHome={transformedMatch.isHome}
                    result={transformedMatch.result}
                  />
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <p className="text-gray-600 text-lg">
                No se encontraron resultados recientes.
              </p>
              <p className="text-gray-500 mt-2">
                Los resultados aparecerán aquí después de los partidos.
              </p>
            </div>
          )}
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
              <p className="mb-2">🚶 10 min desde Haymarket</p>
              <p>🅿️ Parking disponible</p>
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
