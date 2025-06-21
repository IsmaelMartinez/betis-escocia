import Hero from '@/components/Hero';
import PorraCard from '@/components/PorraCard';
import MatchCard from '@/components/MatchCard';

export default function Home() {
  // Mock data for demo
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

  return (
    <>
      <Hero />
      
      {/* La Porra Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              🎲 La Porra de Fran
            </h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Nuestra tradicional porra para cada partido. ¡Demuestra que conoces al Betis!
            </p>
          </div>
          
          <div className="max-w-md mx-auto">
            <PorraCard
              isActive={true}
              opponent="Sevilla FC"
              date="2025-07-15T20:00:00Z"
              prizePool={150}
              totalEntries={23}
            />
          </div>
        </div>
      </section>

      {/* Upcoming Matches */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              📅 Próximos Partidos
            </h2>
            <p className="text-lg text-gray-600">
              No te pierdas ningún partido en el Polwarth Tavern
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-4xl mx-auto">
            {upcomingMatches.map((match) => (
              <MatchCard
                key={`${match.opponent}-${match.date}`}
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

      {/* Join Us CTA */}
      <section className="py-16 bg-betis-green text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">
            ¿Estás de visita en Escocia?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            ¡Únete a nosotros en el Polwarth Tavern! Todos los béticos son bienvenidos.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/unete"
              className="bg-betis-gold text-betis-dark px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-400 transition-colors duration-200"
            >
              Contáctanos
            </a>
            <a
              href="https://www.facebook.com/groups/beticosenescocia/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/20 backdrop-blur-sm border border-white/30 px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/30 transition-colors duration-200"
            >
              Facebook
            </a>
          </div>
        </div>
      </section>
    </>
  );
}
