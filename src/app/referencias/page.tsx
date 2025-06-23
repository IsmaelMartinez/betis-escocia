'use client';

import { ExternalLink, Calendar, Users, MapPin } from 'lucide-react';

interface ReferenceCardProps {
  readonly title: string;
  readonly url: string;
  readonly description: string;
  readonly date?: string;
  readonly source: string;
  readonly preview: string;
}

function ReferenceCard({ title, url, description, date, source, preview }: ReferenceCardProps) {
  return (
    <div className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow">
      {/* Header */}
      <div className="bg-betis-green text-white px-6 py-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <h3 className="font-bold text-lg mb-1">{title}</h3>
            <p className="text-sm opacity-90">{source}</p>
          </div>
          <a
            href={url}
            target="_blank"
            rel="noopener noreferrer"
            className="ml-4 bg-white/20 hover:bg-white/30 p-2 rounded-full transition-colors"
          >
            <ExternalLink className="h-4 w-4" />
          </a>
        </div>
      </div>

      {/* Content */}
      <div className="p-6">
        {date && (
          <div className="flex items-center text-gray-600 mb-3">
            <Calendar className="h-4 w-4 mr-2" />
            <span className="text-sm">{date}</span>
          </div>
        )}
        
        <p className="text-gray-700 mb-4">{description}</p>
        
        {/* Preview */}
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-sm text-gray-600 italic">&ldquo;{preview}&rdquo;</p>
        </div>
      </div>
    </div>
  );
}

export default function ReferenciasPage() {
  const references = [
    {
      title: "Conoce a la Peña Bética de Escocia: 'No busques más que no hay'",
      url: "https://www.laliga.com/noticias/conoce-a-la-pena-betica-de-escocia-no-busques-mas-que-no-hay",
      source: "LaLiga Oficial",
      date: "14 de Mayo, 2018",
      description: "Entrevista oficial de LaLiga con la peña, donde José María Conde y Juan Morata explican los orígenes y la historia del grupo.",
      preview: "El Real Betis levanta pasiones por todo el mundo, y si no que lo pregunten por Escocia. Allí, la peña 'No busques más que no hay' es su bastión. La respuesta a esta pregunta José María y Juan se encontraron jugando un partido de fútbol al azar en Edimburgo. Ambos se habían puesto la camiseta del Betis ese día..."
    },
    {
      title: "Real Betis Balompié - Web Oficial",
      url: "https://www.realbetisbalompie.es",
      source: "Real Betis Balompié",
      date: "Actualizado permanentemente",
      description: "Página oficial del Real Betis con noticias, partidos y información sobre las peñas oficiales del club.",
      preview: "Web oficial del Real Betis Balompié con toda la información del primer equipo, cantera, femenino y futsal. Noticias, partidos, clasificación y mucho más."
    },
    {
      title: "Peña Bética Escocesa en Facebook",
      url: "https://www.facebook.com/groups/beticosenescocia/",
      source: "Facebook",
      date: "Activo desde 2010",
      description: "Grupo oficial en Facebook donde los miembros comparten noticias, organizan quedadas y comentan los partidos.",
      preview: "Grupo cerrado de Facebook para los béticos en Escocia. Aquí organizamos las quedadas en Polwarth Tavern y compartimos nuestra pasión por el Betis."
    },
    {
      title: "@rbetisescocia en Instagram",
      url: "https://www.instagram.com/rbetisescocia/",
      source: "Instagram",
      date: "Activo",
      description: "Cuenta oficial de Instagram con fotos de las quedadas, partidos y momentos especiales de la peña.",
      preview: "Fotos y momentos especiales de la peña bética en Edimburgo. Síguenos para ver nuestras celebraciones en Polwarth Tavern."
    }
  ];

  const penaHistory = {
    foundation: "Diciembre 2010",
    founders: ["José María Conde (Presidente actual)", "Juan Morata (fundador, ahora en España)"],
    location: "Edimburgo, Escocia",
    venue: "Polwarth Tavern",
    members: "7-8 miembros incondicionales, hasta 15 en grandes partidos",
    origin: "Se conocieron jugando fútbol, ambos llevaban la camiseta del Betis"
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-betis-green text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl font-bold mb-4">📚 Referencias y Historia</h1>
          <p className="text-xl opacity-90 max-w-2xl mx-auto">
            Descubre más sobre nuestra peña a través de artículos, entrevistas y presencia online
          </p>
        </div>
      </section>

      {/* Historia de la Peña */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">🏴󠁧󠁢󠁳󠁣󠁴󠁿 Nuestra Historia</h2>
          
          <div className="bg-white rounded-lg shadow-md p-8">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <div>
                <h3 className="text-xl font-semibold mb-4 text-betis-green">Datos Fundacionales</h3>
                <div className="space-y-3">
                  <div className="flex items-center">
                    <Calendar className="h-5 w-5 text-gray-500 mr-3" />
                    <span><strong>Fundación:</strong> {penaHistory.foundation}</span>
                  </div>
                  <div className="flex items-center">
                    <MapPin className="h-5 w-5 text-gray-500 mr-3" />
                    <span><strong>Ubicación:</strong> {penaHistory.location}</span>
                  </div>
                  <div className="flex items-center">
                    <Users className="h-5 w-5 text-gray-500 mr-3" />
                    <span><strong>Miembros:</strong> {penaHistory.members}</span>
                  </div>
                </div>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-4 text-betis-green">Fundadores</h3>
                <ul className="space-y-2">
                  {penaHistory.founders.map((founder, index) => (
                    <li key={index} className="flex items-start">
                      <span className="text-betis-green mr-2">•</span>
                      <span>{founder}</span>
                    </li>
                  ))}
                </ul>
                
                <div className="mt-6 p-4 bg-betis-green/10 rounded-lg">
                  <p className="text-sm text-gray-700">
                    <strong>Origen del nombre:</strong> Inspirado en la canción de Silvio &ldquo;Betis&rdquo;, 
                    específicamente en las letras que inspiraron el nombre &ldquo;No busques más que no hay&rdquo;.
                  </p>
                </div>
              </div>
            </div>
            
            <div className="mt-8 pt-6 border-t border-gray-200">
              <h4 className="font-semibold mb-3">El Encuentro Fundacional</h4>
              <p className="text-gray-700">
                José María Conde y Juan Morata se conocieron de forma casual jugando un partido de fútbol 
                en Edimburgo. Ambos llevaban la camiseta del Betis ese día, lo que marcó el inicio de una 
                gran amistad. La idea de crear la peña surgió más tarde mientras tomaban algo en un pub, 
                y así nació &ldquo;No busques más que no hay&rdquo;.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Referencias Online */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-12">🌐 Referencias Online</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {references.map((ref, index) => (
              <ReferenceCard
                key={index}
                title={ref.title}
                url={ref.url}
                source={ref.source}
                date={ref.date}
                description={ref.description}
                preview={ref.preview}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Presencia en Medios */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-8">📺 Presencia en Medios</h2>
          
          <div className="bg-white rounded-lg shadow-md p-8">
            <p className="text-lg text-gray-700 mb-6">
              Nuestra peña ha sido reconocida oficialmente por LaLiga y el Real Betis como 
              representante del beticismo en Escocia.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="bg-betis-green text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  📰
                </div>
                <h4 className="font-semibold mb-2">LaLiga</h4>
                <p className="text-sm text-gray-600">Entrevista oficial en 2018</p>
              </div>
              
              <div className="text-center">
                <div className="bg-betis-green text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  📱
                </div>
                <h4 className="font-semibold mb-2">Redes Sociales</h4>
                <p className="text-sm text-gray-600">Presencia activa en Facebook e Instagram</p>
              </div>
              
              <div className="text-center">
                <div className="bg-betis-green text-white rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-3">
                  🏟️
                </div>
                <h4 className="font-semibold mb-2">Real Betis</h4>
                <p className="text-sm text-gray-600">Reconocimiento oficial del club</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-betis-green text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-4">¿Quieres saber más?</h2>
          <p className="text-xl mb-8 opacity-90">
            Síguenos en redes sociales o ven a conocernos en persona
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="https://www.facebook.com/groups/beticosenescocia/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-betis-gold text-betis-dark px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-400 transition-colors duration-200"
            >
              📘 Facebook
            </a>
            <a
              href="https://www.instagram.com/rbetisescocia/"
              target="_blank"
              rel="noopener noreferrer"
              className="bg-white/20 backdrop-blur-sm border border-white/30 px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/30 transition-colors duration-200"
            >
              📸 Instagram
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}
