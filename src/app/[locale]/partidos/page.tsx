"use client";

import { useTranslations } from "next-intl";
import { ApiErrorBoundary } from "@/components/ErrorBoundary";
import BetisPositionWidget from "@/components/widgets/BetisPositionWidget";
import AllDatabaseMatches from "@/components/match/AllDatabaseMatches";
import SidebarCard from "@/components/SidebarCard";

export default function MatchesPage() {
  const t = useTranslations("Partidos");

  return (
    <div className="min-h-screen">
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-hero-fusion" />
        <div className="absolute inset-0 pattern-tartan-navy opacity-25" />
        <div className="absolute left-0 top-0 bottom-0 w-8 pattern-verdiblanco-subtle opacity-30" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 rounded-full blur-3xl bg-oro-glow opacity-40 pointer-events-none" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-black mb-6 text-white text-shadow-xl uppercase tracking-tight">
            {t("pageTitle")}
          </h1>
        </div>
      </section>

      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-canvas-warm" />
        <div className="absolute inset-0 pattern-tartan-subtle opacity-40" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            <div className="lg:col-span-3">
              <ApiErrorBoundary>
                <AllDatabaseMatches />
              </ApiErrorBoundary>
            </div>

            <div className="lg:col-span-1">
              <div className="sticky top-8 space-y-6">
                <SidebarCard patternClass="pattern-tartan-subtle">
                  <BetisPositionWidget />
                </SidebarCard>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
