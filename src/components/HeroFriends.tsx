'use client';

import Link from 'next/link';
import { MapPin, Users, Play, Heart, MessageCircle, Camera } from 'lucide-react';

export default function HeroFriends() {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-white via-gray-50 to-betis-green/10 text-gray-900 overflow-hidden">
      {/* Light, friendly background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-white/95 via-gray-50/90 to-betis-green/5"></div>
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%2300A651' fill-opacity='0.1'%3E%3Ccircle cx='30' cy='30' r='3'/%3E%3C/g%3E%3C/svg%3E")`,
        }}></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Friends badge */}
        <div className="text-center mb-16">
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-betis-green/10 border-2 border-betis-green/20 mb-8">
            <MessageCircle className="h-5 w-5 mr-3 text-betis-green" />
            <span className="text-betis-green font-bold">Historias de amigos béticos</span>
          </div>
        </div>

        {/* Main content */}
        <div className="text-center mb-20">
          <h1 className="text-5xl sm:text-7xl font-black mb-8 leading-tight">
            <span className="block text-betis-black">Amigos que se hicieron</span>
            <span className="block text-betis-green">familia bética</span>
          </h1>
          
          <div className="max-w-4xl mx-auto mb-16">
            <p className="text-2xl text-gray-700 mb-8 leading-relaxed">
              Empezamos como desconocidos que coincidíamos viendo el Betis. 
              Ahora somos <span className="text-betis-green font-bold">una familia</span> que celebra, 
              sufre y disfruta cada partido juntos.
            </p>
          </div>

          {/* Stories grid */}
          <div className="grid md:grid-cols-3 gap-8 mb-16">
            {/* Story 1 */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
              <div className="bg-betis-green/10 rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <Heart className="h-8 w-8 text-betis-green" />
              </div>
              <h3 className="text-xl font-bold text-betis-black mb-4">
                &ldquo;Llegué solo, encontré hermanos&rdquo;
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Vine de Sevilla por trabajo. En mi primer partido en el Polwarth, 
                ya tenía planes para el siguiente. Aquí encontré mi segunda familia.
              </p>
              <div className="mt-4 text-xs text-betis-green font-semibold">- Javi, de Sevilla</div>
            </div>

            {/* Story 2 */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
              <div className="bg-betis-green/10 rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <Users className="h-8 w-8 text-betis-green" />
              </div>
              <h3 className="text-xl font-bold text-betis-black mb-4">
                &ldquo;Mis hijos crecieron aquí&rdquo;
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                Llevamos 10 años viniendo en familia. Mis hijos ya hablan con acento escocés 
                pero gritan ¡Viva er Betis! como el que más.
              </p>
              <div className="mt-4 text-xs text-betis-green font-semibold">- Carmen, de Málaga</div>
            </div>

            {/* Story 3 */}
            <div className="bg-white rounded-3xl p-8 shadow-xl border border-gray-100 hover:shadow-2xl transition-all duration-300">
              <div className="bg-betis-green/10 rounded-full p-4 w-16 h-16 mx-auto mb-6 flex items-center justify-center">
                <Camera className="h-8 w-8 text-betis-green" />
              </div>
              <h3 className="text-xl font-bold text-betis-black mb-4">
                &ldquo;Cada partido, un recuerdo&rdquo;
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                No es solo ver fútbol. Es reír, es llorar, es celebrar la vida. 
                Cada domingo es un nuevo capítulo de nuestra historia.
              </p>
              <div className="mt-4 text-xs text-betis-green font-semibold">- Fran, local</div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="bg-gradient-to-r from-betis-green to-betis-green-dark rounded-3xl p-12 text-white shadow-2xl">
            <h2 className="text-3xl font-black mb-6">
              ¿Quieres ser parte de nuestra historia?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              Cada nuevo amigo añade un capítulo especial. El tuyo está esperando.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link 
                href="/unete"
                className="bg-betis-gold hover:bg-betis-gold-dark text-betis-black px-10 py-5 rounded-2xl font-black text-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center"
              >
                <Heart className="mr-3 h-6 w-6" />
                Escribamos tu historia
              </Link>
              <Link 
                href="/porra"
                className="border-3 border-white/30 hover:bg-white/10 px-10 py-5 rounded-2xl font-bold text-xl transition-all duration-300 flex items-center justify-center"
              >
                <Play className="mr-3 h-6 w-6" />
                La Porra de Fran
              </Link>
            </div>
          </div>
        </div>

        {/* Photo memories section */}
        <div className="text-center">
          <h3 className="text-2xl font-bold text-betis-black mb-8">Nuestros mejores momentos</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {/* Photo placeholders */}
            <div className="bg-betis-green/10 rounded-2xl aspect-square flex items-center justify-center border-2 border-betis-green/20">
              <span className="text-4xl">📸</span>
            </div>
            <div className="bg-betis-gold/10 rounded-2xl aspect-square flex items-center justify-center border-2 border-betis-gold/20">
              <span className="text-4xl">🎉</span>
            </div>
            <div className="bg-betis-green/10 rounded-2xl aspect-square flex items-center justify-center border-2 border-betis-green/20">
              <span className="text-4xl">🍺</span>
            </div>
            <div className="bg-betis-gold/10 rounded-2xl aspect-square flex items-center justify-center border-2 border-betis-gold/20">
              <span className="text-4xl">⚽</span>
            </div>
          </div>
          
          <div className="bg-gray-50 rounded-2xl p-8 border border-gray-200">
            <div className="flex items-center justify-center mb-4">
              <MapPin className="h-5 w-5 mr-2 text-betis-green" />
              <span className="font-bold text-betis-black">Polwarth Tavern, Edinburgh</span>
            </div>
            <p className="text-gray-600">
              El lugar donde nacen las amistades y crecen las historias.{' '}
              <span className="text-betis-green font-semibold">¡Te esperamos el próximo partido!</span>
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
