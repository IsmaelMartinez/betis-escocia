'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Trophy, TrendingUp, TrendingDown } from 'lucide-react';

// Import types from footballDataService
import type { StandingEntry } from '@/services/footballDataService';

interface ClassificationWidgetProps {
  className?: string;
  initialStandings?: StandingEntry[] | null; // New prop for Storybook
  simulateLoading?: boolean; // New prop to force loading state
}

// Helper function to get position styling
function getPositionStyle(position: number): string {
  if (position <= 4) return 'text-green-600 font-bold'; // Champions League
  if (position <= 6) return 'text-blue-600 font-bold'; // Europa League
  if (position <= 7) return 'text-orange-600 font-bold'; // Conference League
  if (position >= 18) return 'text-red-600 font-bold'; // Relegation
  return 'text-gray-900';
}

// Helper function to get position badge
function getPositionBadge(position: number): { text: string; color: string } | null {
  if (position <= 4) return { text: 'UCL', color: 'bg-green-100 text-green-800' };
  if (position <= 6) return { text: 'UEL', color: 'bg-blue-100 text-blue-800' };
  if (position <= 7) return { text: 'UECL', color: 'bg-orange-100 text-orange-800' };
  if (position >= 18) return { text: 'DESC', color: 'bg-red-100 text-red-800' };
  return null;
}

export default function ClassificationWidget({ className = '', initialStandings = null, simulateLoading = false }: ClassificationWidgetProps) {
  const [standings, setStandings] = useState<StandingEntry[] | null>(initialStandings);
  const [betisEntry, setBetisEntry] = useState<StandingEntry | null>(null);
  const [isLoading, setIsLoading] = useState(simulateLoading || initialStandings === null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (simulateLoading) {
      setIsLoading(true);
      setError(null);
      return;
    }

    if (initialStandings !== null) {
      // If initialStandings are provided, use them directly
      setStandings(initialStandings);
      const betis = initialStandings.find((entry: StandingEntry) => entry.team.id === 90);
      setBetisEntry(betis || null);
      setIsLoading(false);
      return;
    }

    async function fetchStandings() {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch('/api/standings');
        const apiResponse = await response.json();
        
        if (response.ok) {
          // Handle createApiHandler response format
          const data = apiResponse.success ? apiResponse.data : apiResponse;
          
          if (data.standings) {
            setStandings(data.standings.table);
            const betis = data.standings.table.find((entry: StandingEntry) => entry.team.id === 90);
            setBetisEntry(betis || null);
          } else {
            setError('No se pudieron cargar las clasificaciones');
          }
        } else {
          setError(apiResponse.error || 'No se pudieron cargar las clasificaciones');
        }
      } catch (err) {
        console.error('Error fetching standings:', err);
        setError('Error al cargar la clasificación');
      } finally {
        setIsLoading(false);
      }
    }

    fetchStandings();
  }, [initialStandings, simulateLoading]);

  // Loading state
  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Clasificación</h2>
          <div className="h-4 w-20 bg-gray-300 rounded animate-pulse"></div>
        </div>
        
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, index) => (
            <div key={index} className="flex items-center space-x-3 animate-pulse">
              <div className="h-4 w-6 bg-gray-300 rounded"></div>
              <div className="h-6 w-6 bg-gray-300 rounded"></div>
              <div className="h-4 flex-1 bg-gray-300 rounded"></div>
              <div className="h-4 w-8 bg-gray-300 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Clasificación</h2>
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-center">
          <div className="text-red-600 text-sm mb-2">⚠️</div>
          <p className="text-red-600 text-sm mb-3">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="text-xs bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded font-medium transition-colors"
          >
            Reintentar
          </button>
        </div>
      </div>
    );
  }

  // Empty state
  if (!standings || !betisEntry) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Clasificación</h2>
        <div className="text-center py-8">
          <div className="text-gray-400 text-2xl mb-3">📊</div>
          <p className="text-gray-600 text-sm">
            No hay datos de clasificación disponibles
          </p>
        </div>
      </div>
    );
  }

  const positionBadge = getPositionBadge(betisEntry.position);

  // Get teams around Betis (1 above, Betis, 1 below)
  const betisIndex = standings.findIndex(entry => entry.team.id === 90);
  const startIndex = Math.max(0, betisIndex - 1);
  const endIndex = Math.min(standings.length, betisIndex + 2);
  const displayStandings = standings.slice(startIndex, endIndex);

  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center">
          <Trophy className="h-5 w-5 mr-2 text-yellow-500" />
          Clasificación
        </h2>
      </div>

      {/* Betis highlight */}
      <div className="bg-betis-green rounded-lg p-4 text-white mb-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <Image
              src={betisEntry.team.crest}
              alt="Real Betis"
              width={32}
              height={32}
              className="rounded"
              unoptimized
            />
            <div>
              <div className="font-bold text-lg">{betisEntry.position}º posición</div>
              <div className="text-green-100 text-sm">{betisEntry.points} puntos</div>
            </div>
          </div>
          {positionBadge && (
            <div className="bg-white/20 px-3 py-1 rounded-full">
              <span className="text-xs font-medium">{positionBadge.text}</span>
            </div>
          )}
        </div>
      </div>

      {/* Mini table around Betis */}
      <div className="space-y-2">
        {displayStandings.map((entry, index) => {
          const isBetis = entry.team.id === 90;
          const actualPosition = startIndex + index + 1;
          
          return (
            <div
              key={entry.team.id}
              className={`flex items-center justify-between p-2 rounded ${
                isBetis ? 'bg-green-50 border border-green-200' : 'hover:bg-gray-50'
              }`}
            >
              <div className="flex items-center space-x-3 flex-1">
                <span className={`text-sm font-medium w-6 ${getPositionStyle(actualPosition)}`}>
                  {actualPosition}
                </span>
                <Image
                  src={entry.team.crest}
                  alt={entry.team.name}
                  width={20}
                  height={20}
                  className="rounded"
                  unoptimized
                />
                <span className={`text-sm font-medium truncate ${isBetis ? 'text-green-700' : 'text-gray-900'}`}>
                  {entry.team.shortName || entry.team.name}
                </span>
              </div>
              
              <div className="flex items-center space-x-4">
                <span className={`text-sm font-bold ${isBetis ? 'text-green-700' : 'text-gray-900'}`}>
                  {entry.points}
                </span>
                
                {/* Goal difference indicator */}
                <div className="flex items-center">
                  {entry.goalDifference > 0 ? (
                    <TrendingUp className="h-3 w-3 text-green-500" />
                  ) : entry.goalDifference < 0 ? (
                    <TrendingDown className="h-3 w-3 text-red-500" />
                  ) : null}
                  <span className={`text-xs ml-1 ${
                    entry.goalDifference >= 0 ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {entry.goalDifference > 0 ? '+' : ''}{entry.goalDifference}
                  </span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer link */}
      <div className="mt-6 text-center">
        <Link
          href="/clasificacion"
          className="text-betis-green hover:text-green-700 font-medium text-sm"
        >
          Ver tabla completa →
        </Link>
      </div>
    </div>
  );
}
