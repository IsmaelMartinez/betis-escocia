import Link from "next/link";
import { Star, Trophy, Heart } from "lucide-react";

interface Player {
  name: string;
  position: string;
  years: string;
  description: string;
  highlight: string;
}

const HISTORIC_PLAYERS: Player[] = [
  {
    name: "Joaquín Sánchez",
    position: "Extremo derecho",
    years: "2000–2006, 2015–2024",
    description:
      "El eterno capitán. Joaquín es el jugador con más partidos en la historia del Betis. Su regate, su alegría y su amor por el club lo convierten en el máximo símbolo del beticismo.",
    highlight: "Más de 500 partidos con el Betis",
  },
  {
    name: "Rafael Gordillo",
    position: "Lateral izquierdo",
    years: "1974–1985",
    description:
      "Leyenda del fútbol español formado en la cantera bética. Gordillo fue el mejor lateral izquierdo de su generación. Su entrega y calidad en la banda izquierda marcaron una época dorada.",
    highlight: "75 internacionalidades con España",
  },
  {
    name: "Julio Cardeñosa",
    position: "Centrocampista",
    years: "1971–1981",
    description:
      "El maestro del centro del campo. Cardeñosa poseía una elegancia y visión de juego únicas. Su famoso fallo ante Brasil en el Mundial del 78 no empañó una carrera extraordinaria con el Betis.",
    highlight: "Ídolo eterno del Villamarín",
  },
  {
    name: "Rubén Castro",
    position: "Delantero",
    years: "2010–2018",
    description:
      "Máximo goleador en la historia del Real Betis Balompié. Su instinto de gol y su capacidad para aparecer en los momentos clave le convirtieron en un referente absoluto del club.",
    highlight: "Máximo goleador histórico del club",
  },
  {
    name: "Denilson",
    position: "Extremo izquierdo",
    years: "1998–2000",
    description:
      "El brasileño más caro del mundo llegó al Betis y dejó destellos de magia pura. Su fichaje puso al Betis en el mapa mundial y sus regates imposibles siguen en la memoria colectiva.",
    highlight: "Fichaje récord mundial en 1998",
  },
  {
    name: "Alfonso Pérez",
    position: "Delantero",
    years: "2002–2005",
    description:
      "Goleador fundamental en una de las mejores épocas del Betis. Alfonso fue pieza clave del equipo que jugó la Champions League y conquistó la Copa del Rey en 2005.",
    highlight: "Campeón de la Copa del Rey 2005",
  },
  {
    name: "Oliveira",
    position: "Mediapunta",
    years: "1997–2002",
    description:
      "El brasileño que enamoró al Villamarín con su fútbol elegante. Oliveira combinaba técnica depurada con gol y fue uno de los jugadores más queridos de finales de los 90.",
    highlight: "Referente de la época dorada brasileña",
  },
  {
    name: "Ricardo",
    position: "Mediapunta",
    years: "1998–2004",
    description:
      "Otro de los grandes brasileños que vistieron la verdiblanca. Ricardo aportó clase y creatividad al mediocampo bético durante seis temporadas memorables.",
    highlight: "Clave en la clasificación para Champions",
  },
  {
    name: "Assunção",
    position: "Centrocampista",
    years: "2001–2005",
    description:
      "El cerebro del mediocampo del Betis de Champions. Assunção era pura calidad con el balón en los pies, combinando pases milimétricos con una llegada goleadora desde segunda línea.",
    highlight: "Protagonista en la Copa del Rey 2005",
  },
];

export default function JugadoresHistoricos() {
  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-hero-fusion" />
        <div className="absolute inset-0 pattern-tartan-navy opacity-25" />
        <div className="absolute left-0 top-0 bottom-0 w-8 pattern-verdiblanco-subtle opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl bg-oro-glow opacity-40 pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-5 py-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 mb-8">
            <span className="text-white font-heading font-medium text-sm tracking-wide">
              <Star className="inline h-4 w-4 text-betis-oro mr-1" />
              Jugadores Legendarios
            </span>
          </div>

          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-black mb-6 text-white text-shadow-xl uppercase tracking-tight">
            Leyendas Béticas
          </h1>

          <p className="font-accent text-2xl sm:text-3xl text-oro-bright mb-8 text-shadow-lg italic">
            Los jugadores que hicieron historia en el Villamarín
          </p>
        </div>
      </section>

      {/* Players Grid */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-canvas-warm" />
        <div className="absolute inset-0 pattern-tartan-subtle opacity-40" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {HISTORIC_PLAYERS.map((player) => (
              <div
                key={player.name}
                className="group bg-white rounded-2xl p-8 shadow-xl border border-gray-100 hover:border-betis-verde transition-all duration-300 hover:shadow-2xl transform hover:-translate-y-1 relative overflow-hidden"
              >
                <div className="absolute top-0 right-0 w-20 h-20 pattern-verdiblanco-diagonal-subtle opacity-20" />
                <div className="relative">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="font-display text-xl font-black text-scotland-navy uppercase tracking-tight">
                        {player.name}
                      </h2>
                      <p className="font-heading text-sm text-betis-verde font-semibold">
                        {player.position}
                      </p>
                    </div>
                    <span className="inline-block bg-betis-verde text-white px-3 py-1 rounded-full font-heading font-bold text-xs whitespace-nowrap">
                      {player.years}
                    </span>
                  </div>

                  <p className="font-body text-gray-700 text-sm leading-relaxed mb-4">
                    {player.description}
                  </p>

                  <div className="pt-4 border-t border-gray-100 flex items-center gap-2">
                    <Trophy className="h-4 w-4 text-betis-oro flex-shrink-0" />
                    <p className="font-heading text-sm font-semibold text-betis-verde-dark">
                      {player.highlight}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-hero-fusion" />
        <div className="absolute inset-0 pattern-tartan-navy opacity-25" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl bg-oro-glow opacity-40 pointer-events-none" />
        <div className="absolute inset-0 bg-black/15" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-3xl sm:text-4xl font-black mb-6 text-white drop-shadow-xl uppercase tracking-tight">
            Comparte la pasión bética con nosotros
          </h2>
          <p className="font-body text-xl mb-8 text-white/95 leading-relaxed drop-shadow-lg">
            Vive cada partido rodeado de béticos en Edimburgo.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/unete"
              className="inline-flex items-center gap-3 bg-oro-bright hover:bg-oro-antique text-scotland-navy px-10 py-5 rounded-2xl font-display font-black text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-[0_0_30px_rgba(255,215,0,0.4)] uppercase tracking-wide"
            >
              <Heart className="h-6 w-6" />
              Únete a Nosotros
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
