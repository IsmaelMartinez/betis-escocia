'use client';

import Link from 'next/link';
import { MapPin, Calendar, Users, Heart } from 'lucide-react';

export default function Hero() {
  return (
    <section className="relative min-h-screen bg-betis-black text-white overflow-hidden">
      {/* Dramatic background with multiple layers */}
      <div className="absolute inset-0">
        {/* Main gradient background */}
        <div className="absolute inset-0 bg-gradient-to-br from-betis-green via-betis-green-dark to-betis-black"></div>
        
        {/* Geometric patterns */}
        <div className="absolute inset-0 opacity-5">
          <div className="absolute inset-0" style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='80' height='80' viewBox='0 0 80 80' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Cpath d='M40 0l40 40-40 40L0 40z'/%3E%3C/g%3E%3C/svg%3E")`,
          }} />
        </div>
        
        {/* Radial overlay for depth */}
        <div className="absolute inset-0 bg-gradient-radial from-transparent via-betis-black/20 to-betis-black/60"></div>
        
        {/* Strong dark overlay for maximum contrast */}
        <div className="absolute inset-0 bg-betis-black/40"></div>
        
        {/* Gold accent spots */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-betis-gold/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 left-1/4 w-64 h-64 bg-betis-gold/3 rounded-full blur-2xl"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-32">
        <div className="text-center">
          {/* Premium badge with stronger contrast */}
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-betis-black/80 border-2 border-betis-gold backdrop-blur-sm mb-12 shadow-2xl">
            <Heart className="h-5 w-5 mr-3 text-betis-gold animate-pulse" />
            <span className="text-betis-gold font-bold text-lg tracking-wide">DESDE SEVILLA A EDIMBURGO</span>
          </div>

          {/* Main heading with maximum impact */}
          <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black mb-8 leading-tight">
            <span className="block text-white drop-shadow-2xl text-shadow-xl">No busques más</span>
            <span className="block text-betis-gold text-5xl sm:text-6xl lg:text-7xl mt-6 drop-shadow-xl animate-pulse">
              que no hay
            </span>
          </h1>
          
          {/* Subtitle with enhanced contrast */}
          <div className="mb-16">
            <p className="text-3xl sm:text-4xl mb-6 font-black text-white drop-shadow-2xl">
              ¡Viva er Betis manque pierda!
            </p>
            <div className="bg-betis-black/60 backdrop-blur-md rounded-2xl p-8 max-w-4xl mx-auto border border-betis-gold/20 shadow-2xl">
              <p className="text-xl sm:text-2xl text-gray-100 leading-relaxed">
                La peña del Real Betis en Edimburgo, Escocia. Nos reunimos en el{' '}
                <span className="text-betis-gold font-bold">Polwarth Tavern</span>{' '}
                para cada partido. Si estás de visita en Escocia,{' '}
                <span className="text-betis-gold font-bold">¡únete a nosotros!</span>
              </p>
            </div>
          </div>

          {/* Feature cards with dramatic black styling */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20 max-w-6xl mx-auto">
            <div className="group bg-betis-black/90 backdrop-blur-md rounded-3xl p-8 border-2 border-betis-gold/30 hover:border-betis-gold hover:bg-betis-black transition-all duration-500 transform hover:scale-105 shadow-2xl">
              <div className="bg-gradient-to-br from-betis-gold to-betis-gold-dark rounded-2xl p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                <MapPin className="h-10 w-10 text-betis-black" />
              </div>
              <h3 className="text-2xl font-black mb-4 text-white group-hover:text-betis-gold transition-colors">Polwarth Tavern</h3>
              <p className="text-gray-300 text-base leading-relaxed">
                Nuestro hogar en Edimburgo. Ambiente auténtico, cervezas frías y la mejor compañía bética para cada partido.
              </p>
            </div>
            
            <div className="group bg-betis-black/90 backdrop-blur-md rounded-3xl p-8 border-2 border-betis-gold/30 hover:border-betis-gold hover:bg-betis-black transition-all duration-500 transform hover:scale-105 shadow-2xl">
              <div className="bg-gradient-to-br from-betis-gold to-betis-gold-dark rounded-2xl p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                <Calendar className="h-10 w-10 text-betis-black" />
              </div>
              <h3 className="text-2xl font-black mb-4 text-white group-hover:text-betis-gold transition-colors">Cada Partido</h3>
              <p className="text-gray-300 text-base leading-relaxed">
                Liga, Copa, Europa... No nos perdemos ni uno. Horarios adaptados perfectamente a Escocia.
              </p>
            </div>
            
            <div className="group bg-betis-black/90 backdrop-blur-md rounded-3xl p-8 border-2 border-betis-gold/30 hover:border-betis-gold hover:bg-betis-black transition-all duration-500 transform hover:scale-105 shadow-2xl">
              <div className="bg-gradient-to-br from-betis-gold to-betis-gold-dark rounded-2xl p-6 w-20 h-20 mx-auto mb-6 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform duration-300">
                <Users className="h-10 w-10 text-betis-black" />
              </div>
              <h3 className="text-2xl font-black mb-4 text-white group-hover:text-betis-gold transition-colors">Todos Bienvenidos</h3>
              <p className="text-gray-300 text-base leading-relaxed">
                Especialmente visitantes. Aquí todos somos béticos, vengas de donde vengas.
              </p>
            </div>
          </div>

          {/* CTA buttons with enhanced modern styling */}
          <div className="flex flex-col sm:flex-row gap-8 justify-center items-center mb-20">            
            <Link 
              href="/unete"
              className="group relative bg-betis-black/90 backdrop-blur-md border-3 border-betis-gold hover:bg-betis-gold hover:text-betis-black px-12 py-6 rounded-3xl font-black text-2xl text-white transition-all duration-500 transform hover:scale-110 shadow-2xl"
            >
              <span className="flex items-center relative z-10">
                Únete a nosotros
                <Users className="ml-3 h-6 w-6 group-hover:scale-125 transition-transform duration-300" />
              </span>
            </Link>

            <Link 
              href="/partidos"
              className="group relative bg-gradient-to-r from-betis-green to-betis-green-dark hover:from-betis-green-dark hover:to-betis-green text-white px-12 py-6 rounded-3xl font-black text-2xl shadow-2xl hover:shadow-betis-green/40 transition-all duration-500 transform hover:scale-110 border-2 border-betis-green"
            >
              <span className="flex items-center relative z-10">
                📅 Ver Partidos
                <Calendar className="ml-3 h-6 w-6 group-hover:translate-x-2 transition-transform duration-300" />
              </span>
              <div className="absolute inset-0 bg-white/20 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </Link>
          </div>

          {/* Social proof with enhanced styling */}
          <div className="border-t-2 border-betis-gold/30 pt-12">
            <p className="text-betis-gold text-xl font-bold mb-6">Síguenos en nuestras redes:</p>
            <div className="flex justify-center space-x-8 mb-8">
              <a
                href="https://www.facebook.com/groups/beticosenescocia/"
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-betis-black/80 hover:bg-blue-600 p-6 rounded-2xl transition-all duration-500 hover:scale-125 shadow-2xl border-2 border-transparent hover:border-blue-400"
              >
                <svg className="w-8 h-8 text-white group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href="https://www.instagram.com/rbetisescocia/"
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-betis-black/80 hover:bg-gradient-to-r hover:from-purple-500 hover:to-pink-500 p-6 rounded-2xl transition-all duration-500 hover:scale-125 shadow-2xl border-2 border-transparent hover:border-pink-400"
              >
                <svg className="w-8 h-8 text-white group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
              <a
                href="https://www.youtube.com/beticosenescocia"
                target="_blank"
                rel="noopener noreferrer"
                className="group bg-betis-black/80 hover:bg-red-600 p-6 rounded-2xl transition-all duration-500 hover:scale-125 shadow-2xl border-2 border-transparent hover:border-red-400"
              >
                <svg className="w-8 h-8 text-white group-hover:text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
                </svg>
              </a>
            </div>
            
            {/* Additional social proof stats */}
            <div className="grid grid-cols-3 gap-6 max-w-2xl mx-auto">
              <div className="text-center">
                <div className="text-3xl font-black text-betis-gold mb-2">15+</div>
                <div className="text-gray-300 text-sm">Años activos</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-betis-gold mb-2">200+</div>
                <div className="text-gray-300 text-sm">Miembros</div>
              </div>
              <div className="text-center">
                <div className="text-3xl font-black text-betis-gold mb-2">100%</div>
                <div className="text-gray-300 text-sm">Bético</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Next match preview - dramatic redesign */}
      <div className="relative bg-gradient-to-r from-betis-black via-betis-green-dark to-betis-black border-t-4 border-betis-gold">
        <div className="absolute inset-0 bg-betis-black/70"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center">
            <div className="inline-flex items-center px-6 py-3 rounded-full bg-betis-gold text-betis-black border-2 border-betis-gold mb-8 font-black shadow-2xl">
              <Calendar className="h-5 w-5 mr-3" />
              <span className="text-lg tracking-wide">PRÓXIMO PARTIDO</span>
            </div>
            
            <div className="bg-betis-black/90 backdrop-blur-md rounded-3xl p-10 max-w-lg mx-auto border-2 border-betis-gold/30 shadow-2xl">
              <h3 className="text-3xl font-black mb-4 text-white">Real Betis vs Sevilla FC</h3>
              <p className="text-betis-gold text-2xl font-black mb-6">15 Julio, 20:00</p>
              <div className="bg-betis-gold/10 rounded-2xl p-6 mb-6 border border-betis-gold/20">
                <div className="flex items-center justify-center text-betis-gold mb-3">
                  <MapPin className="h-5 w-5 mr-3" />
                  <span className="font-bold text-lg">Polwarth Tavern</span>
                </div>
                <p className="text-white text-lg font-semibold">
                  Llegada: 19:30
                </p>
                <p className="text-gray-300 text-sm mt-2">
                  ¡30 minutos antes para asegurar sitio!
                </p>
              </div>
              <div className="bg-betis-gold text-betis-black px-6 py-3 rounded-xl font-black text-lg">
                🔥 ¡EL DERBI SEVILLANO!
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
