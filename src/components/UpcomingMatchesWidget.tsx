'use client';

import { useState, useEffect } from 'react';
import { getUpcomingMatchesWithRSVPCounts, Match } from '@/lib/supabase';
import Link from 'next/link';

interface UpcomingMatchesWidgetProps {
  className?: string;
}

interface MatchWithRSVP extends Match {
  rsvp_count: number;
  total_attendees: number;
}

export default function UpcomingMatchesWidget({ 
  className = '' 
}: UpcomingMatchesWidgetProps) {
  const [matches, setMatches] = useState<MatchWithRSVP[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchMatches() {
      try {
        setIsLoading(true);
        setError(null);
        
        // Only get next 2 matches for the widget
        const data = await getUpcomingMatchesWithRSVPCounts(2);
        
        if (data) {
          setMatches(data as MatchWithRSVP[]);
        } else {
          setMatches([]);
        }
      } catch (err) {
        console.error('Error fetching upcoming matches widget:', err);
        setError('Error al cargar los próximos partidos');
      } finally {
        setIsLoading(false);
      }
    }

    fetchMatches();
  }, []);

  // Loading state
  if (isLoading) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Próximos Partidos</h2>
          <div className="h-4 w-20 bg-gray-300 rounded animate-pulse"></div>
        </div>
        
        <div className="space-y-4">
          {Array.from({ length: 2 }).map((_, index) => (
            <div key={index} className="border border-gray-200 rounded-lg p-4 animate-pulse">
              <div className="flex items-center justify-between mb-3">
                <div className="h-4 bg-gray-300 rounded w-24"></div>
                <div className="h-4 bg-gray-300 rounded w-16"></div>
              </div>
              <div className="flex items-center justify-center space-x-4">
                <div className="text-right flex-1">
                  <div className="h-6 bg-gray-300 rounded w-full mb-1"></div>
                  <div className="h-8 bg-gray-300 rounded w-8 ml-auto"></div>
                </div>
                <div className="h-6 w-12 bg-gray-300 rounded"></div>
                <div className="text-left flex-1">
                  <div className="h-6 bg-gray-300 rounded w-full mb-1"></div>
                  <div className="h-8 bg-gray-300 rounded w-8"></div>
                </div>
              </div>
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
        <h2 className="text-xl font-bold text-gray-900 mb-4">Próximos Partidos</h2>
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
  if (!matches || matches.length === 0) {
    return (
      <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900">Próximos Partidos</h2>
          <Link
            href="/partidos"
            className="text-betis-green hover:text-green-700 font-medium text-sm"
          >
            Ver todos →
          </Link>
        </div>
        
        <div className="text-center py-8">
          <div className="text-gray-400 text-2xl mb-3">📅</div>
          <h3 className="font-medium text-gray-900 mb-2">No hay partidos programados</h3>
          <p className="text-gray-600 text-sm mb-4">
            Próximamente se anunciarán los siguientes partidos.
          </p>
          <Link
            href="/partidos"
            className="text-betis-green hover:text-green-700 font-medium text-sm"
          >
            Ver historial →
          </Link>
        </div>
      </div>
    );
  }

  // Success state with matches
  return (
    <div className={`bg-white rounded-lg shadow-lg p-6 ${className}`}>
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold text-gray-900">Próximos Partidos</h2>
        <Link
          href="/partidos"
          className="text-betis-green hover:text-green-700 font-medium text-sm flex items-center"
        >
          Ver todos →
        </Link>
      </div>
      
      <div className={`${matches.length > 1 ? 'grid grid-cols-1 md:grid-cols-2 gap-4' : 'space-y-4'}`}>
        {matches.map((match, index) => {
          // Convert to simplified card format for widget
          const matchDate = new Date(match.date_time);
          const isUpcoming = matchDate > new Date();
          
          return (
            <div 
              key={match.id} 
              className="border border-gray-200 rounded-lg p-4 hover:border-betis-green transition-colors"
            >
              {/* Competition and date */}
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-medium text-gray-500 uppercase tracking-wide">
                  {match.competition}
                </span>
                <span className="text-xs text-gray-500">
                  {matchDate.toLocaleDateString('es-ES', { 
                    day: '2-digit', 
                    month: 'short',
                    hour: '2-digit',
                    minute: '2-digit'
                  })}
                </span>
              </div>

              {/* Teams */}
              <div className="flex items-center justify-center space-x-4 mb-3">
                <div className="text-right flex-1">
                  <p className={`font-semibold text-sm ${
                    match.home_away === 'home' ? 'text-betis-green' : 'text-gray-900'
                  }`}>
                    {match.home_away === 'home' ? 'Real Betis' : match.opponent}
                  </p>
                  <p className="text-xs text-gray-500">
                    {match.home_away === 'home' ? 'Local' : 'Visitante'}
                  </p>
                </div>
                
                <div className="text-lg font-bold text-gray-400 px-2">
                  VS
                </div>
                
                <div className="text-left flex-1">
                  <p className={`font-semibold text-sm ${
                    match.home_away === 'away' ? 'text-betis-green' : 'text-gray-900'
                  }`}>
                    {match.home_away === 'away' ? 'Real Betis' : match.opponent}
                  </p>
                  <p className="text-xs text-gray-500">
                    {match.home_away === 'away' ? 'Visitante' : 'Local'}
                  </p>
                </div>
              </div>

              {/* Venue */}
              <div className="text-center mb-3">
                <p className="text-xs text-gray-600">{match.venue}</p>
              </div>

              {/* RSVP info and action for upcoming matches - only show for first match */}
              {isUpcoming && index === 0 && (
                <div className="border-t border-gray-100 pt-3">
                  {match.rsvp_count > 0 && (
                    <div className="text-center mb-2">
                      <span className="text-xs text-gray-600">
                        <span className="font-medium text-betis-green">{match.rsvp_count}</span> confirmaciones
                        {match.total_attendees > 0 && (
                          <span className="ml-2">
                            • <span className="font-medium text-betis-green">{match.total_attendees}</span> asistentes
                          </span>
                        )}
                      </span>
                    </div>
                  )}
                  
                  <Link
                    href={`/rsvp?match=${match.id}`}
                    className="block w-full bg-betis-green hover:bg-green-700 text-white text-center py-2 px-3 rounded text-xs font-medium transition-colors"
                  >
                    📝 Confirmar Asistencia
                  </Link>
                </div>
              )}
            </div>
          );
        })}
      </div>
      
      {/* Footer link */}
      <div className="mt-6 text-center">
        <Link
          href="/partidos"
          className="text-betis-green hover:text-green-700 font-medium text-sm"
        >
          Ver todos los partidos →
        </Link>
      </div>
    </div>
  );
}
