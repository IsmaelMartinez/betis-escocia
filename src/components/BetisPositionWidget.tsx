'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

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
  const [betisData, setBetisData] = useState<BetisPosition | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBetisPosition = async () => {
      try {
        const response = await fetch('/api/standings');
        if (!response.ok) {
          throw new Error('Error al obtener la clasificación');
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
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBetisPosition();
  }, []);

  if (isLoading) {
    return (
      <div className="bg-green-50 border border-green-200 rounded-lg p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-green-200 rounded w-32 mb-3"></div>
          <div className="h-8 bg-green-200 rounded w-16 mb-2"></div>
          <div className="h-4 bg-green-200 rounded w-24"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="font-semibold text-gray-900 mb-2">Clasificación del Betis</h3>
        <p className="text-sm text-gray-600">No se pudo cargar la información</p>
        <Link 
          href="/clasificacion"
          className="text-green-600 hover:text-green-700 text-sm font-medium"
        >
          Ver clasificación completa →
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
      case 'W': return 'bg-green-500 text-white';
      case 'D': return 'bg-yellow-500 text-white';
      case 'L': return 'bg-red-500 text-white';
      default: return 'bg-gray-300 text-gray-700';
    }
  };

  // Helper function to get position context
  const getPositionContext = (position: number): { text: string; color: string } => {
    if (position <= 4) return { text: 'Champions League', color: 'text-green-600' };
    if (position <= 6) return { text: 'Europa League', color: 'text-blue-600' };
    if (position <= 7) return { text: 'Conference League', color: 'text-orange-600' };
    if (position >= 18) return { text: 'Zona de descenso', color: 'text-red-600' };
    return { text: 'Zona media', color: 'text-gray-600' };
  };

  // Form can be "W,D,L,W,D" or "WDLWD" - handle both formats
  const formResults = betisData.form.includes(',') 
    ? betisData.form.split(',').filter(r => r.trim()).slice(-5)
    : betisData.form.split('').slice(-5);
  const positionContext = getPositionContext(betisData.position);

  return (
    <div className="bg-green-50 border border-green-200 rounded-lg p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-semibold text-gray-900">Posición en La Liga</h3>
        <Link 
          href="/clasificacion"
          className="text-green-600 hover:text-green-700 text-sm font-medium"
        >
          Ver tabla completa →
        </Link>
      </div>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center">
          <div className="text-3xl font-bold text-green-700">
            {betisData.position}º
          </div>
          <div className="text-sm text-gray-600">Posición</div>
          <div className={`text-xs ${positionContext.color} font-medium`}>
            {positionContext.text}
          </div>
        </div>
        
        <div className="text-center">
          <div className="text-3xl font-bold text-green-700">
            {betisData.points}
          </div>
          <div className="text-sm text-gray-600">Puntos</div>
          <div className="text-xs text-gray-500">
            {betisData.playedGames} jugados
          </div>
        </div>
      </div>

      <div className="grid grid-cols-3 gap-2 mb-4 text-xs">
        <div className="text-center bg-white rounded p-2">
          <div className="font-bold text-green-600">{betisData.won}</div>
          <div className="text-gray-600">G</div>
        </div>
        <div className="text-center bg-white rounded p-2">
          <div className="font-bold text-yellow-600">{betisData.draw}</div>
          <div className="text-gray-600">E</div>
        </div>
        <div className="text-center bg-white rounded p-2">
          <div className="font-bold text-red-600">{betisData.lost}</div>
          <div className="text-gray-600">P</div>
        </div>
      </div>

      {formResults.length > 0 && (
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-600">Últimos 5:</span>
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
