import { Metadata } from "next";
import {
  FootballDataService,
  StandingEntry,
} from "@/services/footballDataService";
import axios from "axios";
import { getTranslations } from "next-intl/server";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import LoadingSpinner from "@/components/LoadingSpinner";
import Image from "next/image";
import { Link } from "@/i18n/navigation";
import { Suspense } from "react";
import {
  withFeatureFlag,
  FeatureWrapper,
} from "@/lib/features/featureProtection";
import CulturalFusionHero from "@/components/hero/CulturalFusionHero";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Clasificacion" });
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

import {
  getPositionStyle,
  getPositionBadge,
  formatForm,
  getFormResultStyle,
} from "./utils";

function StandingRow({
  entry,
  isBetis,
}: {
  entry: StandingEntry;
  isBetis: boolean;
}) {
  const positionBadge = getPositionBadge(entry.position);
  const formResults = formatForm(entry.form);

  return (
    <tr
      className={`${isBetis ? "bg-betis-verde-pale border-betis-verde/20" : "hover:bg-gray-50"} transition-colors`}
    >
      <td className="px-3 py-4 text-sm">
        <div className="flex items-center space-x-2">
          <span className={`font-medium ${getPositionStyle(entry.position)}`}>
            {entry.position}
          </span>
          {positionBadge && (
            <span
              className={`px-2 py-1 text-xs font-medium rounded-full ${positionBadge.color}`}
            >
              {positionBadge.text}
            </span>
          )}
        </div>
      </td>

      <td className="px-3 py-4">
        <div className="flex items-center space-x-3">
          <Image
            src={entry.team.crest}
            alt={entry.team.name}
            width={24}
            height={24}
            className="rounded"
            unoptimized
          />
          <div className="flex flex-col">
            <span
              className={`font-medium text-sm ${isBetis ? "text-betis-verde-dark" : "text-gray-900"}`}
            >
              {entry.team.shortName || entry.team.name}
            </span>
            <span className="text-xs text-gray-500 sm:hidden">
              {entry.team.tla}
            </span>
          </div>
        </div>
      </td>

      <td className="px-3 py-4 text-sm font-bold text-center">
        <span className={isBetis ? "text-betis-verde-dark" : "text-gray-900"}>
          {entry.points}
        </span>
      </td>

      <td className="px-3 py-4 text-sm text-center text-gray-600 hidden sm:table-cell">
        {entry.playedGames}
      </td>

      <td className="px-3 py-4 text-sm text-center text-gray-600 hidden md:table-cell">
        {entry.won}
      </td>

      <td className="px-3 py-4 text-sm text-center text-gray-600 hidden md:table-cell">
        {entry.draw}
      </td>

      <td className="px-3 py-4 text-sm text-center text-gray-600 hidden md:table-cell">
        {entry.lost}
      </td>

      <td className="px-3 py-4 text-sm text-center text-gray-600 hidden lg:table-cell">
        <span
          className={
            entry.goalDifference >= 0 ? "text-betis-verde" : "text-red-600"
          }
        >
          {entry.goalDifference > 0 ? "+" : ""}
          {entry.goalDifference}
        </span>
      </td>

      <td className="px-3 py-4 hidden lg:table-cell">
        <div className="flex space-x-1">
          {formResults.map((result, index) => (
            <span
              key={`form-${formResults.length}-${index}-${result}`}
              className={`w-6 h-6 text-xs font-bold rounded-full flex items-center justify-center ${getFormResultStyle(result)}`}
            >
              {result}
            </span>
          ))}
        </div>
      </td>
    </tr>
  );
}

async function StandingsContent() {
  const service = new FootballDataService(axios.create());
  const standings = await service.getLaLigaStandings();
  const t = await getTranslations("Clasificacion");

  if (!standings) {
    throw new Error(t("errorLoad"));
  }

  const betisEntry = standings.table.find((entry) => entry.team.id === 90);

  return (
    <div className="min-h-screen">
      <CulturalFusionHero containerClassName="max-w-4xl">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-8">
          <div className="text-center md:text-left flex-1">
            <h1 className="font-display text-5xl sm:text-6xl lg:text-7xl font-black mb-6 text-white text-shadow-xl uppercase tracking-tight">
              {t("heroTitle")}
            </h1>
            <p className="font-accent text-2xl sm:text-3xl text-oro-bright text-shadow-lg italic">
              {t("heroSubtitle")}
            </p>
          </div>

          {betisEntry && (
            <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-6 text-center">
              <div className="font-heading text-sm text-oro-bright mb-2 uppercase tracking-wide">
                {t("betisBadgePosition")}
              </div>
              <div className="font-display text-5xl font-black text-white mb-2">
                {betisEntry.position}º
              </div>
              <div className="font-body text-lg text-white/90">
                {t("betisBadgePoints", { points: betisEntry.points })}
              </div>
            </div>
          )}
        </div>
      </CulturalFusionHero>

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 mb-8 p-6">
          <h3 className="font-heading text-lg font-bold text-scotland-navy mb-4 uppercase tracking-wide">
            {t("legendHeading")}
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-betis-verde rounded-full"></span>
              <span className="font-body text-sm text-gray-700">
                {t("legendChampions")}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-scotland-navy rounded-full"></span>
              <span className="font-body text-sm text-gray-700">
                {t("legendEuropa")}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-orange-500 rounded-full"></span>
              <span className="font-body text-sm text-gray-700">
                {t("legendConference")}
              </span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-red-500 rounded-full"></span>
              <span className="font-body text-sm text-gray-700">
                {t("legendRelegation")}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("columnPosition")}
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("columnTeam")}
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {t("columnPoints")}
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden sm:table-cell">
                    {t("columnPlayed")}
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    {t("columnWon")}
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    {t("columnDrawn")}
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden md:table-cell">
                    {t("columnLost")}
                  </th>
                  <th className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    {t("columnGoalDifference")}
                  </th>
                  <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider hidden lg:table-cell">
                    {t("columnForm")}
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {standings.table.map((entry) => (
                  <StandingRow
                    key={entry.team.id}
                    entry={entry}
                    isBetis={entry.team.id === 90}
                  />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="mt-12 flex justify-center">
          <FeatureWrapper feature="show-partidos">
            <Link
              href="/partidos"
              className="inline-flex items-center justify-center px-8 py-4 bg-betis-verde text-white font-heading font-bold rounded-xl hover:bg-betis-verde-dark transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl uppercase tracking-wide"
            >
              {t("ctaMatches")}
            </Link>
          </FeatureWrapper>
        </div>
      </div>
    </div>
  );
}

async function StandingsPage() {
  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <div className="min-h-screen bg-gradient-to-b from-betis-verde-pale to-white flex items-center justify-center">
            <LoadingSpinner />
          </div>
        }
      >
        <StandingsContent />
      </Suspense>
    </ErrorBoundary>
  );
}

export default withFeatureFlag(StandingsPage, "show-clasificacion");
