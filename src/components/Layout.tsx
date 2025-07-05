'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, MapPin, Video, MessageCircle, Camera, Hash } from 'lucide-react';
import BetisLogo from '@/components/BetisLogo';
import { getEnabledNavigationItems, getFeatureFlagsStatus } from '@/lib/featureFlags';

interface LayoutProps {
  readonly children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  
  // Use feature flags to determine which navigation items to show
  const enabledNavigation = getEnabledNavigationItems();
  
  // Debug information (only shown in development with debug flag)
  const debugInfo = getFeatureFlagsStatus();

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-betis-green shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <BetisLogo width={32} height={32} className="bg-white rounded-full p-1" />
              <div className="text-white">
                <h1 className="font-bold text-lg sm:text-xl">No busques más</h1>
                <p className="text-xs opacity-90">que no hay</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6">
              {enabledNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-white hover:text-betis-gold transition-colors duration-200 font-medium"
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-white p-2"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-betis-green border-t border-white/20">
            <div className="px-4 py-2 space-y-1">
              {enabledNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-3 py-2 text-white hover:text-betis-gold transition-colors duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
            </div>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Footer */}
      <footer className="bg-gray-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            {/* About */}
            <div>
              <h3 className="font-bold text-lg mb-4 text-betis-green">No busques más que no hay</h3>
              <p className="text-gray-300 text-sm">
                La peña del Real Betis en Edimburgo. Nos vemos en el Polwarth Tavern para cada partido.
              </p>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-bold text-lg mb-4 text-betis-green">Dónde nos encontramos</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-center space-x-2">
                  <MapPin size={16} />
                  <span>Polwarth Tavern</span>
                </div>
                <p>15 Polwarth Pl, Edinburgh EH11 1NH</p>
              </div>
            </div>

            {/* External Links */}
            <div>
              <h3 className="font-bold text-lg mb-4 text-betis-green">Enlaces útiles</h3>
              <div className="space-y-2 text-sm">
                <a
                  href="https://www.betisweb.com/foro/principal/betis-fan-s-of-the-universe/6621126-pena-betica-escocesa-no-busques-mas-que-no-hay"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-gray-300 hover:text-betis-green transition-colors"
                >
                  BetisWeb Forum
                </a>
                <a
                  href="https://beticosenescocia.blogspot.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-gray-300 hover:text-betis-green transition-colors"
                >
                  Béticos en Escocia Blog
                </a>
                <a
                  href="https://www.laliga.com/noticias/conoce-a-la-pena-betica-de-escocia-no-busques-mas-que-no-hay"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-gray-300 hover:text-betis-green transition-colors"
                >
                  LaLiga Reconocimiento
                </a>
                <a
                  href="https://www.abc.es/deportes/alfinaldelapalmera/noticias-betis/sevi-pena-betica-no-busques-mas-no-embajada-recibe-suyos-escocia-202112091615_noticia.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-gray-300 hover:text-betis-green transition-colors"
                >
                  ABC Sevilla
                </a>
                <a
                  href="https://www.manquepierda.com/blog/la-aficion-del-betis-objetivo-elogios/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-gray-300 hover:text-betis-green transition-colors"
                >
                  Manquepierda Blog
                </a>
              </div>
            </div>

            {/* Social */}
            <div>
              <h3 className="font-bold text-lg mb-4 text-betis-green">Síguenos</h3>
              <div className="flex flex-wrap gap-4">
                <a
                  href="https://www.facebook.com/groups/beticosenescocia/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-betis-green transition-colors"
                  title="Facebook"
                >
                  <MessageCircle size={24} />
                </a>
                <a
                  href="https://www.instagram.com/rbetisescocia/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-betis-green transition-colors"
                  title="Instagram"
                >
                  <Camera size={24} />
                </a>
                <a
                  href="https://x.com/rbetisescocia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-betis-green transition-colors"
                  title="X (Twitter)"
                >
                  <Hash size={24} />
                </a>
                <a
                  href="https://www.youtube.com/beticosenescocia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-betis-green transition-colors"
                >
                  <Video size={24} />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <p className="text-gray-400 text-sm">
              © 2025 Peña Bética Escocesa. ¡Viva er Betis manque pierda!
            </p>
          </div>
        </div>
      </footer>

      {/* Debug Info (Development Only) */}
      {debugInfo && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-3 rounded text-xs max-w-xs z-50">
          <div className="font-bold">Feature Flags Debug</div>
          <div>Environment: {debugInfo.environment}</div>
          <div>Enabled: {debugInfo.enabledFeatures.join(', ')}</div>
          {debugInfo.disabledFeatures.length > 0 && (
            <div>Disabled: {debugInfo.disabledFeatures.join(', ')}</div>
          )}
        </div>
      )}
    </div>
  );
}
