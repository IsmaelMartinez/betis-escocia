"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
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
import { type NavigationItem } from "@/lib/features/featureFlags";
import { useUser, useClerk } from "@clerk/nextjs";
import LanguageSwitcher from "@/components/LanguageSwitcher";

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

  const tNav = useTranslations("Navigation");
  const t = useTranslations("Layout");
  const tFooter = useTranslations("Footer");

  const { user, isLoaded } = useUser();
  const { signOut } = useClerk();
  const isAuthEnabled = debugInfo?.features?.["show-clerk-auth"] ?? false;

  const handleSignOut = async () => {
    await signOut();
    setIsUserMenuOpen(false);
  };

  return (
    <div className="min-h-screen bg-canvas-warm flex flex-col">
      <header className="sticky top-0 z-50">
        <div className="bg-betis-verde-dark py-1.5 px-4">
          <div className="max-w-7xl mx-auto flex items-center justify-between text-white text-xs sm:text-sm">
            <div className="flex items-center gap-2">
              <MapPin className="h-3 w-3 sm:h-4 sm:w-4 text-betis-oro" />
              <span className="font-mono hidden sm:inline">
                {t("locationFull")}
              </span>
              <span className="font-mono sm:hidden">{t("locationShort")}</span>
            </div>
            <LanguageSwitcher />
          </div>
        </div>

        <nav className="bg-scotland-navy border-b-4 border-betis-oro relative">
          <div className="absolute inset-0 pattern-verdiblanco-whisper opacity-10 pointer-events-none" />

          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center py-3">
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
                    {t("logoTitle")}
                  </p>
                  <p className="font-accent text-betis-oro text-xs sm:text-sm italic">
                    {t("logoSubtitle")}
                  </p>
                </div>
              </Link>

              <div className="hidden md:flex items-center gap-1">
                {navigationItems.map((item, index) => (
                  <Link
                    key={item.translationKey}
                    href={item.href}
                    className="relative px-4 py-2 text-white hover:text-betis-oro transition-colors duration-200 font-heading font-semibold uppercase tracking-wide text-sm group"
                  >
                    <span className="relative z-10">
                      {tNav(item.translationKey)}
                    </span>
                    <div className="absolute inset-0 bg-white/0 group-hover:bg-white/10 transition-colors rounded" />
                    {index < navigationItems.length - 1 && (
                      <span className="absolute right-0 top-1/2 -translate-y-1/2 w-1 h-1 bg-betis-oro/50 rounded-full" />
                    )}
                  </Link>
                ))}

                {isAuthEnabled && isLoaded && (
                  <div className="flex items-center ml-4 pl-4 border-l border-white/20">
                    {user ? (
                      <div className="relative">
                        <button
                          onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                          className="flex items-center gap-2 px-3 py-2 text-white hover:text-betis-oro transition-colors rounded-lg hover:bg-white/10"
                          aria-expanded={isUserMenuOpen}
                          aria-haspopup="true"
                          aria-label={t("userMenuLabel")}
                        >
                          <User size={18} />
                          <span className="font-heading font-medium text-sm">
                            {user.firstName || t("defaultUserName")}
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
                                {t("adminLink")}
                              </Link>
                            )}
                            <Link
                              href="/dashboard"
                              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-betis-verde-pale hover:text-betis-verde transition-colors"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <User size={16} />
                              {t("dashboardLink")}
                            </Link>
                            <Link
                              href="/trivia"
                              className="flex items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-betis-verde-pale hover:text-betis-verde transition-colors"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <Calendar size={16} />
                              {t("triviaLink")}
                            </Link>
                            <div className="border-t border-gray-100 my-1" />
                            <button
                              onClick={handleSignOut}
                              className="flex items-center gap-2 w-full px-4 py-2 text-sm text-gray-700 hover:bg-red-50 hover:text-red-600 transition-colors"
                            >
                              <LogOut size={16} />
                              {t("signOut")}
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
                          <span className="hidden lg:inline">
                            {t("signInShort")}
                          </span>
                        </Link>
                        <Link
                          href="/sign-up"
                          className="flex items-center gap-1 bg-betis-oro text-scotland-navy px-4 py-2 rounded-lg hover:bg-oro-antique transition-colors font-heading font-bold text-sm"
                        >
                          <UserPlus size={16} />
                          <span>{t("signUpShort")}</span>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>

              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="md:hidden text-white p-2 hover:bg-white/10 rounded-lg transition-colors"
                aria-label={t("toggleMobileMenu")}
              >
                {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </nav>

        {isMenuOpen && (
          <div className="md:hidden bg-scotland-navy border-t border-white/10">
            <div className="px-4 py-4 space-y-1">
              {navigationItems.map((item) => (
                <Link
                  key={item.translationKey}
                  href={item.href}
                  className="block px-4 py-3 text-white hover:text-betis-oro hover:bg-white/10 rounded-xl transition-all duration-200 font-heading font-semibold text-lg uppercase tracking-wide"
                  onClick={() => setIsMenuOpen(false)}
                >
                  {tNav(item.translationKey)}
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
                          {t("adminLink")}
                        </Link>
                      )}
                      <Link
                        href="/dashboard"
                        className="flex items-center gap-3 px-4 py-3 text-white hover:text-betis-oro hover:bg-white/10 rounded-xl transition-all font-heading font-semibold"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <User size={20} />
                        {t("dashboardLink")}
                      </Link>
                      <Link
                        href="/trivia"
                        className="flex items-center gap-3 px-4 py-3 text-white hover:text-betis-oro hover:bg-white/10 rounded-xl transition-all font-heading font-semibold"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <Calendar size={20} />
                        {t("triviaLink")}
                      </Link>
                      <button
                        onClick={() => {
                          handleSignOut();
                          setIsMenuOpen(false);
                        }}
                        className="flex items-center gap-3 w-full px-4 py-3 text-white hover:text-red-400 hover:bg-white/10 rounded-xl transition-all font-heading font-semibold"
                      >
                        <LogOut size={20} />
                        {t("signOut")}
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
                        {t("signInLong")}
                      </Link>
                      <Link
                        href="/sign-up"
                        className="flex items-center gap-3 px-4 py-3 bg-betis-oro text-scotland-navy hover:bg-oro-antique rounded-xl transition-all font-heading font-bold"
                        onClick={() => setIsMenuOpen(false)}
                      >
                        <UserPlus size={20} />
                        {t("signUpLong")}
                      </Link>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      <footer className="bg-navy-depth relative overflow-hidden">
        <div className="absolute inset-0 pattern-tartan-navy opacity-30 pointer-events-none" />

        <div className="h-1 bg-gradient-to-r from-betis-verde via-betis-oro to-betis-verde" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="sm:col-span-2 lg:col-span-1">
              <div className="flex items-center gap-3 mb-4">
                <BetisLogo
                  width={32}
                  height={32}
                  className="bg-white rounded-full p-0.5"
                />
                <h3 className="font-display text-xl font-black text-betis-oro">
                  {tFooter("aboutTitle")}
                </h3>
              </div>
              <p className="font-accent text-betis-oro italic mb-3">
                {tFooter("aboutSubtitle")}
              </p>
              <p className="font-body text-gray-300 text-sm leading-relaxed">
                {tFooter("aboutDescription")}
              </p>
            </div>

            <div>
              <h3 className="font-heading font-bold text-lg mb-4 text-betis-oro uppercase tracking-wide">
                {tFooter("locationHeading")}
              </h3>
              <div className="space-y-3 text-sm text-gray-300">
                <div className="flex items-start gap-2">
                  <MapPin
                    size={16}
                    className="text-betis-oro mt-0.5 flex-shrink-0"
                  />
                  <div>
                    <p className="font-heading font-semibold text-white">
                      {tFooter("venueName")}
                    </p>
                    <p>{tFooter("venueAddressLine1")}</p>
                    <p>{tFooter("venueAddressLine2")}</p>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h3 className="font-heading font-bold text-lg mb-4 text-betis-oro uppercase tracking-wide">
                {tFooter("linksHeading")}
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

            <div>
              <h3 className="font-heading font-bold text-lg mb-4 text-betis-oro uppercase tracking-wide">
                {tFooter("socialHeading")}
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
                    aria-label={social.label}
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
                  {tFooter("contactLink")}
                </Link>
              )}
              <p className="text-gray-400 text-sm font-body text-center">
                {tFooter("copyright", { year: new Date().getFullYear() })}{" "}
                <span className="text-betis-oro">{tFooter("tagline")}</span>
              </p>
            </div>
          </div>
        </div>
      </footer>

      {debugInfo && (
        <div className="fixed bottom-4 right-4 bg-gray-900 text-white p-3 rounded-lg text-xs max-w-xs z-50 shadow-lg">
          <div className="font-bold text-betis-oro mb-1">{t("debugLabel")}</div>
          <div className="text-gray-300">
            {t("debugEnvironment", { env: debugInfo.environment ?? "" })}
          </div>
          <div className="text-betis-oro">
            {t("debugEnabled", {
              features: debugInfo.enabledFeatures.join(", "),
            })}
          </div>
          {debugInfo.disabledFeatures.length > 0 && (
            <div className="text-red-400">
              {t("debugDisabled", {
                features: debugInfo.disabledFeatures.join(", "),
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
