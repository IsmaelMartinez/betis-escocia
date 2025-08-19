'use client';

export const dynamic = 'force-dynamic';

import { useState } from 'react';
import { Instagram, Facebook, Copy, Check, Camera, Share2, Tag } from 'lucide-react';
import InstagramEmbed from '@/components/InstagramEmbed';
import FacebookPagePlugin from '@/components/FacebookPagePlugin';
import { withFeatureFlag } from '@/lib/featureProtection';

function SocialTaggingGuide() {
  const [copiedText, setCopiedText] = useState<string>('');

  const hashtags = {
    general: '#RealBetis #BetisEscocia #PeñaBéticaEscocesa #Edinburgh #Polwarth #VivaElBetis #ManquePierdaEscocia',
    merchandise: '#MerchBético #BufandaBética #EscudoBético #CamisetaBetis',
    matches: '#BetisMatch #PolwarthTavern #BetisAway #BetisFans',
    spanish: '#Béticos #VerdeyBlanco #ManquePierda #FueraBetis'
  };

  const instagramTemplates = [
    {
      title: "Foto con Merchandising",
      template: "🔥 Orgulloso de ser bético en Escocia! 🏴💚 #RealBetis #BetisEscocia #MerchBético #Edinburgh #ManquePierda"
    },
    {
      title: "Partido en el Polwarth",
      template: "¡Qué ambiente en el Polwarth Tavern! 🍻⚽ Los béticos de Escocia siempre presentes 💚🤍 #BetisMatch #PolwarthTavern #BetisEscocia #VivaElBetis"
    },
    {
      title: "Celebración",
      template: "¡GOOOOOL DEL BETIS! 🎉⚽ Celebrando como siempre en Edinburgh 🏴💚 #RealBetis #BetisGol #PeñaBéticaEscocesa #ManquePierda"
    }
  ];

  const facebookTemplates = [
    {
      title: "Evento en el Polwarth",
      template: "¡Nos vemos en el Polwarth Tavern para ver al Betis! 🍻⚽ Siempre mejor en buena compañía bética. ¿Quién se apunta? 💚🤍\n\n#RealBetis #BetisEscocia #PolwarthTavern #Edinburgh"
    },
    {
      title: "Nuevo Merchandising",
      template: "¡Mirad qué preciosidad! 😍 Nuevo merchandising de la Peña Bética Escocesa. Nada como lucir los colores verdiblanco por las tierras escocesas 🏴💚\n\n#MerchBético #BetisEscocia #PeñaBéticaEscocesa #RealBetis"
    }
  ];

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(type);
      setTimeout(() => setCopiedText(''), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-betis-green to-green-700 text-white py-16">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Share2 className="h-16 w-16 mx-auto mb-4" />
          <h1 className="text-4xl sm:text-5xl font-black mb-4">
            Guía de Redes Sociales
          </h1>
          <p className="text-xl opacity-90">
            Ayuda a difundir la pasión bética por Escocia etiquetando tus fotos correctamente
          </p>
        </div>
      </section>

      {/* Quick Tips */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">
            📸 Consejos Rápidos para Fotos Béticas
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <Camera className="h-8 w-8 text-betis-green mx-auto mb-3" />
              <h3 className="font-bold text-lg mb-2">Muestra el Merchandising</h3>
              <p className="text-gray-600 text-sm">Asegúrate de que se vea claramente la bufanda, camiseta o cualquier artículo bético en la foto</p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <Tag className="h-8 w-8 text-betis-green mx-auto mb-3" />
              <h3 className="font-bold text-lg mb-2">Usa los Hashtags</h3>
              <p className="text-gray-600 text-sm">Incluye siempre #RealBetis #BetisEscocia #PeñaBéticaEscocesa para que todos nos encontremos</p>
            </div>
            
            <div className="bg-gray-50 p-6 rounded-lg text-center">
              <Share2 className="h-8 w-8 text-betis-green mx-auto mb-3" />
              <h3 className="font-bold text-lg mb-2">Etiqueta a la Peña</h3>
              <p className="text-gray-600 text-sm">Menciona @rbetisescocia en Instagram y etiqueta a la página de Facebook</p>
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions Section */}
      <section className="py-12 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">
            ⚡ Quick Actions
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <button
              onClick={() => copyToClipboard('@rbetisescocia', 'quick-instagram')}
              className="bg-gradient-to-r from-purple-500 to-pink-500 text-white p-4 rounded-xl hover:from-purple-600 hover:to-pink-600 transition-all duration-300 transform hover:scale-105"
            >
              <Instagram className="w-6 h-6 mx-auto mb-2" />
              <div className="text-sm font-semibold">Instagram Handle</div>
              <div className="text-xs opacity-80">@rbetisescocia</div>
            </button>
            
            <button
              onClick={() => copyToClipboard('#PenaBetiscaEscocesa #BetisEdinburgh #RealBetis', 'quick-hashtags')}
              className="bg-betis-green text-white p-4 rounded-xl hover:bg-green-700 transition-all duration-300 transform hover:scale-105"
            >
              <Tag className="w-6 h-6 mx-auto mb-2" />
              <div className="text-sm font-semibold">Essential Tags</div>
              <div className="text-xs opacity-80">Copy main hashtags</div>
            </button>
            
            <button
              onClick={() => copyToClipboard('¡Viva el Betis! 💚🤍 #ManquePierda #BetisEscocia', 'quick-celebration')}
              className="bg-yellow-500 text-white p-4 rounded-xl hover:bg-yellow-600 transition-all duration-300 transform hover:scale-105"
            >
              <div className="text-2xl mb-2">🎉</div>
              <div className="text-sm font-semibold">Celebration</div>
              <div className="text-xs opacity-80">Quick victory post</div>
            </button>
            
            <a
              href="/coleccionables"
              className="bg-blue-600 text-white p-4 rounded-xl hover:bg-blue-700 transition-all duration-300 transform hover:scale-105 text-center"
            >
              <div className="text-2xl mb-2">📦</div>
              <div className="text-sm font-semibold">Show Merch</div>
              <div className="text-xs opacity-80">Tag our products</div>
            </a>
          </div>
          
          {copiedText.startsWith('quick-') && (
            <div className="mt-4 text-center">
              <div className="inline-flex items-center bg-green-100 text-green-800 px-4 py-2 rounded-lg">
                <Check className="w-4 h-4 mr-2" />
                ¡Copiado al portapapeles!
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Instagram Section */}
      <section className="py-12 bg-gradient-to-r from-purple-600 to-pink-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <Instagram className="h-12 w-12 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">📱 Instagram</h2>
            <p className="text-lg opacity-90">Plantillas listas para copiar y pegar</p>
          </div>

          <div className="space-y-6">
            {instagramTemplates.map((template, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <h3 className="text-xl font-bold mb-3">{template.title}</h3>
                <div className="bg-black/20 rounded-lg p-4 font-mono text-sm mb-4">
                  {template.template}
                </div>
                <button
                  onClick={() => copyToClipboard(template.template, `ig-${index}`)}
                  className="bg-white text-purple-600 px-4 py-2 rounded-lg font-bold hover:bg-gray-100 transition-colors flex items-center"
                >
                  {copiedText === `ig-${index}` ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      ¡Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar Texto
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>

          <div className="mt-8 bg-white/10 backdrop-blur-sm rounded-lg p-6">
            <h3 className="text-xl font-bold mb-3">📝 Hashtags Generales</h3>
            <div className="bg-black/20 rounded-lg p-4 font-mono text-sm mb-4">
              {hashtags.general}
            </div>
            <button
              onClick={() => copyToClipboard(hashtags.general, 'hashtags-general')}
              className="bg-white text-purple-600 px-4 py-2 rounded-lg font-bold hover:bg-gray-100 transition-colors flex items-center"
            >
              {copiedText === 'hashtags-general' ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  ¡Copiado!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar Hashtags
                </>
              )}
            </button>
          </div>
        </div>
      </section>

      {/* Facebook Section */}
      <section className="py-12 bg-blue-600 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-8">
            <Facebook className="h-12 w-12 mx-auto mb-4" />
            <h2 className="text-3xl font-bold mb-4">📘 Facebook</h2>
            <p className="text-lg opacity-90">Posts más largos y descriptivos</p>
          </div>

          <div className="space-y-6">
            {facebookTemplates.map((template, index) => (
              <div key={index} className="bg-white/10 backdrop-blur-sm rounded-lg p-6">
                <h3 className="text-xl font-bold mb-3">{template.title}</h3>
                <div className="bg-black/20 rounded-lg p-4 text-sm mb-4 whitespace-pre-line">
                  {template.template}
                </div>
                <button
                  onClick={() => copyToClipboard(template.template, `fb-${index}`)}
                  className="bg-white text-blue-600 px-4 py-2 rounded-lg font-bold hover:bg-gray-100 transition-colors flex items-center"
                >
                  {copiedText === `fb-${index}` ? (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      ¡Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-2" />
                      Copiar Texto
                    </>
                  )}
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Specific Hashtags */}
      <section className="py-12 bg-gray-100">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-8 text-gray-900">
            🏷️ Hashtags por Categoría
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-bold mb-3 text-betis-green">Merchandising</h3>
              <div className="bg-gray-50 rounded p-3 text-sm font-mono mb-3">
                {hashtags.merchandise}
              </div>
              <button
                onClick={() => copyToClipboard(hashtags.merchandise, 'hashtags-merch')}
                className="bg-betis-green text-white px-3 py-2 rounded font-medium hover:bg-green-700 transition-colors flex items-center text-sm"
              >
                {copiedText === 'hashtags-merch' ? (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 mr-1" />
                    Copiar
                  </>
                )}
              </button>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-bold mb-3 text-betis-green">Partidos</h3>
              <div className="bg-gray-50 rounded p-3 text-sm font-mono mb-3">
                {hashtags.matches}
              </div>
              <button
                onClick={() => copyToClipboard(hashtags.matches, 'hashtags-matches')}
                className="bg-betis-green text-white px-3 py-2 rounded font-medium hover:bg-green-700 transition-colors flex items-center text-sm"
              >
                {copiedText === 'hashtags-matches' ? (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 mr-1" />
                    Copiar
                  </>
                )}
              </button>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-bold mb-3 text-betis-green">En Español</h3>
              <div className="bg-gray-50 rounded p-3 text-sm font-mono mb-3">
                {hashtags.spanish}
              </div>
              <button
                onClick={() => copyToClipboard(hashtags.spanish, 'hashtags-spanish')}
                className="bg-betis-green text-white px-3 py-2 rounded font-medium hover:bg-green-700 transition-colors flex items-center text-sm"
              >
                {copiedText === 'hashtags-spanish' ? (
                  <>
                    <Check className="h-3 w-3 mr-1" />
                    Copiado
                  </>
                ) : (
                  <>
                    <Copy className="h-3 w-3 mr-1" />
                    Copiar
                  </>
                )}
              </button>
            </div>

            <div className="bg-white rounded-lg p-6 shadow-md">
              <h3 className="text-lg font-bold mb-3 text-betis-green">Cuentas a Mencionar</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span>Instagram:</span>
                  <code className="bg-gray-100 px-2 py-1 rounded">@rbetisescocia</code>
                </div>
                <div className="flex justify-between items-center">
                  <span>Facebook:</span>
                  <code className="bg-gray-100 px-2 py-1 rounded">Béticos en Escocia</code>
                </div>
                <div className="flex justify-between items-center">
                  <span>Real Betis:</span>
                  <code className="bg-gray-100 px-2 py-1 rounded">@realbetisbalompie</code>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-16 bg-betis-green text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-bold mb-6">🚀 ¡Comparte tus Fotos Béticas!</h2>
          <p className="text-xl opacity-90 mb-8">
            Cada foto que compartes ayuda a que más béticos se unan a nuestra familia escocesa
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <a
              href="/galeria"
              className="bg-white text-betis-green px-8 py-4 rounded-xl font-bold text-lg hover:bg-gray-100 transition-all duration-300 transform hover:scale-105"
            >
              📸 Subir a la Galería
            </a>
            <a
              href="https://www.instagram.com/rbetisescocia/"
              target="_blank"
              rel="noopener noreferrer"
              className="border-2 border-white text-white hover:bg-white hover:text-betis-green px-8 py-4 rounded-xl font-bold text-lg transition-all duration-300 transform hover:scale-105"
            >
              📱 Síguenos en Instagram
            </a>
          </div>
        </div>
      </section>

      {/* Enhanced Social Media Section */}
      <section className="py-16 bg-gradient-to-br from-betis-green to-green-700">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              📱 Follow Us & Stay Connected
            </h2>
            <p className="text-xl text-green-100 max-w-3xl mx-auto">
              Join our community on social media! Get the latest updates, share your match day moments, and connect with béticos across Scotland.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
            {/* Instagram Card */}
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <div className="text-center">
                <div className="bg-gradient-to-r from-purple-500 to-pink-500 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Instagram className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Instagram</h3>
                <p className="text-gray-600 mb-4">@rbetisescocia</p>
                <p className="text-sm text-gray-500 mb-6">Share your match day photos, merchandise, and Betis pride!</p>
                
                {/* QR Code Placeholder */}
                <div className="bg-gray-100 w-32 h-32 mx-auto mb-4 rounded-lg flex items-center justify-center">
                  <div className="text-4xl">📱</div>
                </div>
                <p className="text-xs text-gray-400 mb-4">Scan to follow us</p>
                
                <div className="space-y-3">
                  <a
                    href="https://instagram.com/rbetisescocia"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-gradient-to-r from-purple-500 to-pink-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-purple-600 hover:to-pink-700 transition-all duration-300 transform hover:scale-105"
                  >
                    📸 Follow on Instagram
                  </a>
                  <div className="text-xs text-gray-500">
                    Best posting times: 6-8pm weekdays, 12-2pm weekends
                  </div>
                </div>
              </div>
            </div>

            {/* Facebook Card */}
            <div className="bg-white rounded-2xl p-8 shadow-xl">
              <div className="text-center">
                <div className="bg-blue-600 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Facebook className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Facebook</h3>
                <p className="text-gray-600 mb-4">Béticos en Escocia (Grupo)</p>
                <p className="text-sm text-gray-500 mb-6">Official page for events, announcements, and community discussions</p>
                
                {/* QR Code Placeholder */}
                <div className="bg-gray-100 w-32 h-32 mx-auto mb-4 rounded-lg flex items-center justify-center">
                  <div className="text-4xl">📘</div>
                </div>
                <p className="text-xs text-gray-400 mb-4">Scan to follow us</p>
                
                <div className="space-y-3">
                  <a
                    href="https://www.facebook.com/groups/beticosenescocia/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block bg-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300 transform hover:scale-105"
                  >
                    📘 Join our Facebook Group
                  </a>
                  <div className="text-xs text-gray-500">
                    Best posting times: 7-9pm weekdays, 1-3pm weekends
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Social Media Guidelines */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8 text-white">
            <h3 className="text-2xl font-bold text-center mb-8">📋 Social Media Guidelines</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-4xl mb-3">📸</div>
                <h4 className="font-bold mb-2">What to Post</h4>
                <ul className="text-sm space-y-1 opacity-90">
                  <li>• Match day at Polwarth</li>
                  <li>• Merchandise photos</li>
                  <li>• Celebration moments</li>
                  <li>• Community meetups</li>
                </ul>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">🏷️</div>
                <h4 className="font-bold mb-2">Essential Hashtags</h4>
                <ul className="text-sm space-y-1 opacity-90">
                  <li>• #PenaBetiscaEscocesa</li>
                  <li>• #BetisEdinburgh</li>
                  <li>• #RealBetis</li>
                  <li>• #PolwarthTavern</li>
                </ul>
              </div>
              <div className="text-center">
                <div className="text-4xl mb-3">⏰</div>
                <h4 className="font-bold mb-2">Optimal Times</h4>
                <ul className="text-sm space-y-1 opacity-90">
                  <li>• Match days: 2hrs before</li>
                  <li>• Weekdays: 6-8pm</li>
                  <li>• Weekends: 12-3pm</li>
                  <li>• Events: Day before</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Social Media Feeds */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              📱 Live Social Media Feeds
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              See the latest content from our community! Real posts from our Instagram and Facebook feeds.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Instagram Embed */}
            <InstagramEmbed showHeader={true} />
            
            {/* Facebook Page Plugin */}
            <FacebookPagePlugin 
              showHeader={true} 
              height={500}
            />
          </div>
        </div>
      </section>
    </div>
  );
}

export default withFeatureFlag(SocialTaggingGuide, 'show-redes-sociales');
