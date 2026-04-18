"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { useLocale, useTranslations } from "next-intl";
import {
  Calendar,
  MapPin,
  Users,
  Clock,
  CheckCircle,
  ChevronDown,
} from "lucide-react";
import RSVPForm from "@/components/rsvp/RSVPForm";
import { getUpcomingMatchesWithRSVPCounts, Match } from "@/lib/api/supabase";
import LoadingSpinner from "@/components/LoadingSpinner";
import { format } from "date-fns";
import { es, enGB } from "date-fns/locale";
import { DATETIME_FORMAT } from "@/lib/constants/dateFormats";
import CulturalFusionHero from "@/components/hero/CulturalFusionHero";
import FeatureCard from "@/components/FeatureCard";

interface RSVPData {
  currentMatch: {
    id?: number;
    opponent: string;
    date: string;
    competition: string;
  };
  totalAttendees: number;
  confirmedCount: number;
}

interface MatchWithRSVP extends Match {
  rsvp_count: number;
  total_attendees: number;
}

function RSVPPage() {
  const [showForm, setShowForm] = useState(true);
  const [rsvpData, setRSVPData] = useState<RSVPData | null>(null);
  const [availableMatches, setAvailableMatches] = useState<MatchWithRSVP[]>([]);
  const [selectedMatchId, setSelectedMatchId] = useState<number | null>(null);
  const [showMatchSelector, setShowMatchSelector] = useState(false);
  const searchParams = useSearchParams();
  const t = useTranslations("Rsvp");
  const locale = useLocale();
  const dateFnsLocale = locale === "en" ? enGB : es;

  useEffect(() => {
    const matchId = searchParams.get("match");
    if (matchId) {
      setSelectedMatchId(parseInt(matchId));
    }
    fetchAvailableMatches();
  }, [searchParams]);

  useEffect(() => {
    if (selectedMatchId) {
      fetchRSVPDataForMatch(selectedMatchId);
    } else {
      fetchRSVPData();
    }
  }, [selectedMatchId]);

  const fetchAvailableMatches = async () => {
    try {
      const matches = await getUpcomingMatchesWithRSVPCounts(1);
      if (matches) {
        setAvailableMatches(matches as MatchWithRSVP[]);
      }
    } catch (error) {
      console.error("Error fetching available matches:", error);
    }
  };

  const fetchRSVPData = async () => {
    try {
      const response = await fetch("/api/rsvp");
      if (response.ok) {
        const data = await response.json();
        setRSVPData({
          currentMatch: data.currentMatch,
          totalAttendees: data.totalAttendees,
          confirmedCount: data.confirmedCount,
        });
      }
    } catch (error) {
      console.error("Error fetching RSVP data:", error);
    }
  };

  const fetchRSVPDataForMatch = async (matchId: number) => {
    try {
      const response = await fetch(`/api/rsvp?match=${matchId}`);
      if (response.ok) {
        const data = await response.json();
        setRSVPData({
          currentMatch: data.currentMatch,
          totalAttendees: data.totalAttendees,
          confirmedCount: data.confirmedCount,
        });
      }
    } catch (error) {
      console.error("Error fetching RSVP data for match:", error);
    }
  };

  const handleRSVPSuccess = () => {
    setShowForm(false);
    if (selectedMatchId) {
      fetchRSVPDataForMatch(selectedMatchId);
    } else {
      fetchRSVPData();
    }
    fetchAvailableMatches();
  };

  const handleMatchSelect = (matchId: number) => {
    setSelectedMatchId(matchId);
    setShowMatchSelector(false);
    const newUrl = new URL(window.location.href);
    newUrl.searchParams.set("match", matchId.toString());
    window.history.pushState({}, "", newUrl.toString());
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return format(date, DATETIME_FORMAT, { locale: dateFnsLocale });
  };

  const nextMatch = rsvpData?.currentMatch ?? {
    opponent: t("fallbackOpponent"),
    date: "2025-06-28T20:00:00",
    competition: t("fallbackCompetition"),
  };

  const confirmedCount = rsvpData?.totalAttendees ?? 0;

  return (
    <div className="min-h-screen">
      <CulturalFusionHero>
        <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-black mb-6 text-white text-shadow-xl uppercase tracking-tight">
          {t("heroTitle")}
        </h1>
        <p className="font-accent text-2xl sm:text-3xl text-oro-bright text-shadow-lg italic">
          {t("heroSubtitle")}
        </p>
      </CulturalFusionHero>

      <section className="relative py-16 overflow-hidden">
        <div className="absolute inset-0 bg-canvas-warm" />
        <div className="absolute inset-0 pattern-tartan-subtle opacity-40" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-betis-verde rounded-3xl p-8 text-white text-center mb-8 shadow-xl">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-3xl font-black uppercase tracking-tight">
                {t("nextMatchHeading")}
              </h2>
              {availableMatches.length > 1 && (
                <div className="relative">
                  <button
                    onClick={() => setShowMatchSelector(!showMatchSelector)}
                    className="bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg flex items-center space-x-2 transition-colors"
                  >
                    <span className="text-sm font-medium">
                      {t("changeMatch")}
                    </span>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform ${showMatchSelector ? "rotate-180" : ""}`}
                    />
                  </button>

                  {showMatchSelector && (
                    <div className="absolute top-full right-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 min-w-64 z-10">
                      {availableMatches.map((match) => (
                        <button
                          key={match.id}
                          onClick={() => handleMatchSelect(match.id)}
                          className="w-full text-left px-4 py-3 hover:bg-gray-50 first:rounded-t-lg last:rounded-b-lg border-b border-gray-100 last:border-b-0"
                        >
                          <div className="text-gray-900 font-medium">
                            {match.opponent}
                          </div>
                          <div className="text-gray-500 text-sm">
                            {format(new Date(match.date_time), "dd MMM HH:mm", {
                              locale: dateFnsLocale,
                            })}{" "}
                            • {match.competition}
                          </div>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
              <div className="flex items-center justify-center space-x-4">
                <div className="text-center">
                  <p className="font-bold">{t("realBetis")}</p>
                </div>
                <div className="text-2xl font-bold">{t("vs")}</div>
                <div className="text-center">
                  <p className="font-bold">{nextMatch.opponent}</p>
                </div>
              </div>

              <div className="text-center">
                <Calendar className="h-8 w-8 mx-auto mb-2" />
                <p className="font-bold text-lg">
                  {formatDate(nextMatch.date)}
                </p>
                <p className="text-sm opacity-90">{nextMatch.competition}</p>
              </div>

              <div className="text-center">
                <MapPin className="h-8 w-8 mx-auto mb-2" />
                <p className="font-bold">{t("venueName")}</p>
                <p className="text-sm opacity-90">{t("venueAddress")}</p>
                <p className="text-sm opacity-90">{t("arrivalTime")}</p>
              </div>
            </div>
          </div>

          <div className="text-center mb-12">
            <div className="inline-flex items-center bg-betis-verde-light text-betis-verde-dark px-8 py-4 rounded-full font-heading font-bold text-xl mb-6 shadow-lg uppercase tracking-wide">
              <Users className="h-6 w-6 mr-2" />
              {t("confirmedCount", { count: confirmedCount })}
            </div>

            {!showForm ? (
              <button
                onClick={() => setShowForm(true)}
                className="bg-betis-verde hover:bg-betis-verde-dark text-white px-10 py-5 rounded-2xl font-display font-black text-xl transition-all duration-300 transform hover:scale-105 shadow-2xl hover:shadow-[0_0_30px_rgba(72,187,120,0.4)] uppercase tracking-tight"
              >
                ✋ {t("confirmCta", { count: confirmedCount })}
              </button>
            ) : (
              <div className="max-w-2xl mx-auto">
                <RSVPForm
                  onSuccess={handleRSVPSuccess}
                  selectedMatchId={selectedMatchId || undefined}
                />
              </div>
            )}
          </div>
        </div>
      </section>

      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-white" />
        <div className="absolute inset-0 pattern-tartan-subtle opacity-20" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-display text-4xl sm:text-5xl font-black text-scotland-navy mb-6 uppercase tracking-tight">
              {t("whyHeading")}
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <FeatureCard
              icon={Users}
              title={t("whyTableTitle")}
              description={t("whyTableDescription")}
            />
            <FeatureCard
              icon={Clock}
              title={t("whyPunctualTitle")}
              description={t("whyPunctualDescription")}
            />
            <FeatureCard
              icon={CheckCircle}
              title={t("whyAtmosphereTitle")}
              description={t("whyAtmosphereDescription")}
            />
          </div>
        </div>
      </section>

      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-betis-verde" />
        <div className="absolute inset-0 pattern-verdiblanco-subtle opacity-20" />

        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-display text-4xl font-black mb-12 text-white uppercase tracking-tight">
            {t("contactHeading")}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
              <h3 className="font-heading text-2xl font-bold mb-6 text-white uppercase tracking-wide">
                {t("contactVenueTitle")}
              </h3>
              <div className="space-y-3 font-body text-lg text-white/90">
                <p>{t("contactVenueAddress")}</p>
                <p>{t("contactVenueArrival")}</p>
                <p>{t("contactVenueBar")}</p>
              </div>
            </div>
            <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-8">
              <h3 className="font-heading text-2xl font-bold mb-6 text-white uppercase tracking-wide">
                {t("contactOrganisationTitle")}
              </h3>
              <div className="space-y-3 font-body text-lg text-white/90">
                <p>{t("contactWhatsapp")}</p>
                <p>{t("contactEmail")}</p>
                <p>{t("contactSocial")}</p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function RSVPPageWithSuspense() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <RSVPPage />
    </Suspense>
  );
}

export default RSVPPageWithSuspense;
