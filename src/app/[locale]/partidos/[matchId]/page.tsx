import { Metadata } from "next";
import { notFound } from "next/navigation";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { FootballDataService } from "@/services/footballDataService";
import axios from "axios";
import { Match } from "@/types/match";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import LoadingSpinner from "@/components/LoadingSpinner";
import ShareMatch from "@/components/match/ShareMatch";
import BetisLogo from "@/components/BetisLogo";
import { Suspense } from "react";
import { format } from "date-fns";
import { es, enGB } from "date-fns/locale";
import { DATE_FORMAT, TIME_FORMAT } from "@/lib/constants/dateFormats";

interface MatchDetailPageProps {
  params: Promise<{ locale: string; matchId: string }>;
}

function getDateFnsLocale(locale: string) {
  return locale === "en" ? enGB : es;
}

// Generate metadata for the page
export async function generateMetadata({
  params,
}: MatchDetailPageProps): Promise<Metadata> {
  const { locale, matchId: matchIdString } = await params;
  const matchId = parseInt(matchIdString);
  const t = await getTranslations({ locale, namespace: "MatchDetail" });

  if (isNaN(matchId)) {
    return { title: t("metaNotFoundTitle") };
  }

  try {
    const service = new FootballDataService(axios.create());
    const match = await service.getMatchById(matchId);

    if (!match) {
      return { title: t("metaNotFoundTitle") };
    }

    const opponent =
      match.homeTeam.id === 90 ? match.awayTeam.name : match.homeTeam.name;
    const matchDate = format(new Date(match.utcDate), DATE_FORMAT, {
      locale: getDateFnsLocale(locale),
    });

    return {
      title: t("metaTitle", { opponent, date: matchDate }),
      description: t("metaDescription", { opponent, date: matchDate }),
    };
  } catch (error) {
    console.error("Error generating metadata:", error);
    return { title: t("metaGenericTitle") };
  }
}

function getStatusKey(status: string): string {
  const statusMap: Record<string, string> = {
    SCHEDULED: "statusScheduled",
    TIMED: "statusScheduled",
    IN_PLAY: "statusInPlay",
    PAUSED: "statusPaused",
    FINISHED: "statusFinished",
    SUSPENDED: "statusSuspended",
    POSTPONED: "statusPostponed",
    CANCELLED: "statusCancelled",
    AWARDED: "statusAwarded",
  };
  return statusMap[status] ?? status;
}

function getStatusStyles(status: string): string {
  switch (status) {
    case "FINISHED":
      return "bg-gray-100 text-gray-800";
    case "IN_PLAY":
    case "PAUSED":
      return "bg-red-100 text-red-800";
    default:
      return "bg-blue-100 text-blue-800";
  }
}

function getMatchResult(match: Match): string | null {
  if (match.status !== "FINISHED") return null;
  const homeScore = match.score.fullTime.home;
  const awayScore = match.score.fullTime.away;
  if (homeScore === null || awayScore === null) return null;
  return `${homeScore} - ${awayScore}`;
}

function isBetisHome(match: Match): boolean {
  return match.homeTeam.id === 90;
}

function getOpponent(match: Match): { name: string; crest: string } {
  const opponent = isBetisHome(match) ? match.awayTeam : match.homeTeam;
  return { name: opponent.name, crest: opponent.crest };
}

async function MatchDetailContent({
  matchId,
  locale,
}: {
  matchId: number;
  locale: string;
}) {
  const service = new FootballDataService(axios.create());
  const match = await service.getMatchById(matchId);

  if (!match) {
    notFound();
  }

  const t = await getTranslations({ locale, namespace: "MatchDetail" });
  const dateFnsLocale = getDateFnsLocale(locale);
  const matchDate = new Date(match.utcDate);
  const date = format(matchDate, DATE_FORMAT, { locale: dateFnsLocale });
  const time = format(matchDate, TIME_FORMAT, { locale: dateFnsLocale });
  const opponent = getOpponent(match);
  const result = getMatchResult(match);
  const betisHome = isBetisHome(match);
  const statusLabel = t(getStatusKey(match.status));

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-4 py-8">
        <nav className="mb-8" aria-label={t("breadcrumbLabel")}>
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li>
              <Link
                href="/"
                className="hover:text-betis-verde transition-colors"
              >
                {t("breadcrumbHome")}
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li>
              <Link
                href="/partidos"
                className="hover:text-betis-verde transition-colors"
              >
                {t("breadcrumbMatches")}
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-900 font-medium">{opponent.name}</li>
          </ol>
        </nav>

        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-3">
              {match.competition.emblem && (
                <Image
                  src={match.competition.emblem}
                  alt={match.competition.name}
                  width={32}
                  height={32}
                  className="rounded shadow-sm"
                />
              )}
              <div>
                <h2 className="text-lg font-semibold text-gray-900">
                  {match.competition.name}
                </h2>
                {match.matchday && (
                  <p className="text-sm text-gray-600">
                    {t("matchdayLabel", { matchday: match.matchday })}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div
                className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusStyles(match.status)}`}
              >
                {statusLabel}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-center mb-8">
            <div className="text-center md:text-right">
              <div className="flex flex-col items-center md:items-end space-y-3">
                {betisHome ? (
                  <BetisLogo width={80} height={80} />
                ) : (
                  <Image
                    src={opponent.crest}
                    alt={opponent.name}
                    width={80}
                    height={80}
                    className="rounded-lg shadow-md"
                    unoptimized
                  />
                )}
                <div>
                  <h1
                    className={`text-xl md:text-2xl font-bold ${betisHome ? "text-betis-verde-dark" : "text-gray-900"}`}
                  >
                    {betisHome ? "Real Betis" : opponent.name}
                  </h1>
                  <p className="text-sm text-gray-600">{t("roleHome")}</p>
                </div>
              </div>
            </div>

            <div className="text-center order-first md:order-none">
              {result ? (
                <div className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
                  {result}
                </div>
              ) : (
                <div className="text-xl md:text-2xl font-semibold text-gray-700 mb-2">
                  {time}
                </div>
              )}
              <p className="text-sm text-gray-600 capitalize">{date}</p>
            </div>

            <div className="text-center md:text-left">
              <div className="flex flex-col items-center md:items-start space-y-3">
                {betisHome ? (
                  <Image
                    src={opponent.crest}
                    alt={opponent.name}
                    width={80}
                    height={80}
                    className="rounded-lg shadow-md"
                    unoptimized
                  />
                ) : (
                  <BetisLogo width={80} height={80} />
                )}
                <div>
                  <h1
                    className={`text-xl md:text-2xl font-bold ${!betisHome ? "text-betis-verde-dark" : "text-gray-900"}`}
                  >
                    {betisHome ? opponent.name : "Real Betis"}
                  </h1>
                  <p className="text-sm text-gray-600">{t("roleAway")}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="border-t pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                    />
                  </svg>
                  {t("dateTimeHeading")}
                </h3>
                <p className="text-gray-700 capitalize">{date}</p>
                <p className="text-gray-700">
                  {time} {t("localTimeSuffix")}
                </p>
              </div>

              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <svg
                    className="w-5 h-5 mr-2 text-gray-600"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                  </svg>
                  {t("stadiumHeading")}
                </h3>
                <p className="text-gray-700">
                  {betisHome
                    ? t("stadiumHome")
                    : t("stadiumAway", { opponent: opponent.name })}
                </p>
                <p className="text-sm text-gray-600">
                  {betisHome
                    ? t("stadiumHomeLocation")
                    : t("stadiumAwayLocation")}
                </p>
              </div>

              {match.stage && (
                <div className="bg-gray-50 rounded-lg p-4 sm:col-span-2 lg:col-span-1">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <svg
                      className="w-5 h-5 mr-2 text-gray-600"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                      />
                    </svg>
                    {t("stageHeading")}
                  </h3>
                  <p className="text-gray-700">{match.stage}</p>
                  {match.group && (
                    <p className="text-sm text-gray-600">{match.group}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {match.referees && match.referees.length > 0 && (
            <div className="border-t pt-6 mt-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
                {t("refereesHeading")}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {match.referees.map((referee) => (
                  <div
                    key={`${referee.id}-${referee.name}`}
                    className="bg-gray-50 rounded-lg p-4"
                  >
                    <p className="font-medium text-gray-900">{referee.name}</p>
                    <p className="text-sm text-gray-600 capitalize">
                      {referee.type?.toLowerCase().replace("_", " ")}
                    </p>
                    {referee.nationality && (
                      <p className="text-sm text-gray-600">
                        {referee.nationality}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {match.status === "FINISHED" && match.score && (
            <div className="border-t pt-6 mt-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <svg
                  className="w-5 h-5 mr-2 text-gray-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                  />
                </svg>
                {t("resultHeading")}
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600 mb-1">{t("fullTime")}</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {match.score.fullTime.home} - {match.score.fullTime.away}
                  </p>
                </div>

                {match.score.halfTime.home !== null && (
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600 mb-1">
                      {t("halfTime")}
                    </p>
                    <p className="text-xl font-semibold text-gray-900">
                      {match.score.halfTime.home} - {match.score.halfTime.away}
                    </p>
                  </div>
                )}

                {match.score.extraTime &&
                  match.score.extraTime.home !== null && (
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-600 mb-1">
                        {t("extraTime")}
                      </p>
                      <p className="text-xl font-semibold text-gray-900">
                        {match.score.extraTime.home} -{" "}
                        {match.score.extraTime.away}
                      </p>
                    </div>
                  )}

                {match.score.penalties &&
                  match.score.penalties.home !== null && (
                    <div className="bg-gray-50 rounded-lg p-4 text-center">
                      <p className="text-sm text-gray-600 mb-1">
                        {t("penalties")}
                      </p>
                      <p className="text-xl font-semibold text-gray-900">
                        {match.score.penalties.home} -{" "}
                        {match.score.penalties.away}
                      </p>
                    </div>
                  )}
              </div>
            </div>
          )}
        </div>

        <div className="flex flex-col items-center space-y-4">
          <Link
            href="/partidos"
            className="inline-flex items-center justify-center px-6 py-3 border border-betis-verde text-betis-verde font-medium rounded-lg hover:bg-betis-verde-pale transition-colors shadow-md"
          >
            <svg
              className="w-5 h-5 mr-2"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            {t("backToMatches")}
          </Link>

          <ShareMatch match={match} opponent={opponent} />
        </div>
      </div>
    </div>
  );
}

export default async function MatchDetailPage({
  params,
}: MatchDetailPageProps) {
  const { locale, matchId: matchIdString } = await params;
  setRequestLocale(locale);

  const matchId = parseInt(matchIdString);

  if (isNaN(matchId)) {
    notFound();
  }

  return (
    <ErrorBoundary>
      <Suspense
        fallback={
          <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
            <LoadingSpinner />
          </div>
        }
      >
        <MatchDetailContent matchId={matchId} locale={locale} />
      </Suspense>
    </ErrorBoundary>
  );
}
