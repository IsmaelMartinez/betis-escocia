'use client';

import Link from 'next/link';
import { MapPin, Users, Play, Heart, Star } from 'lucide-react';

export default function HeroSocial() {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-gray-900 via-betis-black to-betis-green-dark text-white overflow-hidden">
      {/* Dark social media inspired background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/95 via-betis-black/90 to-betis-green-dark/80"></div>
        {/* Grid pattern */}
        <div className="absolute inset-0 opacity-5" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff'%3E%3Crect width='1' height='1'/%3E%3C/g%3E%3C/svg%3E")`,
          backgroundSize: '40px 40px'
        }}></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Social badge */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-gradient-to-r from-purple-500/20 to-pink-500/20 border border-betis-gold/30 mb-8 backdrop-blur-sm">
            <svg className="h-5 w-5 mr-3 text-betis-gold" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
            </svg>
            <span className="text-betis-gold font-bold">#PeñaBéticaEscocia</span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-center">
          {/* Left: Social media feed mockup */}
          <div className="space-y-6">
            <h1 className="text-4xl sm:text-5xl font-black mb-8 leading-tight">
              <span className="block text-white">Vivimos cada</span>
              <span className="block text-betis-gold">momento juntos</span>
            </h1>

            {/* Social posts mockup */}
            <div className="space-y-4">
              {/* Post 1 */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                <div className="flex items-center mb-4">
                  <div className="bg-betis-green rounded-full w-10 h-10 flex items-center justify-center mr-3">
                    <Heart className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">Peña Bética Escocia</div>
                    <div className="text-gray-400 text-sm">@rbetisescocia</div>
                  </div>
                </div>
                
                <div className="bg-betis-green/10 rounded-xl p-4 mb-4 border border-betis-green/20">
                  <div className="text-center text-6xl mb-2">🎉</div>
                  <p className="text-center text-sm text-gray-300">
                    Momento de celebración después del gol
                  </p>
                </div>
                
                <p className="text-gray-300 mb-3">
                  ¡GOOOOOL! Así se celebra en el Polwarth Tavern. 
                  La familia bética de Edimburgo siempre unida 💚
                </p>
                
                <div className="flex items-center space-x-6 text-gray-400 text-sm">
                  <span className="flex items-center">
                    <Heart className="h-4 w-4 mr-1" /> 47 likes
                  </span>
                  <span>15 comentarios</span>
                </div>
              </div>

              {/* Post 2 */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-6 border border-gray-700/50">
                <div className="flex items-center mb-4">
                  <div className="bg-betis-gold rounded-full w-10 h-10 flex items-center justify-center mr-3">
                    <Users className="h-5 w-5 text-betis-black" />
                  </div>
                  <div>
                    <div className="text-white font-semibold">Javi desde Sevilla</div>
                    <div className="text-gray-400 text-sm">Visitante</div>
                  </div>
                </div>
                
                <p className="text-gray-300 mb-3">
                  &ldquo;Pensé que iba a ver el partido solo en mi hotel. 
                  La peña me acogió como familia. ¡Volveré seguro!&rdquo;
                </p>
                
                <div className="flex items-center space-x-1 mb-3">
                  {[1,2,3,4,5].map((star) => (
                    <Star key={star} className="h-4 w-4 text-betis-gold fill-current" />
                  ))}
                  <span className="text-gray-400 text-sm ml-2">Experiencia perfecta</span>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Community highlights */}
          <div className="space-y-8">
            <div className="text-center">
              <h2 className="text-3xl font-bold text-white mb-6">
                Más que seguidores,
                <br />
                <span className="text-betis-gold">somos familia</span>
              </h2>
              
              <p className="text-xl text-gray-300 mb-8">
                Cada foto cuenta una historia. Cada historia conecta corazones béticos 
                desde Sevilla hasta Edimburgo.
              </p>
            </div>

            {/* Photo gallery */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              <div className="bg-betis-green/20 rounded-2xl aspect-square flex items-center justify-center border border-betis-green/30">
                <div className="text-center">
                  <span className="text-4xl mb-2 block">📸</span>
                  <span className="text-betis-gold text-sm">Gol del Betis</span>
                </div>
              </div>
              <div className="bg-betis-gold/20 rounded-2xl aspect-square flex items-center justify-center border border-betis-gold/30">
                <div className="text-center">
                  <span className="text-4xl mb-2 block">🍺</span>
                  <span className="text-betis-gold text-sm">Antes del partido</span>
                </div>
              </div>
              <div className="bg-betis-gold/20 rounded-2xl aspect-square flex items-center justify-center border border-betis-gold/30">
                <div className="text-center">
                  <span className="text-4xl mb-2 block">👨‍👩‍👧‍👦</span>
                  <span className="text-betis-gold text-sm">Familias béticas</span>
                </div>
              </div>
              <div className="bg-betis-green/20 rounded-2xl aspect-square flex items-center justify-center border border-betis-green/30">
                <div className="text-center">
                  <span className="text-4xl mb-2 block">🎊</span>
                  <span className="text-betis-gold text-sm">Celebraciones</span>
                </div>
              </div>
            </div>

            {/* Social stats */}
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-2xl p-8 border border-gray-700/50">
              <h3 className="text-xl font-bold text-white mb-6 text-center">Nuestra comunidad online</h3>
              <div className="grid grid-cols-2 gap-6">
                <div className="text-center">
                  <div className="flex items-center justify-center mb-3">
                    <svg className="h-8 w-8 text-blue-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                    </svg>
                  </div>
                  <div className="text-2xl font-black text-betis-gold">500+</div>
                  <div className="text-gray-400 text-sm">Miembros activos</div>
                </div>
                <div className="text-center">
                  <div className="flex items-center justify-center mb-3">
                    <svg className="h-8 w-8 text-pink-400" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                    </svg>
                  </div>
                  <div className="text-2xl font-black text-betis-gold">1K+</div>
                  <div className="text-gray-400 text-sm">Seguidores</div>
                </div>
              </div>
            </div>

            {/* CTA */}
            <div className="text-center">
              <div className="flex flex-col sm:flex-row gap-4">
                <Link 
                  href="/unete"
                  className="bg-gradient-to-r from-betis-gold to-betis-gold-dark hover:from-betis-gold-dark hover:to-betis-gold text-betis-black px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
                >
                  <Heart className="mr-2 h-5 w-5" />
                  Únete a la familia
                </Link>
                <Link 
                  href="/porra"
                  className="border-2 border-betis-gold/30 hover:bg-betis-gold/10 px-8 py-4 rounded-xl font-semibold text-lg transition-all duration-300 flex items-center justify-center"
                >
                  <Play className="mr-2 h-5 w-5" />
                  La Porra
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom social bar */}
        <div className="mt-20 text-center">
          <div className="bg-betis-black/50 backdrop-blur-md rounded-2xl p-8 border border-betis-gold/20">
            <div className="flex items-center justify-center mb-4">
              <MapPin className="h-5 w-5 mr-2 text-betis-gold" />
              <span className="font-bold text-white">Polwarth Tavern, Edinburgh</span>
            </div>
            <p className="text-gray-300 mb-4">
              Siguenos en redes para no perderte ningún momento.{' '}
              <span className="text-betis-gold font-semibold">¡Tag us en tus fotos!</span>
            </p>
            <div className="flex justify-center space-x-4">
              <a
                href="https://www.facebook.com/groups/beticosenescocia/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 hover:bg-blue-700 p-3 rounded-xl transition-colors"
              >
                <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>
              <a
                href="https://www.instagram.com/rbetisescocia/"
                target="_blank"
                rel="noopener noreferrer"
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 p-3 rounded-xl transition-colors"
              >
                <svg className="h-6 w-6 text-white" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.40s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
