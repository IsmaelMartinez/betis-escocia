import Link from 'next/link';
import { Calendar, Camera } from 'lucide-react';

export default function Galeria() {
  // Mock gallery data - in a real app, this would come from a database or CMS
  const photoGalleries = [
    {
      id: 'copa-rey-2022',
      title: 'Copa del Rey 2022',
      date: '23 Abril 2022',
      description: 'La celebración más épica en el Polwarth. Cuando ganamos la Copa del Rey.',
      coverImage: '/images/gallery/copa-rey-cover.jpg',
      photoCount: 45,
      category: 'celebration',
      highlight: true
    },
    {
      id: 'sevilla-derby-2023',
      title: 'Derby vs Sevilla',
      date: '15 Octubre 2023',
      description: 'El derby más intenso vivido en Edinburgh. Ambiente increíble.',
      coverImage: '/images/gallery/derby-cover.jpg',
      photoCount: 32,
      category: 'match'
    },
    {
      id: 'navidad-2023',
      title: 'Cena de Navidad 2023',
      date: '16 Diciembre 2023',
      description: 'Nuestra tradicional cena navideña. Familia bética reunida.',
      coverImage: '/images/gallery/navidad-cover.jpg',
      photoCount: 28,
      category: 'social'
    },
    {
      id: 'nuevos-miembros',
      title: 'Nuevos Béticos',
      date: 'Varios',
      description: 'Fotos de bienvenida a todos los nuevos miembros de nuestra familia.',
      coverImage: '/images/gallery/nuevos-cover.jpg',
      photoCount: 67,
      category: 'welcome'
    },
    {
      id: 'champions-2024',
      title: 'Conference League 2024',
      date: '8 Mayo 2024',
      description: 'Viviendo la Conference League desde Edinburgh. Emociones a flor de piel.',
      coverImage: '/images/gallery/conference-cover.jpg',
      photoCount: 38,
      category: 'match'
    },
    {
      id: 'verano-2024',
      title: 'Reuniones de Verano',
      date: 'Julio 2024',
      description: 'Siguiendo al Betis en pretemporada. Incluso en verano somos familia.',
      coverImage: '/images/gallery/verano-cover.jpg',
      photoCount: 24,
      category: 'social'
    }
  ];

  const categoryColors = {
    celebration: 'bg-yellow-100 text-yellow-800',
    match: 'bg-betis-green/10 text-betis-green',
    social: 'bg-blue-100 text-blue-800',
    welcome: 'bg-purple-100 text-purple-800'
  };

  const categoryNames = {
    celebration: 'Celebración',
    match: 'Partidos',
    social: 'Social',
    welcome: 'Bienvenidas'
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-betis-green via-betis-green-dark to-betis-black text-white py-20 relative">
        {/* Background overlay for better text readability */}
        <div className="absolute inset-0 bg-black/20"></div>
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-betis-gold/30 border border-betis-gold/50 backdrop-blur-sm mb-8">
            <span className="text-betis-gold font-bold text-lg">📸 Nuestros momentos</span>
          </div>
          
          <h1 className="text-4xl sm:text-6xl font-black mb-6 text-white drop-shadow-xl">
            Galería
          </h1>
          
          <p className="text-xl sm:text-2xl mb-6 font-bold text-betis-gold drop-shadow-lg">
            Los mejores momentos de nuestra familia bética
          </p>
          
          <p className="text-lg max-w-3xl mx-auto text-white/95 leading-relaxed font-medium">
            Cada foto cuenta una historia. Cada sonrisa refleja la pasión que compartimos. 
            Aquí están nuestros recuerdos más preciados.
          </p>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              <div className="text-3xl font-black text-betis-green mb-2">234</div>
              <div className="text-gray-700 font-medium">Fotos totales</div>
            </div>
            <div className="text-center bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              <div className="text-3xl font-black text-betis-green mb-2">6</div>
              <div className="text-gray-700 font-medium">Álbumes</div>
            </div>
            <div className="text-center bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              <div className="text-3xl font-black text-betis-green mb-2">50+</div>
              <div className="text-gray-700 font-medium">Béticos fotografiados</div>
            </div>
            <div className="text-center bg-white rounded-2xl p-6 shadow-lg border border-gray-200">
              <div className="text-3xl font-black text-betis-green mb-2">3</div>
              <div className="text-gray-700 font-medium">Años de recuerdos</div>
            </div>
          </div>
        </div>
      </section>

      {/* Gallery Grid */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <div className="inline-block bg-betis-green text-white px-6 py-3 rounded-lg font-bold text-lg mb-6 uppercase tracking-wide">
              📚 NUESTROS ÁLBUMES
            </div>
            <h2 className="text-4xl sm:text-5xl font-black text-gray-900 mb-6 uppercase">
              MOMENTOS INOLVIDABLES
            </h2>
            <p className="text-xl text-gray-800 max-w-3xl mx-auto leading-relaxed">
              Haz clic en cualquier álbum para ver todas las fotos
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {photoGalleries.map((gallery) => (
              <div 
                key={gallery.id} 
                className={`bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden transform hover:scale-105 transition-all duration-300 hover:shadow-xl ${
                  gallery.highlight ? 'ring-2 ring-betis-gold ring-opacity-50' : ''
                }`}
              >
                {/* Gallery Cover */}
                <div className="relative h-48 bg-gray-200 flex items-center justify-center">
                  {/* Placeholder for image */}
                  <div className="text-center text-gray-400">
                    <Camera className="h-12 w-12 mx-auto mb-2" />
                    <p className="text-sm">Imagen próximamente</p>
                  </div>
                  
                  {/* Photo count badge */}
                  <div className="absolute top-4 right-4 bg-black/70 text-white px-3 py-1 rounded-full text-sm font-semibold">
                    {gallery.photoCount} fotos
                  </div>
                  
                  {/* Highlight badge */}
                  {gallery.highlight && (
                    <div className="absolute top-4 left-4 bg-betis-gold text-gray-900 px-3 py-1 rounded-full text-sm font-bold">
                      ⭐ Destacado
                    </div>
                  )}
                </div>

                {/* Gallery Info */}
                <div className="p-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className={`inline-block px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wide ${
                      categoryColors[gallery.category as keyof typeof categoryColors]
                    }`}>
                      {categoryNames[gallery.category as keyof typeof categoryNames]}
                    </span>
                    <div className="flex items-center text-gray-600 text-sm font-medium">
                      <Calendar className="h-4 w-4 mr-1" />
                      {gallery.date}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {gallery.title}
                  </h3>
                  
                  <p className="text-gray-800 text-sm leading-relaxed mb-4 font-medium">
                    {gallery.description}
                  </p>
                  
                  <button className="w-full bg-betis-green hover:bg-betis-green-dark text-white px-4 py-3 rounded-xl font-semibold transition-all duration-300 flex items-center justify-center">
                    <span>Ver álbum</span>
                    <svg className="ml-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Coming Soon */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="bg-white rounded-2xl p-8 shadow-lg border border-gray-200">
            <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center justify-center">
              <Camera className="h-6 w-6 text-betis-green mr-3" />
              📱 ¿Tienes fotos de la peña?
            </h2>
            <p className="text-gray-800 mb-6 leading-relaxed font-medium">
              Si tienes fotos de algún partido o evento de la peña, ¡compártelas con nosotros! 
              Nos encanta tener recuerdos de todos los momentos que vivimos juntos.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <a
                href="https://www.facebook.com/groups/beticosenescocia/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-betis-green hover:bg-betis-green-dark text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300"
              >
                📘 Compartir en Facebook
              </a>
              <a
                href="https://www.instagram.com/beticosenescocia/"
                target="_blank"
                rel="noopener noreferrer"
                className="border-2 border-betis-green text-betis-green hover:bg-betis-green hover:text-white px-6 py-3 rounded-xl font-semibold transition-all duration-300"
              >
                📸 Etiquétanos en Instagram
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Next Events */}
      <section className="py-20 bg-gradient-to-r from-betis-green to-betis-green-dark text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-black mb-6">
            🎬 Próximas sesiones de fotos
          </h2>
          <p className="text-xl mb-8 opacity-90">
            No te pierdas los próximos partidos. Siempre hay momentos únicos que capturar.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/partidos"
              className="bg-betis-gold hover:bg-betis-gold-dark text-betis-black px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105"
            >
              📅 Ver próximos partidos
            </Link>
            <Link
              href="/"
              className="border-2 border-white text-white hover:bg-white hover:text-betis-green px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105"
            >
              🏠 Volver al inicio
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
