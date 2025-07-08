import Link from 'next/link';
import HeroCommunity from '@/components/HeroCommunity';
import { FeatureWrapper } from '@/lib/featureProtection';

export default function Home() {
  
  return (
    <>
      <HeroCommunity />
      
      {/* Join Us CTA */}
      <section className="py-20 bg-gradient-to-br from-betis-green via-betis-green-dark to-betis-black text-white relative overflow-hidden">
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='2'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        {/* Text readability overlay */}
        <div className="absolute inset-0 bg-black/20"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center px-4 py-2 rounded-full bg-betis-gold/20 border border-betis-gold/30 backdrop-blur-sm mb-8">
            <span className="text-betis-gold font-medium text-sm">🏴󠁧󠁢󠁳󠁣󠁴󠁿 Bienvenidos a Escocia</span>
          </div>
          
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-black mb-4 lg:mb-6 text-white drop-shadow-2xl">
            ¿Estás de visita en Escocia?
          </h2>
          
          <p className="text-lg sm:text-xl lg:text-2xl mb-3 lg:mb-4 font-semibold text-betis-gold drop-shadow-xl">
            ¡Únete a nosotros en el Polwarth Tavern!
          </p>
          
          <p className="text-base sm:text-lg mb-8 lg:mb-12 max-w-3xl mx-auto text-white font-medium leading-relaxed drop-shadow-xl">
            Todos los béticos son bienvenidos. No importa de dónde vengas, 
            aquí tienes una familia que comparte tu pasión por el Betis.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-16">
            <FeatureWrapper feature="showUnete">
              <Link
                href="/unete"
                className="btn-betis-gold px-10 py-5 text-xl group"
              >
                <span className="flex items-center">
                  💬 Contáctanos
                  <svg className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </span>
              </Link>
            </FeatureWrapper>
            
            <a
              href="https://www.facebook.com/groups/beticosenescocia/"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white/10 backdrop-blur-sm border-2 border-white/30 hover:bg-white/20 px-10 py-5 rounded-2xl font-bold text-xl text-white hover:text-betis-gold transition-all duration-300 transform hover:scale-105"
            >
              <span className="flex items-center">
                📘 Facebook
                <svg className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </span>
            </a>
            
            <a
              href="https://www.youtube.com/beticosenescocia"
              target="_blank"
              rel="noopener noreferrer"
              className="group bg-white/10 backdrop-blur-sm border-2 border-white/30 hover:bg-white/20 px-10 py-5 rounded-2xl font-bold text-xl text-white hover:text-betis-gold transition-all duration-300 transform hover:scale-105"
            >
              <span className="flex items-center">
                📺 YouTube
                <svg className="ml-2 h-5 w-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </span>
            </a>
          </div>
          
          {/* Contact info */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-bold mb-3 text-betis-gold">📍 Ubicación</h3>
              <p className="text-sm text-gray-200">
                Polwarth Tavern<br />
                15 Polwarth Pl<br />
                Edinburgh EH11 1NH
              </p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-bold mb-3 text-betis-gold">⏰ Horarios</h3>
              <p className="text-sm text-gray-200">
                30 min antes del evento<br />
                Todos los eventos<br />
                Fútbol, reuniones, celebraciones
              </p>
            </div>
            
            <div className="bg-white/5 backdrop-blur-sm rounded-2xl p-6 border border-white/10">
              <h3 className="text-lg font-bold mb-3 text-betis-gold">💚 Ambiente</h3>
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
