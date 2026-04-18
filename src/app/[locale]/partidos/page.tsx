"use client";

import { useTranslations } from "next-intl";
import { ApiErrorBoundary } from "@/components/ErrorBoundary";
import BetisPositionWidget from "@/components/widgets/BetisPositionWidget";
import AllDatabaseMatches from "@/components/match/AllDatabaseMatches";
import RSVPModal, { useRSVPModal } from "@/components/rsvp/RSVPModal";
import SidebarCard from "@/components/SidebarCard";
import { Calendar } from "lucide-react";
import { hasFeature } from "@/lib/features/featureFlags";

export default function MatchesPage() {
  const { isOpen, openModal, closeModal } = useRSVPModal();
  const isRSVPEnabled = hasFeature("show-rsvp");
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
                {isRSVPEnabled && (
                  <SidebarCard>
                    <div className="w-12 h-12 bg-betis-verde rounded-full flex items-center justify-center mb-4 mx-auto">
                      <Calendar className="h-6 w-6 text-white" />
                    </div>
                    <h3 className="font-heading text-lg font-bold text-scotland-navy mb-2 text-center uppercase tracking-wide">
                      {t("nextMatchHeading")}
                    </h3>
                    <p className="font-body text-sm text-gray-600 mb-4 text-center">
                      {t("nextMatchQuestion")}
                    </p>
                    <button
                      onClick={openModal}
                      className="w-full bg-betis-verde hover:bg-betis-verde-dark text-white font-heading font-bold py-3 px-4 rounded-xl transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl uppercase tracking-wide text-sm"
                    >
                      ✅ {t("nextMatchCta")}
                    </button>
                  </SidebarCard>
                )}

                <SidebarCard patternClass="pattern-tartan-subtle">
                  <BetisPositionWidget />
                </SidebarCard>
              </div>
            </div>
          </div>
        </div>
      </section>

      {isRSVPEnabled && (
        <RSVPModal
          isOpen={isOpen}
          onClose={closeModal}
          event={{
            id: undefined,
            title: t("modalEventTitle"),
            date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
            location: t("modalEventLocation"),
            description: t("modalEventDescription"),
          }}
          modalTitle={t("modalTitle")}
        />
      )}
    </div>
  );
}
