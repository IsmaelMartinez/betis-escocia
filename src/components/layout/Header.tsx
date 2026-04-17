"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X, MapPin } from "lucide-react";
import BetisLogo from "@/components/BetisLogo";
import UserMenu from "@/components/layout/UserMenu";
import { type NavigationItem } from "@/lib/features/featureFlags";

interface HeaderProps {
  readonly navigationItems: NavigationItem[];
  readonly isAuthEnabled: boolean;
}

export default function Header({
  navigationItems,
  isAuthEnabled,
}: HeaderProps) {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  return (
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
                  priority
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

              {isAuthEnabled && <UserMenu variant="desktop" />}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
              aria-label="Toggle mobile menu"
              aria-expanded={isMenuOpen}
              aria-controls="mobile-nav"
            >
              {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </nav>

      {/* Mobile Navigation */}
      {isMenuOpen && (
        <div
          id="mobile-nav"
          className="md:hidden bg-scotland-navy border-t border-white/10"
        >
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

            {isAuthEnabled && (
              <UserMenu
                variant="mobile"
                onNavigate={() => setIsMenuOpen(false)}
              />
            )}
          </div>
        </div>
      )}
    </header>
  );
}
