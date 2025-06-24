import MatchCard from '@/components/MatchCard';
import { NoUpcomingMatchesMessage, NoRecentMatchesMessage } from '@/components/ErrorMessage';
import { ApiErrorBoundary, MatchCardErrorBoundary } from '@/components/ErrorBoundary';
import type { Match } from '@/types/match';

// Fetch data at build time and revalidate every 30 minutes
async function getMatches() {
  try {
    const baseUrl = process.env.VERCEL_URL 
      ? `https://${process.env.VERCEL_URL}` 
      : 'http://localhost:3000';
    
    const [upcomingRes, recentRes] = await Promise.all([
      fetch(`${baseUrl}/api/matches?type=upcoming&limit=3`, { 
        next: { revalidate: 1800 } // 30 minutes
      }),
      fetch(`${baseUrl}/api/matches?type=recent&limit=3`, { 
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
      upcoming: upcomingData.matches ?? [],
      recent: recentData.matches ?? []
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
  const isBetisHome = match.homeTeam.id === 90; // Real Betis team ID
  const opponent = isBetisHome ? match.awayTeam.name : match.homeTeam.name;
  const opponentCrest = isBetisHome ? match.awayTeam.crest : match.homeTeam.crest;
  
  // Get venue information - use known stadiums for common opponents
  const getVenue = () => {
    if (isBetisHome) {
      return "Estadio Benito Villamarín";
    } else {
      // Known opponent stadiums (add more as needed)
      const stadiums: Record<string, string> = {
        'FC Barcelona': 'Camp Nou',
        'Real Madrid CF': 'Santiago Bernabéu',
        'Atlético Madrid': 'Riyadh Air Metropolitano',
        'Sevilla FC': 'Ramón Sánchez-Pizjuán',
        'Valencia CF': 'Mestalla',
        'Athletic Bilbao': 'San Mamés',
        'Real Sociedad': 'Reale Arena',
        'Villarreal CF': 'Estadio de la Cerámica',
        'CA Osasuna': 'El Sadar',
        'Celta Vigo': 'Abanca-Balaídos',
        'RCD Espanyol': 'RCDE Stadium',
        'Getafe CF': 'Coliseum',
        'Deportivo Alavés': 'Mendizorroza',
        'Girona FC': 'Montilivi',
        'UD Las Palmas': 'Estadio Gran Canaria',
        'Rayo Vallecano': 'Campo de Fútbol de Vallecas',
        'RCD Mallorca': 'Son Moix',
        'CD Leganés': 'Butarque',
        'Real Valladolid CF': 'José Zorrilla'
      };
      
      const opponentName = isBetisHome ? match.awayTeam.name : match.homeTeam.name;
      return stadiums[opponentName] || `Estadio de ${opponentName}`;
    }
  };
  
  // Format score for display (always show Betis score first)
  const getFormattedScore = () => {
    if (match.score?.fullTime?.home !== null && match.score?.fullTime?.away !== null) {
      if (isBetisHome) {
        return {
          home: match.score.fullTime.home,
          away: match.score.fullTime.away
        };
      } else {
        // When Betis is away, flip the scores so Betis appears first
        return {
          home: match.score.fullTime.away,
          away: match.score.fullTime.home
        };
      }
    }
    return undefined;
  };

  // Get formatted result string (always show Betis score first)
  const getResultString = () => {
    if (!isUpcoming && match.score?.fullTime?.home !== null && match.score?.fullTime?.away !== null) {
      if (isBetisHome) {
        return `${match.score.fullTime.home}-${match.score.fullTime.away}`;
      } else {
        // When Betis is away, flip the result so Betis score appears first
        return `${match.score.fullTime.away}-${match.score.fullTime.home}`;
      }
    }
    return undefined;
  };

  return {
    opponent,
    date: match.utcDate,
    venue: getVenue(),
    competition: match.competition.name,
    isHome: isBetisHome, // Keep this for internal logic
    status: match.status,
    matchday: match.matchday,
    opponentCrest,
    competitionEmblem: match.competition.emblem,
    score: getFormattedScore(),
    result: getResultString(),
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
            <ApiErrorBoundary>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {upcoming.map((match: Match) => {
                  const transformedMatch = transformMatch(match, true);
                  return (
                    <MatchCardErrorBoundary key={`upcoming-boundary-${match.id}`}>
                      <MatchCard
                        key={`upcoming-${match.id}`}
                        {...transformedMatch}
                      />
                    </MatchCardErrorBoundary>
                  );
                })}
              </div>
            </ApiErrorBoundary>
          ) : (
            <div className="text-center py-12">
              <NoUpcomingMatchesMessage />
            </div>
          )}
        </div>
      </section>

      {/* Recent Results */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Resultados Recientes</h2>
          
          {recent.length > 0 ? (
            <ApiErrorBoundary>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recent.map((match: Match) => {
                  const transformedMatch = transformMatch(match, false);
                  return (
                    <MatchCardErrorBoundary key={`recent-boundary-${match.id}`}>
                      <MatchCard
                        key={`recent-${match.id}`}
                        {...transformedMatch}
                      />
                    </MatchCardErrorBoundary>
                  );
                })}
              </div>
            </ApiErrorBoundary>
          ) : (
            <div className="text-center py-12">
              <NoRecentMatchesMessage />
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
