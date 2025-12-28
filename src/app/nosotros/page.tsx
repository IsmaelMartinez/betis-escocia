import Link from "next/link";
import { Users, Heart } from "lucide-react";
import { FeatureWrapper } from "@/lib/featureProtection";

export default function Nosotros() {
  const milestones = [
    {
      year: "2010",
      event: "Fundación histórica",
      description:
        "4 de diciembre - Juan Morata y José María Conde fundan la primera peña oficial del Betis en Reino Unido.",
    },
    {
      year: "2011",
      event: "El ascenso que cambió todo",
      description:
        "Con el ascenso del Betis, la peña toma forma en The Cuckoo's Nest. Los partidos por fin se ven en TV.",
    },
    {
      year: "2015",
      event: "Nueva casa en Polwarth",
      description:
        "Después de años en The Cuckoo's Nest, encontramos nuestro hogar actual: Polwarth Tavern.",
    },
    {
      year: "2018",
      event: "Reconocimiento de LaLiga",
      description:
        "LaLiga nos destaca oficialmente como 'bastión' del betismo en Escocia.",
    },
    {
      year: "2021",
      event: "ABC nos cita",
      description:
        "ABC Sevilla nos reconoce como 'embajada que recibe a los suyos en Escocia'.",
    },
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <div className="bg-betis-verde text-white py-12 px-4">
        <div className="max-w-6xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Nosotros</h1>
          <p className="text-xl sm:text-2xl mb-6 font-bold text-betis-oro drop-shadow-lg">
            Más que una peña, somos familia
          </p>
          <p className="text-lg max-w-3xl mx-auto text-white leading-relaxed font-medium drop-shadow-xl">
            Desde 2010, hemos sido el hogar de todos los béticos en Escocia. Una
            historia de pasión, amistad y amor incondicional por los colores
            verdes y blancos.
          </p>
        </div>
      </div>

      {/* Our Story */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block bg-betis-verde text-white px-6 py-3 rounded-lg font-bold text-lg mb-6 uppercase tracking-wide">
              📖 NUESTRA HISTORIA
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6 uppercase">
              CÓMO EMPEZÓ TODO
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Heart className="h-6 w-6 text-betis-verde mr-3" />
                El Comienzo
              </h3>
              <p className="text-gray-800 leading-relaxed mb-6 text-base">
                Todo empezó en el 2010 cuando Juan Morata y José María Conde se
                encontraron casualmente jugando fútbol en Edimburgo. Ambos
                llevaban la camiseta del Betis, y esa coincidencia fue el inicio
                de una gran amistad bética.
              </p>
              <p className="text-gray-800 leading-relaxed mb-6 text-base">
                La idea de crear la peña surgió durante una charla en un pub, y
                así nació la primera peña oficial del Real Betis en el Reino
                Unido. Desde entonces, hemos pasado por diferentes sedes hasta
                encontrar nuestro hogar actual en Polwarth Tavern.
              </p>
              <div className="bg-betis-verde-light rounded-lg p-4 border-l-4 border-betis-verde">
                <p className="text-betis-verde-dark font-semibold">
                  &ldquo;La idea de crear el club de fans vino tomando algo en
                  un pub. Simplemente lo decidieron así. ¡Literalmente!&rdquo;
                </p>
                <p className="text-sm text-gray-800 mt-2 font-medium">
                  - Fuente: LaLiga oficial
                </p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Users className="h-6 w-6 text-betis-verde mr-3" />
                La Comunidad
              </h3>
              <p className="text-gray-800 leading-relaxed mb-6 text-base">
                Lo que empezó como dos amigos béticos encontrándose por
                casualidad, se convirtió en una verdadera familia. Desde 2010,
                hemos acogido a béticos de toda España que viven en Escocia,
                estudiantes de intercambio, turistas de paso... todos son
                bienvenidos.
              </p>
              <p className="text-gray-800 leading-relaxed mb-6 text-base">
                Hemos celebrado ascensos, títulos, bodas y nacimientos juntos.
                También hemos llorado derrotas y nos hemos consolado con una
                cerveza y la certeza de que &ldquo;el año que viene será el
                nuestro&rdquo;.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-betis-verde-pale rounded-lg">
                  <div className="text-2xl font-black text-betis-verde">
                    25+
                  </div>
                  <div className="text-sm text-gray-700 font-medium">
                    Miembros activos
                  </div>
                </div>
                <div className="text-center p-4 bg-betis-verde-pale rounded-lg">
                  <div className="text-2xl font-black text-betis-verde">14</div>
                  <div className="text-sm text-gray-700 font-medium">
                    Años de historia
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Timeline */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block bg-betis-verde text-white px-6 py-3 rounded-lg font-bold text-lg mb-6 uppercase tracking-wide">
              ⏰ CRONOLOGÍA
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6 uppercase">
              MOMENTOS CLAVE
            </h2>
          </div>

          <div className="space-y-8">
            {milestones.map((milestone) => (
              <div key={milestone.year} className="flex items-start">
                <div className="flex-shrink-0 w-24 text-right mr-8">
                  <span className="inline-block bg-betis-verde text-white px-3 py-1 rounded-full font-bold text-sm">
                    {milestone.year}
                  </span>
                </div>
                <div className="flex-1 bg-white rounded-xl p-6 shadow-lg border border-gray-200 transform hover:scale-105 transition-all duration-300">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {milestone.event}
                  </h3>
                  <p className="text-gray-800">{milestone.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-betis-verde text-white relative">
        {/* Background overlay for better text readability */}
        <div className="absolute inset-0 bg-black/20"></div>

        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-black mb-6 text-white drop-shadow-xl">
            ¿Quieres ser parte de nuestra historia?
          </h2>
          <p className="text-xl mb-8 text-white font-medium leading-relaxed drop-shadow-lg">
            Cada bético que se une a nosotros añade un capítulo más a nuestra
            historia. Tu historia también puede formar parte de la nuestra.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/unete"
              className="bg-betis-oro hover:bg-betis-oro-dark text-gray-900 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg"
            >
              💬 Únete a nosotros
            </Link>
            <FeatureWrapper feature="show-rsvp">
              <Link
                href="/rsvp"
                className="text-white hover:bg-betis-verde-dark bg-betis-verde hover:text-betis-oro px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 shadow-lg border border-white/20"
              >
                📅 Próximos eventos
              </Link>
            </FeatureWrapper>
          </div>
        </div>
      </section>
    </div>
  );
}
