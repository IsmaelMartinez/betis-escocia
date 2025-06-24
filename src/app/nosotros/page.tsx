import Link from 'next/link';
import { Users, Heart } from 'lucide-react';

export default function Nosotros() {
  const foundingMembers = [
    {
      name: "Fran",
      role: "Fundador y organizador de La Porra",
      description: "El alma de nuestra peña. Siempre con una sonrisa y la porra preparada.",
      emoji: "👑"
    },
    {
      name: "Isabel",
      role: "Coordinadora de eventos",
      description: "Se encarga de que todo esté perfecto para cada partido.",
      emoji: "🎯"
    },
    {
      name: "Carlos",
      role: "Experto en estadísticas",
      description: "Conoce cada dato del Betis desde los años 80. Una enciclopedia andante.",
      emoji: "📊"
    },
    {
      name: "María",
      role: "Embajadora social",
      description: "Siempre dispuesta a recibir a los nuevos béticos que llegan a Escocia.",
      emoji: "🤝"
    }
  ];

  const milestones = [
    {
      year: "2018",
      event: "Fundación de la peña",
      description: "Un grupo de béticos residentes en Edinburgh decidimos crear nuestro espacio."
    },
    {
      year: "2019",
      event: "Primera porra oficial",
      description: "Fran organiza la primera porra que se convertiría en nuestra tradición."
    },
    {
      year: "2020",
      event: "Consolidación digital",
      description: "Durante la pandemia, mantuvimos viva la llama bética online."
    },
    {
      year: "2021",
      event: "Regreso al Polwarth",
      description: "Vuelta a nuestro hogar para ver la remontada histórica ante el Villarreal."
    },
    {
      year: "2022",
      event: "Copa del Rey",
      description: "Celebramos la Copa del Rey como si estuviéramos en La Palmera."
    },
    {
      year: "2024",
      event: "Reconocimiento LaLiga",
      description: "LaLiga nos destaca como peña ejemplar internacional."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-betis-green via-betis-green-dark to-betis-black text-white py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-betis-gold/20 border border-betis-gold/30 backdrop-blur-sm mb-8">
            <span className="text-betis-gold font-medium">💚 Nuestra historia</span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-black mb-6 text-shadow-lg">
            Nosotros
          </h1>
          
          <p className="text-xl sm:text-2xl mb-4 font-semibold text-betis-gold text-shadow-lg">
            Más que una peña, somos familia
          </p>
          
          <p className="text-lg max-w-3xl mx-auto opacity-90 text-shadow-lg leading-relaxed">
            Desde 2018, hemos sido el hogar de todos los béticos en Escocia. 
            Una historia de pasión, amistad y amor incondicional por los colores verdes y blancos.
          </p>
        </div>
      </section>

      {/* Our Story */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block bg-betis-green text-white px-6 py-3 rounded-lg font-bold text-lg mb-6 uppercase tracking-wide">
              📖 NUESTRA HISTORIA
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6 uppercase">
              CÓMO EMPEZÓ TODO
            </h2>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Heart className="h-6 w-6 text-betis-green mr-3" />
                El Comienzo
              </h3>
              <p className="text-gray-800 leading-relaxed mb-6 text-base">
                Todo empezó en 2018 cuando un grupo de béticos residentes en Edinburgh nos dimos cuenta 
                de que estábamos viendo los partidos solos en casa. ¿La solución? Encontrar un pub 
                que nos acogiera y crear nuestra propia familia bética en Escocia.
              </p>
              <p className="text-gray-800 leading-relaxed mb-6 text-base">
                El Polwarth Tavern se convirtió en nuestro hogar. Los dueños, aunque no entendían 
                mucho de fútbol español, nos recibieron con los brazos abiertos. Y así comenzó 
                nuestra aventura.
              </p>
              <div className="bg-betis-green/10 rounded-lg p-4 border-l-4 border-betis-green">
                <p className="text-betis-green font-semibold">
                  &ldquo;Desde el primer día supimos que esto iba a ser especial. No solo por los partidos, 
                  sino por las personas que íbamos a conocer.&rdquo;
                </p>
                <p className="text-sm text-gray-800 mt-2 font-medium">- Fran, fundador</p>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
              <h3 className="text-2xl font-bold text-gray-900 mb-6 flex items-center">
                <Users className="h-6 w-6 text-betis-green mr-3" />
                La Comunidad
              </h3>
              <p className="text-gray-800 leading-relaxed mb-6 text-base">
                Lo que empezó como 4 o 5 personas viendo partidos, se convirtió en una verdadera 
                familia. Béticos de toda España que viven en Escocia, estudiantes de intercambio, 
                turistas de paso... todos son bienvenidos.
              </p>
              <p className="text-gray-800 leading-relaxed mb-6">
                Hemos celebrado bodas, nacimientos, ascensos profesionales y, por supuesto, 
                títulos del Betis. También hemos llorado derrotas juntos y nos hemos consolado 
                con una cerveza y la certeza de que &ldquo;el año que viene será el nuestro&rdquo;.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-betis-green/5 rounded-lg">
                  <div className="text-2xl font-black text-betis-green">50+</div>
                  <div className="text-sm text-gray-600">Miembros activos</div>
                </div>
                <div className="text-center p-4 bg-betis-green/5 rounded-lg">
                  <div className="text-2xl font-black text-betis-green">200+</div>
                  <div className="text-sm text-gray-600">Partidos vividos</div>
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
            <div className="inline-block bg-betis-green text-white px-6 py-3 rounded-lg font-bold text-lg mb-6 uppercase tracking-wide">
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
                  <span className="inline-block bg-betis-green text-white px-3 py-1 rounded-full font-bold text-sm">
                    {milestone.year}
                  </span>
                </div>
                <div className="flex-1 bg-white rounded-xl p-6 shadow-lg border border-gray-200 transform hover:scale-105 transition-all duration-300">
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {milestone.event}
                  </h3>
                  <p className="text-gray-800">
                    {milestone.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Team */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block bg-betis-green text-white px-6 py-3 rounded-lg font-bold text-lg mb-6 uppercase tracking-wide">
              👥 EL EQUIPO
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6 uppercase">
              NUESTROS PILARES
            </h2>
            <p className="text-xl text-gray-800 max-w-3xl mx-auto">
              Las personas que hacen que todo funcione y que cada domingo sea especial
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {foundingMembers.map((member) => (
              <div key={member.name} className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 text-center transform hover:scale-105 transition-all duration-300">
                <div className="text-4xl mb-4">{member.emoji}</div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{member.name}</h3>
                <p className="text-betis-green font-semibold mb-3 text-sm uppercase tracking-wide">
                  {member.role}
                </p>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {member.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-gradient-to-r from-betis-green to-betis-green-dark text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-black mb-6">
            ¿Quieres ser parte de nuestra historia?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Cada bético que se une a nosotros añade un capítulo más a nuestra historia. 
            Tu historia también puede formar parte de la nuestra.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/unete"
              className="bg-betis-gold hover:bg-betis-gold-dark text-gray-900 px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105"
            >
              💬 Únete a nosotros
            </Link>
            <Link
              href="/partidos"
              className="border-2 border-white text-white hover:bg-white hover:text-betis-green px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105"
            >
              📅 Próximos partidos
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
