'use client';

import Link from 'next/link';
import { MapPin, Calendar, Users } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative bg-gradient-to-br from-betis-green to-emerald-600 text-white">
      <div className="absolute inset-0 bg-black/20"></div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <div className="text-center">
          {/* Main heading */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold mb-6">
            <span className="block">¡Viva er Betis!</span>
            <span className="block text-betis-gold text-3xl sm:text-4xl lg:text-5xl mt-2">
              manque pierda
            </span>
          </h1>
          
          {/* Subtitle */}
          <p className="text-xl sm:text-2xl mb-8 max-w-3xl mx-auto opacity-90">
            La peña del Real Betis en Edimburgo, Escocia
          </p>
          
          <p className="text-lg mb-12 max-w-2xl mx-auto opacity-80">
            Nos reunimos en el Polwarth Tavern para cada partido. 
            Si estás de visita en Escocia, ¡únete a nosotros!
          </p>

          {/* Key features */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
            <div className="flex flex-col items-center">
              <div className="bg-white/20 rounded-full p-4 mb-4">
                <MapPin className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Polwarth Tavern</h3>
              <p className="text-sm opacity-80">Nuestro hogar en Edimburgo</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="bg-white/20 rounded-full p-4 mb-4">
                <Calendar className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Cada Partido</h3>
              <p className="text-sm opacity-80">No nos perdemos ni uno</p>
            </div>
            
            <div className="flex flex-col items-center">
              <div className="bg-white/20 rounded-full p-4 mb-4">
                <Users className="h-8 w-8" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Todos Bienvenidos</h3>
              <p className="text-sm opacity-80">Especialmente visitantes</p>
            </div>
          </div>

          {/* Call to action buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              href="/porra"
              className="bg-betis-gold text-betis-dark px-8 py-4 rounded-lg font-bold text-lg hover:bg-yellow-400 transition-colors duration-200 shadow-lg"
            >
              🎲 La Porra de Fran
            </Link>
            
            <Link 
              href="/unete"
              className="bg-white/20 backdrop-blur-sm border border-white/30 px-8 py-4 rounded-lg font-bold text-lg hover:bg-white/30 transition-colors duration-200"
            >
              Únete a nosotros
            </Link>
          </div>
        </div>
      </div>

      {/* Next match preview */}
      <div className="relative bg-black/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <h2 className="text-xl font-bold mb-4">Próximo Partido</h2>
            <div className="bg-white/20 backdrop-blur-sm rounded-lg p-6 max-w-md mx-auto">
              <p className="text-lg font-semibold">Real Betis vs Sevilla FC</p>
              <p className="text-betis-gold">15 Julio, 20:00</p>
              <p className="text-sm mt-2 opacity-80">Nos vemos en Polwarth Tavern a las 19:30</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
