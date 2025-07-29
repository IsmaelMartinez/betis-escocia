'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Menu, X, MapPin, Video, MessageCircle, Camera, Hash, User, LogIn, LogOut, UserPlus } from 'lucide-react';
import BetisLogo from '@/components/BetisLogo';
import { isFeatureEnabled, getEnabledNavigationItemsAsync } from '@/lib/featureFlags';
import { useUser, useClerk } from '@clerk/nextjs';
import { NavigationItem } from '@/lib/flagsmith/types';

interface DebugInfo {
  flags: Record<string, boolean>;
  environment: string;
  enabledFeatures: string[];
  disabledFeatures: string[];
  cacheStatus: {
    cached: boolean;
    expires: string;
  };
}

interface LayoutProps {
  readonly children: React.ReactNode;
  readonly debugInfo: DebugInfo | null;
}

export default function Layout({ children, debugInfo }: LayoutProps) {
  const [enabledNavigation, setEnabledNavigation] = useState<NavigationItem[]>([]);

  useEffect(() => {
    const fetchNavigation = async () => {
      const navItems = await getEnabledNavigationItemsAsync();
      setEnabledNavigation(navItems);
    };

    fetchNavigation();

    // Listen for custom event to re-fetch navigation
    const handleFlagsUpdated = () => {
      console.log('[Layout] Flags updated event received, re-fetching navigation.');
      fetchNavigation();
    };

    window.addEventListener('flags-updated', handleFlagsUpdated);

    return () => {
      window.removeEventListener('flags-updated', handleFlagsUpdated);
    };
  }, []);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  // Authentication state
  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const isAuthEnabled = isFeatureEnabled('showClerkAuth');
  
  const handleSignOut = async () => {
    await signOut();
    setIsUserMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-betis-green-DEFAULT shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <BetisLogo width={32} height={32} className="bg-white rounded-full p-1" priority={true} />
              <div className="text-white">
                <h1 className="font-bold text-base sm:text-lg lg:text-lg">No busques más</h1>
                <p className="text-xs opacity-90 xs:block">que no hay</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6">
              {enabledNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-white hover:text-betis-gold-DEFAULT transition-colors duration-200 font-medium"
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Authentication Links */}
              {isAuthEnabled && isLoaded && (
                <div className="flex items-center space-x-4">
                  {user ? (
                    <div className="relative">
                      <button
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className="flex items-center space-x-2 text-white hover:text-betis-gold transition-colors duration-200"
                      >
                        <User size={20} />
                        <span className="font-medium">{user.firstName || 'Usuario'}</span>
                      </button>
                      
                      {isUserMenuOpen && (
                        <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                          {user.publicMetadata.role === 'admin' && (
                            <Link
                              href="/admin"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              Admin
                            </Link>
                          )}
                          <Link
                            href="/dashboard"
                            className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                            onClick={() => setIsUserMenuOpen(false)}
                          >
                            Dashboard
                          </Link>
                          {isFeatureEnabled('showTriviaGame') && (
                            <Link
                              href="/trivia"
                              className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              Trivia
                            </Link>
                          )}
                          <button
                            onClick={handleSignOut}
                            className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            Cerrar Sesión
                          </button>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center space-x-4">
                      <Link
                        href="/sign-in"
                        className="flex items-center space-x-1 text-white hover:text-betis-gold transition-colors duration-200 font-medium"
                      >
                        <LogIn size={18} />
                        <span>Iniciar Sesión</span>
                      </Link>
                      <Link
                        href="/sign-up"
                        className="flex items-center space-x-1 bg-betis-gold-DEFAULT text-betis-green-DEFAULT px-3 py-1 rounded-md hover:bg-betis-gold-DEFAULT/90 transition-colors duration-200 font-medium"
                      >
                        <UserPlus size={18} />
                        <span>Registro</span>
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </nav>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-white p-2" aria-label="Toggle mobile menu"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-betis-green-700 border-t border-white/20">
            <div className="px-4 py-4 space-y-2">
              {enabledNavigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-4 py-3 text-white hover:text-betis-gold-DEFAULT hover:bg-white/10 rounded-lg transition-all duration-200 font-medium text-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}
              
              {/* Authentication Links - Mobile */}
              {isAuthEnabled && isLoaded && (
                <div className="border-t border-white/20 pt-4 mt-4">
                  {user ? (
                    <div className="space-y-2">
                      {user.publicMetadata.role === 'admin' && (
                        <Link
                          href="/admin"
                          className="flex items-center space-x-3 px-4 py-3 text-white hover:text-betis-gold hover:bg-white/10 rounded-lg transition-all duration-200 font-medium text-lg"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <User size={20} />
                          <span>Admin</span>
                        </Link>
                      )}
                      <Link
                        href="/dashboard"
                        className="flex items-center space-x-3 px-4 py-3 text-white hover:text-betis-gold hover:bg-white/10 rounded-lg transition-all duration-200 font-medium text-lg"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <User size={20} />
                        <span>Dashboard</span>
                      </Link>
                      {isFeatureEnabled('showTriviaGame') && (
                        <Link
                          href="/trivia"
                          className="flex items-center space-x-3 px-4 py-3 text-white hover:text-betis-gold hover:bg-white/10 rounded-lg transition-all duration-200 font-medium text-lg"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <User size={20} />
                          <span>Trivia</span>
                        </Link>
                      )}
                      <button
                        onClick={() => {
                          handleSignOut();
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center space-x-3 px-4 py-3 text-white hover:text-betis-gold hover:bg-white/10 rounded-lg transition-all duration-200 font-medium text-lg w-full text-left"
                      >
                        <LogOut size={20} />
                        <span>Cerrar Sesión</span>
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Link
                        href="/sign-in"
                        className="flex items-center space-x-3 px-4 py-3 text-white hover:text-betis-gold hover:bg-white/10 rounded-lg transition-all duration-200 font-medium text-lg"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <LogIn size={20} />
                        <span>Iniciar Sesión</span>
                      </Link>
                      <Link
                        href="/sign-up"
                        className="flex items-center space-x-3 px-4 py-3 bg-betis-gold text-betis-green hover:bg-betis-gold/90 rounded-lg transition-all duration-200 font-medium text-lg"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <UserPlus size={20} />
                        <span>Registro</span>
                      </Link>
                    </div>
                  )}
                </div>
              )}
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
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* About */}
            <div className="sm:col-span-2 lg:col-span-1">
              <h3 className="font-bold text-lg mb-4 text-betis-green-DEFAULT">No busques más que no hay</h3>
              <p className="text-gray-100 text-sm leading-relaxed">
                La peña del Real Betis en Edimburgo. Nos vemos en The Polwarth Tavern para cada partido.
              </p>
            </div>

            {/* Contact */}
            <div>
              <h3 className="font-bold text-lg mb-4 text-betis-green-DEFAULT">Dónde nos encontramos</h3>
              <div className="space-y-2 text-sm text-gray-300">
                <div className="flex items-center space-x-2">
                  <MapPin size={16} />
                  <span>The Polwarth Tavern</span>
                </div>
                <p>35 Polwarth Cres, Edinburgh EH11 1HR</p>
              </div>
            </div>

            {/* External Links */}
            <div>
              <h3 className="font-bold text-lg mb-4 text-betis-green-DEFAULT">Enlaces útiles</h3>
              <div className="space-y-2 text-sm">
                <a
                  href="https://www.betisweb.com/foro/principal/betis-fan-s-of-the-universe/6621126-pena-betica-escocesa-no-busques-mas-que-no-hay"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-gray-100 hover:text-betis-green-DEFAULT transition-colors"
                >
                  BetisWeb Forum
                </a>
                <a
                  href="https://beticosenescocia.blogspot.com/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-gray-100 hover:text-betis-green-DEFAULT transition-colors"
                >
                  Béticos en Escocia Blog
                </a>
                <a
                  href="https://www.laliga.com/noticias/conoce-a-la-pena-betica-de-escocia-no-busques-mas-que-no-hay"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-gray-100 hover:text-betis-green-DEFAULT transition-colors"
                >
                  LaLiga Reconocimiento
                </a>
                <a
                  href="https://www.abc.es/deportes/alfinaldelapalmera/noticias-betis/sevi-pena-betica-no-busques-mas-no-embajada-recibe-suyos-escocia-202112091615_noticia.html"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block text-gray-100 hover:text-betis-green-DEFAULT transition-colors"
                >
                  ABC Sevilla
                </a>
              </div>
            </div>

            {/* Social */}
            <div>
              <h3 className="font-bold text-lg mb-4 text-betis-green-DEFAULT">Síguenos</h3>
              <div className="flex flex-wrap gap-4">
                <a
                  href="https://www.facebook.com/groups/beticosenescocia/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-100 hover:text-betis-green-DEFAULT transition-colors"
                  title="Facebook"
                >
                  <MessageCircle size={24} />
                </a>
                <a
                  href="https://www.instagram.com/rbetisescocia/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-100 hover:text-betis-green-DEFAULT transition-colors"
                  title="Instagram"
                >
                  <Camera size={24} />
                </a>
                <a
                  href="https://x.com/rbetisescocia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-100 hover:text-betis-green-DEFAULT transition-colors"
                  title="X (Twitter)"
                >
                  <Hash size={24} />
                </a>
                <a
                  href="https://www.youtube.com/beticosenescocia"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-100 hover:text-betis-green-DEFAULT transition-colors"
                  title="YouTube"
                >
                  <Video size={24} />
                </a>
              </div>
            </div>
          </div>

          <div className="border-t border-gray-700 mt-8 pt-8 text-center">
            <div className="flex flex-col sm:flex-row justify-center items-center space-y-2 sm:space-y-0 sm:space-x-6 mb-4">
              <a 
                href="/gdpr" 
                className="text-gray-400 hover:text-betis-green text-sm transition-colors"
              >
                Protección de Datos
              </a>
              <a 
                href="mailto:admin@betis-escocia.com" 
                className="text-gray-400 hover:text-betis-green text-sm transition-colors"
              >
                Contacto Admin
              </a>
            </div>
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