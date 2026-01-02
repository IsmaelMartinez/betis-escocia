"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Menu,
  X,
  MapPin,
  Video,
  MessageCircle,
  Camera,
  Hash,
  User,
  LogIn,
  LogOut,
  UserPlus,
  Calendar,
  Trophy,
} from "lucide-react";
import BetisLogo from "@/components/BetisLogo";
import { type NavigationItem } from "@/lib/featureFlags";
import { useUser, useClerk } from "@clerk/nextjs";

interface DebugInfo {
  features: Record<string, boolean>;
  environment: string | undefined;
  enabledFeatures: string[];
  disabledFeatures: string[];
}

interface LayoutProps {
  readonly children: React.ReactNode;
  readonly debugInfo: DebugInfo | null;
  readonly navigationItems: NavigationItem[];
}

export default function Layout({
  children,
  debugInfo,
  navigationItems,
}: LayoutProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  // Derive auth enabled from debugInfo features (passed from server) to avoid hydration mismatch
  const isAuthEnabled = debugInfo?.features?.["show-clerk-auth"] ?? false;

  const handleSignOut = async () => {
    await signOut();
    setIsUserMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-canvas-warm flex flex-col">
      {/* ============================================
       * SCOREBOARD-INSPIRED HEADER - Design System v2
       * Top ribbon + main nav with cultural patterns
       * ============================================ */}
      <header className="sticky top-0 z-50">
        {/* Top ribbon - stadium LED display style */}
        <div className="bg-betis-verde-dark py-1.5 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-white text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-betis-oro" />
              <span className="font-mono hidden sm:inline">
                Polwarth Tavern, Edinburgh
              </span>
              <span className="font-mono sm:hidden">Edinburgh</span>
            </div>
          </div>
        </div>

        {/* Main navigation bar */}
        <nav className="bg-scotland-navy border-b-4 border-betis-oro relative">
          {/* Subtle verdiblanco texture */}
          <div className="absolute inset-0 pattern-verdiblanco-whisper opacity-10 pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-3">
              {/* Logo with verdiblanco accent */}
              <Link href="/" className="flex items-center gap-3 group">
                <div className="relative">
                  <div className="absolute inset-0 pattern-verdiblanco-subtle rounded-full scale-125 opacity-0 group-hover:opacity-30 transition-opacity" />
                  <BetisLogo
                    width={40}
                    height={40}
                    className="bg-white rounded-full p-1 relative"
                    priority={true}
                  />
                </div>
                <div>
                  <p className="font-display text-lg sm:text-xl font-black text-white tracking-tight leading-none">
                    NO BUSQUES MÁS
                  </p>
                  <p className="font-accent text-betis-oro text-xs sm:text-sm italic">
                    que no hay
                  </p>
                </div>
              </Link>

              {/* Desktop Navigation - scoreboard style */}
              <div className="hidden md:flex items-center gap-1">
                {navigationItems.map((item, index) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="relative px-4 py-2 text-white hover:text-betis-oro transition-colors duration-200 font-heading font-semibold uppercase tracking-wide text-sm group"
                  >
                    <span className="relative z-10">{item.name}</span>
                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors rounded" />
                    {/* Separator dot */}
                    {index < navigationItems.length - 1 && (
                      <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-1 bg-betis-oro/50 rounded-full" />
                    )}
                  </Link>
                ))}

                {/* Auth section */}
                {isAuthEnabled && isLoaded && (
                  <div className="flex items-center ml-4 pl-4 border-l border-white/20">
                    {user ? (
                      <div className="relative">
                        <button
                          onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                          className="flex items-center gap-2 px-3 py-2 text-white hover:text-betis-oro transition-colors rounded-lg hover:bg-white/10"
                        >
                          <User size={18} />
                          <span className="font-heading font-medium text-sm">
                            {user.firstName || "Usuario"}
                          </span>
                        </button>

                        {isUserMenuOpen && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl py-2 z-50 border border-gray-100">
                            {user.publicMetadata.role === "admin" && (
                              <Link
                                href="/admin"
                                className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-betis-verde-pale hover:text-betis-verde transition-colors"
                                onClick={() => setIsUserMenuOpen(false)}
                              >
                                <Trophy size={16} />
                                Admin
                              </Link>
                            )}
                            <Link
                              href="/dashboard"
                              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-betis-verde-pale hover:text-betis-verde transition-colors"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <User size={16} />
                              Dashboard
                            </Link>
                            <Link
                              href="/trivia"
                              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-betis-verde-pale hover:text-betis-verde transition-colors"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <Calendar size={16} />
                              Trivia
                            </Link>
                            <div className="border-t border-gray-100 my-1" />
                            <button
                              onClick={handleSignOut}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                            >
                              <LogOut size={16} />
                              Cerrar Sesión
                            </button>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Link
                          href="/sign-in"
                          className="flex items-center gap-1 px-3 py-2 text-white hover:text-betis-oro transition-colors font-heading font-medium text-sm"
                        >
                          <LogIn size={16} />
                          <span className="hidden lg:inline">Iniciar</span>
                        </Link>
                        <Link
                          href="/sign-up"
                          className="flex items-center gap-1 bg-betis-oro text-scotland-navy px-4 py-2 rounded-lg hover:bg-oro-antique transition-colors font-heading font-bold text-sm"
                        >
                          <UserPlus size={16} />
                          <span>Registro</span>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Mobile menu button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
                aria-label="Toggle mobile menu"
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </nav>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden bg-scotland-navy border-t border-white/10">
            <div className="px-4 py-4 space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="block px-4 py-3 text-white hover:text-betis-oro hover:bg-white/10 rounded-xl transition-all duration-200 font-heading font-semibold text-lg uppercase tracking-wide"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.name}
                </Link>
              ))}

              {isAuthEnabled && isLoaded && (
                <div className="border-t border-white/10 pt-4 mt-4">
                  {user ? (
                    <div className="space-y-1">
                      {user.publicMetadata.role === "admin" && (
                        <Link
                          href="/admin"
                          className="flex items-center gap-3 px-4 py-3 text-white hover:text-betis-oro hover:bg-white/10 rounded-xl transition-all font-heading font-semibold"
                          onClick={() => setIsMenuOpen(false)}
                        >
                          <Trophy size={20} />
                          Admin
                        </Link>
                      )}
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-4 py-3 text-white hover:text-betis-oro hover:bg-white/10 rounded-xl transition-all font-heading font-semibold"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <User size={20} />
                        Dashboard
                      </Link>
                      <Link
                        href="/trivia"
                        className="flex items-center gap-3 px-4 py-3 text-white hover:text-betis-oro hover:bg-white/10 rounded-xl transition-all font-heading font-semibold"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Calendar size={20} />
                        Trivia
                      </Link>
                      <button
                        onClick={() => {
                          handleSignOut();
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-3 text-white hover:text-red-400 hover:bg-white/10 rounded-xl transition-all font-heading font-semibold"
                      >
                        <LogOut size={20} />
                        Cerrar Sesión
                      </button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <Link
                        href="/sign-in"
                        className="flex items-center gap-3 px-4 py-3 text-white hover:text-betis-oro hover:bg-white/10 rounded-xl transition-all font-heading font-semibold"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <LogIn size={20} />
                        Iniciar Sesión
                      </Link>
                      <Link
                        href="/sign-up"
                        className="flex items-center gap-3 px-4 py-3 bg-betis-oro text-scotland-navy hover:bg-oro-antique rounded-xl transition-all font-heading font-bold"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <UserPlus size={20} />
                        Registro
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
      <main className="flex-1">{children}</main>

      {/* ============================================
       * FOOTER - Design System v2
       * Navy depth gradient with tartan texture
       * ============================================ */}
      <footer className="bg-navy-depth relative overflow-hidden">
        {/* Pattern overlay */}
        <div className="absolute inset-0 pattern-tartan-navy opacity-30 pointer-events-none" />

        {/* Verdiblanco top edge */}
        <div className="h-1 bg-gradient-to-r from-betis-verde via-betis-oro to-betis-verde" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* About */}
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <BetisLogo
                  width={32}
                  height={32}
                  className="bg-white rounded-full p-0.5"
                />
                <h3 className="font-display text-xl font-black text-betis-oro">
                  No busques más
                </h3>
              </div>
              <p className="font-accent text-betis-oro italic mb-3">
                que no hay
              </p>
              <p className="font-body text-gray-300 text-sm leading-relaxed">
                La peña del Real Betis en Edimburgo. Más de 15 años compartiendo
                la pasión bética en Escocia.
              </p>
            </div>

            {/* Location */}
            <div>
              <h3 className="font-heading font-bold text-lg mb-4 text-betis-oro uppercase tracking-wide">
                Dónde estamos
              </h3>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-start gap-2">
                  <MapPin
                    size={16}
                    className="text-betis-oro mt-0.5 flex-shrink-0"
                  />
                  <div>
                    <p className="font-heading font-semibold text-white">
                      The Polwarth Tavern
                    </p>
                    <p>35 Polwarth Cres</p>
                    <p>Edinburgh EH11 1HR</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Links */}
            <div>
              <h3 className="font-heading font-bold text-lg mb-4 text-betis-oro uppercase tracking-wide">
                Enlaces
              </h3>
              <div className="space-y-2 text-sm">
                {[
                  {
                    href: "https://www.betisweb.com/foro/principal/betis-fan-s-of-the-universe/6621126-pena-betica-escocesa-no-busques-mas-que-no-hay",
                    label: "BetisWeb Forum",
                  },
                  {
                    href: "https://beticosenescocia.blogspot.com/",
                    label: "Béticos en Escocia",
                  },
                  {
                    href: "https://www.laliga.com/noticias/conoce-a-la-pena-betica-de-escocia-no-busques-mas-que-no-hay",
                    label: "LaLiga",
                  },
                ].map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block text-gray-300 hover:text-betis-verde transition-colors font-body"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </div>

            {/* Social */}
            <div>
              <h3 className="font-heading font-bold text-lg mb-4 text-betis-oro uppercase tracking-wide">
                Síguenos
              </h3>
              <div className="flex flex-wrap gap-3">
                {[
                  {
                    href: "https://www.facebook.com/groups/beticosenescocia/",
                    icon: MessageCircle,
                    label: "Facebook",
                  },
                  {
                    href: "https://www.instagram.com/rbetisescocia/",
                    icon: Camera,
                    label: "Instagram",
                  },
                  {
                    href: "https://x.com/rbetisescocia",
                    icon: Hash,
                    label: "X",
                  },
                  {
                    href: "https://www.youtube.com/beticosenescocia",
                    icon: Video,
                    label: "YouTube",
                  },
                ].map((social) => (
                  <a
                    key={social.href}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-2 bg-white/5 hover:bg-betis-verde/20 text-gray-300 hover:text-betis-verde rounded-lg transition-all"
                    title={social.label}
                  >
                    <social.icon size={20} />
                  </a>
                ))}
              </div>
            </div>
          </div>

          <div className="border-t border-white/10 mt-10 pt-8">
            <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
              {navigationItems.some((item) => item.href === "/contacto") && (
                <Link
                  href="/contacto"
                  className="text-gray-400 hover:text-betis-verde transition-colors font-body text-sm"
                >
                  Contacto
                </Link>
              )}
              <p className="text-gray-400 text-sm font-body text-center">
                © 2025 Peña Bética Escocesa.{" "}
                <span className="text-betis-oro">
                  ¡Viva er Betis manque pierda!
                </span>
              </p>
            </div>
          </div>
        </div>
      </footer>

      {/* Debug Info */}
      {debugInfo && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-3 rounded-lg text-xs max-w-xs z-50 shadow-lg">
          <div className="font-bold text-betis-oro mb-1">Feature Flags</div>
          <div className="text-gray-300">Env: {debugInfo.environment}</div>
          <div className="text-green-400">
            On: {debugInfo.enabledFeatures.join(", ")}
          </div>
          {debugInfo.disabledFeatures.length > 0 && (
            <div className="text-red-400">
              Off: {debugInfo.disabledFeatures.join(", ")}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
