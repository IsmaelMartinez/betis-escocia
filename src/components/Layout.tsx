'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, MapPin, Facebook, Instagram } from 'lucide-react';

const navigation = [
  { name: 'Inicio', href: '/', nameEn: 'Home' },
  { name: 'La Porra', href: '/porra', nameEn: 'La Porra' },
  { name: 'Partidos', href: '/partidos', nameEn: 'Matches' },
  { name: 'Clasificación', href: '/clasificacion', nameEn: 'Standings' },
  { name: 'Referencias', href: '/referencias', nameEn: 'References' },
  { name: 'Nosotros', href: '/nosotros', nameEn: 'About' },
  { name: 'Galería', href: '/galeria', nameEn: 'Gallery' },
  { name: 'Únete', href: '/unete', nameEn: 'Join Us' },
];

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-betis-green shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center">
                <span className="text-betis-green font-bold text-sm">RB</span>
              </div>
              <div className="text-white">
                <h1 className="font-bold text-lg sm:text-xl">No busques más</h1>
                <p className="text-xs opacity-90">que no hay</p>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6">
              {navigation.map((item) => (
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
              {navigation.map((item) => (
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
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

            {/* Social */}
            <div>
              <h3 className="font-bold text-lg mb-4 text-betis-green">Síguenos</h3>
              <div className="flex space-x-4">
                <a
                  href="https://www.facebook.com/groups/beticosenescocia/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-betis-green transition-colors"
                >
                  <Facebook size={24} />
                </a>
                <a
                  href="https://www.instagram.com/rbetisescocia/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-gray-300 hover:text-betis-green transition-colors"
                >
                  <Instagram size={24} />
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
    </div>
  );
}
