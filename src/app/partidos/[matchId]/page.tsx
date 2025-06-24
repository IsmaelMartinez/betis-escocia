import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { FootballDataService } from '@/services/footballDataService';
import { Match } from '@/types/match';
import { ErrorBoundary } from '@/components/ErrorBoundary';
import LoadingSpinner from '@/components/LoadingSpinner';
import ShareMatch from '@/components/ShareMatch';
import BetisLogo from '@/components/BetisLogo';
import { Suspense } from 'react';

interface MatchDetailPageProps {
  params: Promise<{ matchId: string }>;
}

// Generate metadata for the page
export async function generateMetadata({ params }: MatchDetailPageProps): Promise<Metadata> {
  const { matchId: matchIdString } = await params;
  const matchId = parseInt(matchIdString);
  
  if (isNaN(matchId)) {
    return {
      title: 'Partido no encontrado - Peña Bética Escocesa',
    };
  }

  try {
    const service = new FootballDataService();
    const match = await service.getMatchById(matchId);

    if (!match) {
      return {
        title: 'Partido no encontrado - Peña Bética Escocesa',
      };
    }

    const opponent = match.homeTeam.id === 90 ? match.awayTeam.name : match.homeTeam.name;
    const matchDate = new Date(match.utcDate).toLocaleDateString('es-ES');

    return {
      title: `Real Betis vs ${opponent} - ${matchDate} - Peña Bética Escocesa`,
      description: `Detalles del partido Real Betis vs ${opponent} del ${matchDate}. Información completa del encuentro para los aficionados béticos en Escocia.`,
    };
  } catch (error) {
    console.error('Error generating metadata:', error);
    return {
      title: 'Detalles del partido - Peña Bética Escocesa',
    };
  }
}

// Format date and time for display
function formatMatchDateTime(utcDate: string): { date: string; time: string } {
  const matchDate = new Date(utcDate);
  const date = matchDate.toLocaleDateString('es-ES', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
  const time = matchDate.toLocaleTimeString('es-ES', {
    hour: '2-digit',
    minute: '2-digit'
  });
  
  return { date, time };
}

// Format match status in Spanish
function formatStatus(status: string): string {
  const statusMap: Record<string, string> = {
    'SCHEDULED': 'Programado',
    'TIMED': 'Programado',
    'IN_PLAY': 'En juego',
    'PAUSED': 'Pausado',
    'FINISHED': 'Finalizado',
    'SUSPENDED': 'Suspendido',
    'POSTPONED': 'Aplazado',
    'CANCELLED': 'Cancelado',
    'AWARDED': 'Adjudicado'
  };
  
  return statusMap[status] || status;
}

// Get status badge styles
function getStatusStyles(status: string): string {
  switch (status) {
    case 'FINISHED':
      return 'bg-gray-100 text-gray-800';
    case 'IN_PLAY':
    case 'PAUSED':
      return 'bg-red-100 text-red-800';
    default:
      return 'bg-blue-100 text-blue-800';
  }
}

// Get match result display
function getMatchResult(match: Match): string | null {
  if (match.status !== 'FINISHED') return null;
  
  const homeScore = match.score.fullTime.home;
  const awayScore = match.score.fullTime.away;
  
  if (homeScore === null || awayScore === null) return null;
  
  return `${homeScore} - ${awayScore}`;
}

// Check if Betis is playing at home
function isBetisHome(match: Match): boolean {
  return match.homeTeam.id === 90; // Real Betis team ID
}

// Get opponent team
function getOpponent(match: Match): { name: string; crest: string } {
  const opponent = isBetisHome(match) ? match.awayTeam : match.homeTeam;
  return {
    name: opponent.name,
    crest: opponent.crest
  };
}

// Main component for rendering match details
async function MatchDetailContent({ matchId }: { matchId: number }) {
  const service = new FootballDataService();
  const match = await service.getMatchById(matchId);

  if (!match) {
    notFound();
  }

  const { date, time } = formatMatchDateTime(match.utcDate);
  const opponent = getOpponent(match);
  const result = getMatchResult(match);
  const betisHome = isBetisHome(match);

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Breadcrumb Navigation */}
        <nav className="mb-8" aria-label="Navegación de migas de pan">
          <ol className="flex items-center space-x-2 text-sm text-gray-600">
            <li>
              <Link href="/" className="hover:text-green-600 transition-colors">
                Inicio
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li>
              <Link href="/partidos" className="hover:text-green-600 transition-colors">
                Partidos
              </Link>
            </li>
            <li className="text-gray-400">/</li>
            <li className="text-gray-900 font-medium">
              {opponent.name}
            </li>
          </ol>
        </nav>

        {/* Main Match Information */}
        <div className="bg-white rounded-xl shadow-lg p-8 mb-8">
          {/* Competition and Matchday */}
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
                    Jornada {match.matchday}
                  </p>
                )}
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${getStatusStyles(match.status)}`}>
                {formatStatus(match.status)}
              </div>
            </div>
          </div>

          {/* Teams and Score */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8 items-center mb-8">
            {/* Local Team (always on left) */}
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
                  <h1 className={`text-xl md:text-2xl font-bold ${betisHome ? 'text-green-700' : 'text-gray-900'}`}>
                    {betisHome ? 'Real Betis' : opponent.name}
                  </h1>
                  <p className="text-sm text-gray-600">
                    Local
                  </p>
                </div>
              </div>
            </div>

            {/* Score or Time */}
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
              <p className="text-sm text-gray-600 capitalize">
                {date}
              </p>
            </div>

            {/* Visitor Team (always on right) */}
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
                  <h1 className={`text-xl md:text-2xl font-bold ${!betisHome ? 'text-green-700' : 'text-gray-900'}`}>
                    {betisHome ? opponent.name : 'Real Betis'}
                  </h1>
                  <p className="text-sm text-gray-600">
                    Visitante
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Match Details */}
          <div className="border-t pt-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {/* Date and Time */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Fecha y Hora
                </h3>
                <p className="text-gray-700 capitalize">{date}</p>
                <p className="text-gray-700">{time} (hora local)</p>
              </div>

              {/* Stadium */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                  <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  Estadio
                </h3>
                <p className="text-gray-700">
                  {betisHome ? 'Estadio Benito Villamarín' : `Estadio del ${opponent.name}`}
                </p>
                <p className="text-sm text-gray-600">
                  {betisHome ? 'Sevilla, España' : 'Estadio visitante'}
                </p>
              </div>

              {/* Competition Stage */}
              {match.stage && (
                <div className="bg-gray-50 rounded-lg p-4 sm:col-span-2 lg:col-span-1">
                  <h3 className="font-semibold text-gray-900 mb-2 flex items-center">
                    <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                    </svg>
                    Fase
                  </h3>
                  <p className="text-gray-700">{match.stage}</p>
                  {match.group && (
                    <p className="text-sm text-gray-600">{match.group}</p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Additional Match Information */}
          {(match.referees && match.referees.length > 0) && (
            <div className="border-t pt-6 mt-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                </svg>
                Árbitros
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {match.referees.map((referee) => (
                  <div key={`${referee.id}-${referee.name}`} className="bg-gray-50 rounded-lg p-4">
                    <p className="font-medium text-gray-900">{referee.name}</p>
                    <p className="text-sm text-gray-600 capitalize">{referee.type?.toLowerCase().replace('_', ' ')}</p>
                    {referee.nationality && (
                      <p className="text-sm text-gray-600">{referee.nationality}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Score Details for Finished Matches */}
          {match.status === 'FINISHED' && match.score && (
            <div className="border-t pt-6 mt-6">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center">
                <svg className="w-5 h-5 mr-2 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                </svg>
                Detalles del Resultado
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {/* Full Time */}
                <div className="bg-gray-50 rounded-lg p-4 text-center">
                  <p className="text-sm text-gray-600 mb-1">Tiempo Reglamentario</p>
                  <p className="text-2xl font-bold text-gray-900">
                    {match.score.fullTime.home} - {match.score.fullTime.away}
                  </p>
                </div>

                {/* Half Time */}
                {match.score.halfTime.home !== null && (
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600 mb-1">Descanso</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {match.score.halfTime.home} - {match.score.halfTime.away}
                    </p>
                  </div>
                )}

                {/* Extra Time */}
                {match.score.extraTime && match.score.extraTime.home !== null && (
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600 mb-1">Prórroga</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {match.score.extraTime.home} - {match.score.extraTime.away}
                    </p>
                  </div>
                )}

                {/* Penalties */}
                {match.score.penalties && match.score.penalties.home !== null && (
                  <div className="bg-gray-50 rounded-lg p-4 text-center">
                    <p className="text-sm text-gray-600 mb-1">Penaltis</p>
                    <p className="text-xl font-semibold text-gray-900">
                      {match.score.penalties.home} - {match.score.penalties.away}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col items-center space-y-4">
          {/* Back to Matches Link */}
          <Link
            href="/partidos"
            className="inline-flex items-center justify-center px-6 py-3 border border-green-600 text-green-600 font-medium rounded-lg hover:bg-green-50 transition-colors shadow-md"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
            Volver a Partidos
          </Link>
          
          {/* Share Component */}
          <ShareMatch match={match} opponent={opponent} />
        </div>
      </div>
    </div>
  );
}

// Main page component with error boundary and loading
export default async function MatchDetailPage({ params }: MatchDetailPageProps) {
  const { matchId: matchIdString } = await params;
  const matchId = parseInt(matchIdString);

  if (isNaN(matchId)) {
    notFound();
  }

  return (
    <ErrorBoundary>
      <Suspense fallback={
        <div className="min-h-screen bg-gradient-to-b from-green-50 to-white flex items-center justify-center">
          <LoadingSpinner />
        </div>
      }>
        <MatchDetailContent matchId={matchId} />
      </Suspense>
    </ErrorBoundary>
  );
}
