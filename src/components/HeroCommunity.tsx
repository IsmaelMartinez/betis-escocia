'use client';

import Link from 'next/link';
import { MapPin, Users, Heart, Coffee, Smile } from 'lucide-react';
import { FeatureWrapper } from '@/lib/featureProtection';
import dynamic from 'next/dynamic';

// Lazy load components that are below the fold
const CommunityStats = dynamic(() => import('./CommunityStats'), {
  loading: () => (
    <div className="bg-gray-50 rounded-lg p-6 text-center border border-gray-200 animate-pulse">
      <div className="grid grid-cols-3 gap-4 mb-4">
        <div>
          <div className="h-8 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
        <div>
          <div className="h-8 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
        <div>
          <div className="h-8 bg-gray-200 rounded mb-2"></div>
          <div className="h-4 bg-gray-200 rounded"></div>
        </div>
      </div>
      <div className="h-4 bg-gray-200 rounded"></div>
    </div>
  ),
});

export default function HeroCommunity() {
  return (
    <section className="relative min-h-screen bg-white overflow-hidden">
      {/* Clean, professional background inspired by official site */}
      <div className="absolute inset-0">
        {/* Main green section - inspired by Betis official */}
        <div className="absolute inset-0 bg-gradient-to-b from-white via-gray-50 to-betis-green/5"></div>
        
        {/* Subtle pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2300A651'%3E%3Ccircle cx='20' cy='20' r='1'/%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Header section - inspired by Betis official layout */}
        <div className="text-center mb-16">
          {/* Official-style badge */}
          <div className="inline-flex items-center px-8 py-4 rounded-lg bg-betis-green text-white mb-8 font-bold text-lg shadow-lg">
            <Users className="h-6 w-6 mr-3" />
            <span>PEÑA BÉTICA ESCOCESA</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          {/* Left side - Main message in official style */}
          <div>
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-black mb-6 lg:mb-8 leading-tight text-betis-black">
              <span className="block">MÁS QUE</span>
              <span className="block text-betis-green">UNA PEÑA</span>
              <span className="block text-gray-600 text-2xl sm:text-3xl md:text-4xl lg:text-5xl mt-2 lg:mt-4">UNA FAMILIA</span>
            </h1>
            
            {/* Official-style description box */}
            <div className="bg-white rounded-lg p-6 lg:p-8 mb-6 lg:mb-8 border-l-4 border-betis-green shadow-lg">
              <p className="text-lg lg:text-xl leading-relaxed text-gray-700 mb-4 lg:mb-6">
                <strong className="text-betis-green">Más de 14 años</strong> compartiendo la pasión por el Betis desde Edimburgo. 
                Aquí encontrarás <strong className="text-betis-green">amigos de verdad</strong>, momentos únicos 
                y el cariño de una comunidad que te acoge como en casa.
              </p>
              <p className="text-base lg:text-lg text-gray-600">
                Ya seas de Sevilla, de cualquier parte de España, o incluso escocés... 
                si llevas el Betis en el corazón, <strong className="text-betis-green">ya eres de los nuestros</strong>.
              </p>
            </div>

            {/* Key features - official card style */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 lg:gap-6 mb-6 lg:mb-8">
              <div className="group bg-white rounded-lg p-6 border border-gray-200 hover:border-betis-green hover:shadow-lg transition-all duration-300 shadow-sm transform hover:-translate-y-1 animate-fade-in-up" style={{animationDelay: '0.1s'}}>
                <Coffee className="h-8 w-8 text-betis-green mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="font-bold text-betis-black mb-2 text-lg">AMBIENTE FAMILIAR</h3>
                <p className="text-sm text-gray-600">Niños bienvenidos, ambiente relajado y acogedor</p>
              </div>
              <div className="group bg-white rounded-lg p-6 border border-gray-200 hover:border-betis-green hover:shadow-lg transition-all duration-300 shadow-sm transform hover:-translate-y-1 animate-fade-in-up" style={{animationDelay: '0.2s'}}>
                <Smile className="h-8 w-8 text-betis-green mb-4 group-hover:scale-110 transition-transform duration-300" />
                <h3 className="font-bold text-betis-black mb-2 text-lg">SIEMPRE CON HUMOR</h3>
                <p className="text-sm text-gray-600">Ganemos o perdamos, aquí se ríe y se disfruta</p>
              </div>
            </div>

{/* CTA buttons - official style */}
          <FeatureWrapper feature="showUnete">
            <div className="flex flex-col sm:flex-row gap-4">
              <Link 
                href="/unete"
                className="group bg-betis-green hover:bg-betis-green-dark text-white px-8 py-4 rounded-lg font-bold text-lg transition-all duration-300 transform hover:scale-105 hover:shadow-2xl hover:shadow-betis-green/25 flex items-center justify-center shadow-lg"
              >
                <Heart className="mr-3 h-5 w-5 group-hover:animate-pulse" />
                <span className="relative overflow-hidden">
                  ÚNETE A LA FAMILIA
                </span>
              </Link>
            </div>
          </FeatureWrapper>
          </div>

          {/* Right side - Community showcase in official style */}
          <div className="relative">
            {/* Main community card */}
            <div className="bg-white rounded-lg p-8 shadow-xl border border-gray-200">
              <div className="text-center mb-8">
                <h3 className="text-2xl font-bold text-betis-black mb-4 uppercase tracking-wide">NUESTROS MOMENTOS</h3>
                
                {/* Photo grid in official style */}
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="bg-betis-green/10 rounded-lg aspect-square flex items-center justify-center border border-betis-green/20">
                    <div className="text-center">
                      <span className="text-4xl mb-2 block">📸</span>
                      <span className="text-betis-green text-sm font-bold">CELEBRACIONES</span>
                    </div>
                  </div>
                  <div className="bg-gray-100 rounded-lg aspect-square flex items-center justify-center border border-gray-200">
                    <div className="text-center">
                      <span className="text-4xl mb-2 block">🍺</span>
                      <span className="text-gray-600 text-sm font-bold">ANTES DEL PARTIDO</span>
                    </div>
                  </div>
                  <div className="bg-gray-100 rounded-lg aspect-square flex items-center justify-center border border-gray-200">
                    <div className="text-center">
                      <span className="text-4xl mb-2 block">⚽</span>
                      <span className="text-gray-600 text-sm font-bold">CADA PARTIDO</span>
                    </div>
                  </div>
                  <div className="bg-betis-green/10 rounded-lg aspect-square flex items-center justify-center border border-betis-green/20">
                    <div className="text-center">
                      <span className="text-4xl mb-2 block">🎉</span>
                      <span className="text-betis-green text-sm font-bold">FAMÍLIA BÉTICA</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Stats section - official style */}
              <CommunityStats />
            </div>

            {/* Floating Betis element */}
            <div className="absolute -top-4 -right-4 bg-betis-green rounded-full p-4 shadow-lg">
              <Heart className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        {/* Bottom section - official style info bar */}
        <div className="mt-20">
          <div className="bg-betis-green rounded-lg p-8 text-white text-center">
            <div className="max-w-4xl mx-auto">
              <h3 className="text-xl font-bold mb-4 uppercase tracking-wide">
                📍 POLWARTH TAVERN - NUESTRO HOGAR EN EDIMBURGO
              </h3>
              <p className="text-betis-green-light mb-4 text-lg">
                Cada partido es una excusa perfecta para juntarnos, reír y disfrutar del Betis en buena compañía.
              </p>
              <div className="text-sm opacity-90">
                <MapPin className="inline h-4 w-4 mr-2" />
                35 Polwarth Cresace, Edinburgh EH11 1HR
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
