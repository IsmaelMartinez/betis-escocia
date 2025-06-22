'use client';

import Link from 'next/link';
import { MapPin, Users, Play, Heart, Home, Clock } from 'lucide-react';

export default function HeroWarm() {
  return (
    <section className="relative min-h-screen bg-gradient-to-br from-amber-50 via-white to-betis-green/5 overflow-hidden">
      {/* Warm, inviting background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-br from-amber-50/80 via-white/90 to-betis-green/10"></div>
        <div className="absolute top-20 right-20 w-72 h-72 bg-betis-gold/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-96 h-96 bg-betis-green/5 rounded-full blur-3xl"></div>
      </div>
      
      <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center mb-16">
          {/* Warm welcome */}
          <div className="inline-flex items-center px-6 py-3 rounded-full bg-betis-green/10 border border-betis-green/20 mb-8 shadow-lg">
            <Home className="h-5 w-5 mr-3 text-betis-green" />
            <span className="text-betis-green font-semibold">Tu hogar bético en Escocia</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-black mb-8 leading-tight text-betis-black">
            Bienvenido a casa,
            <br />
            <span className="text-betis-green">hermano bético</span>
          </h1>

          <div className="max-w-3xl mx-auto mb-12">
            <p className="text-xl text-gray-700 leading-relaxed mb-6">
              Sabemos lo que es estar lejos de casa y extrañar ese calor andaluz. 
              Por eso hemos creado un rincón donde <span className="text-betis-green font-semibold">siempre eres bienvenido</span>, 
              donde cada abrazo es sincero y cada cerveza sabe a amistad.
            </p>
          </div>
        </div>

        {/* Personal invitation grid */}
        <div className="grid lg:grid-cols-2 gap-16 mb-20">
          {/* Left: Personal message */}
          <div className="bg-white rounded-3xl p-10 shadow-xl border border-gray-100">
            <div className="text-center mb-8">
              <div className="bg-betis-green/10 rounded-full p-6 w-24 h-24 mx-auto mb-6 flex items-center justify-center">
                <Heart className="h-12 w-12 text-betis-green" />
              </div>
              <h2 className="text-2xl font-bold text-betis-black mb-4">
                Una invitación del corazón
              </h2>
            </div>
            
            <div className="space-y-6 text-gray-700">
              <p className="leading-relaxed">
                <strong className="text-betis-green">¿Primera vez en Edimburgo?</strong>{' '}
                Pasa por el Polwarth cualquier domingo. Pregunta por Fran o por cualquiera de la peña. 
                Te haremos sitio, te pondremos al día de los chistes internos y, 
                en media hora, ya serás uno más.
              </p>
              
              <p className="leading-relaxed">
                <strong className="text-betis-green">¿Llevas tiempo aquí?</strong>{' '}
                Nunca es tarde para sumar. Somos de los que creemos que la familia se elige, 
                y si eliges el Betis, ya has elegido bien.
              </p>
              
              <p className="leading-relaxed">
                <strong className="text-betis-green">¿Vienes de visita?</strong>{' '}
                Esta es tu casa mientras estés en Escocia. Aquí tienes familia 
                que te va a tratar como te mereces: con cariño y con cervezas frías.
              </p>
            </div>
          </div>

          {/* Right: What makes us special */}
          <div className="space-y-6">
            <div className="bg-betis-green/5 rounded-2xl p-8 border border-betis-green/10">
              <div className="flex items-start space-x-4">
                <div className="bg-betis-green rounded-full p-3 flex-shrink-0">
                  <Users className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-betis-black mb-3">Ambiente familiar</h3>
                  <p className="text-gray-700">
                    Aquí vienen abuelos con nietos, parejas, amigos solteros... 
                    Todos tienen su sitio y todos son importantes.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-betis-gold/5 rounded-2xl p-8 border border-betis-gold/10">
              <div className="flex items-start space-x-4">
                <div className="bg-betis-gold rounded-full p-3 flex-shrink-0">
                  <Clock className="h-6 w-6 text-betis-black" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-betis-black mb-3">Siempre disponibles</h3>
                  <p className="text-gray-700">
                    No solo nos vemos los domingos. WhatsApp, quedadas, celebraciones... 
                    Una vez que entras, ya tienes a quien llamar.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-betis-green/5 rounded-2xl p-8 border border-betis-green/10">
              <div className="flex items-start space-x-4">
                <div className="bg-betis-green rounded-full p-3 flex-shrink-0">
                  <Heart className="h-6 w-6 text-white" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-betis-black mb-3">Cariño auténtico</h3>
                  <p className="text-gray-700">
                    No fingimos. El cariño que encontrarás aquí es real, 
                    como el que tendrías en tu pueblo natal.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Warm CTA */}
        <div className="text-center">
          <div className="bg-gradient-to-r from-betis-green to-betis-green-dark rounded-3xl p-12 text-white shadow-2xl max-w-4xl mx-auto">
            <h2 className="text-3xl font-bold mb-6">
              ¿Te animas a conocernos?
            </h2>
            <p className="text-xl mb-8 opacity-90">
              El próximo partido puede ser el comienzo de una amistad para toda la vida. 
              Solo tienes que dar el primer paso.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-8">
              <Link 
                href="/unete"
                className="bg-betis-gold hover:bg-betis-gold-dark text-betis-black px-10 py-5 rounded-2xl font-black text-xl transition-all duration-300 transform hover:scale-105 flex items-center justify-center shadow-xl"
              >
                <Heart className="mr-3 h-6 w-6" />
                Quiero conoceros
              </Link>
              <Link 
                href="/porra"
                className="border-3 border-white/40 hover:bg-white/10 px-10 py-5 rounded-2xl font-bold text-xl transition-all duration-300 flex items-center justify-center"
              >
                <Play className="mr-3 h-6 w-6" />
                La Porra de Fran
              </Link>
            </div>

            <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm">
              <div className="flex items-center justify-center mb-3">
                <MapPin className="h-5 w-5 mr-2" />
                <span className="font-bold">Polwarth Tavern - 15 Polwarth Place</span>
              </div>
              <p className="text-sm opacity-80">
                Cada partido, 30 minutos antes. Busca las camisetas verdiblancas y las sonrisas.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
