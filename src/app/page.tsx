import Link from 'next/link';
import dynamic from 'next/dynamic';
import HeroCommunity from '@/components/HeroCommunity';
import { FeatureWrapper } from '@/lib/featureProtection';

// Lazy load widgets that are below the fold for better LCP
const UpcomingMatchesWidget = dynamic(() => import('@/components/UpcomingMatchesWidget'), {
  loading: () => (
    <div className="bg-white rounded-lg shadow-lg p-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-48 mb-6"></div>
      <div className="space-y-4">
        <div className="border border-gray-200 rounded-lg p-4">
          <div className="h-4 bg-gray-200 rounded w-24 mb-3"></div>
          <div className="flex items-center justify-center space-x-4">
            <div className="h-6 bg-gray-200 rounded flex-1"></div>
            <div className="h-6 w-12 bg-gray-200 rounded"></div>
            <div className="h-6 bg-gray-200 rounded flex-1"></div>
          </div>
        </div>
      </div>
    </div>
  ),
});

const ClassificationWidget = dynamic(() => import('@/components/ClassificationWidget'), {
  loading: () => (
    <div className="bg-white rounded-lg shadow-lg p-6 animate-pulse">
      <div className="h-6 bg-gray-200 rounded w-32 mb-6"></div>
      <div className="space-y-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="flex items-center space-x-3">
            <div className="h-4 w-6 bg-gray-200 rounded"></div>
            <div className="h-4 flex-1 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    </div>
  ),
});

export default function Home() {
  
  return (
    <>
      <HeroCommunity />
      
      {/* Upcoming Matches and Classification Widgets */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Upcoming Matches */}
            <div className="lg:col-span-3">
              <FeatureWrapper feature="show-partidos">
                <UpcomingMatchesWidget className="" />
              </FeatureWrapper>
            </div>
            
            {/* Classification */}
            <div className="lg:col-span-1">
              <FeatureWrapper feature="show-clasificacion">
                <ClassificationWidget className="" />
              </FeatureWrapper>
            </div>
          </div>
        </div>
      </section>

      {/* Join Us CTA */}
      <section className="py-20 bg-gradient-to-br from-betis-verde via-betis-verde-dark to-scotland-navy text-white relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        {/* Text readability overlay */}
        <div className="absolute inset-0 bg-black/20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-betis-verde backdrop-blur-sm mb-8">
            <span className="text-white font-medium text-sm">🏴󠁧󠁢󠁳󠁣󠁴󠁿 Bienvenidos a Escocia</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 lg:mb-6 text-white drop-shadow-2xl">
            ¿Estás de visita en Escocia?
          </h2>
          
          <p className="text-lg sm:text-xl lg:text-2xl mb-3 lg:mb-4 font-semibold text-betis-oro drop-shadow-xl">
            ¡Únete a nosotros en The Polwarth Tavern!
          </p>
          
          <p className="text-base sm:text-lg mb-8 lg:mb-12 max-w-3xl mx-auto text-white font-medium leading-relaxed drop-shadow-xl">
            Todos los béticos son bienvenidos. No importa de dónde vengas, 
            aquí tienes una familia que comparte tu pasión por el Betis.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <Link
              href="/unete"
              className="bg-betis-oro hover:bg-betis-oro-dark text-betis-dark px-10 py-5 rounded-2xl font-black text-xl shadow-2xl transition-all duration-300 transform hover:scale-105 group"
            >
              <span className="flex items-center">
                💬 Únete
              </span>
            </Link>
            
            <FeatureWrapper feature="show-social-media">
              <a
                href="https://www.facebook.com/groups/beticosenescocia/"
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-blue-600 backdrop-blur-sm hover:bg-blue-700 px-10 py-5 rounded-2xl font-bold text-xl text-white hover:text-betis-oro transition-all duration-300 transform hover:scale-105"
              >
                <span className="flex items-center">
                  📘 Facebook
                </span>
              </a>
              
              <a
                href="https://www.youtube.com/beticosenescocia"
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-red-600 backdrop-blur-sm hover:bg-red-700 px-10 py-5 rounded-2xl font-bold text-xl text-white hover:text-betis-oro transition-all duration-300 transform hover:scale-105"
              >
                <span className="flex items-center">
                  📺 YouTube
                </span>
              </a>
            </FeatureWrapper>
          </div>
          
          {/* Contact info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="bg-betis-verde backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-bold mb-3 text-betis-oro">📍 Ubicación</h3>
                <p className="text-sm text-gray-200">
                  The Polwarth Tavern<br />
                  35 Polwarth Cres<br />
                  Edinburgh EH11 1HR
                </p>
              </div>
              
              <div className="bg-betis-verde backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-bold mb-3 text-betis-oro">⏰ Horarios</h3>
                <p className="text-sm text-gray-200">
                  15 min antes del evento<br />
                  Todos los eventos<br />
                  Fútbol, reuniones, celebraciones
                </p>
              </div>
              
              <div className="bg-betis-verde backdrop-blur-sm rounded-2xl p-6 border border-white/10">
                <h3 className="text-lg font-bold mb-3 text-betis-oro">💚 Ambiente</h3>
                <p className="text-sm text-gray-200">
                  100% bético<br />
                  Familiar y acogedor<br />
                  Cervezas frías garantizadas
                </p>
              </div>
            </div>
        </div>
      </section>
    </>
  );
}
