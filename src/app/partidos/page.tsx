import MatchCard from '@/components/MatchCard';

export default function MatchesPage() {
  const upcomingMatches = [
    {
      opponent: "Sevilla FC",
      date: "2025-07-15T20:00:00Z",
      venue: "Estadio Benito Villamarín",
      competition: "La Liga",
      isHome: true,
      watchParty: {
        location: "Polwarth Tavern",
        address: "15 Polwarth Pl, Edinburgh EH11 1NH",
        time: "19:30"
      }
    },
    {
      opponent: "Atlético Madrid",
      date: "2025-07-22T16:15:00Z",
      venue: "Cívitas Metropolitano",
      competition: "La Liga",
      isHome: false,
      watchParty: {
        location: "Polwarth Tavern",
        address: "15 Polwarth Pl, Edinburgh EH11 1NH",
        time: "16:00"
      }
    }
  ];

  const recentMatches = [
    {
      opponent: "FC Barcelona",
      date: "2025-06-01T18:00:00Z",
      venue: "Estadio Benito Villamarín",
      competition: "La Liga",
      isHome: true,
      result: "2-1"
    }
  ];

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
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {upcomingMatches.map((match) => (
              <MatchCard
                key={`upcoming-${match.opponent}-${match.date}`}
                opponent={match.opponent}
                date={match.date}
                venue={match.venue}
                competition={match.competition}
                isHome={match.isHome}
                watchParty={match.watchParty}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Recent Results */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">Resultados Recientes</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentMatches.map((match) => (
              <MatchCard
                key={`recent-${match.opponent}-${match.date}`}
                opponent={match.opponent}
                date={match.date}
                venue={match.venue}
                competition={match.competition}
                isHome={match.isHome}
                result={match.result}
              />
            ))}
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
