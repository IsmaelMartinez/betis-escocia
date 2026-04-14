'use client';

import { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';

interface BetisPosition {
  position: number;
  points: number;
  form: string;
  playedGames: number;
  won: number;
  draw: number;
  lost: number;
  goalDifference: number;
}

export default function BetisPositionWidget() {
  const t = useTranslations('betisPositionWidget');
  const [betisData, setBetisData] = useState<BetisPosition | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBetisPosition = async () => {
      try {
        const response = await fetch('/api/standings');
        if (!response.ok) {
          throw new Error(t('errorFetching'));
        }

        const apiResponse = await response.json();
        const data = apiResponse.success ? apiResponse.data : apiResponse;
        const standings = data.standings;

        if (standings && standings.table) {
          const betisEntry = standings.table.find((team: { team: { id: number } }) => team.team.id === 90);
          if (betisEntry) {
            setBetisData({
              position: betisEntry.position,
              points: betisEntry.points,
              form: betisEntry.form || '',
              playedGames: betisEntry.playedGames,
              won: betisEntry.won,
              draw: betisEntry.draw,
              lost: betisEntry.lost,
              goalDifference: betisEntry.goalDifference
            });
          }
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : t('errorUnknown'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchBetisPosition();
  }, [t]);

  if (isLoading) {
    return (
      <div className="bg-betis-verde-pale border border-betis-verde/20 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-betis-verde-light rounded w-32 mb-3"></div>
          <div className="h-8 bg-betis-verde-light rounded w-16 mb-2"></div>
          <div className="h-4 bg-betis-verde-light rounded w-24"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-2">{t('title')}</h3>
        <p className="text-sm text-gray-600">{t('couldNotLoad')}</p>
        <Link
          href="/clasificacion"
          className="text-betis-verde hover:text-betis-verde-dark text-sm font-medium"
        >
          {t('viewFullStandings')}
        </Link>
      </div>
    );
  }

  if (!betisData) {
    return null;
  }

  // Helper function to get form result style
  const getFormResultStyle = (result: string): string => {
    switch (result) {
      case 'W': return 'bg-betis-verde text-white';
      case 'D': return 'bg-betis-oro text-white';
      case 'L': return 'bg-red-500 text-white';
      default: return 'bg-gray-300 text-gray-700';
    }
  };

  // Helper function to get position context
  const getPositionContext = (position: number): { text: string; color: string } => {
    if (position <= 4) return { text: t('championsLeague'), color: 'text-betis-verde' };
    if (position <= 6) return { text: t('europaLeague'), color: 'text-scotland-blue' };
    if (position <= 7) return { text: t('conferenceLeague'), color: 'text-orange-600' };
    if (position >= 18) return { text: t('relegationZone'), color: 'text-red-600' };
    return { text: t('midZone'), color: 'text-gray-600' };
  };

  // Form can be "W,D,L,W,D" or "WDLWD" - handle both formats
  const formResults = betisData.form.includes(',')
    ? betisData.form.split(',').filter(r => r.trim()).slice(-5)
    : betisData.form.split('').slice(-5);
  const positionContext = getPositionContext(betisData.position);

  return (
    <div className="bg-betis-verde-pale border border-betis-verde/20 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">{t('leaguePosition')}</h3>
        <Link
          href="/clasificacion"
          className="text-betis-verde hover:text-betis-verde-dark text-sm font-medium"
        >
          {t('viewFullTable')}
        </Link>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-betis-verde-dark">
            {betisData.position}º
          </div>
          <div className="text-sm text-gray-600">{t('position')}</div>
          <div className={`text-xs ${positionContext.color} font-medium`}>
            {positionContext.text}
          </div>
        </div>

        <div className="text-center">
          <div className="text-3xl font-bold text-betis-verde-dark">
            {betisData.points}
          </div>
          <div className="text-sm text-gray-600">{t('points')}</div>
          <div className="text-xs text-gray-500">
            {betisData.playedGames} {t('played')}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
        <div className="text-center bg-white rounded p-2">
          <div className="font-bold text-betis-verde">{betisData.won}</div>
          <div className="text-gray-600">{t('won')}</div>
        </div>
        <div className="text-center bg-white rounded p-2">
          <div className="font-bold text-betis-oro-dark">{betisData.draw}</div>
          <div className="text-gray-600">{t('draw')}</div>
        </div>
        <div className="text-center bg-white rounded p-2">
          <div className="font-bold text-red-600">{betisData.lost}</div>
          <div className="text-gray-600">{t('lost')}</div>
        </div>
      </div>

      {formResults.length > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">{t('lastFive')}</span>
          <div className="flex space-x-1">
            {formResults.map((result, index) => (
              <span
                key={`form-${index}-${result}`}
                className={`w-6 h-6 text-xs font-bold rounded-full flex items-center justify-center ${getFormResultStyle(result)}`}
              >
                {result}
              </span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
