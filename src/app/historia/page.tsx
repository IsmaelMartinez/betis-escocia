import React from 'react';
import Link from 'next/link';
import { isFeatureEnabled } from '@/lib/flags';

export default function HistoriaPage() {
  if (!isFeatureEnabled('show-history')) {
    return null;
  }
  return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-white py-8">
        <div className="container mx-auto px-4 max-w-4xl">
          {/* Header */}
          <div className="text-center mb-12">
            <h1 className="text-4xl font-bold text-green-800 mb-4">
              Historia de la Peña Bética Escocesa
            </h1>
            <p className="text-xl text-gray-600 mb-2">
              &quot;No busques más que no hay&quot;
            </p>
            <p className="text-lg text-gray-500">
              La primera peña oficial del Real Betis en el Reino Unido
            </p>
          </div>

          {/* Foundation Story */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8 border-l-4 border-green-500">
            <h2 className="text-2xl font-bold text-green-800 mb-4 flex items-center">
              <span className="mr-3">🏴󠁧󠁢󠁳󠁣󠁴󠁿</span>
              Los Orígenes (2010)
            </h2>
            <div className="space-y-4">
              <p className="text-gray-700 leading-relaxed">
                La Peña Bética Escocesa &quot;No busques más que no hay&quot; se fundó el{' '}
                <strong>4 de diciembre de 2010</strong> en Edimburgo, Escocia, 
                convirtiéndose en la primera peña oficial del Real Betis en el Reino Unido.
              </p>
              
              <p className="text-gray-700 leading-relaxed">
                La historia comenzó de manera fortuita cuando{' '}
                <strong>Juan Morata</strong> y <strong>José María Conde</strong> se encontraron 
                jugando un partido de fútbol casual en Edimburgo. Ambos habían elegido ponerse 
                la camiseta del Betis ese día, y ese fue el comienzo de una gran amistad bética.
              </p>

              <div className="bg-green-50 p-4 rounded-lg border-l-4 border-green-400">
                <p className="text-green-800 font-medium italic">
                  &quot;La idea de crear el club de fans vino tomando algo en un pub. 
                  Simplemente lo decidieron así. ¡Literalmente!&quot;
                </p>
                <p className="text-green-600 text-sm mt-2">- Fuente: LaLiga oficial</p>
              </div>

              <p className="text-gray-700 leading-relaxed">
                Como colofón divertido, la ceremonia de celebración tuvo la canción de{' '}
                <strong>Silvio &quot;Betis&quot;</strong> en voz alta, y las letras inspiraron 
                parte del nombre de la peña: <em>&quot;No busques más que no hay&quot;</em>.
              </p>
            </div>
          </div>

          {/* Timeline */}
          <div className="bg-white rounded-lg shadow-md p-6 mb-8">
            <h2 className="text-2xl font-bold text-green-800 mb-6 flex items-center">
              <span className="mr-3">📅</span>
              Cronología de la Peña
            </h2>
            <div className="space-y-6">
              {[
                { 
                  year: '2010', 
                  title: 'Fundación Histórica', 
                  description: '4 de diciembre - Juan Morata y José María Conde fundan la peña en Edimburgo. El Betis se encontraba en Segunda División, y los partidos no se retransmitían en ningún sitio en la ciudad.' 
                },
                { 
                  year: '2011', 
                  title: 'El Ascenso que Cambió Todo', 
                  description: 'El ascenso del Betis a Primera División permite que la peña empiece a tomar forma con sede en The Cuckoo\'s Nest. Los partidos ahora se pueden ver en televisión.' 
                },
                { 
                  year: '2013', 
                  title: 'José Mari al Mando', 
                  description: 'Juan regresa a España por motivos profesionales. José María Conde queda como presidente único, cargo que mantiene hasta hoy.' 
                },
                { 
                  year: '2015', 
                  title: 'Nueva Casa en Polwarth', 
                  description: 'Tras el nuevo ascenso del Betis y problemas con The Cuckoo\'s Nest, la peña encuentra su sede actual: Polwarth Tavern, donde han visto todos los partidos desde entonces.' 
                },
                { 
                  year: '2018', 
                  title: 'Reconocimiento de LaLiga', 
                  description: 'LaLiga reconoce oficialmente a la peña en su portal, destacando su papel como "bastión" del betismo en Escocia.' 
                },
                { 
                  year: '2021', 
                  title: 'ABC nos Destaca', 
                  description: 'ABC Sevilla publica un reportaje sobre la peña como "embajada que recibe a los suyos en Escocia", con motivo del partido Celtic-Betis en Europa League.' 
                }
              ].map((item) => (
                <div key={item.year} className="flex items-start space-x-4">
                  <div className="bg-green-500 text-white rounded-full w-12 h-12 flex items-center justify-center font-bold">
                    {item.year}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-semibold text-green-800 text-lg">{item.title}</h3>
                    <p className="text-gray-700 mt-1">{item.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

      {/* External Links */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <h2 className="text-3xl font-bold mb-4">Enlaces de interés</h2>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold text-green-700">Redes Sociales</h3>
              <ul className="space-y-1">
                <li>
                  <Link href="https://x.com/rbetisescocia" target="_blank" className="text-blue-600 hover:underline">
                    X (Twitter): @rbetisescocia
                  </Link>
                </li>
                <li>
                  <Link href="https://beticosenescocia.blogspot.com/" target="_blank" className="text-blue-600 hover:underline">
                    Beticos en Escocia Blog
                  </Link>
                </li>
              </ul>
            </div>
            <div className="space-y-2">
              <h3 className="font-semibold text-green-700">Reconocimientos</h3>
              <ul className="space-y-1">
                <li>
                  <Link href="https://www.laliga.com/noticias/conoce-a-la-pena-betica-de-escocia-no-busques-mas-que-no-hay" target="_blank" className="text-blue-600 hover:underline">
                    LaLiga: Conoce a la Peña Bética de Escocia
                  </Link>
                </li>
                <li>
                  <Link href="https://www.abc.es/deportes/alfinaldelapalmera/noticias-betis/sevi-pena-betica-no-busques-mas-no-embajada-recibe-suyos-escocia-202112091615_noticia.html" target="_blank" className="text-blue-600 hover:underline">
                    ABC: Peña Bética Escocesa en Escocia
                  </Link>
                </li>
                <li>
                  <Link href="https://www.betisweb.com/foro/principal/betis-fan-s-of-the-universe/6621126-pena-betica-escocesa-no-busques-mas-que-no-hay" target="_blank" className="text-blue-600 hover:underline">
                    BetisWeb: Foro de la Peña
                  </Link>
                </li>
                <li>
                  <Link href="https://www.manquepierda.com/blog/la-aficion-del-betis-objetivo-elogios/" target="_blank" className="text-blue-600 hover:underline">
                    Manquepierda: La afición del Betis
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <section className="py-8">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <div className="bg-green-50 rounded-lg p-6">
            <p className="text-green-800 font-semibold mb-2">
              ¡Tú podrías ser el/la siguiente, anímate a conocernos!
            </p>
            <p className="text-gray-600 text-sm">
              Os esperamos en Polwarth Tavern para cada partido del Betis.
            </p>
          </div>
        </div>
      </section>
        </div>
      </div>
  );
}

